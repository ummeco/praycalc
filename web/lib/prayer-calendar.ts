/**
 * Prayer calendar utilities — Hijri and Gregorian date range helpers.
 * Safe to import on both client and server.
 */
import { getHijriDate } from "./hijri";

export const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

export const GREG_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** YYYY-MM-DD from a UTC-noon Date */
export function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Weekday abbreviation (Sun–Sat) from a UTC-noon Date */
export function weekdayShort(d: Date): string {
  return WEEKDAYS_SHORT[d.getUTCDay()];
}

// ── Tabular Islamic Calendar ─────────────────────────────────────────────────

function hijriToApproxJDN(hYear: number, hMonth: number, hDay = 1): number {
  return (
    Math.floor((11 * hYear + 3) / 30) +
    354 * hYear +
    30 * hMonth -
    Math.floor((hMonth - 1) / 2) +
    hDay +
    1948440 -
    385
  );
}

function jdnToDate(jdn: number): Date {
  const l = jdn + 68569;
  const n = Math.floor((4 * l) / 146097);
  const l2 = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l2 + 1)) / 1461001);
  const l3 = l2 - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l3) / 2447);
  const day = l3 - Math.floor((2447 * j) / 80);
  const l4 = Math.floor(j / 11);
  const month = j + 2 - 12 * l4;
  const year = 100 * (n - 49) + i + l4;
  return new Date(Date.UTC(year, month - 1, day, 12));
}

// ── Hijri month range ────────────────────────────────────────────────────────

/**
 * Returns all UTC-noon Date objects that fall in a given Hijri month.
 * Uses luxon-hijri (via getHijriDate) as the authoritative calendar.
 */
export function getHijriMonthDates(hYear: number, hMonth: number): Date[] {
  // Approximate start via tabular algorithm
  let probe = jdnToDate(hijriToApproxJDN(hYear, hMonth, 1));

  // Scan ±5 days to find the actual first day of this Hijri month
  for (let offset = -5; offset <= 5; offset++) {
    const d = new Date(probe.getTime() + offset * 86_400_000);
    const h = getHijriDate(d);
    if (h.year === hYear && h.month === hMonth) {
      const prev = new Date(d.getTime() - 86_400_000);
      const hPrev = getHijriDate(prev);
      if (hPrev.year !== hYear || hPrev.month !== hMonth) {
        probe = d;
        break;
      }
    }
  }

  // Walk backward to be sure we're at the actual first day
  while (true) {
    const prev = new Date(probe.getTime() - 86_400_000);
    const h = getHijriDate(prev);
    if (h.year === hYear && h.month === hMonth) probe = prev;
    else break;
  }

  // Collect all days in this Hijri month (Hijri months are 29 or 30 days)
  const dates: Date[] = [];
  let cur = probe;
  for (let i = 0; i < 32; i++) {
    const h = getHijriDate(cur);
    if (h.year !== hYear || h.month !== hMonth) break;
    dates.push(cur);
    cur = new Date(cur.getTime() + 86_400_000);
  }
  return dates;
}

// ── Gregorian month range ────────────────────────────────────────────────────

export function getGregorianMonthDates(year: number, month: number): Date[] {
  const days = new Date(year, month, 0).getDate(); // month is 1-based here
  return Array.from({ length: days }, (_, i) =>
    new Date(Date.UTC(year, month - 1, i + 1, 12)),
  );
}

// ── Year groups ──────────────────────────────────────────────────────────────

export interface MonthGroup {
  label: string; // display name
  dates: Date[];
}

export function getHijriYearMonths(hYear: number): MonthGroup[] {
  return Array.from({ length: 12 }, (_, i) => ({
    label: HIJRI_MONTHS[i],
    dates: getHijriMonthDates(hYear, i + 1),
  }));
}

export function getGregorianYearMonths(year: number): MonthGroup[] {
  return Array.from({ length: 12 }, (_, i) => ({
    label: GREG_MONTHS[i],
    dates: getGregorianMonthDates(year, i + 1),
  }));
}

// ── Navigation helpers ───────────────────────────────────────────────────────

export function prevHijriMonth(y: number, m: number) {
  return m === 1 ? { year: y - 1, month: 12 } : { year: y, month: m - 1 };
}
export function nextHijriMonth(y: number, m: number) {
  return m === 12 ? { year: y + 1, month: 1 } : { year: y, month: m + 1 };
}
