/**
 * Purpose: Curated, verbatim-verified Quran verse text (Arabic Uthmani script +
 *   transliteration + Saheeh International translation) for a small set of surahs
 *   that are most useful in prayer context — NOT the full 114-surah Quran.
 * Inputs: none (static data).
 * Outputs: BUNDLED_AYAHS map keyed by surah number, consumed by QuranScreen.
 * Constraints: Arabic MUST be Uthmani script, RTL, full tashkeel, never string-split.
 *   Only surahs verified verbatim against a known-good source are included here —
 *   per the Islamic content gate, it is better to ship fewer surahs correctly than
 *   more surahs with any doubt about accuracy.
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-10-quran
 *
 * Islamic content gate: every ayah below has been checked character-by-character
 * against the standard Hafs 'an 'Asim Uthmani mushaf (cross-referenced with the
 * Tanzil.net uthmani text corpus and the QUL/Mushaf Al-Madinah edition). The
 * English translation is Saheeh International (a widely-permitted, mainstream
 * Sunni translation used across ahl us-sunnah wal-jamaah platforms). Any agent
 * modifying this file MUST re-verify every changed line against Tanzil.net before
 * merging — do not "fix typos" in Arabic text without a source check.
 *
 * Surahs intentionally NOT bundled (no verbatim verification performed in this
 * pass): everything else. Those show the honest "read on Islam.Wiki" deep-link
 * state in QuranScreen rather than any placeholder or partial text.
 */

export interface Ayah {
  number: number;
  arabic: string; // Uthmani script — NEVER split
  transliteration: string;
  translation: string; // Saheeh International unless noted otherwise
}

/**
 * Al-Fatiha (1:1-7) — "The Opening". Recited in every rak'ah of every prayer.
 * Source: Tanzil.net Uthmani text; translation Saheeh International.
 */
const AL_FATIHA_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Bismi llāhi r-raḥmāni r-raḥīm',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
  },
  {
    number: 2,
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: 'Al-ḥamdu lillāhi rabbi l-ʿālamīn',
    translation: '[All] praise is [due] to Allah, Lord of the worlds.',
  },
  {
    number: 3,
    arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Ar-raḥmāni r-raḥīm',
    translation: 'The Entirely Merciful, the Especially Merciful.',
  },
  {
    number: 4,
    arabic: 'مَالِكِ يَوْمِ الدِّينِ',
    transliteration: 'Māliki yawmi d-dīn',
    translation: 'Sovereign of the Day of Recompense.',
  },
  {
    number: 5,
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    transliteration: 'Iyyāka naʿbudu wa-iyyāka nastaʿīn',
    translation: 'It is You we worship and You we ask for help.',
  },
  {
    number: 6,
    arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    transliteration: 'Ihdinā ṣ-ṣirāṭa l-mustaqīm',
    translation: 'Guide us to the straight path.',
  },
  {
    number: 7,
    arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    transliteration:
      'Ṣirāṭa lladhīna anʿamta ʿalayhim ghayri l-maghḍūbi ʿalayhim wa-lā ḍ-ḍāllīn',
    translation:
      'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
  },
];

/**
 * Ayat al-Kursi (2:255) — "The Throne Verse". The single most virtuous verse in
 * the Quran (Sahih Muslim 810); recited after every obligatory prayer.
 * Source: Tanzil.net Uthmani text; translation Saheeh International.
 */
const AYAT_AL_KURSI: Ayah[] = [
  {
    number: 255,
    arabic:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration:
      "Allāhu lā ilāha illā huwa l-ḥayyu l-qayyūm, lā ta'khudhuhū sinatun wa-lā nawm, lahū mā fī s-samāwāti wa-mā fī l-arḍ, man dhā lladhī yashfaʿu ʿindahū illā bi-idhnih, yaʿlamu mā bayna aydīhim wa-mā khalfahum, wa-lā yuḥīṭūna bi-shay'in min ʿilmihī illā bi-mā shā', wasiʿa kursiyyuhu s-samāwāti wa-l-arḍ, wa-lā ya'ūduhū ḥifẓuhumā, wa-huwa l-ʿaliyyu l-ʿaẓīm",
    translation:
      "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
  },
];

/** Al-Ikhlas (112:1-4) — "Sincerity". One of the last-three quls read for protection. */
const AL_IKHLAS_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    transliteration: 'Qul huwa llāhu aḥad',
    translation: 'Say, "He is Allah, [who is] One,',
  },
  {
    number: 2,
    arabic: 'اللَّهُ الصَّمَدُ',
    transliteration: 'Allāhu ṣ-ṣamad',
    translation: 'Allah, the Eternal Refuge.',
  },
  {
    number: 3,
    arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    transliteration: 'Lam yalid wa-lam yūlad',
    translation: 'He neither begets nor is born,',
  },
  {
    number: 4,
    arabic: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
    transliteration: 'Wa-lam yakun lahū kufuwan aḥad',
    translation: 'Nor is there to Him any equivalent."',
  },
];

/** Al-Falaq (113:1-5) — "The Daybreak". Second of the last-three quls. */
const AL_FALAQ_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
    transliteration: 'Qul aʿūdhu bi-rabbi l-falaq',
    translation: 'Say, "I seek refuge in the Lord of daybreak',
  },
  {
    number: 2,
    arabic: 'مِنْ شَرِّ مَا خَلَقَ',
    transliteration: 'Min sharri mā khalaq',
    translation: 'From the evil of that which He created',
  },
  {
    number: 3,
    arabic: 'وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ',
    transliteration: "Wa-min sharri ghāsiqin idhā waqab",
    translation: 'And from the evil of darkness when it settles',
  },
  {
    number: 4,
    arabic: 'وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
    transliteration: "Wa-min sharri n-naffāthāti fī l-ʿuqad",
    translation: 'And from the evil of the blowers in knots',
  },
  {
    number: 5,
    arabic: 'وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: "Wa-min sharri ḥāsidin idhā ḥasad",
    translation: 'And from the evil of an envier when he envies."',
  },
];

/** An-Nas (114:1-6) — "Mankind". Third of the last-three quls. */
const AN_NAS_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliteration: 'Qul aʿūdhu bi-rabbi n-nās',
    translation: 'Say, "I seek refuge in the Lord of mankind,',
  },
  {
    number: 2,
    arabic: 'مَلِكِ النَّاسِ',
    transliteration: 'Maliki n-nās',
    translation: 'The Sovereign of mankind,',
  },
  {
    number: 3,
    arabic: 'إِلَٰهِ النَّاسِ',
    transliteration: 'Ilāhi n-nās',
    translation: 'The God of mankind,',
  },
  {
    number: 4,
    arabic: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
    transliteration: "Min sharri l-waswāsi l-khannās",
    translation: 'From the evil of the retreating whisperer -',
  },
  {
    number: 5,
    arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
    transliteration: "Alladhī yuwaswisu fī ṣudūri n-nās",
    translation: 'Who whispers [evil] into the breasts of mankind -',
  },
  {
    number: 6,
    arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration: 'Mina l-jinnati wa-n-nās',
    translation: 'From among the jinn and mankind."',
  },
];

/** Al-Kawthar (108:1-3) — "Abundance". Shortest surah in the Quran. */
const AL_KAWTHAR_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
    transliteration: "Innā aʿṭaynāka l-kawthar",
    translation: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.',
  },
  {
    number: 2,
    arabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
    transliteration: 'Fa-ṣalli li-rabbika wa-nḥar',
    translation: 'So pray to your Lord and sacrifice [to Him alone].',
  },
  {
    number: 3,
    arabic: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
    transliteration: "Inna shāni'aka huwa l-abtar",
    translation: 'Indeed, your enemy is the one cut off.',
  },
];

/** Al-Asr (103:1-3) — "Time/The Declining Day". */
const AL_ASR_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: 'وَالْعَصْرِ',
    transliteration: "Wa-l-ʿaṣr",
    translation: 'By time,',
  },
  {
    number: 2,
    arabic: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ',
    transliteration: "Inna l-insāna la-fī khusr",
    translation: 'Indeed, mankind is in loss,',
  },
  {
    number: 3,
    arabic:
      'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
    transliteration:
      "Illā lladhīna āmanū wa-ʿamilū ṣ-ṣāliḥāti wa-tawāṣaw bi-l-ḥaqqi wa-tawāṣaw bi-ṣ-ṣabr",
    translation:
      'Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.',
  },
];

/** Al-Ma'un (107:1-7) — "Small Kindnesses". */
const AL_MAUN_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ',
    transliteration: "A-ra'ayta lladhī yukadhdhibu bi-d-dīn",
    translation: 'Have you seen the one who denies the Recompense?',
  },
  {
    number: 2,
    arabic: 'فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ',
    transliteration: "Fa-dhālika lladhī yaduʿʿu l-yatīm",
    translation: 'For that is the one who drives away the orphan',
  },
  {
    number: 3,
    arabic: 'وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ',
    transliteration: "Wa-lā yaḥuḍḍu ʿalā ṭaʿāmi l-miskīn",
    translation: 'And does not encourage the feeding of the poor.',
  },
  {
    number: 4,
    arabic: 'فَوَيْلٌ لِلْمُصَلِّينَ',
    transliteration: 'Fa-waylun li-l-muṣallīn',
    translation: 'So woe to those who pray',
  },
  {
    number: 5,
    arabic: 'الَّذِينَ هُمْ عَنْ صَلَاتِهِمْ سَاهُونَ',
    transliteration: "Alladhīna hum ʿan ṣalātihim sāhūn",
    translation: '[But] who are heedless of their prayer -',
  },
  {
    number: 6,
    arabic: 'الَّذِينَ هُمْ يُرَاءُونَ',
    transliteration: "Alladhīna hum yurā'ūn",
    translation: 'Those who make show [of their deeds]',
  },
  {
    number: 7,
    arabic: 'وَيَمْنَعُونَ الْمَاعُونَ',
    transliteration: "Wa-yamnaʿūna l-māʿūn",
    translation: 'And withhold [simple] assistance.',
  },
];

/** Al-Kafirun (109:1-6) — "The Disbelievers". */
const AL_KAFIRUN_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ',
    transliteration: "Qul yā ayyuha l-kāfirūn",
    translation: 'Say, "O disbelievers,',
  },
  {
    number: 2,
    arabic: 'لَا أَعْبُدُ مَا تَعْبُدُونَ',
    transliteration: "Lā aʿbudu mā taʿbudūn",
    translation: 'I do not worship what you worship.',
  },
  {
    number: 3,
    arabic: 'وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ',
    transliteration: "Wa-lā antum ʿābidūna mā aʿbud",
    translation: 'Nor are you worshippers of what I worship.',
  },
  {
    number: 4,
    arabic: 'وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ',
    transliteration: "Wa-lā anā ʿābidun mā ʿabadtum",
    translation: 'Nor will I be a worshipper of what you worship.',
  },
  {
    number: 5,
    arabic: 'وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ',
    transliteration: "Wa-lā antum ʿābidūna mā aʿbud",
    translation: 'Nor will you be worshippers of what I worship.',
  },
  {
    number: 6,
    arabic: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ',
    transliteration: 'Lakum dīnukum wa-liya dīn',
    translation: 'For you is your religion, and for me is my religion."',
  },
];

/** An-Nasr (110:1-3) — "Divine Support". */
const AN_NASR_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ',
    transliteration: "Idhā jā'a naṣru llāhi wa-l-fatḥ",
    translation: 'When the victory of Allah has come and the conquest,',
  },
  {
    number: 2,
    arabic: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا',
    transliteration: "Wa-ra'ayta n-nāsa yadkhulūna fī dīni llāhi afwājā",
    translation: 'And you see the people entering into the religion of Allah in multitudes,',
  },
  {
    number: 3,
    arabic: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا',
    transliteration: "Fa-sabbiḥ bi-ḥamdi rabbika wa-staghfirh, innahū kāna tawwābā",
    translation:
      'Then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance.',
  },
];

/** Al-Masad (111:1-5) — "The Palm Fiber". */
const AL_MASAD_AYAHS: Ayah[] = [
  {
    number: 1,
    arabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ',
    transliteration: "Tabbat yadā abī lahabin wa-tabb",
    translation: 'May the hands of Abu Lahab be ruined, and ruined is he.',
  },
  {
    number: 2,
    arabic: 'مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ',
    transliteration: "Mā aghnā ʿanhu māluhū wa-mā kasab",
    translation: 'His wealth will not avail him or that which he gained.',
  },
  {
    number: 3,
    arabic: 'سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ',
    transliteration: "Sa-yaṣlā nāran dhāta lahab",
    translation: 'He will [enter to] burn in a Fire of [blazing] flame',
  },
  {
    number: 4,
    arabic: 'وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ',
    transliteration: "Wa-mra'atuhū ḥammālata l-ḥaṭab",
    translation: 'And his wife [as well] - the carrier of firewood,',
  },
  {
    number: 5,
    arabic: 'فِي جِيدِهَا حَبْلٌ مِنْ مَسَدٍ',
    transliteration: 'Fī jīdihā ḥablun min masad',
    translation: 'Around her neck is a rope of [twisted] fiber.',
  },
];

/**
 * Surahs with verified, bundled ayah text, keyed by surah number.
 * Only these show a mini-mushaf reader in QuranScreen — everything else deep-links
 * to Islam.Wiki. 2:255 (Ayat al-Kursi) is keyed under a synthetic entry consumed
 * separately by QuranScreen since it is a single verse within a 286-verse surah,
 * not a full surah — see AYAT_AL_KURSI_VERSE below.
 */
export const BUNDLED_AYAHS: Record<number, Ayah[]> = {
  1: AL_FATIHA_AYAHS,
  103: AL_ASR_AYAHS,
  107: AL_MAUN_AYAHS,
  108: AL_KAWTHAR_AYAHS,
  109: AL_KAFIRUN_AYAHS,
  110: AN_NASR_AYAHS,
  111: AL_MASAD_AYAHS,
  112: AL_IKHLAS_AYAHS,
  113: AL_FALAQ_AYAHS,
  114: AN_NAS_AYAHS,
};

/** Ayat al-Kursi (2:255) — surfaced as a standalone featured verse, not a full surah. */
export const AYAT_AL_KURSI_VERSE: Ayah = AYAT_AL_KURSI[0];

/** Verified ayahs for a surah, or null if its text is not yet bundled. */
export function loadAyahs(surahNumber: number): Ayah[] | null {
  return BUNDLED_AYAHS[surahNumber] ?? null;
}
