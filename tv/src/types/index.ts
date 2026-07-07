/**
 * Purpose: Shared type definitions for PrayCalc TV app
 * Inputs: Used across screens, stores, and navigation
 * Outputs: Exported TypeScript interfaces and enums
 * Constraints: react-native-tvos; no DOM APIs
 * SPORT: praycalc/tv types registry
 */

export interface PrayerTime {
  name: PrayerName;
  time: string; // ISO 8601 time string
  isNext: boolean;
  isCompleted: boolean;
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerDay {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
  hijriDate?: string;
  hijriMonth?: string;
  hijriYear?: string;
}

export interface CityLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CalculationMethod {
  id: string;
  name: string;
  nameAr: string;
  fajrAngle: number;
  ishaAngle: number;
  ishaInterval?: number;
}

export type Madhab = 'shafi' | 'hanafi';

export interface TvSettings {
  cityId: string;
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  calculationMethodId: string;
  madhab: Madhab;
  language: 'en' | 'ar';
  autoAdvanceScreens: boolean;
  screensaverTimeoutMinutes: number;
  displayBrightness: number;
  adhanVolume: number;
  prayerVolumes: Partial<Record<PrayerName, number>>;
  // --- Dashboard cosmetic settings (synced from pc_tv_settings, public role) ---
  /** Accent color for the prayer rail / next-prayer highlight. Hex string. */
  accentColor: string;
  /** Stream source id from the built-in stream library (or 'none' to disable). */
  streamSource: string;
  /** Minutes between content-rotation cycles (1–30). */
  rotateMinutes: number;
  /** Whether the bottom weather/special-day bar is shown. */
  showWeather: boolean;
}

/** Cosmetic settings row shape from pc_tv_settings (public-role selectable columns). */
export interface TvRemoteSettings {
  accent_color?: string | null;
  stream_source?: string | null;
  rotate_minutes?: number | null;
  show_weather?: boolean | null;
}

export interface HadithEntry {
  id: string;
  textAr: string;
  textEn: string;
  source: string;
  narrator: string;
  grading: string;
}

export interface DuaEntry {
  id: string;
  titleAr: string;
  titleEn: string;
  textAr: string;
  textEn: string;
  transliteration: string;
  source: string;
}

export interface IslamicEvent {
  id: string;
  nameAr: string;
  nameEn: string;
  hijriDate: string;
  gregorianDate: string;
  isSignificant: boolean;
}

export interface MoonPhase {
  phase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  illumination: number; // 0–1
  ageInDays: number;
  hijriDay: number;
}

export interface PairingState {
  pin: string;
  isPaired: boolean;
  userId?: string;
  deviceId: string;
  /** Location carried on the pairing row (persisted as the TV's location on success). */
  location?: TvPairingLocation;
}

/** Location fields carried on the pc_tv_pairing row and persisted to settings on pair. */
export interface TvPairingLocation {
  latitude: number;
  longitude: number;
  city: string;
  timezone: string;
}

// Navigation screen param types
export type RootStackParamList = {
  Dashboard: undefined;
  Home: undefined;
  Qibla: undefined;
  Calendar: undefined;
  HadithOfDay: undefined;
  DuaDisplay: { duaId?: string };
  AdhanSettings: undefined;
  NotificationSchedule: undefined;
  CitySearch: undefined;
  Pairing: undefined;
  Settings: undefined;
  About: undefined;
  Ramadan: undefined;
  MoonPhase: undefined;
  IslamicEvents: undefined;
  Screensaver: undefined;
  TvSystem: undefined;
};
