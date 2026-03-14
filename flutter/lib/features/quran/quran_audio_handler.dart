// QURAN-2: Background playback + lock screen controls for Quran audio.
//
// QuranAudioHandler wraps just_audio's AudioPlayer via audio_service's
// BaseAudioHandler. This gives:
//   - iOS lock screen media controls (play/pause/skip)
//   - Android notification media controls
//   - Background audio on iOS (requires UIBackgroundModes=audio in Info.plist — already set)
//
// Usage: call QuranAudioHandler.init() in main() before runApp().
// Then access the singleton via QuranAudioHandler.instance.

import 'package:audio_service/audio_service.dart';
import 'package:just_audio/just_audio.dart';

import '../tv/tv_quran_service.dart';

class QuranAudioHandler extends BaseAudioHandler with QueueHandler, SeekHandler {
  QuranAudioHandler._() {
    // Forward just_audio state to audio_service so lock screen reflects reality.
    _player.playbackEventStream.listen(_onPlaybackEvent);
    _player.playingStream.listen((playing) {
      playbackState.add(playbackState.value.copyWith(
        playing: playing,
        controls: _controls(playing),
      ));
    });
    _player.currentIndexStream.listen((index) {
      if (index == null) return;
      if (queue.value.isNotEmpty && index < queue.value.length) {
        mediaItem.add(queue.value[index]);
      }
    });
  }

  static QuranAudioHandler? _instance;

  /// Call once in main() before runApp().
  static Future<QuranAudioHandler> init() async {
    if (_instance != null) return _instance!;
    _instance = await AudioService.init(
      builder: () => QuranAudioHandler._(),
      config: const AudioServiceConfig(
        androidNotificationChannelId: 'com.praycalc.app.quran',
        androidNotificationChannelName: 'Quran Playback',
        androidNotificationOngoing: true,
        androidStopForegroundOnPause: true,
      ),
    );
    return _instance!;
  }

  static QuranAudioHandler get instance {
    assert(_instance != null,
        'QuranAudioHandler.init() must be called before accessing instance.');
    return _instance!;
  }

  final AudioPlayer _player = AudioPlayer();
  AudioPlayer get player => _player;

  // ── Playback controls — called by lock screen / notification ─────────────

  @override
  Future<void> play() => _player.play();

  @override
  Future<void> pause() => _player.pause();

  @override
  Future<void> stop() async {
    await _player.stop();
    await super.stop();
  }

  @override
  Future<void> skipToNext() async {
    if (_player.hasNext) await _player.seekToNext();
  }

  @override
  Future<void> skipToPrevious() async {
    if (_player.hasPrevious) await _player.seekToPrevious();
  }

  @override
  Future<void> seek(Duration position) => _player.seek(position);

  // ── Load surah ────────────────────────────────────────────────────────────

  /// Load [surah] starting from [startVerse] with [reciter].
  /// Updates the audio_service queue and media metadata for the lock screen.
  Future<void> loadSurah(
    int surah, {
    int startVerse = 1,
    required TvReciter reciter,
  }) async {
    final maxVerse = kTvSurahVerseCounts[surah - 1];
    final clampedStart = startVerse.clamp(1, maxVerse);

    final items = List.generate(
      maxVerse - clampedStart + 1,
      (i) {
        final verse = clampedStart + i;
        return MediaItem(
          id: tvAyahUrl(reciter.id, surah, verse),
          title: 'Surah $surah: Verse $verse',
          artist: reciter.nameEn,
          album: 'Quran — Surah $surah',
          artUri: Uri.parse('https://praycalc.com/icons/icon-512.png'),
        );
      },
    );

    queue.add(items);

    final sources = items
        .map((item) => AudioSource.uri(Uri.parse(item.id)))
        .toList();

    await _player.setAudioSources(sources);
    if (items.isNotEmpty) mediaItem.add(items.first);
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  void _onPlaybackEvent(PlaybackEvent event) {
    playbackState.add(playbackState.value.copyWith(
      processingState: _processingState(),
      playing: _player.playing,
      controls: _controls(_player.playing),
      updatePosition: _player.position,
      bufferedPosition: _player.bufferedPosition,
      speed: _player.speed,
    ));
  }

  AudioProcessingState _processingState() {
    switch (_player.processingState) {
      case ProcessingState.idle:
        return AudioProcessingState.idle;
      case ProcessingState.loading:
        return AudioProcessingState.loading;
      case ProcessingState.buffering:
        return AudioProcessingState.buffering;
      case ProcessingState.ready:
        return AudioProcessingState.ready;
      case ProcessingState.completed:
        return AudioProcessingState.completed;
    }
  }

  List<MediaControl> _controls(bool playing) => [
        MediaControl.skipToPrevious,
        if (playing) MediaControl.pause else MediaControl.play,
        MediaControl.skipToNext,
      ];
}
