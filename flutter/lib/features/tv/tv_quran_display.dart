import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Surah names (English transliteration), 114 entries.
const List<String> _kSurahNames = [
  'Al-Fatihah', 'Al-Baqarah', "Ali 'Imran", "An-Nisa'", "Al-Ma'idah",
  "Al-An'am", "Al-A'raf", 'Al-Anfal', 'At-Tawbah', 'Yunus',
  'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr',
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

/// Full-screen Quran display panel for the TV display.
///
/// Shows the current surah name, ayah number, Arabic text (when provided),
/// and optionally an English translation. When [arabicText] is null the panel
/// shows a decorative placeholder icon — useful during loading.
///
/// Daily rotation: consumers may compute the displayed surah/ayah from
/// [dayOfYearAyah] to rotate through the Quran over the course of a year.
class TvQuranDisplay extends StatelessWidget {
  const TvQuranDisplay({
    super.key,
    required this.surah,
    required this.ayah,
    this.arabicText,
    this.translation,
    this.showTranslation = false,
  });

  final int surah;
  final int ayah;
  final String? arabicText;
  final String? translation;
  final bool showTranslation;

  String get _surahName {
    final idx = surah - 1;
    if (idx >= 0 && idx < _kSurahNames.length) return _kSurahNames[idx];
    return 'Surah $surah';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [PrayCalcColors.deep, PrayCalcColors.dark],
        ),
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Surah / ayah header pill
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 8),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: PrayCalcColors.mid.withAlpha(80),
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '$_surahName  •  Ayah $ayah',
                  style: const TextStyle(
                    color: PrayCalcColors.light,
                    fontSize: 18,
                    letterSpacing: 1,
                  ),
                ),
              ),
              const SizedBox(height: 40),

              // Arabic text or placeholder icon
              if (arabicText != null)
                Text(
                  arabicText!,
                  textDirection: TextDirection.rtl,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 48,
                    height: 1.8,
                    // Amiri font gives beautiful Arabic rendering.
                    // Add to pubspec assets if available; falls back to system Arabic.
                    fontFamily: 'Amiri',
                  ),
                )
              else
                const Icon(
                  Icons.menu_book_rounded,
                  color: Colors.white38,
                  size: 80,
                ),

              // Translation
              if (showTranslation && translation != null) ...[
                const SizedBox(height: 32),
                Text(
                  translation!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 22,
                    fontStyle: FontStyle.italic,
                    height: 1.5,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Helper — compute a surah/ayah index from day-of-year for daily rotation
// ---------------------------------------------------------------------------

/// Returns the (surah, ayah) pair to display today, rotating through all
/// 6,236 ayahs of the Quran over approximately 17 years (6236 days).
///
/// [ayahCounts] must be the 114-entry list from tv_quran_service.dart.
({int surah, int ayah}) dayOfYearAyah(List<int> ayahCounts) {
  final total = ayahCounts.fold(0, (a, b) => a + b);
  final dayIndex =
      DateTime.now().difference(DateTime(2024)).inDays % total;

  int running = 0;
  for (int s = 0; s < ayahCounts.length; s++) {
    if (dayIndex < running + ayahCounts[s]) {
      return (surah: s + 1, ayah: dayIndex - running + 1);
    }
    running += ayahCounts[s];
  }
  return (surah: 1, ayah: 1); // fallback
}
