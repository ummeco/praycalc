// HomeMoonIcon — displays the current moon phase as a CustomPainter crescent.
//
// Tapping navigates to the Hijri calendar / moon screen.
// Moon phase is calculated from the Julian date using the 29.53-day lunar cycle.

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/app_router.dart';

// ── Moon phase calculation ────────────────────────────────────────────────────

/// Returns a value 0.0–1.0 representing the moon phase.
/// 0.0 = new moon, 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter.
double getMoonPhase(DateTime date) {
  // Known new moon reference: 2000-01-06 (Julian Day 2451549.5)
  const knownNewMoonJD = 2451549.5;
  const synodicMonth = 29.53058867;

  final jd = _julianDay(date);
  final daysSinceNew = jd - knownNewMoonJD;
  final phase = (daysSinceNew % synodicMonth) / synodicMonth;
  return phase < 0 ? phase + 1 : phase;
}

double _julianDay(DateTime date) {
  final y = date.year;
  final m = date.month;
  final d = date.day + date.hour / 24.0;

  final a = ((14 - m) / 12).floor();
  final yy = y + 4800 - a;
  final mm = m + 12 * a - 3;

  return d +
      ((153 * mm + 2) / 5).floor() +
      365 * yy +
      (yy / 4).floor() -
      (yy / 100).floor() +
      (yy / 400).floor() -
      32045;
}

// ── Widget ────────────────────────────────────────────────────────────────────

class HomeMoonIcon extends StatelessWidget {
  const HomeMoonIcon({super.key, this.size = 36});

  final double size;

  @override
  Widget build(BuildContext context) {
    final phase = getMoonPhase(DateTime.now());

    return GestureDetector(
      onTap: () => context.go(Routes.moon),
      child: SizedBox(
        width: size,
        height: size,
        child: CustomPaint(
          painter: _MoonPhasePainter(phase: phase),
        ),
      ),
    );
  }
}

// ── Moon phase painter ────────────────────────────────────────────────────────

class _MoonPhasePainter extends CustomPainter {
  const _MoonPhasePainter({required this.phase});

  /// 0.0 = new moon, 0.5 = full moon, 1.0 = new moon again.
  final double phase;

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = math.min(cx, cy) - 1;

    final moonPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = const Color(0xFFF5E6C8); // warm cream

    final shadowPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = const Color(0xFF0D2F17).withAlpha(230); // dark green shadow

    final borderPaint = Paint()
      ..style = PaintingStyle.stroke
      ..color = Colors.white.withAlpha(80)
      ..strokeWidth = 1;

    // Draw full illuminated circle
    canvas.drawCircle(Offset(cx, cy), r, moonPaint);

    // Overlay shadow to represent the unlit portion.
    // Phase 0 = new (all shadow), 0.5 = full (no shadow).
    // For waxing (0–0.5): shadow on left side, illuminated on right.
    // For waning (0.5–1): shadow on right side, illuminated on left.
    final normPhase = phase <= 0.5 ? phase * 2 : (phase - 0.5) * 2;
    // normPhase: 0=new, 1=full (for each half-cycle)

    final path = Path();
    if (phase < 0.5) {
      // Waxing: right side illuminated, shadow arc covers left + ellipse on right
      path.addOval(Rect.fromCircle(center: Offset(cx, cy), radius: r));
      // Ellipse on illuminated side: x-radius shrinks from r (new) to 0 (quarter) to r (full)
      final ex = r * (1 - normPhase * 2).abs();
      if (normPhase < 0.5) {
        // New → first quarter: shadow still covers most
        final ellipseRect = Rect.fromCenter(
          center: Offset(cx, cy),
          width: ex * 2,
          height: r * 2,
        );
        path.addOval(ellipseRect);
      }
    } else {
      // Waning: left side illuminated
      path.addOval(Rect.fromCircle(center: Offset(cx, cy), radius: r));
      final ex = r * (normPhase * 2 - 1).abs();
      if (normPhase > 0.5) {
        final ellipseRect = Rect.fromCenter(
          center: Offset(cx, cy),
          width: ex * 2,
          height: r * 2,
        );
        path.addOval(ellipseRect);
      }
    }

    // Use a simpler but reliable approach: draw shadow as a clip path.
    // The shadow covers the fraction (1 - illumination) of the disc.
    // Illumination: 0 at new moon, 1 at full, 0 at new again.
    final illumination = phase <= 0.5 ? phase * 2 : 2 - phase * 2;
    _paintPhase(canvas, Offset(cx, cy), r, illumination, shadowPaint, phase);

    // Border
    canvas.drawCircle(Offset(cx, cy), r, borderPaint);
  }

  void _paintPhase(Canvas canvas, Offset center, double r,
      double illumination, Paint shadowPaint, double phase) {
    // Ellipse x-radius for the terminator:
    //   illumination 0 → ex = r (shadow ellipse = disc, all dark)
    //   illumination 1 → ex = r (light ellipse = disc, all bright)
    //   illumination 0.5 → ex = 0 (straight terminator line)
    final ex = r * (1 - illumination * 2).abs();
    final waxing = phase < 0.5;

    final clipPath = Path();

    if (waxing) {
      // Shadow = left semicircle + ellipse on the right
      // Left semicircle (shadow)
      clipPath.moveTo(center.dx, center.dy - r);
      clipPath.arcTo(
        Rect.fromCircle(center: center, radius: r),
        -math.pi / 2,
        math.pi,
        false,
      );
      clipPath.close();
      // Subtract or add ellipse depending on illumination
      if (illumination < 0.5) {
        // Dark: shadow ellipse on lit side reduces light
        clipPath.addOval(Rect.fromCenter(
            center: center, width: ex * 2, height: r * 2));
      }
    } else {
      // Waning: shadow on right
      clipPath.moveTo(center.dx, center.dy - r);
      clipPath.arcTo(
        Rect.fromCircle(center: center, radius: r),
        math.pi / 2,
        math.pi,
        false,
      );
      clipPath.close();
      if (illumination < 0.5) {
        clipPath.addOval(Rect.fromCenter(
            center: center, width: ex * 2, height: r * 2));
      }
    }

    canvas.save();
    canvas.clipPath(
        Path()..addOval(Rect.fromCircle(center: center, radius: r)));
    canvas.drawPath(clipPath, shadowPaint);
    canvas.restore();
  }

  @override
  bool shouldRepaint(_MoonPhasePainter old) => old.phase != phase;
}
