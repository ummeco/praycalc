// TV-VERSE-1: TV Quran verse display widget.
//
// Listens to TvQuranService.currentVerseStream and shows the current ayah in
// Arabic + English. Positioned at the bottom 20% of the screen for TV display.
//
// QURAN-1: Arabic text is fetched live from alquran.cloud API using the
// ar.alafasy edition, which returns the diacritised Arabic text for any
// surah:ayah. Results are cached in-memory so each verse is fetched at most
// once per session. The inline kInlineVerses dataset still provides
// instant-first-frame text for the most common short surahs — the API fetch
// runs concurrently and updates the display when it resolves.
//
// API: GET https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/ar.alafasy
// Response field used: data.text (full Arabic text with tashkeel)

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'tv_quran_service.dart';

// ─── Verse data model ─────────────────────────────────────────────────────────

class TvVerseData {
  final int surah;
  final int verse;
  final String arabic;
  final String transliteration;
  final String translation;

  const TvVerseData({
    required this.surah,
    required this.verse,
    required this.arabic,
    required this.transliteration,
    required this.translation,
  });
}

// ─── Inline verse dataset ─────────────────────────────────────────────────────
//
// NOTE: All transliteration strings use double quotes to avoid conflicts with
// Unicode right-single-quote characters (U+2019) used as apostrophes in
// Arabic transliteration. The list is non-const for the same reason.

/// Curated inline verse dataset. Covers Al-Fatiha (1:1-7), Al-Baqara (2:1-5),
/// Al-Ikhlas (112:1-4), Al-Falaq (113:1-5), An-Nas (114:1-6).
/// All other verses return a structured fallback.
final List<TvVerseData> kInlineVerses = [
  // ── Al-Fatiha ──────────────────────────────────────────────────────────────
  const TvVerseData(
    surah: 1, verse: 1,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Bismi llahi r-rahmani r-rahim',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
  ),
  const TvVerseData(
    surah: 1, verse: 2,
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: "Al-hamdu lillahi rabbi l-'alamin",
    translation: 'All praise is due to Allah, Lord of the worlds.',
  ),
  const TvVerseData(
    surah: 1, verse: 3,
    arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Ar-rahmani r-rahim',
    translation: 'The Entirely Merciful, the Especially Merciful.',
  ),
  const TvVerseData(
    surah: 1, verse: 4,
    arabic: 'مَالِكِ يَوْمِ الدِّينِ',
    transliteration: 'Maliki yawmi d-din',
    translation: 'Sovereign of the Day of Recompense.',
  ),
  const TvVerseData(
    surah: 1, verse: 5,
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    transliteration: "Iyyaka na'budu wa iyyaka nasta'in",
    translation: 'It is You we worship and You we ask for help.',
  ),
  const TvVerseData(
    surah: 1, verse: 6,
    arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    transliteration: 'Ihdina s-sirata l-mustaqim',
    translation: 'Guide us to the straight path.',
  ),
  const TvVerseData(
    surah: 1, verse: 7,
    arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    transliteration: "Sirata lladhina an'amta 'alayhim ghayri l-maghdubi 'alayhim wa la d-dallin",
    translation: 'The path of those upon whom You have bestowed favor, not of those who have earned anger or of those who are astray.',
  ),
  // ── Al-Baqara 1–5 ─────────────────────────────────────────────────────────
  const TvVerseData(
    surah: 2, verse: 1,
    arabic: 'الٓمٓ',
    transliteration: 'Alif Lam Mim',
    translation: 'Alif, Lam, Meem.',
  ),
  const TvVerseData(
    surah: 2, verse: 2,
    arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ',
    transliteration: 'Dhalika l-kitabu la rayba fihi hudan lil-muttaqin',
    translation: 'This is the Book about which there is no doubt, a guidance for those conscious of Allah.',
  ),
  const TvVerseData(
    surah: 2, verse: 3,
    arabic: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ',
    transliteration: "Alladhina yu'minuna bil-ghaybi wa yuqimuna s-salata wa mimma razaqnahum yunfiqun",
    translation: 'Who believe in the unseen, establish prayer, and spend out of what We have provided for them.',
  ),
  const TvVerseData(
    surah: 2, verse: 4,
    arabic: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ',
    transliteration: "Walladhina yu'minuna bima unzila ilayka wa ma unzila min qablika wa bil-akhirati hum yuqinun",
    translation: 'And who believe in what has been revealed to you and what was revealed before you, and of the Hereafter they are certain in faith.',
  ),
  const TvVerseData(
    surah: 2, verse: 5,
    arabic: 'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ',
    transliteration: "Ula'ika 'ala hudan min rabbihim wa ula'ika humu l-muflihun",
    translation: 'Those are upon right guidance from their Lord, and it is those who are the successful.',
  ),
  // ── Al-Ikhlas ──────────────────────────────────────────────────────────────
  const TvVerseData(
    surah: 112, verse: 1,
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    transliteration: 'Qul huwa llahu ahad',
    translation: 'Say, "He is Allah, the One."',
  ),
  const TvVerseData(
    surah: 112, verse: 2,
    arabic: 'اللَّهُ الصَّمَدُ',
    transliteration: 'Allahu s-samad',
    translation: 'Allah, the Eternal Refuge.',
  ),
  const TvVerseData(
    surah: 112, verse: 3,
    arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    transliteration: 'Lam yalid wa lam yulad',
    translation: 'He neither begets nor is born.',
  ),
  const TvVerseData(
    surah: 112, verse: 4,
    arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    transliteration: 'Wa lam yakun lahu kufuwan ahad',
    translation: 'Nor is there to Him any equivalent.',
  ),
  // ── Al-Falaq ───────────────────────────────────────────────────────────────
  const TvVerseData(
    surah: 113, verse: 1,
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
    transliteration: "Qul a'udhu bi-rabbi l-falaq",
    translation: 'Say, "I seek refuge in the Lord of daybreak."',
  ),
  const TvVerseData(
    surah: 113, verse: 2,
    arabic: 'مِن شَرِّ مَا خَلَقَ',
    transliteration: 'Min sharri ma khalaq',
    translation: 'From the evil of that which He created.',
  ),
  const TvVerseData(
    surah: 113, verse: 3,
    arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
    transliteration: 'Wa min sharri ghasiqin idha waqab',
    translation: 'And from the evil of darkness when it settles.',
  ),
  const TvVerseData(
    surah: 113, verse: 4,
    arabic: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
    transliteration: "Wa min sharri n-naffathati fi l-'uqad",
    translation: 'And from the evil of the blowers in knots.',
  ),
  const TvVerseData(
    surah: 113, verse: 5,
    arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: 'Wa min sharri hasidin idha hasad',
    translation: 'And from the evil of an envier when he envies.',
  ),
  // ── An-Nas ─────────────────────────────────────────────────────────────────
  const TvVerseData(
    surah: 114, verse: 1,
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliteration: "Qul a'udhu bi-rabbi n-nas",
    translation: 'Say, "I seek refuge in the Lord of mankind."',
  ),
  const TvVerseData(
    surah: 114, verse: 2,
    arabic: 'مَلِكِ النَّاسِ',
    transliteration: 'Maliki n-nas',
    translation: 'The Sovereign of mankind.',
  ),
  const TvVerseData(
    surah: 114, verse: 3,
    arabic: 'إِلَٰهِ النَّاسِ',
    transliteration: 'Ilahi n-nas',
    translation: 'The God of mankind.',
  ),
  const TvVerseData(
    surah: 114, verse: 4,
    arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
    transliteration: 'Min sharri l-waswasi l-khannas',
    translation: 'From the evil of the retreating whisperer.',
  ),
  const TvVerseData(
    surah: 114, verse: 5,
    arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
    transliteration: 'Alladhi yuwaswisu fi suduri n-nas',
    translation: 'Who whispers in the breasts of mankind.',
  ),
  const TvVerseData(
    surah: 114, verse: 6,
    arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration: 'Mina l-jinnati wa n-nas',
    translation: 'From among the jinn and mankind.',
  ),
];

// ─── Lookup helper ────────────────────────────────────────────────────────────

/// Returns verse data from the inline dataset, or a structured fallback for
/// verses not yet in the local cache.
TvVerseData tvVerseDataFor(int surah, int verse) {
  for (final v in kInlineVerses) {
    if (v.surah == surah && v.verse == verse) return v;
  }
  return TvVerseData(
    surah: surah,
    verse: verse,
    arabic: '',
    transliteration: '',
    translation: '',
  );
}

// ─── alquran.cloud Arabic text cache + fetcher ────────────────────────────────

/// In-memory cache: key is '$surah:$verse', value is the Arabic text string.
final Map<String, String> _arabicTextCache = {};

/// Fetches Arabic verse text from alquran.cloud (ar.alafasy edition).
/// Returns null on any network or parse error — callers degrade gracefully.
Future<String?> _fetchArabicText(int surah, int verse) async {
  final key = '$surah:$verse';
  if (_arabicTextCache.containsKey(key)) return _arabicTextCache[key];

  try {
    final uri = Uri.parse(
      'https://api.alquran.cloud/v1/ayah/$surah:$verse/ar.alafasy',
    );
    final response = await http.get(uri).timeout(const Duration(seconds: 8));
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final text = (body['data'] as Map<String, dynamic>)['text'] as String?;
      if (text != null && text.isNotEmpty) {
        _arabicTextCache[key] = text;
        return text;
      }
    }
  } catch (e, st) {
    // Network error, timeout, or parse failure — return null for graceful degradation.
  }
  return null;
}

// ─── Surah name helper (114 entries) ─────────────────────────────────────────

const List<String> _kSurahNames = [
  'Al-Fatihah', 'Al-Baqarah', "Ali 'Imran", "An-Nisa'", "Al-Ma'idah",
  "Al-An'am", "Al-A'raf", 'Al-Anfal', 'At-Tawbah', 'Yunus',
  'Hud', 'Yusuf', "Ar-Ra'd", 'Ibrahim', 'Al-Hijr',
  'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
  "Al-Anbiya'", 'Al-Hajj', "Al-Mu'minun", 'An-Nur', 'Al-Furqan',
  "Ash-Shu'ara'", 'An-Naml', 'Al-Qasas', "Al-'Ankabut", 'Ar-Rum',
  'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir',
  'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
  'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
  "Al-Waqi'ah", 'Al-Hadid', 'Al-Mujadila', 'Al-Hashr', 'Al-Mumtahanah',
  'As-Saf', "Al-Jumu'ah", 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
  'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', "Al-Ma'arij",
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah',
  'Al-Insan', 'Al-Mursalat', "An-Naba'", "An-Nazi'at", "'Abasa",
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj',
  'At-Tariq', "Al-A'la", 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
  'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin',
  "Al-'Alaq", 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', "Al-'Adiyat",
  "Al-Qari'ah", 'At-Takathur', "Al-'Asr", 'Al-Humazah', 'Al-Fil',
  'Quraysh', "Al-Ma'un", 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
  'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas',
];

String _surahName(int surah) {
  final idx = surah - 1;
  if (idx >= 0 && idx < _kSurahNames.length) return _kSurahNames[idx];
  return 'Surah $surah';
}

// ─── TvQuranVerseDisplay widget ───────────────────────────────────────────────

/// Full-screen TV widget that shows the current Quran verse during playback.
///
/// Listens to [TvQuranService.currentVerseStream] and rebuilds whenever the
/// verse advances. For each verse, it immediately shows the inline text (if
/// available) while concurrently fetching the full Arabic text from
/// alquran.cloud. When the fetch resolves the display updates automatically.
/// Uses [AnimatedSwitcher] for smooth crossfade transitions.
/// Positioned at the bottom 20% of the screen.
class TvQuranVerseDisplay extends StatefulWidget {
  const TvQuranVerseDisplay({
    super.key,
    required this.service,
  });

  final TvQuranService service;

  @override
  State<TvQuranVerseDisplay> createState() => _TvQuranVerseDisplayState();
}

class _TvQuranVerseDisplayState extends State<TvQuranVerseDisplay> {
  // Tracks the last verse for which we launched a fetch, so we don't
  // re-trigger when the widget rebuilds for the same verse.
  String _lastFetchKey = '';
  // The live Arabic text resolved from the API (null = not yet fetched).
  String? _liveArabic;

  void _maybeFetch(int surah, int verse) {
    final key = '$surah:$verse';
    if (key == _lastFetchKey) return;
    _lastFetchKey = key;
    // Reset so the card shows the inline text (or loading indicator) immediately.
    if (mounted) setState(() => _liveArabic = null);

    _fetchArabicText(surah, verse).then((text) {
      if (mounted && _lastFetchKey == key && text != null) {
        setState(() => _liveArabic = text);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<int>(
      stream: widget.service.currentVerseStream,
      initialData: widget.service.currentVerse,
      builder: (context, snapshot) {
        final verse = snapshot.data ?? widget.service.currentVerse;
        final surah = widget.service.currentSurah;

        // Kick off the API fetch (no-op if same verse).
        _maybeFetch(surah, verse);

        // Start from the inline dataset; overlay the live Arabic when ready.
        final base = tvVerseDataFor(surah, verse);
        final arabic = _liveArabic ?? base.arabic;
        final isFetching = _liveArabic == null && base.arabic.isEmpty;

        return Align(
          alignment: Alignment.bottomCenter,
          child: FractionallySizedBox(
            heightFactor: 0.20,
            widthFactor: 1.0,
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _VerseCard(
                key: ValueKey('$surah-$verse-${arabic.isNotEmpty}'),
                surah: surah,
                verse: verse,
                arabic: arabic,
                transliteration: base.transliteration,
                translation: base.translation,
                isFetching: isFetching,
              ),
            ),
          ),
        );
      },
    );
  }
}

// ─── Verse card ───────────────────────────────────────────────────────────────

class _VerseCard extends StatelessWidget {
  const _VerseCard({
    super.key,
    required this.surah,
    required this.verse,
    required this.arabic,
    required this.transliteration,
    required this.translation,
    required this.isFetching,
  });

  final int surah;
  final int verse;
  final String arabic;
  final String transliteration;
  final String translation;
  /// True when the API fetch is in flight and no Arabic text is available yet.
  final bool isFetching;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.5),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 12),
      child: Stack(
        children: [
          // Surah + verse reference chip — top right.
          Positioned(
            top: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF1E5E2F).withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '${_surahName(surah)}  $surah:$verse',
                style: const TextStyle(
                  color: Color(0xFFC9F27A),
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),

          // Verse text column — centred.
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Arabic text — or loading indicator while fetching.
                if (isFetching)
                  const SizedBox(
                    width: 32,
                    height: 32,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                else if (arabic.isNotEmpty)
                  Text(
                    arabic,
                    textDirection: TextDirection.rtl,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontFamily: 'Amiri',
                      fontSize: 36,
                      height: 1.5,
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      shadows: [
                        Shadow(
                          color: Colors.black54,
                          offset: Offset(0, 2),
                          blurRadius: 6,
                        ),
                      ],
                    ),
                  ),
                if (transliteration.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  // Transliteration.
                  Text(
                    transliteration,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 18,
                      height: 1.4,
                      color: Colors.white.withValues(alpha: 0.8),
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
                if (translation.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  // Translation.
                  Text(
                    translation,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.4,
                      color: Colors.white.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
