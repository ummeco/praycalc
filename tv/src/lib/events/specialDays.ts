/**
 * Purpose: Compute the bottom-bar special-day banner for the TV dashboard from the
 *   current Hijri date, plus the Ramadan "Day X of Y" progress.
 * Inputs: a Gregorian Date (+ optional hijri day-adjustment), via the shared
 *   tv/src/lib/hijri module (Umm al-Qura tabular calendar).
 * Outputs: SpecialDay | null (banner) and RamadanProgress | null.
 * Constraints — CONTENT GATE (deliberate allowlist, do NOT widen):
 *   Only these days ever produce a banner:
 *     • Ramadan start (1 Ramadan)                      → "Ramadan Mubarak"
 *     • Eid al-Fitr (1 Shawwal)                        → "Eid Mubarak"
 *     • Eid al-Adha (10 Dhu al-Hijjah)                 → "Eid Mubarak"
 *     • Day of Arafah (9 Dhu al-Hijjah)                → "Day of Arafah"
 *     • The day BEFORE Arafah (8 Dhu al-Hijjah)        → "Tomorrow is Arafah"
 *   Mawlid al-Nabi and every other entry in ISLAMIC_EVENTS are INTENTIONALLY EXCLUDED.
 *   The allowlist is an explicit content-gate decision (theology standards): banners on
 *   the always-on masjid display are limited to the highest-consensus occasions only.
 *   Never add to this list without an explicit content-gate decision.
 * SPORT: praycalc/tv lib/events
 */

import {
  gregorianToHijri,
  hijriToGregorian,
  RAMADAN_MONTH,
  HijriDate,
} from '../hijri';

/** Stable identifiers for the allowlisted banner days. */
export type SpecialDayId =
  | 'ramadan-start'
  | 'eid-al-fitr'
  | 'eid-al-adha'
  | 'arafah'
  | 'arafah-eve';

export interface SpecialDay {
  id: SpecialDayId;
  /** Primary banner text (e.g. "Eid Mubarak"). */
  title: string;
  /** Secondary line naming the occasion (e.g. "Eid al-Fitr"). */
  subtitle: string;
  emoji: string;
}

export interface RamadanProgress {
  /** 1-based day of Ramadan. */
  day: number;
  /** Total days in this Ramadan (29 or 30). */
  total: number;
}

const DHU_AL_HIJJAH = 12;
const SHAWWAL = 10;

/**
 * STRICT ALLOWLIST. Each row is checked against the current Hijri (month, day).
 * The 'arafah-eve' row is derived below (needs day-before logic), not a fixed date here.
 */
const ALLOWLIST: Array<{
  id: Exclude<SpecialDayId, 'arafah-eve'>;
  hijriMonth: number;
  hijriDay: number;
  title: string;
  subtitle: string;
  emoji: string;
}> = [
  {
    id: 'ramadan-start',
    hijriMonth: RAMADAN_MONTH,
    hijriDay: 1,
    title: 'Ramadan Mubarak',
    subtitle: 'First day of Ramadan',
    emoji: '🌙',
  },
  {
    id: 'eid-al-fitr',
    hijriMonth: SHAWWAL,
    hijriDay: 1,
    title: 'Eid Mubarak',
    subtitle: 'Eid al-Fitr',
    emoji: '🎉',
  },
  {
    id: 'eid-al-adha',
    hijriMonth: DHU_AL_HIJJAH,
    hijriDay: 10,
    title: 'Eid Mubarak',
    subtitle: 'Eid al-Adha',
    emoji: '🎉',
  },
  {
    id: 'arafah',
    hijriMonth: DHU_AL_HIJJAH,
    hijriDay: 9,
    title: 'Day of Arafah',
    subtitle: 'Dhu al-Hijjah 9',
    emoji: '🕋',
  },
];

/**
 * Returns the allowlisted banner for [date], or null when the day is not on the list.
 * "Tomorrow is Arafah" is produced when TOMORROW's Hijri date is 9 Dhu al-Hijjah — the
 * day-before is computed from the calendar (handles the 8→9 month-boundary correctly),
 * not by naive (day === 8), so it stays correct if 8 Dhu al-Hijjah does not exist in a
 * given tabular month.
 */
export function getSpecialDay(date: Date, dayAdjustment = 0): SpecialDay | null {
  const hijri = gregorianToHijri(date, dayAdjustment);

  // Same-day allowlist match.
  const match = ALLOWLIST.find(
    (e) => e.hijriMonth === hijri.month && e.hijriDay === hijri.day
  );
  if (match) {
    return {
      id: match.id,
      title: match.title,
      subtitle: match.subtitle,
      emoji: match.emoji,
    };
  }

  // Day-before-Arafah: if tomorrow's Hijri date is 9 Dhu al-Hijjah.
  const tomorrow = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
    12
  );
  const hijriTomorrow = gregorianToHijri(tomorrow, dayAdjustment);
  if (hijriTomorrow.month === DHU_AL_HIJJAH && hijriTomorrow.day === 9) {
    return {
      id: 'arafah-eve',
      title: 'Tomorrow is Arafah',
      subtitle: 'Day of Arafah — Dhu al-Hijjah 9',
      emoji: '🕋',
    };
  }

  return null;
}

/**
 * Ramadan progress for [date], or null when it is not Ramadan. Uses the shared hijri
 * module's daysInMonth so "Day X of Y" reflects the true 29/30-day length.
 */
export function getRamadanProgress(date: Date, dayAdjustment = 0): RamadanProgress | null {
  const hijri: HijriDate = gregorianToHijri(date, dayAdjustment);
  if (hijri.month !== RAMADAN_MONTH) return null;
  return { day: hijri.day, total: hijri.daysInMonth };
}

// hijriToGregorian is re-exported for callers that want to compute occasion dates.
export { hijriToGregorian };
