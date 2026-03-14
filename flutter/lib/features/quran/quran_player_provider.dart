// QuranPlayerProvider — mobile Quran audio playback state.
//
// QURAN-2: Now delegates to QuranAudioHandler (audio_service) on native
// platforms so playback continues in the background and lock screen /
// notification controls work on iOS and Android.
//
// On web, falls back to a bare AudioPlayer (audio_service not supported on web).
//
// Uses the same everyayah.com CDN as the TV panel:
//   https://everyayah.com/data/{reciterId}/{sss}{aaa}.mp3

import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../tv/tv_quran_service.dart';
import 'quran_arabic_service.dart';
import 'quran_audio_handler.dart';

class QuranPlayerProvider extends ChangeNotifier {
  QuranPlayerProvider() {
    if (kIsWeb) {
      // Web: audio_service not available — use a plain AudioPlayer.
      _webPlayer = AudioPlayer();
      _webPlayer!.playingStream.listen((playing) {
        _isPlaying = playing;
        notifyListeners();
      });
      _webPlayer!.currentIndexStream.listen((index) {
        if (index == null) return;
        final newVerse = _playlistStartVerse + index;
        if (newVerse != _currentVerse) {
          _currentVerse = newVerse;
          _loadArabicText();
        }
        notifyListeners();
      });
    } else {
      // Native: listen to the handler's underlying player.
      final handler = QuranAudioHandler.instance;
      handler.player.playingStream.listen((playing) {
        _isPlaying = playing;
        notifyListeners();
      });
      handler.player.currentIndexStream.listen((index) {
        if (index == null) return;
        final newVerse = _playlistStartVerse + index;
        if (newVerse != _currentVerse) {
          _currentVerse = newVerse;
          _loadArabicText();
        }
        notifyListeners();
      });
    }
  }

  /// Web-only fallback player (audio_service unavailable on web).
  AudioPlayer? _webPlayer;

  /// The underlying just_audio player — web player or handler's player.
  AudioPlayer get _player =>
      kIsWeb ? _webPlayer! : QuranAudioHandler.instance.player;

  final _arabicService = QuranArabicService.instance;

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

  /// Arabic text of the current verse. Null while loading or unavailable.
  String? _currentArabicText;
  String? get currentArabicText => _currentArabicText;

  /// Total verses in the current surah.
  int get totalVerses => kTvSurahVerseCounts[_currentSurah - 1];

  // ── Arabic text ──────────────────────────────────────────────────────────

  Future<void> _loadArabicText() async {
    _currentArabicText = null;
    notifyListeners();
    final text = await _arabicService.getVerseText(_currentSurah, _currentVerse);
    _currentArabicText = text;
    notifyListeners();
  }

  // ── Playback ─────────────────────────────────────────────────────────────

  /// Load and play [surah] starting at [startVerse].
  Future<void> playSurah(int surah, {int startVerse = 1}) async {
    final clampedSurah = surah.clamp(1, 114);
    final maxVerse = kTvSurahVerseCounts[clampedSurah - 1];
    final clampedStart = startVerse.clamp(1, maxVerse);

    _currentSurah = clampedSurah;
    _currentVerse = clampedStart;
    _playlistStartVerse = clampedStart;
    _loadArabicText(); // fire-and-forget
    notifyListeners();

    try {
      if (kIsWeb) {
        final sources = List.generate(
          maxVerse - clampedStart + 1,
          (i) => AudioSource.uri(Uri.parse(
            tvAyahUrl(_reciter.id, clampedSurah, clampedStart + i),
          )),
        );
        await _player.setAudioSources(sources);
        await _player.play();
      } else {
        // Route through QuranAudioHandler for lock screen + background audio.
        await QuranAudioHandler.instance.loadSurah(
          clampedSurah,
          startVerse: clampedStart,
          reciter: _reciter,
        );
        await QuranAudioHandler.instance.play();
      }
    } catch (_) {
      // Playback failure is non-fatal.
    }
  }

  Future<void> play() async => kIsWeb
      ? _player.play()
      : QuranAudioHandler.instance.play();

  Future<void> pause() async => kIsWeb
      ? _player.pause()
      : QuranAudioHandler.instance.pause();

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
    _webPlayer?.dispose();
    // Native handler is a singleton — do not dispose it here.
    super.dispose();
  }
}
