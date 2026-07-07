/**
 * Purpose: Umami analytics helper for anonymous prayer-count events.
 * Inputs:  Prayer event type, optional ISO time string.
 * Outputs: Fires Umami beacon (POST /api/send) — no return value.
 * Constraints:
 *   - ZERO PII — no user ID, email, device ID, or geolocation in any event payload.
 *   - Anonymous events only: event name + generic properties (prayer type, locale).
 *   - No-op when EXPO_PUBLIC_UMAMI_URL is absent (graceful degradation).
 *   - CONSENT-GATED: no-op unless useConsentStore's analyticsConsent === 'granted'.
 *     Default-deny — 'unset' (not yet asked) and 'denied' both suppress every event.
 *     Read via useConsentStore.getState() (vanilla store access, no React hooks —
 *     this is a plain module, not a component).
 *   - Fires-and-forgets: analytics failures must never affect app functionality.
 *   - Locale reported only as language code (e.g. 'ar') — not full BCP-47 tag.
 * SPORT: praycalc/mobile — Umami analytics wired, consent-gated
 */

import i18next from '../i18n/index';
import { useConsentStore } from '../features/consent/store/useConsentStore';

/** True only when the user has explicitly granted analytics consent. */
function hasAnalyticsConsent(): boolean {
  return useConsentStore.getState().analyticsConsent === 'granted';
}

/** Recognised prayer event types */
export type PrayerEventType =
  | 'fajr'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha'
  | 'sunrise'
  | 'midnight'
  | 'lastThird';

/** Shape of a single Umami event payload (v2 API) */
interface UmamiEventPayload {
  /** Umami website ID */
  website: string;
  /** Event name (max 50 chars) */
  name: string;
  /** URL context — use a synthetic path for native apps */
  url: string;
  /** Hostname (app bundle ID as a stable identifier) */
  hostname: string;
  /** Additional non-PII properties */
  data?: Record<string, string | number | boolean>;
}

const UMAMI_URL = process.env.EXPO_PUBLIC_UMAMI_URL;
const UMAMI_WEBSITE_ID = process.env.EXPO_PUBLIC_UMAMI_WEBSITE_ID;
const APP_HOSTNAME = 'praycalc.app';

/**
 * Fire an anonymous Umami analytics beacon.
 * Returns immediately — does NOT await the network request.
 * All errors are swallowed silently to protect app stability.
 */
async function sendEvent(payload: UmamiEventPayload): Promise<void> {
  if (!UMAMI_URL || !UMAMI_WEBSITE_ID) return;
  // Single chokepoint consent gate — belt-and-suspenders on top of the per-function
  // checks, so any future caller of sendEvent is covered by default-deny too.
  if (!hasAnalyticsConsent()) return;

  try {
    await fetch(`${UMAMI_URL}/api/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'event', payload }),
    });
  } catch {
    // Analytics failures are non-fatal — swallow silently
  }
}

/**
 * Log an anonymous prayer time viewed/tapped event.
 *
 * @param type - Which prayer name was interacted with (e.g. 'fajr')
 * @param isoTime - Optional ISO-8601 time string; stripped to hour only (no location/date)
 *
 * Privacy guarantees:
 *   - No user ID, session token, or device fingerprint
 *   - No geolocation data (prayer time is universal, not location-specific)
 *   - No exact timestamp — only the hour (0–23) is reported
 *   - Locale reported as language code only
 */
export function logPrayerEvent(type: PrayerEventType, isoTime?: string): void {
  if (!UMAMI_URL || !UMAMI_WEBSITE_ID) return;
  if (!hasAnalyticsConsent()) return;

  // Strip isoTime to hour-of-day only — no date, no location context
  let hourOfDay: number | undefined;
  if (isoTime) {
    try {
      hourOfDay = new Date(isoTime).getUTCHours();
    } catch {
      // Invalid time string — omit the field entirely
    }
  }

  const data: Record<string, string | number | boolean> = {
    prayer: type,
    locale: i18next.language?.split('-')[0] ?? 'en',
  };

  if (hourOfDay !== undefined && !Number.isNaN(hourOfDay)) {
    data['hour_utc'] = hourOfDay;
  }

  void sendEvent({
    website: UMAMI_WEBSITE_ID,
    name: 'prayer_viewed',
    url: `/prayers/${type}`,
    hostname: APP_HOSTNAME,
    data,
  });
}

/**
 * Log an anonymous app open event.
 * No arguments — reports only that the app was opened.
 */
export function logAppOpen(): void {
  if (!UMAMI_URL || !UMAMI_WEBSITE_ID) return;
  if (!hasAnalyticsConsent()) return;

  void sendEvent({
    website: UMAMI_WEBSITE_ID,
    name: 'app_open',
    url: '/',
    hostname: APP_HOSTNAME,
    data: {
      locale: i18next.language?.split('-')[0] ?? 'en',
    },
  });
}
