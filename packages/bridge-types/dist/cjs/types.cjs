"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEAR_PRAYER_TIMES_PATH = void 0;
/** Wearable Data Layer path the Android payload above must be put at — kept here
 *  (not hardcoded at each call site) since it is part of the wire contract. */
exports.WEAR_PRAYER_TIMES_PATH = '/prayer_times';
