/**
 * Purpose: Pure, unit-testable logic for the fasting tracker — White Days (Ayyam
 *   al-Beed) Hijri-date computation, Mon/Thu weekday detection, per-type streak/count
 *   math, and Ramadan "day X of 30" progress. Kept separate from FastingScreen so the
 *   date math can be tested without rendering React Native components.
 * Inputs: Gregorian Date, FastLog[] (from useFastingStore).
 * Outputs: FastType union, isWhiteDay/isSunnahWeekday predicates, streak/count
 *   aggregation, upcoming-suggestion generator, Ramadan progress.
 * Constraints: White Days = Hijri 13/14/15 of any month (Sunan an-Nasa'i 2345,
 *   Sunan Abi Dawud 2449). Mon/Thu sunnah = Sahih Muslim 1162. Never fabricate a
 *   hadith citation — these two are the only ones referenced by this module.
 *   Hijri conversion delegates to src/lib/hijri (Umm al-Qura tabular calendar) —
 *   never a second hand-rolled approximation.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-fasting-logic
 */

import { gregorianToHijri, isRamadan, type HijriDate } from '../../lib/hijri';

/** The six fast types this tracker logs. 'Voluntary' covers any other nafl fast. */
export type FastType = 'Ramadan' | 'Monday' | 'Thursday' | 'WhiteDays' | 'Qada' | 'Voluntary';

export const FAST_TYPES: FastType[] = ['Ramadan', 'Monday', 'Thursday', 'WhiteDays', 'Qada', 'Voluntary'];

export interface FastLog {
  /** YYYY-MM-DD (Gregorian, local) — one entry per date; a date may only be logged once. */
  date: string;
  type: FastType;
  loggedAt: number; // Unix ms
}

/** Hijri days 13/14/15 of any month — Ayyam al-Beed ("the White Days"). */
const WHITE_DAY_NUMBERS = [13, 14, 15];

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** True if the Hijri day-of-month is 13, 14, or 15 (Sunan an-Nasa'i 2345 / Abu Dawud 2449). */
export function isWhiteDay(hijri: HijriDate): boolean {
  return WHITE_DAY_NUMBERS.includes(hijri.day);
}

/** True if the Gregorian date falls on Monday or Thursday (Sahih Muslim 1162). */
export function isSunnahWeekday(date: Date): 'Monday' | 'Thursday' | null {
  const day = date.getDay(); // 0=Sun ... 6=Sat
  if (day === 1) return 'Monday';
  if (day === 4) return 'Thursday';
  return null;
}

/** Ramadan progress if `date` falls within Ramadan; null otherwise. */
export function getRamadanProgress(date: Date, dayAdjustment = 0): { day: number; totalDays: number } | null {
  const hijri = gregorianToHijri(date, dayAdjustment);
  if (!isRamadan(hijri)) return null;
  return { day: hijri.day, totalDays: hijri.daysInMonth };
}

/** Count of logs for a given type. */
export function countByType(logs: FastLog[], type: FastType): number {
  return logs.filter((l) => l.type === type).length;
}

/**
 * Current consecutive-day streak for a given weekly type ('Monday' | 'Thursday'):
 * counts back from the most recent applicable weekday that has passed, requiring
 * every such weekday to have a logged fast, stopping at the first gap.
 */
export function getWeeklyStreak(logs: FastLog[], type: 'Monday' | 'Thursday', today: Date = new Date()): number {
  const loggedDates = new Set(logs.filter((l) => l.type === type).map((l) => l.date));
  let streak = 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // Walk backwards day by day looking only at matching weekdays, until a matching
  // weekday is found that was NOT logged (or we've walked back reasonably far).
  for (let i = 0; i < 366; i++) {
    if (isSunnahWeekday(cursor) === type) {
      const key = toDateKey(cursor);
      if (loggedDates.has(key)) {
        streak++;
      } else if (key === toDateKey(today)) {
        // Today hasn't happened yet (not logged) — don't break the streak on today itself.
      } else {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Total logged White Days fasts, and how many of the current month's 3 are done. */
export function getWhiteDaysStatus(
  logs: FastLog[],
  today: Date = new Date(),
  dayAdjustment = 0,
): { totalLogged: number; thisMonthLogged: number } {
  const totalLogged = countByType(logs, 'WhiteDays');
  const hijriToday = gregorianToHijri(today, dayAdjustment);
  const thisMonthLogged = logs.filter((l) => {
    if (l.type !== 'WhiteDays') return false;
    const [y, m, d] = l.date.split('-').map(Number);
    const hijri = gregorianToHijri(new Date(y!, m! - 1, d!), dayAdjustment);
    return hijri.year === hijriToday.year && hijri.month === hijriToday.month;
  }).length;
  return { totalLogged, thisMonthLogged };
}

export interface FastSuggestion {
  type: FastType;
  date: string; // YYYY-MM-DD
  label: string;
}

/**
 * Upcoming recommended fast days within the next `horizonDays` — next Monday, next
 * Thursday, and any unlogged White Days in the current/next Hijri month.
 */
export function getUpcomingSuggestions(
  logs: FastLog[],
  today: Date = new Date(),
  dayAdjustment = 0,
  horizonDays = 14,
): FastSuggestion[] {
  const loggedDates = new Set(logs.map((l) => l.date));
  const suggestions: FastSuggestion[] = [];
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (let i = 0; i <= horizonDays; i++) {
    const check = new Date(cursor);
    check.setDate(cursor.getDate() + i);
    const key = toDateKey(check);
    if (loggedDates.has(key)) continue;

    const weekday = isSunnahWeekday(check);
    if (weekday && !suggestions.some((s) => s.type === weekday)) {
      suggestions.push({ type: weekday, date: key, label: weekday });
    }

    const hijri = gregorianToHijri(check, dayAdjustment);
    if (isWhiteDay(hijri) && !suggestions.some((s) => s.type === 'WhiteDays' && s.date === key)) {
      suggestions.push({ type: 'WhiteDays', date: key, label: `White Day (${hijri.day} ${hijri.monthName})` });
    }
  }

  return suggestions.sort((a, b) => a.date.localeCompare(b.date));
}
