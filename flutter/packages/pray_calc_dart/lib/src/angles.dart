/// Dynamic twilight angle algorithm — PrayCalc Dynamic Method v2.
///
/// Computes adaptive Fajr and Isha solar depression angles that accurately
/// track the observable phenomenon across all latitudes and seasons.
///
/// Three-layer model:
///   1. MSC base (MCW piecewise seasonal, converted to depression angle)
///   2. Ephemeris corrections (Earth-Sun distance, Fourier season smoothing)
///   3. Environmental corrections (elevation, atmospheric refraction)
library;

import 'dart:math';

import 'types.dart';
import 'solar_ephemeris.dart';
import 'msc.dart';

const double _kFajrMin = 10;
const double _kFajrMax = 22;
const double _kIshaMin = 10;
const double _kIshaMax = 22;

double _clip(double value, double min, double max) {
  return value < min ? min : (value > max ? max : value);
}

double _round3(double value) {
  return (value * 1000).round() / 1000.0;
}

/// Earth-Sun distance correction in degrees.
/// Effect magnitude: ≈ ±0.015°.
double _earthSunDistanceCorrection(double r) {
  return -0.5 * log(r);
}

/// Fourier smoothing correction (< 0.3° total) to remove MCW piecewise
/// artifacts and add hemisphere-symmetric season curvature.
double _fourierSmoothingCorrection(double eclLon, double latAbsDeg) {
  const deg = pi / 180;
  final theta = eclLon; // solar ecliptic longitude, radians [0, 2π)
  final phi = latAbsDeg * deg;

  final a1 = 0.03 * sin(theta);
  final b1 = -0.05 * cos(theta);
  final a2 = 0.02 * sin(2 * theta);
  final b2 = 0.02 * cos(2 * theta);
  final c1 = -0.008 * phi * sin(theta);
  final d1 = 0.004 * phi * cos(theta);

  return a1 + b1 + a2 + b2 + c1 + d1;
}

/// Compute dynamic twilight depression angles for Fajr and Isha.
///
/// [date] is the observer's local date (time-of-day is ignored).
/// [lat] is latitude in decimal degrees.
/// [lng] is longitude in decimal degrees (reserved, currently unused).
/// [elevation] is observer elevation in meters (default: 0).
/// [temperature] is ambient temperature in °C (default: 15).
/// [pressure] is atmospheric pressure in mbar (default: 1013.25).
TwilightAngles getAngles(
  DateTime date,
  double lat,
  double lng, {
  double elevation = 0,
  double temperature = 15,
  double pressure = 1013.25,
}) {
  // 1. Solar ephemeris at UTC noon of the given date.
  final noonDate = DateTime.utc(date.year, date.month, date.day, 12, 0, 0);
  final jd = toJulianDate(noonDate);
  final eph = solarEphemeris(jd);

  // 2. MCW reference times (minutes before/after sunrise/sunset).
  final mscFajrMin = getMscFajr(date, lat);
  final mscIshaMin = getMscIsha(date, lat);

  // 3. Convert MCW minutes to equivalent solar depression angles.
  double fajrBase = minutesToDepression(mscFajrMin, lat, eph.decl);
  double ishaBase = minutesToDepression(mscIshaMin, lat, eph.decl);

  // Handle polar or unreachable geometry.
  if (!fajrBase.isFinite || fajrBase.isNaN) fajrBase = 18.0;
  if (!ishaBase.isFinite || ishaBase.isNaN) ishaBase = 18.0;

  // 4. Earth-Sun distance correction.
  final rCorr = _earthSunDistanceCorrection(eph.r);

  // 5. Fourier smoothing correction.
  final fourierCorr = _fourierSmoothingCorrection(eph.eclLon, lat.abs());

  // 6. Atmospheric refraction at expected twilight depression.
  final refrFajr = atmosphericRefraction(
    -(fajrBase + 0.5),
    pressureMbar: pressure,
    temperatureC: temperature,
  );
  final refrIsha = atmosphericRefraction(
    -(ishaBase + 0.5),
    pressureMbar: pressure,
    temperatureC: temperature,
  );

  // 7. Elevation correction (horizon dip).
  final horizonDipDeg = 1.06 * sqrt(elevation / 1000);
  final elevCorr = horizonDipDeg * 0.3;

  // 8. Assemble final angles.
  final rawFajr = fajrBase + rCorr + fourierCorr + refrFajr + elevCorr;
  final rawIsha = ishaBase + rCorr + fourierCorr + refrIsha + elevCorr;

  final fajrAngle = _round3(_clip(rawFajr, _kFajrMin, _kFajrMax));
  final ishaAngle = _round3(_clip(rawIsha, _kIshaMin, _kIshaMax));

  return TwilightAngles(fajrAngle: fajrAngle, ishaAngle: ishaAngle);
}
