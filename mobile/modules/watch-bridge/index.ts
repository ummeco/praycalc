/**
 * Purpose: Public JS surface for the WatchBridge Expo native module (iOS-only —
 *   see expo-module.config.json). Callers should generally prefer
 *   `mobile/src/lib/watch/nativeWatchBridge.ts`'s `getWatchBridgeModule()`, which
 *   adds an off-device/non-iOS stub for testability; this file exists so the
 *   module is directly importable per the standard Expo local-module scaffold
 *   shape (expo-module.config.json + ios/ + index.ts).
 * Outputs: default export — the native module instance (throws if the native
 *   code isn't linked, e.g. in Expo Go without a dev build).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-watch-bridge-native
 */

import { requireNativeModule } from 'expo-modules-core';
import type { IosWatchContextPayload } from '@praycalc/bridge-types';

export interface WatchBridgeNativeModule {
  isSupported(): boolean;
  activate(): void;
  isPaired(): boolean;
  isWatchAppInstalled(): boolean;
  updateApplicationContext(payload: IosWatchContextPayload): boolean;
}

export default requireNativeModule<WatchBridgeNativeModule>('WatchBridge');
