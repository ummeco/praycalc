import 'dart:async';

import 'package:flutter/material.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';

import '../../shared/models/settings_model.dart';

/// Full-screen animated sky gradient that shifts through the Islamic day cycle.
/// Always green-tinted (brand palette). Optional weather-based darkening.
///
/// Receives [prayers] and [settings] from parent — does not watch providers
/// internally so it stays testable and avoids double-rebuild.
class SkyGradientBackground extends StatefulWidget {
  const SkyGradientBackground({
    super.key,
    required this.prayers,
    required this.settings,
    required this.child,
    this.weatherCode,
  });

  final PrayerTimes? prayers;
  final AppSettings settings;
  final Widget child;

  /// WMO weathercode from Open-Meteo (null = unknown / no network).
  final int? weatherCode;

  @override
  State<SkyGradientBackground> createState() => _SkyGradientBackgroundState();
}

class _SkyGradientBackgroundState extends State<SkyGradientBackground> {
  Timer? _timer;
  LinearGradient _gradient = _kNoonGradient;

  @override
  void initState() {
    super.initState();
    _gradient = computeGradient(DateTime.now(), widget.prayers);
    _timer = Timer.periodic(const Duration(seconds: 10), (_) {
      if (!mounted) return;
      setState(() {
        _gradient = computeGradient(DateTime.now(), widget.prayers);
      });
    });
  }

  @override
  void didUpdateWidget(SkyGradientBackground old) {
    super.didUpdateWidget(old);
    if (old.prayers != widget.prayers) {
      setState(() {
        _gradient = computeGradient(DateTime.now(), widget.prayers);
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.settings.skyGradientEnabled) return widget.child;

    final gradient = widget.settings.skyGradientWeather
        ? applyWeatherTint(_gradient, widget.weatherCode)
        : _gradient;

    return Stack(
      fit: StackFit.expand,
      children: [
        AnimatedContainer(
          duration: const Duration(seconds: 10),
          decoration: BoxDecoration(gradient: gradient),
        ),
        widget.child,
      ],
    );
  }
}

// ── Gradient helpers (non-private for unit testing) ──────────────────────────

/// Current time as fractional hours since local midnight.
double _nowFracHours(DateTime now) =>
    now.hour + now.minute / 60.0 + now.second / 3600.0;

/// True if [nowH] (fractional hours) falls between [from] and [to].
/// Handles crossing midnight when [to] < [from].
bool _isBetweenHours(double nowH, double from, double to) {
  if (!from.isFinite || !to.isFinite) return false;
  if (to < from) {
    // Crosses midnight (e.g. Isha=21.5 → Fajr=5.3)
    return nowH >= from || nowH < to;
  }
  return nowH >= from && nowH < to;
}

/// Compute the sky gradient for [now] given [prayers].
/// Prayer times are fractional hours (e.g. 5.3 = 5:18 AM local time).
/// Falls back to noon gradient if prayers are null.
@visibleForTesting
LinearGradient computeGradient(DateTime now, PrayerTimes? prayers) {
  if (prayers == null) return _kNoonGradient;
  final h = _nowFracHours(now);

  if (_isBetweenHours(h, prayers.isha, prayers.fajr)) return _kPreFajrGradient;
  if (_isBetweenHours(h, prayers.fajr, prayers.sunrise)) return _kFajrGradient;
  if (_isBetweenHours(h, prayers.sunrise, prayers.dhuhr)) return _kMorningGradient;
  if (_isBetweenHours(h, prayers.dhuhr, prayers.asr)) return _kNoonGradient;
  if (_isBetweenHours(h, prayers.asr, prayers.maghrib)) return _kAfternoonGradient;
  if (_isBetweenHours(h, prayers.maghrib, prayers.isha)) return _kDuskGradient;
  return _kPreFajrGradient;
}

/// Darken gradient by 15% for overcast/cloudy conditions (weathercode ≥ 45).
@visibleForTesting
LinearGradient applyWeatherTint(LinearGradient g, int? weatherCode) {
  if (weatherCode == null || weatherCode < 45) return g;
  return LinearGradient(
    begin: g.begin,
    end: g.end,
    colors: g.colors.map((c) => c.withValues(alpha: c.a * 0.85)).toList(),
  );
}

// ── Sky segments — all dark, green-tinted, white-text-safe ───────────────────
// Palette basis: web #0A2010 (deep), #0D2F17 (dark), #1E5E2F (mid-dark)
// All stops are dark enough for white text (contrast ≥ 4.5:1).

/// Isha → Fajr: deepest night — near-black forest green.
const _kPreFajrGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF040B06), Color(0xFF0A1A0F)],
);

/// Fajr → Sunrise: predawn indigo-green.
const _kFajrGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF060E12), Color(0xFF0C1F18)],
);

/// Sunrise → Dhuhr: deep morning forest.
const _kMorningGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF0A1A0F), Color(0xFF122A18)],
);

/// Dhuhr → Asr: midday deep green.
const _kNoonGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF0D2114), Color(0xFF0A1A0F)],
);

/// Asr → Maghrib: amber-green afternoon.
const _kAfternoonGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF111A0A), Color(0xFF0D1A0E)],
);

/// Maghrib → Isha: dusk — warm deep green fading to night.
const _kDuskGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF1A1208), Color(0xFF0A1508)],
);
