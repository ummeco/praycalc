import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:test/test.dart';

/// Reference values validated against the pray-calc TypeScript library v2.0.0.
void main() {
  group('getTimes — NYC 2024-03-15 (Shafi\'i)', () {
    late PrayerTimes times;

    setUpAll(() {
      final date = DateTime(2024, 3, 15);
      times = getTimes(date, 40.7128, -74.0060, -5.0);
    });

    test('Fajr is before Sunrise', () {
      expect(times.fajr, lessThan(times.sunrise));
    });

    test('Sunrise is before Dhuhr', () {
      expect(times.sunrise, lessThan(times.dhuhr));
    });

    test('Dhuhr is before Asr', () {
      expect(times.dhuhr, lessThan(times.asr));
    });

    test('Asr is before Maghrib', () {
      expect(times.asr, lessThan(times.maghrib));
    });

    test('Maghrib is before Isha', () {
      expect(times.maghrib, lessThan(times.isha));
    });

    test('Fajr is in the 4–6 AM range', () {
      // Dynamic method gives ~4:37 AM for NYC March 15 (MCW-based ~17.7° angle)
      expect(times.fajr, greaterThan(4.0));
      expect(times.fajr, lessThan(6.0));
    });

    test('Dhuhr is around 12–14 h', () {
      expect(times.dhuhr, greaterThan(12.0));
      expect(times.dhuhr, lessThan(14.0));
    });

    test('Maghrib is around 18–19.5 h', () {
      expect(times.maghrib, greaterThan(18.0));
      expect(times.maghrib, lessThan(19.5));
    });

    test('Isha is after Maghrib + 1 hour', () {
      expect(times.isha, greaterThan(times.maghrib + 1.0));
    });

    test('Qiyam is finite and before Fajr (wraps past midnight)', () {
      // Qiyam = last third of night, after Isha it wraps past midnight
      // e.g. Isha=19:34, night=7h, Qiyam=01:31 next day (numerically ~1.53, < Fajr ~4.62)
      expect(times.qiyam.isFinite, isTrue);
      expect(times.qiyam, lessThan(times.fajr));
    });

    test('angles are in valid range [10, 22]', () {
      expect(times.angles.fajrAngle, inInclusiveRange(10.0, 22.0));
      expect(times.angles.ishaAngle, inInclusiveRange(10.0, 22.0));
    });

    test('formatTime produces HH:MM:SS', () {
      final formatted = formatTime(times.fajr);
      expect(formatted, matches(RegExp(r'^\d{2}:\d{2}:\d{2}$')));
    });
  });

  group('getTimes — NYC 2024-03-15 (Hanafi)', () {
    late PrayerTimes timesShafii;
    late PrayerTimes timesHanafi;

    setUpAll(() {
      final date = DateTime(2024, 3, 15);
      timesShafii = getTimes(date, 40.7128, -74.0060, -5.0);
      timesHanafi = getTimes(date, 40.7128, -74.0060, -5.0, hanafi: true);
    });

    test('Hanafi Asr is later than Shafi\'i Asr', () {
      expect(timesHanafi.asr, greaterThan(timesShafii.asr));
    });

    test('All non-Asr times are identical', () {
      expect(timesHanafi.fajr, closeTo(timesShafii.fajr, 0.0001));
      expect(timesHanafi.sunrise, closeTo(timesShafii.sunrise, 0.0001));
      expect(timesHanafi.maghrib, closeTo(timesShafii.maghrib, 0.0001));
      expect(timesHanafi.isha, closeTo(timesShafii.isha, 0.0001));
    });
  });

  // T02 — Hanafi fixed angle tests (18° Fajr, 17° Isha)
  // ⚠️  ISLAMIC REVIEW FLAG: 18°/17° is the UK/Deobandi/Barelwi standard.
  // Other Hanafi positions exist; these tests validate the fixed-override
  // path, not the scholarly correctness of the angle values themselves.
  group('getTimes — Hanafi fixed angles (hanafiAngles=true)', () {
    // London winter (2024-12-15, lat=51.5°) is a good test because the
    // dynamic algorithm produces conservative angles at high winter latitude,
    // so fixed 18°/17° should yield an earlier Fajr than ISNA (~15°).
    late PrayerTimes timesIsna;       // dynamic (no hanafiAngles)
    late PrayerTimes timesHanafiFixed; // fixed 18°/17°
    late PrayerTimes timesHanafiDynamic; // hanafi=true, hanafiAngles=false

    setUpAll(() {
      final date = DateTime(2024, 12, 15);
      timesIsna          = getTimes(date, 51.5074, -0.1278, 0.0);
      timesHanafiFixed   = getTimes(date, 51.5074, -0.1278, 0.0,
          hanafi: true, hanafiAngles: true);
      timesHanafiDynamic = getTimes(date, 51.5074, -0.1278, 0.0,
          hanafi: true, hanafiAngles: false);
    });

    test('Hanafi fixed angles use exactly 18° Fajr', () {
      expect(timesHanafiFixed.angles.fajrAngle, equals(18.0));
    });

    test('Hanafi fixed angles use exactly 17° Isha', () {
      expect(timesHanafiFixed.angles.ishaAngle, equals(17.0));
    });

    test('Hanafi fixed Fajr is earlier than ISNA dynamic Fajr at London winter', () {
      // 18° is larger depression than dynamic ~14–16°, so sun must be deeper
      // below horizon → Fajr is earlier (smaller fractional hour value).
      expect(timesHanafiFixed.fajr, lessThan(timesIsna.fajr));
    });

    test('Hanafi fixed Isha is later than dynamic Isha at London winter', () {
      // 17° is larger depression → sun sets deeper → Isha is later.
      expect(timesHanafiFixed.isha, greaterThan(timesIsna.isha));
    });

    test('Hanafi fixed Asr is later than ISNA Asr (hanafi shadow factor 2)', () {
      expect(timesHanafiFixed.asr, greaterThan(timesIsna.asr));
    });

    test('Hanafi fixed Fajr is earlier than Hanafi dynamic Fajr at London winter', () {
      // The dynamic algorithm for London Dec typically yields ~16–17°;
      // forcing 18° must push Fajr even earlier.
      expect(timesHanafiFixed.fajr, lessThanOrEqualTo(timesHanafiDynamic.fajr + 0.001));
    });

    test('hanafiAngles=false does NOT change Fajr/Isha angles from base', () {
      // Sanity: disabling the override keeps angles matching the pure dynamic result.
      expect(timesHanafiDynamic.angles.fajrAngle,
          closeTo(timesIsna.angles.fajrAngle, 0.001));
      expect(timesHanafiDynamic.angles.ishaAngle,
          closeTo(timesIsna.angles.ishaAngle, 0.001));
    });

    test('Hanafi fixed prayer ordering is valid', () {
      expect(timesHanafiFixed.fajr,    lessThan(timesHanafiFixed.sunrise));
      expect(timesHanafiFixed.sunrise, lessThan(timesHanafiFixed.dhuhr));
      expect(timesHanafiFixed.dhuhr,   lessThan(timesHanafiFixed.asr));
      expect(timesHanafiFixed.asr,     lessThan(timesHanafiFixed.maghrib));
      expect(timesHanafiFixed.maghrib, lessThan(timesHanafiFixed.isha));
    });
  });

  group('getTimes — Mecca 2024-06-21 (summer solstice)', () {
    late PrayerTimes times;

    setUpAll(() {
      final date = DateTime(2024, 6, 21);
      times = getTimes(date, 21.3891, 39.8579, 3.0);
    });

    test('All prayer times are finite', () {
      expect(times.fajr.isFinite, isTrue);
      expect(times.sunrise.isFinite, isTrue);
      expect(times.dhuhr.isFinite, isTrue);
      expect(times.asr.isFinite, isTrue);
      expect(times.maghrib.isFinite, isTrue);
      expect(times.isha.isFinite, isTrue);
      expect(times.qiyam.isFinite, isTrue);
    });

    test('Prayer time ordering is correct', () {
      expect(times.fajr, lessThan(times.sunrise));
      expect(times.sunrise, lessThan(times.dhuhr));
      expect(times.dhuhr, lessThan(times.asr));
      expect(times.asr, lessThan(times.maghrib));
      expect(times.maghrib, lessThan(times.isha));
    });
  });

  group('getAngles', () {
    test('NYC Jan angles are in valid range', () {
      final date = DateTime(2024, 1, 15);
      final angles = getAngles(date, 40.7128, -74.0060);
      expect(angles.fajrAngle, inInclusiveRange(10.0, 22.0));
      expect(angles.ishaAngle, inInclusiveRange(10.0, 22.0));
    });
  });

  group('getAsr', () {
    test('Hanafi Asr is always later than Shafi\'i', () {
      final asrShafii = getAsr(12.5, 40.0, 5.0);
      final asrHanafi = getAsr(12.5, 40.0, 5.0, hanafi: true);
      expect(asrHanafi, greaterThan(asrShafii));
    });
  });

  group('getQiyam', () {
    test('last third starts at 2/3 of night from Isha', () {
      // Isha=22:00, Fajr=05:00 next day → night=7h → last third = 22 + 14/3
      final q = getQiyam(5.0, 22.0);
      expect(q, closeTo(((22.0 + 14.0 / 3.0) - 24.0), 0.001));
    });
  });

  group('solarEphemeris', () {
    test('declination at June solstice is ~23.4°', () {
      final jd = toJulianDate(DateTime.utc(2024, 6, 21, 12));
      final eph = solarEphemeris(jd);
      expect(eph.decl, closeTo(23.4, 0.5));
    });

    test('declination at Dec solstice is ~-23.4°', () {
      final jd = toJulianDate(DateTime.utc(2024, 12, 21, 12));
      final eph = solarEphemeris(jd);
      expect(eph.decl, closeTo(-23.4, 0.5));
    });

    test('Earth-Sun distance at perihelion (Jan 3) is ~0.983 AU', () {
      final jd = toJulianDate(DateTime.utc(2024, 1, 3, 12));
      final eph = solarEphemeris(jd);
      expect(eph.r, closeTo(0.983, 0.003));
    });
  });

  group('getSpa', () {
    test('returns valid zenith and azimuth', () {
      final result = getSpa(
        DateTime.utc(2024, 3, 15, 12, 0, 0),
        40.7128,
        -74.0060,
        -5.0,
      );
      expect(result.zenith, inInclusiveRange(0.0, 180.0));
      expect(result.azimuth, inInclusiveRange(0.0, 360.0));
    });

    test('custom angles produce correct twilight pairs', () {
      final result = getSpa(
        DateTime.utc(2024, 3, 15, 12, 0, 0),
        40.7128,
        -74.0060,
        -5.0,
        customAngles: [96.0, 108.0], // civil, astronomical twilight
      );
      expect(result.angles.length, equals(2));
      // Civil twilight (96°, -6° below horizon) rises LATER than astronomical (108°, -18°)
      expect(result.angles[0].sunrise, greaterThan(result.angles[1].sunrise));
      // Civil twilight sets EARLIER than astronomical twilight
      expect(result.angles[0].sunset, lessThan(result.angles[1].sunset));
    });
  });
}
