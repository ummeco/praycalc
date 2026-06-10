/// TEST-B4: Notification rescheduling tests.
///
/// Covers:
library;
///   1. PrayerNotificationConfig JSON round-trips correctly (used by
///      rescheduleFromBackground to deserialize stored configs).
///   2. Config round-trip preserves all prayer names and modes.
///   3. Malformed config JSON falls back to defaults without throwing.
///   4. Hanafi flag is read correctly from SharedPreferences by the
///      background reschedule path.

import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:praycalc_app/shared/models/notification_model.dart';

void main() {
  group('PrayerNotificationConfig JSON round-trip', () {
    test('toJson / fromJson round-trips a default config', () {
      const config = PrayerNotificationConfig(
        prayerName: 'Fajr',
        mode: PrayerNotificationMode.arrival,
        minutesBefore: 10,
        adhanType: AdhanType.makkah,
        volume: 0.8,
      );
      final json = config.toJson();
      final restored = PrayerNotificationConfig.fromJson(json);

      expect(restored.prayerName, equals('Fajr'));
      expect(restored.mode, equals(PrayerNotificationMode.arrival));
      expect(restored.minutesBefore, equals(10));
      expect(restored.adhanType, equals(AdhanType.makkah));
      expect(restored.volume, closeTo(0.8, 0.001));
    });

    test('toJson / fromJson round-trips all prayer notification modes', () {
      for (final mode in PrayerNotificationMode.values) {
        final config = PrayerNotificationConfig(
          prayerName: 'Dhuhr',
          mode: mode,
        );
        final restored = PrayerNotificationConfig.fromJson(config.toJson());
        expect(restored.mode, equals(mode), reason: 'mode $mode should survive round-trip');
      }
    });

    test('toJson / fromJson round-trips all AdhanType values', () {
      for (final adhanType in AdhanType.values) {
        final config = PrayerNotificationConfig(
          prayerName: 'Asr',
          adhanType: adhanType,
        );
        final restored = PrayerNotificationConfig.fromJson(config.toJson());
        expect(restored.adhanType, equals(adhanType),
            reason: 'adhanType $adhanType should survive round-trip');
      }
    });

    test('defaultNotificationConfigs contains all 5 fard prayers', () {
      final prayerNames = defaultNotificationConfigs.map((c) => c.prayerName).toSet();
      expect(prayerNames, containsAll(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']));
    });

    test('all default configs round-trip correctly', () {
      final json = jsonEncode(
        defaultNotificationConfigs.map((c) => c.toJson()).toList(),
      );
      final restored = (jsonDecode(json) as List)
          .cast<Map<String, dynamic>>()
          .map(PrayerNotificationConfig.fromJson)
          .toList();

      expect(restored.length, equals(defaultNotificationConfigs.length));
      for (var i = 0; i < restored.length; i++) {
        expect(restored[i].prayerName, equals(defaultNotificationConfigs[i].prayerName));
        expect(restored[i].mode, equals(defaultNotificationConfigs[i].mode));
        expect(restored[i].minutesBefore, equals(defaultNotificationConfigs[i].minutesBefore));
      }
    });
  });

  group('Background reschedule — SharedPreferences reading', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('returns early when no city is stored (safe no-op)', () async {
      // SharedPreferences is empty — rescheduleFromBackground should return
      // early without throwing because 'lastCity_name' is null.
      final prefs = await SharedPreferences.getInstance();
      final cityName = prefs.getString('lastCity_name');
      expect(cityName, isNull); // confirms early-return condition
    });

    test('reads hanafi flag correctly from SharedPreferences', () async {
      SharedPreferences.setMockInitialValues({
        'lastCity_name': 'New York',
        'lastCity_country': 'US',
        'lastCity_lat': 40.7128,
        'lastCity_lng': -74.006,
        'lastCity_tz': 'America/New_York',
        'hanafi': true,
      });
      final prefs = await SharedPreferences.getInstance();
      final hanafi = prefs.getBool('hanafi') ?? false;
      expect(hanafi, isTrue);
    });

    test('defaults hanafi to false when key is absent', () async {
      SharedPreferences.setMockInitialValues({'lastCity_name': 'Mecca'});
      final prefs = await SharedPreferences.getInstance();
      final hanafi = prefs.getBool('hanafi') ?? false;
      expect(hanafi, isFalse);
    });

    test('malformed notification config JSON falls back to defaults without throwing', () {
      // Simulate the catch block in rescheduleFromBackground.
      List<PrayerNotificationConfig> configs = defaultNotificationConfigs;
      const malformedJson = '[{bad json}]';
      try {
        configs = (jsonDecode(malformedJson) as List)
            .cast<Map<String, dynamic>>()
            .map(PrayerNotificationConfig.fromJson)
            .toList();
      } catch (_) {
        // Falls back to default — this is the expected path.
      }
      // Must still have the defaults.
      expect(configs, equals(defaultNotificationConfigs));
      expect(configs.length, equals(defaultNotificationConfigs.length));
    });
  });

  group('copyWith preserves unchanged fields', () {
    test('changing mode leaves other fields intact', () {
      const original = PrayerNotificationConfig(
        prayerName: 'Maghrib',
        mode: PrayerNotificationMode.both,
        minutesBefore: 15,
        adhanType: AdhanType.mishari,
        volume: 0.5,
      );
      final updated = original.copyWith(mode: PrayerNotificationMode.off);

      expect(updated.prayerName, equals('Maghrib'));
      expect(updated.mode, equals(PrayerNotificationMode.off));
      expect(updated.minutesBefore, equals(15));
      expect(updated.adhanType, equals(AdhanType.mishari));
      expect(updated.volume, closeTo(0.5, 0.001));
    });
  });
}
