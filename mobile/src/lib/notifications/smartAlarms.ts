/**
 * Purpose: Compute + schedule Suhoor/Tahajjud smart-alarm notifications. Split out
 *   of PrayerNotificationService.ts to keep each file under the 300-line cap.
 * Inputs: useSettingsStore settings snapshot, computed night times (nightTimes.ts).
 * Outputs: SmartAlarm type, computeSmartAlarms, scheduleSmartAlarms.
 * Constraints: scheduleSmartAlarms is called from schedulePrayerNotifications AFTER
 *   cancelAllScheduledNotificationsAsync, so it only adds rows to the fresh window.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-notification-service
 */

import * as Notifications from 'expo-notifications';
import { computeNightTimes, suhoorTime, tahajjudTime, type NightTimes } from './nightTimes';
import { t } from '../../i18n';
import { NOTIFICATION_DAYS_AHEAD, SMART_ALARM_CHANNEL_ID } from '../../constants';
import { computeDayTimes, activeLocation, type NotificationSettings } from './dayTimes';
import type { CityCoords } from '../../types/prayer';

/** A computed smart-alarm trigger. `kind` selects title/body copy at schedule time. */
export interface SmartAlarm {
  kind: 'suhoor' | 'tahajjud';
  triggerTimestamp: number;
}

/**
 * Compute Suhoor and Tahajjud trigger instants for the next NOTIFICATION_DAYS_AHEAD
 * nights, honouring the user's toggles. Each night spans Maghrib(day D) → Fajr(day
 * D+1); the last-third / suhoor times are derived from that span (see nightTimes.ts).
 * Pure aside from reading settings — exported so it can be unit-tested without
 * touching expo-notifications. Only returns alarms strictly in the future.
 */
export function computeSmartAlarms(
  settings: NotificationSettings,
  location: CityCoords,
  now: Date,
): SmartAlarm[] {
  const alarms: SmartAlarm[] = [];
  if (!settings.suhoorAlarmEnabled && !settings.tahajjudAlarmEnabled) return alarms;

  for (let dayOffset = 0; dayOffset < NOTIFICATION_DAYS_AHEAD; dayOffset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);

    const maghrib = computeDayTimes(settings, location, day).Maghrib;
    const fajrNext = computeDayTimes(settings, location, next).Fajr;
    if (!(maghrib instanceof Date) || !(fajrNext instanceof Date)) continue;
    if (Number.isNaN(maghrib.getTime()) || Number.isNaN(fajrNext.getTime())) continue;

    const night: NightTimes = computeNightTimes(maghrib, fajrNext);

    if (settings.suhoorAlarmEnabled) {
      const trigger = suhoorTime(fajrNext, settings.suhoorMinutesBeforeFajr);
      if (trigger.getTime() > now.getTime()) alarms.push({ kind: 'suhoor', triggerTimestamp: trigger.getTime() });
    }
    if (settings.tahajjudAlarmEnabled) {
      const trigger = tahajjudTime(night, settings.tahajjudMode, settings.tahajjudCustomTime);
      if (trigger.getTime() > now.getTime()) alarms.push({ kind: 'tahajjud', triggerTimestamp: trigger.getTime() });
    }
  }
  return alarms;
}

/**
 * Schedule the Suhoor / Tahajjud smart alarms. Called from schedulePrayerNotifications
 * AFTER cancelAllScheduledNotificationsAsync, so it just adds rows to the fresh window.
 */
export async function scheduleSmartAlarms(settings: NotificationSettings): Promise<void> {
  const location = activeLocation(settings);
  if (!location) return;
  const alarms = computeSmartAlarms(settings, location, new Date());
  for (const alarm of alarms) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t(alarm.kind === 'suhoor' ? 'notifications.suhoorTitle' : 'notifications.tahajjudTitle'),
        body: t(alarm.kind === 'suhoor' ? 'notifications.suhoorBody' : 'notifications.tahajjudBody'),
        sound: 'default',
        data: { smartAlarm: alarm.kind },
        ...(process.env['EXPO_PUBLIC_PLATFORM'] !== 'android' && {
          interruptionLevel: 'timeSensitive' as const,
        }),
      },
      trigger: { date: new Date(alarm.triggerTimestamp), channelId: SMART_ALARM_CHANNEL_ID },
    });
  }
}
