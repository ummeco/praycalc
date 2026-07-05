/**
 * Purpose: Hook for Hijri/Gregorian dual calendar display and month navigation.
 * Inputs: initialDate
 * Outputs: { gregorianDate, hijriDate, currentMonth, navigate, islamicEvents }
 * Constraints: Hijri conversion via src/lib/hijri (Umm al-Qura / @umalqura/core) — the
 *   single shared Hijri source for this app (Calendar, Ramadan, Moon screens all agree).
 * SPORT: REGISTRY-HOOKS.md#praycalc-mobile-useIslamicCalendar
 */

import { useState, useCallback, useMemo } from 'react';
import { gregorianToHijri, eventsInMonth, ISLAMIC_EVENTS, type HijriDate, type IslamicEvent } from '../../../lib/hijri';

export type { HijriDate, IslamicEvent };

export interface UseIslamicCalendarResult {
  gregorianDate: Date;
  hijriDate: HijriDate;
  currentMonth: { year: number; month: number };
  islamicEvents: IslamicEvent[];
  eventsThisMonth: IslamicEvent[];
  navigateMonth: (delta: number) => void;
  setDate: (date: Date) => void;
}

export function useIslamicCalendar(initialDate?: Date): UseIslamicCalendarResult {
  const [gregorianDate, setDate] = useState(initialDate ?? new Date());
  const [currentMonth, setCurrentMonth] = useState({
    year: (initialDate ?? new Date()).getFullYear(),
    month: (initialDate ?? new Date()).getMonth(),
  });

  const hijriDate = useMemo(() => gregorianToHijri(gregorianDate), [gregorianDate]);
  const eventsThisMonth = useMemo(() => eventsInMonth(hijriDate), [hijriDate]);

  const navigateMonth = useCallback((delta: number) => {
    setCurrentMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      while (m < 0) { m += 12; y -= 1; }
      while (m > 11) { m -= 12; y += 1; }
      const newDate = new Date(y, m, 1);
      setDate(newDate);
      return { year: y, month: m };
    });
  }, []);

  return {
    gregorianDate,
    hijriDate,
    currentMonth,
    islamicEvents: ISLAMIC_EVENTS,
    eventsThisMonth,
    navigateMonth,
    setDate,
  };
}
