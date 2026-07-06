/**
 * Purpose: Zustand v5 settings store for PrayCalc — calculation method, madhab,
 *   location (home + travel), per-prayer notification/adhan preferences, time format.
 *   Single source of truth persisted via AsyncStorage; all downstream services
 *   (notifications, calendar sync, Ramadan/agenda screens) read from here instead
 *   of local component state.
 * Inputs: Actions from SettingsScreen, NotificationSettingsScreen, AdhanScreen, TravelScreen.
 * Outputs: Settings state + updaters + useActiveLocation() selector.
 * Constraints: No Tehran/Jafari method (D-P3-19). Persisted per zustand v5 pattern.
 *   `location` is always the user's HOME city — travel city selection must go through
 *   setTravelLocation(), never setLocation(), so musafir mode never clobbers home.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-settings-store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CityCoords, Madhab, HighLatRule, TimeFormat, PrayerName } from '../../../types/prayer';
import { DEFAULT_METHOD } from '../../../constants/methods';

/** Prayers notifications/adhan can be configured for (Sunrise excluded — no salah). */
const NOTIFIABLE_PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function defaultPerPrayer<T>(value: T, sunriseValue: T): Record<PrayerName, T> {
  const map = {} as Record<PrayerName, T>;
  for (const name of NOTIFIABLE_PRAYERS) map[name] = value;
  map.Sunrise = sunriseValue;
  return map;
}

/** Theme preference — 'system' follows the OS appearance. */
export type ThemeMode = 'system' | 'light' | 'dark';

/** Clamp bounds for manual tuning (match Muslim Pro/Athan conventions). */
const MINUTE_ADJUST_LIMIT = 30; // ± minutes per prayer
const HIJRI_ADJUST_LIMIT = 2; // ± days (local moon-sighting offset)

export interface SettingsState {
  method: string;
  customFajrAngle: number;
  customIshaAngle: number;
  madhab: Madhab;
  highLatRule: HighLatRule;
  location: CityCoords | null;
  travelLocation: CityCoords | null;
  musafirMode: boolean;
  timeFormat: TimeFormat;
  notificationsEnabled: boolean;
  perPrayerNotificationEnabled: Record<PrayerName, boolean>;
  notificationAdvanceMinutes: Record<PrayerName, number>;
  adhanVoiceId: string | null;
  /** Streaming URL + display name of the selected adhan voice, persisted alongside
   *  the id so the notification-tap handler can play it without a network round-trip. */
  adhanVoiceUrl: string | null;
  adhanVoiceName: string | null;
  perPrayerAdhanEnabled: Record<PrayerName, boolean>;
  locale: string;
  /** True once the first-launch onboarding flow has completed (or been skipped). */
  onboardingDone: boolean;
  /** Per-prayer manual minute corrections (±30) applied after calculation, to match a local mosque timetable. */
  prayerMinuteAdjustments: Record<PrayerName, number>;
  /** Minutes after adhan for an iqamah reminder notification (0 = off, max 60). */
  iqamahOffsetMinutes: Record<PrayerName, number>;
  /** Hijri date offset in days (±2) for local moon-sighting differences vs Umm al-Qura. */
  hijriDayAdjustment: number;
  themeMode: ThemeMode;

  // Actions
  setMethod: (method: string) => void;
  setCustomAngles: (fajr: number, isha: number) => void;
  setMadhab: (madhab: Madhab) => void;
  setHighLatRule: (rule: HighLatRule) => void;
  setLocation: (location: CityCoords | null) => void;
  setTravelLocation: (location: CityCoords | null) => void;
  setMusafirMode: (enabled: boolean) => void;
  setTimeFormat: (format: TimeFormat) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setPerPrayerNotificationEnabled: (prayer: PrayerName, enabled: boolean) => void;
  setNotificationAdvanceMinutes: (prayer: PrayerName, minutes: number) => void;
  setAdhanVoiceId: (id: string | null) => void;
  setAdhanVoice: (id: string, url: string, name: string) => void;
  setPerPrayerAdhanEnabled: (prayer: PrayerName, enabled: boolean) => void;
  setLocale: (locale: string) => void;
  setOnboardingDone: (done: boolean) => void;
  setPrayerMinuteAdjustment: (prayer: PrayerName, minutes: number) => void;
  setIqamahOffsetMinutes: (prayer: PrayerName, minutes: number) => void;
  setHijriDayAdjustment: (days: number) => void;
  setThemeMode: (mode: ThemeMode) => void;
  reset: () => void;
}

const initialState = {
  method: DEFAULT_METHOD,
  customFajrAngle: 15,
  customIshaAngle: 15,
  madhab: 'Shafi' as Madhab,
  highLatRule: 'NightMiddle' as HighLatRule,
  location: null as CityCoords | null,
  travelLocation: null as CityCoords | null,
  musafirMode: false,
  timeFormat: '12h' as TimeFormat,
  notificationsEnabled: false,
  perPrayerNotificationEnabled: defaultPerPrayer(true, false),
  notificationAdvanceMinutes: { Fajr: 10, Sunrise: 0, Dhuhr: 5, Asr: 5, Maghrib: 5, Isha: 5 } as Record<PrayerName, number>,
  adhanVoiceId: null as string | null,
  adhanVoiceUrl: null as string | null,
  adhanVoiceName: null as string | null,
  perPrayerAdhanEnabled: defaultPerPrayer(true, false),
  locale: 'en',
  onboardingDone: false,
  prayerMinuteAdjustments: defaultPerPrayer(0, 0),
  iqamahOffsetMinutes: defaultPerPrayer(0, 0),
  hijriDayAdjustment: 0,
  themeMode: 'system' as ThemeMode,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,

      setMethod: (method) => set({ method }),
      setCustomAngles: (fajr, isha) => set({ customFajrAngle: fajr, customIshaAngle: isha }),
      setMadhab: (madhab) => set({ madhab }),
      setHighLatRule: (highLatRule) => set({ highLatRule }),
      setLocation: (location) => set({ location }),
      setTravelLocation: (travelLocation) => set({ travelLocation }),
      setMusafirMode: (musafirMode) => set({ musafirMode }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setPerPrayerNotificationEnabled: (prayer, enabled) =>
        set((s) => ({ perPrayerNotificationEnabled: { ...s.perPrayerNotificationEnabled, [prayer]: enabled } })),
      setNotificationAdvanceMinutes: (prayer, minutes) =>
        set((s) => ({ notificationAdvanceMinutes: { ...s.notificationAdvanceMinutes, [prayer]: minutes } })),
      setAdhanVoiceId: (adhanVoiceId) => set({ adhanVoiceId }),
      setAdhanVoice: (adhanVoiceId, adhanVoiceUrl, adhanVoiceName) =>
        set({ adhanVoiceId, adhanVoiceUrl, adhanVoiceName }),
      setPerPrayerAdhanEnabled: (prayer, enabled) =>
        set((s) => ({ perPrayerAdhanEnabled: { ...s.perPrayerAdhanEnabled, [prayer]: enabled } })),
      setLocale: (locale) => set({ locale }),
      setOnboardingDone: (onboardingDone) => set({ onboardingDone }),
      setPrayerMinuteAdjustment: (prayer, minutes) =>
        set((s) => ({
          prayerMinuteAdjustments: {
            ...s.prayerMinuteAdjustments,
            [prayer]: Math.max(-MINUTE_ADJUST_LIMIT, Math.min(MINUTE_ADJUST_LIMIT, Math.round(minutes))),
          },
        })),
      setIqamahOffsetMinutes: (prayer, minutes) =>
        set((s) => ({
          iqamahOffsetMinutes: {
            ...s.iqamahOffsetMinutes,
            [prayer]: Math.max(0, Math.min(60, Math.round(minutes))),
          },
        })),
      setHijriDayAdjustment: (days) =>
        set({ hijriDayAdjustment: Math.max(-HIJRI_ADJUST_LIMIT, Math.min(HIJRI_ADJUST_LIMIT, Math.round(days))) }),
      setThemeMode: (themeMode) => set({ themeMode }),
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'praycalc-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/**
 * The location calculations should actually use: the travel city while musafir
 * mode is on (and one is set), otherwise home. Home (`location`) is never mutated
 * by travel city selection, so turning musafir mode off always restores it exactly.
 */
export function useActiveLocation(): CityCoords | null {
  return useSettingsStore((s) => (s.musafirMode && s.travelLocation ? s.travelLocation : s.location));
}
