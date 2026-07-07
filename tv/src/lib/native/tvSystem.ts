/**
 * Purpose: JS wrapper over the Android-TV native module `TvSystemModule` (boot launch, kiosk
 *   default-launcher, screensaver settings deep-link, ambient-dream text feed). Every method
 *   degrades to a safe no-op / benign default when the native module is absent (jest, dev, iOS,
 *   or a build without the module), so callers never need to guard on platform.
 * Inputs: booleans for toggles; two ambient text lines.
 * Outputs: void for fire-and-forget calls; Promise<boolean> for the state reads.
 * Constraints: no throwing on a missing module; isBoot/isKiosk resolve `false` when absent.
 *   Only the Android build ships the module — this wrapper is the single import point for it.
 * SPORT: praycalc/tv lib/native
 */

import { NativeModules } from 'react-native';

/** Shape of the classic RN native module (Android only). */
interface TvSystemNativeModule {
  setBootLaunchEnabled(enabled: boolean): void;
  isBootLaunchEnabled(): Promise<boolean>;
  setKioskEnabled(enabled: boolean): void;
  isKioskEnabled(): Promise<boolean>;
  openScreensaverSettings(): void;
  setAmbientLines(line1: string, line2: string): void;
}

/** The native module when present (Android TV), else null (jest / dev / iOS). */
const nativeModule: TvSystemNativeModule | null =
  (NativeModules as { TvSystemModule?: TvSystemNativeModule }).TvSystemModule ??
  null;

/** True only when the native Android-TV system module is linked into this build. */
export function isTvSystemAvailable(): boolean {
  return nativeModule !== null;
}

/** Enable/disable launch-on-boot (no-op when the module is absent). */
export function setBootLaunchEnabled(enabled: boolean): void {
  nativeModule?.setBootLaunchEnabled(enabled);
}

/** Current launch-on-boot state; resolves `false` when the module is absent. */
export async function isBootLaunchEnabled(): Promise<boolean> {
  if (!nativeModule) return false;
  try {
    return await nativeModule.isBootLaunchEnabled();
  } catch {
    return false;
  }
}

/** Enable/disable kiosk (default-launcher) mode; fires the home-chooser natively. */
export function setKioskEnabled(enabled: boolean): void {
  nativeModule?.setKioskEnabled(enabled);
}

/** Current kiosk state; resolves `false` when the module is absent. */
export async function isKioskEnabled(): Promise<boolean> {
  if (!nativeModule) return false;
  try {
    return await nativeModule.isKioskEnabled();
  } catch {
    return false;
  }
}

/** Deep-link to the system screensaver (dream) settings picker (no-op when absent). */
export function openScreensaverSettings(): void {
  nativeModule?.openScreensaverSettings();
}

/**
 * Push the two ambient-dream text lines to native SharedPreferences so the DreamService
 * shows fresh content next time the screensaver runs. No-op when the module is absent.
 */
export function setAmbientLines(line1: string, line2: string): void {
  lastLine1 = line1;
  lastLine2 = line2;
  nativeModule?.setAmbientLines(line1, line2);
}

// The two ambient lines are produced by two independent sources — line1 by the prayer
// countdown (DashboardScreen), line2 by the content rotation (ContentRotation). Native
// setAmbientLines overwrites both, so cache each and merge on every partial update.
let lastLine1 = '';
let lastLine2 = '';

/** Update only ambient line1 (next-prayer countdown), preserving the current line2. */
export function updateAmbientLine1(line1: string): void {
  setAmbientLines(line1, lastLine2);
}

/** Update only ambient line2 (rotating cited text), preserving the current line1. */
export function updateAmbientLine2(line2: string): void {
  setAmbientLines(lastLine1, line2);
}
