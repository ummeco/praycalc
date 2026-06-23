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

export interface CityCoords {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

export type Madhab = 'Shafi' | 'Hanafi';

export type HighLatRule = 'NightMiddle' | 'AngleBased' | 'OneSeventh' | 'None';

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
