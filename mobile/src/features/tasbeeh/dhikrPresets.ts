/**
 * Purpose: Static dhikr preset data (Arabic/transliteration/translation/target
 *   count/source) for the tasbeeh counter — extracted from TasbeehScreen.tsx so
 *   the screen component stays under the 300-line file cap.
 * Inputs: none — static constant list.
 * Outputs: DhikrPreset interface, DHIKR_PRESETS array.
 * Constraints: Islamic content gate — all Arabic strings verified Uthmani
 *   tashkeel. Sources: Sahih Bukhari + Muslim + Hisn al-Muslim (Ibn al-Qayyim /
 *   Sa'id al-Qahtani). Any agent modifying this list MUST re-verify against
 *   source before commit. Values copied verbatim from the original file.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-07-tasbeeh
 */

export interface DhikrPreset {
  id: string;
  arabic: string;        // Full tashkeel — never split
  transliteration: string;
  translation: string;
  targetCount: number;
  source: string;
}

export const DHIKR_PRESETS: DhikrPreset[] = [
  {
    id: 'subhanallah',
    // Source: Sahih Bukhari 6406 — "Subhan Allah" × 33
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
    targetCount: 33,
    source: 'Sahih Bukhari 6406',
  },
  {
    id: 'alhamdulillah',
    // Source: Sahih Bukhari 6406 — "Al-Hamdulillah" × 33
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise be to Allah',
    targetCount: 33,
    source: 'Sahih Bukhari 6406',
  },
  {
    id: 'allahuakbar',
    // Source: Sahih Bukhari 6406 — "Allahu Akbar" × 34
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    targetCount: 34,
    source: 'Sahih Bukhari 6406',
  },
  {
    id: 'la_ilaha',
    // Source: Hisn al-Muslim #25 — "La ilaha illallah wahdahu" × 10 (after Fajr/Maghrib)
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: "La ilaha illallahu wahdahu la sharika lah",
    translation: 'There is no god but Allah alone, without partner',
    targetCount: 10,
    source: 'Hisn al-Muslim #25',
  },
  {
    id: 'astaghfirullah',
    // Source: Sahih Muslim 2702 — istighfar × 100
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    targetCount: 100,
    source: 'Sahih Muslim 2702',
  },
];
