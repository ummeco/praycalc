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
  perPrayerAdhanEnabled: Record<PrayerName, boolean>;
  locale: string;

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
  setPerPrayerAdhanEnabled: (prayer: PrayerName, enabled: boolean) => void;
  setLocale: (locale: string) => void;
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
  perPrayerAdhanEnabled: defaultPerPrayer(true, false),
  locale: 'en',
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
      setPerPrayerAdhanEnabled: (prayer, enabled) =>
        set((s) => ({ perPrayerAdhanEnabled: { ...s.perPrayerAdhanEnabled, [prayer]: enabled } })),
      setLocale: (locale) => set({ locale }),
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
