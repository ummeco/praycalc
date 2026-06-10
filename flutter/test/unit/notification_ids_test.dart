import 'package:flutter_test/flutter_test.dart';
import 'package:praycalc_app/core/services/notification_constants.dart';

void main() {
  group('NotificationIds', () {
    test('constants have expected values', () {
      expect(NotificationIds.persistentShade, equals(1));
      expect(NotificationIds.snooze, equals(10));
    });

    group('prayer()', () {
      test('prayer(0) == 100', () {
        expect(NotificationIds.prayer(0), equals(100));
      });

      test('prayer(5) == 105', () {
        expect(NotificationIds.prayer(5), equals(105));
      });

      test('prayer(0, dayOffset: 1) == 120', () {
        expect(NotificationIds.prayer(0, dayOffset: 1), equals(120));
      });

      test('dayOffset steps by 20', () {
        expect(NotificationIds.prayer(3, dayOffset: 0), equals(103));
        expect(NotificationIds.prayer(3, dayOffset: 1), equals(123));
      });
    });

    group('prayerReminder()', () {
      test('prayerReminder(0) == 150', () {
        expect(NotificationIds.prayerReminder(0), equals(150));
      });

      test('prayerReminder(0, dayOffset: 1) == 170', () {
        expect(NotificationIds.prayerReminder(0, dayOffset: 1), equals(170));
      });

      test('prayerReminder(5) == 155', () {
        expect(NotificationIds.prayerReminder(5), equals(155));
      });
    });

    group('agenda()', () {
      test('agenda(0, 0) == 200', () {
        expect(NotificationIds.agenda(0, 0), equals(200));
      });

      test('agenda(6, 49) == 549', () {
        // 200 + (6 * 50) + 49 = 200 + 300 + 49 = 549
        expect(NotificationIds.agenda(6, 49), equals(549));
      });
    });
  });
}
