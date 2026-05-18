export type HomeMode = "none" | "city" | "location";
export type AdhanVoice = "mishari" | "makkah" | "pashaii";

/**
 * Hijri calendar display method.
 *
 * - "astronomical": pure astronomical calculation (Kuwaiti algorithm via luxon-hijri)
 * - "umm-al-qura": Saudi Umm al-Qura approximation (+1 day offset from astronomical)
 * - "moonsighting": Moonsighting Committee Worldwide approximation (+1 day offset)
 *
 * ⚠️  FLAG FOR ISLAMIC REVIEW: the umm-al-qura and moonsighting offsets are
 * approximations. Actual UQ and MCW dates may differ by ±1 day from this
 * implementation depending on the year and region.
 */
export type HijriCalendarSetting = "astronomical" | "umm-al-qura" | "moonsighting";

export interface PrayCalcSettings {
  hanafi: boolean;
  use24h: boolean;
  lightMode: boolean;
  soundMode: "none" | "beep" | "adhan";
  adhanVoice: AdhanVoice;
  countdown: boolean;
  showQiyam: boolean;
  homeMode: HomeMode;
  homeCity: { slug: string; name: string } | null;
  /** Hijri calendar display method. Default: "astronomical". */
  hijriCalendar: HijriCalendarSetting;
}

const KEY = "praycalc-settings";

const DEFAULTS: PrayCalcSettings = {
  hanafi: false,
  use24h: false,
  lightMode: false,
  soundMode: "none",
  adhanVoice: "makkah",
  countdown: false,
  showQiyam: false,
  homeMode: "none",
  homeCity: null,
  hijriCalendar: "astronomical",
};

export function getSettings(): PrayCalcSettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSetting<K extends keyof PrayCalcSettings>(
  key: K,
  value: PrayCalcSettings[K],
): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSettings();
    localStorage.setItem(KEY, JSON.stringify({ ...current, [key]: value }));
  } catch {
    // localStorage unavailable (private browsing with full quota, etc.)
  }
}
