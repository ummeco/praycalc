/**
 * Purpose: Shared type definitions for praycalc/mobile.
 * Inputs: N/A — pure type declarations.
 * Outputs: Types consumed across all features.
 * Constraints: No runtime code; types only.
 */

// ── Prayer ────────────────────────────────────────────────────────────────────

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTime {
  name: PrayerName;
  label: string;
  timestamp: number; // Unix ms
  formattedTime: string;
  isNext: boolean;
  isCompleted: boolean;
}

export interface PrayerDay {
  date: string; // ISO 8601 YYYY-MM-DD
  cityId: string;
  prayers: PrayerTime[];
}

// ── City ──────────────────────────────────────────────────────────────────────

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
}

// ── Settings ──────────────────────────────────────────────────────────────────

export type CalcMethod =
  | 'MWL'
  | 'ISNA'
  | 'Egypt'
  | 'Makkah'
  | 'Karachi'
  | 'Tehran' // kept in type for data compat but excluded from UI per D-P3-19
  | 'Gulf'
  | 'Custom';

export type AsrMadhab = 'shafi' | 'hanafi';

export type HighLatRule = 'NightMiddle' | 'AngleBased' | 'OneSeventh' | 'None';

export interface UserSettings {
  cityId: string | null;
  city: City | null;
  calcMethod: CalcMethod;
  asrMadhab: AsrMadhab;
  highLatRule: HighLatRule;
  timeFormat: '12h' | '24h';
  locale: string;
  adhanEnabled: Record<PrayerName, boolean>;
  notificationsEnabled: boolean;
  musafirMode: boolean; // Travel mode — user manually toggles qasr
}

// ── Adhan ─────────────────────────────────────────────────────────────────────

export interface AdhanVoice {
  id: string;
  name: string;
  reciter: string;
  audioUrl: string;
  isDefault: boolean;
  isPro: boolean;
}

// ── Tasbeeh ───────────────────────────────────────────────────────────────────

export interface DhikrPreset {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  targetCount: number;
  source: string; // e.g. "Sahih Bukhari 6406"
}

export interface TasbeehSession {
  dhikrId: string;
  count: number;
  targetCount: number;
  completedAt: number | null;
}

// ── Dua / Adhkar ──────────────────────────────────────────────────────────────

export interface Dua {
  id: string;
  category: DuaCategory;
  arabic: string;         // Full tashkeel Unicode — NEVER split with JS string methods
  transliteration: string;
  translation: string;
  source: string;         // e.g. "Hisn al-Muslim #1" or "Sahih Bukhari 1234"
  benefits?: string;
}

export type DuaCategory =
  | 'morning'
  | 'evening'
  | 'afterFajr'
  | 'afterMaghrib'
  | 'postPrayer'
  | 'sleep'
  | 'wakeup'
  | 'eating'
  | 'travel'
  | 'general';

// ── Moon ──────────────────────────────────────────────────────────────────────

export type MoonPhase =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export interface MoonData {
  phase: MoonPhase;
  illumination: number; // 0-1
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  hijriMonthName: string;
  nextNewMoon: Date;
  nextFullMoon: Date;
}

// ── Quran ─────────────────────────────────────────────────────────────────────

export interface Surah {
  number: number;
  arabicName: string;      // Full tashkeel — RTL
  transliteratedName: string;
  englishName: string;
  verseCount: number;
  revelationType: 'meccan' | 'medinan';
  juzNumber: number;
}

export interface Ayah {
  surahNumber: number;
  ayahNumber: number;
  arabic: string;          // Full tashkeel Uthmani script
  transliteration: string;
  translation: string;
  isBookmarked: boolean;
}

// ── Ramadan ───────────────────────────────────────────────────────────────────

export interface RamadanDay {
  hijriDay: number;
  gregorianDate: string;
  suhoorTime: string;
  iftarTime: string;
  isFasting: boolean;
  specialEvent?: string; // e.g. "Laylat al-Qadr (27th)"
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface PrayerCompletion {
  date: string;
  prayerName: PrayerName;
  completedAt: number | null;
}

export interface PrayerStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  weeklyRate: number; // 0-1
  monthlyRate: number;
  byPrayer: Record<PrayerName, number>; // count of completions
}

// ── IAP ───────────────────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'pro';

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
  subscriptionPeriod: 'monthly' | 'annual';
}

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  expiresAt: number | null;
  isLifetime: boolean;
  productId: string | null;
}

// ── Agenda ────────────────────────────────────────────────────────────────────

export interface Agenda {
  id: string;
  prayerName: PrayerName;
  calendarEventId: string | null;
  calendarId: string | null;
  enabled: boolean;
  note?: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationSettings {
  enabled: boolean;
  advanceMinutes: Record<PrayerName, number>; // minutes before prayer
  adhanEnabled: Record<PrayerName, boolean>;
  soundEnabled: boolean;
}

// ── UI States ─────────────────────────────────────────────────────────────────

export type UIState =
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'offline'
  | 'permission-denied'
  | 'skeleton';
