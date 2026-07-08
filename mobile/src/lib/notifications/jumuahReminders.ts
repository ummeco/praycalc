/**
 * Purpose: Compute + schedule Jumu'ah (khutbah + Surah al-Kahf) reminders. Split
 *   out of PrayerNotificationService.ts to keep each file under the 300-line cap.
 * Inputs: useSettingsStore settings snapshot.
 * Outputs: JumuahReminder type, computeJumuahReminders, scheduleJumuahReminders.
 * Constraints: fires weekly — schedules the single next occurrence of each and lets
 *   the app-start / midnight reschedule roll the window forward.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-notification-service
 */

import * as Notifications from 'expo-notifications';
import { t } from '../../i18n';
import { JUMUAH_CHANNEL_ID } from '../../constants';
import type { NotificationSettings } from './dayTimes';

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
 * Schedule the Jumu'ah khutbah + Surah al-Kahf reminders (weekly; next occurrence).
 */
export async function scheduleJumuahReminders(settings: NotificationSettings): Promise<void> {
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
