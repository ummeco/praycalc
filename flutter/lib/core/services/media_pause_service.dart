import 'package:flutter/services.dart';

/// Service for pausing media playback on TV during adhan (PC-F1-11).
///
/// Uses a platform MethodChannel to request and release Android audio focus.
/// When audio focus is gained with [AudioFocus.AUDIOFOCUS_GAIN_TRANSIENT],
/// other media apps (YouTube, Netflix, Spotify, etc.) will pause playback.
/// Releasing focus allows them to resume automatically.
///
/// This is an opt-in feature controlled by [TvSettings.mediaPauseEnabled].
///
/// Platform implementation required in:
/// - `android/app/src/main/kotlin/.../AudioFocusPlugin.kt`
///
/// The native side should:
/// 1. Request `AUDIOFOCUS_GAIN_TRANSIENT` on `requestAudioFocus`
/// 2. Release focus on `releaseAudioFocus`
/// 3. Return `true` on success, `false` on failure
class MediaPauseService {
  MediaPauseService._();
  static final instance = MediaPauseService._();

  static const _channel = MethodChannel(
    'com.praycalc.app/audio_focus',
  );

  bool _hasFocus = false;

  /// Whether audio focus is currently held by PrayCalc.
  bool get hasFocus => _hasFocus;

  /// Request transient audio focus, causing other media apps to pause.
  ///
  /// Call this when the adhan starts playing. Returns `true` if focus
  /// was granted, `false` otherwise.
  ///
  /// On non-Android platforms (iOS, web), this is a no-op that returns `false`.
  Future<bool> requestAudioFocus() async {
    try {
      final result = await _channel.invokeMethod<bool>('requestAudioFocus');
      _hasFocus = result ?? false;
      return _hasFocus;
    } on MissingPluginException {
      // Platform does not support audio focus (iOS, web, etc.).
      return false;
    } on PlatformException catch (_) {
      // Audio focus request denied by the system.
      _hasFocus = false;
      return false;
    }
  }

  /// Release audio focus, allowing paused media apps to resume playback.
  ///
  /// Call this when the adhan finishes. Returns `true` if focus was
  /// successfully released.
  Future<bool> releaseAudioFocus() async {
    try {
      final result = await _channel.invokeMethod<bool>('releaseAudioFocus');
      _hasFocus = !(result ?? true);
      return result ?? false;
    } on MissingPluginException {
      _hasFocus = false;
      return false;
    } on PlatformException catch (_) {
      _hasFocus = false;
      return false;
    }
  }

  /// Pause media for the duration of adhan, then release.
  ///
  /// Convenience method that requests focus, waits for [duration],
  /// then releases. If [duration] is null, you must call
  /// [releaseAudioFocus] manually.
  Future<void> pauseForAdhan({Duration? duration}) async {
    final granted = await requestAudioFocus();
    if (!granted) return;

    if (duration != null) {
      await Future.delayed(duration);
      await releaseAudioFocus();
    }
  }
}
