import { calculatePrayerTimes, isPrayerTimeValid } from '../index';
import { formatTime, NO_TIME_PLACEHOLDER } from '../../formatTime';

const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

describe('PKG-01 — rendered output at Longyearbyen', () => {
  it('polar day 2026-06-21 renders placeholders, never a clock time', () => {
    const t = calculatePrayerTimes(new Date('2026-06-21T00:00:00'), 78.22334, 15.64689, 1, 'MWL');
    const rendered = PRAYERS.map((n) => `${n}=${formatTime(t[n], '24h', 'en-GB')}`);
    for (const r of rendered) expect(r.split('=')[1]).toBe(NO_TIME_PLACEHOLDER);
  });

  it('polar night 2026-12-21 renders placeholders', () => {
    const t = calculatePrayerTimes(new Date('2026-12-21T00:00:00'), 78.22334, 15.64689, 1, 'MWL');
    for (const n of PRAYERS) expect(formatTime(t[n], '24h', 'en-GB')).toBe(NO_TIME_PLACEHOLDER);
  });

  it('equinox 2026-03-20 still renders real times', () => {
    const t = calculatePrayerTimes(new Date('2026-03-20T00:00:00'), 78.22334, 15.64689, 1, 'MWL');
    for (const n of PRAYERS) {
      expect(isPrayerTimeValid(t[n])).toBe(true);
      expect(formatTime(t[n], '24h', 'en-GB')).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('formatTime never emits the string "Invalid Date"', () => {
    const t = calculatePrayerTimes(new Date('2026-06-21T00:00:00'), 78.22334, 15.64689, 1, 'MWL');
    for (const n of PRAYERS) {
      expect(formatTime(t[n], '12h', 'en-US')).not.toContain('Invalid');
      expect(formatTime(t[n], '24h', 'en-US')).not.toContain('Invalid');
    }
  });
});
