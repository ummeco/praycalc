import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../shared/models/agenda_model.dart';

/// Simple ID generator — no uuid package required.
String _generateId() =>
    '${DateTime.now().millisecondsSinceEpoch}_${Object().hashCode}';

class AgendaNotifier extends Notifier<List<Agenda>> {
  static const _kKey = 'pc_agendas';

  @override
  List<Agenda> build() {
    Future.microtask(_load);
    return [];
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kKey);
    if (raw == null) return;
    final list = (jsonDecode(raw) as List)
        .map((e) => Agenda.fromJson(e as Map<String, dynamic>))
        .toList();
    state = list;
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _kKey,
      jsonEncode(state.map((a) => a.toJson()).toList()),
    );
  }

  Future<void> add({
    required String label,
    required PrayerName prayer,
    required int offsetMinutes,
    List<int> days = const [0, 1, 2, 3, 4, 5, 6],
    AgendaNotificationType notificationType = AgendaNotificationType.sound,
  }) async {
    final agenda = Agenda(
      id: _generateId(),
      label: label,
      prayer: prayer,
      offsetMinutes: offsetMinutes,
      days: days,
      notificationType: notificationType,
    );
    state = [...state, agenda];
    await _save();
  }

  Future<void> update(Agenda updated) async {
    state = [
      for (final a in state) a.id == updated.id ? updated : a,
    ];
    await _save();
  }

  Future<void> remove(String id) async {
    state = state.where((a) => a.id != id).toList();
    await _save();
  }

  Future<void> toggleEnabled(String id) async {
    state = [
      for (final a in state)
        a.id == id ? a.copyWith(enabled: !a.enabled) : a,
    ];
    await _save();
  }
}

final agendaProvider = NotifierProvider<AgendaNotifier, List<Agenda>>(
  AgendaNotifier.new,
);
