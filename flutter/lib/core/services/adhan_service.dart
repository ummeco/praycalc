import 'dart:async';

import 'package:just_audio/just_audio.dart';

import '../../shared/models/notification_model.dart';

/// Maps AdhanType to its bundled asset path.
const _adhanAssets = {
  AdhanType.makkah:          'assets/audio/adhan_makkah.mp3',
  AdhanType.madinah:         'assets/audio/adhan_madina.mp3',
  AdhanType.mishari:         'assets/audio/adhan_mishari.mp3',
  AdhanType.fajrMishari:     'assets/audio/adhan_fajr_mishari.mp3',
  AdhanType.abdulBasit:      'assets/audio/adhan_abdul_baset.mp3',
  AdhanType.nasserAlQatami:  'assets/audio/adhan_nasser_al_qatami.mp3',
  AdhanType.egypt:           'assets/audio/adhan_egypt.mp3',
  AdhanType.pashaii:         'assets/audio/adhan_pashaii.mp3',
  AdhanType.beep:            'assets/audio/beep2.mp3',
  AdhanType.silent:          null,
};

/// Service for previewing adhan audio in the settings screen.
class AdhanService {
  AdhanService._();

  static final instance = AdhanService._();

  final _player = AudioPlayer();

  /// Human-readable display name for an [AdhanType].
  static String displayName(AdhanType t) {
    switch (t) {
      case AdhanType.makkah:          return 'Makkah';
      case AdhanType.madinah:         return 'Madinah';
      case AdhanType.mishari:         return 'Mishari Al Afasy';
      case AdhanType.fajrMishari:     return 'Fajr (Mishari)';
      case AdhanType.abdulBasit:      return 'Abdul Basit';
      case AdhanType.nasserAlQatami:  return 'Nasser Al Qatami';
      case AdhanType.egypt:           return 'Egypt';
      case AdhanType.pashaii:         return 'Majid Pashaii';
      case AdhanType.beep:            return 'Beep';
      case AdhanType.silent:          return 'Silent';
    }
  }

  /// Play the adhan for [type] at the given [volume] (0.0–1.0).
  /// No-op for [AdhanType.silent].
  Future<void> play(AdhanType type, {double volume = 0.8}) async {
    final asset = _adhanAssets[type];
    if (asset == null) return;
    try {
      await _player.stop();
      await _player.setVolume(volume);
      await _player.setAsset(asset);
      await _player.play();
    } catch (_) {
      // Ignore audio errors in settings preview.
    }
  }

  /// Taper volume to 0 over 3 seconds (10 steps × 300 ms), then stop.
  Future<void> fadeOut() async {
    try {
      final startVolume = _player.volume;
      if (startVolume <= 0.0) {
        await _player.stop();
        return;
      }
      const steps = 10;
      const stepDuration = Duration(milliseconds: 300);
      for (var i = 1; i <= steps; i++) {
        await Future<void>.delayed(stepDuration);
        final v = startVolume * (1.0 - i / steps);
        await _player.setVolume(v < 0.0 ? 0.0 : v);
      }
      await _player.stop();
      await _player.setVolume(startVolume); // restore for next play
    } catch (_) {}
  }

  Future<void> stop() async {
    await _player.stop();
  }

  void dispose() {
    _player.dispose();
  }
}
