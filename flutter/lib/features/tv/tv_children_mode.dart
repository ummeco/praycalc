// Y-1 + Y-3: TV Children's Mode
//
// Full-screen widget designed for young viewers:
//   • Large prayer name cards with colourful icons and kid-friendly typography
//   • Confetti rain animation on prayer time
//   • Y-3: 4-second educational overlay explaining the prayer (tap/D-pad to dismiss)
//
// Activated from TvHomeScreen when childrenModeEnabled == true in tvSettings.
// Exit requires the parent PIN (see TvChildrenPinScreen — Y-2).

import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_theme.dart';

// ─── Y-3: Prayer explanations ─────────────────────────────────────────────────

class _PrayerExplanation {
  final String name;
  final String arabic;
  final String emoji;
  final Color color;
  final String explanation;
  final String funFact;

  const _PrayerExplanation({
    required this.name,
    required this.arabic,
    required this.emoji,
    required this.color,
    required this.explanation,
    required this.funFact,
  });
}

const kPrayerExplanations = <String, _PrayerExplanation>{
  'Fajr': _PrayerExplanation(
    name: 'Fajr',
    arabic: 'الفجر',
    emoji: '🌅',
    color: Color(0xFF6B5CA5),
    explanation: 'Fajr is the morning prayer. We wake up before sunrise '
        'to thank Allah for a new day!',
    funFact: 'The Prophet ﷺ said: "The best prayer in the sight of Allah '
        'is Fajr on Friday." (Bukhari)',
  ),
  'Sunrise': _PrayerExplanation(
    name: 'Sunrise',
    arabic: 'الشروق',
    emoji: '☀️',
    color: Color(0xFFE07B39),
    explanation: 'After Fajr, the sun rises. This is a blessed time to '
        'make dhikr and read Quran.',
    funFact: 'Sitting after Fajr until sunrise and praying two rak\'ahs '
        'earns the reward of a full Hajj! (Tirmidhi)',
  ),
  'Dhuhr': _PrayerExplanation(
    name: 'Dhuhr',
    arabic: 'الظهر',
    emoji: '🌞',
    color: Color(0xFFD4A017),
    explanation: 'Dhuhr is the midday prayer. The sun is highest in the '
        'sky, and we pause to remember Allah.',
    funFact: 'The Prophet ﷺ loved to pray Dhuhr early when the sun '
        'begins to decline. (Muslim)',
  ),
  'Asr': _PrayerExplanation(
    name: 'Asr',
    arabic: 'العصر',
    emoji: '🌤️',
    color: Color(0xFF2E86AB),
    explanation: 'Asr is the afternoon prayer. Allah swears by this time '
        'in Surah Al-Asr — it is very important!',
    funFact: 'Missing Asr prayer is like losing one\'s family and wealth. '
        'That is how much Allah loves it! (Bukhari)',
  ),
  'Maghrib': _PrayerExplanation(
    name: 'Maghrib',
    arabic: 'المغرب',
    emoji: '🌇',
    color: Color(0xFFE84855),
    explanation: 'Maghrib is the sunset prayer. When the sun sets, we '
        'thank Allah for the beautiful day.',
    funFact: 'The angels of the day and night meet at Fajr and Maghrib. '
        'How special! (Bukhari)',
  ),
  'Isha': _PrayerExplanation(
    name: 'Isha',
    arabic: 'العشاء',
    emoji: '🌙',
    color: Color(0xFF3D405B),
    explanation: 'Isha is the night prayer. We end our day by thanking '
        'Allah before we sleep.',
    funFact: 'Praying Isha and Fajr in congregation is like praying all '
        'night long! (Muslim)',
  ),
};

// ─── Confetti particle ────────────────────────────────────────────────────────

class _Confetti {
  double x;
  double y;
  final double vx;
  double vy;
  final Color color;
  final double size;
  final double rotation;
  final double rotationSpeed;

  _Confetti({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.color,
    required this.size,
    required this.rotation,
    required this.rotationSpeed,
  });
}

// ─── Main widget ──────────────────────────────────────────────────────────────

/// Full-screen children's mode overlay.
///
/// Shows a friendly prayer schedule with large icons and bright colours.
/// Pass [onExitRequested] to receive the signal when the user tries to exit
/// (the caller should then push [TvChildrenPinScreen] to verify the PIN).
class TvChildrenMode extends StatefulWidget {
  const TvChildrenMode({
    super.key,
    required this.currentPrayer,
    required this.nextPrayer,
    required this.nextPrayerCountdown,
    required this.onExitRequested,
  });

  /// Name of the current prayer (e.g. 'Fajr'). May be empty between prayers.
  final String currentPrayer;

  /// Name of the upcoming prayer.
  final String nextPrayer;

  /// Human-readable countdown string, e.g. '01:23:45'.
  final String nextPrayerCountdown;

  /// Called when the child taps the exit button or the remote BACK key.
  final VoidCallback onExitRequested;

  @override
  State<TvChildrenMode> createState() => _TvChildrenModeState();
}

class _TvChildrenModeState extends State<TvChildrenMode>
    with TickerProviderStateMixin {
  final _focusNode = FocusNode();

  // Confetti
  late AnimationController _confettiCtrl;
  List<_Confetti> _particles = [];
  bool _showConfetti = false;

  // Y-3: educational overlay
  bool _showEducation = false;
  Timer? _educationTimer;
  String? _educationPrayer;

  // Colour cycle for animated background
  late AnimationController _bgCtrl;
  late Animation<Color?> _bgColor;

  static const _confettiColors = [
    Color(0xFFC9F27A), Color(0xFF79C24C), Color(0xFFD4A017),
    Color(0xFFE84855), Color(0xFF6B5CA5), Color(0xFF2E86AB),
  ];

  @override
  void initState() {
    super.initState();

    _confettiCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 16),
    )..addListener(_tickConfetti);

    _bgCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat(reverse: true);

    _bgColor = ColorTween(
      begin: const Color(0xFF0D2F17),
      end: const Color(0xFF1A0A2E),
    ).animate(_bgCtrl);
  }

  @override
  void didUpdateWidget(TvChildrenMode old) {
    super.didUpdateWidget(old);
    // Trigger confetti when prayer changes
    if (widget.currentPrayer != old.currentPrayer &&
        widget.currentPrayer.isNotEmpty) {
      _triggerConfetti();
      _triggerEducation(widget.currentPrayer);
    }
  }

  void _triggerConfetti() {
    final rng = math.Random();
    _particles = List.generate(60, (_) => _Confetti(
      x: rng.nextDouble(),
      y: -0.05,
      vx: (rng.nextDouble() - 0.5) * 0.006,
      vy: 0.003 + rng.nextDouble() * 0.004,
      color: _confettiColors[rng.nextInt(_confettiColors.length)],
      size: 6 + rng.nextDouble() * 8,
      rotation: rng.nextDouble() * math.pi * 2,
      rotationSpeed: (rng.nextDouble() - 0.5) * 0.1,
    ));
    setState(() => _showConfetti = true);
    _confettiCtrl.repeat();

    // Stop after 3 seconds
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        _confettiCtrl.stop();
        setState(() { _showConfetti = false; _particles = []; });
      }
    });
  }

  void _tickConfetti() {
    if (!_showConfetti || _particles.isEmpty) return;
    setState(() {
      _particles = _particles
          .map((p) => p..x += p.vx..y += p.vy)
          .where((p) => p.y < 1.1)
          .toList();
    });
  }

  // Y-3: show educational overlay for 4 seconds
  void _triggerEducation(String prayerName) {
    _educationTimer?.cancel();
    setState(() {
      _showEducation = true;
      _educationPrayer = prayerName;
    });
    _educationTimer = Timer(const Duration(seconds: 4), () {
      if (mounted) setState(() => _showEducation = false);
    });
  }

  void _dismissEducation() {
    _educationTimer?.cancel();
    setState(() => _showEducation = false);
  }

  @override
  void dispose() {
    _confettiCtrl.dispose();
    _bgCtrl.dispose();
    _educationTimer?.cancel();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final explanation = widget.currentPrayer.isNotEmpty
        ? kPrayerExplanations[widget.currentPrayer]
        : kPrayerExplanations[widget.nextPrayer];

    return AnimatedBuilder(
      animation: _bgColor,
      builder: (_, child) => ColoredBox(
        color: _bgColor.value ?? const Color(0xFF0D2F17),
        child: child,
      ),
      child: KeyboardListener(
        focusNode: _focusNode,
        autofocus: true,
        onKeyEvent: (event) {
          if (event is KeyDownEvent) {
            if (event.logicalKey == LogicalKeyboardKey.goBack ||
                event.logicalKey == LogicalKeyboardKey.escape) {
              if (_showEducation) {
                _dismissEducation();
              } else {
                widget.onExitRequested();
              }
            } else if (_showEducation) {
              _dismissEducation();
            }
          }
        },
        child: Stack(
          children: [
            // ── Main content ──
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // App title
                    const Text(
                      'Prayer Times',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w300,
                        letterSpacing: 4,
                      ),
                    ),
                    const SizedBox(height: 40),

                    // Prayer emoji + name
                    if (explanation != null) ...[
                      Text(
                        explanation.emoji,
                        style: const TextStyle(fontSize: 96),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        explanation.arabic,
                        textDirection: TextDirection.rtl,
                        style: TextStyle(
                          fontFamily: 'Amiri',
                          fontSize: 56,
                          color: explanation.color,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        explanation.name,
                        style: const TextStyle(
                          fontSize: 36,
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 2,
                        ),
                      ),
                    ],

                    const SizedBox(height: 40),

                    // Countdown
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 40, vertical: 18),
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(60),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: PrayCalcColors.mid.withAlpha(80),
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            'Next prayer: ${widget.nextPrayer}',
                            style: TextStyle(
                              color: Colors.white.withAlpha(180),
                              fontSize: 20,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            widget.nextPrayerCountdown,
                            style: const TextStyle(
                              color: PrayCalcColors.light,
                              fontSize: 42,
                              fontWeight: FontWeight.w700,
                              fontFeatures: [FontFeature.tabularFigures()],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 48),

                    // Exit button (parents only)
                    TextButton.icon(
                      onPressed: widget.onExitRequested,
                      icon: const Icon(Icons.lock_outline,
                          color: Colors.white38, size: 18),
                      label: const Text(
                        'Parent Exit',
                        style: TextStyle(color: Colors.white38, fontSize: 16),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── Confetti overlay ──
            if (_showConfetti)
              Positioned.fill(
                child: CustomPaint(
                  painter: _ConfettiPainter(particles: _particles),
                ),
              ),

            // ── Y-3: Educational overlay ──
            if (_showEducation && _educationPrayer != null)
              _EducationOverlay(
                explanation:
                    kPrayerExplanations[_educationPrayer!]!,
                onDismiss: _dismissEducation,
              ),
          ],
        ),
      ),
    );
  }
}

// ─── Confetti painter ─────────────────────────────────────────────────────────

class _ConfettiPainter extends CustomPainter {
  const _ConfettiPainter({required this.particles});
  final List<_Confetti> particles;

  @override
  void paint(Canvas canvas, Size size) {
    for (final p in particles) {
      final paint = Paint()..color = p.color;
      canvas.save();
      canvas.translate(p.x * size.width, p.y * size.height);
      canvas.rotate(p.rotation);
      canvas.drawRect(
        Rect.fromCenter(
            center: Offset.zero, width: p.size, height: p.size * 0.5),
        paint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(_ConfettiPainter old) => true;
}

// ─── Y-3: Educational overlay ─────────────────────────────────────────────────

class _EducationOverlay extends StatelessWidget {
  const _EducationOverlay({
    required this.explanation,
    required this.onDismiss,
  });

  final _PrayerExplanation explanation;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onDismiss,
      child: Container(
        color: Colors.black.withAlpha(180),
        child: Center(
          child: Container(
            constraints: const BoxConstraints(maxWidth: 700),
            margin: const EdgeInsets.all(60),
            padding: const EdgeInsets.all(48),
            decoration: BoxDecoration(
              color: explanation.color.withAlpha(230),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(
                color: Colors.white.withAlpha(60),
                width: 2,
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  explanation.emoji,
                  style: const TextStyle(fontSize: 72),
                ),
                const SizedBox(height: 20),
                Text(
                  explanation.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 40,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  explanation.explanation,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    height: 1.6,
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  height: 1,
                  color: Colors.white.withAlpha(60),
                ),
                const SizedBox(height: 20),
                Text(
                  explanation.funFact,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withAlpha(200),
                    fontSize: 18,
                    fontStyle: FontStyle.italic,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 28),
                Text(
                  'Tap or press OK to continue',
                  style: TextStyle(
                    color: Colors.white.withAlpha(120),
                    fontSize: 14,
                    letterSpacing: 1,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
