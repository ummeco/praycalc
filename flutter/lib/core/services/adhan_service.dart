import 'dart:async';
import 'package:audio_session/audio_session.dart';
import 'package:just_audio/just_audio.dart';

import '../../shared/models/notification_model.dart';

/// Maps each AdhanType to its bundled asset path.
const _adhanAssets = <AdhanType, String>{
  AdhanType.makkah: 'assets/audio/adhan_makkah.mp3',
  AdhanType.madinah: 'assets/audio/adhan_madina.mp3',
  AdhanType.mishari: 'assets/audio/adhan_mishari.mp3',
  AdhanType.fajrMishari: 'assets/audio/adhan_fajr_mishari.mp3',
  AdhanType.abdulBasit: 'assets/audio/adhan_abdul_baset.mp3',
  AdhanType.nasserAlQatami: 'assets/audio/adhan_nasser_al_qatami.mp3',
  AdhanType.egypt: 'assets/audio/adhan_egypt.mp3',
  AdhanType.pashaii: 'assets/audio/adhan_pashaii.mp3',
  AdhanType.beep: 'assets/audio/beep2.mp3',
  // AdhanType.silent has no asset — handled explicitly.
};

/// Service for playing/previewing adhan audio.
/// Handles audio session focus (PAUSE/DUCK other apps).
class AdhanService {
  AdhanService._();
  static final instance = AdhanService._();

  final _player = AudioPlayer();
  bool _sessionConfigured = false;

  /// Ensures current AudioSession is configured for playback and active.
  Future<void> _ensureSession() async {
    if (_sessionConfigured) return;
    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration.music());
    _sessionConfigured = true;
  }

  /// Plays the adhan for [type].
  /// [customPath] is used if [type] is a custom recording.
  Future<void> play(AdhanType type, {double volume = 0.8, String? customPath}) async {
    final asset = _adhanAssets[type];
    if (asset == null && type != AdhanType.silent && customPath == null) return;
    if (type == AdhanType.silent) return;

    try {
      await _ensureSession();
      final session = await AudioSession.instance;
      if (!await session.setActive(true)) return; // couldn't gain focus

      await _player.stop();
      await _player.setVolume(volume);
      if (customPath != null && asset == null) {
        await _player.setFilePath(customPath);
      } else {
        await _player.setAsset(asset!);
      }
      await _player.play();
    } catch (_) { /* No-op */ }
  }

  /// Gradually narrows volume to zero before stopping.
  Future<void> fadeOut() async {
    try {
      final startVolume = _player.volume;
      if (startVolume <= 0.0) {
        await stop();
        return;
      }
      const steps = 15;
      for (var i = 1; i <= steps; i++) {
        await Future<void>.delayed(const Duration(milliseconds: 200));
        final v = startVolume * (1.0 - i / steps);
        if (v >= 0.0) await _player.setVolume(v.clamp(0.0, 1.0));
      }
      await stop();
      await _player.setVolume(startVolume);
    } catch (_) {}
  }

  Future<void> stop() async {
    try {
      await _player.stop();
      final session = await AudioSession.instance;
      await session.setActive(false);
    } catch (_) {}
  }

  void dispose() {
    _player.dispose();
  }

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
}
