import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:shared_preferences/shared_preferences.dart';

import '../../features/auth/sync_conflict_dialog.dart';
import 'auth_service.dart';
import 'graphql_service.dart';

/// Sync status for each data domain.
enum SyncStatus { synced, syncing, offline, error }

/// Sync state: combines status and last sync timestamp.
class SyncState {
  final SyncStatus status;
  final DateTime? lastSyncedAt;
  final String? errorMessage;

  const SyncState({
    this.status = SyncStatus.offline,
    this.lastSyncedAt,
    this.errorMessage,
  });

  SyncState copyWith({
    SyncStatus? status,
    DateTime? lastSyncedAt,
    String? errorMessage,
  }) =>
      SyncState(
        status: status ?? this.status,
        lastSyncedAt: lastSyncedAt ?? this.lastSyncedAt,
        errorMessage: errorMessage,
      );
}

/// Offline-first sync engine for PrayCalc.
///
/// Reads from SharedPreferences (local-first) and syncs to Hasura GraphQL
/// when authenticated and online. Uses last-write-wins conflict resolution
/// based on `updated_at` timestamps.
///
/// Syncs three data domains:
/// - Settings (pc_user_settings)
/// - Saved cities (pc_saved_cities)
/// - Prayer completions (pc_prayer_logs)
class SyncService {
  SyncService._();
  static final instance = SyncService._();

  final _stateController = StreamController<SyncState>.broadcast();
  Stream<SyncState> get stateChanges => _stateController.stream;
  SyncState _state = const SyncState();
  SyncState get currentState => _state;

  static const _pendingQueueKey = 'pc_sync_pending_queue';
  static const _lastSyncKey = 'pc_last_sync_at';
  static const _conflictLogKey = 'pc_sync_conflict_log';

  int _retryCount = 0;
  static const _maxRetries = 5;

  /// Recent conflict resolutions (kept in memory, persisted to SharedPrefs).
  final List<SyncConflictEntry> _conflictLog = [];
  List<SyncConflictEntry> get conflictLog => List.unmodifiable(_conflictLog);

  /// Load conflict log from SharedPreferences.
  Future<void> loadConflictLog() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_conflictLogKey);
    _conflictLog.clear();
    if (raw != null) {
      final list = (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
      _conflictLog.addAll(list.map(SyncConflictEntry.fromJson));
    }
  }

  /// Clear conflict history.
  Future<void> clearConflictLog() async {
    _conflictLog.clear();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_conflictLogKey);
  }

  Future<void> _logConflict(String domain, String winner, String summary) async {
    final entry = SyncConflictEntry(
      domain: domain,
      resolvedAt: DateTime.now(),
      winner: winner,
      summary: summary,
    );
    _conflictLog.insert(0, entry);
    // Keep only last 20 entries.
    if (_conflictLog.length > 20) {
      _conflictLog.removeRange(20, _conflictLog.length);
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _conflictLogKey,
      jsonEncode(_conflictLog.map((e) => e.toJson()).toList()),
    );
  }

  // ── GraphQL documents ──────────────────────────────────────────────────

  static const _upsertSettingsDoc = r'''
    mutation UpsertSettings($userId: uuid!, $settings: jsonb!) {
      insert_pc_user_settings_one(
        object: { user_id: $userId, settings: $settings, updated_at: "now()" }
        on_conflict: {
          constraint: pc_user_settings_pkey
          update_columns: [settings, updated_at]
        }
      ) {
        user_id
        updated_at
      }
    }
  ''';

  static const _fetchSettingsDoc = r'''
    query FetchSettings($userId: uuid!) {
      pc_user_settings_by_pk(user_id: $userId) {
        settings
        updated_at
      }
    }
  ''';

  static const _upsertSavedCitiesDoc = r'''
    mutation UpsertSavedCities($userId: uuid!, $cities: jsonb!) {
      insert_pc_saved_cities_one(
        object: { user_id: $userId, cities: $cities, updated_at: "now()" }
        on_conflict: {
          constraint: pc_saved_cities_pkey
          update_columns: [cities, updated_at]
        }
      ) {
        user_id
        updated_at
      }
    }
  ''';

  static const _fetchSavedCitiesDoc = r'''
    query FetchSavedCities($userId: uuid!) {
      pc_saved_cities_by_pk(user_id: $userId) {
        cities
        updated_at
      }
    }
  ''';

  static const _upsertPrayerLogsDoc = r'''
    mutation UpsertPrayerLogs($userId: uuid!, $logs: jsonb!) {
      insert_pc_prayer_logs_one(
        object: { user_id: $userId, logs: $logs, updated_at: "now()" }
        on_conflict: {
          constraint: pc_prayer_logs_pkey
          update_columns: [logs, updated_at]
        }
      ) {
        user_id
        updated_at
      }
    }
  ''';

  static const _fetchPrayerLogsDoc = r'''
    query FetchPrayerLogs($userId: uuid!) {
      pc_prayer_logs_by_pk(user_id: $userId) {
        logs
        updated_at
      }
    }
  ''';

  // ── SharedPreferences keys (matching existing providers) ───────────────

  // Settings keys from SettingsNotifier:
  static const _settingsKeys = [
    'hanafi', 'use24h', 'darkMode', 'followSystem', 'locale',
    'sky_gradient_enabled', 'sky_gradient_weather',
    'countdown_animation_enabled', 'prayer_tracking_enabled',
    'jumuah_kahf_reminder', 'travel_mode_enabled',
    'home_lat', 'home_lng',
  ];

  // Pinned cities key from PinnedCitiesNotifier:
  static const _pinnedCitiesKey = 'pc_pinned_cities';

  // Prayer completions key from PrayerCompletionNotifier:
  static const _prayerCompletionsKey = 'pc_prayer_completions';

  // ── Public API ─────────────────────────────────────────────────────────

  /// Run a full sync cycle: push local changes, then pull remote changes.
  Future<void> syncAll() async {
    if (!AuthService.instance.isAuthenticated) {
      _updateState(const SyncState(status: SyncStatus.offline));
      return;
    }

    _updateState(_state.copyWith(status: SyncStatus.syncing));

    try {
      final userId = AuthService.instance.currentUser!.id;

      // Process any queued offline mutations first.
      await _processQueue();

      // Sync each domain.
      await _syncSettings(userId);
      await _syncSavedCities(userId);
      await _syncPrayerLogs(userId);

      _retryCount = 0;
      final now = DateTime.now();
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_lastSyncKey, now.toIso8601String());
      _updateState(SyncState(status: SyncStatus.synced, lastSyncedAt: now));
    } catch (e) {
      _retryCount++;
      _updateState(_state.copyWith(
        status: SyncStatus.error,
        errorMessage: e.toString(),
      ));
    }
  }

  /// Queue a mutation for later execution when offline.
  Future<void> queueMutation(String domain, Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_pendingQueueKey);
    final queue = raw != null
        ? (jsonDecode(raw) as List).cast<Map<String, dynamic>>()
        : <Map<String, dynamic>>[];

    queue.add({
      'domain': domain,
      'data': data,
      'queued_at': DateTime.now().toIso8601String(),
    });

    await prefs.setString(_pendingQueueKey, jsonEncode(queue));
  }

  /// Clear all remote data for the current user (used on account deletion).
  Future<void> clearRemoteData() async {
    // The account deletion endpoint in auth_service handles server-side cleanup.
    // Here we just clear local sync state.
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_pendingQueueKey);
    await prefs.remove(_lastSyncKey);
    _updateState(const SyncState());
  }

  /// Get the delay for exponential backoff retries.
  Duration get retryDelay {
    if (_retryCount == 0) return Duration.zero;
    final seconds = min(pow(2, _retryCount).toInt(), 300); // Cap at 5 minutes.
    return Duration(seconds: seconds);
  }

  /// Whether a retry is appropriate.
  bool get shouldRetry => _retryCount < _maxRetries;

  // ── Sync per domain ────────────────────────────────────────────────────

  Future<void> _syncSettings(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final gql = GraphQLService.instance;

    // Read local settings.
    final localSettings = <String, dynamic>{};
    for (final key in _settingsKeys) {
      final val = prefs.get(key);
      if (val != null) localSettings[key] = val;
    }

    // Fetch remote settings.
    final result = await gql.query(
      _fetchSettingsDoc,
      variables: {'userId': userId},
    );
    final remote = result.data?['pc_user_settings_by_pk'];

    if (remote != null) {
      final remoteSettings = remote['settings'] as Map<String, dynamic>? ?? {};
      final remoteUpdatedAt = DateTime.parse(remote['updated_at'] as String);
      final localUpdatedStr = prefs.getString('pc_settings_updated_at');
      final localUpdatedAt = localUpdatedStr != null
          ? DateTime.tryParse(localUpdatedStr)
          : null;

      if (localUpdatedAt == null || remoteUpdatedAt.isAfter(localUpdatedAt)) {
        // Remote is newer: apply remote to local.
        if (localUpdatedAt != null) {
          await _logConflict('settings', 'remote',
              'Remote settings applied (updated ${_shortTime(remoteUpdatedAt)})');
        }
        for (final entry in remoteSettings.entries) {
          final v = entry.value;
          if (v is bool) {
            await prefs.setBool(entry.key, v);
          } else if (v is double) {
            await prefs.setDouble(entry.key, v);
          } else if (v is int) {
            await prefs.setDouble(entry.key, v.toDouble());
          } else if (v is String) {
            await prefs.setString(entry.key, v);
          }
        }
        await prefs.setString(
          'pc_settings_updated_at',
          remoteUpdatedAt.toIso8601String(),
        );
      } else {
        // Local is newer: push local to remote.
        if (remoteSettings.isNotEmpty) {
          await _logConflict('settings', 'local',
              'Local settings pushed to server');
        }
        await gql.mutate(
          _upsertSettingsDoc,
          variables: {'userId': userId, 'settings': localSettings},
        );
        await prefs.setString(
          'pc_settings_updated_at',
          DateTime.now().toIso8601String(),
        );
      }
    } else {
      // No remote settings yet: push local.
      if (localSettings.isNotEmpty) {
        await gql.mutate(
          _upsertSettingsDoc,
          variables: {'userId': userId, 'settings': localSettings},
        );
        await prefs.setString(
          'pc_settings_updated_at',
          DateTime.now().toIso8601String(),
        );
      }
    }
  }

  Future<void> _syncSavedCities(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final gql = GraphQLService.instance;

    final localRaw = prefs.getString(_pinnedCitiesKey);
    final localCities = localRaw != null ? jsonDecode(localRaw) : [];

    final result = await gql.query(
      _fetchSavedCitiesDoc,
      variables: {'userId': userId},
    );
    final remote = result.data?['pc_saved_cities_by_pk'];

    if (remote != null) {
      final remoteCities = remote['cities'];
      final remoteUpdatedAt = DateTime.parse(remote['updated_at'] as String);
      final localUpdatedStr = prefs.getString('pc_cities_updated_at');
      final localUpdatedAt = localUpdatedStr != null
          ? DateTime.tryParse(localUpdatedStr)
          : null;

      if (localUpdatedAt == null || remoteUpdatedAt.isAfter(localUpdatedAt)) {
        // Remote is newer.
        if (localUpdatedAt != null) {
          await _logConflict('cities', 'remote',
              'Remote saved cities applied (updated ${_shortTime(remoteUpdatedAt)})');
        }
        if (remoteCities != null) {
          await prefs.setString(_pinnedCitiesKey, jsonEncode(remoteCities));
        }
        await prefs.setString(
          'pc_cities_updated_at',
          remoteUpdatedAt.toIso8601String(),
        );
      } else {
        // Local is newer.
        if (remoteCities != null) {
          await _logConflict('cities', 'local',
              'Local saved cities pushed to server');
        }
        await gql.mutate(
          _upsertSavedCitiesDoc,
          variables: {'userId': userId, 'cities': localCities},
        );
        await prefs.setString(
          'pc_cities_updated_at',
          DateTime.now().toIso8601String(),
        );
      }
    } else if (localCities is List && localCities.isNotEmpty) {
      await gql.mutate(
        _upsertSavedCitiesDoc,
        variables: {'userId': userId, 'cities': localCities},
      );
      await prefs.setString(
        'pc_cities_updated_at',
        DateTime.now().toIso8601String(),
      );
    }
  }

  Future<void> _syncPrayerLogs(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    final gql = GraphQLService.instance;

    final localRaw = prefs.getString(_prayerCompletionsKey);
    final localLogs = localRaw != null ? jsonDecode(localRaw) : {};

    final result = await gql.query(
      _fetchPrayerLogsDoc,
      variables: {'userId': userId},
    );
    final remote = result.data?['pc_prayer_logs_by_pk'];

    if (remote != null) {
      final remoteLogs = remote['logs'] as Map<String, dynamic>? ?? {};
      final remoteUpdatedAt = DateTime.parse(remote['updated_at'] as String);
      final localUpdatedStr = prefs.getString('pc_logs_updated_at');
      final localUpdatedAt = localUpdatedStr != null
          ? DateTime.tryParse(localUpdatedStr)
          : null;

      if (localUpdatedAt == null || remoteUpdatedAt.isAfter(localUpdatedAt)) {
        // Remote is newer: merge (remote wins on conflict per key).
        if (localUpdatedAt != null) {
          await _logConflict('prayer_logs', 'remote',
              'Remote prayer logs merged (updated ${_shortTime(remoteUpdatedAt)})');
        }
        final merged = <String, dynamic>{};
        if (localLogs is Map) {
          merged.addAll(Map<String, dynamic>.from(localLogs));
        }
        merged.addAll(remoteLogs); // remote overwrites conflicts
        await prefs.setString(_prayerCompletionsKey, jsonEncode(merged));
        await prefs.setString(
          'pc_logs_updated_at',
          remoteUpdatedAt.toIso8601String(),
        );
      } else {
        // Local is newer.
        if (remoteLogs.isNotEmpty) {
          await _logConflict('prayer_logs', 'local',
              'Local prayer logs pushed to server');
        }
        await gql.mutate(
          _upsertPrayerLogsDoc,
          variables: {'userId': userId, 'logs': localLogs},
        );
        await prefs.setString(
          'pc_logs_updated_at',
          DateTime.now().toIso8601String(),
        );
      }
    } else if (localLogs is Map && localLogs.isNotEmpty) {
      await gql.mutate(
        _upsertPrayerLogsDoc,
        variables: {'userId': userId, 'logs': localLogs},
      );
      await prefs.setString(
        'pc_logs_updated_at',
        DateTime.now().toIso8601String(),
      );
    }
  }

  // ── Offline queue processing ───────────────────────────────────────────

  Future<void> _processQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_pendingQueueKey);
    if (raw == null) return;

    final queue = (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
    if (queue.isEmpty) return;

    // Process each queued mutation. On failure, leave remaining in queue.
    final remaining = <Map<String, dynamic>>[];
    for (final item in queue) {
      try {
        final domain = item['domain'] as String;
        final data = item['data'] as Map<String, dynamic>;
        final userId = AuthService.instance.currentUser!.id;

        switch (domain) {
          case 'settings':
            await GraphQLService.instance.mutate(
              _upsertSettingsDoc,
              variables: {'userId': userId, 'settings': data},
            );
          case 'cities':
            await GraphQLService.instance.mutate(
              _upsertSavedCitiesDoc,
              variables: {'userId': userId, 'cities': data['cities']},
            );
          case 'prayer_logs':
            await GraphQLService.instance.mutate(
              _upsertPrayerLogsDoc,
              variables: {'userId': userId, 'logs': data},
            );
        }
      } catch (_) {
        remaining.add(item);
      }
    }

    if (remaining.isEmpty) {
      await prefs.remove(_pendingQueueKey);
    } else {
      await prefs.setString(_pendingQueueKey, jsonEncode(remaining));
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  String _shortTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  void _updateState(SyncState newState) {
    _state = newState;
    _stateController.add(newState);
  }

  void dispose() {
    _stateController.close();
  }
}
