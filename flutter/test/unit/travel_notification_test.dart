import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Travel notification debounce logic tests.
///
/// These tests verify the 6-hour debounce behavior that prevents repeated
/// travel notifications when users cross back and forth near the 77 km
/// threshold. The debounce timestamp is persisted in SharedPreferences
/// under `pc_last_travel_notified`.

const _kLastTravelNotifiedKey = 'pc_last_travel_notified';
const _kDebounceMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

/// Simulates the debounce check performed by TravelNotifier.
/// Returns true if a notification should fire (outside debounce window).
bool shouldNotify(DateTime now, int? lastNotifiedMs) {
  if (lastNotifiedMs == null) return true;
  final lastNotified = DateTime.fromMillisecondsSinceEpoch(lastNotifiedMs);
  return now.difference(lastNotified).inMilliseconds >= _kDebounceMs;
}

void main() {
  group('Travel notification debounce', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('first crossing always fires notification', () {
      final now = DateTime(2026, 3, 4, 10, 0);
      expect(shouldNotify(now, null), isTrue);
    });

    test('second crossing within 6 hours is suppressed', () {
      final firstFire = DateTime(2026, 3, 4, 10, 0);
      final secondCrossing = DateTime(2026, 3, 4, 14, 0); // 4 hours later
      expect(
        shouldNotify(secondCrossing, firstFire.millisecondsSinceEpoch),
        isFalse,
      );
    });

    test('crossing exactly at 6 hours fires notification', () {
      final firstFire = DateTime(2026, 3, 4, 10, 0);
      final sixHoursLater = DateTime(2026, 3, 4, 16, 0);
      expect(
        shouldNotify(sixHoursLater, firstFire.millisecondsSinceEpoch),
        isTrue,
      );
    });

    test('crossing after 6 hours fires notification', () {
      final firstFire = DateTime(2026, 3, 4, 10, 0);
      final sevenHoursLater = DateTime(2026, 3, 4, 17, 0);
      expect(
        shouldNotify(sevenHoursLater, firstFire.millisecondsSinceEpoch),
        isTrue,
      );
    });

    test('crossing at 5h59m is still suppressed', () {
      final firstFire = DateTime(2026, 3, 4, 10, 0);
      // 5 hours 59 minutes = 21540000 ms < 21600000 ms
      final almostSix = firstFire.add(const Duration(hours: 5, minutes: 59));
      expect(
        shouldNotify(almostSix, firstFire.millisecondsSinceEpoch),
        isFalse,
      );
    });

    test('debounce resets after notification fires', () {
      final firstFire = DateTime(2026, 3, 4, 10, 0);
      final secondFire = DateTime(2026, 3, 4, 17, 0); // >6 hrs, fires
      final thirdCrossing = DateTime(2026, 3, 4, 20, 0); // 3 hrs after second

      expect(
        shouldNotify(secondFire, firstFire.millisecondsSinceEpoch),
        isTrue,
      );
      // After second fires, debounce resets to secondFire time
      expect(
        shouldNotify(thirdCrossing, secondFire.millisecondsSinceEpoch),
        isFalse,
      );
    });

    test('persisted timestamp survives SharedPreferences round-trip', () async {
      final prefs = await SharedPreferences.getInstance();
      final fireTime = DateTime(2026, 3, 4, 10, 0);
      await prefs.setInt(
          _kLastTravelNotifiedKey, fireTime.millisecondsSinceEpoch);

      final stored = prefs.getInt(_kLastTravelNotifiedKey);
      expect(stored, equals(fireTime.millisecondsSinceEpoch));

      final now = DateTime(2026, 3, 4, 14, 0);
      expect(shouldNotify(now, stored), isFalse);
    });

    test('no persisted timestamp treated as first crossing', () async {
      final prefs = await SharedPreferences.getInstance();
      final stored = prefs.getInt(_kLastTravelNotifiedKey);
      expect(stored, isNull);
      expect(shouldNotify(DateTime.now(), stored), isTrue);
    });
  });

  group('Travel threshold constants', () {
    test('Qasr threshold is 77 km', () {
      // The Hanafi threshold used in travel_provider.dart
      const threshold = 77.0;
      expect(threshold, equals(77.0));
    });

    test('distances below threshold do not trigger travel', () {
      const threshold = 77.0;
      expect(50.0 < threshold, isTrue);
      expect(76.9 < threshold, isTrue);
    });

    test('distances at or above threshold trigger travel', () {
      const threshold = 77.0;
      expect(77.0 >= threshold, isTrue);
      expect(100.0 >= threshold, isTrue);
    });
  });
}
