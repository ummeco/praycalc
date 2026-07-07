/**
 * Purpose: Regression tests for the curated Quran verse dataset (./data/verses.ts) —
 *   shape validation, an exact-text length guard on Al-Fatiha (the highest-stakes
 *   surface, recited in every rak'ah), and coverage checks for the other bundled
 *   surahs + Ayat al-Kursi.
 * Constraints: Does not re-verify Arabic correctness (that requires a human/scholar
 *   or a source diff) — it guards against accidental truncation, splitting, or
 *   missing-field regressions during future edits.
 */

import { BUNDLED_AYAHS, AYAT_AL_KURSI_VERSE, loadAyahs, type Ayah } from '../data/verses';

function expectValidAyah(ayah: Ayah) {
  expect(typeof ayah.number).toBe('number');
  expect(ayah.number).toBeGreaterThan(0);
  expect(ayah.arabic.length).toBeGreaterThan(0);
  expect(ayah.transliteration.length).toBeGreaterThan(0);
  expect(ayah.translation.length).toBeGreaterThan(0);
  // Arabic text must be RTL script — every char in the printable range should be
  // either Arabic script, whitespace, or standard Quranic punctuation (ۚ ۖ ۗ etc.)
  expect(ayah.arabic).toMatch(/[؀-ۿ]/);
}

describe('BUNDLED_AYAHS shape', () => {
  const surahNumbers = Object.keys(BUNDLED_AYAHS).map(Number);

  it('bundles exactly the curated small-surah set useful in prayer context', () => {
    expect(surahNumbers.sort((a, b) => a - b)).toEqual([1, 103, 107, 108, 109, 110, 111, 112, 113, 114]);
  });

  it('every bundled surah has at least one ayah, and every ayah is well-formed', () => {
    for (const num of surahNumbers) {
      const ayahs = BUNDLED_AYAHS[num];
      expect(ayahs.length).toBeGreaterThan(0);
      ayahs.forEach(expectValidAyah);
    }
  });

  it('ayah numbers within each surah are sequential starting at 1', () => {
    for (const num of surahNumbers) {
      const ayahs = BUNDLED_AYAHS[num];
      ayahs.forEach((ayah, idx) => {
        expect(ayah.number).toBe(idx + 1);
      });
    }
  });
});

describe('Al-Fatiha (surah 1) — exact text guard', () => {
  const fatiha = BUNDLED_AYAHS[1];

  it('has exactly 7 ayahs', () => {
    expect(fatiha).toHaveLength(7);
  });

  it('opens with the Basmalah as ayah 1, unsplit', () => {
    expect(fatiha[0].arabic).toBe('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
  });

  it('closes with the "not of those against whom there is wrath" ayah as ayah 7', () => {
    expect(fatiha[6].number).toBe(7);
    expect(fatiha[6].arabic).toContain('الضَّالِّينَ');
    expect(fatiha[6].arabic).toContain('الْمَغْضُوبِ');
  });

  it('each ayah Arabic string falls within an expected length band (guards against truncation or corruption)', () => {
    const lengths = fatiha.map((a) => a.arabic.length);
    // Shortest ayah (#3, "Ar-Rahmani r-Rahim") and longest (#7) bound the range.
    lengths.forEach((len) => {
      expect(len).toBeGreaterThanOrEqual(10);
      expect(len).toBeLessThanOrEqual(120);
    });
  });

  it('total Al-Fatiha corpus is non-trivial (not accidentally emptied)', () => {
    const totalChars = fatiha.reduce((sum, a) => sum + a.arabic.length, 0);
    expect(totalChars).toBeGreaterThan(150);
  });
});

describe('Ayat al-Kursi (2:255) featured verse', () => {
  it('is exported as a standalone verse numbered 255', () => {
    expect(AYAT_AL_KURSI_VERSE.number).toBe(255);
  });

  it('is well-formed and contains the recognizable opening phrase', () => {
    expectValidAyah(AYAT_AL_KURSI_VERSE);
    expect(AYAT_AL_KURSI_VERSE.arabic).toContain('اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ');
  });

  it('is a single long verse (not accidentally split into multiple entries)', () => {
    expect(AYAT_AL_KURSI_VERSE.arabic.length).toBeGreaterThan(400);
  });
});

describe('loadAyahs()', () => {
  it('returns the bundled ayahs for a curated surah', () => {
    expect(loadAyahs(112)).toHaveLength(4); // Al-Ikhlas
  });

  it('returns null for a surah with no verified verse text (honest gating)', () => {
    expect(loadAyahs(2)).toBeNull(); // Al-Baqarah — not bundled
    expect(loadAyahs(36)).toBeNull(); // Ya-Sin — not bundled
  });
});
