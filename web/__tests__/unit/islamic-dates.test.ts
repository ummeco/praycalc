import { describe, it, expect } from "vitest";
import {
  getIslamicYearDates,
  getMultiYearDates,
  getCurrentHijriYear,
  formatDateShort,
  formatWeekday,
} from "@/lib/islamic-dates";

/** Format a Date as an ISO UTC calendar date (YYYY-MM-DD) for stable assertions. */
function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

describe("islamic-dates (Umm al-Qura projections for /institutions)", () => {
  it("computes 1446 AH key dates matching known Umm al-Qura values", () => {
    const y = getIslamicYearDates(1446);
    expect(y.hijriYear).toBe(1446);
    expect(y.gregorianYear).toBe(2025);
    // Ramadan 1446 began Mar 1, 2025; Eid al-Fitr = 1 Shawwal = Mar 30, 2025.
    expect(iso(y.ramadanStart)).toBe("2025-03-01");
    expect(iso(y.eidAlFitr)).toBe("2025-03-30");
    // Day of Arafah (9 Dhul Hijjah) = Jun 5, 2025; Eid al-Adha = Jun 6, 2025.
    expect(iso(y.dayOfArafah)).toBe("2025-06-05");
    expect(iso(y.eidAlAdha)).toBe("2025-06-06");
  });

  it("places the Last 10 Nights at 21 Ramadan and Ashura after Eid al-Adha", () => {
    const y = getIslamicYearDates(1447);
    // 21 Ramadan is 20 days after 1 Ramadan.
    const twentyDaysMs = 20 * 24 * 60 * 60 * 1000;
    expect(y.last10Start.getTime()).toBe(y.ramadanStart.getTime() + twentyDaysMs);
    // Ashura (10 Muharram, next Hijri year) falls after Eid al-Adha.
    expect(y.ashura.getTime()).toBeGreaterThan(y.eidAlAdha.getTime());
  });

  it("spans one Hijri year (~354 days) between consecutive Ramadans", () => {
    // A Hijri year is 354-355 days — ~11 days shorter than the solar year,
    // which is why Ramadan drifts ~11 days earlier on the Gregorian calendar.
    const a = getIslamicYearDates(1446).ramadanStart.getTime();
    const b = getIslamicYearDates(1447).ramadanStart.getTime();
    const daysBetween = (b - a) / (24 * 60 * 60 * 1000);
    expect(daysBetween).toBeGreaterThan(353);
    expect(daysBetween).toBeLessThan(356);
  });

  it("getMultiYearDates returns a contiguous ascending range", () => {
    const rows = getMultiYearDates(1447, 5);
    expect(rows).toHaveLength(5);
    expect(rows.map((r) => r.hijriYear)).toEqual([1447, 1448, 1449, 1450, 1451]);
  });

  it("getCurrentHijriYear returns a plausible current Hijri year", () => {
    const y = getCurrentHijriYear();
    expect(y).toBeGreaterThan(1440);
    expect(y).toBeLessThan(1470);
  });

  it("formatters render UTC-stable strings", () => {
    const d = new Date(Date.UTC(2025, 2, 1)); // Mar 1, 2025 (Sat)
    expect(formatDateShort(d)).toBe("Mar 1, 2025");
    expect(formatWeekday(d)).toBe("Sat");
  });
});
