// P-15b: TV world map painter — equirectangular projection with slow pan
//
// Used by tv_ambient_screen.dart for the 'worldMap' screensaver mode.
// Draws simplified continental outlines, a lat/lon grid, and Islamic
// city markers (Makkah highlighted in gold).
//
// [panOffset] 0.0–1.0 maps to a full 360° longitudinal rotation so the
// globe appears to spin slowly over the 3-minute AnimationController.

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

// ─── Simplified continent outlines ───────────────────────────────────────────
//
// Each entry is a polygon of [longitude, latitude] degree pairs (WGS84 approx).
// Accuracy is intentionally low — just enough to be recognisable at TV distance.

const _kContinents = <List<List<double>>>[
  // North America
  [
    [-168, 72], [-141, 60], [-135, 58], [-124, 49], [-117, 32],
    [-105, 20], [-87, 16], [-77,  8], [-70, 12], [-60, 48],
    [-67, 47], [-70, 43], [-64, 44], [-53, 47], [-53, 56],
    [-67, 62], [-80, 63], [-85, 68], [-100, 73], [-120, 74],
    [-137, 70], [-141, 68], [-150, 70], [-160, 72], [-168, 72],
  ],
  // South America
  [
    [-80, 12], [-65,  5], [-50,  5], [-35,  -5], [-35, -10],
    [-40, -20], [-45, -25], [-48, -28], [-52, -33], [-58, -38],
    [-65, -42], [-68, -54], [-75, -54], [-78, -45], [-80, -38],
    [-75, -30], [-72, -18], [-80,  -5], [-80, 12],
  ],
  // Europe
  [
    [-10, 36], [  0, 36], [ 15, 38], [ 28, 38], [ 32, 40],
    [ 36, 42], [ 30, 48], [ 24, 58], [ 10, 60], [  5, 62],
    [ 28, 70], [ 20, 78], [ 10, 72], [ -5, 68], [-25, 65],
    [-24, 63], [-22, 64], [-10, 58], [ -5, 48], [ -8, 44],
    [ -8, 38], [-10, 36],
  ],
  // Africa
  [
    [-18, 16], [ -5,  8], [  5,  4], [ 10,  4], [ 15,  4],
    [ 30,  4], [ 42, 12], [ 50, 12], [ 44, 22], [ 37, 22],
    [ 37, 30], [ 25, 30], [ 25, 37], [ 10, 38], [  0, 36],
    [ -5, 28], [-17, 22], [-20, 16], [-18, 12], [-16, 10],
    [ -5,  0], [  0, -5], [ 10, -18], [ 20, -28], [ 28, -34],
    [ 32, -30], [ 40, -12], [ 44, -12], [ 50, 12], [ 42, 12],
    [ 30,  4], [  5,  0], [ -5,  4], [-10,  8], [-15, 12], [-18, 16],
  ],
  // Asia (major outline, excludes SE-Asian islands)
  [
    [ 26, 42], [ 36, 42], [ 42, 38], [ 50, 30], [ 55, 23],
    [ 68, 24], [ 72, 22], [ 80, 22], [ 88, 22], [ 92, 22],
    [100,  2], [104,  4], [108, 12], [120, 22], [122, 30],
    [120, 38], [128, 42], [130, 44], [140, 46], [140, 52],
    [150, 58], [160, 62], [168, 64], [170, 68], [160, 72],
    [130, 70], [120, 70], [100, 70], [ 80, 70], [ 60, 70],
    [ 42, 68], [ 36, 62], [ 28, 58], [ 24, 58], [ 28, 48],
    [ 26, 42],
  ],
  // Australia
  [
    [114, -22], [118, -20], [125, -14], [130, -12], [136, -12],
    [136, -16], [140, -18], [145, -18], [148, -22], [152, -26],
    [154, -28], [152, -34], [146, -38], [140, -38], [132, -34],
    [124, -34], [116, -34], [114, -28], [114, -22],
  ],
];

// ─── Islamic city markers ─────────────────────────────────────────────────────

const _kCities = <(double lng, double lat, String label, bool highlight)>[
  ( 39.8262,  21.4225, 'Makkah',    true),
  ( 39.6036,  24.4672, 'Madinah',   false),
  ( 35.2332,  31.7784, 'Jerusalem', false),
  ( 44.4009,  33.3406, 'Baghdad',   false),
  ( 36.3153,  33.5093, 'Damascus',  false),
  ( 31.2357,  30.0444, 'Cairo',     false),
  ( 28.9784,  41.0082, 'Istanbul',  false),
  (-73.9857,  40.7484, 'New York',  false),
  (  2.3522,  48.8566, 'Paris',     false),
  (103.8198,   1.3521, 'Singapore', false),
];

// ─── Painter ──────────────────────────────────────────────────────────────────

/// Equirectangular world map for the TV ambient screensaver.
///
/// [panOffset] 0.0–1.0: full 360° longitude rotation (360s animation).
/// [driftX]   small lateral drift for OLED burn-in prevention (normalised).
class TvWorldMapPainter extends CustomPainter {
  const TvWorldMapPainter({required this.panOffset, this.driftX = 0});

  final double panOffset;
  final double driftX;

  // Visible longitude field: show ±100° either side of centre longitude.
  static const _halfFov = 100.0;

  @override
  void paint(Canvas canvas, Size size) {
    final centerLng = panOffset * 360 - 180 + driftX * 40;

    final gridPaint = Paint()
      ..color = Colors.white.withAlpha(12)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.4;

    final fillPaint = Paint()
      ..color = PrayCalcColors.dark.withAlpha(90)
      ..style = PaintingStyle.fill;

    final strokePaint = Paint()
      ..color = PrayCalcColors.mid.withAlpha(160)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0
      ..strokeJoin = StrokeJoin.round;

    const goldColor = Color(0xFFD4A017);

    _drawGrid(canvas, size, centerLng, gridPaint);

    for (final outline in _kContinents) {
      _drawPolygon(canvas, size, outline, centerLng, fillPaint, strokePaint);
    }

    // City markers
    for (final (lng, lat, label, highlight) in _kCities) {
      final pt = _project(lng, lat, centerLng, size);
      if (pt == null) continue;

      final r = highlight ? 5.5 : 2.8;
      // Drop shadow
      canvas.drawCircle(pt, r + 1.5, Paint()..color = Colors.black.withAlpha(80));
      // Dot
      canvas.drawCircle(
        pt,
        r,
        Paint()
          ..color = highlight ? goldColor : goldColor.withAlpha(150)
          ..style = PaintingStyle.fill,
      );

      // Makkah label only
      if (highlight) {
        final tp = TextPainter(
          text: TextSpan(
            text: '  $label',
            style: TextStyle(
              color: goldColor.withAlpha(210),
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          textDirection: TextDirection.ltr,
        )..layout();
        tp.paint(canvas, pt.translate(5, -8));
      }
    }

    // Equator line (subtle)
    final equatorPaint = Paint()
      ..color = PrayCalcColors.mid.withAlpha(30)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.8;
    final equatorPath = Path();
    bool eq = false;
    for (int lng = -180; lng <= 180; lng += 3) {
      final pt = _project(lng.toDouble(), 0, centerLng, size);
      if (pt == null) { eq = false; continue; }
      if (!eq) { equatorPath.moveTo(pt.dx, pt.dy); eq = true; }
      else { equatorPath.lineTo(pt.dx, pt.dy); }
    }
    canvas.drawPath(equatorPath, equatorPaint);
  }

  void _drawGrid(Canvas canvas, Size size, double centerLng, Paint paint) {
    // Longitude lines every 30°
    for (int lng = -180; lng <= 180; lng += 30) {
      final path = Path();
      bool started = false;
      for (int lat = -90; lat <= 90; lat += 5) {
        final pt = _project(lng.toDouble(), lat.toDouble(), centerLng, size);
        if (pt == null) { started = false; continue; }
        if (!started) { path.moveTo(pt.dx, pt.dy); started = true; }
        else { path.lineTo(pt.dx, pt.dy); }
      }
      canvas.drawPath(path, paint);
    }
    // Latitude lines every 30°
    for (int lat = -60; lat <= 60; lat += 30) {
      if (lat == 0) continue; // drawn separately as equator
      final path = Path();
      bool started = false;
      for (int lng = -180; lng <= 180; lng += 3) {
        final pt = _project(lng.toDouble(), lat.toDouble(), centerLng, size);
        if (pt == null) { started = false; continue; }
        if (!started) { path.moveTo(pt.dx, pt.dy); started = true; }
        else { path.lineTo(pt.dx, pt.dy); }
      }
      canvas.drawPath(path, paint);
    }
  }

  void _drawPolygon(
    Canvas canvas,
    Size size,
    List<List<double>> coords,
    double centerLng,
    Paint fill,
    Paint stroke,
  ) {
    final path = Path();
    bool started = false;
    for (final c in coords) {
      final pt = _project(c[0], c[1], centerLng, size);
      if (pt == null) {
        started = false;
        continue;
      }
      if (!started) {
        path.moveTo(pt.dx, pt.dy);
        started = true;
      } else {
        path.lineTo(pt.dx, pt.dy);
      }
    }
    if (started) {
      path.close();
      canvas.drawPath(path, fill);
      canvas.drawPath(path, stroke);
    }
  }

  /// Project (lng, lat) → canvas Offset. Returns null when outside FOV.
  Offset? _project(double lng, double lat, double centerLng, Size size) {
    double dLng = lng - centerLng;
    while (dLng > 180) { dLng -= 360; }
    while (dLng < -180) { dLng += 360; }
    if (dLng.abs() > _halfFov) return null;

    final x = size.width / 2 + (dLng / _halfFov) * (size.width / 2);
    // Latitude: 90°N at top, 90°S at bottom — keep aspect proportional
    final y = size.height / 2 - (lat / 90) * (size.height / 2) * 0.7;
    return Offset(x, y);
  }

  @override
  bool shouldRepaint(TvWorldMapPainter old) =>
      old.panOffset != panOffset || old.driftX != driftX;
}
