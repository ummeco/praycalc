/**
 * Purpose: Thin, import-safe accessor for the WatchBridge native module (iOS).
 *   Resolves the module off the global `expo.modules` proxy — the same pattern
 *   `src/lib/live-activity/nativeModule.ts` already uses for PrayLiveActivity —
 *   so this file never hard-imports native code — off-device (Jest / web /
 *   Android) the module is absent and every method is a no-op stub. Keeps
 *   `watchSync.ts` fully unit-testable without a real WatchConnectivity session.
 * Inputs: none (reads globalThis.expo.modules.WatchBridge when present).
 * Outputs: getWatchBridgeModule() -> a NativeWatchBridgeModule (real or stub).
 * Constraints: iOS-only at runtime. The method shapes MUST match
 *   modules/watch-bridge/ios/WatchBridgeModule.swift.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-watch-bridge
 */

import type { IosWatchContextPayload } from '@praycalc/bridge-types';

/** Mirrors the Swift WatchBridgeModule definition (see that file's header). */
export interface NativeWatchBridgeModule {
  isSupported(): boolean;
  activate(): void;
  isPaired(): boolean;
  isWatchAppInstalled(): boolean;
  updateApplicationContext(payload: IosWatchContextPayload): boolean;
}

/** No-op stub used wherever the native module is unavailable (off-device / non-iOS). */
const STUB: NativeWatchBridgeModule = {
  isSupported: () => false,
  activate: () => {},
  isPaired: () => false,
  isWatchAppInstalled: () => false,
  updateApplicationContext: () => false,
};

/**
 * Resolve the autolinked native module from the expo global proxy, falling back to the
 * stub. Read lazily (not at import time) so a test can inject a mock on globalThis.expo
 * before the first call.
 */
export function getWatchBridgeModule(): NativeWatchBridgeModule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (globalThis as any)?.expo?.modules?.WatchBridge as
    | Partial<NativeWatchBridgeModule>
    | undefined;
  if (!mod) return STUB;
  // Merge onto the stub so a partially-shaped native module can never throw on a missing
  // method (defensive against version skew between the JS and native layers).
  return { ...STUB, ...mod };
}
