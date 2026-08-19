/** Verification 2: the exact reported case, old logic vs new, side by side. */
import { getTimesAll } from 'pray-calc';
import { calculatePrayerTimes } from '../index';

/** Verbatim copy of the pre-fix shipped logic, kept only to prove the delta. */
function oldLogic(date: Date, lat: number, lng: number, tz: number) {
  const raw = getTimesAll(date, lat, lng, tz, 0, undefined, undefined, false) as any;
  const hoursToDate = (base: Date, hours: number): Date => {
    const d = new Date(base);
    if (!Number.isFinite(hours)) { d.setHours(0, 0, 0, 0); return d; }
    const w = ((hours % 24) + 24) % 24;
    const h = Math.floor(w); const rm = (w - h) * 60; const m = Math.floor(rm);
    d.setHours(h, m, Math.round((rm - m) * 60), 0);
    return d;
  };
  const me = raw.Methods['MWL'];
  return {
    Sunrise: hoursToDate(date, raw.Sunrise),
    Maghrib: hoursToDate(date, raw.Maghrib),
    Dhuhr: hoursToDate(date, raw.Dhuhr),
    Fajr: hoursToDate(date, me?.[0] ?? raw.Fajr),
  };
}

describe('Verification 2 — the reported Longyearbyen case', () => {
  const date = new Date('2026-06-21T00:00:00');
  const [lat, lng, tz] = [78.22334, 15.64689, 1];

  it('old logic produced a real-looking time where none exists (documents the bug)', () => {
    const old = oldLogic(date, lat, lng, tz);
    expect(Number.isNaN(old.Sunrise.getTime())).toBe(false);
    expect(old.Sunrise.getHours()).toBe(9);
    expect(old.Maghrib.getHours()).toBe(9);
    // The tell: sunrise and sunset at the identical instant.
    expect(old.Sunrise.getTime()).toBe(old.Maghrib.getTime());
  });

  it('new logic produces no time at all for those prayers', () => {
    const now = calculatePrayerTimes(date, lat, lng, tz, 'MWL');
    expect(Number.isNaN(now.Sunrise.getTime())).toBe(true);
    expect(Number.isNaN(now.Maghrib.getTime())).toBe(true);
    expect(Number.isNaN(now.Dhuhr.getTime())).toBe(true);
    expect(Number.isNaN(now.Fajr.getTime())).toBe(true);
  });

  it('a normal location is byte-identical between old and new logic', () => {
    const d = new Date('2026-03-15T00:00:00');
    const old = oldLogic(d, 40.7128, -74.006, -4);
    const now = calculatePrayerTimes(d, 40.7128, -74.006, -4, 'MWL');
    expect(now.Sunrise.getTime()).toBe(old.Sunrise.getTime());
    expect(now.Maghrib.getTime()).toBe(old.Maghrib.getTime());
    expect(now.Dhuhr.getTime()).toBe(old.Dhuhr.getTime());
    expect(now.Fajr.getTime()).toBe(old.Fajr.getTime());
  });
});
