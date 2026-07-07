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

/** A single all-day Islamic observance on a specific Gregorian (UTC) date. */
export interface IslamicEvent {
  /** Stable slug for the VEVENT UID (e.g. "eid-al-fitr"). */
  slug: string;
  /** Display name for the calendar entry. */
  name: string;
  /** UTC calendar date (no time-of-day). */
  date: Date;
}

// Fixed Hijri observances exported to calendars. Mawlid is intentionally EXCLUDED
// (PPI theology decision, W1.1). Each entry is (Hijri month, Hijri day, name, slug).
// Laylat al-Qadr uses 27 Ramadan (the most widely observed likely night); the true
// night is one of the odd nights of the last ten — surfaced as an approximation.
const FIXED_HIJRI_OBSERVANCES: { hm: number; hd: number; name: string; slug: string }[] = [
  { hm: 1, hd: 1, name: 'Islamic New Year', slug: 'islamic-new-year' },
  { hm: 1, hd: 10, name: 'Day of Ashura', slug: 'ashura' },
  { hm: 7, hd: 27, name: "Isra' and Mi'raj", slug: 'isra-miraj' },
  { hm: 9, hd: 1, name: 'First day of Ramadan', slug: 'ramadan-start' },
  { hm: 9, hd: 27, name: 'Laylat al-Qadr (27th night)', slug: 'laylat-al-qadr' },
  { hm: 10, hd: 1, name: 'Eid al-Fitr', slug: 'eid-al-fitr' },
  { hm: 12, hd: 10, name: 'Eid al-Adha', slug: 'eid-al-adha' },
];

/**
 * All fixed Islamic observances (excluding Mawlid) that fall within a given
 * Gregorian year, computed via Umm al-Qura. Because a Hijri year drifts ~11 days
 * earlier each Gregorian year, some observances can occur twice in one Gregorian
 * year (e.g. two Islamic New Years); we scan the Hijri years bracketing the target
 * Gregorian year and keep every occurrence whose Gregorian year matches.
 *
 * @param gregorianYear - e.g. 2026
 * @returns events sorted ascending by date
 */
export function getIslamicEventsForGregorianYear(gregorianYear: number): IslamicEvent[] {
  const midYear = new Date(Date.UTC(gregorianYear, 5, 1)); // June 1 — mid-year anchor
  const centerHijriYear = um.$.gregorianToHijri(midYear).hy;
  const events: IslamicEvent[] = [];

  // Scan one Hijri year on either side to catch observances near the year boundary.
  for (let hy = centerHijriYear - 1; hy <= centerHijriYear + 1; hy++) {
    for (const obs of FIXED_HIJRI_OBSERVANCES) {
      const date = hijriToDate(hy, obs.hm, obs.hd);
      if (date.getUTCFullYear() === gregorianYear) {
        events.push({ slug: obs.slug, name: obs.name, date });
      }
    }
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  return events;
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
