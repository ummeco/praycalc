export type HomeMode = "none" | "city" | "location";
export type AdhanVoice = "mishari" | "makkah" | "pashaii";

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
