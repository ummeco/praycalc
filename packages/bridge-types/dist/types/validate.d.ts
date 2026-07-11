/**
 * Purpose: Defensive validation for the two platform wire payloads, run
 *   client-side (mobile) before crossing the JS -> native bridge so a malformed
 *   payload never reaches WCSession/DataClient. Mirrors the receivers' own
 *   guards where they exist (e.g. WatchSessionManager.applyContext rejects an
 *   all-zero lat/lng).
 * Inputs: IosWatchContextPayload | WearPrayerTimesPayload.
 * Outputs: isValidIosWatchContext, isValidWearPrayerTimesPayload.
 * Constraints: Pure, zero dependencies. Kept intentionally strict — false
 *   negatives (skipping a send) are always safer than pushing a payload a
 *   receiver's parser cannot decode.
 * SPORT: praycalc packages/bridge-types validate
 */
import type { IosWatchContextPayload, WearPrayerTimesPayload } from './types.js';
/**
 * Mirrors WatchSessionManager.applyContext's own guard: a coordinate of exactly
 * (0, 0) is treated as "no real location" and rejected, so a bad push can never
 * silently overwrite a real stored location with Null Island.
 */
export declare function isValidIosWatchContext(value: IosWatchContextPayload): boolean;
/** Every prayer time must parse as a valid 24h "HH:mm" string (LocalTime.parse's own constraint). */
export declare function isValidWearPrayerTimesPayload(value: WearPrayerTimesPayload): boolean;
//# sourceMappingURL=validate.d.ts.map