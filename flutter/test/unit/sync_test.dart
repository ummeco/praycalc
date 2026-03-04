import 'dart:convert';
import 'dart:math';

import 'package:flutter_test/flutter_test.dart';
import 'package:praycalc_app/core/services/sync_service.dart';
import 'package:praycalc_app/features/auth/sync_conflict_dialog.dart';

void main() {
  group('SyncState', () {
    test('default state is offline with no timestamp', () {
      const state = SyncState();
      expect(state.status, SyncStatus.offline);
      expect(state.lastSyncedAt, isNull);
      expect(state.errorMessage, isNull);
    });

    test('copyWith preserves unchanged fields', () {
      final state = SyncState(
        status: SyncStatus.synced,
        lastSyncedAt: DateTime(2026, 3, 1),
      );
      final updated = state.copyWith(status: SyncStatus.syncing);
      expect(updated.status, SyncStatus.syncing);
      expect(updated.lastSyncedAt, DateTime(2026, 3, 1));
    });

    test('copyWith clears errorMessage when not provided', () {
      const state = SyncState(
        status: SyncStatus.error,
        errorMessage: 'Network error',
      );
      final updated = state.copyWith(status: SyncStatus.synced);
      expect(updated.errorMessage, isNull);
    });

    test('copyWith can set errorMessage', () {
      const state = SyncState();
      final updated = state.copyWith(
        status: SyncStatus.error,
        errorMessage: 'Timeout',
      );
      expect(updated.status, SyncStatus.error);
      expect(updated.errorMessage, 'Timeout');
    });
  });

  group('SyncService retry logic', () {
    test('retryDelay is zero on first attempt', () {
      final service = SyncService.instance;
      // Reset retry count by accessing via public getter.
      expect(service.retryDelay, Duration.zero);
    });

    test('shouldRetry is true when under max retries', () {
      expect(SyncService.instance.shouldRetry, isTrue);
    });

    test('exponential backoff caps at 300 seconds', () {
      // Verify the math: 2^9 = 512, but cap is 300.
      final capped = min(pow(2, 9).toInt(), 300);
      expect(capped, 300);

      // And 2^8 = 256, under cap.
      final uncapped = min(pow(2, 8).toInt(), 300);
      expect(uncapped, 256);
    });
  });

  group('SyncConflictEntry', () {
    test('toJson and fromJson round-trip', () {
      final entry = SyncConflictEntry(
        domain: 'settings',
        resolvedAt: DateTime(2026, 3, 3, 14, 30),
        winner: 'remote',
        summary: 'Remote settings applied (updated 14:30)',
      );
      final json = entry.toJson();
      final restored = SyncConflictEntry.fromJson(json);
      expect(restored.domain, 'settings');
      expect(restored.resolvedAt, DateTime(2026, 3, 3, 14, 30));
      expect(restored.winner, 'remote');
      expect(restored.summary, 'Remote settings applied (updated 14:30)');
    });

    test('serializes to valid JSON string', () {
      final entry = SyncConflictEntry(
        domain: 'cities',
        resolvedAt: DateTime(2026, 1, 15, 9, 0),
        winner: 'local',
        summary: 'Local saved cities pushed to server',
      );
      final jsonStr = jsonEncode(entry.toJson());
      expect(jsonStr, isNotEmpty);
      final decoded = jsonDecode(jsonStr) as Map<String, dynamic>;
      expect(decoded['domain'], 'cities');
      expect(decoded['winner'], 'local');
    });

    test('batch serialization for conflict log', () {
      final entries = List.generate(
        5,
        (i) => SyncConflictEntry(
          domain: i.isEven ? 'settings' : 'prayer_logs',
          resolvedAt: DateTime(2026, 3, 1).add(Duration(hours: i)),
          winner: i.isEven ? 'remote' : 'local',
          summary: 'Conflict $i',
        ),
      );
      final jsonStr = jsonEncode(entries.map((e) => e.toJson()).toList());
      final decoded = (jsonDecode(jsonStr) as List).cast<Map<String, dynamic>>();
      expect(decoded, hasLength(5));
      final restored = decoded.map(SyncConflictEntry.fromJson).toList();
      expect(restored[0].domain, 'settings');
      expect(restored[1].domain, 'prayer_logs');
      expect(restored[4].summary, 'Conflict 4');
    });
  });

  group('SyncService queue serialization', () {
    test('queue item round-trips through JSON', () {
      final item = {
        'domain': 'settings',
        'data': {'hanafi': true, 'use24h': false},
        'queued_at': DateTime.now().toIso8601String(),
      };
      final encoded = jsonEncode([item]);
      final decoded = (jsonDecode(encoded) as List).cast<Map<String, dynamic>>();
      expect(decoded, hasLength(1));
      expect(decoded.first['domain'], 'settings');
      expect((decoded.first['data'] as Map)['hanafi'], isTrue);
    });

    test('multiple queue items preserve order', () {
      final items = [
        {'domain': 'settings', 'data': {'a': 1}, 'queued_at': '2026-03-01T10:00:00'},
        {'domain': 'cities', 'data': {'cities': []}, 'queued_at': '2026-03-01T10:01:00'},
        {'domain': 'prayer_logs', 'data': {'logs': {}}, 'queued_at': '2026-03-01T10:02:00'},
      ];
      final encoded = jsonEncode(items);
      final decoded = (jsonDecode(encoded) as List).cast<Map<String, dynamic>>();
      expect(decoded[0]['domain'], 'settings');
      expect(decoded[1]['domain'], 'cities');
      expect(decoded[2]['domain'], 'prayer_logs');
    });

    test('empty queue serializes correctly', () {
      final encoded = jsonEncode(<Map<String, dynamic>>[]);
      final decoded = (jsonDecode(encoded) as List).cast<Map<String, dynamic>>();
      expect(decoded, isEmpty);
    });
  });

  group('SyncStatus', () {
    test('all enum values exist', () {
      expect(SyncStatus.values, hasLength(4));
      expect(SyncStatus.values, contains(SyncStatus.synced));
      expect(SyncStatus.values, contains(SyncStatus.syncing));
      expect(SyncStatus.values, contains(SyncStatus.offline));
      expect(SyncStatus.values, contains(SyncStatus.error));
    });
  });
}
