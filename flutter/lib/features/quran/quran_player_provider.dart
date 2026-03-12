// QuranPlayerProvider — mobile Quran audio playback state.
//
// Uses the same everyayah.com CDN as the TV panel:
//   https://everyayah.com/data/{reciterId}/{sss}{aaa}.mp3
// where {sss} = zero-padded surah (3 digits), {aaa} = zero-padded ayah (3 digits).

import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../tv/tv_quran_service.dart';

class QuranPlayerProvider extends ChangeNotifier {
  QuranPlayerProvider() {
    _player.playingStream.listen((playing) {
      _isPlaying = playing;
      notifyListeners();
    });
    _player.currentIndexStream.listen((index) {
      if (index == null) return;
      _currentVerse = _playlistStartVerse + index;
      notifyListeners();
    });
  }

  final AudioPlayer _player = AudioPlayer();

  // ── State ────────────────────────────────────────────────────────────────

  TvReciter _reciter = kTvReciters.first;
  TvReciter get reciter => _reciter;

  int _currentSurah = 1;
  int get currentSurah => _currentSurah;

  int _currentVerse = 1;
  int get currentVerse => _currentVerse;

  int _playlistStartVerse = 1;

  bool _isPlaying = false;
  bool get isPlaying => _isPlaying;

  bool _isMinimized = false;
  bool get isMinimized => _isMinimized;

  /// Total verses in the current surah.
  int get totalVerses => kTvSurahVerseCounts[_currentSurah - 1];

  // ── Playback ─────────────────────────────────────────────────────────────

  /// Load and play [surah] starting at [startVerse].
  Future<void> playSurah(int surah, {int startVerse = 1}) async {
    final clampedSurah = surah.clamp(1, 114);
    final maxVerse = kTvSurahVerseCounts[clampedSurah - 1];
    final clampedStart = startVerse.clamp(1, maxVerse);

    _currentSurah = clampedSurah;
    _currentVerse = clampedStart;
    _playlistStartVerse = clampedStart;
    notifyListeners();

    final sources = List.generate(
      maxVerse - clampedStart + 1,
      (i) => AudioSource.uri(Uri.parse(
        tvAyahUrl(_reciter.id, clampedSurah, clampedStart + i),
      )),
    );

    try {
      await _player.setAudioSources(sources);
      await _player.play();
    } catch (_) {
      // Playback failure is non-fatal.
    }
  }

  Future<void> play() async => _player.play();

  Future<void> pause() async => _player.pause();

  Future<void> next() async {
    if (_player.hasNext) await _player.seekToNext();
  }

  Future<void> previous() async {
    if (_player.hasPrevious) await _player.seekToPrevious();
  }

  Future<void> seekToVerse(int verse) async {
    final idx = (verse - _playlistStartVerse).clamp(0, totalVerses - 1);
    await _player.seek(Duration.zero, index: idx);
  }

  Future<void> setReciter(TvReciter reciter) async {
    _reciter = reciter;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('quran_player_reciter_id', reciter.id);
    await playSurah(_currentSurah, startVerse: _currentVerse);
  }

  void setMinimized(bool minimized) {
    _isMinimized = minimized;
    notifyListeners();
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }
}
