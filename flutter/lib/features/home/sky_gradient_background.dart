// SkyGradientBackground (home feature) — sky gradient with animated weather overlays.
//
// Reuses the gradient logic from shared/widgets/sky_gradient_background.dart.
// Adds optional weather overlays: rain, snow, lightning.
// The `condition` parameter is supplied by the parent — no API call made here.

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';

import '../../shared/models/settings_model.dart';

// ── Sky gradient helpers (mirrors shared/widgets/sky_gradient_background.dart) ─

const _kPreFajrGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF020703), Color(0xFF060E08)],
);
const _kFajrGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF04090E), Color(0xFF081610)],
);
const _kMorningGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF081408), Color(0xFF0E2212)],
);
const _kNoonGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF0B1C0F), Color(0xFF081408)],
);
const _kAfternoonGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF0E1506), Color(0xFF0A1309)],
);
const _kDuskGradient = LinearGradient(
  begin: Alignment.topCenter,
  end: Alignment.bottomCenter,
  colors: [Color(0xFF150E04), Color(0xFF080F04)],
);

LinearGradient _skyGradient(DateTime now, PrayerTimes? prayers) {
  if (prayers == null) return _kNoonGradient;
  final h = now.hour + now.minute / 60.0 + now.second / 3600.0;

  bool between(double from, double to) {
    if (!from.isFinite || !to.isFinite) return false;
    if (to < from) return h >= from || h < to;
    return h >= from && h < to;
  }

  if (between(prayers.isha, prayers.fajr)) return _kPreFajrGradient;
  if (between(prayers.fajr, prayers.sunrise)) return _kFajrGradient;
  if (between(prayers.sunrise, prayers.dhuhr)) return _kMorningGradient;
  if (between(prayers.dhuhr, prayers.asr)) return _kNoonGradient;
  if (between(prayers.asr, prayers.maghrib)) return _kAfternoonGradient;
  if (between(prayers.maghrib, prayers.isha)) return _kDuskGradient;
  return _kPreFajrGradient;
}

// ── Weather condition enum ────────────────────────────────────────────────────

enum WeatherCondition { rain, snow, thunderstorm }

// ── Widget ────────────────────────────────────────────────────────────────────

/// Sky gradient background with optional animated weather overlay.
///
/// Pass [condition] from a parent that determines weather (e.g. from a WMO
/// weather code, a month-based simulation, or a network response).
/// If [condition] is null, only the gradient is shown.
class HomeWeatherSkyBackground extends StatefulWidget {
  const HomeWeatherSkyBackground({
    super.key,
    required this.prayers,
    required this.settings,
    required this.child,
    this.condition,
  });

  final PrayerTimes? prayers;
  final AppSettings settings;
  final Widget child;
  final WeatherCondition? condition;

  @override
  State<HomeWeatherSkyBackground> createState() =>
      _HomeWeatherSkyBackgroundState();
}

class _HomeWeatherSkyBackgroundState extends State<HomeWeatherSkyBackground>
    with TickerProviderStateMixin {
  late AnimationController _weatherCtrl;
  late AnimationController _lightningCtrl;
  bool _lightningVisible = false;

  @override
  void initState() {
    super.initState();

    _weatherCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();

    _lightningCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );

    _scheduleLightning();
  }

  void _scheduleLightning() {
    if (!mounted) return;
    if (widget.condition != WeatherCondition.thunderstorm) return;
    final delay = 30 + math.Random().nextInt(90); // 30–120 seconds
    Future.delayed(Duration(seconds: delay), () {
      if (!mounted) return;
      if (widget.condition != WeatherCondition.thunderstorm) return;
      setState(() => _lightningVisible = true);
      _lightningCtrl.forward(from: 0).then((_) {
        if (mounted) setState(() => _lightningVisible = false);
        _scheduleLightning();
      });
    });
  }

  @override
  void didUpdateWidget(HomeWeatherSkyBackground old) {
    super.didUpdateWidget(old);
    if (old.condition != widget.condition) {
      if (widget.condition == WeatherCondition.thunderstorm) {
        _scheduleLightning();
      }
    }
  }

  @override
  void dispose() {
    _weatherCtrl.dispose();
    _lightningCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gradient = _skyGradient(DateTime.now(), widget.prayers);

    return Stack(
      fit: StackFit.expand,
      children: [
        // Base sky gradient
        AnimatedContainer(
          duration: const Duration(seconds: 10),
          decoration: BoxDecoration(gradient: gradient),
        ),

        // One shade darker overlay (matches shared widget)
        Container(color: const Color(0xFF000000).withAlpha(28)),

        // Weather overlay
        if (widget.condition == WeatherCondition.rain)
          AnimatedBuilder(
            animation: _weatherCtrl,
            builder: (_, _) => CustomPaint(
              painter: _RainOverlay(t: _weatherCtrl.value),
            ),
          ),

        if (widget.condition == WeatherCondition.snow)
          AnimatedBuilder(
            animation: _weatherCtrl,
            builder: (_, _) => CustomPaint(
              painter: _SnowOverlay(t: _weatherCtrl.value),
            ),
          ),

        // Lightning flash
        if (_lightningVisible)
          AnimatedBuilder(
            animation: _lightningCtrl,
            builder: (_, _) {
              // Opacity: 0 → 0.3 → 0 over the 200ms duration
              final t = _lightningCtrl.value;
              final opacity = t < 0.5 ? t * 0.6 : (1 - t) * 0.6;
              return Opacity(
                opacity: opacity.clamp(0.0, 1.0),
                child: Container(color: Colors.white),
              );
            },
          ),

        // Content
        widget.child,
      ],
    );
  }
}

// ── Rain overlay ─────────────────────────────────────────────────────────────

class _RainOverlay extends CustomPainter {
  const _RainOverlay({required this.t});
  final double t; // 0..1, repeating

  static final _rng = math.Random(7);
  static final _drops = List.generate(100, (i) => _RainDrop(_rng));

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withAlpha(60)
      ..strokeWidth = 1.2
      ..strokeCap = StrokeCap.round;

    for (final drop in _drops) {
      // Each drop falls at its own speed; wraps from bottom back to top.
      final progress = (t * drop.speed + drop.offset) % 1.0;
      final x = drop.x * size.width + progress * size.height * math.tan(drop.angle);
      final y = progress * (size.height + drop.length);
      final dx = drop.length * math.sin(drop.angle);
      final dy = drop.length * math.cos(drop.angle);
      canvas.drawLine(
        Offset(x % size.width, y - drop.length),
        Offset((x + dx) % size.width, y - drop.length + dy),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_RainOverlay old) => old.t != t;
}

class _RainDrop {
  final double x;
  final double speed;
  final double offset;
  final double length;
  final double angle; // radians from vertical

  _RainDrop(math.Random rng)
      : x = rng.nextDouble(),
        speed = 0.4 + rng.nextDouble() * 0.6,
        offset = rng.nextDouble(),
        length = 12 + rng.nextDouble() * 16,
        angle = 0.8 + rng.nextDouble() * 0.4; // ~45–67° from vertical
}

// ── Snow overlay ──────────────────────────────────────────────────────────────

class _SnowOverlay extends CustomPainter {
  const _SnowOverlay({required this.t});
  final double t;

  static final _rng = math.Random(13);
  static final _flakes = List.generate(80, (i) => _Snowflake(_rng));

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withAlpha(180)
      ..style = PaintingStyle.fill;

    for (final flake in _flakes) {
      final progress = (t * flake.speed + flake.offset) % 1.0;
      final sway = math.sin(progress * math.pi * 2 * flake.swayFreq) *
          flake.swayAmplitude;
      final x = (flake.x * size.width + sway) % size.width;
      final y = progress * size.height;
      paint.color = Colors.white.withAlpha((flake.opacity * 255).round());
      canvas.drawCircle(Offset(x, y), flake.radius, paint);
    }
  }

  @override
  bool shouldRepaint(_SnowOverlay old) => old.t != t;
}

class _Snowflake {
  final double x;
  final double speed;
  final double offset;
  final double radius;
  final double opacity;
  final double swayFreq;
  final double swayAmplitude;

  _Snowflake(math.Random rng)
      : x = rng.nextDouble(),
        speed = 0.05 + rng.nextDouble() * 0.1,
        offset = rng.nextDouble(),
        radius = 1.5 + rng.nextDouble() * 3,
        opacity = 0.4 + rng.nextDouble() * 0.6,
        swayFreq = 0.5 + rng.nextDouble() * 1.5,
        swayAmplitude = 10 + rng.nextDouble() * 30;
}
