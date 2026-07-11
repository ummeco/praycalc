/**
 * Purpose: Pure serializers from the mobile-side WatchSyncPayload domain object
 *   to each platform's exact wire shape (see types.ts header for why the two
 *   shapes differ). No native/platform imports — safe to unit test in plain Node.
 * Inputs: WatchSyncPayload.
 * Outputs: toIosWatchContext, toWearPrayerTimes, and the method/madhab/time
 *   mapping helpers they're built from (exported individually so callers/tests
 *   can exercise the mapping tables in isolation).
 * Constraints: mapMethodToIos/mapMadhabToIos are intentionally best-effort for
 *   app-side keys with no watch-side equivalent (e.g. mobile's 'DPC'/'UOIF'/
 *   'Custom' calc methods) — WatchSessionManager.swift's own documented fallback
 *   ("unknown method/madhab strings fall back to ISNA/Shafi at read time") makes
 *   an unmapped lowercase pass-through safe rather than silently wrong.
 * SPORT: praycalc packages/bridge-types serialize
 */

import type {
  WatchSyncPayload,
  IosWatchContextPayload,
  WearPrayerTimesPayload,
  BridgeMethod,
  BridgeMadhab,
} from './types.js';

/** Mobile CalcMethodKey values with a direct watchOS-contract equivalent. */
const METHOD_TO_IOS: Partial<Record<string, BridgeMethod>> = {
  MWL: 'mwl',
  ISNA: 'isna',
  Egypt: 'egypt',
  Makkah: 'makkah',
  Karachi: 'karachi',
};

/**
 * Map the app's calc-method key to watchOS's documented enum. DPC/UOIF/Custom
 * (and anything else unrecognized) have no watch-side equivalent — pass through
 * lowercased so the watch's own fallback-to-ISNA behavior applies.
 */
export function mapMethodToIos(method: string): BridgeMethod {
  return METHOD_TO_IOS[method] ?? (method.toLowerCase() as BridgeMethod);
}

/** Mobile Madhab values with a direct watchOS-contract equivalent. */
const MADHAB_TO_IOS: Partial<Record<string, BridgeMadhab>> = {
  Shafi: 'shafi',
  Hanafi: 'hanafi',
};

/** Map the app's madhab value to watchOS's documented enum (same fallback rationale). */
export function mapMadhabToIos(madhab: string): BridgeMadhab {
  return MADHAB_TO_IOS[madhab] ?? (madhab.toLowerCase() as BridgeMadhab);
}

/** "HH:mm" 24h, zero-padded — the only format wearOS's LocalTime.parse accepts. */
export function formatHHmm(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** Build the exact dictionary WatchSessionManager.swift's applyContext expects. */
export function toIosWatchContext(payload: WatchSyncPayload): IosWatchContextPayload {
  return {
    latitude: payload.latitude,
    longitude: payload.longitude,
    city: payload.city,
    method: mapMethodToIos(payload.method),
    madhab: mapMadhabToIos(payload.madhab),
    ts: Math.floor(payload.generatedAt.getTime() / 1000),
  };
}

/** Build the exact DataMap PrayerDataListenerService.kt expects at "/prayer_times". */
export function toWearPrayerTimes(payload: WatchSyncPayload): WearPrayerTimesPayload {
  return {
    location: payload.city,
    fajr: formatHHmm(payload.prayerTimes.fajr),
    dhuhr: formatHHmm(payload.prayerTimes.dhuhr),
    asr: formatHHmm(payload.prayerTimes.asr),
    maghrib: formatHHmm(payload.prayerTimes.maghrib),
    isha: formatHHmm(payload.prayerTimes.isha),
  };
}
