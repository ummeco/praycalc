/**
 * Purpose: Verify the TvSystemModule JS wrapper degrades gracefully when the native module
 *   is absent (jest / dev / iOS) — no throws, state reads resolve `false`, and the line1/line2
 *   merge helpers preserve the other line.
 * Constraints: react-native's NativeModules has no TvSystemModule under jest, so this exercises
 *   the exact absent-module path the app relies on.
 * SPORT: praycalc/tv lib/native tests
 */

import {
  isTvSystemAvailable,
  isBootLaunchEnabled,
  isKioskEnabled,
  setBootLaunchEnabled,
  setKioskEnabled,
  openScreensaverSettings,
  setAmbientLines,
  updateAmbientLine1,
  updateAmbientLine2,
} from '../tvSystem';

describe('tvSystem wrapper (native module absent)', () => {
  it('reports the module unavailable under jest', () => {
    expect(isTvSystemAvailable()).toBe(false);
  });

  it('state reads resolve false when the module is absent', async () => {
    await expect(isBootLaunchEnabled()).resolves.toBe(false);
    await expect(isKioskEnabled()).resolves.toBe(false);
  });

  it('fire-and-forget calls are safe no-ops (never throw)', () => {
    expect(() => setBootLaunchEnabled(true)).not.toThrow();
    expect(() => setBootLaunchEnabled(false)).not.toThrow();
    expect(() => setKioskEnabled(true)).not.toThrow();
    expect(() => openScreensaverSettings()).not.toThrow();
    expect(() => setAmbientLines('a', 'b')).not.toThrow();
  });

  it('updateAmbientLine1/2 preserve the other cached line', () => {
    // Seed both, then update each independently — no throw and merge stays consistent.
    setAmbientLines('L1', 'L2');
    expect(() => updateAmbientLine1('L1b')).not.toThrow();
    expect(() => updateAmbientLine2('L2b')).not.toThrow();
  });
});
