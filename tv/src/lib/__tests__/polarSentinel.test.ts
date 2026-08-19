/**
 * Purpose: P0 regression guard (PKG-02) — this file's own header promises "'--:--' when a
 *   value is genuinely unreachable (polar day/night) rather than a fabricated time". It did
 *   not hold: pray-calc reports an unreachable event as the NREL SPA sentinel -99999, which
 *   is FINITE, so `hoursToHHMM`'s `Number.isFinite` guard accepted it and
 *   `((-99999 % 24) + 24) % 24 === 9` rendered a confident "09:00" for Sunrise AND Maghrib
 *   on a Longyearbyen summer day.
 * Constraints: Asserts absence of fabricated output above the Arctic Circle and unchanged
 *   behaviour below it.
 */

import { calculatePrayerTimes } from '../prayerCalc';

const FIELDS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

const POLAR = [
  { name: 'Longyearbyen', latitude: 78.22334, longitude: 15.64689, timezone: '1' },
  { name: 'Tromso', latitude: 69.6492, longitude: 18.9553, timezone: '2' },
] as const;

const POLAR_DATES = ['2026-06-21', '2026-12-21', '2026-05-01'] as const;

describe('PKG-02 — TV never renders a sentinel-derived time', () => {
  describe.each(POLAR)('$name', ({ latitude, longitude, timezone }) => {
    it.each(POLAR_DATES)('%s — sunrise and maghrib are not both 09:00', (ds) => {
      const day = calculatePrayerTimes({
        date: new Date(`${ds}T12:00:00Z`), latitude, longitude, timezone,
        methodId: 'mwl', madhab: 'shafi',
      });
      const collided = day.sunrise === '09:00' && day.maghrib === '09:00';
      expect(collided).toBe(false);
    });

    it.each(POLAR_DATES)('%s — an unreachable prayer is "--:--", never a clock time', (ds) => {
      const day = calculatePrayerTimes({
        date: new Date(`${ds}T12:00:00Z`), latitude, longitude, timezone,
        methodId: 'mwl', madhab: 'shafi',
      });
      for (const f of FIELDS) {
        const v = day[f];
        expect(v === '--:--' || /^\d{2}:\d{2}$/.test(v)).toBe(true);
        // 09:00 exactly is the sentinel artifact; a real 09:00 is possible in principle,
        // so pair it with the collision check above rather than banning it outright here.
      }
    });
  });

  it('Longyearbyen 2026-06-21 — polar day yields no sunrise, maghrib, fajr or isha', () => {
    const day = calculatePrayerTimes({
      date: new Date('2026-06-21T12:00:00Z'), latitude: 78.22334, longitude: 15.64689,
      timezone: '1', methodId: 'mwl', madhab: 'shafi',
    });
    expect(day.sunrise).toBe('--:--');
    expect(day.maghrib).toBe('--:--');
    expect(day.fajr).toBe('--:--');
    expect(day.isha).toBe('--:--');
  });
});

describe('PKG-02 — below the Arctic Circle is unchanged', () => {
  it('London 2026-01-15 — all six are real and ordered', () => {
    const day = calculatePrayerTimes({
      date: new Date('2026-01-15T12:00:00Z'), latitude: 51.5074, longitude: -0.1278,
      timezone: '0', methodId: 'mwl', madhab: 'shafi',
    });
    for (const f of FIELDS) expect(day[f]).toMatch(/^\d{2}:\d{2}$/);
    expect(day.sunrise < day.dhuhr).toBe(true);
    expect(day.dhuhr < day.asr).toBe(true);
    expect(day.asr < day.maghrib).toBe(true);
  });
});
