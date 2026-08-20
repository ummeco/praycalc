import { calculatePrayerTimes, isPrayerTimeValid } from '../index';
import { formatTime, NO_TIME_PLACEHOLDER } from '../../formatTime';

const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

/**
 * Prayers that genuinely have no time inside the polar circles: they are defined by
 * sunrise, sunset or a twilight angle, none of which occur.
 */
const ABSENT_AT_POLES = ['Fajr', 'Sunrise', 'Maghrib', 'Isha'] as const;

/**
 * Dhuhr and Asr derive from solar transit, and the sun crosses the local meridian every
 * day at every latitude — so these stay real even during polar day and polar night.
 * (pray-calc 2.2.0 / nrel-spa 2.1.0 recovered them; before that the whole day was blank.)
 */
const PRESENT_AT_POLES = ['Dhuhr', 'Asr'] as const;

describe('PKG-01 — rendered output at Longyearbyen', () => {
  it.each(['2026-06-21', '2026-12-21'])(
    '%s — sun-dependent prayers render a placeholder, never a clock time',
    (ds) => {
      const t = calculatePrayerTimes(new Date(`${ds}T00:00:00`), 78.22334, 15.64689, 1, 'MWL');
      for (const n of ABSENT_AT_POLES) {
        expect(formatTime(t[n], '24h', 'en-GB')).toBe(NO_TIME_PLACEHOLDER);
      }
    },
  );

  it.each(['2026-06-21', '2026-12-21'])(
    '%s — Dhuhr and Asr are still real times (solar transit always exists)',
    (ds) => {
      const t = calculatePrayerTimes(new Date(`${ds}T00:00:00`), 78.22334, 15.64689, 1, 'MWL');
      for (const n of PRESENT_AT_POLES) {
        expect(isPrayerTimeValid(t[n])).toBe(true);
        expect(formatTime(t[n], '24h', 'en-GB')).toMatch(/^\d{2}:\d{2}$/);
      }
    },
  );

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
