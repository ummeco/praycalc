import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/models/tasbeeh_model.dart';
import 'settings_provider.dart';

const _kPrefsKey = 'tasbeeh_state';

/// Tasbeeh counter notifier — backed by SharedPreferences.
class TasbeehNotifier extends Notifier<TasbeehState> {
  @override
  TasbeehState build() {
    Future.microtask(_load);
    return TasbeehState.initial();
  }

  Future<void> _load() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    final raw = prefs.getString(_kPrefsKey);
    if (raw != null) {
      state = TasbeehState.fromPrefsString(raw);
    }
  }

  Future<void> _save() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    await prefs.setString(_kPrefsKey, state.toPrefsString());
  }

  /// Increment the counter. Auto-advances to the next preset when target is hit.
  Future<void> tap() async {
    final newCount = state.count + 1;
    final newDaily = state.dailyTotal + 1;
    if (newCount >= state.target) {
      // Preset complete — advance to next.
      final nextIndex = (state.presetIndex + 1) % state.presets.length;
      state = state.copyWith(
        count: 0,
        presetIndex: nextIndex,
        dailyTotal: newDaily,
      );
    } else {
      state = state.copyWith(count: newCount, dailyTotal: newDaily);
    }
    await _save();
  }

  /// Advance to the next preset and reset the count.
  Future<void> nextPreset() async {
    final nextIndex = (state.presetIndex + 1) % state.presets.length;
    state = state.copyWith(count: 0, presetIndex: nextIndex);
    await _save();
  }

  /// Reset the current count to zero without changing the preset.
  Future<void> reset() async {
    state = state.copyWith(count: 0);
    await _save();
  }
}

final tasbeehProvider = NotifierProvider<TasbeehNotifier, TasbeehState>(
  TasbeehNotifier.new,
);
