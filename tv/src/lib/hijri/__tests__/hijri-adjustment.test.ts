/**
 * Purpose: Verify hijriDayAdjustment shifts the Umm al-Qura conversion by whole
 *   days in either direction (local moon-sighting offset). Ported from
 *   mobile/src/lib/hijri/__tests__/hijri-adjustment.test.ts — same contract, same module.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-tv-lib-hijri
 */

import { gregorianToHijri, eventsInMonth, RAMADAN_MONTH, isRamadan } from '../index';

describe('gregorianToHijri dayAdjustment', () => {
  const date = new Date(2026, 2, 15); // 2026-03-15

  it('default (0) equals explicit 0', () => {
    expect(gregorianToHijri(date)).toEqual(gregorianToHijri(date, 0));
  });

  it('+1 adjustment equals converting the next Gregorian day (the documented contract)', () => {
    expect(gregorianToHijri(date, 1)).toEqual(gregorianToHijri(new Date(2026, 2, 16)));
    // and it genuinely moved off the base date
    expect(gregorianToHijri(date, 1)).not.toEqual(gregorianToHijri(date));
  });

  it('-1 then +1 round-trips to the base date', () => {
    const base = gregorianToHijri(date);
    const minus = gregorianToHijri(new Date(2026, 2, 16), -1);
    expect(minus).toEqual(base);
  });
});

describe('isRamadan / eventsInMonth', () => {
  it('flags the Ramadan month correctly', () => {
    expect(isRamadan({ year: 1447, month: RAMADAN_MONTH, day: 1, monthName: 'Ramadan', daysInMonth: 30 })).toBe(true);
    expect(isRamadan({ year: 1447, month: 1, day: 1, monthName: 'Muharram', daysInMonth: 30 })).toBe(false);
  });

  it('returns events matching the given Hijri month', () => {
    const events = eventsInMonth({ year: 1447, month: RAMADAN_MONTH, day: 1, monthName: 'Ramadan', daysInMonth: 30 });
    expect(events.map((e) => e.name)).toEqual(
      expect.arrayContaining(['Start of Ramadan', 'Laylat al-Qadr (27th Ramadan)'])
    );
  });
});
