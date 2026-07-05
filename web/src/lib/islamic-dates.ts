/**
 * islamic-dates.ts — Multi-year Islamic date projections for institutional planning.
 *
 * PURPOSE: Computes the key Islamic dates (Ramadan, Last 10 Nights, Eid al-Fitr,
 *   Day of Arafah, Eid al-Adha, Ashura) for a range of Hijri years, used by the
 *   /institutions accommodation reference page. Dates are computed at build time.
 *
 * INPUTS: Hijri year numbers.
 * OUTPUTS: IslamicYearDates records with UTC Date objects for each occasion.
 * CONSTRAINTS:
 *   - Uses @umalqura/core (Umm al-Qura tabular calendar) — the same engine as
 *     lib/hijri.ts (D-P7-21). Never use Intl calendar:islamic or luxon-hijri.
 *   - Umm al-Qura covers 1318–1500 AH (~1900–2077 CE).
 *   - Umm al-Qura is the basis for most pre-announced Islamic date tables
 *     (Saudi Arabia, and closely tracks FCNA astronomical projections). Local
 *     moon sighting may shift an observed date by ±1 day — surfaced as a caveat
 *     on the page itself.
 *   - All dates are UTC calendar dates (no time-of-day); format with timeZone UTC.
 */
import umImport from '@umalqura/core';

interface UmAlQuraStatic {
  hijriToGregorian(hy: number, hm: number, hd: number): { gy: number; gm: number; gd: number };
  gregorianToHijri(date: Date): { hy: number; hm: number; hd: number };
}

// CJS-interop guard: the browser bundle exposes `.$` (UmAlQuraStatic) directly,
// but the SSR/Node module runner can wrap the CJS export as `{ default: ... }`.
// Cast through `unknown` (the two module shapes don't structurally overlap) and
// unwrap either shape so `um.$` is always the static API.
const umRaw = umImport as unknown as { $?: UmAlQuraStatic; default?: { $: UmAlQuraStatic } };
const um: { $: UmAlQuraStatic } = umRaw.$ ? { $: umRaw.$ } : (umRaw.default as { $: UmAlQuraStatic });

export interface IslamicYearDates {
  hijriYear: number;
  gregorianYear: number;
  ramadanStart: Date; // 1 Ramadan
  ramadanEnd: Date; // last day of Ramadan
  last10Start: Date; // 21 Ramadan
  eidAlFitr: Date; // 1 Shawwal
  dhulHijjahStart: Date; // 1 Dhul Hijjah
  dayOfArafah: Date; // 9 Dhul Hijjah
  eidAlAdha: Date; // 10 Dhul Hijjah
  islamicNewYear: Date; // 1 Muharram (next Hijri year)
  ashura: Date; // 10 Muharram (next Hijri year)
}

/** Convert a Hijri (year, month, day) to a UTC Date via Umm al-Qura. */
function hijriToDate(hy: number, hm: number, hd: number): Date {
  const { gy, gm, gd } = um.$.hijriToGregorian(hy, hm, hd);
  // @umalqura/core returns 0-indexed gregorian months (gm), matching JS Date.
  return new Date(Date.UTC(gy, gm, gd));
}

/**
 * All Gregorian dates within a given Hijri month (29 or 30 entries).
 * Enumerated as [1 of this month, 1 of next month) so month length is exact.
 */
function getHijriMonthDates(hy: number, hm: number): Date[] {
  const start = hijriToDate(hy, hm, 1);
  const nextMonth = hm === 12 ? 1 : hm + 1;
  const nextYear = hm === 12 ? hy + 1 : hy;
  const end = hijriToDate(nextYear, nextMonth, 1);
  const dates: Date[] = [];
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

function nthDay(dates: Date[], n: number): Date {
  return dates[Math.min(n - 1, dates.length - 1)];
}

export function getIslamicYearDates(hijriYear: number): IslamicYearDates {
  const ramadanDays = getHijriMonthDates(hijriYear, 9); // Ramadan
  const shawwalDays = getHijriMonthDates(hijriYear, 10); // Shawwal
  const dhulHijjahDays = getHijriMonthDates(hijriYear, 12); // Dhul Hijjah
  const muharramDays = getHijriMonthDates(hijriYear + 1, 1); // next year's Muharram

  return {
    hijriYear,
    gregorianYear: ramadanDays[0].getUTCFullYear(),
    ramadanStart: ramadanDays[0],
    ramadanEnd: ramadanDays[ramadanDays.length - 1],
    last10Start: nthDay(ramadanDays, 21),
    eidAlFitr: shawwalDays[0],
    dhulHijjahStart: dhulHijjahDays[0],
    dayOfArafah: nthDay(dhulHijjahDays, 9),
    eidAlAdha: nthDay(dhulHijjahDays, 10),
    islamicNewYear: muharramDays[0],
    ashura: nthDay(muharramDays, 10),
  };
}

export function getMultiYearDates(startHijriYear: number, count: number): IslamicYearDates[] {
  return Array.from({ length: count }, (_, i) => getIslamicYearDates(startHijriYear + i));
}

/** Current Hijri year from today's date (Umm al-Qura). */
export function getCurrentHijriYear(): number {
  return um.$.gregorianToHijri(new Date()).hy;
}

export function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatWeekday(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}
