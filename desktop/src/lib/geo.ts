/**
 * geo.ts — Geo-IP location detection for desktop "Detect Location" (Settings > Location).
 *
 * Purpose: best-effort auto-detect of the user's city/lat/lng/timezone from their public
 * IP address, for the "Detect Location" button at the top of the location settings tab.
 * Inputs: none (reads the caller's own public IP server-side, via ipapi.co).
 * Outputs: DetectedLocation ({city,lat,lng,tz}) or null if detection fails.
 * Constraints: Tauri has no built-in geolocation plugin, so this calls a public geo-IP
 * HTTP endpoint directly from the renderer (no native permission prompt needed). Network
 * failures / rate limits degrade gracefully to null — caller falls back to manual entry
 * or the preset city picker.
 */

import type { DetectedLocation } from './ipc-types';

interface IpapiResponse {
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  error?: boolean;
  reason?: string;
}

/** Look up the caller's approximate location from their public IP via ipapi.co. */
export async function detectLocationByIp(): Promise<DetectedLocation | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as IpapiResponse;
    if (data.error || !data.city || typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
      return null;
    }
    return {
      city: data.city,
      lat: data.latitude,
      lng: data.longitude,
      tz: data.timezone,
    };
  } catch {
    return null;
  }
}
