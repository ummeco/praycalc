/// Moonsighting Committee Worldwide (MCW) seasonal algorithm.
///
/// Computes Fajr and Isha as time offsets from sunrise/sunset using the
/// empirical piecewise-linear seasonal functions developed by the Moonsighting
/// Committee Worldwide (Khalid Shaukat).
///
/// Reference: moonsighting.com/isha_fajr.html
library;

import 'dart:math';

import 'types.dart';

bool _isLeapYear(int year) {
  return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}

/// Compute the MCW seasonal index (dyy) and days in year.
({int dyy, int daysInYear}) _computeDyy(DateTime date, double latitude) {
  final year = date.year;
  final daysInYear = _isLeapYear(year) ? 366 : 365;

  // Reference solstice: Dec 21 for Northern, Jun 21 for Southern
  final refMonth = latitude >= 0 ? 12 : 6; // Dec = 12, Jun = 6 (1-based)
  const refDay = 21;

  final zeroDate = DateTime.utc(year, refMonth, refDay);
  final inputUtc = DateTime.utc(date.year, date.month, date.day);

  int diffDays = inputUtc.difference(zeroDate).inDays;
  if (diffDays < 0) diffDays += daysInYear;

  return (dyy: diffDays, daysInYear: daysInYear);
}

/// Piecewise-linear seasonal interpolation over 6 segments.
double _interpolateSegment(
  int dyy,
  int daysInYear,
  double a,
  double b,
  double c,
  double d,
) {
  if (dyy < 91) {
    return a + ((b - a) / 91) * dyy;
  } else if (dyy < 137) {
    return b + ((c - b) / 46) * (dyy - 91);
  } else if (dyy < 183) {
    return c + ((d - c) / 46) * (dyy - 137);
  } else if (dyy < 229) {
    return d + ((c - d) / 46) * (dyy - 183);
  } else if (dyy < 275) {
    return c + ((b - c) / 46) * (dyy - 229);
  } else {
    final len = daysInYear - 275;
    return b + ((a - b) / len) * (dyy - 275);
  }
}

/// Compute Fajr offset in minutes before sunrise using the MCW algorithm.
///
/// Returns minutes before sunrise (rounded to nearest minute).
double getMscFajr(DateTime date, double latitude) {
  final latAbs = latitude.abs();
  final (:dyy, :daysInYear) = _computeDyy(date, latitude);

  final a = 75 + (28.65 / 55) * latAbs;
  final b = 75 + (19.44 / 55) * latAbs;
  final c = 75 + (32.74 / 55) * latAbs;
  final d = 75 + (48.1 / 55) * latAbs;

  return _interpolateSegment(dyy, daysInYear, a, b, c, d).roundToDouble();
}

/// Compute Isha offset in minutes after sunset using the MCW algorithm.
///
/// [shafaq] selects the twilight mode: general (default), ahmer, or abyad.
/// Returns minutes after sunset (rounded to nearest minute).
double getMscIsha(
  DateTime date,
  double latitude, [
  ShafaqMode shafaq = ShafaqMode.general,
]) {
  final latAbs = latitude.abs();
  final (:dyy, :daysInYear) = _computeDyy(date, latitude);

  double a, b, c, d;

  switch (shafaq) {
    case ShafaqMode.ahmer:
      a = 62 + (17.4 / 55) * latAbs;
      b = 62 - (7.16 / 55) * latAbs;
      c = 62 + (5.12 / 55) * latAbs;
      d = 62 + (19.44 / 55) * latAbs;
    case ShafaqMode.abyad:
      a = 75 + (25.6 / 55) * latAbs;
      b = 75 + (7.16 / 55) * latAbs;
      c = 75 + (36.84 / 55) * latAbs;
      d = 75 + (81.84 / 55) * latAbs;
    case ShafaqMode.general:
      a = 75 + (25.6 / 55) * latAbs;
      b = 75 + (2.05 / 55) * latAbs;
      c = 75 - (9.21 / 55) * latAbs;
      d = 75 + (6.14 / 55) * latAbs;
  }

  return _interpolateSegment(dyy, daysInYear, a, b, c, d).roundToDouble();
}

/// Convert MCW minutes-before-sunrise to an equivalent solar depression angle
/// in degrees, using exact spherical trigonometry.
///
/// Returns [double.nan] if the geometry is unreachable (polar day/night).
double minutesToDepression(
  double minutes,
  double latDeg,
  double declDeg,
) {
  final phi = latDeg * (pi / 180);
  final delta = declDeg * (pi / 180);

  final cosPhi = cos(phi);
  final sinPhi = sin(phi);
  final cosDelta = cos(delta);
  final sinDelta = sin(delta);

  // Standard sunrise/sunset: h = -0.833° (includes refraction + semi-diameter)
  final h0 = -0.833 * (pi / 180);
  final sinH0 = sin(h0);

  final denominator = cosPhi * cosDelta;
  if (denominator.abs() < 1e-10) return double.nan;

  // Hour angle at standard sunrise
  final cosHRise = (sinH0 - sinPhi * sinDelta) / denominator;

  if (cosHRise < -1) return double.nan; // polar night
  if (cosHRise > 1) return double.nan; // polar day

  final hRise = acos(cosHRise); // radians

  // Hour angle at the prayer time (further from solar noon)
  final deltaH = (minutes / 60) * 15 * (pi / 180);
  final hPrayer = hRise + deltaH;

  // Cap at π (midnight)
  if (hPrayer > pi) {
    final sinHMidnight =
        sinPhi * sinDelta + cosPhi * cosDelta * cos(pi);
    final hMidnight = asin(sinHMidnight.clamp(-1.0, 1.0));
    return -hMidnight / (pi / 180);
  }

  // Solar altitude at hPrayer
  final sinHPrayer =
      sinPhi * sinDelta + cosPhi * cosDelta * cos(hPrayer);
  final hPrayerAlt = asin(sinHPrayer.clamp(-1.0, 1.0));

  // Depression angle: positive when sun is below horizon
  return -hPrayerAlt / (pi / 180);
}
