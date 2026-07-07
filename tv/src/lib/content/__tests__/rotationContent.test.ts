/**
 * Purpose: Verify the content-rotation index selector cycles through ROTATION_ITEMS and
 *   wraps around, and that every item keeps a source citation (content-gate invariant).
 * SPORT: praycalc/tv lib/content tests
 */

import { ROTATION_ITEMS, itemForIndex } from '../rotationContent';

describe('itemForIndex', () => {
  it('returns items in order for 0..n-1', () => {
    for (let i = 0; i < ROTATION_ITEMS.length; i++) {
      expect(itemForIndex(i)).toBe(ROTATION_ITEMS[i]);
    }
  });

  it('wraps around past the end of the deck', () => {
    const n = ROTATION_ITEMS.length;
    expect(itemForIndex(n)).toBe(ROTATION_ITEMS[0]);
    expect(itemForIndex(n + 2)).toBe(ROTATION_ITEMS[2]);
    expect(itemForIndex(2 * n + 1)).toBe(ROTATION_ITEMS[1]);
  });

  it('normalizes negative indices', () => {
    const n = ROTATION_ITEMS.length;
    expect(itemForIndex(-1)).toBe(ROTATION_ITEMS[n - 1]);
    expect(itemForIndex(-n)).toBe(ROTATION_ITEMS[0]);
  });

  it('cycles through all three kinds within one full pass', () => {
    const kinds = new Set(
      Array.from({ length: ROTATION_ITEMS.length }, (_, i) => itemForIndex(i).kind)
    );
    expect(kinds).toEqual(new Set(['ayah', 'hadith', 'dua']));
  });

  it('every rotation item carries a non-empty source citation', () => {
    for (const item of ROTATION_ITEMS) {
      expect(item.source.trim().length).toBeGreaterThan(0);
      expect(item.textAr.trim().length).toBeGreaterThan(0);
    }
  });
});
