import 'package:flutter/material.dart';

/// Pulsing ambient ring shown behind the countdown when a prayer is near.
///
/// Shows amber ring ≤15 min, switches to green ≤5 min.
/// Hidden entirely when [enabled] is false or [remaining] > 15 min.
class BreathingRing extends StatefulWidget {
  const BreathingRing({
    super.key,
    required this.remaining,
    required this.enabled,
  });

  final Duration remaining;
  final bool enabled;

  @override
  State<BreathingRing> createState() => _BreathingRingState();
}

class _BreathingRingState extends State<BreathingRing>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );
    _opacity = Tween<double>(begin: 0.0, end: 0.4).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
    _updateAnimation();
  }

  @override
  void didUpdateWidget(BreathingRing old) {
    super.didUpdateWidget(old);
    if (old.enabled != widget.enabled ||
        old.remaining.inMinutes != widget.remaining.inMinutes) {
      _updateAnimation();
    }
  }

  void _updateAnimation() {
    final mins = widget.remaining.inMinutes;
    if (!widget.enabled || mins > 15) {
      _ctrl.stop();
      _ctrl.value = 0;
    } else if (!_ctrl.isAnimating) {
      _ctrl.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enabled || widget.remaining.inMinutes > 15) {
      return const SizedBox.shrink();
    }
    // Green ≤5 min (prayer imminent), amber ≤15 min (approaching)
    final color = widget.remaining.inMinutes <= 5
        ? const Color(0xFFC9F27A) // brand light green
        : const Color(0xFFFFB347); // amber

    return AnimatedBuilder(
      animation: _opacity,
      builder: (_, _) => CustomPaint(
        painter: _RingPainter(color: color, opacity: _opacity.value),
        size: Size.infinite,
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  const _RingPainter({required this.color, required this.opacity});

  final Color color;
  final double opacity;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.shortestSide * 0.45;
    final paint = Paint()
      ..color = color.withValues(alpha: opacity)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
    canvas.drawCircle(center, radius, paint);
  }

  @override
  bool shouldRepaint(_RingPainter old) =>
      old.opacity != opacity || old.color != color;
}
