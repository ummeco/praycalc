export type HomeMode = "none" | "city" | "location";
// Gate B (P2-E5-W02-S02-T02): "pashaii" removed — reciter identity unverifiable,
// decision-tree outcome C. Fallback in getSettings() migrates persisted value.
export type AdhanVoice = "mishari" | "makkah";

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
    const stored = { ...DEFAULTS, ...JSON.parse(raw) } as PrayCalcSettings;
    // Sanitize: migrate persisted "pashaii" → default "makkah" (Gate B removal, P2-E5-W02-S02-T02)
    if ((stored.adhanVoice as string) === "pashaii") {
      stored.adhanVoice = "makkah";
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
  if (typeof window === "undefined") return;
  try {
    const current = getSettings();
    localStorage.setItem(KEY, JSON.stringify({ ...current, [key]: value }));
  } catch {
    // localStorage unavailable (private browsing with full quota, etc.)
  }
}
