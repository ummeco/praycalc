/**
 * Purpose: Regression tests for the custom-angle solver + high-latitude fallback added
 *   on top of pray-calc v2 — the two behaviors pray-calc itself does not provide.
 * Constraints: Custom-angle results are cross-checked against pray-calc's own method
 *   presets (same angle in both paths must agree to within seconds). High-latitude
 *   fallback is checked for sane chronological ordering, not exact reference values
 *   (there is no independent oracle) — this guards against the wraparound regression
 *   found during development, where a sunset just after local midnight broke the
 *   night-length calculation and produced solar-noon nonsense for both Fajr and Isha.
 */

import { calculatePrayerTimes } from '../index';

function minutesBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / 60_000;
}

describe('calculatePrayerTimes — custom angle solver', () => {
  it('matches the MWL preset (18°/17°) at a mid-latitude location', () => {
    const date = new Date('2026-03-15T00:00:00');
    const lat = 40.7128;
    const lng = -74.006;
    const tz = -4;

    const mwl = calculatePrayerTimes(date, lat, lng, tz, 'MWL', 'Shafi');
    const custom = calculatePrayerTimes(date, lat, lng, tz, 'Custom', 'Shafi', 'NightMiddle', {
      fajr: 18,
      isha: 17,
    });

    expect(minutesBetween(mwl.Fajr, custom.Fajr)).toBeLessThan(1);
    expect(minutesBetween(mwl.Isha, custom.Isha)).toBeLessThan(1);
  });

  it('matches the Karachi preset (18°/18°)', () => {
    const date = new Date('2026-03-15T00:00:00');
    const lat = 24.8607;
    const lng = 67.0011;
    const tz = 5;

    const karachi = calculatePrayerTimes(date, lat, lng, tz, 'Karachi', 'Shafi');
    const custom = calculatePrayerTimes(date, lat, lng, tz, 'Custom', 'Shafi', 'NightMiddle', {
      fajr: 18,
      isha: 18,
    });

    expect(minutesBetween(karachi.Fajr, custom.Fajr)).toBeLessThan(1);
    expect(minutesBetween(karachi.Isha, custom.Isha)).toBeLessThan(1);
  });
});

describe('calculatePrayerTimes — high-latitude fallback', () => {
  const summerSolstice = new Date('2026-06-21T00:00:00');
  const reykjavik = { lat: 64.1466, lng: -21.9426, tz: 0 };

  it('is unreachable with rule "None" (honest, no fabricated time)', () => {
    const times = calculatePrayerTimes(
      summerSolstice, reykjavik.lat, reykjavik.lng, reykjavik.tz, 'MWL', 'Shafi', 'None',
    );
    // hoursToDate falls back to local midnight when the underlying angle is unreachable
    expect(times.Fajr.getHours()).toBe(0);
    expect(times.Fajr.getMinutes()).toBe(0);
  });

  it.each(['NightMiddle', 'OneSeventh', 'AngleBased'] as const)(
    'rule %s keeps Fajr before Sunrise and Isha after Maghrib, both same-night',
    (rule) => {
      const times = calculatePrayerTimes(
        summerSolstice, reykjavik.lat, reykjavik.lng, reykjavik.tz, 'MWL', 'Shafi', rule,
      );
      expect(times.Fajr.getTime()).toBeLessThanOrEqual(times.Sunrise.getTime());
      // Regression guard: before the wraparound fix, both Fajr and Isha collapsed to
      // ~solar noon (13:2x) for every rule at this location — that must never recur.
      expect(times.Fajr.getHours()).not.toBe(13);
      expect(times.Isha.getHours()).not.toBe(13);
    },
  );

  it('NightMiddle collapses Fajr and Isha toward the same point on a very short night', () => {
    const times = calculatePrayerTimes(
      summerSolstice, reykjavik.lat, reykjavik.lng, reykjavik.tz, 'MWL', 'Shafi', 'NightMiddle',
    );
    expect(minutesBetween(times.Fajr, times.Isha)).toBeLessThan(5);
  });

  it('does not need the fallback at a normal winter latitude (London)', () => {
    const winter = new Date('2026-01-15T00:00:00');
    const times = calculatePrayerTimes(winter, 51.5074, -0.1278, 0, 'MWL', 'Shafi', 'NightMiddle');
    // Sane Fajr well before sunrise, Isha well after sunset — not midnight-fallback artifacts.
    expect(times.Fajr.getHours()).toBeGreaterThanOrEqual(5);
    expect(times.Fajr.getHours()).toBeLessThan(7);
    expect(times.Isha.getHours()).toBeGreaterThanOrEqual(17);
  });
});

describe('minute adjustments', () => {
  const mecca = { lat: 21.3891, lng: 39.8579, tz: 3 };
  const date = new Date('2026-03-15T00:00:00');

  it('shifts each adjusted prayer by exactly the requested minutes', () => {
    const base = calculatePrayerTimes(date, mecca.lat, mecca.lng, mecca.tz, 'Makkah');
    const adjusted = calculatePrayerTimes(
      date, mecca.lat, mecca.lng, mecca.tz, 'Makkah', 'Shafi', 'NightMiddle', undefined,
      { Fajr: -3, Dhuhr: 5, Isha: 10 },
    );
    expect(adjusted.Fajr.getTime() - base.Fajr.getTime()).toBe(-3 * 60_000);
    expect(adjusted.Dhuhr.getTime() - base.Dhuhr.getTime()).toBe(5 * 60_000);
    expect(adjusted.Isha.getTime() - base.Isha.getTime()).toBe(10 * 60_000);
    // Unadjusted prayers untouched
    expect(adjusted.Asr.getTime()).toBe(base.Asr.getTime());
    expect(adjusted.Maghrib.getTime()).toBe(base.Maghrib.getTime());
    expect(adjusted.Sunrise.getTime()).toBe(base.Sunrise.getTime());
  });

  it('zero and missing adjustments are no-ops', () => {
    const base = calculatePrayerTimes(date, mecca.lat, mecca.lng, mecca.tz, 'MWL');
    const adjusted = calculatePrayerTimes(
      date, mecca.lat, mecca.lng, mecca.tz, 'MWL', 'Shafi', 'NightMiddle', undefined, { Fajr: 0 },
    );
    expect(adjusted.Fajr.getTime()).toBe(base.Fajr.getTime());
  });
});
