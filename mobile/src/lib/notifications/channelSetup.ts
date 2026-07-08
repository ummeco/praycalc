/**
 * Purpose: Android notification channel setup + permission/self-test helpers for
 *   the prayer-notification service. Split out of PrayerNotificationService.ts to
 *   keep each file under the 300-line cap.
 * Inputs: useSettingsStore, expo-notifications.
 * Outputs: setupNotificationChannel, registerAdhanCategory, requestNotificationPermission,
 *   openBatteryOptimizationSettings, fireTestAdhanNotification, adhan category/action ids.
 * Constraints: Android channel sounds are immutable after creation — each bundled
 *   adhan sound gets its own dedicated channel. iOS interruptionLevel 'timeSensitive'
 *   requires entitlement (see PCI pci-praycalc-ios-critical-alerts).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-notification-service
 */

import { Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { t } from '../../i18n';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
import {
  NOTIFICATION_CHANNEL_ID,
  SMART_ALARM_CHANNEL_ID,
  JUMUAH_CHANNEL_ID,
  ADHAN_SOUNDS,
  resolveAdhanSound,
} from '../../constants';

/** Notification category with a snooze action (iOS + Android actionable notification). */
export const ADHAN_CATEGORY_ID = 'prayer-adhan';
/** Action id fired when the user taps "Snooze 5 min". */
export const SNOOZE_ACTION_ID = 'snooze-5';
/** Minutes a snoozed adhan is deferred by. */
export const SNOOZE_MINUTES = 5;

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

// ── Reliability helpers (Android battery optimization + self-test) ────────────

/**
 * Open the Android "ignore battery optimizations" system screen so the user can
 * whitelist the app — aggressive OEM battery managers (Xiaomi, Huawei, Samsung,
 * OnePlus, Oppo/Vivo) kill background alarms otherwise, silencing the adhan.
 * No-op on iOS (no equivalent user-facing setting). Best-effort — falls back to
 * the app's own settings screen if the OEM blocks the direct intent.
 */
export async function openBatteryOptimizationSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    // Global battery-optimization list (works across OEMs). Direct
    // ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS needs a package intent that
    // IntentLauncher can't always target, so open the list the user can act on.
    await Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
  } catch {
    // OEM blocked the direct intent — fall back to app settings.
    try {
      await Linking.openSettings();
    } catch {
      // give up silently — the education screen still explains the manual path.
    }
  }
}

/**
 * Fire a test notification ~SECONDS_OUT seconds from now so the user can confirm
 * the adhan sound + delivery actually work on their device (past the OEM battery
 * killers). Uses the user's currently-selected adhan sound + its channel, exactly
 * like a real prayer alert.
 */
export async function fireTestAdhanNotification(): Promise<void> {
  const settings = useSettingsStore.getState();
  const chosenSound = resolveAdhanSound(settings.adhanNotificationSoundId);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: t('notifications.testTitle'),
      body: t('notifications.testBody'),
      sound: chosenSound.file,
      categoryIdentifier: ADHAN_CATEGORY_ID,
      data: { test: true },
      ...(process.env['EXPO_PUBLIC_PLATFORM'] !== 'android' && {
        interruptionLevel: 'timeSensitive' as const,
      }),
    },
    trigger: {
      seconds: 5,
      channelId: chosenSound.adhanChannelId,
    } as Notifications.TimeIntervalTriggerInput,
  });
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
  // Android channel sounds are immutable after creation, so EACH bundled adhan
  // sound gets its own dedicated channel (created once, up front) — switching the
  // selected adhan sound just points scheduling at a different pre-made channel.
  for (const s of ADHAN_SOUNDS) {
    await Notifications.setNotificationChannelAsync(s.adhanChannelId, {
      ...shared,
      name: `Prayer Alarms (${t(s.labelKey)})`,
      sound: s.file,
    });
  }
  // Smart alarms (Suhoor / Tahajjud) — default chime, still alarm-category so it
  // bypasses DnD and wakes the user.
  await Notifications.setNotificationChannelAsync(SMART_ALARM_CHANNEL_ID, {
    ...shared,
    name: 'Suhoor & Tahajjud',
    sound: 'default',
  });
  // Jumu'ah reminders — normal HIGH importance chime (not alarm-category).
  await Notifications.setNotificationChannelAsync(JUMUAH_CHANNEL_ID, {
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
    name: "Jumu'ah Reminders",
    sound: 'default',
  });
  await registerAdhanCategory();
}

/**
 * Register the actionable notification category that adds a "Snooze 5 min" button
 * to adhan notifications. Idempotent — safe to call on every channel setup / app
 * start. The snooze action is handled by the response listener (see
 * handleSnoozeResponse), which reschedules the same prayer SNOOZE_MINUTES later.
 */
export async function registerAdhanCategory(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(ADHAN_CATEGORY_ID, [
    {
      identifier: SNOOZE_ACTION_ID,
      buttonTitle: t('notifications.snooze', { count: SNOOZE_MINUTES }),
      options: { opensAppToForeground: false },
    },
  ]);
}
