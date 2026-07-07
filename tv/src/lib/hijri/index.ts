/**
 * Purpose: Single shared Hijri/Gregorian conversion module for praycalc/tv,
 *   backed by @umalqura/core (the same Umm al-Qura tabular calendar the web app
 *   and mobile app use — ported from mobile/src/lib/hijri/index.ts verbatim to
 *   replace the rough inline gregorianToHijriApprox() in CalendarScreen.tsx).
 * Inputs: Gregorian Date.
 * Outputs: HijriDate { year, month, day, monthName, daysInMonth }, ISLAMIC_EVENTS.
 * Constraints: Umm al-Qura is a civil/administrative calendar (tabular, not moon-
 *   sighting-based) — the same convention used app-wide, so Ramadan/Eid dates now
 *   agree across every screen and every surface (web/mobile/TV). @umalqura/core is
 *   used only for its numeric hy/hm/hd + days-in-month math; display month names are
 *   this module's own (ASCII, no diacritics) for typographic consistency.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-tv-lib-hijri (ported from mobile, same contract)
 */

// Same import convention as mobile/src/lib/hijri/index.ts and the web app's
// canonical src/lib/hijri.ts (D-P7-21):
// umalqura.$ is UmAlQuraStatic — static gregorianToHijri/hijriToGregorian/getDaysInMonth.
import umalqura from '@umalqura/core';

export const HIJRI_MONTH_NAMES = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Ula', 'Jumada al-Akhira', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
] as const;

/** Hijri month 9 = Ramadan (used app-wide for Ramadan-detection). */
export const RAMADAN_MONTH = 9;

export interface HijriDate {
  year: number;
  month: number; // 1-12
  day: number;
  monthName: string;
  /** Total days in this Hijri month (29 or 30) — for accurate "Day X of Y" counters. */
  daysInMonth: number;
}

export interface IslamicEvent {
  name: string;
  hijriMonth: number;
  hijriDay: number;
}

/** Static list of major Islamic events by Hijri date, shared across Calendar/Ramadan/Moon. */
export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { name: "Laylat al-Qadr (27th Ramadan)", hijriMonth: 9, hijriDay: 27 },
  { name: 'Eid al-Fitr', hijriMonth: 10, hijriDay: 1 },
  { name: 'Eid al-Adha', hijriMonth: 12, hijriDay: 10 },
  { name: 'Islamic New Year', hijriMonth: 1, hijriDay: 1 },
  { name: 'Ashura', hijriMonth: 1, hijriDay: 10 },
  // Mawlid al-Nabi INTENTIONALLY EXCLUDED from all PrayCalc surfaces (user directive
  // 2026-07-07): ahl us-sunnah content gate — not observed as a celebrated event here.
  { name: "Isra and Mi'raj", hijriMonth: 7, hijriDay: 27 },
  { name: 'Start of Ramadan', hijriMonth: 9, hijriDay: 1 },
];

/**
 * Convert a Gregorian date to Hijri via the Umm al-Qura tabular calendar.
 * @param dayAdjustment ±2-day offset for local moon-sighting differences vs the
 *   tabular calendar (settings.hijriDayAdjustment) — shifts the Gregorian input,
 *   the standard convention competitor apps use.
 */
export function gregorianToHijri(date: Date, dayAdjustment = 0): HijriDate {
  const adjusted = dayAdjustment
    ? new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayAdjustment, 12)
    : date;
  const { hy, hm, hd } = umalqura.$.gregorianToHijri(adjusted);
  return {
    year: hy,
    month: hm,
    day: hd,
    monthName: HIJRI_MONTH_NAMES[hm - 1] ?? 'Unknown',
    daysInMonth: umalqura.$.getDaysInMonth(hy, hm),
  };
}

/** Convert a Hijri date back to Gregorian. */
export function hijriToGregorian(year: number, month: number, day: number): Date {
  const { gy, gm, gd } = umalqura.$.hijriToGregorian(year, month, day);
  return new Date(gy, gm - 1, gd);
}

export function isRamadan(hijri: HijriDate): boolean {
  return hijri.month === RAMADAN_MONTH;
}

/** Islamic events falling in the same Hijri month as the given date. */
export function eventsInMonth(hijri: HijriDate): IslamicEvent[] {
  return ISLAMIC_EVENTS.filter((e) => e.hijriMonth === hijri.month);
}
