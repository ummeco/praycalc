import 'dart:math' as math;

/// Phase classification of the moon.
enum MoonPhase {
  newMoon,
  waxingCrescent,
  firstQuarter,
  waxingGibbous,
  fullMoon,
  waningGibbous,
  lastQuarter,
  waningCrescent;

  /// Return the canonical display name for a given [MoonPhase].
  static String phaseName(MoonPhase p) {
    switch (p) {
      case MoonPhase.newMoon:       return 'New Moon';
      case MoonPhase.waxingCrescent:return 'Waxing Crescent';
      case MoonPhase.firstQuarter:  return 'First Quarter';
      case MoonPhase.waxingGibbous: return 'Waxing Gibbous';
      case MoonPhase.fullMoon:      return 'Full Moon';
      case MoonPhase.waningGibbous: return 'Waning Gibbous';
      case MoonPhase.lastQuarter:   return 'Last Quarter';
      case MoonPhase.waningCrescent:return 'Waning Crescent';
    }
  }

  /// Return a single moon emoji for a given [MoonPhase].
  static String phaseEmoji(MoonPhase p) {
    switch (p) {
      case MoonPhase.newMoon:       return '🌑';
      case MoonPhase.waxingCrescent:return '🌒';
      case MoonPhase.firstQuarter:  return '🌓';
      case MoonPhase.waxingGibbous: return '🌔';
      case MoonPhase.fullMoon:      return '🌕';
      case MoonPhase.waningGibbous: return '🌖';
      case MoonPhase.lastQuarter:   return '🌗';
      case MoonPhase.waningCrescent:return '🌘';
    }
  }

  /// Calculate moon phase data for [date].
  static MoonPhaseResult calculate(DateTime date) {
    // Reference: new moon on 2000-01-06 18:14 UTC
    const refNewMoon = 946931640.0; // seconds since epoch
    const synodicSeconds = 29.53059 * 86400.0; // seconds per lunation

    final epochSeconds = date.millisecondsSinceEpoch / 1000.0;
    final elapsed = epochSeconds - refNewMoon;
    final moonAge = (elapsed % synodicSeconds) / 86400.0; // days since new moon
    final fraction = moonAge / 29.53059; // 0.0–1.0

    // Illumination approximation via cosine of phase angle.
    final phaseAngle = fraction * 2 * math.pi;
    final illuminationPct = ((1 - math.cos(phaseAngle)) / 2) * 100;

    // Map fraction to phase.
    final MoonPhase phase;
    if (fraction < 0.0334) {
      phase = MoonPhase.newMoon;
    } else if (fraction < 0.25 - 0.0334) {
      phase = MoonPhase.waxingCrescent;
    } else if (fraction < 0.25 + 0.0334) {
      phase = MoonPhase.firstQuarter;
    } else if (fraction < 0.5 - 0.0334) {
      phase = MoonPhase.waxingGibbous;
    } else if (fraction < 0.5 + 0.0334) {
      phase = MoonPhase.fullMoon;
    } else if (fraction < 0.75 - 0.0334) {
      phase = MoonPhase.waningGibbous;
    } else if (fraction < 0.75 + 0.0334) {
      phase = MoonPhase.lastQuarter;
    } else if (fraction < 1.0 - 0.0334) {
      phase = MoonPhase.waningCrescent;
    } else {
      phase = MoonPhase.newMoon;
    }

    // Next full moon: fraction 0.5 of a lunation from the last new moon.
    final secToNextFull = (0.5 - fraction) * synodicSeconds;
    final nextFullMoon = date.add(Duration(
      milliseconds: (secToNextFull * 1000).round(),
    ));

    return MoonPhaseResult(
      phase: phase,
      illuminationPct: illuminationPct,
      moonAge: moonAge,
      nextFullMoon: secToNextFull > 0
          ? nextFullMoon
          : nextFullMoon.add(const Duration(days: 30)),
    );
  }
}

/// Result of a moon phase calculation.
class MoonPhaseResult {
  final MoonPhase phase;

  /// Percentage of the moon's disk that is illuminated (0–100).
  final double illuminationPct;

  /// Days elapsed since the last new moon.
  final double moonAge;

  /// Approximate date and time of the next full moon.
  final DateTime nextFullMoon;

  const MoonPhaseResult({
    required this.phase,
    required this.illuminationPct,
    required this.moonAge,
    required this.nextFullMoon,
  });
}
