// praycalc/flutter/lib/shared/widgets/progress_arc.dart
// ProgressArc — circular countdown arc used by Watch complications, widget bg, Live Activity.
// Spec §4.2, S19-C T16
//
// Usage:
//   ProgressArc(progress: 0.65)
//   ProgressArc(progress: 0.3, color: Colors.amber, strokeWidth: 6)

import 'dart:math' as math;
import 'package:flutter/material.dart';

/// A circular progress arc drawn from top (12 o'clock) clockwise.
///
/// [progress] — 0.0 (empty) to 1.0 (full circle).
/// [color] — arc color; defaults to #79C24C (PrayCalc green-mid).
/// [trackColor] — background track color; defaults to color with 20% opacity.
/// [strokeWidth] — arc stroke width in logical pixels; defaults to 4.
/// [child] — optional widget to center inside the arc (e.g. text, icon).
class ProgressArc extends StatelessWidget {
  final double progress;
  final Color color;
  final Color? trackColor;
  final double strokeWidth;
  final Widget? child;

  const ProgressArc({
    super.key,
    required this.progress,
    this.color = const Color(0xFF79C24C),
    this.trackColor,
    this.strokeWidth = 4.0,
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveTrack = trackColor ?? color.withAlpha(51); // 20% opacity
    return Semantics(
      label: 'Prayer progress ${(progress * 100).round()}%',
      excludeSemantics: true,
      child: CustomPaint(
        painter: _ArcPainter(
          progress: progress.clamp(0.0, 1.0),
          color: color,
          trackColor: effectiveTrack,
          strokeWidth: strokeWidth,
        ),
        child: child,
      ),
    );
  }
}

class _ArcPainter extends CustomPainter {
  final double progress;
  final Color color;
  final Color trackColor;
  final double strokeWidth;

  const _ArcPainter({
    required this.progress,
    required this.color,
    required this.trackColor,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (math.min(size.width, size.height) - strokeWidth) / 2;

    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final arcPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final rect = Rect.fromCircle(center: center, radius: radius);
    const startAngle = -math.pi / 2; // 12 o'clock

    // Track (full circle)
    canvas.drawArc(rect, 0, 2 * math.pi, false, trackPaint);

    // Progress arc
    if (progress > 0) {
      canvas.drawArc(
        rect,
        startAngle,
        2 * math.pi * progress,
        false,
        arcPaint,
      );
    }
  }

  @override
  bool shouldRepaint(_ArcPainter oldDelegate) =>
      oldDelegate.progress != progress ||
      oldDelegate.color != color ||
      oldDelegate.strokeWidth != strokeWidth;
}
