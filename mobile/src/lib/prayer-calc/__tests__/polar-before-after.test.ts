/**
 * Verification 2: the exact reported case, old app logic vs new, side by side.
 *
 * HISTORY: this file originally proved that the app's own guards turned a leaked engine
 * sentinel into a fabricated "09:00". That leak has since been fixed at its source
 * (nrel-spa 2.1.0), so the engine no longer emits a sentinel for the old logic to
 * mishandle and the original reproduction can no longer be staged from live engine
 * output. The sentinel is injected directly here instead, which keeps the app-side guard
 * under test — it is defense in depth for exactly the case where a caller resolves an
 * older engine through a caret range.
 */
import { getTimesAll } from 'pray-calc';
import { calculatePrayerTimes, sanitizeHours } from '../index';

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

  it('the app guard neutralises a sentinel even if an engine emits one', () => {
    // Injected rather than sourced from the engine: nrel-spa >= 2.1.0 no longer leaks it.
    const SENTINEL = -99999;
    const hoursToDateOld = (base: Date, hours: number): Date => {
      const d = new Date(base);
      if (!Number.isFinite(hours)) { d.setHours(0, 0, 0, 0); return d; }
      const w = ((hours % 24) + 24) % 24;
      const h = Math.floor(w); const rm = (w - h) * 60; const m = Math.floor(rm);
      d.setHours(h, m, Math.round((rm - m) * 60), 0);
      return d;
    };
    // What the old path did with it: a confident, entirely fabricated 09:00.
    const fabricated = hoursToDateOld(date, SENTINEL);
    expect(Number.isNaN(fabricated.getTime())).toBe(false);
    expect(fabricated.getHours()).toBe(9);

    // What the current sanitizer does with the same value.
    expect(sanitizeHours(SENTINEL)).toBeNaN();
    expect(sanitizeHours(-100001.38)).toBeNaN();
    expect(sanitizeHours(12.5)).toBe(12.5);
  });

  it('the sun-dependent prayers have no time, while Dhuhr survives', () => {
    const now = calculatePrayerTimes(date, lat, lng, tz, 'MWL');
    expect(Number.isNaN(now.Sunrise.getTime())).toBe(true);
    expect(Number.isNaN(now.Maghrib.getTime())).toBe(true);
    expect(Number.isNaN(now.Fajr.getTime())).toBe(true);
    // Solar transit happens every day at every latitude (nrel-spa 2.1.0), so Dhuhr is a
    // real time here even though the sun never rises.
    expect(Number.isNaN(now.Dhuhr.getTime())).toBe(false);
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
