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

/** "HH:mm", 24h, zero-padded — same constraint LocalTime.parse enforces watch-side. */
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Mirrors WatchSessionManager.applyContext's own guard: a coordinate of exactly
 * (0, 0) is treated as "no real location" and rejected, so a bad push can never
 * silently overwrite a real stored location with Null Island.
 */
export function isValidIosWatchContext(value: IosWatchContextPayload): boolean {
  return (
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude) &&
    (value.latitude !== 0 || value.longitude !== 0) &&
    typeof value.city === 'string' &&
    typeof value.method === 'string' &&
    value.method.length > 0 &&
    typeof value.madhab === 'string' &&
    value.madhab.length > 0 &&
    Number.isFinite(value.ts)
  );
}

/** Every prayer time must parse as a valid 24h "HH:mm" string (LocalTime.parse's own constraint). */
export function isValidWearPrayerTimesPayload(value: WearPrayerTimesPayload): boolean {
  return (
    typeof value.location === 'string' &&
    HH_MM.test(value.fajr) &&
    HH_MM.test(value.dhuhr) &&
    HH_MM.test(value.asr) &&
    HH_MM.test(value.maghrib) &&
    HH_MM.test(value.isha)
  );
}
