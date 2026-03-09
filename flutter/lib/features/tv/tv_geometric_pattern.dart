// P-8: Islamic geometric pattern overlay
//
// A full-screen CustomPainter that renders one of two Islamic geometric
// patterns (moroccan star / girih) at configurable opacity and rotation.
// Slow continuous rotation gives ambient motion without distraction.
//
// Opacity guide:
//   prayer mode  → 8%
//   dhikr mode   → 25%
//   ambient mode → 40%

import 'dart:math' as math;

import 'package:flutter/material.dart';

// ─── Pattern enum ────────────────────────────────────────────────────────────

enum TvGeometricStyle { moroccanStar, girih }

// ─── Widget ─────────────────────────────────────────────────────────────────

/// Full-screen geometric pattern overlay.
///
/// [style]   — which pattern to draw.
/// [opacity] — 0.0..1.0 (caller controls context-appropriate level).
/// [child]   — content layered on top.
class TvGeometricPattern extends StatefulWidget {
  const TvGeometricPattern({
    super.key,
    required this.style,
    required this.opacity,
    this.child,
  });

  final TvGeometricStyle style;
  final double opacity;
  final Widget? child;

  @override
  State<TvGeometricPattern> createState() => _TvGeometricPatternState();
}

class _TvGeometricPatternState extends State<TvGeometricPattern>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    // One full rotation every 120 seconds.
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 120),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        AnimatedBuilder(
          animation: _ctrl,
          builder: (ctx, child) => Opacity(
            opacity: widget.opacity.clamp(0.0, 1.0),
            child: CustomPaint(
              painter: widget.style == TvGeometricStyle.moroccanStar
                  ? _MoroccanStarPainter(rotation: _ctrl.value * math.pi * 2)
                  : _GirihPainter(rotation: _ctrl.value * math.pi * 2),
            ),
          ),
        ),
        if (widget.child != null) widget.child!,
      ],
    );
  }
}

// ─── Moroccan 8-pointed star tiling ─────────────────────────────────────────

class _MoroccanStarPainter extends CustomPainter {
  const _MoroccanStarPainter({required this.rotation});
  final double rotation;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;

    // Cell size — enough to tile the screen with ~6 cells horizontally.
    final cell = size.width / 5.5;
    final cols = (size.width / cell).ceil() + 2;
    final rows = (size.height / cell).ceil() + 2;

    canvas.save();
    canvas.translate(size.width / 2, size.height / 2);
    canvas.rotate(rotation * 0.05); // very slow global rotation
    canvas.translate(-size.width / 2, -size.height / 2);

    for (int row = -1; row < rows; row++) {
      for (int col = -1; col < cols; col++) {
        final cx = (col + (row % 2) * 0.5) * cell;
        final cy = row * cell * (math.sqrt(3) / 2);
        _drawStar8(canvas, paint, Offset(cx, cy), cell * 0.45);
      }
    }

    canvas.restore();
  }

  /// Draw an 8-pointed Moroccan star centered at [center] with outer radius [r].
  void _drawStar8(Canvas canvas, Paint paint, Offset center, double r) {
    const points = 8;
    final inner = r * 0.38;
    final path = Path();

    for (int i = 0; i < points * 2; i++) {
      final angle = (i * math.pi / points) - math.pi / 2;
      final radius = i.isEven ? r : inner;
      final x = center.dx + radius * math.cos(angle);
      final y = center.dy + radius * math.sin(angle);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_MoroccanStarPainter old) => old.rotation != rotation;
}

// ─── Girih tiling (pentagons + decagons) ────────────────────────────────────

class _GirihPainter extends CustomPainter {
  const _GirihPainter({required this.rotation});
  final double rotation;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final cell = size.width / 4.0;

    canvas.save();
    canvas.translate(size.width / 2, size.height / 2);
    canvas.rotate(rotation * 0.04);
    canvas.translate(-size.width / 2, -size.height / 2);

    final cols = (size.width / cell).ceil() + 2;
    final rows = (size.height / cell).ceil() + 2;

    for (int row = -1; row < rows; row++) {
      for (int col = -1; col < cols; col++) {
        final cx = col * cell + (row.isOdd ? cell * 0.5 : 0);
        final cy = row * cell * 0.866;

        // Alternate between 10-sided and 5-sided girih tiles.
        if ((row + col) % 3 == 0) {
          _drawPolygon(canvas, paint, Offset(cx, cy), cell * 0.46, 10,
              math.pi / 10);
        } else {
          _drawPolygon(canvas, paint, Offset(cx, cy), cell * 0.38, 5,
              -math.pi / 2);
          // Inner star lines for the pentagon girih tile.
          _drawStar5(canvas, paint, Offset(cx, cy), cell * 0.38);
        }
      }
    }

    canvas.restore();
  }

  void _drawPolygon(Canvas canvas, Paint paint, Offset center, double r,
      int sides, double startAngle) {
    final path = Path();
    for (int i = 0; i <= sides; i++) {
      final angle = startAngle + i * 2 * math.pi / sides;
      final x = center.dx + r * math.cos(angle);
      final y = center.dy + r * math.sin(angle);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    canvas.drawPath(path, paint);
  }

  void _drawStar5(Canvas canvas, Paint paint, Offset center, double r) {
    // 5-pointed inner star (girih accent lines).
    const sides = 5;
    final inner = r * 0.45;
    final path = Path();
    for (int i = 0; i < sides * 2; i++) {
      final angle = (i * math.pi / sides) - math.pi / 2;
      final radius = i.isEven ? r * 0.55 : inner;
      final x = center.dx + radius * math.cos(angle);
      final y = center.dy + radius * math.sin(angle);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_GirihPainter old) => old.rotation != rotation;
}
