/**
 * Purpose: Unit tests for DuaDisplayScreen's exported FALLBACK_DUAS offline collection —
 *   verifies the citation-gate shape is intact after the live-query rewrite (W1.3).
 * SPORT: praycalc/tv screens tests
 */

import { FALLBACK_DUAS } from '../DuaDisplayScreen';

describe('FALLBACK_DUAS', () => {
  it('has 3 cited entries, each with a source citation', () => {
    expect(FALLBACK_DUAS).toHaveLength(3);
    for (const d of FALLBACK_DUAS) {
      expect(d.source.length).toBeGreaterThan(0);
      expect(d.textAr.length).toBeGreaterThan(0);
      expect(d.textEn.length).toBeGreaterThan(0);
    }
  });

  it('ids match the pc_dua seed rows they mirror (morning-01, evening-02, post-04)', () => {
    expect(FALLBACK_DUAS.map((d) => d.id)).toEqual(['morning-01', 'evening-02', 'post-04']);
  });
});
