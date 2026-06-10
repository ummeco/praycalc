import 'package:flutter/services.dart';

/// Handles audio crossfade between stream/Quran and adhan.
///
/// All methods are fire-and-forget with graceful fallback — the platform
/// channel may not be available on all platforms (e.g. iOS, desktop) and
/// errors are silently swallowed so the adhan always plays.
class TvAudioRouter {
  static const _channel = MethodChannel('com.praycalc.tv/audio');

  /// Fade out current audio over [durationMs] ms before the adhan starts.
  static Future<void> fadeOutForAdhan({int durationMs = 2000}) async {
    try {
      await _channel.invokeMethod<void>('fadeOut', {'durationMs': durationMs});
    } catch (_) {}
  }

  /// Fade stream audio back in after the adhan completes.
  static Future<void> fadeInAfterAdhan({int durationMs = 2000}) async {
    try {
      await _channel.invokeMethod<void>('fadeIn', {'durationMs': durationMs});
    } catch (_) {}
  }

  /// Request transient audio focus so other apps pause during the adhan.
  static Future<void> requestTransientFocus() async {
    try {
      await _channel.invokeMethod<void>('requestTransientFocus');
    } catch (_) {}
  }

  /// Release audio focus after the adhan ends.
  static Future<void> releaseFocus() async {
    try {
      await _channel.invokeMethod<void>('releaseFocus');
    } catch (_) {}
  }

  /// Duck other apps' audio (reduce to ~20%) during the adhan.
  static Future<void> duckAudio() async {
    try {
      await _channel.invokeMethod<void>('duckAudio');
    } catch (_) {}
  }
}
