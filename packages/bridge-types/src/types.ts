/**
 * Shared phone <-> watch/wear bridge types.
 *
 * Purpose: Single source of truth for the shapes crossing the two native data
 *   bridges (`mobile/modules/watch-bridge` for iOS, `mobile/modules/wear-bridge`
 *   for Android). The two platform payload shapes are DIFFERENT on purpose — they
 *   mirror the two independently-evolved receiver contracts documented in the
 *   native source, not a made-up unified schema:
 *     - iOS:  a SETTINGS bridge. WatchSessionManager.swift computes prayer times
 *             on-watch from location + calc method + madhab; the phone never
 *             sends prayer times to iOS. See that file's header comment
 *             ("Phone-side contract") for the exact dictionary shape this
 *             mirrors — latitude/longitude/city/method/madhab/ts.
 *     - Android: a PRAYER-TIMES bridge. PrayerDataListenerService.kt (wearos)
 *             only understands a location string + 5 pre-formatted "HH:mm"
 *             (24h, no timezone) time strings at Wearable Data Layer path
 *             "/prayer_times" — it does not receive method/madhab from the
 *             phone at all (the watch's own local settings own those).
 * Inputs: n/a (type-only + pure helpers module).
 * Outputs: WatchSyncPayload (the mobile-side domain object both serializers
 *   read from), IosWatchContextPayload, WearPrayerTimesPayload.
 * Constraints: Zero runtime dependencies. Field names/types in
 *   IosWatchContextPayload and WearPrayerTimesPayload MUST stay byte-for-byte
 *   compatible with the two native receivers above — do not add or rename a
 *   field here without updating the matching Swift/Kotlin decode.
 * SPORT: praycalc packages/bridge-types types
 */

/** watchOS's documented method enum (WatchSessionManager.swift). Unknown values fall
 *  back to ISNA on the receiver side, so a best-effort mapping is always safe. */
export type BridgeMethod = 'isna' | 'mwl' | 'egypt' | 'umm_al_qura' | 'makkah' | 'tehran' | 'karachi';

/** watchOS's documented madhab enum. Unknown values fall back to Shafi on the receiver side. */
export type BridgeMadhab = 'shafii' | 'shafi' | 'hanafi';

/** One day's worth of the 5 salah times (Sunrise excluded — matches
 *  PrayerDataListenerService.kt, which only reads fajr/dhuhr/asr/maghrib/isha). */
export interface BridgePrayerDayTimes {
  fajr: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

/**
 * The mobile-side domain object both platform serializers derive from. Carries
 * everything either receiver could need; `toIosWatchContext` and
 * `toWearPrayerTimes` each project out only the subset their platform's real
 * wire contract uses (see file header).
 */
export interface WatchSyncPayload {
  latitude: number;
  longitude: number;
  /** Display city label. Maps to iOS "city" and Android "location". */
  city: string;
  /** Raw app-side calc method key (e.g. mobile's CalcMethodKey: 'DPC' | 'MWL' | ...).
   *  iOS-only — mapped to BridgeMethod by toIosWatchContext. */
  method: string;
  /** Raw app-side madhab (e.g. mobile's Madhab: 'Shafi' | 'Hanafi'). iOS-only —
   *  mapped to BridgeMadhab by toIosWatchContext. */
  madhab: string;
  /** Today's prayer times — Android-only (formatted "HH:mm" per time by
   *  toWearPrayerTimes); iOS computes its own times on-watch and ignores this. */
  prayerTimes: BridgePrayerDayTimes;
  /** When this payload was built — becomes iOS's epoch-seconds "ts" field. */
  generatedAt: Date;
}

/** Exact dictionary shape `WatchSessionManager.applyContext` expects via
 *  WCSession.updateApplicationContext / sendMessage. */
export interface IosWatchContextPayload {
  latitude: number;
  longitude: number;
  city: string;
  method: BridgeMethod;
  madhab: BridgeMadhab;
  /** Epoch seconds (not milliseconds) — matches the Swift `Double` "ts" field. */
  ts: number;
}

/** Exact DataMap keys `PrayerDataListenerService.onDataChanged` reads at Wearable
 *  Data Layer path "/prayer_times". Every time field is a "HH:mm" 24h string —
 *  the ONLY format `LocalTime.parse(_, DateTimeFormatter.ofPattern("HH:mm"))` accepts. */
export interface WearPrayerTimesPayload {
  location: string;
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

/** Wearable Data Layer path the Android payload above must be put at — kept here
 *  (not hardcoded at each call site) since it is part of the wire contract. */
export const WEAR_PRAYER_TIMES_PATH = '/prayer_times';
