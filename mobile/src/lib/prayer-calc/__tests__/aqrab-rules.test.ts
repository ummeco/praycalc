/**
 * Purpose: the two rules that actually reach inside the polar circles, wired through the
 *   app layer. The three night-proportion rules need a real sunset to measure against, so
 *   at Longyearbyen in June they correctly decline; before AqrabAlBilad/AqrabAlAyyam were
 *   added, a user there had no working option at all.
 * Constraints: substitution must never move a time the sun actually provides, and
 *   provenance must name the origin so the UI can mark a juristic choice as one.
 */

import { calculatePrayerTimesDetailed, isPrayerTimeValid } from '../index';
import type { HighLatRule } from '../../../types/prayer';

const LONGYEARBYEN = { lat: 78.22334, lng: 15.64689, tz: 1 };
const POLAR_DAY = new Date('2026-06-21T00:00:00');
const NEW_YORK = { lat: 40.7128, lng: -74.006, tz: -4 };

const NIGHT_RULES: HighLatRule[] = ['NightMiddle', 'AngleBased', 'OneSeventh'];
const NEAREST_RULES: HighLatRule[] = ['AqrabAlBilad', 'AqrabAlAyyam'];

describe('high-latitude rules through the app layer', () => {
  it.each(NEAREST_RULES)('%s supplies Fajr and Isha during polar day', (rule) => {
    const { times, provenance } = calculatePrayerTimesDetailed(
      POLAR_DAY, LONGYEARBYEN.lat, LONGYEARBYEN.lng, LONGYEARBYEN.tz, 'MWL', 'Shafi', rule,
    );
    expect(isPrayerTimeValid(times.Fajr)).toBe(true);
    expect(isPrayerTimeValid(times.Isha)).toBe(true);
    expect(provenance.Fajr).toBe(rule);
    expect(provenance.Isha).toBe(rule);
  });

  it.each(NIGHT_RULES)('%s honestly declines during polar day (no night to divide)', (rule) => {
    const { times, provenance } = calculatePrayerTimesDetailed(
      POLAR_DAY, LONGYEARBYEN.lat, LONGYEARBYEN.lng, LONGYEARBYEN.tz, 'MWL', 'Shafi', rule,
    );
    expect(isPrayerTimeValid(times.Fajr)).toBe(false);
    expect(provenance.Fajr).toBe('unavailable');
  });

  it('None substitutes nothing and says so', () => {
    const { times, provenance } = calculatePrayerTimesDetailed(
      POLAR_DAY, LONGYEARBYEN.lat, LONGYEARBYEN.lng, LONGYEARBYEN.tz, 'MWL', 'Shafi', 'None',
    );
    expect(isPrayerTimeValid(times.Fajr)).toBe(false);
    expect(provenance.Fajr).toBe('unavailable');
  });

  it('Dhuhr and Asr are real under every rule (solar transit always exists)', () => {
    for (const rule of [...NIGHT_RULES, ...NEAREST_RULES, 'None' as HighLatRule]) {
      const { times } = calculatePrayerTimesDetailed(
        POLAR_DAY, LONGYEARBYEN.lat, LONGYEARBYEN.lng, LONGYEARBYEN.tz, 'MWL', 'Shafi', rule,
      );
      expect(isPrayerTimeValid(times.Dhuhr)).toBe(true);
      expect(isPrayerTimeValid(times.Asr)).toBe(true);
    }
  });

  it('no rule moves a time the sun actually provides', () => {
    const base = calculatePrayerTimesDetailed(
      new Date('2026-03-15T00:00:00'), NEW_YORK.lat, NEW_YORK.lng, NEW_YORK.tz, 'MWL',
    );
    expect(base.provenance.Fajr).toBe('observed');
    for (const rule of [...NIGHT_RULES, ...NEAREST_RULES, 'None' as HighLatRule]) {
      const r = calculatePrayerTimesDetailed(
        new Date('2026-03-15T00:00:00'), NEW_YORK.lat, NEW_YORK.lng, NEW_YORK.tz, 'MWL', 'Shafi', rule,
      );
      expect(r.times.Fajr.getTime()).toBe(base.times.Fajr.getTime());
      expect(r.times.Isha.getTime()).toBe(base.times.Isha.getTime());
      expect(r.provenance.Fajr).toBe('observed');
    }
  });

  it('AqrabAlBilad covers every day of the year at Longyearbyen', () => {
    let gaps = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(2026, 0, 1 + i);
      const { times } = calculatePrayerTimesDetailed(
        d, LONGYEARBYEN.lat, LONGYEARBYEN.lng, LONGYEARBYEN.tz, 'MWL', 'Shafi', 'AqrabAlBilad',
      );
      if (!isPrayerTimeValid(times.Fajr) || !isPrayerTimeValid(times.Isha)) gaps++;
    }
    expect(gaps).toBe(0);
  });

  it('works for a fixed-method overlay, not just the dynamic default', () => {
    // The engine never sees a fixed-method Fajr/Isha, so this is the path that would
    // silently keep failing if the app passed a rule into getTimesAll instead.
    const { times, provenance } = calculatePrayerTimesDetailed(
      POLAR_DAY, LONGYEARBYEN.lat, LONGYEARBYEN.lng, LONGYEARBYEN.tz, 'Makkah', 'Shafi', 'AqrabAlBilad',
    );
    expect(isPrayerTimeValid(times.Fajr)).toBe(true);
    expect(provenance.Fajr).toBe('AqrabAlBilad');
  });

  it('works for user-supplied custom angles', () => {
    const { times, provenance } = calculatePrayerTimesDetailed(
      POLAR_DAY, LONGYEARBYEN.lat, LONGYEARBYEN.lng, LONGYEARBYEN.tz, 'Custom', 'Shafi',
      'AqrabAlAyyam', { fajr: 18, isha: 17 },
    );
    expect(isPrayerTimeValid(times.Fajr)).toBe(true);
    expect(provenance.Fajr).toBe('AqrabAlAyyam');
  });
});
