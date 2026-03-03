/// Core prayer times computation — PrayCalc Dynamic Method.
///
/// Returns all prayer times as fractional hours using the dynamic twilight
/// angle algorithm. Times are in local time as determined by the UTC offset.
library;

import 'types.dart';
import 'spa.dart';
import 'solar_ephemeris.dart';
import 'angles.dart';
import 'asr.dart';
import 'qiyam.dart';

/// Compute prayer times for a given date and location.
///
/// [date] is the observer's local date (time-of-day is ignored).
/// [lat] is latitude in decimal degrees (−90 to 90, south = negative).
/// [lng] is longitude in decimal degrees (−180 to 180, west = negative).
/// [tz] is UTC offset in hours (e.g., −5 for EST).
/// [elevation] is observer elevation in meters (default: 0).
/// [temperature] is ambient temperature in °C (default: 15).
/// [pressure] is atmospheric pressure in mbar/hPa (default: 1013.25).
/// [hanafi] selects Asr convention: false = Shafi'i/Maliki/Hanbali (default),
/// true = Hanafi.
PrayerTimes getTimes(
  DateTime date,
  double lat,
  double lng,
  double tz, {
  double elevation = 0,
  double temperature = 15,
  double pressure = 1013.25,
  bool hanafi = false,
}) {
  // 1. Compute dynamic twilight angles.
  final tw = getAngles(
    date, lat, lng,
    elevation: elevation,
    temperature: temperature,
    pressure: pressure,
  );

  // 2. Convert depression angles to SPA zenith angles.
  //    SPA uses zenith (90° + depression) for custom altitude events.
  final fajrZenith = 90 + tw.fajrAngle;
  final ishaZenith = 90 + tw.ishaAngle;

  // 3. Run SPA for solar position + custom twilight times.
  final spaData = getSpa(
    date,
    lat,
    lng,
    tz,
    elevation: elevation,
    temperature: temperature,
    pressure: pressure,
    customAngles: [fajrZenith, ishaZenith],
  );

  final fajrTime = spaData.angles[0].sunrise;
  final sunriseTime = spaData.sunrise;
  final noonTime = spaData.solarNoon;
  final maghribTime = spaData.sunset;
  final ishaTime = spaData.angles[1].sunset;

  // Dhuhr: 2.5 minutes after solar noon.
  final dhuhrTime = noonTime + 2.5 / 60;

  // 4. Solar declination for Asr (Meeus formula, accurate to ~0.01°).
  final jd = toJulianDate(
    DateTime.utc(date.year, date.month, date.day, 12, 0, 0),
  );
  final eph = solarEphemeris(jd);

  // 5. Asr time.
  final asrTime = getAsr(noonTime, lat, eph.decl, hanafi: hanafi);

  // 6. Qiyam al-Layl (last third of the night).
  final qiyamTime = getQiyam(fajrTime, ishaTime);

  return PrayerTimes(
    qiyam: qiyamTime.isFinite ? qiyamTime : double.nan,
    fajr: fajrTime.isFinite ? fajrTime : double.nan,
    sunrise: sunriseTime.isFinite ? sunriseTime : double.nan,
    noon: noonTime.isFinite ? noonTime : double.nan,
    dhuhr: dhuhrTime.isFinite ? dhuhrTime : double.nan,
    asr: asrTime.isFinite ? asrTime : double.nan,
    maghrib: maghribTime.isFinite ? maghribTime : double.nan,
    isha: ishaTime.isFinite ? ishaTime : double.nan,
    angles: tw,
  );
}

/// Format fractional hours as HH:MM:SS string.
/// Returns "N/A" if the value is non-finite or negative.
String formatTime(double hours) {
  if (!hours.isFinite || hours < 0) return 'N/A';
  final totalSec = (hours * 3600).round();
  final h = (totalSec ~/ 3600) % 24;
  final rem = totalSec - (totalSec ~/ 3600) * 3600;
  final m = rem ~/ 60;
  final s = rem - m * 60;
  return '${h.toString().padLeft(2, '0')}:'
      '${m.toString().padLeft(2, '0')}:'
      '${s.toString().padLeft(2, '0')}';
}
