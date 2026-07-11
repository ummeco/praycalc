/**
 * Purpose: Schedule prayer-time notifications using expo-notifications + expo-task-manager.
 *   Reads the user's real settings (method, madhab, high-lat rule, custom angles,
 *   per-prayer enabled/advance-minutes, adhan sound choice) from useSettingsStore —
 *   previously hardcoded to MWL/Shafi/all-5-prayers regardless of what the user
 *   configured. Background task reschedules next 3 days at midnight.
 *   Split across several files to stay under the 300-line cap per file; this file
 *   is the public barrel — every export below plus the re-exports at the bottom
 *   is the full public surface consumers should import.
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
 *   channel because channel sounds are immutable after creation (see channelSetup.ts).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-notification-service
 */

import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { t } from '../../i18n';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
import {
  NOTIFICATION_DAYS_AHEAD,
  PRAYER_RESCHEDULE_TASK,
  NOTIFICATION_CHANNEL_ID,
  resolveAdhanSound,
} from '../../constants';
import type { PrayerName } from '../../types/prayer';
import { computeDayTimes, activeLocation } from './dayTimes';
import { ADHAN_CATEGORY_ID, SNOOZE_ACTION_ID, SNOOZE_MINUTES } from './channelSetup';
import { scheduleSmartAlarms } from './smartAlarms';
import { scheduleJumuahReminders } from './jumuahReminders';
import { refreshHomeScreenWidget } from './widgetRefresh';
import { formatTime } from '../formatTime';
import { syncPrayerDataToWatch } from '../watch/watchSync';

const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/** Translation key per prayer name, `prayer` namespace (render-time only). */
const PRAYER_LABEL_KEYS: Record<PrayerName, string> = {
  Fajr: 'prayer.fajr',
  Sunrise: 'prayer.sunrise',
  Dhuhr: 'prayer.dhuhr',
  Asr: 'prayer.asr',
  Maghrib: 'prayer.maghrib',
  Isha: 'prayer.isha',
};

// ── Background task ───────────────────────────────────────────────────────────

TaskManager.defineTask(PRAYER_RESCHEDULE_TASK, async () => {
  await schedulePrayerNotifications();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// ── Snooze action listener ────────────────────────────────────────────────────
// Registered once at module load (this service is imported at app start via
// _layout.tsx). The app's own response listener there only handles the TAP (to
// play the full adhan); the SNOOZE button is an action on the same notification,
// so it needs its own handler that reschedules. Guarded so it registers exactly
// once even under fast refresh / repeated imports.
let snoozeListenerRegistered = false;

/**
 * Register the global "Snooze 5 min" action handler. Idempotent. Safe to call at
 * module load and again from setupNotificationChannel — only the first wins.
 */
export function registerSnoozeHandler(): void {
  if (snoozeListenerRegistered) return;
  snoozeListenerRegistered = true;
  Notifications.addNotificationResponseReceivedListener((response) => {
    void handleSnoozeResponse(response).catch(() => undefined);
  });
}

registerSnoozeHandler();

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

  const location = activeLocation(settings);
  if (!location) return [];

  const result: ScheduledPrayer[] = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < NOTIFICATION_DAYS_AHEAD; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);

    const times = computeDayTimes(settings, location, date);

    for (const name of PRAYER_NAMES) {
      if (!settings.perPrayerNotificationEnabled[name]) continue;
      const t = times[name as keyof typeof times];
      if (!(t instanceof Date) || Number.isNaN(t.getTime())) continue;

      const advanceMinutes = settings.notificationAdvanceMinutes[name] ?? 0;
      const triggerTime = new Date(t.getTime() - advanceMinutes * 60_000);
      const formattedTime = formatTime(t, settings.timeFormat, settings.locale);
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
      // under the 64-notification OS cap: 3 days × 5 × 2 = 30.
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
  const label = t(PRAYER_LABEL_KEYS[prayer.name]) || prayer.name;
  if (prayer.kind === 'iqamah') {
    return t('notifications.bodyIqamah', { prayer: label, time: prayer.formattedTime });
  }
  if (prayer.advanceMinutes <= 0) {
    return t('notifications.bodyNow', { prayer: label, time: prayer.formattedTime });
  }
  return t('notifications.bodyAdvance', { prayer: label, count: prayer.advanceMinutes, time: prayer.formattedTime });
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
  // Which bundled adhan cut the user picked -> its file + dedicated Android channel.
  const chosenSound = resolveAdhanSound(settings.adhanNotificationSoundId);

  for (const prayer of prayers) {
    // Adhan sound when this prayer's adhan toggle is on AND the alert is
    // at prayer time (an early "X minutes before" reminder and the iqamah
    // follow-up keep the default chime — the adhan belongs at the prayer time).
    const adhanSound =
      prayer.kind === 'adhan' && settings.perPrayerAdhanEnabled[prayer.name] && prayer.advanceMinutes <= 0;
    const prayerLabel = t(PRAYER_LABEL_KEYS[prayer.name]) || prayer.name;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: prayer.kind === 'iqamah'
          ? t('notifications.iqamahTitle', { prayer: prayerLabel })
          : t('notifications.prayerTime', { prayer: prayerLabel }),
        body: notificationBody(prayer),
        // The user-selected adhan cut (falls back to the takbir default) plays at
        // prayer time; the immutable-per-sound Android channel matches it.
        sound: adhanSound ? chosenSound.file : 'default',
        // Snooze action only on the actual adhan alert (not early/iqamah reminders).
        ...(adhanSound && { categoryIdentifier: ADHAN_CATEGORY_ID }),
        data: {
          prayerName: prayer.name,
          timestamp: prayer.prayerTimestamp,
          advanceMinutes: prayer.advanceMinutes,
          kind: prayer.kind,
        },
        // iOS time-sensitive interruption (entitlement required — see PCI pci-praycalc-ios-critical-alerts)
        ...(process.env['EXPO_PUBLIC_PLATFORM'] !== 'android' && {
          interruptionLevel: 'timeSensitive' as const,
        }),
      },
      trigger: {
        date: new Date(prayer.triggerTimestamp),
        channelId: adhanSound ? chosenSound.adhanChannelId : NOTIFICATION_CHANNEL_ID,
      },
    });
  }

  await scheduleSmartAlarms(settings);
  await scheduleJumuahReminders(settings);
  await refreshHomeScreenWidget();
  // Best-effort — a paired-watch sync failure must never break notification
  // scheduling, which is this function's actual job (see watchSync.ts's own
  // internal try/catch for the same reasoning refreshHomeScreenWidget uses).
  await syncPrayerDataToWatch();
}

/**
 * Handle a "Snooze 5 min" action from an adhan notification: reschedule the SAME
 * prayer's adhan alert SNOOZE_MINUTES minutes from now, with the same sound/channel.
 * Wired into the app's response listener — returns true if it handled the response.
 */
export async function handleSnoozeResponse(
  response: Notifications.NotificationResponse,
): Promise<boolean> {
  if (response.actionIdentifier !== SNOOZE_ACTION_ID) return false;
  const data = response.notification.request.content.data as
    | { prayerName?: PrayerName; timestamp?: number }
    | undefined;
  const prayerName = data?.prayerName;
  if (!prayerName) return false;

  const settings = useSettingsStore.getState();
  const chosenSound = resolveAdhanSound(settings.adhanNotificationSoundId);
  const adhanEnabled = settings.perPrayerAdhanEnabled[prayerName] ?? false;
  const prayerLabel = t(PRAYER_LABEL_KEYS[prayerName]) || prayerName;
  const triggerDate = new Date(Date.now() + SNOOZE_MINUTES * 60_000);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: t('notifications.prayerTime', { prayer: prayerLabel }),
      body: t('notifications.snoozedBody', { prayer: prayerLabel }),
      sound: adhanEnabled ? chosenSound.file : 'default',
      categoryIdentifier: ADHAN_CATEGORY_ID,
      data: { prayerName, timestamp: data?.timestamp ?? triggerDate.getTime(), snoozed: true },
      ...(process.env['EXPO_PUBLIC_PLATFORM'] !== 'android' && {
        interruptionLevel: 'timeSensitive' as const,
      }),
    },
    trigger: {
      date: triggerDate,
      channelId: adhanEnabled ? chosenSound.adhanChannelId : NOTIFICATION_CHANNEL_ID,
    },
  });
  return true;
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

// ── Re-exports (public barrel — consumers import these from this file) ────────

export {
  ADHAN_CATEGORY_ID,
  SNOOZE_ACTION_ID,
  SNOOZE_MINUTES,
  setupNotificationChannel,
  registerAdhanCategory,
  requestNotificationPermission,
  openBatteryOptimizationSettings,
  fireTestAdhanNotification,
} from './channelSetup';
export { computeSmartAlarms, type SmartAlarm } from './smartAlarms';
export { computeJumuahReminders, type JumuahReminder } from './jumuahReminders';
