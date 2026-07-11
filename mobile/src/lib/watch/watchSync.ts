/**
 * Purpose: Push the phone's current location + calc settings + today's prayer
 *   times to a paired watch, platform-forked: iOS gets a SETTINGS payload
 *   (WatchSessionManager.swift computes prayer times on-watch itself), Android
 *   gets a PRAYER-TIMES payload (PrayerDataListenerService.kt has no calc engine
 *   of its own to fall back to besides the phone push / its own JNI engine — see
 *   that file + @praycalc/bridge-types' types.ts header for why the two wire
 *   shapes differ). Throttled so a settings screen with live sliders doesn't
 *   spam WCSession/DataClient on every keystroke.
 * Inputs: useSettingsStore (method/madhab/location/musafirMode/travelLocation),
 *   the shared prayer-calc engine (via notifications/dayTimes.computeDayTimes),
 *   @praycalc/bridge-types (payload shape + per-platform serializers).
 * Outputs: syncPrayerDataToWatch() — call after any settings/schedule recompute.
 * Constraints: Best-effort only — never throws, never blocks the caller (matches
 *   the existing refreshHomeScreenWidget() convention in
 *   lib/notifications/widgetRefresh.ts). Skipped entirely when the native module
 *   is absent (Expo Go, non-mobile platforms, or the other OS's module) via the
 *   nativeWatchBridge/nativeWearBridge stubs. Throttle: skipped unless
 *   location/method/madhab changed since the last successful send, or
 *   MIN_RESEND_INTERVAL_MS has elapsed and the payload actually differs.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-watch-sync
 */

import { Platform } from 'react-native';
import type { WatchSyncPayload } from '@praycalc/bridge-types';
import { toIosWatchContext, toWearPrayerTimes } from '@praycalc/bridge-types';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
import { activeLocation, computeDayTimes } from '../notifications/dayTimes';
import { getWatchBridgeModule } from './nativeWatchBridge';
import { getWearBridgeModule } from './nativeWearBridge';

/** Minimum time between two sends of an otherwise-unchanged payload. */
const MIN_RESEND_INTERVAL_MS = 15 * 60 * 1000;

let lastSentPayload: WatchSyncPayload | null = null;
let lastSentAt = 0;

/** True when location or calc settings changed — always worth an immediate resend
 *  regardless of the throttle window (the user is actively waiting on this). */
function settingsChanged(prev: WatchSyncPayload | null, next: WatchSyncPayload): boolean {
  if (!prev) return true;
  return (
    prev.latitude !== next.latitude ||
    prev.longitude !== next.longitude ||
    prev.city !== next.city ||
    prev.method !== next.method ||
    prev.madhab !== next.madhab
  );
}

/** Cheap deep-equal for a small, flat-ish payload — avoids a redundant native call
 *  when nothing has actually changed since the last successful send. */
function payloadsEqual(a: WatchSyncPayload | null, b: WatchSyncPayload): boolean {
  if (!a) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Build today's WatchSyncPayload from the current settings store, or null when no
 * location is configured yet (mirrors PrayerNotificationService's own precedence:
 * travel location while musafir mode is on, else home).
 */
function buildPayload(): WatchSyncPayload | null {
  const settings = useSettingsStore.getState();
  const location = activeLocation(settings);
  if (!location) return null;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const times = computeDayTimes(settings, location, today);

  return {
    latitude: location.latitude,
    longitude: location.longitude,
    city: location.city,
    method: settings.method,
    madhab: settings.madhab,
    prayerTimes: {
      fajr: times.Fajr,
      dhuhr: times.Dhuhr,
      asr: times.Asr,
      maghrib: times.Maghrib,
      isha: times.Isha,
    },
    generatedAt: now,
  };
}

/**
 * Send the current settings/prayer-times payload to whichever watch platform is
 * paired. Safe to call as often as scheduling runs — throttling + the module
 * stubs make every call a cheap no-op when there is nothing new to send or no
 * watch bridge is available. Never throws.
 */
export async function syncPrayerDataToWatch(): Promise<void> {
  try {
    const payload = buildPayload();
    if (!payload) return;

    const mustSend = settingsChanged(lastSentPayload, payload);
    const withinThrottleWindow = Date.now() - lastSentAt < MIN_RESEND_INTERVAL_MS;
    if (!mustSend && (withinThrottleWindow || payloadsEqual(lastSentPayload, payload))) {
      return;
    }

    let sent = false;
    if (Platform.OS === 'ios') {
      const native = getWatchBridgeModule();
      if (native.isSupported()) {
        native.activate();
        sent = native.updateApplicationContext(toIosWatchContext(payload));
      }
    } else if (Platform.OS === 'android') {
      const native = getWearBridgeModule();
      if (native.isSupported()) {
        const wear = toWearPrayerTimes(payload);
        sent = await native.sendPrayerTimes(
          wear.location,
          wear.fajr,
          wear.dhuhr,
          wear.asr,
          wear.maghrib,
          wear.isha,
        );
      }
    }

    if (sent) {
      lastSentPayload = payload;
      lastSentAt = Date.now();
    }
  } catch {
    // Best-effort only — a watch-sync failure must never break prayer scheduling.
  }
}

/** Test-only reset of the module-level throttle state between test cases. */
export function __resetWatchSyncStateForTests(): void {
  lastSentPayload = null;
  lastSentAt = 0;
}
