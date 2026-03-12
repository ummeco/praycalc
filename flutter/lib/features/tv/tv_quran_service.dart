// TV-AUD-1: TvQuranService — everyayah.com CDN-based Quran audio service.
//
// Manages per-surah gapless playback using ConcatenatingAudioSource. Reciters
// are sourced from the everyayah.com CDN, which provides individual MP3 files
// per ayah: https://everyayah.com/data/{reciterId}/{sss}{aaa}.mp3
//
// This service is separate from the core TvQuranService (core/services/) and
// is designed for use in the TV Quran panel and screensaver verse display.

import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';

// ─── Reciter model ────────────────────────────────────────────────────────────

@immutable
class TvReciter {
  final String id;
  final String nameEn;
  final String nameAr;

  const TvReciter({
    required this.id,
    required this.nameEn,
    required this.nameAr,
  });
}

// ─── Reciter catalogue (everyayah.com identifiers) ───────────────────────────

const List<TvReciter> kTvReciters = [
  TvReciter(
    id: 'AbdulSamad_64kbps',
    nameEn: 'Abdul Basit',
    nameAr: 'عبد الباسط',
  ),
  TvReciter(
    id: 'Husary_64kbps',
    nameEn: 'Mahmoud Husary',
    nameAr: 'محمود خليل الحصري',
  ),
  TvReciter(
    id: 'Minshawi_Murattal_128kbps',
    nameEn: 'Mohamed Al-Minshawi',
    nameAr: 'محمد المنشاوي',
  ),
  TvReciter(
    id: 'Mohammad_al_Tablaway_128kbps',
    nameEn: 'Mohammad Al-Tablaway',
    nameAr: 'محمد الطبلاوي',
  ),
  TvReciter(
    id: 'Muhammad_Jibreel_128kbps',
    nameEn: 'Muhammad Jibreel',
    nameAr: 'محمد جبريل',
  ),
  TvReciter(
    id: 'Parhizgar_40kbps',
    nameEn: 'Shahriar Parhizgar',
    nameAr: 'شهریار پرهیزگار',
  ),
  TvReciter(
    id: 'Sahl_Yassin_64kbps',
    nameEn: 'Sahl Yassin',
    nameAr: 'سهل ياسين',
  ),
  TvReciter(
    id: 'Sudais_192kbps',
    nameEn: 'Abdul Rahman Al-Sudais',
    nameAr: 'عبدالرحمن السديس',
  ),
  TvReciter(
    id: 'Yasser_Ad-Dussary_128kbps',
    nameEn: 'Yasser Al-Dosari',
    nameAr: 'ياسر الدوسري',
  ),
];

// ─── Surah verse counts (114 surahs, 1-indexed via [surah - 1]) ──────────────

const List<int> kTvSurahVerseCounts = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109,  // 1–10
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135,   // 11–20
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60,      // 21–30
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85,        // 31–40
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45,         // 41–50
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13,         // 51–60
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44,         // 61–70
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42,         // 71–80
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20,         // 81–90
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11,             // 91–100
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3,                 // 101–110
  5, 4, 5, 6,                                     // 111–114
];

// ─── CDN URL helper ───────────────────────────────────────────────────────────

/// Returns the everyayah.com MP3 URL for a given surah/ayah/reciter.
String tvAyahUrl(String reciterId, int surah, int ayah) {
  final sss = surah.toString().padLeft(3, '0');
  final aaa = ayah.toString().padLeft(3, '0');
  return 'https://everyayah.com/data/$reciterId/$sss$aaa.mp3';
}

// ─── TvQuranService ──────────────────────────────────────────────────────────

/// Quran audio playback service for the TV, backed by everyayah.com CDN.
///
/// Uses [just_audio]'s [AudioPlayer.setAudioSources] to queue all ayahs of a
/// surah for gapless playback. [currentVerseStream] emits the 1-based ayah
/// index as playback advances through the playlist.
class TvQuranService extends ChangeNotifier {
  TvQuranService() {
    _initListeners();
  }

  final AudioPlayer _player = AudioPlayer();
  final StreamController<int> _verseController =
      StreamController<int>.broadcast();

  TvReciter _currentReciter = kTvReciters[7]; // Al-Sudais default
  int _currentSurah = 1;
  int _currentVerse = 1;
  bool _isPlaying = false;
  int _totalVerses = 7; // Al-Fatiha default

  // Track the playlist start verse so we can compute absolute verse numbers
  // from the just_audio currentIndex (which is 0-based within the playlist).
  int _playlistStartVerse = 1;

  TvReciter get currentReciter => _currentReciter;
  int get currentSurah => _currentSurah;
  int get currentVerse => _currentVerse;
  bool get isPlaying => _isPlaying;
  int get totalVerses => _totalVerses;

  /// Emits the 1-based ayah number each time playback advances to a new verse.
  Stream<int> get currentVerseStream => _verseController.stream;

  void _initListeners() {
    _player.currentIndexStream.listen((index) {
      if (index == null) return;
      final verse = _playlistStartVerse + index;
      if (verse != _currentVerse) {
        _currentVerse = verse;
        _verseController.add(_currentVerse);
        notifyListeners();
      }
    });

    _player.playingStream.listen((playing) {
      if (_isPlaying != playing) {
        _isPlaying = playing;
        notifyListeners();
      }
    });
  }

  /// Start playback of [surah] from [startVerse].
  ///
  /// Builds an audio source list with all remaining ayahs of the surah
  /// starting from [startVerse] and calls setAudioSources for gapless progression.
  Future<void> playSurah(int surah, {int startVerse = 1}) async {
    final clampedSurah = surah.clamp(1, 114);
    final maxVerse = kTvSurahVerseCounts[clampedSurah - 1];
    final clampedStart = startVerse.clamp(1, maxVerse);

    _currentSurah = clampedSurah;
    _currentVerse = clampedStart;
    _totalVerses = maxVerse;
    _playlistStartVerse = clampedStart;

    final sources = List.generate(
      maxVerse - clampedStart + 1,
      (i) => AudioSource.uri(Uri.parse(
        tvAyahUrl(_currentReciter.id, clampedSurah, clampedStart + i),
      )),
    );

    try {
      await _player.setAudioSources(sources);
      await _player.play();
      _isPlaying = true;
      _verseController.add(_currentVerse);
      notifyListeners();
    } catch (_) {
      _isPlaying = false;
      notifyListeners();
    }
  }

  Future<void> pause() async {
    await _player.pause();
    _isPlaying = false;
    notifyListeners();
  }

  Future<void> resume() async {
    await _player.play();
    _isPlaying = true;
    notifyListeners();
  }

  void nextVerse() {
    final maxVerse = kTvSurahVerseCounts[_currentSurah - 1];
    if (_currentVerse < maxVerse) {
      final nextIndex = _currentVerse - _playlistStartVerse + 1;
      _player.seek(Duration.zero, index: nextIndex);
    }
  }

  void prevVerse() {
    if (_currentVerse > _playlistStartVerse) {
      final prevIndex = _currentVerse - _playlistStartVerse - 1;
      _player.seek(Duration.zero, index: prevIndex.clamp(0, double.maxFinite.toInt()));
    }
  }

  void setReciter(TvReciter reciter) {
    if (_currentReciter.id == reciter.id) return;
    _currentReciter = reciter;
    notifyListeners();
    // Restart from current position with new reciter.
    playSurah(_currentSurah, startVerse: _currentVerse);
  }

  @override
  void dispose() {
    _player.dispose();
    _verseController.close();
    super.dispose();
  }
}
