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

import { Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { calculatePrayerTimes } from '../prayer-calc';
import { resolveTimezoneOffset } from '../timezone';
import { computeNightTimes, suhoorTime, tahajjudTime, type NightTimes } from './nightTimes';
import { t } from '../../i18n';
import { useSettingsStore } from '../../features/settings/store/useSettingsStore';
import {
  NOTIFICATION_DAYS_AHEAD,
  PRAYER_RESCHEDULE_TASK,
  NOTIFICATION_CHANNEL_ID,
  NOTIFICATION_CHANNEL_ADHAN_ID,
  SMART_ALARM_CHANNEL_ID,
  JUMUAH_CHANNEL_ID,
  ADHAN_NOTIFICATION_SOUND,
  ADHAN_SOUNDS,
  resolveAdhanSound,
} from '../../constants';
import type { CityCoords, PrayerName } from '../../types/prayer';
import type { CalcMethodKey } from '../../constants/methods';

/** Notification category with a snooze action (iOS + Android actionable notification). */
export const ADHAN_CATEGORY_ID = 'prayer-adhan';
/** Action id fired when the user taps "Snooze 5 min". */
export const SNOOZE_ACTION_ID = 'snooze-5';
/** Minutes a snoozed adhan is deferred by. */
export const SNOOZE_MINUTES = 5;

/** Must match the `name` in app.json's react-native-android-widget plugin config. */
const NEXT_PRAYER_WIDGET_NAME = 'NextPrayer';

/**
 * Best-effort home-screen widget repaint after (re)scheduling notifications, so the
 * "Next Prayer" widget reflects a settings/schedule change immediately instead of
 * waiting for its periodic OS update tick. Handles BOTH platforms behind a lazy,
 * platform-guarded import so neither loads the other's native code:
 *   - Android: react-native-android-widget requestWidgetUpdate (re-renders the tree).
 *   - iOS: refreshIosHomeWidget (writes the day's remaining prayers into App Group
 *     UserDefaults via ExtensionStorage, then reloads the WidgetKit timeline).
 * Swallows all errors — a widget-refresh failure must never break notification
 * scheduling, which is the caller's actual job.
 */
async function refreshHomeScreenWidget(): Promise<void> {
  if (Platform.OS === 'ios') {
    try {
      const { refreshIosHomeWidget } = await import('../../features/home-widget/iosWidgetWriter');
      await refreshIosHomeWidget();
    } catch {
      // Best-effort only — never let a widget-refresh failure surface to the caller.
    }
    return;
  }
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

/** Settings shape used by the time calculators (subset of the store). */
type NotificationSettings = ReturnType<typeof useSettingsStore.getState>;

/**
 * Compute prayer times for one calendar day at the active location. Shared by the
 * prayer-notification loop and the smart-alarm (Suhoor/Tahajjud) computation so both
 * honour the exact same method/madhab/high-lat/custom-angle/minute-adjustment settings.
 */
function computeDayTimes(settings: NotificationSettings, location: CityCoords, date: Date) {
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
function activeLocation(settings: NotificationSettings): CityCoords | null {
  return settings.musafirMode && settings.travelLocation ? settings.travelLocation : settings.location;
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

// ── Smart alarms (Suhoor / Tahajjud / Qiyam) ──────────────────────────────────

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

// ── Jumu'ah reminders (Friday khutbah + Surah al-Kahf) ────────────────────────

/** A computed Jumu'ah reminder trigger. */
export interface JumuahReminder {
  kind: 'khutbah' | 'kahf';
  triggerTimestamp: number;
}

/** Day-of-week constants (JS getDay: 0=Sun … 6=Sat). */
const THURSDAY = 4;
const FRIDAY = 5;

/** Parse "HH:mm" into [hours, minutes]; defaults to [0,0] if malformed. */
function parseClock(hhmm: string): [number, number] {
  const [h, m] = hhmm.split(':');
  const hours = Number(h);
  const minutes = Number(m);
  return [Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0];
}

/**
 * Next occurrence of `targetDow` at `hhmm`, on/after `now`. If today IS the target
 * day but the time has already passed, rolls forward a week.
 */
function nextWeekdayAt(now: Date, targetDow: number, hhmm: string): Date {
  const [hours, minutes] = parseClock(hhmm);
  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  let deltaDays = (targetDow - d.getDay() + 7) % 7;
  if (deltaDays === 0 && d.getTime() <= now.getTime()) deltaDays = 7;
  d.setDate(d.getDate() + deltaDays);
  return d;
}

/**
 * Compute the next Jumu'ah reminder instants (khutbah on Friday; Kahf on the
 * user-chosen Thursday evening or Friday morning). Fires weekly — we schedule the
 * single next occurrence of each and let the app-start / midnight reschedule roll
 * the window forward. Pure aside from reading settings.
 */
export function computeJumuahReminders(settings: NotificationSettings, now: Date): JumuahReminder[] {
  const reminders: JumuahReminder[] = [];
  if (settings.jumuahKhutbahReminderEnabled) {
    reminders.push({ kind: 'khutbah', triggerTimestamp: nextWeekdayAt(now, FRIDAY, settings.jumuahKhutbahTime).getTime() });
  }
  if (settings.kahfReminderEnabled) {
    const dow = settings.kahfReminderDay === 'thursdayEve' ? THURSDAY : FRIDAY;
    reminders.push({ kind: 'kahf', triggerTimestamp: nextWeekdayAt(now, dow, settings.kahfReminderTime).getTime() });
  }
  return reminders;
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
}

/**
 * Schedule the Suhoor / Tahajjud smart alarms. Called from schedulePrayerNotifications
 * AFTER cancelAllScheduledNotificationsAsync, so it just adds rows to the fresh window.
 */
async function scheduleSmartAlarms(settings: NotificationSettings): Promise<void> {
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

/**
 * Schedule the Jumu'ah khutbah + Surah al-Kahf reminders (weekly; next occurrence).
 */
async function scheduleJumuahReminders(settings: NotificationSettings): Promise<void> {
  const reminders = computeJumuahReminders(settings, new Date());
  for (const reminder of reminders) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t(reminder.kind === 'khutbah' ? 'notifications.jumuahKhutbahTitle' : 'notifications.kahfTitle'),
        body: t(reminder.kind === 'khutbah' ? 'notifications.jumuahKhutbahBody' : 'notifications.kahfBody'),
        sound: 'default',
        data: { jumuah: reminder.kind },
      },
      trigger: { date: new Date(reminder.triggerTimestamp), channelId: JUMUAH_CHANNEL_ID },
    });
  }
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
