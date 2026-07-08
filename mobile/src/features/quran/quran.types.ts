/**
 * Purpose: Shared type for a single surah's display metadata, used by both
 *   QuranScreen (surah list) and SurahDetailView (per-surah reader) so the
 *   shape is defined once and never drifts between the two files.
 * Inputs: none (type-only module).
 * Outputs: Surah interface.
 * Constraints: keep in sync with the bundled surahs.json mapping in QuranScreen.tsx.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-10-quran
 */

export interface Surah {
  number: number;
  arabicName: string;     // Full tashkeel — RTL
  transliteratedName: string;
  englishName: string;
  verseCount: number;
  revelationType: 'meccan' | 'medinan';
  juzNumber: number;
}
