/**
 * FCNA (Fiqh Council of North America) Islamic date projections.
 * Uses the Umm al-Qura calendar via luxon-hijri to compute key dates
 * for institutional planning: Ramadan, Eid al-Fitr, Eid al-Adha, etc.
 */
import { getHijriMonthDates } from "./prayer-calendar";
import { getHijriDate } from "./hijri";

export interface IslamicYearDates {
  hijriYear: number;
  gregorianYear: number;
  ramadanStart: Date;
  ramadanEnd: Date; // last day of Ramadan
  last10Start: Date; // 21 Ramadan
  eidAlFitr: Date; // 1 Shawwal
  dhulHijjahStart: Date; // 1 Dhul Hijjah
  dayOfArafah: Date; // 9 Dhul Hijjah
  eidAlAdha: Date; // 10 Dhul Hijjah
  islamicNewYear: Date; // 1 Muharram
  ashura: Date; // 10 Muharram (next Hijri year's Muharram)
}

function nthDay(dates: Date[], n: number): Date {
  return dates[Math.min(n - 1, dates.length - 1)];
}

export function getIslamicYearDates(hijriYear: number): IslamicYearDates {
  const ramadanDays = getHijriMonthDates(hijriYear, 9); // Ramadan = month 9
  const shawwalDays = getHijriMonthDates(hijriYear, 10); // Shawwal = month 10
  const dhulHijjahDays = getHijriMonthDates(hijriYear, 12); // Dhul Hijjah = month 12
  const muharramDays = getHijriMonthDates(hijriYear + 1, 1); // next year's Muharram

  const ramadanStart = ramadanDays[0];
  const ramadanEnd = ramadanDays[ramadanDays.length - 1];
  const last10Start = nthDay(ramadanDays, 21);
  const eidAlFitr = shawwalDays[0];
  const dhulHijjahStart = dhulHijjahDays[0];
  const dayOfArafah = nthDay(dhulHijjahDays, 9);
  const eidAlAdha = nthDay(dhulHijjahDays, 10);
  const islamicNewYear = muharramDays[0];
  const ashura = nthDay(muharramDays, 10);

  return {
    hijriYear,
    gregorianYear: ramadanStart.getUTCFullYear(),
    ramadanStart,
    ramadanEnd,
    last10Start,
    eidAlFitr,
    dhulHijjahStart,
    dayOfArafah,
    eidAlAdha,
    islamicNewYear,
    ashura,
  };
}

export function getMultiYearDates(
  startHijriYear: number,
  count: number,
): IslamicYearDates[] {
  return Array.from({ length: count }, (_, i) =>
    getIslamicYearDates(startHijriYear + i),
  );
}

export function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateFull(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Returns the current Hijri year by converting today's date.
 * Uses luxon-hijri's Umm al-Qura calendar for the conversion.
 */
export function getCurrentHijriYear(): number {
  return getHijriDate(new Date()).year;
}

export function formatWeekday(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}
