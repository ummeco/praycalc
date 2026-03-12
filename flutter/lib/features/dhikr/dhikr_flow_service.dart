// DhikrFlowService — tracks dhikr session history in SharedPreferences.

import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class DhikrFlowService {
  DhikrFlowService._();
  static final instance = DhikrFlowService._();

  static const _key = 'dhikr_sessions';

  /// Record that the user completed post-prayer dhikr after [prayer].
  Future<void> recordDhikrSession(String prayer) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key) ?? '[]';
    final List<dynamic> sessions;
    try {
      sessions = jsonDecode(raw) as List<dynamic>;
    } catch (_) {
      await prefs.setString(_key, jsonEncode([
        {'prayer': prayer, 'timestamp': DateTime.now().toIso8601String()},
      ]));
      return;
    }
    sessions.add({
      'prayer': prayer,
      'timestamp': DateTime.now().toIso8601String(),
    });
    await prefs.setString(_key, jsonEncode(sessions));
  }

  /// Returns the number of consecutive days on which at least one dhikr
  /// session was completed, counting back from today.
  Future<int> getDhikrStreak() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key) ?? '[]';
    final List<dynamic> sessions;
    try {
      sessions = jsonDecode(raw) as List<dynamic>;
    } catch (_) {
      return 0;
    }

    // Collect unique dates (YYYY-MM-DD) from session timestamps.
    final dates = <String>{};
    for (final s in sessions) {
      final ts = (s as Map<String, dynamic>)['timestamp'] as String?;
      if (ts == null) continue;
      try {
        final dt = DateTime.parse(ts);
        dates.add('${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}');
      } catch (_) {}
    }

    // Walk backward from today counting consecutive days present in the set.
    int streak = 0;
    var check = DateTime.now();
    while (true) {
      final key =
          '${check.year}-${check.month.toString().padLeft(2, '0')}-${check.day.toString().padLeft(2, '0')}';
      if (!dates.contains(key)) break;
      streak++;
      check = check.subtract(const Duration(days: 1));
    }
    return streak;
  }
}
