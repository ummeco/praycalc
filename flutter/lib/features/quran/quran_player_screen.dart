// QuranPlayerScreen — full-screen Quran audio player for mobile.
//
// Route: '/quran/player'

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../tv/tv_quran_service.dart';
import 'quran_player_provider.dart';

// ── Surah names (transliterated, 1-indexed) ───────────────────────────────────

const _kSurahNames = [
  'Al-Fatiha', 'Al-Baqarah', 'Ali Imran', "An-Nisa'", 'Al-Maidah',
  "Al-An'am", 'Al-Araf', 'Al-Anfal', 'At-Tawbah', 'Yunus',
  'Hud', 'Yusuf', "Ar-Ra'd", 'Ibrahim', 'Al-Hijr',
  'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
  'Al-Anbiya', 'Al-Hajj', 'Al-Muminun', 'An-Nur', 'Al-Furqan',
  'Ash-Shuara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
  'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir',
  'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
  'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
  'Al-Waqiah', 'Al-Hadid', 'Al-Mujadila', 'Al-Hashr', 'Al-Mumtahanah',
  'As-Saf', 'Al-Jumuah', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
  'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Maarij',
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah',
  'Al-Insan', 'Al-Mursalat', "An-Naba'", 'An-Naziat', 'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj',
  'At-Tariq', 'Al-Ala', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
  'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin',
  'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat',
  'Al-Qariah', 'At-Takathur', 'Al-Asr', 'Al-Humazah', 'Al-Fil',
  'Quraysh', 'Al-Maun', 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
  'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas',
];

// ── Screen ────────────────────────────────────────────────────────────────────

class QuranPlayerScreen extends StatefulWidget {
  const QuranPlayerScreen({super.key});

  @override
  State<QuranPlayerScreen> createState() => _QuranPlayerScreenState();
}

class _QuranPlayerScreenState extends State<QuranPlayerScreen> {
  late final QuranPlayerProvider _provider;

  @override
  void initState() {
    super.initState();
    _provider = QuranPlayerProvider();
    _provider.addListener(_onProviderUpdate);
  }

  @override
  void dispose() {
    _provider.removeListener(_onProviderUpdate);
    _provider.dispose();
    super.dispose();
  }

  void _onProviderUpdate() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final p = _provider;

    return Scaffold(
      appBar: AppBar(title: const Text('Quran Player')),
      body: Column(
        children: [
          // ── Surah selector ─────────────────────────────────────────────
          SizedBox(
            height: 44,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: 114,
              itemBuilder: (context, i) {
                final surah = i + 1;
                final isSelected = p.currentSurah == surah;
                return GestureDetector(
                  onTap: () => p.playSurah(surah),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(
                        horizontal: 4, vertical: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? PrayCalcColors.mid
                          : Colors.white.withAlpha(20),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected
                            ? PrayCalcColors.light
                            : Colors.white.withAlpha(30),
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '$surah',
                      style: TextStyle(
                        color: isSelected
                            ? Colors.white
                            : Colors.white.withAlpha(160),
                        fontSize: 13,
                        fontWeight: isSelected
                            ? FontWeight.w700
                            : FontWeight.w400,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // ── Reciter selector ──────────────────────────────────────────
          SizedBox(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: kTvReciters.length,
              itemBuilder: (context, i) {
                final reciter = kTvReciters[i];
                final isSelected = p.reciter.id == reciter.id;
                return GestureDetector(
                  onTap: () => p.setReciter(reciter),
                  child: Container(
                    margin: const EdgeInsets.symmetric(
                        horizontal: 4, vertical: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? PrayCalcColors.mid.withAlpha(80)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? PrayCalcColors.mid
                            : Colors.white.withAlpha(25),
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      reciter.nameEn,
                      style: TextStyle(
                        color: isSelected
                            ? PrayCalcColors.light
                            : Colors.white.withAlpha(140),
                        fontSize: 12,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 24),

          // ── Surah name ────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              _kSurahNames[p.currentSurah - 1],
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w700,
                color: Colors.white,
                letterSpacing: -0.5,
              ),
            ),
          ),

          const SizedBox(height: 8),

          // ── Verse indicator ───────────────────────────────────────────
          Text(
            'Verse ${p.currentVerse} / ${p.totalVerses}',
            style: TextStyle(
              color: Colors.white.withAlpha(140),
              fontSize: 16,
            ),
          ),

          const Spacer(),

          // ── Transport controls ────────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                iconSize: 40,
                icon: const Icon(Icons.skip_previous_rounded,
                    color: Colors.white),
                onPressed: p.previous,
                tooltip: 'Previous Verse',
              ),
              const SizedBox(width: 16),
              GestureDetector(
                onTap: p.isPlaying ? p.pause : p.play,
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: PrayCalcColors.mid,
                  ),
                  child: Icon(
                    p.isPlaying
                        ? Icons.pause_rounded
                        : Icons.play_arrow_rounded,
                    color: Colors.white,
                    size: 40,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              IconButton(
                iconSize: 40,
                icon: const Icon(Icons.skip_next_rounded,
                    color: Colors.white),
                onPressed: p.next,
                tooltip: 'Next Verse',
              ),
            ],
          ),

          const SizedBox(height: 48),
        ],
      ),
    );
  }
}

// ── Mini-player bar ───────────────────────────────────────────────────────────

/// Persistent bottom mini-player bar. Rendered in the main Scaffold as a
/// persistent footer when [provider.isPlaying] is true and the user is not
/// on QuranPlayerScreen.
class QuranMiniPlayer extends StatelessWidget {
  const QuranMiniPlayer({super.key, required this.provider});

  final QuranPlayerProvider provider;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF0D2010).withAlpha(240),
        border: Border(
          top: BorderSide(color: PrayCalcColors.mid.withAlpha(60)),
        ),
      ),
      child: Row(
        children: [
          Icon(Icons.menu_book_rounded,
              color: PrayCalcColors.mid, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _kSurahNames[provider.currentSurah - 1],
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Verse ${provider.currentVerse}',
                  style: TextStyle(
                    color: Colors.white.withAlpha(120),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(
              provider.isPlaying
                  ? Icons.pause_rounded
                  : Icons.play_arrow_rounded,
              color: Colors.white,
            ),
            onPressed:
                provider.isPlaying ? provider.pause : provider.play,
          ),
          IconButton(
            icon: const Icon(Icons.skip_next_rounded,
                color: Colors.white),
            onPressed: provider.next,
          ),
        ],
      ),
    );
  }
}
