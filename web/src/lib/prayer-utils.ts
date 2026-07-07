/**
 * prayer-utils.ts — Pure prayer-time utilities.
 *
 * PURPOSE: Shared constants, types, and helpers for prayer time display.
 *   No pray-calc/nrel-spa dependency — safe for client islands.
 * INPUTS: PrayerResult objects, time strings "HH:MM:SS"
 * OUTPUTS: Formatted time strings, next prayer key
 * CONSTRAINTS: No server-only imports, no Node.js APIs
 * REF: P2-E3-W02-S02-T03 · D-P2-STACK-CANON
 */

export interface PrayerResult {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Qiyam: string;
}

export interface PrayerMeta {
  en: string;
  ar: string;
}

export const PRAYER_META: Record<keyof PrayerResult, PrayerMeta> = {
  Fajr:    { en: 'Fajr',    ar: 'الفجر'  },
  Sunrise: { en: 'Sunrise', ar: 'الشروق' },
  Dhuhr:   { en: 'Dhuhr',   ar: 'الظهر'  },
  Asr:     { en: 'Asr',     ar: 'العصر'  },
  Maghrib: { en: 'Maghrib', ar: 'المغرب' },
  Isha:    { en: 'Isha',    ar: 'العشاء'  },
  Qiyam:  { en: 'Qiyam',  ar: 'القيام'  },
};

export const DISPLAY_PRAYERS: Array<keyof PrayerResult> = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];

/**
 * Calculation-method options for the client method picker. DPC (the dynamic
 * flagship) is first and recommended; the rest are pray-calc fixed presets.
 * Kept client-safe here (no pray-calc import); the server validates any id via
 * isKnownMethod() in prayers.server.ts, which is the source of truth for the
 * full accepted set. This is the curated, user-facing subset.
 */
export interface CalcMethodOption {
  id: string;
  label: string;
  recommended: boolean;
}

export const CALC_METHOD_OPTIONS: CalcMethodOption[] = [
  { id: 'DPC', label: 'Dynamic (PrayCalc DPC) — Recommended', recommended: true },
  { id: 'MWL', label: 'Muslim World League', recommended: false },
  { id: 'ISNA', label: 'ISNA (North America)', recommended: false },
  { id: 'Egypt', label: 'Egyptian General Authority', recommended: false },
  { id: 'Karachi', label: 'University of Islamic Sciences, Karachi', recommended: false },
  { id: 'UAQ', label: 'Umm al-Qura, Makkah', recommended: false },
  { id: 'Qatar', label: 'Qatar', recommended: false },
  { id: 'Kuwait', label: 'Kuwait', recommended: false },
  { id: 'MUIS', label: 'Singapore (MUIS)', recommended: false },
  { id: 'UOIF', label: 'France (UOIF)', recommended: false },
  { id: 'DIBT', label: 'Diyanet (Türkiye)', recommended: false },
  { id: 'MSC', label: 'Moonsighting Committee', recommended: false },
];

/** Format HH:MM:SS → 12-hour or 24-hour display */
export function fmtTime(
  time: string,
  use24h = false,
): { time: string; period: string } {
  if (time === 'N/A') return { time: 'N/A', period: '' };
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr!, 10);
  const m = mStr ?? '00';
  if (use24h) {
    return { time: `${h.toString().padStart(2, '0')}:${m}`, period: '' };
  }
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { time: `${h12}:${m}`, period };
}

/** Returns the next prayer key given current HH:MM. */
export function getNextPrayer(
  prayers: PrayerResult,
  currentTimeHHMM: string,
  list: Array<keyof PrayerResult> = DISPLAY_PRAYERS,
): keyof PrayerResult {
  for (const p of list) {
    if (prayers[p] !== 'N/A' && prayers[p].slice(0, 5) > currentTimeHHMM) {
      return p;
    }
  }
  return list[0] ?? 'Fajr';
}

/** Seconds remaining until a prayer given current time. Both are "HH:MM:SS". */
export function secondsUntilPrayer(prayerHHMMSS: string, nowHHMMSS: string): number {
  const toSec = (t: string) => {
    const [h = '0', m = '0', s = '0'] = t.split(':');
    return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10);
  };
  const target = toSec(prayerHHMMSS);
  const now = toSec(nowHHMMSS);
  return target > now ? target - now : 0;
}

/** Format a seconds count as "Xh MMm SSs" or "Mm SSs". */
export function fmtCountdown(totalSec: number): string {
  if (totalSec <= 0) return '';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  }
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}
