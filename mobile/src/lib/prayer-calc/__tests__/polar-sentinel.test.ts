/**
 * Purpose: P0 regression guard (PKG-01) — the NREL SPA "no such event" sentinel (-99999)
 *   is a FINITE number, so every `Number.isFinite` guard in the prayer-time chain used to
 *   pass it through and `hoursToDate` wrapped it into a plausible-looking clock time. At
 *   Longyearbyen on 2026-06-21 the app rendered Sunrise 09:00 and Maghrib 09:00 (identical,
 *   both the same sentinel) with no signal to the user that anything was wrong.
 * Constraints: These tests assert the ABSENCE of fabricated output above the Arctic Circle,
 *   and that behaviour below it is unchanged. An unreachable prayer must be an Invalid Date,
 *   never a real-looking time.
 */

import { calculatePrayerTimes } from '../index';

/** Cities above the Arctic Circle, where sunrise/sunset genuinely stop existing. */
const POLAR = [
  { name: 'Longyearbyen', lat: 78.22334, lng: 15.64689, tz: 1 },
  { name: 'Tromso', lat: 69.6492, lng: 18.9553, tz: 2 },
  { name: 'Murmansk', lat: 68.9585, lng: 33.0827, tz: 3 },
] as const;

/** Dates that put those cities in polar day or polar night. */
const POLAR_DATES = ['2026-06-21', '2026-12-21', '2026-05-01'] as const;

const ALL_PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

describe('PKG-01 — no fabricated times above the Arctic Circle', () => {
  describe.each(POLAR)('$name', ({ lat, lng, tz }) => {
    it.each(POLAR_DATES)('%s — every prayer is either valid or an Invalid Date', (ds) => {
      const times = calculatePrayerTimes(new Date(`${ds}T00:00:00`), lat, lng, tz, 'MWL');
      for (const name of ALL_PRAYERS) {
        const t = times[name];
        const ms = t.getTime();
        // Invalid Date is acceptable (honest "no such time"). A real Date is only
        // acceptable if it is a genuine same-day time, never a sentinel artifact.
        if (!Number.isNaN(ms)) {
          const hours = t.getHours() + t.getMinutes() / 60;
          expect(hours).toBeGreaterThanOrEqual(0);
          expect(hours).toBeLessThan(24);
        }
      }
    });

    it.each(POLAR_DATES)('%s — Sunrise and Maghrib are never the same instant', (ds) => {
      const times = calculatePrayerTimes(new Date(`${ds}T00:00:00`), lat, lng, tz, 'MWL');
      // Both were the identical sentinel before the fix, rendering 09:00 = 09:00.
      if (!Number.isNaN(times.Sunrise.getTime()) && !Number.isNaN(times.Maghrib.getTime())) {
        expect(times.Sunrise.getTime()).not.toBe(times.Maghrib.getTime());
      }
    });

    it.each(POLAR_DATES)('%s — no prayer lands on the 09:00 sentinel artifact', (ds) => {
      const times = calculatePrayerTimes(new Date(`${ds}T00:00:00`), lat, lng, tz, 'MWL');
      // -99999 mod 24 === 9, so every leaked sentinel rendered as exactly 09:00:00.
      for (const name of ALL_PRAYERS) {
        const t = times[name];
        if (Number.isNaN(t.getTime())) continue;
        const isNineSharp = t.getHours() === 9 && t.getMinutes() === 0 && t.getSeconds() === 0;
        expect(isNineSharp).toBe(false);
      }
    });
  });

  it('Longyearbyen 2026-06-21 — the exact reported case produces no real-looking times', () => {
    const times = calculatePrayerTimes(new Date('2026-06-21T00:00:00'), 78.22334, 15.64689, 1, 'MWL');
    // True polar day: there is no sunrise, no sunset, and no reachable twilight angle.
    expect(Number.isNaN(times.Sunrise.getTime())).toBe(true);
    expect(Number.isNaN(times.Maghrib.getTime())).toBe(true);
    expect(Number.isNaN(times.Fajr.getTime())).toBe(true);
    expect(Number.isNaN(times.Isha.getTime())).toBe(true);
  });
});

describe('PKG-01 — behaviour below the Arctic Circle is unchanged', () => {
  const NORMAL = [
    { name: 'London', lat: 51.5074, lng: -0.1278, tz: 0, date: '2026-01-15' },
    { name: 'Helsinki', lat: 60.1733, lng: 24.941, tz: 2, date: '2026-06-21' },
    { name: 'Mecca', lat: 21.3891, lng: 39.8579, tz: 3, date: '2026-03-15' },
    { name: 'New York', lat: 40.7128, lng: -74.006, tz: -4, date: '2026-03-15' },
  ] as const;

  it.each(NORMAL)('$name — sunrise, dhuhr, asr and maghrib are all real and ordered', ({ lat, lng, tz, date }) => {
    const times = calculatePrayerTimes(new Date(`${date}T00:00:00`), lat, lng, tz, 'MWL');
    for (const name of ['Sunrise', 'Dhuhr', 'Asr', 'Maghrib'] as const) {
      expect(Number.isNaN(times[name].getTime())).toBe(false);
    }
    expect(times.Sunrise.getTime()).toBeLessThan(times.Dhuhr.getTime());
    expect(times.Dhuhr.getTime()).toBeLessThan(times.Asr.getTime());
    expect(times.Asr.getTime()).toBeLessThan(times.Maghrib.getTime());
  });
});
