/**
 * Purpose: Rotating Islamic content for the Display pane overlay — Ayat, Hadith, Duas.
 *   ALL content is reused from already-bundled, correctly-cited sources in this repo;
 *   NO new religious text is authored here (Islamic content gate).
 *   - Ayat: Ayat al-Kursi (Quran 2:255) — the only Quranic verse bundled in-repo,
 *     taken from tv/src/screens/DuaDisplayScreen.tsx (Hisn al-Muslim #96) and cited as
 *     its Quran reference. No other verses are fabricated.
 *   - Hadith: verbatim from tv/src/screens/HadithOfDayScreen.tsx (Sahih Bukhari/Muslim).
 *   - Duas: verbatim from tv/src/screens/DuaDisplayScreen.tsx (Hisn al-Muslim / Sahih).
 * Inputs: a monotonically-increasing rotation index.
 * Outputs: RotationItem list + pure index->item selector for timer-driven cycling.
 * Constraints: Arabic RTL text, tashkeel preserved; every item keeps its citation.
 * SPORT: praycalc/tv lib/content
 */

export type RotationKind = 'ayah' | 'hadith' | 'dua';

export interface RotationItem {
  kind: RotationKind;
  /** Short kind label for the pane header, e.g. "Ayah" / "Hadith" / "Dua". */
  kindLabel: string;
  /** Optional title (Arabic + English) shown above the body. */
  titleAr?: string;
  titleEn?: string;
  /** Arabic body text (RTL, tashkeel preserved). */
  textAr: string;
  /** English translation. */
  textEn: string;
  /** Optional transliteration (duas). */
  transliteration?: string;
  /** Source citation — always present. */
  source: string;
}

/**
 * Rotation deck — interleaves the three kinds so consecutive cycles vary in type.
 * Every entry is copied from an existing cited source in this repo (see file header).
 */
export const ROTATION_ITEMS: RotationItem[] = [
  {
    kind: 'ayah',
    kindLabel: 'Ayah',
    titleAr: 'آية الكرسي',
    titleEn: 'Ayat al-Kursi',
    textAr: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    textEn:
      'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.',
    source: 'Quran 2:255 (Ayat al-Kursi) — Hisn al-Muslim #96',
  },
  {
    kind: 'hadith',
    kindLabel: 'Hadith',
    textAr: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    textEn:
      'Actions are judged only by intentions, and every person will get what they intended.',
    source: 'Sahih al-Bukhari 1; Sahih Muslim 1907 — ʿUmar ibn al-Khaṭṭāb (رضي الله عنه)',
  },
  {
    kind: 'dua',
    kindLabel: 'Dua',
    titleAr: 'سيد الاستغفار',
    titleEn: 'Sayyid al-Istighfar',
    textAr: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ',
    textEn:
      'O Allah, You are my Lord, none has the right to be worshipped except You; You created me and I am Your servant.',
    transliteration:
      "Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana abduk",
    source: 'Hisn al-Muslim #118 (Sahih Bukhari 6306)',
  },
  {
    kind: 'hadith',
    kindLabel: 'Hadith',
    textAr: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    textEn:
      'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    source: 'Sahih al-Bukhari 6018; Sahih Muslim 47 — Abu Hurayrah (رضي الله عنه)',
  },
  {
    kind: 'dua',
    kindLabel: 'Dua',
    titleAr: 'دعاء بعد الصلاة',
    titleEn: 'Post-Prayer Dua',
    textAr:
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    textEn:
      'None has the right to be worshipped except Allah, alone, without partner; to Him belongs all sovereignty and praise, and He is over all things omnipotent.',
    transliteration:
      "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir",
    source: 'Sahih Muslim 597',
  },
  {
    kind: 'hadith',
    kindLabel: 'Hadith',
    textAr: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    textEn: 'Cleanliness is half of faith.',
    source: 'Sahih Muslim 223 — Abu Malik al-Ashʿari (رضي الله عنه)',
  },
];

/**
 * Pure selector: maps a rotation counter to the item to display, wrapping around the
 * deck. Kept pure (no timers) so the cycling logic is unit-testable in isolation.
 */
export function itemForIndex(index: number): RotationItem {
  const len = ROTATION_ITEMS.length;
  // Normalize negative/large indices into [0, len).
  const i = ((index % len) + len) % len;
  return ROTATION_ITEMS[i];
}
