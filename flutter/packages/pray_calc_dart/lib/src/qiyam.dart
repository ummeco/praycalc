/// Qiyam al-Layl (night prayer) time calculation.
///
/// Returns the start of the last third of the night, which is the recommended
/// time for Tahajjud / Qiyam al-Layl. The night is defined as the period
/// from Isha to Fajr.
library;

/// Compute the start of the last third of the night.
///
/// [fajrTime] is Fajr time in fractional hours.
/// [ishaTime] is Isha time in fractional hours.
///
/// Returns start of the last third of the night (fractional hours).
double getQiyam(double fajrTime, double ishaTime) {
  // If Fajr is numerically earlier (e.g. 5.5) than Isha (e.g. 21.5), Fajr
  // is actually the NEXT day — add 24 to get the correct night length.
  final adjustedFajr = fajrTime < ishaTime ? fajrTime + 24 : fajrTime;

  final nightLength = adjustedFajr - ishaTime;
  final lastThirdStart = ishaTime + (2 * nightLength) / 3;

  return lastThirdStart >= 24 ? lastThirdStart - 24 : lastThirdStart;
}
