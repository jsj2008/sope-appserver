/*
  Copyright (C) 2000-2005 SKYRIX Software AG

  This file is part of SOPE.

  SOPE is free software; you can redistribute it and/or modify it under
  the terms of the GNU Lesser General Public License as published by the
  Free Software Foundation; either version 2, or (at your option) any
  later version.

  SOPE is distributed in the hope that it will be useful, but WITHOUT ANY
  WARRANTY; without even the implied warranty of MERCHANTABILITY or
  FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public
  License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with SOPE; see the file COPYING.  If not, write to the
  Free Software Foundation, 59 Temple Place - Suite 330, Boston, MA
  02111-1307, USA.
*/

#include "NGLdapConnection.h"
#include "NGLdapSearchResultEnumerator.h"
#include "NGLdapEntry.h"
#include "NGLdapAttribute.h"
#include "NGLdapModification.h"
#include "EOQualifier+LDAP.h"
#include "common.h"
#include <ldap.h>

static BOOL     LDAPDebugEnabled        = NO;
static BOOL     LDAPInitialBindSpecific = NO;
static NSString *LDAPInitialBindDN = @"" ;
static NSString *LDAPInitialBindPW = @"" ;

/* this is required by SuSE EMail Server III */
static BOOL     LDAPUseLatin1Creds = NO;

@interface NGLdapConnection(Privates)
- (BOOL)_reinit;
@end

@implementation NGLdapConnection

static void freeMods(LDAPMod **mods) {
  LDAPMod  *buf;
  unsigned i;
  
  if (mods == NULL)
    return;

  buf = mods[0];
  for (i = 0; mods[i] != NULL; i++) {
    struct berval **values;
    char *type;

    if ((values = buf[i].mod_bvalues) != NULL) {
      unsigned j;
      
      for (j = 0; values[j] != NULL; j++)
	free(values[j]);
      
      free(values);
    }
    
    if ((type = buf[i].mod_type) != NULL)
      free(type);
  }
  
  if (buf)  free(buf);
  if (mods) free(mods);
}

+ (void)initialize {
  NSUserDefaults *ud = [NSUserDefaults standardUserDefaults];
  static BOOL didInit = NO;
  if (didInit) return;
  didInit = YES;
  
  LDAPDebugEnabled        = [ud boolForKey:@"LDAPDebugEnabled"];
  LDAPInitialBindSpecific = [ud boolForKey:@"LDAPInitialBindSpecific"];
  LDAPInitialBindDN       = [[ud stringForKey:@"LDAPInitialBindDN"] copy];
  LDAPInitialBindPW       = [[ud stringForKey:@"LDAPInitialBindPW"] copy];
  LDAPUseLatin1Creds      = [ud boolForKey:@"LDAPUseLatin1Creds"];
}

- (BOOL)_reinit {
  static int ldap_version3 = LDAP_VERSION3;
  int rc;
  
  if (self->handle != NULL) {
    ldap_unbind(self->handle);
    self->handle = NULL;
  }
  
  self->handle = ldap_init((char *)[self->hostName cString], self->port);
  if (self->handle == NULL)
    return NO;
  
  /* setup options (must be done before the bind) */
  rc = 
    ldap_set_option(self->handle, LDAP_OPT_PROTOCOL_VERSION, &ldap_version3);
  if (rc != LDAP_OPT_SUCCESS)
    [self logWithFormat:@"WARN: could not set protocol version to LDAPv3!"];

  rc = ldap_set_option(self->handle, LDAP_OPT_REFERRALS, LDAP_OPT_OFF) ;
  if (rc != LDAP_OPT_SUCCESS)
    [self logWithFormat:@"Note: could not disable LDAP referrals."];
  
  return YES;
}

- (id)initWithHostName:(NSString *)_hostName port:(int)_port {
  self->hostName = [_hostName copy];
  self->port     = (_port != 0) ? _port : 389;

  if (![self _reinit]) {
    [self release];
    return nil;
  }
  
  [self setCacheTimeout:120.0];
  [self setCacheMaxMemoryUsage:16000];
  
  return self;
}
- (id)initWithHostName:(NSString *)_hostName {
  return [self initWithHostName:_hostName port:0];
}

- (void)dealloc {
  if (self->handle != NULL) {
    if ([self isBound])
      [self unbind];
    else {
      // call unbind to free resources
      int err;
      err = ldap_unbind(self->handle);
      self->handle = NULL;
    }

    // free handle
  }
  [self->hostName release];
  [super dealloc];
}

/* settings */

- (NSString *)hostName {
  return self->hostName;
}
- (int)port {
  return self->port;
}

/* internals */

- (void *)ldapHandle {
  return self->handle;
}

/* errors */

- (NSException *)_exceptionForErrorCode:(int)_err
  operation:(NSString *)_operation
  userInfo:(NSDictionary *)_ui
{
  NSException *e;
  NSString *name, *reason;

  name = @"LDAPException";

  switch (_err) {
    case LDAP_SUCCESS:
      return nil;

    case LDAP_INAPPROPRIATE_AUTH:
      reason = @"inappropriate authorization";
      break;

    case LDAP_INVALID_CREDENTIALS:
      reason = @"invalid credentials";
      break;
      
    case LDAP_INSUFFICIENT_ACCESS:
      reason = @"insufficient access";
      break;

    case LDAP_SERVER_DOWN:
      reason = @"the server is down";
      break;

    case LDAP_TIMEOUT:
      reason = @"the operation timed out";
      break;

    case LDAP_AUTH_UNKNOWN:
      reason = @"authorization unknown";
      break;
      
    case LDAP_NOT_ALLOWED_ON_NONLEAF:
      reason = @"operation not allowed on non-leaf record";
      break;
      
    default:
      reason = [NSString stringWithFormat:
                           @"operation %@ failed with code 0x%X",
                           _operation, _err];
      break;
  }

  e = [NSException exceptionWithName:name
                   reason:reason
                   userInfo:_ui];
  
  return e;
}

/* binding */

- (BOOL)isBound {
  return self->flags.isBound ? YES : NO;
}

- (void)unbind {
  if (self->flags.isBound) {
    int err;
    
    err = ldap_unbind(self->handle);
    self->flags.isBound = 0;
    self->handle = NULL;
  }
}

- (BOOL)bindWithMethod:(NSString *)_method
  binddn:(NSString *)_login credentials:(NSString *)_cred
{
  static NSString *loginKey = @"login";
  NSDictionary *ui;
  NSException  *e;
  int method, err;
  const char *l, *p;
  
  if (self->handle == NULL)
    [self _reinit];
  
  if ((_method == nil) || ([_method isEqualToString:@"simple"])) {
    method = LDAP_AUTH_SIMPLE;
  }
  else if ([_method isEqualToString:@"krbv41"]) {
    method = LDAP_AUTH_KRBV41;
  }
  else if ([_method isEqualToString:@"krbv42"]) {
    method = LDAP_AUTH_KRBV42;
  }
  else
    /* unknown method */
    return NO;

  l = (char *)[_login UTF8String];
  p = LDAPUseLatin1Creds
    ? (char *)[_cred  cString]
    : (char *)[_cred  UTF8String];
  
  err = (method == LDAP_AUTH_SIMPLE)
    ? ldap_simple_bind_s(self->handle, l, p)
    : ldap_bind_s(self->handle, l, p, method);
  
  if (err == LDAP_SUCCESS) {
    self->flags.isBound = YES;
    return YES;
  }

  /* exceptions */

  if (_login == nil) _login = @"<nil>";
  ui = [[NSDictionary alloc] 
	 initWithObjects:&_login forKeys:&loginKey count:1];
  e = [self _exceptionForErrorCode:err operation:@"bind" userInfo:ui];
  [ui release]; ui = nil;
  
  [e raise];
  
  return NO;
}

/* running queries */

- (NSEnumerator *)_searchAtBaseDN:(NSString *)_base
  qualifier:(EOQualifier *)_q
  attributes:(NSArray *)_attributes
  scope:(int)_scope
{
  NSString *filter;
  int      msgid;
  char     **attrs;
  NGLdapSearchResultEnumerator *e;

  if (self->handle == NULL)
    [self _reinit];

  if ((filter = [_q ldapFilterString]) == nil)
    filter = @"(objectclass=*)";

  if (_attributes != nil) {
    unsigned i, acount;

    acount = [_attributes count];
    attrs = calloc(acount + 3, sizeof(char *));
    
    for (i = 0; i < acount; i++)
      attrs[i] = (char *)[[_attributes objectAtIndex:i] UTF8String];
    attrs[i] = NULL;
  }
  else
    attrs = NULL;

  if (LDAPDebugEnabled) {
    printf("%s: search with at base %s filter %s for attrs %s\n",
           __PRETTY_FUNCTION__, [_base cString], [filter cString],
           [[_attributes description] cString]);
  }
  
  msgid = ldap_search(self->handle,
                      (char *)[_base UTF8String],
                      _scope,
                      (char *)[filter UTF8String],                      
                      attrs,
                      0);

  /* free attributes */
  if (attrs != NULL) free(attrs); attrs = NULL;
  
  if (msgid == -1) {
    /* trouble */
    return nil;
  }
  
  e = [[NGLdapSearchResultEnumerator alloc]
                                     initWithConnection:self messageID:msgid];

  return [e autorelease];
}

- (NSEnumerator *)flatSearchAtBaseDN:(NSString *)_base
  qualifier:(EOQualifier *)_q
  attributes:(NSArray *)_attributes
{
  return [self _searchAtBaseDN:_base
               qualifier:_q
               attributes:_attributes
               scope:LDAP_SCOPE_ONELEVEL];
}

- (NSEnumerator *)deepSearchAtBaseDN:(NSString *)_base
  qualifier:(EOQualifier *)_q
  attributes:(NSArray *)_attributes
{
  return [self _searchAtBaseDN:_base
               qualifier:_q
               attributes:_attributes
               scope:LDAP_SCOPE_SUBTREE];
}

- (NSEnumerator *)baseSearchAtBaseDN:(NSString *)_base
  qualifier:(EOQualifier *)_q
  attributes:(NSArray *)_attributes
{
  return [self _searchAtBaseDN:_base
               qualifier:_q
               attributes:_attributes
               scope:LDAP_SCOPE_BASE];
}

- (NGLdapEntry *)entryAtDN:(NSString *)_dn attributes:(NSArray *)_attrs {
  NSEnumerator *e;
  NGLdapEntry  *entry;
  
  e = [self _searchAtBaseDN:_dn
            qualifier:nil
            attributes:_attrs
            scope:LDAP_SCOPE_BASE];
  
  entry = [e nextObject];
  
  if ([e nextObject] != nil) {
    [self logWithFormat:@"WARN: more than one search results in base search!"];
    /* consume all entries */
    while ([e nextObject] != nil) // TODO: can't we cancel the request?
      ;
  }
  
  return entry;
}

/* cache */

- (void)setCacheTimeout:(NSTimeInterval)_to {
  if (self->cacheTimeout != _to) {
    self->cacheTimeout = _to;

    if (self->isCacheEnabled) {
#if LDAP_API_VERSION > 2000
      NSLog(@"WARNING(%s): setting cache-timeout unsupported on the client "
	    @"library version!", __PRETTY_FUNCTION__);
#else
      ldap_disable_cache(self->handle);
      ldap_enable_cache(self->handle, _to, [self cacheMaxMemoryUsage]);
#endif
    }
  }
}
- (NSTimeInterval)cacheTimeout {
  return self->cacheTimeout;
}

- (void)setCacheMaxMemoryUsage:(long)_maxMem {
  if (self->cacheMaxMemory != _maxMem) {
    self->cacheMaxMemory = _maxMem;

    if (self->isCacheEnabled) {
#if LDAP_API_VERSION > 2000
      NSLog(@"WARNING(%s): setting maxmem usage unsupported on the client "
	    @"library version!", __PRETTY_FUNCTION__);
#else
      ldap_disable_cache(self->handle);
      ldap_enable_cache(self->handle, [self cacheTimeout], _maxMem);
#endif
    }
  }
}
- (long)cacheMaxMemoryUsage {
  return self->cacheMaxMemory;
}

- (void)setUseCache:(BOOL)_flag {
  if (_flag) {
#if LDAP_API_VERSION > 2000
      NSLog(@"WARNING(%s): setting cache-usage unsupported on the client "
	    @"library version!", __PRETTY_FUNCTION__);
#else
    ldap_enable_cache(self->handle,
                      [self cacheTimeout], [self cacheMaxMemoryUsage]);
#endif
    self->isCacheEnabled = YES;
  }
  else {
#if LDAP_API_VERSION > 2000
      NSLog(@"WARNING(%s): setting cache-usage unsupported on the client "
	    @"library version!", __PRETTY_FUNCTION__);
#else
    ldap_disable_cache(self->handle);
#endif
    self->isCacheEnabled = NO;
  }
}
- (BOOL)doesUseCache {
  return self->isCacheEnabled;
}

- (void)flushCache {
#if !(LDAP_API_VERSION > 2000)
  ldap_flush_cache(self->handle);
#endif
}
- (void)destroyCache {
#if !(LDAP_API_VERSION > 2000)
  ldap_destroy_cache(self->handle);
#endif
  self->isCacheEnabled = NO;
}

- (void)cacheForgetEntryWithDN:(NSString *)_dn {
  if (_dn == nil) return;
#if !(LDAP_API_VERSION > 2000)
  ldap_uncache_entry(self->handle, (char *)[_dn UTF8String]);
#endif
}

/* modifications */

- (BOOL)addEntry:(NGLdapEntry *)_entry {
  int         msgid, res;
  LDAPMod     **attrs;
  LDAPMessage *msg;
  LDAPMod     *attrBuf;
  unsigned    count;
  
  attrs   = NULL;
  attrBuf = NULL;
  
  /* construct attributes */
  {
    unsigned        i;
    NSEnumerator    *e;
    NGLdapAttribute *attribute;
    
    count = [_entry count];
    
    attrBuf = calloc(count, sizeof(LDAPMod));
    NSAssert(attrBuf, @"couldn't allocate attribute buffer");

    attrs = calloc(count + 1, sizeof(LDAPMod *));
    NSAssert(attrs, @"couldn't allocate attribute ptr buffer");

    e = [[[_entry attributes] allValues] objectEnumerator];
    for (i = 0; (attribute = [e nextObject]) && (i < count); i++) {
      unsigned      valCount, j;
      struct berval **values;
      NSEnumerator  *ve;
      NSData        *v;
      char          *attrName;
      NSString      *key;

      key = [attribute attributeName];
      
      valCount = [attribute count];
      values = calloc(valCount + 1, sizeof(struct berval *));

      ve = [attribute valueEnumerator];
      for (j = 0; (v = [ve nextObject]) && (j < valCount); j++) {
        struct berval *bv;

        bv = malloc(sizeof(struct berval));
        
        bv->bv_len = [v length];
        bv->bv_val = (void *)[v bytes];
        values[j] = bv;
      }
      values[valCount] = NULL;

      /* TODO: use UTF-8, UNICODE */
      attrName = malloc([key cStringLength] + 1);
      [key getCString:attrName];
      
      attrBuf[i].mod_op      = LDAP_MOD_BVALUES;
      attrBuf[i].mod_type    = attrName;
      attrBuf[i].mod_bvalues = values;
      attrs[i] = &(attrBuf[i]);
    }
    attrs[count] = NULL;
  }
  
  /* start operation */

  msgid = ldap_add(self->handle, (char *)[[_entry dn] UTF8String], attrs);

  /* deconstruct attributes */

  freeMods(attrs);
  attrs   = NULL;
  attrBuf = NULL;

  /* check operation return value */
  
  if (msgid == -1) {
    [[self _exceptionForErrorCode:
	     0 /* was in v1: ((LDAP *)self->handle)->ld_errno */
           operation:@"add"
           userInfo:[NSDictionary dictionaryWithObject:_entry forKey:@"entry"]]
           raise];
    return NO;
  }
  
  /* process result */
  
  msg = NULL;
  res = ldap_result(self->handle, msgid, 0, NULL /* timeout */, &msg);

  if (res == -1) {
    /* error */
    int err;

    err = ldap_result2error(self->handle, msg, 1 /* free msg */);
    [[self _exceptionForErrorCode:err
           operation:@"add"
           userInfo:[NSDictionary dictionaryWithObject:_entry forKey:@"entry"]]
           raise];
    
    return NO;
  }
  
  if (msg) ldap_msgfree(msg);
  
  return YES;
}

/* comparing */

- (BOOL)compareAttribute:(NSString *)_attr ofEntryWithDN:(NSString *)_dn
  withValue:(id)_value
{
  int res;
  
  if (_dn == nil)
    return NO;

  res = ldap_compare_s(self->handle,
                       (char *)[_dn UTF8String],
                       (char *)[_attr UTF8String],
                       (char *)[[_value stringValue] UTF8String]);
  
  if (res == LDAP_COMPARE_TRUE)
    return YES;
  if (res == LDAP_COMPARE_FALSE)
    return NO;

  [[self _exceptionForErrorCode:res
         operation:@"compare"
         userInfo:[NSDictionary dictionaryWithObject:_dn forKey:@"dn"]]
         raise];
  
  return NO;
}

- (BOOL)removeEntryWithDN:(NSString *)_dn {
  int res;

  if (_dn == nil)
    return YES;

  res = ldap_delete_s(self->handle, (char *)[_dn UTF8String]);

  if (res == LDAP_SUCCESS)
    return YES;

  [[self _exceptionForErrorCode:res
         operation:@"delete"
         userInfo:[NSDictionary dictionaryWithObject:_dn forKey:@"dn"]]
         raise];
  
  return NO;
}

- (BOOL)modifyEntryWithDN:(NSString *)_dn changes:(NSArray *)_mods {
  int      res;
  LDAPMod  **mods;
  LDAPMod  *modBuf;
  unsigned i, count;

  if (_dn == nil)
    return NO;

  if ((count = [_mods count]) == 0)
    return YES;

  /* construct mods */

  mods   = calloc(count + 1, sizeof(LDAPMod *));
  modBuf = calloc(count, sizeof(LDAPMod));
  NSAssert(mods,   @"couldn't allocate modification array");
  NSAssert(modBuf, @"couldn't allocate modification buffer");

  for (i = 0; i < count; i++) {
    NGLdapModification *mod;
    NGLdapAttribute    *attr;
    NSString           *attrName;
    unsigned           attrLen;
    unsigned           valCount;
    NSEnumerator       *e;
    NSData             *value;
    struct berval      **values;
    unsigned           j;

    mod = [_mods objectAtIndex:i];
    mods[i] = &(modBuf[i]);

    switch ([mod operation]) {
      case NGLdapAddAttribute:
        modBuf[i].mod_op = LDAP_MOD_ADD;
        break;
      case NGLdapDeleteAttribute:
        modBuf[i].mod_op = LDAP_MOD_DELETE;
        break;
      case NGLdapReplaceAttribute:
        modBuf[i].mod_op = LDAP_MOD_REPLACE;
        break;
    }
    modBuf[i].mod_op |= LDAP_MOD_BVALUES;

    attr     = [mod      attribute];
    attrName = [attr     attributeName];
    /* TODO: use UTF-8, UNICODE */
    attrLen  = [attrName cStringLength];

    modBuf[i].mod_type = malloc(attrLen + 1);
    [attrName getCString:modBuf[i].mod_type];

    valCount = [attr count];
    values = calloc(valCount + 1, sizeof(struct berval *));
    
    e = [attr valueEnumerator];
    for (j = 0; (value = [e nextObject]) && (j < valCount); j++) {
      struct berval *bv;

      bv = malloc(sizeof(struct berval));
      bv->bv_len = [value length];
      bv->bv_val = (void *)[value bytes];
      values[j] = bv;
    }
    values[valCount] = NULL;

    modBuf[i].mod_bvalues = values;
  }
  mods[count] = NULL;

  /* run modify */

  res = ldap_modify_s(self->handle, (char *)[_dn UTF8String], mods);

  /* free structures */

  freeMods(mods);
  mods   = NULL;
  modBuf = NULL;

  /* check result */
  
  if (res == -1) {
    [[self _exceptionForErrorCode:
	     0 /* was in v1: ((LDAP *)self->handle)->ld_errno */
           operation:@"modify"
           userInfo:[NSDictionary dictionaryWithObject:_dn forKey:@"dn"]]
           raise];
    return NO;
  }
  return YES;
}

/* root DSE */

- (NGLdapEntry *)schemaEntry {
  NGLdapEntry *e;
  
  if ((e = [self entryAtDN:@"cn=schema" attributes:nil]))
    return e;
  
  return nil;
}

- (NGLdapEntry *)rootDSE {
  NGLdapEntry *e;
  
  if ((e = [self entryAtDN:@"" attributes:nil]))
    return e;
  
  return nil;
}

- (NGLdapEntry *)configEntry {
  NGLdapEntry *e;
  
  if ((e = [self entryAtDN:@"cn=config" attributes:nil]))
    return e;
  
  return nil;
}

- (NSArray *)namingContexts {
  NGLdapEntry    *e;
  NSEnumerator   *values;
  NSString       *value;
  NSMutableArray *ma;
  
  if ((e = [self rootDSE])) {
    /* LDAP v3 */
    return [[e attributeWithName:@"namingcontexts"] allStringValues];
  }
  
  if ((e = [self configEntry]) == nil)
    return nil;
  
  /* OpenLDAP */
    
  values = [[e attributeWithName:@"database"] stringValueEnumerator];
  ma     = [NSMutableArray arrayWithCapacity:4];

  while ((value = [values nextObject])) {
    NSRange r;
      
    r = [value rangeOfString:@":"];
    if (r.length == 0)
      /* couldn't parse value */
      continue;
      
    value = [value substringFromIndex:(r.location + r.length)];
    [ma addObject:value];
  }
  return ma;
}

/* description */

- (NSString *)description {
  NSMutableString *s;

  s = [NSMutableString stringWithCapacity:100];
  [s appendFormat:@"<0x%p[%@]:", self, NSStringFromClass([self class])];
  
  if ([self isBound])
    [s appendString:@" bound"];
  
  if ([self doesUseCache]) {
    [s appendFormat:@" cache[to=%.2fs,mem=%i]",
         [self cacheTimeout], [self cacheMaxMemoryUsage]];
  }
  
  [s appendString:@">"];

  return s;
}

/* PlainPasswordCheck */

+ (NSString *)uidAttributeName {
  static NSString *uidAttr = nil;
  if (uidAttr == nil) {
    // TODO: can't we do this in +initialize? (maybe not if setup later by OGo)
    NSUserDefaults *ud = [NSUserDefaults standardUserDefaults];
    
    uidAttr = [[ud stringForKey:@"LDAPLoginAttributeName"] copy];
    if (![uidAttr isNotEmpty]) uidAttr = @"uid";
  }
  return uidAttr;
}

- (NSString *)dnForLogin:(NSString *)_login baseDN:(NSString *)_baseDN {
  NSString    *filter;
  char        *attrs[2];
  LDAPMessage *result;
  LDAPMessage *entry;
  char        *dn;
  BOOL        didBind = NO;
  int         matchCount;
  NSString    *strDN;
  int         ldap_search_result ;

  if (LDAPDebugEnabled)
    [self logWithFormat:@"dn for login '%@' on %@", _login, _baseDN];
  
  if (self->handle == NULL) {
    if (![self _reinit]) {
      NSLog(@"%s: _reinit failed...:", __PRETTY_FUNCTION__);
      return nil;
    }
  }
  if (![self isBound]) {
    didBind = NO;
    
    NS_DURING {
      if (LDAPInitialBindSpecific) {
	// TODO: can't we just check whether the DN is set?
	if (LDAPDebugEnabled) {
	  [self logWithFormat:
		  @"  attempt to do a simple, authenticated bind "
		  @"(dn=%@,pwd=%s) ..",
		  LDAPInitialBindDN, 
		  [LDAPInitialBindPW length] > 0 ? "yes":"no"];
	}
	
        didBind = [self bindWithMethod:@"simple" binddn:LDAPInitialBindDN
			credentials:LDAPInitialBindPW];
      }
      else {
	if (LDAPDebugEnabled)
	  [self logWithFormat:@"  attempt to do a simple, anonymous bind .."];
	
        didBind = [self bindWithMethod:@"simple" binddn:@"" credentials:@""];
      }
    }
    NS_HANDLER
      didBind = NO;
    NS_ENDHANDLER;

    if (!didBind) {
      /* couldn't bind */
      if (LDAPDebugEnabled) [self logWithFormat:@"  bind failed !"];
      return nil;
    }
    didBind = YES;
    if (LDAPDebugEnabled) [self logWithFormat:@"  bound."];
  }

  filter = [NSString stringWithFormat:@"(%@=%@)",
                       [[self class] uidAttributeName],
                       _login];
  
  if (LDAPDebugEnabled)
    [self logWithFormat:@"  search: uid='%@': '%@'", _login, filter];

  /* we only check the DN anyway .. */
  attrs[0] = "objectclass";
  attrs[1] = NULL;
  
  ldap_search_result = ldap_search_s(self->handle,
                    (char *)[_baseDN UTF8String],
                    LDAP_SCOPE_SUBTREE,
                    (char *)[filter UTF8String],
                    attrs, 1,
                    &result) ;
  if ((ldap_search_result != LDAP_SUCCESS) &&
      (ldap_search_result != LDAP_PARTIAL_RESULTS)) {
    /* search failed */
    if (didBind)
      [self unbind];

    if (LDAPDebugEnabled)
      [self logWithFormat:@"  search failed"];
    
    return nil;
  }

  /*
    If the entry count is not equal to one, either the UID was not unique or
    there was no match
  */
  if (((matchCount = ldap_count_entries(self->handle, result))) != 1) {
    if (didBind) [self unbind];
    if (LDAPDebugEnabled)
      [self logWithFormat:@"  failed: %i matches", matchCount];
    return nil;
  }
  
  /* get first entry */
  if ((entry = ldap_first_entry(self->handle, result)) == NULL) {
    if (didBind) [self unbind];
    if (LDAPDebugEnabled) 
      [self logWithFormat:@"  could not retrieve first entry !"];
    return nil;
  }

  /* get DN of first entry */
  if ((dn = ldap_get_dn(self->handle, entry)) == NULL) {
    /* could not get DN */
    if (didBind) [self unbind];
    if (LDAPDebugEnabled) [self logWithFormat:@"  got no DN for entry !"];
    return nil;
  }
  
  strDN = nil;
  NS_DURING {
    strDN = [[[NSString alloc] initWithUTF8String:dn] autorelease];
  }
  NS_HANDLER {
    fprintf(stderr, "Got exception %s while NSUTF8StringEncoding, "
            "use defaultCStringEncoding",
            [[localException description] cString]);
    strDN = nil;
  }
  NS_ENDHANDLER;

  if (strDN == nil) {
    if (LDAPDebugEnabled) {
      [self logWithFormat:
            @"could not convert DN to UTF-8 string, try cString .."];
    }
    strDN = [[[NSString alloc] initWithCString:dn] autorelease];
  }
  if (dn != NULL) free(dn); dn = NULL;

  if (result != NULL) {
    ldap_msgfree(result);
  }
  [self unbind];
  
  if (LDAPDebugEnabled)
    [self logWithFormat:@"   return DN %@", strDN];
  
  return strDN;
}

- (BOOL)checkPassword:(NSString *)_pwd ofLogin:(NSString *)_login
  atBaseDN:(NSString *)_baseDN
{
  BOOL        didBind;
  NSString    *strDN; 

  if (LDAPDebugEnabled)
    [self logWithFormat:@"check pwd of login '%@' on %@", _login, _baseDN];
  
  if (![_pwd isNotEmpty]) {
    if (LDAPDebugEnabled) [self logWithFormat:@"  no password provided."];
    return NO;
  }
  
  if (self->handle == NULL) {
    if (![self _reinit]) {
      NSLog(@"%s: _reinit failed...:", __PRETTY_FUNCTION__);
    }
  }
  strDN = [self dnForLogin:_login baseDN:_baseDN];

  if (![strDN isNotEmpty]) {
    if (LDAPDebugEnabled) {
      [self logWithFormat:@"  missing dn for login %@ atBaseDN %@",
            _login, _baseDN];
    }
    return NO;
  }
  
  if (LDAPDebugEnabled) {
    [self logWithFormat:@"  attempting to bind login %@ DN: %@ %s!",
          _login, strDN,
          [_pwd isNotEmpty] ? "(with password) " : "(empty password) "];
  }
  
  /*
    Now bind as the DN with the password supplied earlier...
    Successful bind means the password was correct, otherwise the
    password is invalid.
  */

  didBind = NO;
  NS_DURING {
    /* Note: beware: do _not_ use empty passwords! (unauthenticated binds) */
    didBind = [self bindWithMethod:@"simple" binddn:strDN credentials:_pwd];
  }
  NS_HANDLER
    didBind = NO;
  NS_ENDHANDLER;
  
  if (!didBind) {
    /* invalid login or password */
    if (LDAPDebugEnabled) 
      [self logWithFormat:@"  simple bind failed for DN: '%@'", strDN];
    
    [self unbind];
    return NO;
  }
  [self unbind];
  if (LDAPDebugEnabled) [self logWithFormat:@"  bound successfully !"];
  return YES;
}

+ (BOOL)checkPassword:(NSString *)_pwd ofLogin:(NSString *)_login
  atBaseDN:(NSString *)_baseDN
  onHost:(NSString *)_hostName port:(int)_port
{
  NGLdapConnection *ldap;
  
  if (LDAPDebugEnabled) {
    NSLog(@"LDAP: check pwd of login '%@' on %@,%i,%@ ...",
          _login, _hostName, _port, _baseDN);
  }
  if (![_pwd isNotEmpty]) {
    if (LDAPDebugEnabled) [self logWithFormat:@"  no password provided."];
    return NO;
  }
  
  if ((ldap = [[self alloc] initWithHostName:_hostName port:_port]) == nil) {
    if (LDAPDebugEnabled)
      NSLog(@"LDAP:   got no connection to %@,%i ...", _hostName, _port);
    return NO;
  }
  ldap = [ldap autorelease];
  if (LDAPDebugEnabled)
    NSLog(@"LDAP:   use connection: %@", ldap);
  
  return [ldap checkPassword:_pwd ofLogin:_login atBaseDN:_baseDN];
}

@end /* NGLdapConnection */
