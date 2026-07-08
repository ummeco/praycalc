/**
 * Purpose: Unit tests for the pure Share-sheet text builders — today's prayer times
 *   message and the generic "share the app" message.
 */

import { buildPrayerTimesShareText, buildAppShareText, PRAYCALC_SHARE_URL } from '../share';
import type { PrayerTimes } from '../../types/prayer';
import { PRAYER_LABEL_KEYS } from '../../constants/prayers';

// A fixed set of prayer times so formatted output is deterministic.
const TIMES: PrayerTimes = {
  Fajr: new Date(2026, 0, 15, 5, 12),
  Sunrise: new Date(2026, 0, 15, 6, 45),
  Dhuhr: new Date(2026, 0, 15, 12, 30),
  Asr: new Date(2026, 0, 15, 15, 45),
  Maghrib: new Date(2026, 0, 15, 18, 2),
  Isha: new Date(2026, 0, 15, 19, 30),
};

// Simple English label lookup, mirroring t(PRAYER_LABEL_KEYS[name]) without i18next.
const ENGLISH_LABELS: Record<string, string> = {
  'prayer.fajr': 'Fajr',
  'prayer.sunrise': 'Sunrise',
  'prayer.dhuhr': 'Dhuhr',
  'prayer.asr': 'Asr',
  'prayer.maghrib': 'Maghrib',
  'prayer.isha': 'Isha',
};
const translatePrayerLabel = (name: keyof typeof PRAYER_LABEL_KEYS) => ENGLISH_LABELS[PRAYER_LABEL_KEYS[name]]!;

describe('buildPrayerTimesShareText', () => {
  it('includes the city, country, and every displayed prayer with a formatted time', () => {
    const text = buildPrayerTimesShareText({
      times: TIMES,
      city: 'London',
      country: 'United Kingdom',
      timeFormat: '24h',
      locale: 'en-US',
      translatePrayerLabel,
    });
    expect(text).toContain('London, United Kingdom');
    expect(text).toContain('Fajr: 05:12');
    expect(text).toContain('Dhuhr: 12:30');
    expect(text).toContain('Isha: 19:30');
    expect(text).toContain(PRAYCALC_SHARE_URL);
  });

  it('formats 12h times with AM/PM when timeFormat is 12h', () => {
    const text = buildPrayerTimesShareText({
      times: TIMES,
      city: 'London',
      country: 'United Kingdom',
      timeFormat: '12h',
      locale: 'en-US',
      translatePrayerLabel,
    });
    expect(text).toContain('Fajr: 5:12 AM');
    expect(text).toContain('Dhuhr: 12:30 PM');
  });

  it('omits the trailing comma when country is empty', () => {
    const text = buildPrayerTimesShareText({
      times: TIMES,
      city: 'Somewhere',
      country: '',
      timeFormat: '24h',
      locale: 'en-US',
      translatePrayerLabel,
    });
    expect(text.split('\n')[0]).toBe('Prayer times for Somewhere today:');
  });
});

describe('buildAppShareText', () => {
  it('includes the app name and the praycalc.com link', () => {
    const text = buildAppShareText();
    expect(text).toContain('PrayCalc');
    expect(text).toContain(PRAYCALC_SHARE_URL);
  });
});
