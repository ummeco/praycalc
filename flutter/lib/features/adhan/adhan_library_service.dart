// AdhanLibraryService — manages adhan voice selection, preview, and playback.
//
// - Selected voice stored in SharedPreferences key 'selected_adhan_voice_id' (default: 'makkah').
// - Custom voice path stored in SharedPreferences key 'custom_adhan_path'.
// - ChangeNotifier — notifies listeners on selection change.

import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'adhan_voices.dart';

class AdhanLibraryService extends ChangeNotifier {
  AdhanLibraryService._();
  static final instance = AdhanLibraryService._();

  final _player = AudioPlayer();

  AdhanVoice _selected = kBuiltInAdhanVoices.first;
  AdhanVoice get selected => _selected;

  bool _previewing = false;
  bool get isPreviewing => _previewing;

  // ── Init ──────────────────────────────────────────────────────────────────

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final id = prefs.getString('selected_adhan_voice_id') ?? 'makkah';
    _selected = _voiceById(id);
    notifyListeners();
  }

  AdhanVoice _voiceById(String id) {
    if (id == 'custom') return kCustomAdhanVoice;
    return kBuiltInAdhanVoices.firstWhere(
      (v) => v.id == id,
      orElse: () => kBuiltInAdhanVoices.first,
    );
  }

  // ── Preview ───────────────────────────────────────────────────────────────

  /// Play a short preview of [voice] using the everyayah.com CDN URL.
  Future<void> previewVoice(AdhanVoice voice) async {
    if (voice.isCustom) {
      await playAdhan();
      return;
    }
    await _player.stop();
    try {
      _previewing = true;
      notifyListeners();
      await _player.setUrl(voice.previewUrl);
      await _player.play();
      _player.playerStateStream.firstWhere(
        (s) => s.processingState == ProcessingState.completed,
      ).then((_) {
        _previewing = false;
        notifyListeners();
      });
    } catch (_) {
      _previewing = false;
      notifyListeners();
    }
  }

  /// Stop any currently playing preview.
  Future<void> stopPreview() async {
    await _player.stop();
    _previewing = false;
    notifyListeners();
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  /// Persist [voice] as the selected adhan voice.
  Future<void> selectVoice(AdhanVoice voice) async {
    _selected = voice;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('selected_adhan_voice_id', voice.id);
    notifyListeners();
  }

  /// Return the currently selected voice (loads from prefs if needed).
  Future<AdhanVoice> getSelectedVoice() async {
    final prefs = await SharedPreferences.getInstance();
    final id = prefs.getString('selected_adhan_voice_id') ?? 'makkah';
    _selected = _voiceById(id);
    return _selected;
  }

  // ── Playback ──────────────────────────────────────────────────────────────

  /// Play the selected adhan voice. Uses the custom file path if isCustom,
  /// otherwise plays the preview URL (which is the full ayah audio from CDN).
  Future<void> playAdhan() async {
    await _player.stop();
    try {
      if (_selected.isCustom) {
        final prefs = await SharedPreferences.getInstance();
        final path = prefs.getString('custom_adhan_path');
        if (path == null || path.isEmpty) return;
        await _player.setFilePath(path);
      } else {
        await _player.setUrl(_selected.previewUrl);
      }
      await _player.play();
    } catch (_) {
      // Playback failure is non-fatal — silently swallow.
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }
}
