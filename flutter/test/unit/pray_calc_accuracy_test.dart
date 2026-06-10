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

  // ---------------------------------------------------------------------------
  // TEST-B3: Edge case tests — polar regions, zeroed coords, Hanafi mode
  // ---------------------------------------------------------------------------
  group('Edge cases', () {
    test('zeroed coordinates (0,0) produce finite prayer times (equator/prime-meridian)', () {
      // lat=0, lng=0 is rejected by the provider (NoLocationError) but the
      // engine itself must not throw — it just returns equatorial times.
      final t = getTimes(DateTime.utc(2026, 3, 3, 12), 0.0, 0.0, 0.0);
      // All times must be non-NaN (may be 0.0 or otherwise atypical but finite).
      expect(t.fajr.isNaN, isFalse);
      expect(t.dhuhr.isNaN, isFalse);
      expect(t.isha.isNaN, isFalse);
    });

    test('negative longitude (West) produces valid times — e.g. Los Angeles', () {
      final t = getTimes(
        DateTime.utc(2026, 3, 3, 12),
        34.0522,
        -118.2437,
        -8.0,
      );
      expect(t.fajr, lessThan(t.sunrise));
      expect(t.dhuhr, lessThan(t.asr));
      expect(t.asr, lessThan(t.maghrib));
      expect(t.fajr.isFinite, isTrue);
    });

    test('southern hemisphere (Sydney) produces valid ordered times', () {
      final t = getTimes(
        DateTime.utc(2026, 3, 3, 12),
        -33.8688,
        151.2093,
        11.0,
      );
      expect(t.fajr, lessThan(t.sunrise));
      expect(t.sunrise, lessThan(t.dhuhr));
      expect(t.dhuhr, lessThan(t.asr));
      expect(t.asr, lessThan(t.maghrib));
      expect(t.maghrib, lessThan(t.isha));
      expect(t.fajr.isFinite, isTrue);
    });

    test('Hanafi mode shifts Asr later than standard mode', () {
      final date = DateTime.utc(2026, 6, 21, 12); // summer solstice
      final standard = getTimes(date, 51.5074, -0.1278, 1.0, hanafi: false);
      final hanafi = getTimes(date, 51.5074, -0.1278, 1.0, hanafi: true);
      // Hanafi Asr is always later (shadow factor = 2 vs 1).
      expect(hanafi.asr, greaterThan(standard.asr));
      // Other prayers should not differ between modes.
      expect(hanafi.fajr, equals(standard.fajr));
      expect(hanafi.dhuhr, equals(standard.dhuhr));
      expect(hanafi.maghrib, equals(standard.maghrib));
    });

    test('utcOffset = 0 produces times in UTC range [0, 24)', () {
      final t = getTimes(
        DateTime.utc(2026, 3, 21, 12), // vernal equinox, ~equal day/night
        0.0,
        0.0,
        0.0,
      );
      // All finite times must be within a 24-hour day.
      for (final time in [t.fajr, t.sunrise, t.dhuhr, t.asr, t.maghrib, t.isha]) {
        if (time.isFinite) {
          expect(time, greaterThanOrEqualTo(0.0));
          expect(time, lessThan(24.0));
        }
      }
    });

    test('times are stable across repeated calls with same inputs', () {
      final date = DateTime.utc(2026, 3, 3, 12);
      final t1 = getTimes(date, 40.7128, -74.006, -5.0);
      final t2 = getTimes(date, 40.7128, -74.006, -5.0);
      expect(t1.fajr, equals(t2.fajr));
      expect(t1.dhuhr, equals(t2.dhuhr));
      expect(t1.isha, equals(t2.isha));
    });
  });
}
