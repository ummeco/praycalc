/**
 * Purpose: Public JS surface for the WearBridge Expo native module (Android-only —
 *   see expo-module.config.json). Callers should generally prefer
 *   `mobile/src/lib/watch/nativeWearBridge.ts`'s `getWearBridgeModule()`, which
 *   adds an off-device/non-Android stub for testability; this file exists so the
 *   module is directly importable per the standard Expo local-module scaffold
 *   shape (expo-module.config.json + android/ + index.ts).
 * Outputs: default export — the native module instance (throws if the native
 *   code isn't linked, e.g. in Expo Go without a dev build).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-wear-bridge-native
 */

import { requireNativeModule } from 'expo-modules-core';

export interface WearBridgeNativeModule {
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

export default requireNativeModule<WearBridgeNativeModule>('WearBridge');
