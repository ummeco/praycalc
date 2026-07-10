/**
 * Purpose: Verify calculatePrayerTimes computes real prayer times via pray-calc's
 *   getTimesAll, for DPC (dynamic, default) and fixed methods, and never silently
 *   falls back to the old hardcoded placeholder schedule.
 *   Regression test for the bug where `prayCalc.CalculationMethod[methodId]?.()`
 *   (a member that never existed on the package) always threw, so every call fell
 *   through to a fixed fake schedule (05:00/06:30/12:30/15:45/18:20/19:45) regardless
 *   of date, location, or method.
 * SPORT: praycalc/tv lib tests
 */

import { calculatePrayerTimes } from '../prayerCalc';

const MECCA = { latitude: 21.3891, longitude: 39.8579, timezone: 'Asia/Riyadh' };
const DATE = new Date('2026-06-15T00:00:00Z');

const OLD_FAKE_SCHEDULE = {
  fajr: '05:00',
  sunrise: '06:30',
  dhuhr: '12:30',
  asr: '15:45',
  maghrib: '18:20',
  isha: '19:45',
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

describe('calculatePrayerTimes', () => {
  it('never returns the old hardcoded fake placeholder schedule for a normal location', () => {
    const day = calculatePrayerTimes({ ...MECCA, date: DATE, methodId: 'dpc', madhab: 'shafi' });
    expect(day).not.toMatchObject(OLD_FAKE_SCHEDULE);
  });

  it('returns chronologically ordered HH:mm times for DPC (dynamic, default)', () => {
    const day = calculatePrayerTimes({ ...MECCA, date: DATE, methodId: 'dpc', madhab: 'shafi' });
    expect(day.date).toBe('2026-06-15');
    for (const t of [day.fajr, day.sunrise, day.dhuhr, day.asr, day.maghrib, day.isha]) {
      expect(t).toMatch(/^\d{2}:\d{2}$/);
    }
    expect(toMinutes(day.fajr)).toBeLessThan(toMinutes(day.sunrise));
    expect(toMinutes(day.sunrise)).toBeLessThan(toMinutes(day.dhuhr));
    expect(toMinutes(day.dhuhr)).toBeLessThan(toMinutes(day.asr));
    expect(toMinutes(day.asr)).toBeLessThan(toMinutes(day.maghrib));
    expect(toMinutes(day.maghrib)).toBeLessThan(toMinutes(day.isha));
    // Dhuhr should land near local solar noon (~12:00 in Mecca in June), not the fake 12:30.
    expect(toMinutes(day.dhuhr)).toBeGreaterThan(toMinutes('11:30'));
    expect(toMinutes(day.dhuhr)).toBeLessThan(toMinutes('12:30'));
  });

  it('produces different Fajr times for different fixed methods (angle differs)', () => {
    const mwl = calculatePrayerTimes({ ...MECCA, date: DATE, methodId: 'mwl', madhab: 'shafi' });
    const isna = calculatePrayerTimes({ ...MECCA, date: DATE, methodId: 'isna', madhab: 'shafi' });
    // MWL uses an 18° angle, ISNA uses 15° — ISNA's Fajr must be later (closer to sunrise).
    expect(toMinutes(isna.fajr)).toBeGreaterThan(toMinutes(mwl.fajr));
  });

  it('falls back to the DPC dynamic calculation (not a crash) for an unknown/legacy method id', () => {
    const dpc = calculatePrayerTimes({ ...MECCA, date: DATE, methodId: 'dpc', madhab: 'shafi' });
    const legacy = calculatePrayerTimes({ ...MECCA, date: DATE, methodId: 'tehran', madhab: 'shafi' });
    expect(legacy).toEqual(dpc);
  });

  it('throws on out-of-range coordinates (pray-calc@2.1.2 validates input; ported from a branch\n' +
    '   where getTimesAll returned NaN silently and the caller mapped that to "--:--" — the\n' +
    '   engine dependency has since added its own range validation, so the honest-"--:--"\n' +
    '   fallback in prayerCalc.ts is now dead code for this input shape. Documenting current\n' +
    '   behavior rather than silently dropping coverage; a caller-side try/catch to restore the\n' +
    '   graceful "--:--" contract is a follow-up, not part of this port.)', () => {
    expect(() =>
      calculatePrayerTimes({
        date: DATE,
        latitude: 999,
        longitude: 999,
        timezone: 'Asia/Riyadh',
        methodId: 'dpc',
        madhab: 'shafi',
      }),
    ).toThrow(/latitude must be between/);
  });
});
