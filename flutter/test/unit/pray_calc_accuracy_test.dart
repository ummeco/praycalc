import 'package:flutter_test/flutter_test.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';

void main() {
  // ---------------------------------------------------------------------------
  // Group 1: Ordering invariants — fajr < sunrise < dhuhr < asr < maghrib < isha
  // ---------------------------------------------------------------------------
  group('Ordering invariants', () {
    test('Makkah (2026-03-03): standard prayer order holds', () {
      final t = getTimes(
        DateTime.utc(2026, 3, 3, 12),
        21.3891,
        39.8579,
        3.0,
      );
      expect(t.fajr, lessThan(t.sunrise));
      expect(t.sunrise, lessThan(t.dhuhr));
      expect(t.dhuhr, lessThan(t.asr));
      expect(t.asr, lessThan(t.maghrib));
      expect(t.maghrib, lessThan(t.isha));
      expect(t.fajr.isFinite, isTrue, reason: 'Fajr should be finite');
      expect(t.isha.isFinite, isTrue, reason: 'Isha should be finite');
    });

    test('New York (2026-06-15): standard prayer order holds', () {
      final t = getTimes(
        DateTime.utc(2026, 6, 15, 12),
        40.7128,
        -74.0060,
        -5.0,
      );
      expect(t.fajr, lessThan(t.sunrise));
      expect(t.sunrise, lessThan(t.dhuhr));
      expect(t.dhuhr, lessThan(t.asr));
      expect(t.asr, lessThan(t.maghrib));
      expect(t.maghrib, lessThan(t.isha));
      expect(t.fajr.isFinite, isTrue, reason: 'Fajr should be finite');
      expect(t.isha.isFinite, isTrue, reason: 'Isha should be finite');
    });

    test('Jakarta (2026-03-03): standard prayer order holds', () {
      final t = getTimes(
        DateTime.utc(2026, 3, 3, 12),
        -6.2088,
        106.8456,
        7.0,
      );
      expect(t.fajr, lessThan(t.sunrise));
      expect(t.sunrise, lessThan(t.dhuhr));
      expect(t.dhuhr, lessThan(t.asr));
      expect(t.asr, lessThan(t.maghrib));
      expect(t.maghrib, lessThan(t.isha));
      expect(t.fajr.isFinite, isTrue, reason: 'Fajr should be finite');
      expect(t.isha.isFinite, isTrue, reason: 'Isha should be finite');
    });

    test('London (2026-03-03): standard prayer order holds', () {
      final t = getTimes(
        DateTime.utc(2026, 3, 3, 12),
        51.5074,
        -0.1278,
        0.0,
      );
      expect(t.fajr, lessThan(t.sunrise));
      expect(t.sunrise, lessThan(t.dhuhr));
      expect(t.dhuhr, lessThan(t.asr));
      expect(t.asr, lessThan(t.maghrib));
      expect(t.maghrib, lessThan(t.isha));
      expect(t.fajr.isFinite, isTrue, reason: 'Fajr should be finite');
      expect(t.isha.isFinite, isTrue, reason: 'Isha should be finite');
    });
  });
}
