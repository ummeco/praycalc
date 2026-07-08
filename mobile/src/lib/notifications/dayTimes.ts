/**
 * Purpose: Shared day-time computation helpers for the prayer-notification
 *   scheduler and the smart-alarm (Suhoor/Tahajjud) calculator, so both honour the
 *   exact same method/madhab/high-lat-rule/custom-angle/minute-adjustment settings.
 *   Split out of PrayerNotificationService.ts to keep each file under the
 *   300-line cap.
 * Inputs: useSettingsStore (single source of truth), pray-calc engine.
 * Outputs: computeDayTimes, activeLocation, NotificationSettings type.
 * Constraints: pure functions aside from reading the caller-supplied settings
 *   snapshot — no direct store subscription.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-notification-service
 */

import { calculatePrayerTimes } from '../prayer-calc';
import { resolveTimezoneOffset } from '../timezone';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
import type { CityCoords } from '../../types/prayer';
import type { CalcMethodKey } from '../../constants/methods';

/** Settings shape used by the time calculators (subset of the store). */
export type NotificationSettings = ReturnType<typeof useSettingsStore.getState>;

/**
 * Compute prayer times for one calendar day at the active location. Shared by the
 * prayer-notification loop and the smart-alarm (Suhoor/Tahajjud) computation so both
 * honour the exact same method/madhab/high-lat/custom-angle/minute-adjustment settings.
 */
export function computeDayTimes(settings: NotificationSettings, location: CityCoords, date: Date) {
  const customAngles = settings.method === 'Custom'
    ? { fajr: settings.customFajrAngle, isha: settings.customIshaAngle }
    : undefined;
  return calculatePrayerTimes(
    date,
    location.latitude,
    location.longitude,
    resolveTimezoneOffset(location.timezone, date),
    settings.method as CalcMethodKey,
    settings.madhab,
    settings.highLatRule,
    customAngles,
    settings.prayerMinuteAdjustments,
  );
}

/** The location calculations should use — travel city while musafir mode is on, else home. */
export function activeLocation(settings: NotificationSettings): CityCoords | null {
  return settings.musafirMode && settings.travelLocation ? settings.travelLocation : settings.location;
}
