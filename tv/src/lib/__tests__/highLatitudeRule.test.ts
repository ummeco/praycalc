/**
 * Purpose: the TV app previously had no high-latitude rule at all, so a screen at
 *   Longyearbyen showed "--:--" for Fajr and Isha with no way to change it. The rule now
 *   comes from settings and defaults to 'none' — substituting nothing rather than picking
 *   a juristic position on the viewer's behalf.
 * Constraints: only aqrabAlBilad/aqrabAlAyyam reach inside the polar circles; a rule must
 *   never move a time the sun actually provides.
 */

import { calculatePrayerTimes } from '../prayerCalc';
import type { HighLatRule } from '../../types';

const LONGYEARBYEN = { latitude: 78.22334, longitude: 15.64689, timezone: '1' };
const POLAR_DAY = new Date('2026-06-21T12:00:00Z');
const NEAREST: HighLatRule[] = ['aqrabAlBilad', 'aqrabAlAyyam'];
const NIGHT: HighLatRule[] = ['middleOfNight', 'angleBased', 'oneSeventh'];

const call = (rule?: HighLatRule) =>
  calculatePrayerTimes({
    date: POLAR_DAY, ...LONGYEARBYEN, methodId: 'mwl', madhab: 'shafi',
    ...(rule ? { highLatitudeRule: rule } : {}),
  });

describe('TV high-latitude rule', () => {
  it('defaults to substituting nothing', () => {
    const d = call();
    expect(d.fajr).toBe('--:--');
    expect(d.isha).toBe('--:--');
  });

  it.each(NEAREST)('%s supplies Fajr and Isha during polar day', (rule) => {
    const d = call(rule);
    expect(d.fajr).toMatch(/^\d{2}:\d{2}$/);
    expect(d.isha).toMatch(/^\d{2}:\d{2}$/);
  });

  it.each(NIGHT)('%s declines honestly during polar day', (rule) => {
    const d = call(rule);
    expect(d.fajr).toBe('--:--');
    expect(d.isha).toBe('--:--');
  });

  it('Dhuhr and Asr are real under every rule', () => {
    for (const rule of [...NEAREST, ...NIGHT, 'none' as HighLatRule]) {
      const d = call(rule);
      expect(d.dhuhr).toMatch(/^\d{2}:\d{2}$/);
      expect(d.asr).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('no rule changes a time the sun provides (London in January)', () => {
    const base = calculatePrayerTimes({
      date: new Date('2026-01-15T12:00:00Z'), latitude: 51.5074, longitude: -0.1278,
      timezone: '0', methodId: 'mwl', madhab: 'shafi',
    });
    for (const rule of [...NEAREST, ...NIGHT, 'none' as HighLatRule]) {
      const r = calculatePrayerTimes({
        date: new Date('2026-01-15T12:00:00Z'), latitude: 51.5074, longitude: -0.1278,
        timezone: '0', methodId: 'mwl', madhab: 'shafi', highLatitudeRule: rule,
      });
      expect(r.fajr).toBe(base.fajr);
      expect(r.isha).toBe(base.isha);
    }
  });
});
