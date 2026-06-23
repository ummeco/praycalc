/**
 * settings.ts — PrayCalc user settings with localStorage persistence.
 *
 * PURPOSE: User preferences for prayer display (madhab, time format, etc.)
 *   Client-side only (localStorage). Safe for React islands.
 * INPUTS: Setting keys and values
 * OUTPUTS: PrayCalcSettings object
 * CONSTRAINTS: No server-only imports, no Node.js APIs
 * REF: P2-E3-W02-S02-T03
 */

export type HomeMode = 'none' | 'city' | 'location';
// Gate B (P2-E5-W02-S02-T02): "pashaii" removed — reciter identity unverifiable,
// decision-tree outcome C. Fallback in getSettings() migrates persisted value.
export type AdhanVoice = 'mishari' | 'makkah';
export type HijriCalendarSetting = 'umm-al-qura' | 'astronomical' | 'moonsighting';

export interface PrayCalcSettings {
  hanafi: boolean;
  use24h: boolean;
  lightMode: boolean;
  soundMode: 'none' | 'beep' | 'adhan';
  adhanVoice: AdhanVoice;
  countdown: boolean;
  showQiyam: boolean;
  homeMode: HomeMode;
  homeCity: { slug: string; name: string } | null;
  /** Hijri calendar method. Default: "umm-al-qura" (D-P7-21). */
  hijriCalendar: HijriCalendarSetting;
}

const KEY = 'praycalc-settings';

const DEFAULTS: PrayCalcSettings = {
  hanafi: false,
  use24h: false,
  lightMode: false,
  soundMode: 'none',
  adhanVoice: 'makkah',
  countdown: false,
  showQiyam: false,
  homeMode: 'none',
  homeCity: null,
  hijriCalendar: 'umm-al-qura',
};

export function getSettings(): PrayCalcSettings {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const stored = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<PrayCalcSettings>) };
    // Sanitize: migrate persisted "pashaii" → default "makkah" (Gate B removal, P2-E5-W02-S02-T02)
    if ((stored.adhanVoice as string) === 'pashaii') {
      stored.adhanVoice = 'makkah';
    }
    return stored;
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSetting<K extends keyof PrayCalcSettings>(
  key: K,
  value: PrayCalcSettings[K],
): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSettings();
    localStorage.setItem(KEY, JSON.stringify({ ...current, [key]: value }));
  } catch {
    // localStorage unavailable (private mode, etc.)
  }
}
