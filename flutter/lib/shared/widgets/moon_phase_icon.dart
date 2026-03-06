import 'package:flutter/material.dart';
import 'package:hijri/hijri_calendar.dart';

/// Monochrome moon phase icon that renders the correct lunar crescent/disc
/// based on the current Hijri calendar day.
///
/// Inherits its color from [IconTheme] so it automatically adapts to the
/// selected / unselected state set by [NavigationBar].
class MoonPhaseNavIcon extends StatelessWidget {
  const MoonPhaseNavIcon({super.key});

  @override
  Widget build(BuildContext context) {
    final color =
        IconTheme.of(context).color ?? Theme.of(context).colorScheme.onSurface;
    final hijriDay = _currentHijriDay();
    return SizedBox(
      width: 24,
      height: 24,
      child: CustomPaint(
        painter: _MoonPhasePainter(hijriDay: hijriDay, color: color),
      ),
    );
  }

  static int _currentHijriDay() {
    try {
      return HijriCalendar.now().hDay;
    } catch (_) {
      return 15; // fallback: full moon
    }
  }
}

/// Draws a monochrome moon phase silhouette using two-circle composition.
///
/// The lit area = moon_circle − dark_circle, where the dark circle of equal
/// radius moves from the moon centre (new moon, fully dark) to 2r away
/// (full moon, fully lit). Waning phases mirror horizontally.
class _MoonPhasePainter extends CustomPainter {
  const _MoonPhasePainter({required this.hijriDay, required this.color});

  final int hijriDay;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final r = size.shortestSide / 2;
    final center = Offset(size.width / 2, size.height / 2);

    // Dim background disc (the unlit side).
    canvas.drawCircle(center, r, Paint()..color = color.withAlpha(40));

    // Map Hijri day (1–30) → phase fraction (0 = new, 0.5 = full, 1 = new).
    final phase = (hijriDay - 1) / 30.0;
    final isWaxing = phase <= 0.5;
    // halfPhase: 0 = new moon, 1 = full moon.
    final halfPhase = isWaxing ? phase * 2.0 : (1.0 - phase) * 2.0;

    // Dark-side circle centre: at new moon it coincides with the moon (fully
    // dark); at full moon it has moved 2r away (no overlap = fully lit).
    // darkDx = r * 2 * halfPhase  →  0 (new) … 2r (full).
    final darkDx = r * 2.0 * halfPhase;
    // Waxing: dark side is to the left.  Waning: mirrored to the right.
    final darkCenter = isWaxing
        ? Offset(center.dx - darkDx, center.dy)
        : Offset(center.dx + darkDx, center.dy);

    final moonPath = Path()
      ..addOval(Rect.fromCircle(center: center, radius: r));
    final darkPath = Path()
      ..addOval(Rect.fromCircle(center: darkCenter, radius: r));

    final litPath = Path.combine(PathOperation.difference, moonPath, darkPath);
    canvas.drawPath(litPath, Paint()..color = color);
  }

  @override
  bool shouldRepaint(_MoonPhasePainter old) =>
      old.hijriDay != hijriDay || old.color != color;
}
