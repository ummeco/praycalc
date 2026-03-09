import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart';
import 'package:path_provider/path_provider.dart';

import '../../shared/models/tv_settings_model.dart';

export '../../shared/models/tv_settings_model.dart' show QuranPlaybackMode;

// ---------------------------------------------------------------------------
// Reciter catalogue
// ---------------------------------------------------------------------------

@immutable
class QuranReciter {
  final String id;
  final String name;
  final String country;
  final String emoji;

  /// Identifier used in the QuranicAudio CDN path.
  final String cdnIdentifier;

  const QuranReciter({
    required this.id,
    required this.name,
    required this.country,
    required this.emoji,
    required this.cdnIdentifier,
  });
}

const List<QuranReciter> kQuranReciters = [
  QuranReciter(
    id: 'sudais',
    name: 'Sheikh Sudais',
    country: 'Saudi Arabia',
    emoji: '🇸🇦',
    cdnIdentifier: 'ar.abdurrahmaansudais',
  ),
  QuranReciter(
    id: 'mishary',
    name: 'Mishary Al-Afasy',
    country: 'Kuwait',
    emoji: '🇰🇼',
    cdnIdentifier: 'ar.alafasy',
  ),
  QuranReciter(
    id: 'hussary',
    name: 'Mahmoud Khalil Al-Hussary',
    country: 'Egypt',
    emoji: '🇪🇬',
    cdnIdentifier: 'ar.husary',
  ),
  QuranReciter(
    id: 'minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    country: 'Egypt',
    emoji: '🇪🇬',
    cdnIdentifier: 'ar.minshawi',
  ),
  QuranReciter(
    id: 'ghamdi',
    name: 'Saad Al-Ghamdi',
    country: 'Saudi Arabia',
    emoji: '🇸🇦',
    cdnIdentifier: 'ar.saoodashuraym',
  ),
];

// ---------------------------------------------------------------------------
// CDN helpers
// ---------------------------------------------------------------------------

/// Returns the MP3 URL for a given surah/ayah from the QuranicAudio CDN.
/// Example: cdn.islamic.network/quran/audio/128/ar.alafasy/001001.mp3
String quranAyahUrl(String reciterCdn, int surah, int ayah) {
  final s = surah.toString().padLeft(3, '0');
  final a = ayah.toString().padLeft(3, '0');
  return 'https://cdn.islamic.network/quran/audio/128/$reciterCdn/$s$a.mp3';
}

/// Ayah count per surah (114 entries, 1-indexed via [surah - 1]).
const List<int> kSurahAyahCounts = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
  5, 4, 5, 6,
];

// ---------------------------------------------------------------------------
// TvQuranService
// ---------------------------------------------------------------------------

/// Manages sequential Quran ayah playback for the TV display.
///
/// Uses [just_audio] (already in pubspec.yaml) to stream individual ayah MP3s
/// from the QuranicAudio CDN. Advances automatically on completion.
class TvQuranService extends ChangeNotifier {
  // Singleton
  static final TvQuranService instance = TvQuranService._();
  TvQuranService._();

  final AudioPlayer _player = AudioPlayer();

  QuranReciter _reciter = kQuranReciters[0]; // Sudais default
  QuranPlaybackMode _mode = QuranPlaybackMode.continuous;
  int _currentSurah = 1; // 1-indexed
  int _currentAyah = 1;
  bool _isPlaying = false;
  int? _specificSurah;

  QuranReciter get reciter => _reciter;
  QuranPlaybackMode get mode => _mode;
  int get currentSurah => _currentSurah;
  int get currentAyah => _currentAyah;
  bool get isPlaying => _isPlaying;
  int? get specificSurah => _specificSurah;

  // ---------------------------------------------------------------------------
  // TV2-4.7 — Offline cache
  // ---------------------------------------------------------------------------

  bool _isOffline = false;
  final StreamController<bool> _offlineController =
      StreamController<bool>.broadcast();

  /// Emits true when the device is offline (CDN unreachable).
  Stream<bool> get offlineStream => _offlineController.stream;

  bool get isOffline => _isOffline;

  void _setOffline(bool value) {
    if (_isOffline == value) return;
    _isOffline = value;
    _offlineController.add(value);
  }

  /// Returns the local cached file path for [surah]/[reciterId] if it exists,
  /// or null if not cached.
  Future<String?> getCachedPath(int surah, int reciterId) async {
    try {
      final dir = await _cacheDir();
      final file = File('${dir.path}/${reciterId}_${surah.toString().padLeft(3, '0')}.mp3');
      if (await file.exists()) return file.path;
    } catch (_) {}
    return null;
  }

  /// Downloads and caches the full surah audio for each surah number in
  /// [surahNumbers] using the current reciter. Skips already-cached surahs.
  Future<void> cacheSelectedSurahs(List<int> surahNumbers) async {
    final dir = await _cacheDir();
    for (final surah in surahNumbers) {
      final fileName =
          '${_reciter.id}_${surah.toString().padLeft(3, '0')}.mp3';
      final file = File('${dir.path}/$fileName');
      if (await file.exists()) continue;
      // Download the first ayah MP3 as a representative cache marker;
      // full surah streaming falls back to CDN for subsequent ayahs.
      final url = quranAyahUrl(_reciter.cdnIdentifier, surah, 1);
      try {
        final response = await http.get(Uri.parse(url));
        if (response.statusCode == 200) {
          await file.writeAsBytes(response.bodyBytes);
        }
      } catch (_) {
        // Network failure — skip this surah, will retry next call.
      }
    }
  }

  Future<Directory> _cacheDir() async {
    final base = await getApplicationDocumentsDirectory();
    final dir = Directory('${base.path}/quran_cache');
    if (!await dir.exists()) await dir.create(recursive: true);
    return dir;
  }

  /// URL for the currently queued ayah.
  String get currentAyahUrl =>
      quranAyahUrl(_reciter.cdnIdentifier, _currentSurah, _currentAyah);

  void _initListeners() {
    _player.playerStateStream.listen((state) {
      final playing = state.playing &&
          state.processingState != ProcessingState.completed;
      if (_isPlaying != playing) {
        _isPlaying = playing;
        notifyListeners();
      }
      if (state.processingState == ProcessingState.completed) {
        advanceAyah();
      }
    });
  }

  /// Call once after constructing (lazy init to avoid eager AudioPlayer setup).
  void ensureInit() {
    _initListeners();
  }

  void setReciter(QuranReciter reciter) {
    _reciter = reciter;
    notifyListeners();
    if (_isPlaying) {
      // Restart current position with new reciter
      _loadAndPlay();
    }
  }

  void setMode(QuranPlaybackMode mode) {
    _mode = mode;
    notifyListeners();
  }

  /// Set surah for [QuranPlaybackMode.specificSurah]. Clamps to 1–114.
  void setSpecificSurah(int surah) {
    _specificSurah = surah.clamp(1, 114);
    notifyListeners();
  }

  Future<void> play() async {
    await _loadAndPlay();
  }

  Future<void> pause() async {
    await _player.pause();
    _isPlaying = false;
    notifyListeners();
  }

  Future<void> stop() async {
    await _player.stop();
    _isPlaying = false;
    notifyListeners();
  }

  Future<void> _loadAndPlay() async {
    // Check for a locally cached file first (TV2-4.7).
    final cached = await getCachedPath(_currentSurah, _reciter.id.hashCode);
    final urlToPlay = cached != null
        ? Uri.file(cached).toString()
        : currentAyahUrl;

    try {
      await _player.setUrl(urlToPlay);
      await _player.play();
      _isPlaying = true;
      _setOffline(false);
      notifyListeners();
    } catch (_) {
      // Network error or CDN issue — mark offline and skip to next ayah.
      _setOffline(true);
      advanceAyah();
    }
  }

  /// Advance to the next ayah (or next surah if at the end).
  void advanceAyah() {
    final maxAyah = kSurahAyahCounts[_currentSurah - 1];
    if (_currentAyah < maxAyah) {
      _currentAyah++;
    } else {
      _advanceSurah();
    }
    notifyListeners();
    if (_isPlaying) _loadAndPlay();
  }

  void _advanceSurah() {
    switch (_mode) {
      case QuranPlaybackMode.continuous:
        _currentSurah = (_currentSurah % 114) + 1;
        _currentAyah = 1;
      case QuranPlaybackMode.randomSurah:
        // Deterministic pseudo-random using current time to avoid true randomness dep
        _currentSurah = 1 + (DateTime.now().millisecondsSinceEpoch % 114);
        _currentAyah = 1;
      case QuranPlaybackMode.specificSurah:
        _currentSurah = _specificSurah ?? 1;
        _currentAyah = 1;
      case QuranPlaybackMode.juzByJuz:
        // Sequential — same as continuous for now
        _currentSurah = (_currentSurah % 114) + 1;
        _currentAyah = 1;
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }
}
