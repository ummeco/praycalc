import 'tv_audio_router.dart';

/// Coordinates audio focus and crossfade around adhan playback.
///
/// Call [onAdhanStart] before playing the adhan and [onAdhanEnd] when it
/// completes. The coordinator handles both stream and Quran audio modes.
class TvAdhanAudioCoordinator {
  /// Called when an adhan is about to start.
  ///
  /// [audioMode] is the current TV audio mode: 'stream', 'quran', or 'silent'.
  /// Fades out active audio over 2 s then takes transient focus.
  static Future<void> onAdhanStart({required String audioMode}) async {
    await TvAudioRouter.fadeOutForAdhan();
    if (audioMode == 'stream' || audioMode == 'quran') {
      await TvAudioRouter.requestTransientFocus();
    }
  }

  /// Called when the adhan has finished playing.
  ///
  /// Releases audio focus and fades stream/Quran audio back in over 2 s.
  static Future<void> onAdhanEnd() async {
    await TvAudioRouter.releaseFocus();
    await TvAudioRouter.fadeInAfterAdhan();
  }
}
