/**
 * Purpose: Unit tests for HadithOfDayScreen's pure day-seeded rotation helper and
 *   the exported FALLBACK_HADITH offline collection.
 * SPORT: praycalc/tv screens tests
 */

import { pickDailyHadith, FALLBACK_HADITH } from '../HadithOfDayScreen';
import type { HadithEntry } from '../../types';

describe('FALLBACK_HADITH', () => {
  it('has 3 cited entries, each with a narrator, source, and grading', () => {
    expect(FALLBACK_HADITH).toHaveLength(3);
    for (const h of FALLBACK_HADITH) {
      expect(h.source.length).toBeGreaterThan(0);
      expect(h.narrator.length).toBeGreaterThan(0);
      expect(h.grading.length).toBeGreaterThan(0);
    }
  });
});

describe('pickDailyHadith', () => {
  const list: HadithEntry[] = [
    { id: '1', textAr: 'a', textEn: 'A', source: 's', narrator: 'n', grading: 'g' },
    { id: '2', textAr: 'b', textEn: 'B', source: 's', narrator: 'n', grading: 'g' },
    { id: '3', textAr: 'c', textEn: 'C', source: 's', narrator: 'n', grading: 'g' },
  ];

  it('returns an item from the given list', () => {
    const picked = pickDailyHadith(list);
    expect(list).toContain(picked);
  });

  it('is deterministic within the same day', () => {
    const a = pickDailyHadith(list);
    const b = pickDailyHadith(list);
    expect(a).toBe(b);
  });

  it('works with a single-item list', () => {
    expect(pickDailyHadith([list[0]])).toBe(list[0]);
  });
});
