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

export interface Settings {
  lat: number;
  lng: number;
  tz: string;
  city: string;
  method: string;
  hanafi: boolean;
  notifications: boolean;
  autostart: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  lat: 21.3891,
  lng: 39.8579,
  tz: 'Asia/Riyadh',
  city: 'Mecca',
  method: 'makkah',
  hanafi: false,
  notifications: true,
  autostart: false,
};

export const METHODS = [
  { value: 'mwl', label: 'Muslim World League' },
  { value: 'isna', label: 'ISNA (North America)' },
  { value: 'egypt', label: 'Egyptian Authority' },
  { value: 'makkah', label: 'Umm al-Qura (Makkah)' },
  { value: 'karachi', label: 'University of Karachi' },
];

export const PRESET_CITIES: { name: string; lat: number; lng: number; tz: string }[] = [
  { name: 'Mecca', lat: 21.3891, lng: 39.8579, tz: 'Asia/Riyadh' },
  { name: 'Medina', lat: 24.4686, lng: 39.6142, tz: 'Asia/Riyadh' },
  { name: 'New York', lat: 40.7128, lng: -74.006, tz: 'America/New_York' },
  { name: 'London', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, tz: 'Asia/Dubai' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, tz: 'Africa/Cairo' },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784, tz: 'Europe/Istanbul' },
  { name: 'Karachi', lat: 24.8607, lng: 67.0011, tz: 'Asia/Karachi' },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456, tz: 'Asia/Jakarta' },
  { name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, tz: 'Asia/Kuala_Lumpur' },
];
