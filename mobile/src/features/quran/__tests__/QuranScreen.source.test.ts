/**
 * Purpose: Regression guards for QuranScreen's data contracts — no React Native
 *   component-render harness is set up in this repo yet (no @testing-library/react-native
 *   dependency), so these tests assert structural invariants against the surah
 *   metadata + bundled verse data the screen renders from, consistent with the
 *   rest of this repo's data/logic-focused test style.
 * Constraints: Keeps the "sample here, full Quran on Islam.Wiki" honest framing
 *   under regression coverage by asserting every surah is either bundled with
 *   verified text or has metadata enabling the Islam.Wiki deep link
 *   (https://islam.wiki/quran/{number}) to be constructed — i.e. no surah can
 *   render with neither.
 */

import SURAH_META from '../data/surahs.json';
import { BUNDLED_AYAHS, loadAyahs } from '../data/verses';

describe('QuranScreen data contract — Islam.Wiki fallback coverage', () => {
  it('every surah either has bundled verified text or a valid number for the Islam.Wiki deep link', () => {
    (SURAH_META as { number: number }[]).forEach((s) => {
      const bundled = loadAyahs(s.number) !== null;
      const hasDeepLinkableNumber = Number.isInteger(s.number) && s.number >= 1 && s.number <= 114;
      // At least one path to content must be true — never neither.
      expect(bundled || hasDeepLinkableNumber).toBe(true);
    });
  });

  it('no surah number appears in BUNDLED_AYAHS that is absent from the 114-surah metadata', () => {
    const metaNumbers = new Set((SURAH_META as { number: number }[]).map((s) => s.number));
    Object.keys(BUNDLED_AYAHS).map(Number).forEach((num) => {
      expect(metaNumbers.has(num)).toBe(true);
    });
  });
});

describe('Surah metadata (data/surahs.json)', () => {
  it('has all 114 surahs', () => {
    expect(SURAH_META).toHaveLength(114);
  });

  it('every surah number 1-114 is present exactly once, in order', () => {
    const numbers = (SURAH_META as { number: number }[]).map((s) => s.number);
    expect(numbers).toEqual(Array.from({ length: 114 }, (_, i) => i + 1));
  });

  it('every bundled surah (data/verses.ts) exists in the metadata and its ayah count matches totalAyahs', () => {
    const byNumber = new Map(
      (SURAH_META as { number: number; totalAyahs: number }[]).map((s) => [s.number, s]),
    );
    for (const [numStr, ayahs] of Object.entries(BUNDLED_AYAHS)) {
      const num = Number(numStr);
      const meta = byNumber.get(num);
      expect(meta).toBeDefined();
      expect(ayahs).toHaveLength(meta!.totalAyahs);
    }
  });
});
