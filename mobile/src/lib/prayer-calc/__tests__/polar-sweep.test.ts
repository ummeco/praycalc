/** Verification 1: sweep every affected city x every day of 2026, assert no fabricated output. */
import { calculatePrayerTimes, isPrayerTimeValid } from '../index';

const CITIES = [
  { n: 'Longyearbyen', lat: 78.22334, lng: 15.64689, tz: 1 },
  { n: 'Tromso', lat: 69.6492, lng: 18.9553, tz: 2 },
  { n: 'Murmansk', lat: 68.9585, lng: 33.0827, tz: 3 },
  { n: 'Rovaniemi', lat: 66.5039, lng: 25.7294, tz: 3 },
  { n: 'McMurdo', lat: -77.8419, lng: 166.6863, tz: 13 },
];
const NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

describe('full-year sweep — no sentinel survives anywhere', () => {
  it.each(CITIES)('$n — 365 days, every value is valid or Invalid Date', ({ lat, lng, tz }) => {
    let invalidCount = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(2026, 0, 1 + i);
      for (const rule of ['NightMiddle', 'OneSeventh', 'AngleBased', 'None'] as const) {
        const t = calculatePrayerTimes(d, lat, lng, tz, 'MWL', 'Shafi', rule);
        for (const n of NAMES) {
          const v = t[n];
          if (!isPrayerTimeValid(v)) { invalidCount++; continue; }
          // A valid time must be a real same-day instant, never a sentinel wrap.
          expect(v.getFullYear()).toBe(d.getFullYear());
          expect(Math.abs(v.getTime() - d.getTime())).toBeLessThan(48 * 3600 * 1000);
        }
      }
    }
    expect(invalidCount).toBeGreaterThan(0); // these latitudes must produce some gaps
  });

  it('Mecca — 365 days, every prayer valid every single day', () => {
    for (let i = 0; i < 365; i++) {
      const d = new Date(2026, 0, 1 + i);
      const t = calculatePrayerTimes(d, 21.3891, 39.8579, 3, 'Makkah');
      for (const n of NAMES) expect(isPrayerTimeValid(t[n])).toBe(true);
    }
  });
});
