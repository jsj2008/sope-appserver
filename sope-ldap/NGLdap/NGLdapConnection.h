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

#ifndef __NGLdapConnection_H__
#define __NGLdapConnection_H__

#import <Foundation/NSObject.h>
#import <Foundation/NSDate.h>

@class NSString, NSArray, NSEnumerator;
@class EOQualifier;
@class NGLdapEntry;

@interface NGLdapConnection : NSObject
{
  void           *handle;
  NSString       *hostName;
  int            port;
  
  NSTimeInterval cacheTimeout;
  long           cacheMaxMemory; /* in bytes */
  BOOL           isCacheEnabled;

  struct {
    BOOL isBound:1;
  } flags;
}

- (id)initWithHostName:(NSString *)_hostName port:(int)_port; // designated init
- (id)initWithHostName:(NSString *)_hostName;

/* settings */

- (NSString *)hostName;
- (int)port;

/* binding */

- (BOOL)isBound;
- (void)unbind;

- (BOOL)bindWithMethod:(NSString *)_method
  binddn:(NSString *)_login credentials:(NSString *)_cred;

/* running queries */

- (NSEnumerator *)flatSearchAtBaseDN:(NSString *)_base
  qualifier:(EOQualifier *)_q
  attributes:(NSArray *)_attributes;
- (NSEnumerator *)deepSearchAtBaseDN:(NSString *)_base
  qualifier:(EOQualifier *)_q
  attributes:(NSArray *)_attributes;
- (NSEnumerator *)baseSearchAtBaseDN:(NSString *)_base
  qualifier:(EOQualifier *)_q
  attributes:(NSArray *)_attributes;

- (NGLdapEntry *)entryAtDN:(NSString *)_dn attributes:(NSArray *)_attrs;

/* cache */

- (void)setCacheTimeout:(NSTimeInterval)_to;
- (NSTimeInterval)cacheTimeout;

- (void)setCacheMaxMemoryUsage:(long)_maxMem;
- (long)cacheMaxMemoryUsage;

- (void)setUseCache:(BOOL)_flag;
- (BOOL)doesUseCache;

- (void)flushCache;
- (void)destroyCache;

- (void)cacheForgetEntryWithDN:(NSString *)_dn;

/* modifications */

- (BOOL)addEntry:(NGLdapEntry *)_entry;
- (BOOL)removeEntryWithDN:(NSString *)_dn;
- (BOOL)modifyEntryWithDN:(NSString *)_dn changes:(NSArray *)_mods;

/* root DSE */

- (NGLdapEntry *)schemaEntry;
- (NGLdapEntry *)rootDSE;
- (NGLdapEntry *)configEntry;
- (NSArray *)namingContexts;

@end

@interface NGLdapConnection(PlainPasswordCheck)

/* specialized password check routine */

- (NSString *)dnForLogin:(NSString *)_login baseDN:(NSString *)_baseDN;

+ (BOOL)checkPassword:(NSString *)_pwd ofLogin:(NSString *)_login
  atBaseDN:(NSString *)_baseDN
  onHost:(NSString *)_hostName port:(int)_port;

@end

#endif /* __NGLdapConnection_H__ */
