// DhikrFlowScreen — guided post-salah dhikr counter.
//
// Phases: SubhanAllah (33×) → Alhamdulillah (33×) → Allahu Akbar (33×) → Done.
// Full-screen tap to increment. Auto-advances at 33. Haptic on each tap.
// Route: '/dhikr-flow'

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'dhikr_flow_service.dart';

// ── Dhikr phase data ──────────────────────────────────────────────────────────

class _Phase {
  final String arabic;
  final String transliteration;
  final int target;

  const _Phase({
    required this.arabic,
    required this.transliteration,
    required this.target,
  });
}

const _kPhases = [
  _Phase(
    arabic: 'سُبْحَانَ اللهِ',
    transliteration: 'SubhanAllah',
    target: 33,
  ),
  _Phase(
    arabic: 'الْحَمْدُ لِلهِ',
    transliteration: 'Alhamdulillah',
    target: 33,
  ),
  _Phase(
    arabic: 'اللهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    target: 33,
  ),
];

// ── Screen ────────────────────────────────────────────────────────────────────

class DhikrFlowScreen extends StatefulWidget {
  const DhikrFlowScreen({super.key});

  @override
  State<DhikrFlowScreen> createState() => _DhikrFlowScreenState();
}

class _DhikrFlowScreenState extends State<DhikrFlowScreen>
    with TickerProviderStateMixin {
  int _phaseIdx = 0;
  int _count = 0;
  bool _done = false;

  late AnimationController _celebCtrl;
  late Animation<double> _celebOpacity;

  @override
  void initState() {
    super.initState();
    _celebCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    );
    _celebOpacity = TweenSequence<double>([
      TweenSequenceItem(
          tween: Tween(begin: 0.0, end: 1.0)
              .chain(CurveTween(curve: Curves.easeIn)),
          weight: 20),
      TweenSequenceItem(tween: ConstantTween(1.0), weight: 60),
      TweenSequenceItem(
          tween: Tween(begin: 1.0, end: 0.0)
              .chain(CurveTween(curve: Curves.easeOut)),
          weight: 20),
    ]).animate(_celebCtrl);
  }

  @override
  void dispose() {
    _celebCtrl.dispose();
    super.dispose();
  }

  void _increment() {
    if (_done) return;
    HapticFeedback.lightImpact();
    final phase = _kPhases[_phaseIdx];
    final newCount = _count + 1;
    if (newCount >= phase.target) {
      if (_phaseIdx < _kPhases.length - 1) {
        // Advance to next phase.
        setState(() {
          _phaseIdx++;
          _count = 0;
        });
      } else {
        // All phases complete.
        _completeDhikr();
      }
    } else {
      setState(() => _count = newCount);
    }
  }

  Future<void> _completeDhikr() async {
    setState(() => _done = true);
    await DhikrFlowService.instance.recordDhikrSession('post-prayer');
    _celebCtrl.forward();
    await Future.delayed(const Duration(milliseconds: 3200));
    if (mounted) Navigator.of(context).pop();
  }

  void _skip() => Navigator.of(context).pop();

  @override
  Widget build(BuildContext context) {
    final phase = _done ? _kPhases.last : _kPhases[_phaseIdx];
    final target = phase.target;
    final progress = _done ? 1.0 : (_count / target).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: const Color(0xFF0D2F17),
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _increment,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Main content
            SafeArea(
              child: Column(
                children: [
                  // Skip button
                  Align(
                    alignment: Alignment.topRight,
                    child: TextButton(
                      onPressed: _skip,
                      child: Text(
                        'Skip',
                        style: TextStyle(
                          color: Colors.white.withAlpha(140),
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),

                  const Spacer(),

                  // Arabic text
                  Text(
                    phase.arabic,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 56,
                      color: Colors.white,
                      fontFamily: 'Amiri',
                      height: 1.4,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Transliteration
                  Text(
                    phase.transliteration,
                    style: TextStyle(
                      fontSize: 24,
                      color: Colors.white.withAlpha(180),
                      letterSpacing: 0.5,
                    ),
                  ),

                  const SizedBox(height: 48),

                  // Circular progress ring + counter
                  SizedBox(
                    width: 160,
                    height: 160,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox.expand(
                          child: CircularProgressIndicator(
                            value: progress,
                            strokeWidth: 8,
                            backgroundColor: Colors.white.withAlpha(25),
                            valueColor: const AlwaysStoppedAnimation<Color>(
                              Color(0xFF79C24C),
                            ),
                          ),
                        ),
                        Text(
                          _done ? '✓' : '$_count / $target',
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Phase indicator dots
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_kPhases.length, (i) {
                      final isActive = i == _phaseIdx;
                      final isDone = i < _phaseIdx || _done;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 5),
                        width: isActive ? 24 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(4),
                          color: isDone || isActive
                              ? const Color(0xFF79C24C)
                              : Colors.white.withAlpha(40),
                        ),
                      );
                    }),
                  ),

                  const Spacer(),

                  Text(
                    'Tap anywhere to count',
                    style: TextStyle(
                      color: Colors.white.withAlpha(60),
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),

            // Celebration overlay
            if (_done)
              AnimatedBuilder(
                animation: _celebOpacity,
                builder: (_, _) => Opacity(
                  opacity: _celebOpacity.value,
                  child: const _StarsCelebration(),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ── Stars celebration ─────────────────────────────────────────────────────────

class _StarsCelebration extends StatefulWidget {
  const _StarsCelebration();

  @override
  State<_StarsCelebration> createState() => _StarsCelebrationState();
}

class _StarsCelebrationState extends State<_StarsCelebration>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();
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
      builder: (_, _) => CustomPaint(
        size: Size.infinite,
        painter: _StarsPainter(t: _ctrl.value),
      ),
    );
  }
}

class _StarsPainter extends CustomPainter {
  const _StarsPainter({required this.t});
  final double t;

  @override
  void paint(Canvas canvas, Size size) {
    final rng = math.Random(42);
    final paint = Paint()..style = PaintingStyle.fill;

    for (int i = 0; i < 30; i++) {
      final x = rng.nextDouble() * size.width;
      final baseY = rng.nextDouble() * size.height;
      final phase = rng.nextDouble();
      final opacity = ((math.sin((t + phase) * math.pi * 2) + 1) / 2) * 0.9;
      final radius = 2.0 + rng.nextDouble() * 4;
      paint.color = Colors.yellow.withValues(alpha: opacity);
      canvas.drawCircle(Offset(x, baseY), radius, paint);
    }
  }

  @override
  bool shouldRepaint(_StarsPainter old) => old.t != t;
}
