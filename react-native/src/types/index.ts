/**
 * Purpose: Shared domain types for PrayCalc mobile app
 * Inputs: n/a (type declarations only)
 * Outputs: Prayer, Location, Settings, Notification type shapes
 * Constraints: Mirror pray-calc npm package types where applicable
 * SPORT: types/index.ts
 */

// ── Prayer times ──────────────────────────────────────────────────────────────

/** Names of the five daily prayers plus Sunrise and Qiyam. */
export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' | 'Qiyam';

/** A single prayer with its name and epoch-ms timestamp. */
export interface Prayer {
  name: PrayerName;
  timeMs: number; // Unix milliseconds in local wall time
  label: string;  // Formatted HH:MM string (12 or 24h)
}

/** Full set of prayer times for one day. */
export interface DailyPrayerTimes {
  date: Date;
  prayers: Prayer[];
  nextPrayer: Prayer | null;
  minutesUntilNext: number;
}

// ── Location ──────────────────────────────────────────────────────────────────

export interface UserLocation {
  lat: number;
  lng: number;
  timezone: string;   // IANA timezone string e.g. "America/New_York"
  cityName: string;
  utcOffsetHours: number;
}

// ── Calculation method ────────────────────────────────────────────────────────

export type AsrMethod = 'shafii' | 'hanafi';

/** Supported fixed-angle calculation methods from pray-calc METHODS list. */
export type CalcMethodId =
  | 'dynamic'  // Physics-based dynamic twilight angle (default)
  | 'isna'
  | 'mwl'
  | 'egypt'
  | 'makkah'
  | 'karachi'
  | 'tehran'
  | 'jafari';

export interface CalcSettings {
  method: CalcMethodId;
  asrMethod: AsrMethod;
  use24h: boolean;
  darkMode: boolean;
  locale: string | null; // null = system default
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotifTrigger = 'at_adhan' | 'pre_5' | 'pre_10' | 'pre_15' | 'pre_30';

export interface PrayerNotifConfig {
  prayerName: PrayerName;
  enabled: boolean;
  triggers: NotifTrigger[];
  soundEnabled: boolean;
}

export interface NotifSettings {
  globalEnabled: boolean;
  prayers: Record<PrayerName, PrayerNotifConfig>;
}

// ── Qibla ─────────────────────────────────────────────────────────────────────

export interface QiblaData {
  bearingDeg: number;       // True bearing to Mecca (0–360)
  compassHeading: number;   // Current device heading (0–360), -1 if unavailable
  /** Degrees to rotate the Kaaba indicator clockwise from north. */
  kaabaDeg: number;
  distanceKm: number;       // Distance from user to Mecca
  directionLabel: string;   // e.g. "NE", "SSW"
}
