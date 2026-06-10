/// Asr prayer time calculation.
///
/// Asr begins when the shadow of an object equals (Shafi'i/Maliki/Hanbali)
/// or twice (Hanafi) the object's length plus its shadow at solar noon.
library;

import 'dart:math';

/// Compute Asr time as fractional hours.
///
/// [solarNoon] is solar noon in fractional hours (from getSpa).
/// [latitude] is observer latitude in degrees.
/// [declination] is solar declination in degrees (from solarEphemeris).
/// [hanafi] is true for Hanafi (shadow factor 2), false for Shafi'i (factor 1).
///
/// Returns fractional hours, or [double.nan] if the sun never reaches the
/// required altitude.
double getAsr(
  double solarNoon,
  double latitude,
  double declination, {
  bool hanafi = false,
}) {
  const deg = pi / 180;
  final phi = latitude * deg;
  final delta = declination * deg;
  final shadowFactor = hanafi ? 2.0 : 1.0;

  // Required solar altitude: tan(A) = 1 / (shadowFactor + tan(|φ − δ|))
  final x = (phi - delta).abs();
  final tanA = 1.0 / (shadowFactor + tan(x));
  final sinA = tanA / sqrt(1 + tanA * tanA); // sin(atan(tanA))

  // cos(H0) = (sin(A) − sin(φ)sin(δ)) / (cos(φ)cos(δ))
  final cosH0 =
      (sinA - sin(phi) * sin(delta)) / (cos(phi) * cos(delta));

  if (cosH0 < -1 || cosH0 > 1) return double.nan;

  // H0 in hours (15°/hr)
  final h0h = acos(cosH0) / deg / 15;

  return solarNoon + h0h;
}
