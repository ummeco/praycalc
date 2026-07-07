/**
 * Purpose: Unit tests for fastingLogic.ts — White Days Hijri computation,
 *   Mon/Thu weekday detection, streak math, Ramadan progress, suggestions.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-fasting-logic
 */

import {
  isWhiteDay,
  isSunnahWeekday,
  getRamadanProgress,
  getWeeklyStreak,
  getWhiteDaysStatus,
  getUpcomingSuggestions,
  toDateKey,
  type FastLog,
} from '../fastingLogic';
import { gregorianToHijri } from '../../../lib/hijri';

describe('isWhiteDay', () => {
  it('is true for Hijri day 13, 14, 15', () => {
    expect(isWhiteDay({ year: 1447, month: 9, day: 13, monthName: 'Ramadan', daysInMonth: 30 })).toBe(true);
    expect(isWhiteDay({ year: 1447, month: 9, day: 14, monthName: 'Ramadan', daysInMonth: 30 })).toBe(true);
    expect(isWhiteDay({ year: 1447, month: 9, day: 15, monthName: 'Ramadan', daysInMonth: 30 })).toBe(true);
  });

  it('is false for other days', () => {
    expect(isWhiteDay({ year: 1447, month: 9, day: 12, monthName: 'Ramadan', daysInMonth: 30 })).toBe(false);
    expect(isWhiteDay({ year: 1447, month: 9, day: 16, monthName: 'Ramadan', daysInMonth: 30 })).toBe(false);
    expect(isWhiteDay({ year: 1447, month: 9, day: 1, monthName: 'Ramadan', daysInMonth: 30 })).toBe(false);
  });

  it('computes correctly for a real Gregorian date via gregorianToHijri', () => {
    // Find a date whose Hijri day is 13-15 by scanning forward from a known date.
    let found = false;
    for (let i = 0; i < 40; i++) {
      const d = new Date(2026, 2, 1 + i);
      const hijri = gregorianToHijri(d);
      if (isWhiteDay(hijri)) {
        found = true;
        expect([13, 14, 15]).toContain(hijri.day);
      }
    }
    expect(found).toBe(true);
  });
});

describe('isSunnahWeekday', () => {
  it('identifies Monday', () => {
    // 2026-07-06 is a Monday
    expect(isSunnahWeekday(new Date(2026, 6, 6))).toBe('Monday');
  });

  it('identifies Thursday', () => {
    // 2026-07-09 is a Thursday
    expect(isSunnahWeekday(new Date(2026, 6, 9))).toBe('Thursday');
  });

  it('returns null for other days', () => {
    // 2026-07-07 is a Tuesday
    expect(isSunnahWeekday(new Date(2026, 6, 7))).toBeNull();
  });
});

describe('getRamadanProgress', () => {
  it('returns null when not in Ramadan', () => {
    // Pick a date far from Ramadan — Muharram-ish; verify via hijri conversion first.
    const d = new Date(2026, 0, 1);
    const hijri = gregorianToHijri(d);
    if (hijri.month !== 9) {
      expect(getRamadanProgress(d)).toBeNull();
    }
  });

  it('returns day/totalDays when hijri month is Ramadan', () => {
    // Scan forward to find an actual Ramadan date, then verify progress shape.
    let ramadanDate: Date | null = null;
    for (let i = 0; i < 400; i++) {
      const d = new Date(2025, 0, 1 + i);
      if (gregorianToHijri(d).month === 9) {
        ramadanDate = d;
        break;
      }
    }
    expect(ramadanDate).not.toBeNull();
    if (ramadanDate) {
      const progress = getRamadanProgress(ramadanDate);
      expect(progress).not.toBeNull();
      expect(progress!.day).toBeGreaterThanOrEqual(1);
      expect(progress!.totalDays).toBeGreaterThanOrEqual(29);
    }
  });
});

describe('getWeeklyStreak', () => {
  it('is 0 with no logs', () => {
    expect(getWeeklyStreak([], 'Monday', new Date(2026, 6, 7))).toBe(0);
  });

  it('counts consecutive logged Mondays back from today', () => {
    // Mondays: 2026-07-06, 2026-06-29, 2026-06-22 — reference "today" as the Tuesday after.
    const logs: FastLog[] = [
      { date: '2026-07-06', type: 'Monday', loggedAt: 1 },
      { date: '2026-06-29', type: 'Monday', loggedAt: 1 },
      { date: '2026-06-22', type: 'Monday', loggedAt: 1 },
    ];
    const today = new Date(2026, 6, 7); // Tuesday, after the most recent Monday
    expect(getWeeklyStreak(logs, 'Monday', today)).toBe(3);
  });

  it('breaks the streak at the first gap', () => {
    const logs: FastLog[] = [
      { date: '2026-07-06', type: 'Monday', loggedAt: 1 },
      // 2026-06-29 missing — gap
      { date: '2026-06-22', type: 'Monday', loggedAt: 1 },
    ];
    const today = new Date(2026, 6, 7);
    expect(getWeeklyStreak(logs, 'Monday', today)).toBe(1);
  });

  it('does not break the streak if only today (unlogged, not-yet-passed) is missing', () => {
    const logs: FastLog[] = [
      { date: '2026-06-29', type: 'Monday', loggedAt: 1 },
    ];
    const today = new Date(2026, 6, 6); // today IS the Monday, not logged yet
    expect(getWeeklyStreak(logs, 'Monday', today)).toBe(1);
  });
});

describe('getWhiteDaysStatus', () => {
  it('counts total and this-month logged White Days', () => {
    // Find 3 real White Day dates in the current-ish Hijri month for a robust test.
    const base = new Date(2026, 5, 1);
    const hijriBase = gregorianToHijri(base);
    const whiteDates: string[] = [];
    for (let i = 0; i < 60 && whiteDates.length < 2; i++) {
      const d = new Date(2026, 5, 1 + i);
      const hijri = gregorianToHijri(d);
      if (hijri.year === hijriBase.year && hijri.month === hijriBase.month && isWhiteDay(hijri)) {
        whiteDates.push(toDateKey(d));
      }
    }
    const logs: FastLog[] = whiteDates.map((date) => ({ date, type: 'WhiteDays', loggedAt: 1 }));
    const status = getWhiteDaysStatus(logs, base);
    expect(status.totalLogged).toBe(whiteDates.length);
    expect(status.thisMonthLogged).toBe(whiteDates.length);
  });

  it('returns zeros with no logs', () => {
    const status = getWhiteDaysStatus([], new Date(2026, 5, 1));
    expect(status.totalLogged).toBe(0);
    expect(status.thisMonthLogged).toBe(0);
  });
});

describe('getUpcomingSuggestions', () => {
  it('suggests the next Monday and Thursday within the horizon', () => {
    const today = new Date(2026, 6, 7); // Tuesday
    const suggestions = getUpcomingSuggestions([], today, 0, 14);
    const types = suggestions.map((s) => s.type);
    expect(types).toContain('Monday');
    expect(types).toContain('Thursday');
  });

  it('excludes dates that are already logged', () => {
    const today = new Date(2026, 6, 7); // Tuesday
    const nextThursday = '2026-07-09';
    const logs: FastLog[] = [{ date: nextThursday, type: 'Thursday', loggedAt: 1 }];
    const suggestions = getUpcomingSuggestions(logs, today, 0, 14);
    expect(suggestions.find((s) => s.date === nextThursday)).toBeUndefined();
  });

  it('suggestions are sorted by date ascending', () => {
    const today = new Date(2026, 6, 7);
    const suggestions = getUpcomingSuggestions([], today, 0, 20);
    const dates = suggestions.map((s) => s.date);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });
});
