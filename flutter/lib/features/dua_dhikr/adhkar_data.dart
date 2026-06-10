// Adhkar and dua content data for morning/evening remembrances and selected duas.
// Source: Hisn al-Muslim (Fortress of the Muslim) and authentic hadith collections.

class Dhikr {
  final String arabic;
  final String transliteration;
  final String translation;
  final int repeatCount;
  final String? reference;

  const Dhikr({
    required this.arabic,
    required this.transliteration,
    required this.translation,
    this.repeatCount = 1,
    this.reference,
  });
}

class DuaEntry {
  final String title;
  final String arabic;
  final String transliteration;
  final String translation;
  final String? reference;
  final String category;

  const DuaEntry({
    required this.title,
    required this.arabic,
    required this.transliteration,
    required this.translation,
    this.reference,
    required this.category,
  });
}

// ── Morning Adhkar ──────────────────────────────────────────────────────────

const morningAdhkar = <Dhikr>[
  Dhikr(
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadeer",
    translation: 'We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent.',
    reference: 'Muslim 2723',
  ),
  Dhikr(
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namootu, wa ilaykan-nushoor",
    translation: 'O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die, and unto You is our resurrection.',
    reference: 'Tirmidhi 3391',
  ),
  Dhikr(
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: "Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika 'alay, wa abu'u bidhanbi faghfir li fa innahu la yaghfirudh-dhunuba illa ant",
    translation: 'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide to Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sins except You.',
    reference: 'Bukhari 6306 (Sayyid al-Istighfar)',
  ),
  Dhikr(
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdihi',
    translation: 'Glory is to Allah and praise is to Him.',
    repeatCount: 100,
    reference: 'Muslim 2692',
  ),
  Dhikr(
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadeer",
    translation: 'None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent.',
    repeatCount: 10,
    reference: 'Bukhari 6403',
  ),
  Dhikr(
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    transliteration: "SubhanAllahi wa bihamdihi, 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatihi",
    translation: 'Glory is to Allah and praise is to Him, by the number of His creation, by His pleasure, by the weight of His Throne, and by the extent of His words.',
    repeatCount: 3,
    reference: 'Muslim 2726',
  ),
  Dhikr(
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    transliteration: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan",
    translation: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.',
    reference: 'Ibn Majah 925',
  ),
  Dhikr(
    arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha wa atubu ilayh',
    translation: 'I seek the forgiveness of Allah and repent to Him.',
    repeatCount: 100,
    reference: 'Bukhari 6307',
  ),
  Dhikr(
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: "Bismillahilladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-samee'ul-'aleem",
    translation: 'In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.',
    repeatCount: 3,
    reference: 'Abu Dawud 5088',
  ),
  Dhikr(
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa ant",
    translation: 'O Allah, grant my body health. O Allah, grant my hearing health. O Allah, grant my sight health. None has the right to be worshipped except You.',
    repeatCount: 3,
    reference: 'Abu Dawud 5090',
  ),
  Dhikr(
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
    transliteration: "Allahumma inni a'udhu bika minal-kufri, wal-faqri, wa a'udhu bika min 'adhabil-qabr, la ilaha illa ant",
    translation: 'O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None has the right to be worshipped except You.',
    repeatCount: 3,
    reference: 'Abu Dawud 5090',
  ),
  Dhikr(
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration: "HasbiyAllahu la ilaha illa huwa, 'alayhi tawakkaltu, wa huwa rabbul-'arshil-'adheem",
    translation: 'Allah is sufficient for me. None has the right to be worshipped except Him. I place my trust in Him and He is Lord of the Majestic Throne.',
    repeatCount: 7,
    reference: 'Abu Dawud 5081',
  ),
  Dhikr(
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    transliteration: "Raditu billahi rabban, wa bil-islami dinan, wa bi-Muhammadin ﷺ nabiyya",
    translation: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet.',
    repeatCount: 3,
    reference: 'Abu Dawud 5072',
  ),
];

// ── Evening Adhkar ──────────────────────────────────────────────────────────

const eveningAdhkar = <Dhikr>[
  Dhikr(
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "Amsayna wa amsal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadeer",
    translation: 'We have reached the evening and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner.',
    reference: 'Muslim 2723',
  ),
  Dhikr(
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namootu, wa ilaykal-maseer",
    translation: 'O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die, and unto You is our return.',
    reference: 'Tirmidhi 3391',
  ),
  Dhikr(
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: "Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika 'alay, wa abu'u bidhanbi faghfir li fa innahu la yaghfirudh-dhunuba illa ant",
    translation: 'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide to Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sins except You.',
    reference: 'Bukhari 6306 (Sayyid al-Istighfar)',
  ),
  Dhikr(
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdihi',
    translation: 'Glory is to Allah and praise is to Him.',
    repeatCount: 100,
    reference: 'Muslim 2692',
  ),
  Dhikr(
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadeer",
    translation: 'None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent.',
    repeatCount: 10,
    reference: 'Bukhari 6403',
  ),
  Dhikr(
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    repeatCount: 3,
    reference: 'Muslim 2709',
  ),
  Dhikr(
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: "Bismillahilladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-samee'ul-'aleem",
    translation: 'In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.',
    repeatCount: 3,
    reference: 'Abu Dawud 5088',
  ),
  Dhikr(
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa ant",
    translation: 'O Allah, grant my body health. O Allah, grant my hearing health. O Allah, grant my sight health. None has the right to be worshipped except You.',
    repeatCount: 3,
    reference: 'Abu Dawud 5090',
  ),
  Dhikr(
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
    transliteration: "Allahumma inni a'udhu bika minal-kufri, wal-faqri, wa a'udhu bika min 'adhabil-qabr, la ilaha illa ant",
    translation: 'O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None has the right to be worshipped except You.',
    repeatCount: 3,
    reference: 'Abu Dawud 5090',
  ),
  Dhikr(
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration: "HasbiyAllahu la ilaha illa huwa, 'alayhi tawakkaltu, wa huwa rabbul-'arshil-'adheem",
    translation: 'Allah is sufficient for me. None has the right to be worshipped except Him. I place my trust in Him and He is Lord of the Majestic Throne.',
    repeatCount: 7,
    reference: 'Abu Dawud 5081',
  ),
  Dhikr(
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    transliteration: "Raditu billahi rabban, wa bil-islami dinan, wa bi-Muhammadin ﷺ nabiyya",
    translation: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet.',
    repeatCount: 3,
    reference: 'Abu Dawud 5072',
  ),
];

// ── Selected Duas ───────────────────────────────────────────────────────────

const selectedDuas = <DuaEntry>[
  // Daily essentials
  DuaEntry(
    title: 'Before eating',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah.',
    reference: 'Abu Dawud 3767',
    category: 'Daily',
  ),
  DuaEntry(
    title: 'After eating',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    transliteration: "Alhamdu lillahilladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah",
    translation: 'All praise is for Allah who fed me this and provided it for me without any might or power from myself.',
    reference: 'Abu Dawud 4023',
    category: 'Daily',
  ),
  DuaEntry(
    title: 'Entering the home',
    arabic: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا',
    transliteration: 'Bismillahi walajna, wa bismillahi kharajna, wa ala rabbina tawakkalna',
    translation: 'In the name of Allah we enter, in the name of Allah we leave, and upon our Lord we place our trust.',
    reference: 'Abu Dawud 5096',
    category: 'Daily',
  ),
  DuaEntry(
    title: 'Leaving the home',
    arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: "Bismillah, tawakkaltu 'alAllah, wa la hawla wa la quwwata illa billah",
    translation: 'In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.',
    reference: 'Abu Dawud 5095',
    category: 'Daily',
  ),
  DuaEntry(
    title: 'Before sleeping',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya',
    translation: 'In Your name, O Allah, I die and I live.',
    reference: 'Bukhari 6324',
    category: 'Daily',
  ),
  DuaEntry(
    title: 'Upon waking up',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    transliteration: "Alhamdu lillahilladhi ahyana ba'da ma amatana wa ilayhin-nushoor",
    translation: 'All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.',
    reference: 'Bukhari 6324',
    category: 'Daily',
  ),

  // Protection
  DuaEntry(
    title: 'For protection',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    reference: 'Muslim 2709',
    category: 'Protection',
  ),
  DuaEntry(
    title: 'Against anxiety and sorrow',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayni wa ghalabatir-rijal",
    translation: 'O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.',
    reference: 'Bukhari 2893',
    category: 'Protection',
  ),
  DuaEntry(
    title: 'Against evil eye',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
    transliteration: "A'udhu bikalimatillahit-tammati min kulli shaytanin wa hammah, wa min kulli 'aynin lammah",
    translation: "I seek refuge in Allah's perfect words from every devil and poisonous creature, and from every envious evil eye.",
    reference: 'Bukhari 3371',
    category: 'Protection',
  ),

  // Guidance and forgiveness
  DuaEntry(
    title: 'For guidance',
    arabic: 'اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي',
    transliteration: 'Allahummah-dini wa saddidni',
    translation: 'O Allah, guide me and keep me on the right path.',
    reference: 'Muslim 2725',
    category: 'Guidance',
  ),
  DuaEntry(
    title: 'For forgiveness',
    arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
    transliteration: "Rabbighfir li wa tub 'alayya innaka antat-tawwabur-rahim",
    translation: 'My Lord, forgive me and accept my repentance. You are the Acceptor of Repentance, the Most Merciful.',
    reference: 'Abu Dawud 1516',
    category: 'Guidance',
  ),
  DuaEntry(
    title: 'For knowledge',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    transliteration: "Rabbi zidni 'ilma",
    translation: 'My Lord, increase me in knowledge.',
    reference: 'Quran 20:114',
    category: 'Guidance',
  ),
  DuaEntry(
    title: 'For patience',
    arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliteration: "Rabbana afrigh 'alayna sabran wa thabbit aqdamana wansurna 'alal-qawmil-kafireen",
    translation: 'Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people.',
    reference: 'Quran 2:250',
    category: 'Guidance',
  ),

  // Travel
  DuaEntry(
    title: 'When travelling',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ',
    transliteration: "Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrineen, wa inna ila rabbina lamunqaliboon",
    translation: 'Glory to Him who has subjected this to us, and we could never have it by our efforts. And to our Lord we shall surely return.',
    reference: 'Quran 43:13-14',
    category: 'Travel',
  ),

  // Health and wellbeing
  DuaEntry(
    title: 'For good health',
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي',
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari",
    translation: 'O Allah, grant my body health. O Allah, grant my hearing health. O Allah, grant my sight health.',
    reference: 'Abu Dawud 5090',
    category: 'Health',
  ),
  DuaEntry(
    title: 'When visiting the sick',
    arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
    transliteration: "As'alullaha al-'adheem, rabbal-'arshil-'adheem, an yashfiyak",
    translation: 'I ask Allah, the Mighty, Lord of the Mighty Throne, to cure you.',
    reference: 'Abu Dawud 3106',
    category: 'Health',
  ),

  // Family
  DuaEntry(
    title: 'For parents',
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbir-hamhuma kama rabbayani saghira',
    translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
    reference: 'Quran 17:24',
    category: 'Family',
  ),
  DuaEntry(
    title: 'For children',
    arabic: 'رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ',
    transliteration: 'Rabbi hab li minas-saliheen',
    translation: 'My Lord, grant me righteous offspring.',
    reference: 'Quran 37:100',
    category: 'Family',
  ),
  DuaEntry(
    title: 'For spouse',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqeena imama",
    translation: 'Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous.',
    reference: 'Quran 25:74',
    category: 'Family',
  ),

  // Provision
  DuaEntry(
    title: 'For provision',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    transliteration: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan",
    translation: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.',
    reference: 'Ibn Majah 925',
    category: 'Provision',
  ),

  // Afterlife
  DuaEntry(
    title: 'For the best of both worlds',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
    translation: 'Our Lord, give us in this world that which is good and in the Hereafter that which is good, and protect us from the punishment of the Fire.',
    reference: 'Quran 2:201',
    category: 'Afterlife',
  ),
  DuaEntry(
    title: 'For steadfastness',
    arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
    transliteration: "Ya muqallibal-qulubi thabbit qalbi 'ala deenik",
    translation: 'O Turner of hearts, keep my heart firm upon Your religion.',
    reference: 'Tirmidhi 2140',
    category: 'Afterlife',
  ),
];

/// All dua categories in display order.
const duaCategories = [
  'Daily',
  'Protection',
  'Guidance',
  'Travel',
  'Health',
  'Family',
  'Provision',
  'Afterlife',
];
