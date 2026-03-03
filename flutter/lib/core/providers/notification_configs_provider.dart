import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../shared/models/notification_model.dart';

class NotificationConfigsNotifier
    extends StateNotifier<List<PrayerNotificationConfig>> {
  static const _kKey = 'pc_notification_configs';

  NotificationConfigsNotifier() : super(defaultNotificationConfigs) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kKey);
    if (raw != null) {
      try {
        final list = (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
        state = list.map(PrayerNotificationConfig.fromJson).toList();
      } catch (_) {}
    }
    await _persistShadeAdhanTypes(prefs);
  }

  Future<void> update(int index, PrayerNotificationConfig config) async {
    final next = List<PrayerNotificationConfig>.from(state);
    next[index] = config;
    state = next;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
        _kKey, jsonEncode(state.map((c) => c.toJson()).toList()));
    await _persistShadeAdhanTypes(prefs);
  }

  /// Writes `shade_adhan_type_0..5` to SharedPreferences so the Android
  /// foreground notification service can display the correct adhan indicator
  /// without needing to call back into Flutter.
  Future<void> _persistShadeAdhanTypes(SharedPreferences prefs) async {
    for (var i = 0; i < state.length; i++) {
      await prefs.setString('shade_adhan_type_$i', state[i].adhanType.name);
    }
  }
}

final notificationConfigsProvider = StateNotifierProvider<
    NotificationConfigsNotifier, List<PrayerNotificationConfig>>(
  (ref) => NotificationConfigsNotifier(),
);
