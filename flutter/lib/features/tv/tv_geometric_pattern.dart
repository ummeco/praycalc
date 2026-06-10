// P-8 + P-8b: Islamic geometric pattern overlay
//
// A full-screen CustomPainter that renders one of five Islamic geometric
// patterns at configurable opacity and rotation:
//   moroccanStar — classic 8-pointed Moroccan star tiling
//   girih        — pentagons + decagons (Persian girih tiles)
//   muqarnas     — honeycomb stalactite cell grid (P-8b)
//   kufic        — square Kufic script grid (P-8b)
//   isometric    — isometric hexagonal lattice (P-8b)
//
// Opacity guide:
//   prayer mode  → 8%
//   dhikr mode   → 25%
//   ambient mode → 40%

import 'dart:math' as math;

import 'package:flutter/material.dart';

// ─── Pattern enum ────────────────────────────────────────────────────────────

// P-8b: muqarnas, kufic, isometric added
enum TvGeometricStyle { moroccanStar, girih, muqarnas, kufic, isometric }

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
              painter: switch (widget.style) {
                TvGeometricStyle.moroccanStar =>
                  _MoroccanStarPainter(rotation: _ctrl.value * math.pi * 2),
                TvGeometricStyle.girih =>
                  _GirihPainter(rotation: _ctrl.value * math.pi * 2),
                TvGeometricStyle.muqarnas =>
                  _MuqarnasPainter(rotation: _ctrl.value * math.pi * 2),
                TvGeometricStyle.kufic =>
                  _KuficPainter(rotation: _ctrl.value * math.pi * 2),
                TvGeometricStyle.isometric =>
                  _IsometricPainter(rotation: _ctrl.value * math.pi * 2),
              },
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

// ─── P-8b: Muqarnas honeycomb tiling ─────────────────────────────────────────
//
// Muqarnas are the stalactite vaulting cells found in Moorish and Persian
// architecture (Alhambra, Shah Mosque). This painter approximates the look
// with a honeycomb of hexagonal cells, each sub-divided by three inner lines
// radiating from the centre, mimicking the faceted stalactite cross-section.

class _MuqarnasPainter extends CustomPainter {
  const _MuqarnasPainter({required this.rotation});
  final double rotation;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final cell = size.width / 6.0;
    final hexH = cell * math.sqrt(3) / 2;
    final cols = (size.width / cell).ceil() + 3;
    final rows = (size.height / hexH).ceil() + 3;

    canvas.save();
    canvas.translate(size.width / 2, size.height / 2);
    canvas.rotate(rotation * 0.03);
    canvas.translate(-size.width / 2, -size.height / 2);

    for (int row = -1; row < rows; row++) {
      for (int col = -1; col < cols; col++) {
        final cx = col * cell * 1.5;
        final cy = row * hexH * 2 + (col.isOdd ? hexH : 0);
        _drawMuqarnasCell(canvas, paint, Offset(cx, cy), cell * 0.88);
      }
    }

    canvas.restore();
  }

  /// Flat-top hexagon with three inner radial strokes (stalactite facets).
  void _drawMuqarnasCell(
      Canvas canvas, Paint paint, Offset centre, double r) {
    final path = Path();
    for (int i = 0; i < 6; i++) {
      final angle = i * math.pi / 3;
      final x = centre.dx + r * math.cos(angle);
      final y = centre.dy + r * math.sin(angle);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(path, paint);

    // Three inner lines at 60° intervals — muqarnas facet lines
    for (int i = 0; i < 3; i++) {
      final angle = i * 2 * math.pi / 3;
      canvas.drawLine(
        centre,
        Offset(
          centre.dx + r * 0.5 * math.cos(angle),
          centre.dy + r * 0.5 * math.sin(angle),
        ),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_MuqarnasPainter old) => old.rotation != rotation;
}

// ─── P-8b: Square Kufic grid ──────────────────────────────────────────────────
//
// Square (Banna'i) Kufic is a rectilinear calligraphic style where Arabic
// letters are composed entirely from horizontal and vertical strokes on a
// square grid. This painter renders a repeating grid of stylised Kufic
// square motifs — stepped-cross shapes that tile seamlessly.

class _KuficPainter extends CustomPainter {
  const _KuficPainter({required this.rotation});
  final double rotation;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.1;

    final cell = size.width / 7.0;
    final cols = (size.width / cell).ceil() + 2;
    final rows = (size.height / cell).ceil() + 2;

    canvas.save();
    canvas.translate(size.width / 2, size.height / 2);
    canvas.rotate(rotation * 0.02);
    canvas.translate(-size.width / 2, -size.height / 2);

    for (int row = -1; row < rows; row++) {
      for (int col = -1; col < cols; col++) {
        final cx = col * cell;
        final cy = row * cell;
        _drawKuficCell(canvas, paint, Offset(cx, cy), cell);
      }
    }

    canvas.restore();
  }

  /// Stepped-cross Kufic motif centred at [centre] in a [cell]-sized square.
  void _drawKuficCell(
      Canvas canvas, Paint paint, Offset centre, double cell) {
    final u = cell / 6; // unit — 1/6th of cell
    final cx = centre.dx;
    final cy = centre.dy;

    // Outer square
    canvas.drawRect(
      Rect.fromCenter(center: centre, width: cell * 0.9, height: cell * 0.9),
      paint,
    );

    // Inner stepped cross (Banna'i motif)
    final path = Path()
      // Top arm
      ..moveTo(cx - u, cy - 3 * u)
      ..lineTo(cx + u, cy - 3 * u)
      ..lineTo(cx + u, cy - u)
      ..lineTo(cx + 3 * u, cy - u)
      ..lineTo(cx + 3 * u, cy + u)
      ..lineTo(cx + u, cy + u)
      ..lineTo(cx + u, cy + 3 * u)
      ..lineTo(cx - u, cy + 3 * u)
      ..lineTo(cx - u, cy + u)
      ..lineTo(cx - 3 * u, cy + u)
      ..lineTo(cx - 3 * u, cy - u)
      ..lineTo(cx - u, cy - u)
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_KuficPainter old) => old.rotation != rotation;
}

// ─── P-8b: Isometric hexagonal lattice ───────────────────────────────────────
//
// An isometric projection of a three-dimensional cube lattice — the same
// visual language used in Moroccan Zellij tilework when viewed from above.
// Each cell is a regular hexagon divided into three rhombuses by three
// diagonal lines from centre to alternate vertices, giving the 3D cube illusion.

class _IsometricPainter extends CustomPainter {
  const _IsometricPainter({required this.rotation});
  final double rotation;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.9;

    final r = size.width / 7.0;
    final hexW = r * 2;
    final hexH = r * math.sqrt(3);
    final cols = (size.width / hexW).ceil() + 3;
    final rows = (size.height / hexH).ceil() + 3;

    canvas.save();
    canvas.translate(size.width / 2, size.height / 2);
    canvas.rotate(rotation * 0.025);
    canvas.translate(-size.width / 2, -size.height / 2);

    for (int row = -1; row < rows; row++) {
      for (int col = -1; col < cols; col++) {
        final cx = col * hexW * 0.75;
        final cy = row * hexH + (col.isOdd ? hexH / 2 : 0);
        _drawIsometricCell(canvas, paint, Offset(cx, cy), r);
      }
    }

    canvas.restore();
  }

  /// Pointy-top hexagon with three internal cube-face diagonals.
  void _drawIsometricCell(
      Canvas canvas, Paint paint, Offset centre, double r) {
    final verts = List.generate(6, (i) {
      final angle = i * math.pi / 3 - math.pi / 6;
      return Offset(
        centre.dx + r * math.cos(angle),
        centre.dy + r * math.sin(angle),
      );
    });

    // Outer hexagon
    final hex = Path()..moveTo(verts[0].dx, verts[0].dy);
    for (final v in verts.skip(1)) {
      hex.lineTo(v.dx, v.dy);
    }
    hex.close();
    canvas.drawPath(hex, paint);

    // Three internal lines: centre → vertex 0, 2, 4 (isometric cube edges)
    for (final idx in [0, 2, 4]) {
      canvas.drawLine(centre, verts[idx], paint);
    }
  }

  @override
  bool shouldRepaint(_IsometricPainter old) => old.rotation != rotation;
}
