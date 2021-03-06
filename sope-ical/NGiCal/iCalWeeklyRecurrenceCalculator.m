/*
  Copyright (C) 2004-2005 SKYRIX Software AG
  
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

#include "iCalRecurrenceCalculator.h"

@interface iCalWeeklyRecurrenceCalculator : iCalRecurrenceCalculator
@end

#include <NGExtensions/NGCalendarDateRange.h>
#include "iCalRecurrenceRule.h"
#include "NSCalendarDate+ICal.h"
#include "common.h"

@interface iCalRecurrenceCalculator (PrivateAPI)

- (NSCalendarDate *)lastInstanceStartDate;

- (unsigned)offsetFromSundayForJulianNumber:(long)_jn;
- (unsigned)offsetFromSundayForWeekDay:(iCalWeekDay)_weekDay;
- (unsigned)offsetFromSundayForCurrentWeekStart;
  
- (iCalWeekDay)weekDayForJulianNumber:(long)_jn;

@end

/*
   TODO: If BYDAY is specified, lastInstanceStartDate and recurrences will
         differ significantly!
*/
@implementation iCalWeeklyRecurrenceCalculator

- (NSArray *)recurrenceRangesWithinCalendarDateRange:(NGCalendarDateRange *)_r {
  NSMutableArray *ranges;
  NSCalendarDate *firStart;
  long           i, jnFirst, jnStart, jnEnd, startEndCount;
  unsigned       interval, byDayMask;

  firStart = [self->firstRange startDate];
  jnFirst  = [firStart julianNumber];
  jnEnd    = [[_r endDate] julianNumber];
  
  if (jnFirst > jnEnd)
    return nil;
  
  jnStart  = [[_r startDate] julianNumber];
  interval = [self->rrule repeatInterval];
  
  /* if rule is bound, check the bounds */
  if (![self->rrule isInfinite]) {
    NSCalendarDate *until;
    long           jnRuleLast;
    
    until = [self->rrule untilDate];
    if (until) {
      if ([until compare:[_r startDate]] == NSOrderedAscending)
        return nil;
      jnRuleLast = [until julianNumber];
    }
    else {
      jnRuleLast = (interval * [self->rrule repeatCount] * 7)
      + jnFirst;
      if (jnRuleLast < jnStart)
        return nil;
    }
    /* jnStart < jnRuleLast < jnEnd ? */
    if (jnEnd > jnRuleLast)
      jnEnd = jnRuleLast;
  }
  
  startEndCount = (jnEnd - jnStart) + 1;
  ranges        = [NSMutableArray arrayWithCapacity:startEndCount];
  byDayMask     = [self->rrule byDayMask];
  if (!byDayMask) {
    for (i = 0 ; i < startEndCount; i++) {
      long jnCurrent;
      
      jnCurrent = jnStart + i;
      if (jnCurrent >= jnFirst) {
        long jnDiff;
        
        jnDiff = jnCurrent - jnFirst; /* difference in days */
        if ((jnDiff % (interval * 7)) == 0) {
          NSCalendarDate      *start, *end;
          NGCalendarDateRange *r;
          
          start = [NSCalendarDate dateForJulianNumber:jnCurrent];
          [start setTimeZone:[firStart timeZone]];
          start = [start hour:  [firStart hourOfDay]
                         minute:[firStart minuteOfHour]
                         second:[firStart secondOfMinute]];
          end   = [start addTimeInterval:[self->firstRange duration]];
          r     = [NGCalendarDateRange calendarDateRangeWithStartDate:start
                                       endDate:end];
          if ([_r containsDateRange:r])
            [ranges addObject:r];
        }
      }
    }
  }
  else {
    long jnFirstWeekStart, weekStartOffset;

    /* calculate jnFirst's week start - this depends on our setting of week
       start */
    weekStartOffset = [self offsetFromSundayForJulianNumber:jnFirst] -
                      [self offsetFromSundayForCurrentWeekStart];

    jnFirstWeekStart = jnFirst - weekStartOffset;

    for (i = 0 ; i < startEndCount; i++) {
      long jnCurrent;

      jnCurrent = jnStart + i;
      if (jnCurrent >= jnFirst) {
        long jnDiff;
        
        /* we need to calculate a difference in weeks */
        jnDiff = (jnCurrent - jnFirstWeekStart) % 7;
        if ((jnDiff % interval) == 0) {
          BOOL isRecurrence = NO;
            
          if (jnCurrent == jnFirst) {
            isRecurrence = YES;
          }
          else {
            iCalWeekDay weekDay;

            weekDay = [self weekDayForJulianNumber:jnCurrent];
            isRecurrence = (weekDay & [self->rrule byDayMask]) ? YES : NO;
          }
          if (isRecurrence) {
            NSCalendarDate      *start, *end;
            NGCalendarDateRange *r;
                
            start = [NSCalendarDate dateForJulianNumber:jnCurrent];
            [start setTimeZone:[firStart timeZone]];
            start = [start hour:  [firStart hourOfDay]
                           minute:[firStart minuteOfHour]
                           second:[firStart secondOfMinute]];
            end   = [start addTimeInterval:[self->firstRange duration]];
            r     = [NGCalendarDateRange calendarDateRangeWithStartDate:start
                                         endDate:end];
            if ([_r containsDateRange:r])
              [ranges addObject:r];
          }
        }
      }
    }
  }
  return ranges;
}

- (NSCalendarDate *)lastInstanceStartDate {
  if ([self->rrule repeatCount] > 0) {
    long           jnFirst, jnRuleLast;
    NSCalendarDate *firStart, *until;
    
    firStart   = [self->firstRange startDate];
    jnFirst    = [firStart julianNumber];
    jnRuleLast = ([self->rrule repeatInterval] *
                  [self->rrule repeatCount] * 7) +
                  jnFirst;
    until      = [NSCalendarDate dateForJulianNumber:jnRuleLast];
    until      = [until hour:  [firStart hourOfDay]
                        minute:[firStart minuteOfHour]
                        second:[firStart secondOfMinute]];
    return until;
  }
  return [super lastInstanceStartDate];
}

@end /* iCalWeeklyRecurrenceCalculator */
