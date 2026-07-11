/**
 * Purpose: Thin, import-safe accessor for the WearBridge native module (Android).
 *   Same globalThis.expo.modules proxy pattern as nativeWatchBridge.ts — off-device
 *   (Jest / web / iOS) the module is absent and every method is a no-op stub, so
 *   `watchSync.ts` stays fully unit-testable without a real Wearable Data Layer.
 * Inputs: none (reads globalThis.expo.modules.WearBridge when present).
 * Outputs: getWearBridgeModule() -> a NativeWearBridgeModule (real or stub).
 * Constraints: Android-only at runtime. The method shapes MUST match
 *   modules/wear-bridge/android/.../WearBridgeModule.kt.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-wear-bridge
 */

/** Mirrors the Kotlin WearBridgeModule definition (see that file's header). */
export interface NativeWearBridgeModule {
  isSupported(): boolean;
  sendPrayerTimes(
    location: string,
    fajr: string,
    dhuhr: string,
    asr: string,
    maghrib: string,
    isha: string,
  ): Promise<boolean>;
}

/** No-op stub used wherever the native module is unavailable (off-device / non-Android). */
const STUB: NativeWearBridgeModule = {
  isSupported: () => false,
  sendPrayerTimes: async () => false,
};

/**
 * Resolve the autolinked native module from the expo global proxy, falling back to the
 * stub. Read lazily (not at import time) so a test can inject a mock on globalThis.expo
 * before the first call.
 */
export function getWearBridgeModule(): NativeWearBridgeModule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (globalThis as any)?.expo?.modules?.WearBridge as
    | Partial<NativeWearBridgeModule>
    | undefined;
  if (!mod) return STUB;
  // Merge onto the stub so a partially-shaped native module can never throw on a missing
  // method (defensive against version skew between the JS and native layers).
  return { ...STUB, ...mod };
}
