/**
 * T06 — DST transition + polar extreme tests (web side).
 *
 * Uses pray-calc directly (not lib/prayers.ts which is server-only) to verify
 * that the prayer engine handles DST boundary days and high-latitude locations
 * without crashes or time-ordering violations.
 */
import { describe, it, expect } from "vitest";
import { calcTimes } from "pray-calc";
import type { FormattedPrayerTimes } from "pray-calc";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse "HH:MM:SS" → fractional hours. Returns NaN for "N/A" / falsy. */
function toHours(s: string | undefined | null): number {
  if (!s || s === "N/A") return NaN;
  const [h, m, sec] = s.split(":").map(Number);
  return h + m / 60 + (sec ?? 0) / 3600;
}

function prayerTimes(
  year: number,
  month: number,
  day: number,
  lat: number,
  lng: number,
  tzOffset: number,
): FormattedPrayerTimes {
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return calcTimes(date, lat, lng, tzOffset, 0, undefined, undefined, false) as FormattedPrayerTimes;
}

// ---------------------------------------------------------------------------
// DST — US Eastern (NYC: 40.7128°N, -74.0060°W)
// Spring-forward: 2026-03-08 02:00 EST → 03:00 EDT (UTC-5 → UTC-4)
// Fall-back:      2026-11-01 02:00 EDT → 01:00 EST (UTC-4 → UTC-5)
// ---------------------------------------------------------------------------

describe("T06 — DST transition sanity (US Eastern, NYC)", () => {
  const lat = 40.7128;
  const lng = -74.006;

  it("Spring-forward 2026-03-08 (UTC-5) — times are finite and ordered", () => {
    const t = prayerTimes(2026, 3, 8, lat, lng, -5.0);
    const fajr    = toHours(t.Fajr);
    const sunrise = toHours(t.Sunrise);
    const dhuhr   = toHours(t.Dhuhr);
    const asr     = toHours(t.Asr);
    const maghrib = toHours(t.Maghrib);
    const isha    = toHours(t.Isha);
    expect(isFinite(fajr)).toBe(true);
    expect(fajr).toBeLessThan(sunrise);
    expect(sunrise).toBeLessThan(dhuhr);
    expect(dhuhr).toBeLessThan(asr);
    expect(asr).toBeLessThan(maghrib);
    expect(maghrib).toBeLessThan(isha);
  });

  it("Spring-forward 2026-03-08 (UTC-4) — DST active, times are finite and ordered", () => {
    const t = prayerTimes(2026, 3, 8, lat, lng, -4.0);
    const fajr    = toHours(t.Fajr);
    const sunrise = toHours(t.Sunrise);
    const dhuhr   = toHours(t.Dhuhr);
    const asr     = toHours(t.Asr);
    const maghrib = toHours(t.Maghrib);
    const isha    = toHours(t.Isha);
    expect(isFinite(fajr)).toBe(true);
    expect(fajr).toBeLessThan(sunrise);
    expect(sunrise).toBeLessThan(dhuhr);
    expect(dhuhr).toBeLessThan(asr);
    expect(asr).toBeLessThan(maghrib);
    expect(maghrib).toBeLessThan(isha);
  });

  it("Spring-forward: UTC-4 Fajr is ~1 hour later than UTC-5 Fajr (same solar event)", () => {
    const tStd = prayerTimes(2026, 3, 8, lat, lng, -5.0);
    const tDst = prayerTimes(2026, 3, 8, lat, lng, -4.0);
    const diff = toHours(tDst.Fajr) - toHours(tStd.Fajr);
    // Swapping UTC offset by +1 must shift every local time by +1 hour.
    expect(diff).toBeCloseTo(1.0, 2);
  });

  it("Spring-forward: UTC-4 Isha is ~1 hour later than UTC-5 Isha", () => {
    const tStd = prayerTimes(2026, 3, 8, lat, lng, -5.0);
    const tDst = prayerTimes(2026, 3, 8, lat, lng, -4.0);
    const diff = toHours(tDst.Isha) - toHours(tStd.Isha);
    expect(diff).toBeCloseTo(1.0, 2);
  });

  it("Fall-back 2026-11-01 (UTC-4) — DST still active, times finite and ordered", () => {
    const t = prayerTimes(2026, 11, 1, lat, lng, -4.0);
    const fajr    = toHours(t.Fajr);
    const sunrise = toHours(t.Sunrise);
    const maghrib = toHours(t.Maghrib);
    const isha    = toHours(t.Isha);
    expect(isFinite(fajr)).toBe(true);
    expect(fajr).toBeLessThan(sunrise);
    expect(maghrib).toBeLessThan(isha);
  });

  it("Fall-back 2026-11-01 (UTC-5) — standard time, times finite and ordered", () => {
    const t = prayerTimes(2026, 11, 1, lat, lng, -5.0);
    const fajr    = toHours(t.Fajr);
    const sunrise = toHours(t.Sunrise);
    const maghrib = toHours(t.Maghrib);
    const isha    = toHours(t.Isha);
    expect(isFinite(fajr)).toBe(true);
    expect(fajr).toBeLessThan(sunrise);
    expect(maghrib).toBeLessThan(isha);
  });
});

// ---------------------------------------------------------------------------
// Polar extremes — Helsinki (60.17°N, UTC+2)
// Winter: very short day; Summer: sun barely sets (white nights).
// ---------------------------------------------------------------------------

describe("T06 — Polar extreme: Helsinki (60.17°N, UTC+2)", () => {
  const lat = 60.1733;
  const lng = 24.941;
  const tz  = 2.0;

  it("Winter solstice 2024-12-21 — Fajr, Isha finite and ordered", () => {
    const t = prayerTimes(2024, 12, 21, lat, lng, tz);
    const fajr    = toHours(t.Fajr);
    const sunrise = toHours(t.Sunrise);
    const dhuhr   = toHours(t.Dhuhr);
    const asr     = toHours(t.Asr);
    const maghrib = toHours(t.Maghrib);
    const isha    = toHours(t.Isha);
    expect(isFinite(fajr)).toBe(true);
    expect(isFinite(isha)).toBe(true);
    expect(fajr).toBeLessThan(sunrise);
    expect(sunrise).toBeLessThan(dhuhr);
    expect(dhuhr).toBeLessThan(asr);
    expect(asr).toBeLessThan(maghrib);
    expect(maghrib).toBeLessThan(isha);
  });

  it("Winter solstice: daylight window (Sunrise→Maghrib) is under 7 hours", () => {
    const t = prayerTimes(2024, 12, 21, lat, lng, tz);
    const daylight = toHours(t.Maghrib) - toHours(t.Sunrise);
    expect(daylight).toBeLessThan(7.0);
  });

  it("Summer solstice 2024-06-21 — engine does not throw (white night: Fajr/Isha may be N/A)", () => {
    expect(() => prayerTimes(2024, 6, 21, lat, lng, tz)).not.toThrow();
  });

  it("Summer solstice: Sunrise and Dhuhr are always finite", () => {
    const t = prayerTimes(2024, 6, 21, lat, lng, tz);
    expect(isFinite(toHours(t.Sunrise))).toBe(true);
    expect(isFinite(toHours(t.Dhuhr))).toBe(true);
  });

  it("Spring equinox 2024-03-20 — all times finite and ordered", () => {
    const t = prayerTimes(2024, 3, 20, lat, lng, tz);
    const fajr    = toHours(t.Fajr);
    const sunrise = toHours(t.Sunrise);
    const dhuhr   = toHours(t.Dhuhr);
    const asr     = toHours(t.Asr);
    const maghrib = toHours(t.Maghrib);
    const isha    = toHours(t.Isha);
    expect(isFinite(fajr)).toBe(true);
    expect(fajr).toBeLessThan(sunrise);
    expect(sunrise).toBeLessThan(dhuhr);
    expect(dhuhr).toBeLessThan(asr);
    expect(asr).toBeLessThan(maghrib);
    expect(maghrib).toBeLessThan(isha);
  });
});

// ---------------------------------------------------------------------------
// Polar extremes — Reykjavik (64.13°N, UTC+0)
// ---------------------------------------------------------------------------

describe("T06 — Polar extreme: Reykjavik (64.13°N, UTC+0)", () => {
  const lat = 64.1355;
  const lng = -21.8954;
  const tz  = 0.0;

  it("Winter solstice 2024-12-21 — engine does not throw", () => {
    expect(() => prayerTimes(2024, 12, 21, lat, lng, tz)).not.toThrow();
  });

  it("Winter solstice: Sunrise and Dhuhr are finite", () => {
    const t = prayerTimes(2024, 12, 21, lat, lng, tz);
    expect(isFinite(toHours(t.Sunrise))).toBe(true);
    expect(isFinite(toHours(t.Dhuhr))).toBe(true);
  });

  it("Summer solstice 2024-06-21 — engine does not throw (extreme white night)", () => {
    expect(() => prayerTimes(2024, 6, 21, lat, lng, tz)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Polar extremes — Anchorage (61.22°N, UTC-9)
// ---------------------------------------------------------------------------

describe("T06 — Polar extreme: Anchorage (61.22°N, UTC-9)", () => {
  const lat = 61.2181;
  const lng = -149.9003;
  const tz  = -9.0;

  it("Winter solstice 2024-12-21 — engine does not throw", () => {
    expect(() => prayerTimes(2024, 12, 21, lat, lng, tz)).not.toThrow();
  });

  it("Winter solstice: Sunrise and Dhuhr are finite", () => {
    const t = prayerTimes(2024, 12, 21, lat, lng, tz);
    expect(isFinite(toHours(t.Sunrise))).toBe(true);
    expect(isFinite(toHours(t.Dhuhr))).toBe(true);
  });

  it("Summer solstice 2024-06-21 — engine does not throw", () => {
    expect(() => prayerTimes(2024, 6, 21, lat, lng, tz)).not.toThrow();
  });
});
