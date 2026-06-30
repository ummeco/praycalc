export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerEntry {
  name: PrayerName;
  time: string; // "HH:MM" 24h
}

export interface PrayerTimesResponse {
  date: string;
  prayers: PrayerEntry[];
  method: string;
}

export type DisplayMode = 'countdown' | 'time';
export type NameFormat = 'abbrev' | 'full';
export type CountdownPrefix = 'minus' | 'none' | 'in';

export interface Settings {
  lat: number;
  lng: number;
  tz: string;
  city: string;
  method: string;
  hanafi: boolean;
  notifications: boolean;
  autostart: boolean;
  displayMode: DisplayMode;
  nameFormat: NameFormat;
  showIcon: boolean;
  arabicMode: boolean;
  adhan: 'makkah' | 'mishari';
  showSeconds: boolean;
  countdownPrefix: CountdownPrefix;
}

export const DEFAULT_SETTINGS: Settings = {
  lat: 41.5565,
  lng: -80.5595,
  tz: 'America/New_York',
  city: 'Conneaut',
  method: 'isna',
  hanafi: false,
  notifications: true,
  autostart: false,
  displayMode: 'countdown',
  nameFormat: 'abbrev',
  showIcon: true,
  arabicMode: false,
  adhan: 'makkah',
  showSeconds: true,
  countdownPrefix: 'minus',
};

export const METHODS = [
  { value: 'isna', label: 'ISNA (North America)' },
  { value: 'mwl', label: 'Muslim World League' },
  { value: 'egypt', label: 'Egyptian Authority' },
  { value: 'makkah', label: 'Umm al-Qura (Makkah)' },
  { value: 'karachi', label: 'University of Karachi' },
  { value: 'tehran', label: 'Institute of Geophysics, Tehran' },
  { value: 'gulf', label: 'Gulf Region' },
  { value: 'kuwait', label: 'Kuwait' },
  { value: 'qatar', label: 'Qatar' },
  { value: 'singapore', label: 'Majlis Ugama Islam Singapura' },
  { value: 'france', label: 'Union Organization Islamic de France' },
  { value: 'turkey', label: 'Diyanet İşleri Başkanlığı, Turkey' },
  { value: 'russia', label: 'Spiritual Administration of Muslims of Russia' },
];

export const PRESET_CITIES: { name: string; lat: number; lng: number; tz: string }[] = [
  { name: 'Conneaut', lat: 41.5565, lng: -80.5595, tz: 'America/New_York' },
  { name: 'Mecca', lat: 21.3891, lng: 39.8579, tz: 'Asia/Riyadh' },
  { name: 'Medina', lat: 24.4686, lng: 39.6142, tz: 'Asia/Riyadh' },
  { name: 'New York', lat: 40.7128, lng: -74.006, tz: 'America/New_York' },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298, tz: 'America/Chicago' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
  { name: 'London', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, tz: 'Asia/Dubai' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, tz: 'Africa/Cairo' },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784, tz: 'Europe/Istanbul' },
  { name: 'Karachi', lat: 24.8607, lng: 67.0011, tz: 'Asia/Karachi' },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456, tz: 'Asia/Jakarta' },
  { name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, tz: 'Asia/Kuala_Lumpur' },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832, tz: 'America/Toronto' },
  { name: 'Detroit', lat: 42.3314, lng: -83.0458, tz: 'America/Detroit' },
];
