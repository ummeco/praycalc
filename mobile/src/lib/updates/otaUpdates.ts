/**
 * Purpose: Seamless OTA (over-the-air) JS/asset update flow via expo-updates.
 *   app.config.js already sets `checkAutomatically: "ON_LOAD"`, which covers
 *   cold start and JS reloads. This module covers the gap: a long-lived
 *   foreground session that never reloads never re-checks on its own. On every
 *   app-foreground transition it checks for + silently downloads a new update
 *   in the background so it is ready and applies automatically on the user's
 *   NEXT natural app launch — no forced reload, no interruption, no UI.
 * Inputs: expo-updates native module state (Updates.isEnabled, channel, manifest).
 * Outputs: initOtaUpdates() side-effect (AppState subscription + immediate
 *   check); returns an unsubscribe function for cleanup.
 * Constraints:
 *   - MUST no-op in __DEV__ and whenever Updates.isEnabled is false (Expo Go,
 *     simulator/dev-client builds, or updates disabled in app.config.js) —
 *     calling the native module in those environments throws.
 *   - MUST never throw out of this module — a failed update check/fetch
 *     (offline, server error, stale channel) must never crash or block the app;
 *     every native call is wrapped and logged only in __DEV__.
 *   - Deliberately does NOT call Updates.reloadAsync() — applying immediately
 *     mid-session would yank the user out of whatever they're doing. Fetched
 *     updates apply on the next cold start (Expo's default behavior), which is
 *     the "seamless" half of the pattern: update ships in the background, user
 *     never sees a prompt or a jarring reload.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-ota-updates
 */

import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Check for a pending EAS Update and silently fetch it if one exists.
 * Safe to call as often as needed — Updates.checkForUpdateAsync() is a
 * lightweight manifest HEAD-style request, not a full bundle download; the
 * bundle itself is only pulled by fetchUpdateAsync() when an update exists.
 *
 * No-ops (never throws) when:
 * - running in __DEV__ (Metro/dev-client — there is no published update channel)
 * - Updates.isEnabled is false (Expo Go, or updates disabled in config)
 */
export async function checkAndFetchUpdate(): Promise<void> {
  if (__DEV__ || !Updates.isEnabled) return;

  try {
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) return;

    await Updates.fetchUpdateAsync();
    // Intentionally no reloadAsync() here — see module Constraints. The
    // fetched update is now cached and Expo will boot it automatically on
    // the next cold start.
  } catch (error) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[OTA] update check/fetch failed (non-fatal):', error);
    }
    // Never rethrow — a failed OTA check must never affect the running app.
  }
}

/**
 * Wire the seamless OTA flow into the app lifecycle:
 * - runs one check immediately on mount (covers the case where
 *   `checkAutomatically: "ON_LOAD"` already resolved before this hook could
 *   observe it, and covers dev-client/manual-reload edge cases)
 * - re-checks every time the app returns to the foreground, so a session left
 *   open for days still eventually picks up new JS without the user ever
 *   force-quitting or reinstalling.
 *
 * Call once from the app root (see src/app/_layout.tsx). No-op in __DEV__.
 */
export function initOtaUpdates(): () => void {
  if (__DEV__ || !Updates.isEnabled) {
    return () => undefined;
  }

  void checkAndFetchUpdate();

  function handleAppStateChange(nextState: AppStateStatus): void {
    if (nextState === 'active') {
      void checkAndFetchUpdate();
    }
  }

  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => subscription.remove();
}

/**
 * React hook wrapper around initOtaUpdates() for use directly in the root
 * layout component — mirrors the useDeepLinkRouting()/useAdhanOnNotificationTap()
 * pattern already used in src/app/_layout.tsx.
 */
export function useOtaUpdates(): void {
  useEffect(() => {
    const unsubscribe = initOtaUpdates();
    return unsubscribe;
  }, []);
}
