/**
 * Purpose: Regression tests for the adhkar/dua dataset (./data/adhkar.ts) — shape
 *   validation, category grouping/coverage, source-citation presence, and the
 *   presence of the specific authentic texts the wave-1 ticket required (post-adhan
 *   dua, Sayyid al-Istighfar, post-fard tasbeeh/tahlil, Ayat al-Kursi).
 * Constraints: Does not re-verify Arabic correctness — guards shape, grouping, and
 *   citation integrity so future edits can't silently drop a source or category.
 */

import { ALL_DUAS, CATEGORIES, type Dua } from '../data/adhkar';

function expectValidDua(dua: Dua) {
  expect(dua.id.length).toBeGreaterThan(0);
  expect(dua.arabic.length).toBeGreaterThan(0);
  expect(dua.transliteration.length).toBeGreaterThan(0);
  expect(dua.translation.length).toBeGreaterThan(0);
  expect(dua.source.length).toBeGreaterThan(0);
  expect(dua.arabic).toMatch(/[؀-ۿ]/);
}

describe('ALL_DUAS shape', () => {
  it('every dua is well-formed with a non-empty citation', () => {
    ALL_DUAS.forEach(expectValidDua);
  });

  it('every dua id is unique', () => {
    const ids = ALL_DUAS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every dua belongs to one of the declared categories', () => {
    const categoryKeys = new Set(CATEGORIES.map((c) => c.key).filter((k) => k !== 'all'));
    ALL_DUAS.forEach((dua) => {
      expect(categoryKeys.has(dua.category)).toBe(true);
    });
  });
});

describe('Category grouping', () => {
  it('declares the four in-context categories plus "all"', () => {
    expect(CATEGORIES.map((c) => c.key)).toEqual(['all', 'afterAdhan', 'afterPrayer', 'morning', 'evening']);
  });

  it('each non-all category has at least one dua', () => {
    const nonAll = CATEGORIES.filter((c) => c.key !== 'all');
    for (const cat of nonAll) {
      const count = ALL_DUAS.filter((d) => d.category === cat.key).length;
      expect(count).toBeGreaterThan(0);
    }
  });

  it('each category has a labelKey pointing into the i18n screens.duaDhikr namespace', () => {
    CATEGORIES.forEach((cat) => {
      expect(cat.labelKey.startsWith('screens.duaDhikr.category')).toBe(true);
    });
  });
});

describe('Required authentic content (wave-1 ticket hard requirements)', () => {
  it('includes the post-adhan wasilah dua citing Sahih al-Bukhari 614', () => {
    const dua = ALL_DUAS.find((d) => d.category === 'afterAdhan' && d.source.includes('Bukhari 614'));
    expect(dua).toBeDefined();
    expect(dua!.arabic).toContain('الْوَسِيلَةَ');
  });

  it('includes Astaghfirullah x3 immediately after salam (Sahih Muslim 591)', () => {
    const dua = ALL_DUAS.find((d) => d.id === 'post-01');
    expect(dua).toBeDefined();
    expect(dua!.category).toBe('afterPrayer');
    expect(dua!.repeatCount).toBe(3);
    expect(dua!.source).toContain('Muslim 591');
  });

  it('includes "Allahumma anta\'s-Salam..." (Sahih Muslim 591)', () => {
    const dua = ALL_DUAS.find((d) => d.arabic.includes('أَنْتَ السَّلَامُ'));
    expect(dua).toBeDefined();
    expect(dua!.source).toContain('Muslim 591');
  });

  it('includes Ayat al-Kursi after every fard prayer', () => {
    const dua = ALL_DUAS.find((d) => d.category === 'afterPrayer' && d.arabic.includes('كُرْسِيُّهُ'));
    expect(dua).toBeDefined();
  });

  it('includes the post-fard tasbeeh set — SubhanAllah x33, Alhamdulillah x33, Allahu Akbar x34 (Sahih Muslim 597)', () => {
    const subhanAllah = ALL_DUAS.find((d) => d.transliteration === 'SubhanAllah' && d.category === 'afterPrayer');
    const alhamdulillah = ALL_DUAS.find((d) => d.transliteration === 'Alhamdulillah' && d.category === 'afterPrayer');
    const allahuAkbar = ALL_DUAS.find((d) => d.transliteration === 'Allahu Akbar' && d.category === 'afterPrayer');
    expect(subhanAllah?.repeatCount).toBe(33);
    expect(alhamdulillah?.repeatCount).toBe(33);
    expect(allahuAkbar?.repeatCount).toBe(34);
    [subhanAllah, alhamdulillah, allahuAkbar].forEach((d) => expect(d?.source).toContain('Muslim 597'));
  });

  it('includes the tahlil ("La ilaha illallah wahdahu...") from Sahih Muslim 597', () => {
    const dua = ALL_DUAS.find((d) => d.category === 'afterPrayer' && d.arabic.startsWith('لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ'));
    expect(dua).toBeDefined();
    expect(dua!.source).toContain('Muslim 597');
  });

  it('includes Sayyid al-Istighfar citing Sahih al-Bukhari 6306', () => {
    const dua = ALL_DUAS.find((d) => d.source.includes('Bukhari 6306'));
    expect(dua).toBeDefined();
    expect(dua!.category).toBe('evening');
    expect(dua!.arabic).toContain('أَنْتَ رَبِّي');
  });
});
