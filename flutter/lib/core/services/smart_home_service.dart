// praycalc/flutter/lib/core/services/smart_home_service.dart
// SmartHomeService — smart home routine CRUD + nSelf cron scheduling (v1.1 new)
//
// Gated behind FF_SMART_HOME feature flag (default: false = Ummat+ only per D-S19-03).
// Spec §10.1, §3.2

import 'package:flutter/foundation.dart' show debugPrint;

import 'graphql_service.dart';

const _kUpsertRoutine = '''
mutation UpsertSmartHomeRoutine(\$input: RoutineInput!) {
  upsertSmartHomeRoutine(input: \$input) { id }
}
''';

const _kDeleteRoutine = '''
mutation DeleteRoutine(\$id: uuid!) {
  delete_pc_smart_home_routines_by_pk(id: \$id) { id }
}
''';

const _kGetRoutines = '''
query GetRoutines {
  pc_smart_home_routines(order_by: { trigger_prayer: asc }) {
    id name trigger_prayer trigger_offset_minutes trigger_days
    platform device_ids action duration_minutes after_action enabled
  }
}
''';

const _kGetAssistantLinks = '''
query GetAssistantLinks {
  pc_assistant_links { id platform external_account_id home_lat home_lng home_label linked_at }
}
''';

const _kUpsertAssistantLink = '''
mutation UpsertAssistantLink(\$platform: String!, \$externalAccountId: String!, \$homeLat: float8, \$homeLng: float8, \$homeLabel: String) {
  insert_pc_assistant_links_one(
    object: { platform: \$platform, external_account_id: \$externalAccountId, home_lat: \$homeLat, home_lng: \$homeLng, home_label: \$homeLabel }
    on_conflict: { constraint: pc_assistant_links_user_platform_unique, update_columns: [external_account_id, home_lat, home_lng, home_label] }
  ) { id }
}
''';

class SmartHomeRoutine {
  final String? id;
  final String name;
  final String triggerPrayer;
  final int triggerOffsetMinutes;
  final List<int> triggerDays;
  final String platform;
  final List<String>? deviceIds;
  final Map<String, dynamic> action;
  final int? durationMinutes;
  final String afterAction;
  final bool enabled;

  const SmartHomeRoutine({
    this.id,
    required this.name,
    required this.triggerPrayer,
    this.triggerOffsetMinutes = 0,
    this.triggerDays = const [0, 1, 2, 3, 4, 5, 6],
    required this.platform,
    this.deviceIds,
    required this.action,
    this.durationMinutes,
    this.afterAction = 'revert',
    this.enabled = true,
  });

  factory SmartHomeRoutine.fromJson(Map<String, dynamic> j) => SmartHomeRoutine(
        id: j['id'] as String?,
        name: j['name'] as String,
        triggerPrayer: j['trigger_prayer'] as String,
        triggerOffsetMinutes: (j['trigger_offset_minutes'] as int?) ?? 0,
        triggerDays: List<int>.from((j['trigger_days'] as List?) ?? [0, 1, 2, 3, 4, 5, 6]),
        platform: j['platform'] as String,
        deviceIds: (j['device_ids'] as List?)?.cast<String>(),
        action: (j['action'] as Map<String, dynamic>?) ?? {},
        durationMinutes: j['duration_minutes'] as int?,
        afterAction: (j['after_action'] as String?) ?? 'revert',
        enabled: (j['enabled'] as bool?) ?? true,
      );

  Map<String, dynamic> toInput() => {
        if (id != null) 'id': id,
        'name': name,
        'triggerPrayer': triggerPrayer,
        'triggerOffsetMinutes': triggerOffsetMinutes,
        'triggerDays': triggerDays,
        'platform': platform,
        if (deviceIds != null) 'deviceIds': deviceIds,
        'action': action,
        if (durationMinutes != null) 'durationMinutes': durationMinutes,
        'afterAction': afterAction,
        'enabled': enabled,
      };
}

/// SmartHomeService — routine CRUD + assistant account linking.
/// Always check [isEnabled] before any operation (FF_SMART_HOME gate).
class SmartHomeService {
  final GraphQLService _gql;
  final bool Function() _isEnabled;

  SmartHomeService(this._gql, {required bool Function() featureEnabled})
      : _isEnabled = featureEnabled;

  bool get isEnabled => _isEnabled();

  // ── Routine CRUD ────────────────────────────────────────────────────────────

  Future<List<SmartHomeRoutine>> getRoutines() async {
    _assertEnabled();
    try {
      final result = await _gql.query(_kGetRoutines);
      final rows = (result['pc_smart_home_routines'] as List?)?.cast<Map<String, dynamic>>();
      return rows?.map(SmartHomeRoutine.fromJson).toList() ?? [];
    } catch (e) {
      debugPrint('[SmartHomeService] getRoutines error: $e');
      return [];
    }
  }

  Future<void> upsertRoutine(SmartHomeRoutine routine) async {
    _assertEnabled();
    await _gql.mutate(_kUpsertRoutine, variables: {'input': routine.toInput()});
  }

  Future<void> deleteRoutine(String routineId) async {
    _assertEnabled();
    await _gql.mutate(_kDeleteRoutine, variables: {'id': routineId});
  }

  // ── Assistant account links ──────────────────────────────────────────────────

  Future<List<Map<String, dynamic>>> getAssistantLinks() async {
    _assertEnabled();
    final result = await _gql.query(_kGetAssistantLinks);
    return (result['pc_assistant_links'] as List?)?.cast<Map<String, dynamic>>() ?? [];
  }

  /// Link an Alexa or Google account after OAuth completion.
  Future<void> linkAssistant({
    required String platform, // 'alexa' | 'google'
    required String externalAccountId,
    double? homeLat,
    double? homeLng,
    String? homeLabel,
  }) async {
    _assertEnabled();
    await _gql.mutate(_kUpsertAssistantLink, variables: {
      'platform': platform,
      'externalAccountId': externalAccountId,
      if (homeLat != null) 'homeLat': homeLat,
      if (homeLng != null) 'homeLng': homeLng,
      if (homeLabel != null) 'homeLabel': homeLabel,
    });
  }

  void _assertEnabled() {
    if (!isEnabled) {
      throw StateError('SmartHomeService: FF_SMART_HOME is false. Ummat+ required.');
    }
  }
}
