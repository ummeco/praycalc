import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'settings_provider.dart';

/// Persists which fard prayers the user has marked complete each day.
/// Keys: "2026-03-03_Fajr" → "2026-03-03T05:14:00.000"
class PrayerCompletionNotifier extends Notifier<Map<String, String>> {
  static const _kKey = 'pc_prayer_completions';

  @override
  Map<String, String> build() {
    Future.microtask(_load);
    return <String, String>{};
  }

  Future<void> _load() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    final raw = prefs.getString(_kKey);
    if (raw == null) return;
    try {
      state = Map<String, String>.from(jsonDecode(raw) as Map);
    } catch (_) {}
  }

  Future<void> _save() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    await prefs.setString(_kKey, jsonEncode(state));
  }

  String _key(String dateStr, String prayerName) => '${dateStr}_$prayerName';

  Future<void> markCompleted(String dateStr, String prayerName) async {
    final k = _key(dateStr, prayerName);
    state = {...state, k: DateTime.now().toIso8601String()};
    await _save();
  }

  Future<void> unmark(String dateStr, String prayerName) async {
    final k = _key(dateStr, prayerName);
    final next = Map<String, String>.from(state)..remove(k);
    state = next;
    await _save();
  }

  bool isCompleted(String dateStr, String prayerName) =>
      state.containsKey(_key(dateStr, prayerName));

  /// Count of completions per prayer name over the last 7 days.
  Map<String, int> weeklyStats() {
    final result = <String, int>{};
    final cutoff = DateTime.now().subtract(const Duration(days: 7));
    for (final entry in state.entries) {
      try {
        final completedAt = DateTime.parse(entry.value);
        if (completedAt.isAfter(cutoff)) {
          final parts = entry.key.split('_');
          if (parts.length == 2) {
            final prayer = parts[1];
            result[prayer] = (result[prayer] ?? 0) + 1;
          }
        }
      } catch (_) {}
    }
    return result;
  }

  /// Completion % over last 7 days (fard only: 5 prayers × 7 days = 35 max).
  double weeklyCompletionPct() {
    const fard = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    final stats = weeklyStats();
    final total = fard.fold(0, (sum, p) => sum + (stats[p] ?? 0));
    return total / 35.0;
  }
}

final prayerCompletionProvider =
    NotifierProvider<PrayerCompletionNotifier, Map<String, String>>(
  PrayerCompletionNotifier.new,
);
