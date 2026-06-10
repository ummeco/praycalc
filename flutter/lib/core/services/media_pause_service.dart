import 'dart:io';

import 'package:flutter/services.dart';

/// Service for pausing media playback during adhan on TV and desktop.
///
/// Platform behavior:
/// - **Android / Android TV:** Uses a MethodChannel to request and release
///   Android audio focus (`AUDIOFOCUS_GAIN_TRANSIENT`). Other media apps
///   (YouTube, Netflix, Spotify) pause automatically while focus is held.
/// - **macOS:** Uses a MethodChannel to activate an AVAudioSession, which
///   causes other audio apps to duck or pause. Falls back to no-op if the
///   native plugin is not registered.
/// - **Windows / Linux:** Audio focus APIs are not standardized. The adhan
///   plays over existing audio. A future enhancement can simulate media key
///   presses via platform plugins.
/// - **iOS / web:** No-op (mobile notifications handle audio separately).
///
/// This is an opt-in feature controlled by [AlertSettings.mediaPauseEnabled]
/// or [TvSettings.mediaPauseEnabled].
///
/// Platform implementations required in:
/// - `android/app/src/main/kotlin/.../AudioFocusPlugin.kt`
/// - `macos/Runner/AudioSessionPlugin.swift` (optional)
class MediaPauseService {
  MediaPauseService._();
  static final instance = MediaPauseService._();

  /// Android TV audio focus channel.
  static const _androidChannel = MethodChannel(
    'com.praycalc.app/audio_focus',
  );

  /// macOS AVAudioSession channel.
  static const _macosChannel = MethodChannel(
    'com.praycalc.app/audio_session',
  );

  bool _hasFocus = false;

  /// Whether audio focus is currently held by PrayCalc.
  bool get hasFocus => _hasFocus;

  /// Request transient audio focus, causing other media apps to pause.
  ///
  /// Call this when the adhan starts playing. Returns `true` if focus
  /// was granted, `false` otherwise.
  ///
  /// On unsupported platforms (iOS, web, Windows, Linux), this is a no-op
  /// that returns `false`.
  Future<bool> requestAudioFocus() async {
    try {
      if (Platform.isAndroid) {
        final result =
            await _androidChannel.invokeMethod<bool>('requestAudioFocus');
        _hasFocus = result ?? false;
        return _hasFocus;
      }
      if (Platform.isMacOS) {
        final result =
            await _macosChannel.invokeMethod<bool>('activateSession');
        _hasFocus = result ?? false;
        return _hasFocus;
      }
      // Windows/Linux: no standard audio focus API.
      // Adhan will play over existing audio.
      return false;
    } on MissingPluginException {
      // Platform plugin not registered. No-op.
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
      if (Platform.isAndroid) {
        final result =
            await _androidChannel.invokeMethod<bool>('releaseAudioFocus');
        _hasFocus = !(result ?? true);
        return result ?? false;
      }
      if (Platform.isMacOS) {
        final result =
            await _macosChannel.invokeMethod<bool>('deactivateSession');
        _hasFocus = !(result ?? true);
        return result ?? false;
      }
      _hasFocus = false;
      return false;
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

  /// Request transient audio focus with "duck" behaviour.
  ///
  /// On Android this uses `AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK`, causing other
  /// media apps to lower their volume rather than pause completely. On macOS
  /// and other platforms this falls back to the same behaviour as
  /// [requestAudioFocus] (full pause), as duck-specific APIs are not exposed
  /// by the current native plugins.
  Future<bool> duckMedia() async {
    try {
      if (Platform.isAndroid) {
        final result = await _androidChannel
            .invokeMethod<bool>('requestAudioFocusDuck');
        _hasFocus = result ?? false;
        return _hasFocus;
      }
      // On non-Android platforms, fall back to full pause.
      return requestAudioFocus();
    } on MissingPluginException {
      return false;
    } on PlatformException catch (_) {
      _hasFocus = false;
      return false;
    }
  }
}
