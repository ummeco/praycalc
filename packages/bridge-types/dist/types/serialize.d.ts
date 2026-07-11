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
import type { WatchSyncPayload, IosWatchContextPayload, WearPrayerTimesPayload, BridgeMethod, BridgeMadhab } from './types.js';
/**
 * Map the app's calc-method key to watchOS's documented enum. DPC/UOIF/Custom
 * (and anything else unrecognized) have no watch-side equivalent — pass through
 * lowercased so the watch's own fallback-to-ISNA behavior applies.
 */
export declare function mapMethodToIos(method: string): BridgeMethod;
/** Map the app's madhab value to watchOS's documented enum (same fallback rationale). */
export declare function mapMadhabToIos(madhab: string): BridgeMadhab;
/** "HH:mm" 24h, zero-padded — the only format wearOS's LocalTime.parse accepts. */
export declare function formatHHmm(date: Date): string;
/** Build the exact dictionary WatchSessionManager.swift's applyContext expects. */
export declare function toIosWatchContext(payload: WatchSyncPayload): IosWatchContextPayload;
/** Build the exact DataMap PrayerDataListenerService.kt expects at "/prayer_times". */
export declare function toWearPrayerTimes(payload: WatchSyncPayload): WearPrayerTimesPayload;
//# sourceMappingURL=serialize.d.ts.map