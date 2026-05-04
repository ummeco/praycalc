// praycalc/web/lib/push.ts — v1.1 push notification dispatch lib
// Spec §13.1, S19-H T35
//
// BullMQ workers dispatched by nSelf cron plugin ("praycalc-push-worker").
// Architecture:
//   1. PrayerSchedulerJob runs each minute via BullMQ repeatable job
//   2. For each user whose prayer time is within [now, now+5min], adds a
//      PushJob to the praycalc-push queue
//   3. PushWorker processes PushJobs: looks up push tokens, calls nSelf
//      notify plugin (server-side APNs / FCM dispatch)
//
// nSelf push plugin handles the actual APNs / FCM transport.
// This module NEVER calls APNs or FCM directly — always via nSelf API.

import "server-only";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PushJobData {
  userId:     string;
  prayerName: string;
  prayerTime: string;
  lat:        number;
  lng:        number;
  platform:   'ios' | 'android' | 'web' | 'tvos' | 'watchos' | 'wearos';
  token:      string;
  deviceId:   string;
  notifType:  'adhan' | 'pre_prayer' | 'reminder';
  /** Minutes before prayer (for pre-prayer / reminder types). 0 = at prayer time. */
  offsetMinutes: number;
}

export interface PrayerSchedulerJobData {
  runId:   string;   // ISO timestamp of job creation
  windowMins: number; // look-ahead window in minutes (default: 5)
}

// ---------------------------------------------------------------------------
// nSelf notify service (calls nSelf's push plugin endpoint)
// ---------------------------------------------------------------------------

const NSELF_API_URL  = process.env.NSELF_API_URL  ?? 'https://api.ummat.dev';
const NSELF_API_KEY  = process.env.NSELF_API_KEY  ?? '';  // from vault: NSELF_INTERNAL_API_KEY
const HASURA_URL     = process.env.HASURA_ADMIN_URL ?? 'https://api.ummat.dev/v1/graphql';
const HASURA_SECRET  = process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? '';

/**
 * Dispatches a push notification via nSelf notify plugin.
 * The plugin handles APNs, FCM, and Web Push transport.
 */
export async function dispatchPushNotification(job: PushJobData): Promise<void> {
  const payload = {
    token:    job.token,
    platform: job.platform,
    title:    `${job.prayerName} Prayer`,
    body:     job.notifType === 'adhan'
              ? `It is time for ${job.prayerName} prayer (${job.prayerTime}).`
              : `${job.prayerName} prayer in ${job.offsetMinutes} minutes.`,
    data: {
      prayer:     job.prayerName,
      prayerTime: job.prayerTime,
      type:       job.notifType,
      deviceId:   job.deviceId,
    },
    sound:     job.notifType === 'adhan' ? 'adhan_default.caf' : 'default',
    badge:     1,
    collapseId: `praycalc-${job.prayerName.toLowerCase()}-${job.userId}`,
  };

  const r = await fetch(`${NSELF_API_URL}/plugins/notify/send`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${NSELF_API_KEY}`,
      'X-Plugin-App':  'praycalc',
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`nSelf notify failed (${r.status}): ${text}`);
  }
}

// ---------------------------------------------------------------------------
// Hasura query helpers
// ---------------------------------------------------------------------------

export interface UserPushToken {
  userId:    string;
  token:     string;
  platform:  'ios' | 'android' | 'web' | 'tvos' | 'watchos' | 'wearos';
  deviceId:  string;
  enabled:   boolean;
}

export interface UserNotifPrefs {
  userId:        string;
  adhanEnabled:  boolean;
  preAlertMins1: number;  // 0 = disabled
  preAlertMins2: number;  // 0 = disabled
  reminderMins:  number;  // 0 = disabled
  lat:           number;
  lng:           number;
  method:        number;
  hanafi:        boolean;
  muteStart:     number;  // 0–2359 (HHMM) mute window start
  muteEnd:       number;  // 0–2359 (HHMM) mute window end
}

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const r = await fetch(HASURA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!r.ok) throw new Error(`Hasura request failed: ${r.status}`);
  const j = await r.json() as { data?: T; errors?: unknown[] };
  if (j.errors?.length) throw new Error(`Hasura errors: ${JSON.stringify(j.errors)}`);
  return j.data!;
}

/**
 * Fetches all users whose notification preferences indicate a push should
 * be sent at the given prayer time (within a lookahead window).
 */
export async function getUsersForPrayer(
  prayerName: string,
  windowStartUnix: number,
  windowEndUnix:   number,
): Promise<Array<{ prefs: UserNotifPrefs; tokens: UserPushToken[] }>> {
  type QueryResult = {
    pc_notification_prefs: Array<{
      user_id:         string;
      adhan_enabled:   boolean;
      pre_alert_mins1: number;
      pre_alert_mins2: number;
      reminder_mins:   number;
      lat:             number;
      lng:             number;
      calculation_method: number;
      hanafi:          boolean;
      mute_start:      number;
      mute_end:        number;
      push_tokens: Array<{
        token:     string;
        platform:  'ios' | 'android' | 'web' | 'tvos' | 'watchos' | 'wearos';
        device_id: string;
        enabled:   boolean;
      }>;
    }>;
  };

  const data = await graphql<QueryResult>(
    `query GetUsersForPrayer($enabled: Boolean!) {
      pc_notification_prefs(where: {
        adhan_enabled: {_eq: $enabled}
        push_tokens: { enabled: {_eq: true} }
      }) {
        user_id adhan_enabled pre_alert_mins1 pre_alert_mins2
        reminder_mins lat lng calculation_method hanafi mute_start mute_end
        push_tokens(where: { enabled: {_eq: true} }) {
          token platform device_id enabled
        }
      }
    }`,
    { enabled: true },
  );

  return data.pc_notification_prefs.map(row => ({
    prefs: {
      userId:        row.user_id,
      adhanEnabled:  row.adhan_enabled,
      preAlertMins1: row.pre_alert_mins1,
      preAlertMins2: row.pre_alert_mins2,
      reminderMins:  row.reminder_mins,
      lat:           row.lat,
      lng:           row.lng,
      method:        row.calculation_method,
      hanafi:        row.hanafi,
      muteStart:     row.mute_start,
      muteEnd:       row.mute_end,
    },
    tokens: row.push_tokens.map(t => ({
      userId:   row.user_id,
      token:    t.token,
      platform: t.platform,
      deviceId: t.device_id,
      enabled:  t.enabled,
    })),
  }));
}

/**
 * Checks if a time (HHMM integer) falls within a mute window.
 * Handles overnight windows (e.g. 2300–0600).
 */
export function isInMuteWindow(
  hhmm:       number,
  muteStart:  number,
  muteEnd:    number,
): boolean {
  if (muteStart === 0 && muteEnd === 0) return false;
  if (muteStart < muteEnd) {
    return hhmm >= muteStart && hhmm < muteEnd;
  }
  // Overnight window
  return hhmm >= muteStart || hhmm < muteEnd;
}
