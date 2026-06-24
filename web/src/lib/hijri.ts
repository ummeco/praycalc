/**
 * hijri.ts — Canonical Hijri calendar using @umalqura/core.
 *
 * PURPOSE: Replaces all Intl calendar:islamic usage and the legacy luxon-hijri
 *   implementation. Uses Umm al-Qura table-driven algorithm per D-P7-21.
 *   Never use: new Intl.DateTimeFormat(..., { calendar: 'islamic' })
 *   Never use: luxon-hijri's toHijri()
 *   Always use: gregorianToHijri() from this module.
 *
 * INPUTS: JavaScript Date objects
 * OUTPUTS: HijriDateResult with year, month, day, monthName, monthNameAr
 * CONSTRAINTS:
 *   - Safe for client islands (no Node.js APIs)
 *   - @umalqura/core covers 1318–1500 AH (~1900–2077 CE)
 *   - RangeError for inputs outside supported range
 * REF: P2-E3-W02-S02-T03 · D-P7-21 · acceptance criterion: grep calendar.*islamic returns empty
 */

import umalqura from '@umalqura/core';

export interface HijriDateResult {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameAr: string;
  formatted: string;
}

/** English + Arabic month names (1-indexed; index 0 unused) */
const MONTHS_EN = [
  '',
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Ula", "Jumada al-Akhira", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul Qi'da", "Dhul Hijja",
];

const MONTHS_AR = [
  '',
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

/**
 * Convert a Gregorian Date to a Hijri date using Umm al-Qura algorithm.
 *
 * @throws RangeError if date is outside 1318–1500 AH range
 */
export function gregorianToHijri(date: Date): HijriDateResult {
  // umalqura.$ is UmAlQuraStatic — use static gregorianToHijri(Date) → { hy, hm, hd }
  const { hy: year, hm: month, hd: day } = umalqura.$.gregorianToHijri(date);
  const monthName = MONTHS_EN[month] ?? '';
  const monthNameAr = MONTHS_AR[month] ?? '';
  const formatted = `${day} ${monthName} ${year} AH`;

  return { year, month, day, monthName, monthNameAr, formatted };
}

/** Alias for compatibility with @ummat/shared/hijri pattern */
export const toHijri = gregorianToHijri;

/**
 * Alias for callers expecting a getHijriDate(date?) signature.
 * Date defaults to today if omitted — enables no-arg call pattern in tests and islands.
 */
export function getHijriDate(date?: Date): HijriDateResult {
  return gregorianToHijri(date ?? new Date());
}

/**
 * Format a Gregorian date as a Hijri string.
 *
 * @param date - Gregorian date
 * @param locale - 'en' or 'ar'
 */
export function formatHijri(date: Date, locale: 'en' | 'ar' = 'en'): string {
  const h = gregorianToHijri(date);
  if (locale === 'ar') {
    return `${h.day} ${h.monthNameAr} ${h.year} هـ`;
  }
  return h.formatted;
}
