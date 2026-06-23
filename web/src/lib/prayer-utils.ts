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
