/**
 * Purpose: Verify hijriDayAdjustment shifts the Umm al-Qura conversion by whole
 *   days in either direction (local moon-sighting offset).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-lib-hijri
 */

import { gregorianToHijri } from '../index';

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
