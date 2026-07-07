/**
 * Purpose: Unit tests for qadaLogic.ts — counter clamping, totals, and the
 *   excused-date-range exclusion helper. Does NOT test UI wording (that's
 *   reviewed manually per the fiqh-sensitivity note in qadaLogic.ts).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-qada-logic
 */

import {
  emptyQadaCounts,
  clampCount,
  totalOutstanding,
  isDateExcused,
  excusedRangeDayCount,
  QADA_PRAYERS,
  type ExcusedRange,
} from '../qadaLogic';

describe('emptyQadaCounts', () => {
  it('has all 5 salah prayers at 0', () => {
    const counts = emptyQadaCounts();
    for (const p of QADA_PRAYERS) {
      expect(counts[p]).toBe(0);
    }
  });

  it('Sunrise is present but always 0 (not a salah)', () => {
    expect(emptyQadaCounts().Sunrise).toBe(0);
  });
});

describe('clampCount', () => {
  it('never returns negative', () => {
    expect(clampCount(-5)).toBe(0);
    expect(clampCount(-1)).toBe(0);
  });

  it('rounds fractional input', () => {
    expect(clampCount(2.7)).toBe(3);
    expect(clampCount(2.2)).toBe(2);
  });

  it('passes through valid positive integers', () => {
    expect(clampCount(10)).toBe(10);
  });
});

describe('totalOutstanding', () => {
  it('sums only the 5 salah prayers', () => {
    const counts = emptyQadaCounts();
    counts.Fajr = 3;
    counts.Dhuhr = 2;
    counts.Sunrise = 99; // must be excluded from the sum
    expect(totalOutstanding(counts)).toBe(5);
  });

  it('is 0 for all-zero counts', () => {
    expect(totalOutstanding(emptyQadaCounts())).toBe(0);
  });
});

describe('isDateExcused', () => {
  const ranges: ExcusedRange[] = [
    { id: '1', startDate: '2026-07-01', endDate: '2026-07-06' },
  ];

  it('is true for a date inside the range (inclusive boundaries)', () => {
    expect(isDateExcused('2026-07-01', ranges)).toBe(true);
    expect(isDateExcused('2026-07-06', ranges)).toBe(true);
    expect(isDateExcused('2026-07-03', ranges)).toBe(true);
  });

  it('is false for a date outside the range', () => {
    expect(isDateExcused('2026-06-30', ranges)).toBe(false);
    expect(isDateExcused('2026-07-07', ranges)).toBe(false);
  });

  it('is false with no ranges', () => {
    expect(isDateExcused('2026-07-03', [])).toBe(false);
  });

  it('checks across multiple ranges', () => {
    const multi: ExcusedRange[] = [
      { id: '1', startDate: '2026-01-01', endDate: '2026-01-05' },
      { id: '2', startDate: '2026-07-01', endDate: '2026-07-06' },
    ];
    expect(isDateExcused('2026-01-03', multi)).toBe(true);
    expect(isDateExcused('2026-07-03', multi)).toBe(true);
    expect(isDateExcused('2026-03-01', multi)).toBe(false);
  });
});

describe('excusedRangeDayCount', () => {
  it('counts inclusive days', () => {
    expect(excusedRangeDayCount({ id: '1', startDate: '2026-07-01', endDate: '2026-07-06' })).toBe(6);
  });

  it('is at least 1 for a same-day range', () => {
    expect(excusedRangeDayCount({ id: '1', startDate: '2026-07-01', endDate: '2026-07-01' })).toBe(1);
  });
});
