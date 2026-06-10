import 'package:flutter_test/flutter_test.dart';
import 'package:praycalc_app/shared/models/agenda_model.dart';
import 'package:praycalc_app/core/services/agenda_service.dart';

void main() {
  group('Agenda model', () {
    test('serializes and deserializes', () {
      const agenda = Agenda(
        id: 'test-1',
        label: 'Wake for Fajr',
        prayer: PrayerName.fajr,
        offsetMinutes: -20,
        days: [0, 1, 2, 3, 4, 5, 6],
      );
      final json = agenda.toJson();
      final restored = Agenda.fromJson(json);
      expect(restored.label, equals('Wake for Fajr'));
      expect(restored.offsetMinutes, equals(-20));
      expect(restored.prayer, equals(PrayerName.fajr));
    });

    test('offsetDescription: before prayer', () {
      const agenda =
          Agenda(id: 'x', label: 'Test', prayer: PrayerName.asr, offsetMinutes: -15);
      expect(AgendaService.offsetDescription(agenda), contains('before'));
      expect(AgendaService.offsetDescription(agenda), contains('15'));
    });

    test('offsetDescription: at prayer', () {
      const agenda = Agenda(
          id: 'x', label: 'Test', prayer: PrayerName.maghrib, offsetMinutes: 0);
      expect(AgendaService.offsetDescription(agenda), startsWith('At'));
    });

    test('offsetDescription: after prayer', () {
      const agenda =
          Agenda(id: 'x', label: 'Test', prayer: PrayerName.isha, offsetMinutes: 10);
      expect(AgendaService.offsetDescription(agenda), contains('after'));
    });

    test('copyWith preserves fields', () {
      const a =
          Agenda(id: '1', label: 'Old', prayer: PrayerName.dhuhr, offsetMinutes: 5);
      final b = a.copyWith(label: 'New');
      expect(b.label, equals('New'));
      expect(b.prayer, equals(PrayerName.dhuhr));
    });

    test('all prayer names round-trip', () {
      for (final p in PrayerName.values) {
        const a =
            Agenda(id: 'x', label: 'T', prayer: PrayerName.fajr, offsetMinutes: 0);
        final j = a.copyWith(prayer: p).toJson();
        final r = Agenda.fromJson(j);
        expect(r.prayer, equals(p));
      }
    });
  });
}
