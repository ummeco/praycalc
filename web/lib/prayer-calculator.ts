// praycalc/web/lib/prayer-calculator.ts — v1.1 server-side prayer time calculator
// Spec §13.1, S19-H T35
//
// Wraps pray-calc with timezone-aware prayer time calculation.
// Used by the BullMQ PrayerSchedulerJob to determine which users need
// push notifications within a given time window.
//
// Also exports helpers used by the cron job to build PushJob payloads.

import "server-only";
import { getPrayerTimes } from "./prayers";
import { isInMuteWindow, type UserNotifPrefs, type PushJobData } from "./push";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CalculatedPrayerTimes {
  fajr:    number;   // Unix timestamp (seconds)
  sunrise: number;
  dhuhr:   number;
  asr:     number;
  maghrib: number;
  isha:    number;
}

export const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
export type PrayerName = typeof PRAYER_ORDER[number];

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates all 6 prayer times for a given date and location.
 * Returns Unix timestamps (seconds since epoch).
 */
export function calculatePrayerTimestamps(
  date:      Date,
  lat:       number,
  lng:       number,
  tzOffset:  number,
  hanafi:    boolean = false,
): CalculatedPrayerTimes {
  const times = getPrayerTimes(date, lat, lng, tzOffset, hanafi);

  // Parse "HH:MM" strings into Unix timestamps for the given date
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  function toUnix(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    const d = new Date(dayStart);
    d.setHours(h, m, 0, 0);
    return Math.floor(d.getTime() / 1000);
  }

  return {
    fajr:    toUnix(times.Fajr),
    sunrise: toUnix(times.Sunrise),
    dhuhr:   toUnix(times.Dhuhr),
    asr:     toUnix(times.Asr),
    maghrib: toUnix(times.Maghrib),
    isha:    toUnix(times.Isha),
  };
}

/**
 * Returns a map of prayer name → Unix timestamp for the given date.
 */
export function prayerTimestampMap(
  date:     Date,
  lat:      number,
  lng:      number,
  tzOffset: number,
  hanafi:   boolean = false,
): Map<PrayerName, number> {
  const ts = calculatePrayerTimestamps(date, lat, lng, tzOffset, hanafi);
  return new Map<PrayerName, number>([
    ['Fajr',    ts.fajr],
    ['Sunrise', ts.sunrise],
    ['Dhuhr',   ts.dhuhr],
    ['Asr',     ts.asr],
    ['Maghrib', ts.maghrib],
    ['Isha',    ts.isha],
  ]);
}

// ---------------------------------------------------------------------------
// Push job builder
// ---------------------------------------------------------------------------

/**
 * Formats a Unix timestamp as "H:MM AM/PM" using the local timezone offset.
 */
function formatPrayerTime(unixTs: number, tzOffsetHours: number): string {
  const d = new Date((unixTs + tzOffsetHours * 3600) * 1000);
  // Use UTC since we've already applied the offset
  const h   = d.getUTCHours();
  const m   = d.getUTCMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Builds PushJobData entries for a user based on their notification preferences.
 * Returns one entry per (notif type × token) that should fire in the given window.
 *
 * @param prefs     User's notification preferences
 * @param tokens    User's push tokens
 * @param prayerName  Name of the prayer
 * @param prayerUnixTs  Unix timestamp of the prayer time
 * @param windowStart   Window start (Unix timestamp, seconds)
 * @param windowEnd     Window end (Unix timestamp, seconds)
 * @param tzOffset      UTC offset in hours for time formatting
 */
export function buildPushJobsForUser(
  prefs:        UserNotifPrefs,
  tokens:       import('./push').UserPushToken[],
  prayerName:   PrayerName,
  prayerUnixTs: number,
  windowStart:  number,
  windowEnd:    number,
  tzOffset:     number,
): PushJobData[] {
  const jobs: PushJobData[] = [];

  // Mute window check: use HHMM of the prayer time
  const prayerDate = new Date(prayerUnixTs * 1000);
  const hhmm = prayerDate.getUTCHours() * 100 + prayerDate.getUTCMinutes();
  if (isInMuteWindow(hhmm, prefs.muteStart, prefs.muteEnd)) return jobs;

  // Skip Sunrise (no notification)
  if (prayerName === 'Sunrise') return jobs;

  const prayerTimeStr = formatPrayerTime(prayerUnixTs, tzOffset);

  // Notification windows to check:
  // 1. Adhan: fire at prayer time
  // 2. Pre-alert 1: fire preAlertMins1 before prayer time
  // 3. Pre-alert 2: fire preAlertMins2 before prayer time
  // 4. Reminder: fire reminderMins before prayer time

  const notifCandidates: Array<{
    offsetMins:  number;
    type:        PushJobData['notifType'];
    fireAtUnix:  number;
    enabled:     boolean;
  }> = [
    {
      offsetMins: 0,
      type:       'adhan',
      fireAtUnix: prayerUnixTs,
      enabled:    prefs.adhanEnabled,
    },
    {
      offsetMins: prefs.preAlertMins1,
      type:       'pre_prayer',
      fireAtUnix: prayerUnixTs - prefs.preAlertMins1 * 60,
      enabled:    prefs.preAlertMins1 > 0,
    },
    {
      offsetMins: prefs.preAlertMins2,
      type:       'pre_prayer',
      fireAtUnix: prayerUnixTs - prefs.preAlertMins2 * 60,
      enabled:    prefs.preAlertMins2 > 0,
    },
    {
      offsetMins: prefs.reminderMins,
      type:       'reminder',
      fireAtUnix: prayerUnixTs - prefs.reminderMins * 60,
      enabled:    prefs.reminderMins > 0,
    },
  ];

  for (const candidate of notifCandidates) {
    if (!candidate.enabled) continue;
    if (candidate.fireAtUnix < windowStart || candidate.fireAtUnix >= windowEnd) continue;

    for (const token of tokens) {
      jobs.push({
        userId:        prefs.userId,
        prayerName,
        prayerTime:    prayerTimeStr,
        lat:           prefs.lat,
        lng:           prefs.lng,
        platform:      token.platform,
        token:         token.token,
        deviceId:      token.deviceId,
        notifType:     candidate.type,
        offsetMinutes: candidate.offsetMins,
      });
    }
  }

  return jobs;
}

// ---------------------------------------------------------------------------
// Timezone offset estimation
// ---------------------------------------------------------------------------

/**
 * Estimates UTC offset in hours from a lat/lng coordinate using a simple
 * longitude-based approximation (longitude / 15).
 * For production accuracy, use the Google Time Zone API or similar.
 * The cron job should fetch the actual TZ offset from the user's stored prefs.
 */
export function estimateTzOffsetHours(lng: number): number {
  return Math.round(lng / 15);
}
