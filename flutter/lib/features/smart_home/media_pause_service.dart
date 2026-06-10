import 'dart:async';

import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Preference key for the media-pause-at-adhan opt-in setting.
const _kMediaPauseEnabled = 'media_pause_enabled';

/// Preference key for how long to pause media (in minutes).
const _kMediaPauseDuration = 'media_pause_duration_minutes';

/// Default pause duration in minutes.
const _kDefaultPauseDuration = 5;

/// Service that pauses media playback at adhan time on Android TV.
///
/// Uses a [MethodChannel] to request transient audio focus
/// (`AUDIOFOCUS_GAIN_TRANSIENT`) on Android, which causes other media
/// apps to pause playback. After a configurable duration the audio focus
/// is abandoned, allowing the paused app to resume.
///
/// This is opt-in: the user must enable it via [setEnabled]. The setting
/// is persisted in [SharedPreferences].
///
/// Usage from a notification or adhan callback:
/// ```dart
/// final service = MediaPauseService();
/// if (await service.isEnabled) {
///   await service.pauseMedia();
/// }
/// ```
class MediaPauseService {
  MediaPauseService({MethodChannel? channel})
      : _channel = channel ??
            const MethodChannel('com.praycalc.app/media_pause');

  final MethodChannel _channel;
  Timer? _resumeTimer;

  /// Whether the media-pause feature is active.
  ///
  /// Returns the persisted preference value, defaulting to `false`.
  Future<bool> get isEnabled async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_kMediaPauseEnabled) ?? false;
  }

  /// Persist the opt-in preference.
  Future<void> setEnabled(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kMediaPauseEnabled, value);
  }

  /// The number of minutes to hold audio focus before releasing.
  Future<int> get pauseDurationMinutes async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_kMediaPauseDuration) ?? _kDefaultPauseDuration;
  }

  /// Persist the pause duration.
  Future<void> setPauseDuration(int minutes) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_kMediaPauseDuration, minutes.clamp(1, 30));
  }

  /// Request transient audio focus to pause media, then schedule a
  /// release after [pauseDurationMinutes].
  ///
  /// On platforms other than Android this is a no-op.
  Future<void> pauseMedia() async {
    try {
      await _channel.invokeMethod<void>('requestAudioFocus', {
        'focusGain': 'AUDIOFOCUS_GAIN_TRANSIENT',
      });
    } on PlatformException {
      // Platform channel not available (e.g., iOS or desktop).
      return;
    } on MissingPluginException {
      // Native side not implemented yet.
      return;
    }

    // Schedule automatic release.
    _resumeTimer?.cancel();
    final minutes = await pauseDurationMinutes;
    _resumeTimer = Timer(Duration(minutes: minutes), () {
      resumeMedia();
    });
  }

  /// Abandon audio focus early, allowing the paused media to resume.
  ///
  /// Called automatically after the configured duration, or can be
  /// triggered by user dismissal.
  Future<void> resumeMedia() async {
    _resumeTimer?.cancel();
    _resumeTimer = null;

    try {
      await _channel.invokeMethod<void>('abandonAudioFocus');
    } on PlatformException {
      // Ignore on unsupported platforms.
    } on MissingPluginException {
      // Native side not implemented yet.
    }
  }

  /// Clean up any pending timer. Call from a dispose or shutdown path.
  void dispose() {
    _resumeTimer?.cancel();
    _resumeTimer = null;
  }
}
