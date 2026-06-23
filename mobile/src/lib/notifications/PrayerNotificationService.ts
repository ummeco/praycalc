/**
 * Purpose: Schedule prayer-time notifications using expo-notifications + expo-task-manager.
 *   Background task reschedules next 3 days at midnight.
 * Inputs: PrayerTimes, UserSettings (method, location), NotificationSettings.
 * Outputs: PrayerNotificationService — Feature 15 of 20 (core notification logic).
 * Constraints: expo-notifications scheduleNotificationAsync for each prayer.
 *   SCHEDULE_EXACT_ALARM declared in app.json android.permissions.
 *   iOS: interruptionLevel 'timeSensitive' (requires entitlement — see PCI pci-praycalc-ios-critical-alerts).
 *   DnD bypass: Android alarm category; iOS time-sensitive.
 *   Max 64 scheduled notifications across iOS/Android.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-notification-service
 */

import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { calculatePrayerTimes } from '../prayer-calc';
import { mmkv } from '../storage/mmkv';
import { NOTIFICATION_DAYS_AHEAD, PRAYER_RESCHEDULE_TASK, NOTIFICATION_CHANNEL_ID } from '../../constants';
import type { PrayerName } from '../../types/prayer';

const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_DISPLAY: Record<PrayerName, string> = {
  Fajr: 'Fajr', Sunrise: 'Sunrise', Dhuhr: 'Dhuhr',
  Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha',
};

// ── Background task ───────────────────────────────────────────────────────────

TaskManager.defineTask(PRAYER_RESCHEDULE_TASK, async () => {
  await schedulePrayerNotifications();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// ── Permission ────────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
  return status === 'granted';
}

// ── Channel setup (Android) ───────────────────────────────────────────────────

export async function setupNotificationChannel(): Promise<void> {
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Prayer Alarms',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    enableVibrate: true,
    // CATEGORY_ALARM bypasses DnD on Android
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      flags: { enforceAudibility: true, requestHardwareAudioVideoSynchronization: false },
    },
  });
}

// ── Core scheduling ───────────────────────────────────────────────────────────

interface ScheduledPrayer {
  name: PrayerName;
  timestamp: number;
  formattedTime: string;
}

async function getNext3DaysPrayerTimes(): Promise<ScheduledPrayer[]> {
  const cityRaw = mmkv.getString('pc:settings');
  if (!cityRaw) return [];

  let settings: { location?: { latitude: number; longitude: number; timezone: string } };
  try { settings = JSON.parse(cityRaw); } catch { return []; }
  const loc = settings?.location;
  if (!loc) return [];

  const result: ScheduledPrayer[] = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < NOTIFICATION_DAYS_AHEAD; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);

    const times = calculatePrayerTimes(
      date,
      loc.latitude,
      loc.longitude,
      parseFloat(loc.timezone) || 0,
      'MWL',
    );

    for (const name of PRAYER_NAMES) {
      const t = times[name as keyof typeof times];
      if (t instanceof Date && t.getTime() > now.getTime()) {
        result.push({
          name,
          timestamp: t.getTime(),
          formattedTime: t.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true,
          }),
        });
      }
    }
  }
  return result;
}

/**
 * Schedule prayer notifications for next NOTIFICATION_DAYS_AHEAD days.
 * Cancels all existing prayer notifications first.
 * Safe to call multiple times — idempotent.
 */
export async function schedulePrayerNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const prayers = await getNext3DaysPrayerTimes();

  for (const prayer of prayers) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${PRAYER_DISPLAY[prayer.name] ?? prayer.name} Time`,
        body: `It's time for ${prayer.name} prayer — ${prayer.formattedTime}`,
        sound: 'default',
        data: { prayerName: prayer.name, timestamp: prayer.timestamp },
        // iOS time-sensitive interruption (entitlement required — see PCI pci-praycalc-ios-critical-alerts)
        ...(process.env['EXPO_PUBLIC_PLATFORM'] !== 'android' && {
          interruptionLevel: 'timeSensitive' as const,
        }),
      },
      trigger: {
        date: new Date(prayer.timestamp),
        channelId: NOTIFICATION_CHANNEL_ID,
      },
    });
  }
}

/**
 * Register background fetch task for midnight reschedule.
 */
export async function registerRescheduleTask(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(PRAYER_RESCHEDULE_TASK);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(PRAYER_RESCHEDULE_TASK, {
      minimumInterval: 60 * 60 * 12, // 12 hours minimum interval
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}
