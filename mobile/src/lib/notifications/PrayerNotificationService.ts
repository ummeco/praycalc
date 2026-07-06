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
 *   Adhan notification sound: a bundled 26.6s opening-takbir excerpt
 *   (assets/sounds/adhan_takbir.wav, registered via the expo-notifications config
 *   plugin) plays when the prayer's adhan toggle is on — iOS hard-caps notification
 *   sounds at 30s, so the FULL selected reciter's adhan plays on notification tap
 *   (see useAdhanOnNotificationTap in app/_layout.tsx). Android needs a dedicated
 *   channel because channel sounds are immutable after creation.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-notification-service
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { calculatePrayerTimes } from '../prayer-calc';
import { resolveTimezoneOffset } from '../timezone';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
import {
  NOTIFICATION_DAYS_AHEAD,
  PRAYER_RESCHEDULE_TASK,
  NOTIFICATION_CHANNEL_ID,
  NOTIFICATION_CHANNEL_ADHAN_ID,
  ADHAN_NOTIFICATION_SOUND,
} from '../../constants';
import type { PrayerName } from '../../types/prayer';
import type { CalcMethodKey } from '../../constants/methods';

/** Must match the `name` in app.json's react-native-android-widget plugin config. */
const NEXT_PRAYER_WIDGET_NAME = 'NextPrayer';

/**
 * Best-effort home-screen widget repaint after (re)scheduling notifications, so the
 * Android "Next Prayer" widget reflects a settings/schedule change immediately
 * instead of waiting for its 30-minute updatePeriodMillis tick. Lazily imports the
 * Android-only library behind a Platform check so iOS never loads this module, and
 * swallows all errors — a widget-refresh failure must never break notification
 * scheduling, which is the caller's actual job.
 */
async function refreshHomeScreenWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } = await import('react-native-android-widget');
    const { renderCurrentNextPrayerWidget } = await import('../../widgets/widgetTaskHandler');
    await requestWidgetUpdate({
      widgetName: NEXT_PRAYER_WIDGET_NAME,
      renderWidget: renderCurrentNextPrayerWidget,
    });
  } catch {
    // Best-effort only — never let a widget-refresh failure surface to the caller.
  }
}

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
  const shared = {
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
    // CATEGORY_ALARM bypasses DnD on Android
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      flags: { enforceAudibility: true, requestHardwareAudioVideoSynchronization: false },
    },
  };
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    ...shared,
    name: 'Prayer Alarms',
    sound: 'default',
  });
  // Separate channel: Android channel sounds are immutable after creation, so the
  // adhan-takbir sound needs its own channel rather than mutating the default one.
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ADHAN_ID, {
    ...shared,
    name: 'Prayer Alarms (Adhan)',
    sound: ADHAN_NOTIFICATION_SOUND,
  });
}

// ── Core scheduling ───────────────────────────────────────────────────────────

interface ScheduledPrayer {
  name: PrayerName;
  triggerTimestamp: number;
  prayerTimestamp: number;
  formattedTime: string;
  advanceMinutes: number;
  /** 'adhan' = the prayer-time alert itself; 'iqamah' = the follow-up reminder N minutes after. */
  kind: 'adhan' | 'iqamah';
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
      const formattedTime = t.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
      if (triggerTime.getTime() > now.getTime()) {
        result.push({
          name,
          triggerTimestamp: triggerTime.getTime(),
          prayerTimestamp: t.getTime(),
          formattedTime,
          advanceMinutes,
          kind: 'adhan',
        });
      }

      // Iqamah reminder N minutes after the prayer time (0 = off). Uses the
      // default chime, never the adhan sound. Worst case volume stays well
      // under the 64-notification OS cap: 3 days × 6 × 2 = 36.
      const iqamahOffset = settings.iqamahOffsetMinutes[name] ?? 0;
      if (iqamahOffset > 0) {
        const iqamahTime = t.getTime() + iqamahOffset * 60_000;
        if (iqamahTime > now.getTime()) {
          result.push({
            name,
            triggerTimestamp: iqamahTime,
            prayerTimestamp: t.getTime(),
            formattedTime,
            advanceMinutes: 0,
            kind: 'iqamah',
          });
        }
      }
    }
  }
  return result;
}

function notificationBody(prayer: ScheduledPrayer): string {
  const label = PRAYER_DISPLAY[prayer.name] ?? prayer.name;
  if (prayer.kind === 'iqamah') {
    return `Iqamah reminder for ${label} (adhan was at ${prayer.formattedTime})`;
  }
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

  const settings = useSettingsStore.getState();

  for (const prayer of prayers) {
    // Adhan takbir sound when this prayer's adhan toggle is on AND the alert is
    // at prayer time (an early "X minutes before" reminder and the iqamah
    // follow-up keep the default chime — the adhan belongs at the prayer time).
    const adhanSound =
      prayer.kind === 'adhan' && settings.perPrayerAdhanEnabled[prayer.name] && prayer.advanceMinutes <= 0;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: prayer.kind === 'iqamah'
          ? `${PRAYER_DISPLAY[prayer.name] ?? prayer.name} Iqamah`
          : `${PRAYER_DISPLAY[prayer.name] ?? prayer.name} Time`,
        body: notificationBody(prayer),
        sound: adhanSound ? ADHAN_NOTIFICATION_SOUND : 'default',
        data: { prayerName: prayer.name, timestamp: prayer.prayerTimestamp },
        // iOS time-sensitive interruption (entitlement required — see PCI pci-praycalc-ios-critical-alerts)
        ...(process.env['EXPO_PUBLIC_PLATFORM'] !== 'android' && {
          interruptionLevel: 'timeSensitive' as const,
        }),
      },
      trigger: {
        date: new Date(prayer.triggerTimestamp),
        channelId: adhanSound ? NOTIFICATION_CHANNEL_ADHAN_ID : NOTIFICATION_CHANNEL_ID,
      },
    });
  }

  await refreshHomeScreenWidget();
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
