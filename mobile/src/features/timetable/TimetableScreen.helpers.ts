/**
 * Purpose: Pure date/time helpers + shared types for TimetableScreen — split
 *   out of TimetableScreen.tsx to keep the component file under the 300-line
 *   cap. No React state; safe to unit test in isolation.
 * Inputs: plain year/month/date/locale/format values.
 * Outputs: daysInMonth, getMonthName, formatTime, DayRow type, ICS export base URL.
 * Constraints: Logic and output strings are unchanged from the original
 *   inline implementations — locale-aware Gregorian month/time formatting
 *   only, no i18n catalog keys (see call sites for why).
 */

import type { PrayerTimes } from '../../types/prayer';

/** praycalc.com's real calendar export — verified against web/src/pages/api/calendar.ics.ts. */
export const ICS_EXPORT_BASE = 'https://praycalc.com/api/calendar.ics';

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

/** Locale-aware month name, driven by the active i18next language (not a catalog key —
 *  Gregorian month names are locale data, not translatable UI copy). */
export function getMonthName(year: number, month0: number, locale: string): string {
  return new Date(year, month0, 1).toLocaleDateString(locale, { month: 'long' });
}

/**
 * Re-exported from the canonical formatter rather than duplicated (MOB-6). The local copy
 * that used to live here bypassed the shared Invalid-Date guard, so a month containing
 * polar days rendered "Invalid Date" cells in the timetable grid (PKG-01).
 */
export { formatTime } from '../../lib/formatTime';

export interface DayRow {
  day: number;
  isToday: boolean;
  times: PrayerTimes;
}
