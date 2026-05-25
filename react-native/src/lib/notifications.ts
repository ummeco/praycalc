/**
 * Purpose: Schedule and cancel prayer time notifications via Expo Notifications.
 * Inputs: DailyPrayerTimes, NotifSettings
 * Outputs: Scheduled notification IDs persisted to AsyncStorage
 * Constraints: Expo Notifications requires explicit permission grant.
 *   Android needs a notification channel. iOS requires entitlement.
 *   All previously scheduled notifs are cancelled before rescheduling to avoid duplication.
 * SPORT: lib/notifications.ts
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { DailyPrayerTimes, NotifSettings, PrayerName } from '../types';

const NOTIF_IDS_KEY = '@praycalc/notif_ids';
const ANDROID_CHANNEL_ID = 'prayer-times';

// ── Setup ──────────────────────────────────────────────────────────────────

/** One-time initialisation: create Android channel, set handler. */
export async function initNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Prayer Times',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

/** Request notification permission. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ── Scheduling ─────────────────────────────────────────────────────────────

const PRE_REMINDER_OFFSETS: Record<string, number> = {
  pre_5: 5,
  pre_10: 10,
  pre_15: 15,
  pre_30: 30,
};

/**
 * Schedule notifications for the given daily prayer times according to user settings.
 * Cancels all previously scheduled notifs first to prevent duplication.
 */
export async function schedulePrayerNotifications(
  times: DailyPrayerTimes,
  settings: NotifSettings,
): Promise<void> {
  if (!settings.globalEnabled) {
    await cancelAllPrayerNotifications();
    return;
  }

  await cancelAllPrayerNotifications();

  const ids: string[] = [];

  for (const prayer of times.prayers) {
    const config = settings.prayers[prayer.name as PrayerName];
    if (!config?.enabled) continue;

    for (const trigger of config.triggers) {
      const fireMs =
        trigger === 'at_adhan'
          ? prayer.timeMs
          : prayer.timeMs - PRE_REMINDER_OFFSETS[trigger] * 60_000;

      if (fireMs <= Date.now()) continue; // Skip past notifications.

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title:
            trigger === 'at_adhan'
              ? `🕌 ${prayer.name} — ${prayer.label}`
              : `⏰ ${prayer.name} in ${PRE_REMINDER_OFFSETS[trigger]} min — ${prayer.label}`,
          body: trigger === 'at_adhan' ? 'Time for prayer.' : `${prayer.name} prayer is approaching.`,
          sound: config.soundEnabled ? 'default' : undefined,
          ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
        },
        trigger: { date: new Date(fireMs) },
      });
      ids.push(id);
    }
  }

  await AsyncStorage.setItem(NOTIF_IDS_KEY, JSON.stringify(ids));
}

/** Cancel all previously scheduled prayer notifications. */
export async function cancelAllPrayerNotifications(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_IDS_KEY);
    if (raw) {
      const ids: string[] = JSON.parse(raw);
      await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    }
  } catch {
    // If storage read fails, cancel everything as a safe fallback.
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
  await AsyncStorage.removeItem(NOTIF_IDS_KEY);
}
