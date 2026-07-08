/**
 * Purpose: Full adhkar/dua dataset organized by category — After Adhan, After Prayer,
 *   Morning, Evening — for in-context use around salah.
 * Inputs: none (static data).
 * Outputs: ALL_DUAS array + CATEGORY metadata, consumed by DuaDhikrScreen.
 * Constraints: Arabic MUST be Uthmani script, full tashkeel, RTL, never string-split.
 *   Every entry cites its hadith/book source. Fabricated text is an absolute block.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-08-dua-dhikr
 *
 * Islamic content gate: content sourced from Hisn al-Muslim (Sa'id ibn Ali
 * al-Qahtani) cross-referenced against the underlying Sahih Bukhari / Sahih
 * Muslim / Abu Dawud hadith each entry cites. Any agent modifying this file
 * MUST re-verify the Arabic and the citation before merging.
 */

export type DuaCategory = 'afterAdhan' | 'afterPrayer' | 'morning' | 'evening';

export interface Dua {
  id: string;
  category: DuaCategory;
  arabic: string; // Full tashkeel Uthmani — NEVER split
  transliteration: string;
  translation: string;
  source: string;
  repeatCount?: number;
}

/**
 * After Adhan — recited by the listener once the mu'adhin finishes the call to prayer.
 * Source: Sahih al-Bukhari 614 (the "wasilah" dua) + the standard repeat-after-mu'adhin
 * practice (Sahih Muslim 384/385), both documented in Hisn al-Muslim §7.
 */
const AFTER_ADHAN_DUAS: Dua[] = [
  {
    id: 'adhan-01',
    category: 'afterAdhan',
    // Hisn al-Muslim #66 — the dua after adhan ("wasilah" dua)
    arabic:
      'اللَّهُمَّ رَبَّ هَٰذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
    transliteration:
      "Allāhumma rabba hādhihi d-daʿwati t-tāmmah, wa-ṣ-ṣalāti l-qā'imah, āti muḥammadani l-wasīlata wa-l-faḍīlah, wa-bʿathhu maqāman maḥmūdani lladhī waʿadtah",
    translation:
      'O Allah, Lord of this perfect call and of the prayer to be established, grant Muhammad the wasilah (highest station in Paradise) and superiority, and raise him to the praiseworthy station You have promised him.',
    source: 'Sahih al-Bukhari 614 — whoever recites this after the adhan earns the Prophet\'s intercession',
    repeatCount: 1,
  },
  {
    id: 'adhan-02',
    category: 'afterAdhan',
    // Hisn al-Muslim #65 — repeating after the mu'adhin, then the shahadah
    arabic: 'وَأَنَا أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، رَضِيتُ بِاللَّهِ رَبًّا، وَبِمُحَمَّدٍ رَسُولًا، وَبِالْإِسْلَامِ دِينًا',
    transliteration:
      "Wa-anā ashhadu an lā ilāha illā llāhu waḥdahū lā sharīka lah, wa-anna muḥammadan ʿabduhū wa-rasūluh, raḍītu billāhi rabbā, wa-bi-muḥammadin rasūlā, wa-bil-islāmi dīnā",
    translation:
      'And I bear witness that there is no god but Allah alone, without partner, and that Muhammad is His servant and messenger. I am pleased with Allah as my Lord, with Muhammad as my messenger, and with Islam as my religion.',
    source: 'Sahih Muslim 386 — said after repeating the shahadah part of the adhan; guarantees forgiveness of sins',
    repeatCount: 1,
  },
];

/**
 * After (Fard) Prayer — the standard tasbeeh + tahlil + Ayat al-Kursi sequence
 * recited immediately after each of the five daily obligatory prayers.
 * Source: Sahih Muslim 591 & 597, Sahih al-Bukhari 6306 (Sayyid al-Istighfar note
 * lives in the Evening set below since it is also a standalone evening dhikr).
 */
const AFTER_PRAYER_DUAS: Dua[] = [
  {
    id: 'post-01',
    category: 'afterPrayer',
    // Sahih Muslim 591 — istighfar × 3 immediately after salam
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek the forgiveness of Allah.',
    source: 'Sahih Muslim 591 (recited 3 times immediately after the salam)',
    repeatCount: 3,
  },
  {
    id: 'post-02',
    category: 'afterPrayer',
    // Sahih Muslim 591 — "Allahumma anta's-Salam..."
    arabic:
      'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliteration:
      "Allāhumma anta s-salāmu wa-minka s-salām, tabārakta yā dhā l-jalāli wa-l-ikrām",
    translation:
      'O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.',
    source: 'Sahih Muslim 591',
    repeatCount: 1,
  },
  {
    id: 'post-03',
    category: 'afterPrayer',
    // Ayat al-Kursi (2:255) after every fard — Sunan an-Nasa'i / al-Bayhaqi via Hisn al-Muslim #96
    arabic:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration:
      "Allāhu lā ilāha illā huwa l-ḥayyu l-qayyūm, lā ta'khudhuhū sinatun wa-lā nawm, lahū mā fī s-samāwāti wa-mā fī l-arḍ, man dhā lladhī yashfaʿu ʿindahū illā bi-idhnih, yaʿlamu mā bayna aydīhim wa-mā khalfahum, wa-lā yuḥīṭūna bi-shay'in min ʿilmihī illā bi-mā shā', wasiʿa kursiyyuhu s-samāwāti wa-l-arḍ, wa-lā ya'ūduhū ḥifẓuhumā, wa-huwa l-ʿaliyyu l-ʿaẓīm",
    translation:
      "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence... His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great. (Quran 2:255)",
    source: "An-Nasa'i (in 'Amal al-Yawm wa'l-Laylah) via Hisn al-Muslim #96 — recited after every fard prayer",
    repeatCount: 1,
  },
  {
    id: 'post-03b',
    category: 'afterPrayer',
    // Sahih Muslim 597 — la ilaha illallah wahdahu (post-prayer, completes the ×100)
    arabic:
      'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration:
      "Lā ilāha illā llāhu waḥdahū lā sharīka lah, lahu l-mulku wa-lahu l-ḥamdu wa-huwa ʿalā kulli shay'in qadīr",
    translation:
      'None has the right to be worshipped except Allah, alone, without partner; to Him belongs all sovereignty and praise, and He is over all things omnipotent.',
    source: 'Sahih Muslim 597 (recited once after the tasbeeh, completing 100 with the tasbeeh below)',
    repeatCount: 1,
  },
  {
    id: 'post-04',
    category: 'afterPrayer',
    // Sahih Muslim 597 — SubhanAllah × 33
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah.',
    source: 'Sahih Muslim 597 (post-prayer tasbeeh, × 33)',
    repeatCount: 33,
  },
  {
    id: 'post-05',
    category: 'afterPrayer',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise be to Allah.',
    source: 'Sahih Muslim 597 (post-prayer tasbeeh, × 33)',
    repeatCount: 33,
  },
  {
    id: 'post-06',
    category: 'afterPrayer',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest.',
    source: 'Sahih Muslim 597 (post-prayer tasbeeh, × 34 — completes the set of 100)',
    repeatCount: 34,
  },
];

/**
 * Morning Adhkar — Hisn al-Muslim (Sa'id al-Qahtani, 3rd ed.), recited after Fajr
 * until sunrise.
 */
const MORNING_ADHKAR: Dua[] = [
  {
    id: 'morning-01',
    category: 'morning',
    // Hisn al-Muslim #83 — morning du'a
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
    transliteration: 'Aṣbaḥnā wa-aṣbaḥa l-mulku lillāh, wa-l-ḥamdu lillāh',
    translation:
      'We have entered the morning and the whole dominion belongs to Allah, and praise is for Allah.',
    source: 'Hisn al-Muslim #83 (Sahih Muslim 2723)',
    repeatCount: 1,
  },
  {
    id: 'morning-02',
    category: 'morning',
    // Hisn al-Muslim #100 — "Subhan Allah wa bihamdih" × 100 morning
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subḥāna llāhi wa-bi-ḥamdih',
    translation: 'Glory be to Allah and praise be to Him.',
    source: 'Hisn al-Muslim #100 (Sahih Muslim 2692) — recited 100 times in the morning',
    repeatCount: 100,
  },
  {
    id: 'morning-03',
    category: 'morning',
    // Hisn al-Muslim #96 — Ayat al-Kursi morning protection
    arabic:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration:
      "Allāhu lā ilāha illā huwa l-ḥayyu l-qayyūm, lā ta'khudhuhū sinatun wa-lā nawm, lahū mā fī s-samāwāti wa-mā fī l-arḍ, man dhā lladhī yashfaʿu ʿindahū illā bi-idhnih, yaʿlamu mā bayna aydīhim wa-mā khalfahum, wa-lā yuḥīṭūna bi-shay'in min ʿilmihī illā bi-mā shā', wasiʿa kursiyyuhu s-samāwāti wa-l-arḍ, wa-lā ya'ūduhū ḥifẓuhumā, wa-huwa l-ʿaliyyu l-ʿaẓīm",
    translation:
      "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence... His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great. (Quran 2:255)",
    source: 'Hisn al-Muslim #96 (Ayat al-Kursi — whoever recites it in the morning is protected until evening)',
    repeatCount: 1,
  },
];

/**
 * Evening Adhkar — Hisn al-Muslim, recited after Asr/Maghrib.
 */
const EVENING_ADHKAR: Dua[] = [
  {
    id: 'evening-01',
    category: 'evening',
    // Hisn al-Muslim #108 — evening dhikr
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ',
    transliteration: 'Amsaynā wa-amsā l-mulku lillāh, wa-l-ḥamdu lillāh',
    translation:
      'We have entered the evening and the whole dominion belongs to Allah, and praise is for Allah.',
    source: 'Hisn al-Muslim #108 (Sahih Muslim 2723 evening variant)',
    repeatCount: 1,
  },
  {
    id: 'evening-02',
    category: 'evening',
    // Hisn al-Muslim #118 — Sayyid al-Istighfar
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration:
      "Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa-anā ʿabduk, wa-anā ʿalā ʿahdika wa-waʿdika ma staṭaʿt, aʿūdhu bika min sharri mā ṣanaʿt, abū'u laka bi-niʿmatika ʿalayya, wa-abū'u bi-dhanbī fa-ghfir lī fa-innahū lā yaghfiru dh-dhunūba illā ant",
    translation:
      'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    source: 'Hisn al-Muslim #118 (Sahih al-Bukhari 6306) — Sayyid al-Istighfar, "the master of seeking forgiveness"',
    repeatCount: 1,
  },
];

export const ALL_DUAS: Dua[] = [
  ...AFTER_ADHAN_DUAS,
  ...AFTER_PRAYER_DUAS,
  ...MORNING_ADHKAR,
  ...EVENING_ADHKAR,
];

export type CategoryFilter = 'all' | DuaCategory;

/** Category display order + i18n label keys, consumed by DuaDhikrScreen tabs. */
export const CATEGORIES: { key: CategoryFilter; labelKey: string }[] = [
  { key: 'all', labelKey: 'screens.duaDhikr.categoryAll' },
  { key: 'afterAdhan', labelKey: 'screens.duaDhikr.categoryAfterAdhan' },
  { key: 'afterPrayer', labelKey: 'screens.duaDhikr.categoryAfterPrayer' },
  { key: 'morning', labelKey: 'screens.duaDhikr.categoryMorning' },
  { key: 'evening', labelKey: 'screens.duaDhikr.categoryEvening' },
];
