import 'dart:async';

import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// P-5: TvDhikrMode — names of Allah + ayah + hadith rotation
// ---------------------------------------------------------------------------
//
// Displays rotating Islamic remembrance content in full-screen when the TV
// home screen mode switcher is on the Dhikr panel.

const List<_DhikrEntry> _kDhikrEntries = [
  _DhikrEntry(arabic: 'الرَّحْمَنُ', transliteration: 'Ar-Rahmān', meaning: 'The Most Gracious'),
  _DhikrEntry(arabic: 'الرَّحِيمُ', transliteration: 'Ar-Rahīm', meaning: 'The Most Merciful'),
  _DhikrEntry(arabic: 'الْمَلِكُ', transliteration: 'Al-Malik', meaning: 'The King'),
  _DhikrEntry(arabic: 'الْقُدُّوسُ', transliteration: 'Al-Quddūs', meaning: 'The Holy'),
  _DhikrEntry(arabic: 'السَّلَامُ', transliteration: 'As-Salām', meaning: 'The Source of Peace'),
  _DhikrEntry(arabic: 'الْمُؤْمِنُ', transliteration: 'Al-Muʾmin', meaning: 'The Guardian of Faith'),
  _DhikrEntry(arabic: 'الْعَزِيزُ', transliteration: 'Al-ʿAzīz', meaning: 'The Almighty'),
  _DhikrEntry(arabic: 'الْغَفُورُ', transliteration: 'Al-Ghafūr', meaning: 'The All-Forgiving'),
  _DhikrEntry(arabic: 'اللَّطِيفُ', transliteration: 'Al-Laṭīf', meaning: 'The Subtle One'),
  _DhikrEntry(arabic: 'الصَّبُورُ', transliteration: 'Aṣ-Ṣabūr', meaning: 'The Patient One'),
  _DhikrEntry(arabic: 'الشَّكُورُ', transliteration: 'Ash-Shakūr', meaning: 'The Appreciative'),
  _DhikrEntry(arabic: 'الْحَكِيمُ', transliteration: 'Al-Ḥakīm', meaning: 'The All-Wise'),
  _DhikrEntry(arabic: 'الْوَدُودُ', transliteration: 'Al-Wadūd', meaning: 'The Most Loving'),
  _DhikrEntry(arabic: 'الْكَرِيمُ', transliteration: 'Al-Karīm', meaning: 'The Most Generous'),
  _DhikrEntry(arabic: 'الرَّقِيبُ', transliteration: 'Ar-Raqīb', meaning: 'The Watchful'),
];

const List<_AyahEntry> _kAyahEntries = [
  _AyahEntry(
    arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ',
    english: 'And when My servants ask you concerning Me — indeed I am near.',
    reference: 'Al-Baqarah 2:186',
  ),
  _AyahEntry(
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    english: 'Indeed, with hardship will be ease.',
    reference: 'Ash-Sharh 94:6',
  ),
  _AyahEntry(
    arabic: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ',
    english: 'Do not despair of the mercy of Allah.',
    reference: 'Yusuf 12:87',
  ),
  _AyahEntry(
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
    english: 'So remember Me; I will remember you.',
    reference: 'Al-Baqarah 2:152',
  ),
  _AyahEntry(
    arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
    english: 'And He is with you wherever you are.',
    reference: 'Al-Hadid 57:4',
  ),
];

class _DhikrEntry {
  final String arabic;
  final String transliteration;
  final String meaning;
  const _DhikrEntry({required this.arabic, required this.transliteration, required this.meaning});
}

class _AyahEntry {
  final String arabic;
  final String english;
  final String reference;
  const _AyahEntry({required this.arabic, required this.english, required this.reference});
}

enum _ContentPhase { name, ayah }

class TvDhikrMode extends StatefulWidget {
  const TvDhikrMode({super.key, this.fontScale = 1.0});

  final double fontScale;

  @override
  State<TvDhikrMode> createState() => _TvDhikrModeState();
}

class _TvDhikrModeState extends State<TvDhikrMode>
    with SingleTickerProviderStateMixin {
  late AnimationController _fadeCtrl;
  late Animation<double> _fade;

  int _nameIndex = 0;
  int _ayahIndex = 0;
  _ContentPhase _phase = _ContentPhase.name;
  Timer? _cycleTimer;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fade = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeInOut);
    _fadeCtrl.forward();
    // Show each name for 8 seconds, ayah for 20 seconds
    _scheduleNext(_phase == _ContentPhase.name ? 8 : 20);
  }

  void _scheduleNext(int seconds) {
    _cycleTimer?.cancel();
    _cycleTimer = Timer(Duration(seconds: seconds), _advance);
  }

  Future<void> _advance() async {
    await _fadeCtrl.reverse();
    if (!mounted) return;
    setState(() {
      if (_phase == _ContentPhase.name) {
        _nameIndex = (_nameIndex + 1) % _kDhikrEntries.length;
        // Every 5 names, show an ayah
        if (_nameIndex % 5 == 0) {
          _phase = _ContentPhase.ayah;
          _ayahIndex = (_ayahIndex + 1) % _kAyahEntries.length;
        }
      } else {
        _phase = _ContentPhase.name;
      }
    });
    await _fadeCtrl.forward();
    _scheduleNext(_phase == _ContentPhase.name ? 8 : 20);
  }

  @override
  void dispose() {
    _cycleTimer?.cancel();
    _fadeCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fade,
      child: Center(
        child: _phase == _ContentPhase.name
            ? _buildName()
            : _buildAyah(),
      ),
    );
  }

  Widget _buildName() {
    final entry = _kDhikrEntries[_nameIndex];
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          entry.arabic,
          textDirection: TextDirection.rtl,
          style: TextStyle(
            fontFamily: 'Amiri',
            fontSize: 96 * widget.fontScale,
            color: const Color(0xFFC9F27A),
            fontWeight: FontWeight.w700,
            height: 1.3,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          entry.transliteration,
          style: TextStyle(
            color: Colors.white70,
            fontSize: 28 * widget.fontScale,
            letterSpacing: 2,
            fontStyle: FontStyle.italic,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          entry.meaning,
          style: TextStyle(
            color: Colors.white38,
            fontSize: 20 * widget.fontScale,
          ),
        ),
        const SizedBox(height: 32),
        Text(
          'One of the 99 Names of Allah',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.2),
            fontSize: 13 * widget.fontScale,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }

  Widget _buildAyah() {
    final entry = _kAyahEntries[_ayahIndex];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 60),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            entry.arabic,
            textDirection: TextDirection.rtl,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'Amiri',
              fontSize: 52 * widget.fontScale,
              color: Colors.white,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            entry.english,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white70,
              fontSize: 22 * widget.fontScale,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '— ${entry.reference}',
            style: TextStyle(
              color: const Color(0xFFC9F27A).withValues(alpha: 0.7),
              fontSize: 16 * widget.fontScale,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }
}
