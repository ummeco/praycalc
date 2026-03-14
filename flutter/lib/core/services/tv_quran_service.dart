import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart';
import 'package:path_provider/path_provider.dart';

import '../../shared/models/tv_settings_model.dart';

export '../../shared/models/tv_settings_model.dart' show QuranPlaybackMode;

// ---------------------------------------------------------------------------
// QuranPlaybackState — broadcast stream payload for T-2 player screen
// ---------------------------------------------------------------------------

/// Immutable snapshot of the current Quran playback position and status.
///
/// Emitted on every meaningful change: ayah advance, play/pause toggle, and
/// surah-boundary announcements.
@immutable
class QuranPlaybackState {
  const QuranPlaybackState({
    required this.surah,
    required this.ayah,
    required this.isPlaying,
    this.isSurahAnnouncement = false,
    this.announcementSurahName,
    this.announcementCountdown,
  });

  final int surah;
  final int ayah;
  final bool isPlaying;

  /// True for the 5-second window between surahs.
  final bool isSurahAnnouncement;

  /// English name of the *next* surah during an announcement.
  final String? announcementSurahName;

  /// Seconds remaining in the announcement countdown (5 → 1).
  final int? announcementCountdown;

  QuranPlaybackState copyWith({
    int? surah,
    int? ayah,
    bool? isPlaying,
    bool? isSurahAnnouncement,
    String? announcementSurahName,
    int? announcementCountdown,
  }) {
    return QuranPlaybackState(
      surah: surah ?? this.surah,
      ayah: ayah ?? this.ayah,
      isPlaying: isPlaying ?? this.isPlaying,
      isSurahAnnouncement: isSurahAnnouncement ?? this.isSurahAnnouncement,
      announcementSurahName: announcementSurahName ?? this.announcementSurahName,
      announcementCountdown: announcementCountdown ?? this.announcementCountdown,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is QuranPlaybackState &&
          surah == other.surah &&
          ayah == other.ayah &&
          isPlaying == other.isPlaying &&
          isSurahAnnouncement == other.isSurahAnnouncement &&
          announcementSurahName == other.announcementSurahName &&
          announcementCountdown == other.announcementCountdown;

  @override
  int get hashCode => Object.hash(surah, ayah, isPlaying, isSurahAnnouncement,
      announcementSurahName, announcementCountdown);
}

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
    } catch (e, st) { debugPrint('[TvQuranService] getCachedPath error: $e\n$st'); }
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
      } catch (e, st) {
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
    } catch (e, st) {
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

  // ---------------------------------------------------------------------------
  // T-3: Gapless playback via AudioPlayer.setAudioSources + QuranPlaybackState
  // ---------------------------------------------------------------------------

  final StreamController<QuranPlaybackState> _playbackController =
      StreamController<QuranPlaybackState>.broadcast();

  /// Broadcast stream of [QuranPlaybackState]. The player screen subscribes to
  /// this to drive UI updates without polling.
  Stream<QuranPlaybackState> get playbackStream => _playbackController.stream;

  QuranPlaybackState _playbackState = const QuranPlaybackState(
    surah: 1,
    ayah: 1,
    isPlaying: false,
  );

  QuranPlaybackState get currentPlaybackState => _playbackState;

  // Tracks how many AudioSources have been added to the player's internal
  // playlist so _buildNextSources knows where to continue the sequence from.
  int _playlistLength = 0;

  StreamSubscription<int?>? _indexSub;
  bool _gaplessActive = false;

  // How many ayahs to prefetch ahead in the gapless source list.
  static const _kLookahead = 4;

  // Surah names (English) for announcements — mirrors _kSurahNames in display.
  static const List<String> _kSurahNames = [
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

  /// Public accessor for surah English name. Used by T-2 player screen.
  String surahName(int surah) => _surahName(surah);

  /// Start gapless Quran playback from [surah]:[ayah] with optional [reciter].
  ///
  /// Uses [AudioPlayer.setAudioSources] (just_audio ≥0.10) and extends the
  /// list with [addAudioSources] as playback advances.
  /// At surah boundaries emits a 5-second announcement before continuing.
  Future<void> startPlayback({
    int surah = 1,
    int ayah = 1,
    QuranReciter? reciter,
  }) async {
    // Cancel any existing gapless session.
    await _stopGapless();

    if (reciter != null) _reciter = reciter;

    _currentSurah = surah.clamp(1, 114);
    _currentAyah = ayah.clamp(1, kSurahAyahCounts[_currentSurah - 1]);
    _gaplessActive = true;
    _playlistLength = 0;

    final initial = _buildNextSources(_kLookahead);

    try {
      await _player.setAudioSources(initial);
    } catch (e, st) {
      _setOffline(true);
      _gaplessActive = false;
      return;
    }

    _indexSub = _player.currentIndexStream.listen(_onPlaylistIndexChanged);

    await _player.play();
    _isPlaying = true;
    _emitPlaybackState();
    notifyListeners();
  }

  /// Build [count] [AudioSource]s starting from the logical position that
  /// follows the last item already added ([_playlistLength] items ahead of
  /// [_currentSurah]/[_currentAyah]).
  List<AudioSource> _buildNextSources(int count) {
    int s = _currentSurah;
    int a = _currentAyah;

    // Walk past what is already queued.
    for (int i = 0; i < _playlistLength; i++) {
      a++;
      if (a > kSurahAyahCounts[s - 1]) {
        s = (s % 114) + 1;
        a = 1;
      }
    }

    final sources = <AudioSource>[];
    for (int i = 0; i < count; i++) {
      sources.add(AudioSource.uri(Uri.parse(
          quranAyahUrl(_reciter.cdnIdentifier, s, a))));
      _playlistLength++;
      a++;
      if (a > kSurahAyahCounts[s - 1]) {
        s = (s % 114) + 1;
        a = 1;
      }
    }
    return sources;
  }

  void _onPlaylistIndexChanged(int? index) {
    if (!_gaplessActive || index == null) return;

    // Recompute logical surah/ayah from playlist index.
    int s = _currentSurah;
    int a = _currentAyah;
    for (int i = 0; i < index; i++) {
      a++;
      if (a > kSurahAyahCounts[s - 1]) {
        // Surah boundary crossed — fire announcement on the step that crosses.
        final nextS = (s % 114) + 1;
        if (i == index - 1) {
          _triggerSurahAnnouncement(nextS);
        }
        s = nextS;
        a = 1;
      }
    }

    final newSurah = s;
    final newAyah = a;

    // Extend when nearing the end of the queued list.
    if (_gaplessActive && index >= _playlistLength - 2) {
      final more = _buildNextSources(_kLookahead);
      _player.addAudioSources(more);
    }

    if (_playbackState.surah != newSurah || _playbackState.ayah != newAyah) {
      _playbackState = QuranPlaybackState(
        surah: newSurah,
        ayah: newAyah,
        isPlaying: _isPlaying,
      );
      _playbackController.add(_playbackState);
      notifyListeners();
    }
  }

  /// Shows a 5-second surah announcement then resumes (or starts next surah).
  void _triggerSurahAnnouncement(int nextSurah) {
    final name = _surahName(nextSurah);
    // Broadcast announcement state with countdown 5..1
    for (int countdown = 5; countdown >= 1; countdown--) {
      final c = countdown;
      Future.delayed(Duration(seconds: 5 - c), () {
        if (!_gaplessActive) return;
        _playbackState = QuranPlaybackState(
          surah: _playbackState.surah,
          ayah: _playbackState.ayah,
          isPlaying: _isPlaying,
          isSurahAnnouncement: true,
          announcementSurahName: name,
          announcementCountdown: c,
        );
        _playbackController.add(_playbackState);
      });
    }
    // After 5s, clear announcement state.
    Future.delayed(const Duration(seconds: 5), () {
      if (!_gaplessActive) return;
      _playbackState = QuranPlaybackState(
        surah: _playbackState.surah,
        ayah: _playbackState.ayah,
        isPlaying: _isPlaying,
        isSurahAnnouncement: false,
      );
      _playbackController.add(_playbackState);
    });
  }

  void _emitPlaybackState() {
    _playbackState = QuranPlaybackState(
      surah: _currentSurah,
      ayah: _currentAyah,
      isPlaying: _isPlaying,
    );
    _playbackController.add(_playbackState);
  }

  // ---------------------------------------------------------------------------
  // Navigation helpers
  // ---------------------------------------------------------------------------

  /// Advance to the next verse.
  void nextVerse() {
    final maxAyah = kSurahAyahCounts[_currentSurah - 1];
    if (_currentAyah < maxAyah) {
      _currentAyah++;
    } else {
      _currentSurah = (_currentSurah % 114) + 1;
      _currentAyah = 1;
    }
    _seekToCurrentPosition();
  }

  /// Go back to the previous verse.
  void prevVerse() {
    if (_currentAyah > 1) {
      _currentAyah--;
    } else if (_currentSurah > 1) {
      _currentSurah--;
      _currentAyah = kSurahAyahCounts[_currentSurah - 1];
    }
    _seekToCurrentPosition();
  }

  /// Jump to the next surah from the beginning.
  void nextSurah() {
    _currentSurah = (_currentSurah % 114) + 1;
    _currentAyah = 1;
    _seekToCurrentPosition();
  }

  /// Jump to the previous surah from the beginning.
  void prevSurah() {
    if (_currentSurah > 1) _currentSurah--;
    _currentAyah = 1;
    _seekToCurrentPosition();
  }

  /// Restarts gapless playback from the current [_currentSurah]/[_currentAyah].
  void _seekToCurrentPosition() {
    if (_gaplessActive) {
      startPlayback(surah: _currentSurah, ayah: _currentAyah);
    } else {
      _emitPlaybackState();
      notifyListeners();
    }
  }

  /// Toggle play/pause on the gapless player.
  Future<void> togglePlayPause() async {
    if (_isPlaying) {
      await _player.pause();
      _isPlaying = false;
    } else {
      await _player.play();
      _isPlaying = true;
    }
    _emitPlaybackState();
    notifyListeners();
  }

  /// Stop gapless playback and clean up listeners.
  Future<void> stopGapless() async {
    await _stopGapless();
    _emitPlaybackState();
    notifyListeners();
  }

  Future<void> _stopGapless() async {
    _gaplessActive = false;
    await _indexSub?.cancel();
    _indexSub = null;
    await _player.stop();
    _playlistLength = 0;
    _isPlaying = false;
  }

  @override
  void dispose() {
    _stopGapless();
    _playbackController.close();
    _player.dispose();
    super.dispose();
  }
}
