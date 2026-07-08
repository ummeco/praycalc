/**
 * Purpose: Thin, import-safe accessor for the PrayLiveActivity native module. Resolves
 *   the module off the global `expo.modules` proxy (the same pattern @bacons/apple-targets
 *   uses for ExtensionStorage) so this file never hard-imports native code — off-device
 *   (Jest / web / Android) the module is absent and every method is a no-op stub. This
 *   keeps `src/lib/live-activity/` fully unit-testable and lets the higher-level module
 *   call ActivityKit without platform guards leaking everywhere.
 * Inputs: none (reads globalThis.expo.modules.PrayLiveActivity when present).
 * Outputs: getLiveActivityModule() -> a NativeLiveActivityModule (real or stub).
 * Constraints: iOS-only at runtime. The method shapes MUST match
 *   modules/pray-live-activity/ios/PrayLiveActivityModule.swift. Async methods return
 *   Promises; the stub resolves them so callers can always `await` uniformly.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-live-activity-native
 */

/** Mirrors the Swift PrayLiveActivityModule definition (see that file's header). */
export interface NativeLiveActivityModule {
  isSupported(): boolean;
  start(
    prayerName: string,
    prayerTimestamp: number,
    prayerTimeLabel: string,
    cityName: string | null,
  ): Promise<string | null>;
  update(
    activityId: string,
    prayerName: string,
    prayerTimestamp: number,
    prayerTimeLabel: string,
  ): Promise<boolean>;
  end(activityId: string): Promise<void>;
  endAll(): Promise<void>;
  isRunning(activityId: string): boolean;
}

/** No-op stub used wherever the native module is unavailable (off-device / non-iOS). */
const STUB: NativeLiveActivityModule = {
  isSupported: () => false,
  start: async () => null,
  update: async () => false,
  end: async () => {},
  endAll: async () => {},
  isRunning: () => false,
};

/**
 * Resolve the autolinked native module from the expo global proxy, falling back to the
 * stub. Read lazily (not at import time) so a test can inject a mock on globalThis.expo
 * before the first call.
 */
export function getLiveActivityModule(): NativeLiveActivityModule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (globalThis as any)?.expo?.modules?.PrayLiveActivity as
    | Partial<NativeLiveActivityModule>
    | undefined;
  if (!mod) return STUB;
  // Merge onto the stub so a partially-shaped native module can never throw on a missing
  // method (defensive against version skew between the JS and native layers).
  return { ...STUB, ...mod };
}
