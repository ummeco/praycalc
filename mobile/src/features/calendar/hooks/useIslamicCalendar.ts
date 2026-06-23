/**
 * Purpose: Hook for Hijri/Gregorian dual calendar display and month navigation.
 *   Hijri conversion deferred to @ummat/shared hijri utils per spec §2.3.
 * Inputs: initialDate
 * Outputs: { gregorianDate, hijriDate, currentMonth, navigate, islamicEvents }
 * Constraints: Hijri calendar uses the tabular algorithm (approximation).
 *   Per spec §2.3 note: do NOT port Flutter hijri package independently — use @ummat/shared.
 *   This hook provides a local approximation (±1 day) until @ummat/shared is available.
 * SPORT: REGISTRY-HOOKS.md#praycalc-mobile-useIslamicCalendar
 */

import { useState, useCallback, useMemo } from 'react';

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

export interface IslamicEvent {
  name: string;
  hijriMonth: number;
  hijriDay: number;
}

/** Static list of major Islamic events by Hijri date */
const ISLAMIC_EVENTS: IslamicEvent[] = [
  { name: "Laylat al-Qadr (27th Ramadan)", hijriMonth: 9, hijriDay: 27 },
  { name: "Eid al-Fitr", hijriMonth: 10, hijriDay: 1 },
  { name: "Eid al-Adha", hijriMonth: 12, hijriDay: 10 },
  { name: "Islamic New Year", hijriMonth: 1, hijriDay: 1 },
  { name: "Ashura", hijriMonth: 1, hijriDay: 10 },
  { name: "Mawlid al-Nabi", hijriMonth: 3, hijriDay: 12 },
  { name: "Isra and Mi'raj", hijriMonth: 7, hijriDay: 27 },
  { name: "Start of Ramadan", hijriMonth: 9, hijriDay: 1 },
];

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Ula", "Jumada al-Akhira", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

/**
 * Approximate Gregorian-to-Hijri conversion using the tabular Islamic calendar.
 * Accurate to ±1 day for most dates. @ummat/shared will replace this when available.
 */
function gregorianToHijri(gregorianDate: Date): HijriDate {
  const jd = Math.floor((14 + gregorianDate.getMonth() + 1) / 12);
  const y = gregorianDate.getFullYear() + 4800 - jd;
  const m = gregorianDate.getMonth() + 1 + 12 * jd - 3;
  const julianDay =
    gregorianDate.getDate() +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  const l = julianDay - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719) +
    Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const ll2 = ll - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * ll2) / 709);
  const day = ll2 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return {
    year,
    month,
    day,
    monthName: HIJRI_MONTHS[(month - 1) % 12] ?? 'Unknown',
  };
}

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

  const eventsThisMonth = useMemo(
    () =>
      ISLAMIC_EVENTS.filter(
        (e) => e.hijriMonth === hijriDate.month,
      ),
    [hijriDate.month],
  );

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
