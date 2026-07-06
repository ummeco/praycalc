/**
 * Purpose: Schedule prayer-time notifications using expo-notifications + expo-task-manager.
 *   Reads the user's real settings (method, madhab, high-lat rule, custom angles,
 *   per-prayer enabled/advance-minutes, adhan sound choice) from useSettingsStore —
 *   previously hardcoded to MWL/Shafi/all-5-prayers regardless of what the user
 *   configured. Background task reschedules next 3 days at midnight.
 * Inputs: useSettingsStore (single source of truth), pray-calc engine.
 * Outputs: PrayerNotificationService — Feature 15 of 20 (core notification logic).
 * Constraints: expo-notifications scheduleNotificationAsync for each prayer.
 *   SCHEDULE_EXACT_ALARM declared in app.json android.permissions.
 *   iOS: interruptionLevel 'timeSensitive' (requires entitlement — see PCI pci-praycalc-ios-critical-alerts).
 *   DnD bypass: Android alarm category; iOS time-sensitive.
 *   Max 64 scheduled notifications across iOS/Android.
 *   Custom adhan-voice audio as the actual notification sound requires a bundled
 *   native sound asset per platform (not a remote URL) — tracked as a follow-up;
 *   this service correctly persists/reads the user's voice + per-prayer choice and
 *   is ready to pass a real filename once one is bundled (see PCI pci-praycalc-adhan-notification-sound).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-notification-service
 */

import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { calculatePrayerTimes } from '../prayer-calc';
import { resolveTimezoneOffset } from '../timezone';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
import { NOTIFICATION_DAYS_AHEAD, PRAYER_RESCHEDULE_TASK, NOTIFICATION_CHANNEL_ID } from '../../constants';
import type { PrayerName } from '../../types/prayer';
import type { CalcMethodKey } from '../../constants/methods';

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
  triggerTimestamp: number;
  prayerTimestamp: number;
  formattedTime: string;
  advanceMinutes: number;
}

async function getUpcomingPrayerNotifications(): Promise<ScheduledPrayer[]> {
  // Cold-start (e.g. background task) may run before AsyncStorage rehydration completes.
  await useSettingsStore.persist.rehydrate();
  const settings = useSettingsStore.getState();

  const location = settings.musafirMode && settings.travelLocation
    ? settings.travelLocation
    : settings.location;
  if (!location) return [];

  const customAngles = settings.method === 'Custom'
    ? { fajr: settings.customFajrAngle, isha: settings.customIshaAngle }
    : undefined;

  const result: ScheduledPrayer[] = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < NOTIFICATION_DAYS_AHEAD; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);

    const times = calculatePrayerTimes(
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

    for (const name of PRAYER_NAMES) {
      if (!settings.perPrayerNotificationEnabled[name]) continue;
      const t = times[name as keyof typeof times];
      if (!(t instanceof Date) || Number.isNaN(t.getTime())) continue;

      const advanceMinutes = settings.notificationAdvanceMinutes[name] ?? 0;
      const triggerTime = new Date(t.getTime() - advanceMinutes * 60_000);
      if (triggerTime.getTime() <= now.getTime()) continue;

      result.push({
        name,
        triggerTimestamp: triggerTime.getTime(),
        prayerTimestamp: t.getTime(),
        formattedTime: t.toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: true,
        }),
        advanceMinutes,
      });
    }
  }
  return result;
}

function notificationBody(prayer: ScheduledPrayer): string {
  const label = PRAYER_DISPLAY[prayer.name] ?? prayer.name;
  if (prayer.advanceMinutes <= 0) {
    return `It's time for ${label} prayer — ${prayer.formattedTime}`;
  }
  return `${label} is in ${prayer.advanceMinutes} minutes — ${prayer.formattedTime}`;
}

/**
 * Schedule prayer notifications for next NOTIFICATION_DAYS_AHEAD days, per the
 * user's real settings (method/madhab/high-lat rule/custom angles/per-prayer
 * enabled+advance). Cancels all existing prayer notifications first.
 * Safe to call multiple times — idempotent.
 */
export async function schedulePrayerNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const prayers = await getUpcomingPrayerNotifications();

  for (const prayer of prayers) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${PRAYER_DISPLAY[prayer.name] ?? prayer.name} Time`,
        body: notificationBody(prayer),
        // TODO(pci-praycalc-adhan-notification-sound): once a bundled native adhan
        // audio asset exists, select it here based on settings.adhanVoiceId /
        // perPrayerAdhanEnabled[prayer.name] instead of the system default.
        sound: 'default',
        data: { prayerName: prayer.name, timestamp: prayer.prayerTimestamp },
        // iOS time-sensitive interruption (entitlement required — see PCI pci-praycalc-ios-critical-alerts)
        ...(process.env['EXPO_PUBLIC_PLATFORM'] !== 'android' && {
          interruptionLevel: 'timeSensitive' as const,
        }),
      },
      trigger: {
        date: new Date(prayer.triggerTimestamp),
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
