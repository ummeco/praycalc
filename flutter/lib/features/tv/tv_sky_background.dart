// P-1: Sky gradient background
//
// A full-screen background that shifts through 6 time-of-day gradient bands
// and overlays a star-field at night with subtle twinkling. A slow "breathing"
// opacity animation gives the sky a living feel.
//
// The widget is stateful so it can drive its own animation controllers
// independently of the home-screen ticker.

import 'dart:math' as math;

import 'package:flutter/material.dart';

// ─── Time band definitions ───────────────────────────────────────────────────

/// A single time band with the hour range and gradient colors.
class _Band {
  final double startH; // fractional hour (0–24)
  final double endH;
  final List<Color> colors; // top → bottom

  const _Band(this.startH, this.endH, this.colors);
}

// Six bands covering a full day.
const _kBands = [
  // Pre-dawn (Fajr window) — deep indigo → purple
  _Band(0, 5, [Color(0xFF0D0B2A), Color(0xFF1A1040), Color(0xFF2B1255)]),
  // Dawn / sunrise — warm purple → orange → light blue
  _Band(5, 7, [Color(0xFF2B1255), Color(0xFFB05230), Color(0xFF7DB8E8)]),
  // Morning — pale blue sky
  _Band(7, 12, [Color(0xFF4A90D9), Color(0xFF87CEEB), Color(0xFFD4EDFF)]),
  // Midday / afternoon — bright azure
  _Band(12, 16, [Color(0xFF1565C0), Color(0xFF42A5F5), Color(0xFFBBDEFB)]),
  // Late afternoon / Asr-Maghrib — amber horizon
  _Band(16, 20, [Color(0xFF4A2C0A), Color(0xFFE07B39), Color(0xFFFFD180)]),
  // Evening / Isha night — dark navy
  _Band(20, 24, [Color(0xFF050A1A), Color(0xFF0D1B3E), Color(0xFF0D2F17)]),
];

// ─── Star data ──────────────────────────────────────────────────────────────

class _Star {
  final double x; // 0..1 normalized
  final double y;
  final double radius;
  final double twinklePhase; // random offset so stars don't all pulse together
  final double twinkleSpeed; // cycles per second

  const _Star({
    required this.x,
    required this.y,
    required this.radius,
    required this.twinklePhase,
    required this.twinkleSpeed,
  });
}

List<_Star> _generateStars(int count, math.Random rng) {
  return List.generate(count, (_) {
    return _Star(
      x: rng.nextDouble(),
      y: rng.nextDouble() * 0.65, // stars in upper 65% of sky
      radius: 0.5 + rng.nextDouble() * 1.5,
      twinklePhase: rng.nextDouble() * math.pi * 2,
      twinkleSpeed: 0.3 + rng.nextDouble() * 0.7,
    );
  });
}

// ─── Widget ─────────────────────────────────────────────────────────────────

/// Full-screen sky gradient + star-field background.
///
/// [hour] — current fractional hour (e.g. 22.5 for 10:30 PM).
/// [child] — content to display on top.
class TvSkyBackground extends StatefulWidget {
  const TvSkyBackground({
    super.key,
    required this.hour,
    required this.child,
  });

  final double hour;
  final Widget child;

  @override
  State<TvSkyBackground> createState() => _TvSkyBackgroundState();
}

class _TvSkyBackgroundState extends State<TvSkyBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  /// Breathing animation: 0 → 1 → 0 over 8 seconds.
  late Animation<double> _breathe;

  final math.Random _rng = math.Random(42); // fixed seed = stable stars
  late final List<_Star> _stars;

  @override
  void initState() {
    super.initState();
    _stars = _generateStars(200, _rng);
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat(reverse: true);
    _breathe = CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (ctx, child) {
        final colors = _gradientColors(widget.hour);
        final starAlpha = _starAlpha(widget.hour);
        return Stack(
          fit: StackFit.expand,
          children: [
            // Sky gradient with breathing opacity variation.
            Opacity(
              opacity: 0.92 + _breathe.value * 0.08,
              child: _GradientPainterWidget(colors: colors),
            ),
            // Star-field overlay (only visible at night/dawn).
            if (starAlpha > 0)
              CustomPaint(
                painter: _StarPainter(
                  stars: _stars,
                  alpha: starAlpha,
                  time: _ctrl.value,
                ),
              ),
            // Content on top.
            child!,
          ],
        );
      },
      child: widget.child,
    );
  }

  /// Interpolated gradient colors for the current [hour].
  List<Color> _gradientColors(double hour) {
    final h = hour % 24;
    // Find which band we're in.
    for (int i = 0; i < _kBands.length; i++) {
      final band = _kBands[i];
      if (h >= band.startH && h < band.endH) {
        // Interpolate toward next band in the last 20% of this band.
        final span = band.endH - band.startH;
        final progress = (h - band.startH) / span;
        if (progress > 0.8) {
          final next = _kBands[(i + 1) % _kBands.length];
          final t = (progress - 0.8) / 0.2;
          return List.generate(
            band.colors.length,
            (j) => Color.lerp(band.colors[j], next.colors[j], t)!,
          );
        }
        return band.colors;
      }
    }
    return _kBands.last.colors;
  }

  /// Star opacity: 1.0 at full night, fading out by dawn/dusk.
  double _starAlpha(double hour) {
    final h = hour % 24;
    if (h >= 20 || h < 5) return 1.0; // night / pre-dawn
    if (h < 7) return 1.0 - (h - 5) / 2.0; // dawn fade-out
    if (h >= 18 && h < 20) return (h - 18) / 2.0; // dusk fade-in
    return 0.0; // daytime
  }
}

// ─── Gradient background widget ─────────────────────────────────────────────

class _GradientPainterWidget extends StatelessWidget {
  const _GradientPainterWidget({required this.colors});
  final List<Color> colors;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: colors,
        ),
      ),
    );
  }
}

// ─── Star painter ────────────────────────────────────────────────────────────

class _StarPainter extends CustomPainter {
  const _StarPainter({
    required this.stars,
    required this.alpha,
    required this.time, // 0..1 from AnimationController
  });

  final List<_Star> stars;
  final double alpha; // 0..1
  final double time;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    for (final star in stars) {
      // Twinkling: oscillate opacity between 40% and 100%.
      final twinkle = (math.sin(
                  time * math.pi * 2 * star.twinkleSpeed + star.twinklePhase) +
              1) /
          2; // 0..1
      final starOpacity = alpha * (0.4 + twinkle * 0.6);

      paint.color = Colors.white.withValues(alpha: starOpacity);
      canvas.drawCircle(
        Offset(star.x * size.width, star.y * size.height),
        star.radius,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_StarPainter old) =>
      old.time != time || old.alpha != alpha;
}

// ─── Convenience extension on PrayCalcColors ────────────────────────────────

/// Whether the current hour is in daytime (sky is light).
bool isTvDaytime(double hour) {
  final h = hour % 24;
  return h >= 7 && h < 18;
}
