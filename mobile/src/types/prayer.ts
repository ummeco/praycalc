/**
 * Purpose: Shared TypeScript types for prayer time feature
 * Inputs: none
 * Outputs: PrayerName, PrayerTimes, CityCoords types
 * Constraints: Strict typing, no 'any'. 6 prayer names only.
 * SPORT: REGISTRY-PACKAGES.md#praycalc-mobile-types
 */

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerTimes {
  Fajr: Date;
  Sunrise: Date;
  Dhuhr: Date;
  Asr: Date;
  Maghrib: Date;
  Isha: Date;
}

/** Prayer times plus the origin of the two substitutable ones. */
export interface DetailedPrayerTimes {
  times: PrayerTimes;
  provenance: PrayerProvenance;
}

export interface CityCoords {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

export type Madhab = 'Shafi' | 'Hanafi';

/**
 * High-latitude substitution rule for Fajr and Isha.
 *
 * The first three divide the night between sunset and sunrise, so they need both events
 * to exist — they cover "no true darkness" latitudes and do nothing inside the polar
 * circles, where neither occurs. `AqrabAlBilad` and `AqrabAlAyyam` borrow from a place or
 * a date where the sign is observable and are the only rules that reach those latitudes.
 */
export type HighLatRule =
  | 'NightMiddle'
  | 'AngleBased'
  | 'OneSeventh'
  | 'AqrabAlBilad'
  | 'AqrabAlAyyam'
  | 'None';

/**
 * Where a displayed prayer time came from: solved from the sun's real position, supplied
 * by a high-latitude rule, or absent entirely.
 *
 * Past the geometric limit a time is a juristic choice rather than a calculation, so the
 * UI marks substituted times instead of presenting them as computed.
 */
export type PrayerTimeSource = 'observed' | HighLatRule | 'unavailable';

/** Origin of Fajr and Isha for one day's result. */
export interface PrayerProvenance {
  Fajr: PrayerTimeSource;
  Isha: PrayerTimeSource;
}

export type TimeFormat = '12h' | '24h';

export interface UserSettings {
  method: string;
  madhab: Madhab;
  highLatRule: HighLatRule;
  location: CityCoords | null;
  timeFormat: TimeFormat;
  notificationsEnabled: boolean;
  notificationOffset: number; // minutes before prayer
  locale: string;
}
