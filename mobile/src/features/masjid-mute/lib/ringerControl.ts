/**
 * Purpose: Cross-platform "mute the phone near a masjid" action. Android CAN change
 *   the system ringer mode programmatically (via react-native-volume-manager, a thin
 *   JS wrapper over android.media.AudioManager — no custom native module needed,
 *   works with Expo config plugins / no manual native code). iOS explicitly does NOT
 *   allow any app to change the mute switch or ringer volume for privacy/consistency
 *   reasons (Apple HIG + long-standing App Review policy) — so on iOS this module is
 *   a graceful no-op for the mute action itself and instead the caller (useGeofenceSync)
 *   fires a high-priority local notification asking the user to silence manually.
 * Inputs: none (reads Platform.OS internally).
 * Outputs: muteDevice(), restoreDevice(previousMode), getCurrentRingerMode() — all
 *   Android-effective / iOS no-op-returning-null, so callers never need their own
 *   Platform.OS branching for the mute/restore calls themselves.
 * Constraints: Every function must resolve (never throw) on unsupported platforms —
 *   a ringer-control failure must never crash geofence enforcement. Requires
 *   android.permission.MODIFY_AUDIO_SETTINGS conceptually, but VolumeManager's
 *   setRingerMode uses AudioManager.setRingerMode, which historically also required
 *   Notification Policy Access on Android 6+ for silent/vibrate transitions on some
 *   OEMs — checkDndAccess()/requestDndAccess() are exposed so the UI can request it.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-masjid-mute-ringer-control
 */

import { Platform } from 'react-native';
import type { CapturedRingerMode } from '../store/useMuteStore';

/** Lazily require react-native-volume-manager — Android only, so iOS/test environments
 *  that never call these functions never pay the native-module load cost. Uses
 *  require() rather than dynamic import() — this project's Babel/CJS Jest transform
 *  does not reliably support dynamic import() (see reporter.test.ts), and require()
 *  gives the same lazy-load behavior at runtime (Metro/Hermes also resolve it eagerly
 *  into the bundle either way, so there is no real bundle-size tradeoff here). */
function getVolumeManager() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('react-native-volume-manager') as typeof import('react-native-volume-manager');
  return { VolumeManager: mod.VolumeManager, RINGER_MODE: mod.RINGER_MODE };
}

const RINGER_MODE_TO_STRING: Record<number, CapturedRingerMode> = {
  0: 'silent',
  1: 'vibrate',
  2: 'normal',
};

/** Current Android ringer mode, or null on iOS / on any read failure. */
export async function getCurrentRingerMode(): Promise<CapturedRingerMode | null> {
  if (Platform.OS !== 'android') return null;
  try {
    const { VolumeManager } = getVolumeManager();
    const mode = await VolumeManager.getRingerMode();
    return mode === undefined ? null : RINGER_MODE_TO_STRING[mode] ?? null;
  } catch {
    return null;
  }
}

/**
 * Silences the device (vibrate mode — preserves haptic feedback for calls/alarms
 * rather than fully silent, matching how most users configure "masjid mode"
 * manually). Android only; resolves to false (no-op) on iOS or on failure.
 * Returns the ringer mode that was active BEFORE muting, so the caller can restore
 * it later — this is also stored in useMuteStore.previousRingerMode.
 */
export async function muteDevice(): Promise<{ muted: boolean; previousMode: CapturedRingerMode | null }> {
  if (Platform.OS !== 'android') return { muted: false, previousMode: null };
  try {
    const { VolumeManager, RINGER_MODE } = getVolumeManager();
    const currentMode = await VolumeManager.getRingerMode();
    const previousMode = currentMode === undefined ? null : RINGER_MODE_TO_STRING[currentMode] ?? null;
    await VolumeManager.setRingerMode(RINGER_MODE.vibrate);
    return { muted: true, previousMode };
  } catch {
    return { muted: false, previousMode: null };
  }
}

/** Restores a previously-captured ringer mode. Android only; no-op on iOS/null input/failure. */
export async function restoreDevice(previousMode: CapturedRingerMode | null): Promise<boolean> {
  if (Platform.OS !== 'android' || !previousMode) return false;
  try {
    const { VolumeManager, RINGER_MODE } = getVolumeManager();
    await VolumeManager.setRingerMode(RINGER_MODE[previousMode]);
    return true;
  } catch {
    return false;
  }
}
