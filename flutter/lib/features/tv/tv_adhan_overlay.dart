import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hijri/hijri_calendar.dart';

import '../../core/models/alert_config.dart';
import '../../core/providers/tv_provider.dart';
import '../../core/services/adhan_service.dart';
import '../../core/services/locale_service.dart';
import '../../core/services/media_pause_service.dart';
import '../../core/services/tv_adhan_audio_coordinator.dart';
import '../../core/services/tv_audio_router.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/notification_model.dart';
import '../../shared/models/tv_settings_model.dart';

// ── Adhan phases ─────────────────────────────────────────────────────────────

/// Phases of the full-screen adhan overlay animation sequence.
///
/// [silhouette] → [calligraphy] → [details]
enum AdhanPhase { silhouette, calligraphy, details }

/// When true, the mosque silhouette phase is shown before the Arabic
/// calligraphy phase. Set to false to skip directly to calligraphy.
const bool kAdhanSilhouetteEnabled = true;

/// Full-screen or corner adhan alert overlay for TV.
///
/// Displays the prayer name, time, and Hijri date when a prayer time arrives.
/// Supports two display modes:
/// - [AlertOverlayType.modal]: full-screen dark overlay with large text
/// - [AlertOverlayType.corner]: small card in top-right corner
///
/// Plays adhan audio (or beep) based on [PrayerAlertConfig], auto-dismisses
/// after the configured duration, and responds to remote control OK/Select
/// button for early dismissal.
///
/// TV2-8.8: modal mode shows Snooze 5 min / Snooze 10 min buttons. On snooze
/// the overlay dismisses and re-shows as a bubble after the delay via
/// [onSnooze].
class TvAdhanOverlay extends ConsumerStatefulWidget {
  const TvAdhanOverlay({
    super.key,
    required this.prayerName,
    required this.prayerTimeFormatted,
    required this.config,
    required this.onDismiss,
    this.onSnooze,
  });

  /// Display name of the prayer (e.g. "Fajr", "Maghrib").
  final String prayerName;

  /// Formatted prayer time string (e.g. "5:23 AM" or "17:23").
  final String prayerTimeFormatted;

  /// Alert configuration for this prayer.
  final PrayerAlertConfig config;

  /// Called when the overlay should be removed (auto-dismiss or user dismiss).
  final VoidCallback onDismiss;

  /// Called when the user snoozes. [delay] is how long to wait before
  /// re-showing the alert as a bubble. Null if snooze is not supported.
  final void Function(Duration delay)? onSnooze;

  @override
  ConsumerState<TvAdhanOverlay> createState() => _TvAdhanOverlayState();
}

class _TvAdhanOverlayState extends ConsumerState<TvAdhanOverlay>
    with SingleTickerProviderStateMixin {
  Timer? _dismissTimer;
  Timer? _snoozeTimer;
  final _focusNode = FocusNode();
  late final AnimationController _fadeController;
  late final Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeIn,
    );
    _fadeController.forward();

    // Audio routing based on media action config (TV2-8.4, TV2-8.5).
    _handleMediaAction();

    // Play audio based on config (TV2-4.6: coordinator handles fade + focus).
    _playAudio();

    // Start auto-dismiss timer.
    if (widget.config.autoDismiss) {
      _dismissTimer = Timer(
        Duration(seconds: widget.config.durationSeconds),
        _dismiss,
      );
    }
  }

  Future<void> _handleMediaAction() async {
    final tvSettings = ref.read(tvSettingsProvider);
    final prayerConfig = tvSettings.prayerAlertConfigs[widget.prayerName];
    final mediaAction = prayerConfig?.mediaAction ?? TvMediaAction.pause;

    switch (mediaAction) {
      case TvMediaAction.pause:
        await TvAudioRouter.requestTransientFocus();
        final alertSettings = ref.read(alertSettingsProvider);
        if (alertSettings.mediaPauseEnabled) {
          MediaPauseService.instance.pauseForAdhan(
            duration: Duration(seconds: widget.config.durationSeconds),
          );
        }
      case TvMediaAction.duck:
        await TvAudioRouter.duckAudio();
      case TvMediaAction.nothing:
        break;
    }
  }

  Future<void> _playAudio() async {
    final tvSettings = ref.read(tvSettingsProvider);
    final audioMode = tvSettings.tvAudioMode;

    // Coordinator handles fade-out + focus before adhan (TV2-4.6).
    await TvAdhanAudioCoordinator.onAdhanStart(audioMode: audioMode);

    switch (widget.config.audioType) {
      case AlertAudioType.adhan:
        await AdhanService.instance.play(AdhanType.makkah);
      case AlertAudioType.beep:
        await AdhanService.instance.play(AdhanType.beep);
      case AlertAudioType.silent:
        break;
    }
  }

  void _dismiss() {
    _dismissTimer?.cancel();
    _snoozeTimer?.cancel();
    AdhanService.instance.fadeOut();
    // Release focus and fade audio back in (TV2-4.6).
    TvAdhanAudioCoordinator.onAdhanEnd();
    _fadeController.reverse().then((_) {
      if (mounted) widget.onDismiss();
    });
  }

  void _snooze(Duration delay) {
    _dismissTimer?.cancel();
    _snoozeTimer?.cancel();
    AdhanService.instance.fadeOut();
    TvAdhanAudioCoordinator.onAdhanEnd();
    _fadeController.reverse().then((_) {
      if (mounted) {
        widget.onDismiss();
        widget.onSnooze?.call(delay);
      }
    });
  }

  @override
  void dispose() {
    _dismissTimer?.cancel();
    _snoozeTimer?.cancel();
    _fadeController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return KeyboardListener(
      focusNode: _focusNode,
      autofocus: true,
      onKeyEvent: (event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter ||
                event.logicalKey == LogicalKeyboardKey.escape)) {
          _dismiss();
        }
      },
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: widget.config.overlayType == AlertOverlayType.corner
            ? _CornerAlert(
                prayerName: widget.prayerName,
                prayerTime: widget.prayerTimeFormatted,
                onDismiss: _dismiss,
              )
            : _ModalAlert(
                prayerName: widget.prayerName,
                prayerTime: widget.prayerTimeFormatted,
                onDismiss: _dismiss,
                onSnooze: widget.onSnooze != null ? _snooze : null,
              ),
      ),
    );
  }
}

// ── P-3: Redesigned full-screen modal overlay ─────────────────────────────
//
// Three-phase display:
//   1. Calligraphy phase (0–4 s): Arabic prayer name fades in large
//   2. Details phase (4 s+): English name, time, waveform, Hijri
//   3. On dismiss: closes with fade-out

// Arabic prayer name lookup
const _kArabicPrayerNames = {
  'Fajr': 'الفجر',
  'Sunrise': 'الشروق',
  'Dhuhr': 'الظهر',
  'Asr': 'العصر',
  'Maghrib': 'المغرب',
  'Isha': 'العشاء',
};

class _ModalAlert extends StatefulWidget {
  const _ModalAlert({
    required this.prayerName,
    required this.prayerTime,
    required this.onDismiss,
    this.onSnooze,
  });

  final String prayerName;
  final String prayerTime;
  final VoidCallback onDismiss;
  final void Function(Duration delay)? onSnooze;

  @override
  State<_ModalAlert> createState() => _ModalAlertState();
}

class _ModalAlertState extends State<_ModalAlert>
    with TickerProviderStateMixin {
  late AnimationController _detailsCtrl;
  late Animation<double> _detailsOpacity;

  // Silhouette phase controller (0→1 over 4 seconds).
  late AnimationController _silhouetteCtrl;
  // Fade-out for silhouette exit (last 0.5s of silhouette phase).
  late AnimationController _silhouetteFadeOutCtrl;

  AdhanPhase _phase = kAdhanSilhouetteEnabled
      ? AdhanPhase.silhouette
      : AdhanPhase.calligraphy;

  @override
  void initState() {
    super.initState();

    _silhouetteCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    );
    _silhouetteFadeOutCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
      value: 1.0,
    );

    _detailsCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _detailsOpacity =
        CurvedAnimation(parent: _detailsCtrl, curve: Curves.easeIn);

    if (kAdhanSilhouetteEnabled) {
      _silhouetteCtrl.forward();
      // Fade out silhouette at 3.5s, then switch to calligraphy at 4s.
      Future.delayed(const Duration(milliseconds: 3500), () {
        if (mounted) _silhouetteFadeOutCtrl.reverse();
      });
      Future.delayed(const Duration(seconds: 4), () {
        if (mounted) setState(() => _phase = AdhanPhase.calligraphy);
      });
      // Show details panel after silhouette(4s) + calligraphy(4s).
      Future.delayed(const Duration(seconds: 8), () {
        if (mounted) _detailsCtrl.forward();
      });
    } else {
      // Show details panel after 4-second calligraphy phase.
      Future.delayed(const Duration(seconds: 4), () {
        if (mounted) _detailsCtrl.forward();
      });
    }
  }

  @override
  void dispose() {
    _silhouetteCtrl.dispose();
    _silhouetteFadeOutCtrl.dispose();
    _detailsCtrl.dispose();
    super.dispose();
  }

  String _hijriString() {
    try {
      final hj = HijriCalendar.fromDate(DateTime.now());
      const months = [
        'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
        'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
      ];
      return '${hj.hDay} ${months[hj.hMonth - 1]} ${hj.hYear} AH';
    } catch (e) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final arabic = _kArabicPrayerNames[widget.prayerName] ?? widget.prayerName;
    final hijri = _hijriString();

    return GestureDetector(
      onTap: widget.onDismiss,
      child: Container(
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.center,
            radius: 1.0,
            colors: [
              PrayCalcColors.deep.withValues(alpha: 0.96),
              Colors.black.withValues(alpha: 0.98),
            ],
          ),
        ),
        child: Stack(
          children: [
            // ── Silhouette phase ──
            if (_phase == AdhanPhase.silhouette)
              Positioned.fill(
                child: FadeTransition(
                  opacity: _silhouetteFadeOutCtrl,
                  child: AnimatedBuilder(
                    animation: _silhouetteCtrl,
                    builder: (_, _) => CustomPaint(
                      painter: _MosqueSilhouettePainter(
                        animValue: _silhouetteCtrl.value,
                      ),
                      child: const SizedBox.expand(),
                    ),
                  ),
                ),
              ),

            // ── Calligraphy + details phase ──
            if (_phase != AdhanPhase.silhouette)
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // ── Arabic calligraphy (always visible) ──
                    Text(
                      arabic,
                      textDirection: TextDirection.rtl,
                      style: TextStyle(
                        fontFamily: 'Amiri',
                        fontSize: 96,
                        height: 1.2,
                        color: PrayCalcColors.light,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // ── Animated waveform ──
                    const SizedBox(height: 8),
                    const _AdhanWaveform(),
                    const SizedBox(height: 24),

                    // ── Details panel (fades in after calligraphy phase) ──
                    FadeTransition(
                      opacity: _detailsOpacity,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            widget.prayerName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 40,
                              fontWeight: FontWeight.w300,
                              letterSpacing: 4,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            widget.prayerTime,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 36,
                              fontWeight: FontWeight.w300,
                              fontFeatures: [FontFeature.tabularFigures()],
                            ),
                          ),
                          if (hijri.isNotEmpty) ...[
                            const SizedBox(height: 14),
                            Text(
                              hijri,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.4),
                                fontSize: 20,
                              ),
                            ),
                          ],
                          const SizedBox(height: 40),
                          Text(
                            'Press OK to dismiss',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.3),
                              fontSize: 18,
                            ),
                          ),
                          // ── Snooze buttons (TV2-8.8) ──
                          if (widget.onSnooze != null) ...[
                            const SizedBox(height: 28),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                _SnoozeButton(
                                  label: 'Snooze 5 min',
                                  onTap: () => widget.onSnooze!(
                                      const Duration(minutes: 5)),
                                ),
                                const SizedBox(width: 24),
                                _SnoozeButton(
                                  label: 'Snooze 10 min',
                                  onTap: () => widget.onSnooze!(
                                      const Duration(minutes: 10)),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ── Mosque silhouette painter (TV-SIL-1) ─────────────────────────────────────

/// Paints a mosque silhouette rising from the bottom with a glowing aura.
///
/// [animValue] runs 0.0→1.0 over the 4-second silhouette phase:
///   - Rise: silhouette translates from +150px to 0 over the full duration.
///   - Glow: aura pulses with sin(animValue * π).
class _MosqueSilhouettePainter extends CustomPainter {
  const _MosqueSilhouettePainter({required this.animValue});
  final double animValue;

  @override
  void paint(Canvas canvas, Size size) {
    // Background gradient
    final bgPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: const [Color(0xFF0D2F17), Color(0xFF1E5E2F)],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Rise offset: starts at +150px below final position, slides to 0.
    final riseOffset = 150.0 * (1.0 - animValue);

    // Glow pulse: peaks at mid-animation.
    final glowAlpha = (math.sin(animValue * math.pi) * 0.08).clamp(0.0, 1.0);

    final cx = size.width / 2;
    // Baseline: bottom 35% of screen.
    final baseline = size.height * 0.65 + riseOffset;

    // Glow aura behind dome.
    final glowPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          Colors.white.withValues(alpha: glowAlpha),
          Colors.white.withValues(alpha: 0),
        ],
      ).createShader(Rect.fromCircle(
          center: Offset(cx, baseline - 120), radius: 200));
    canvas.drawCircle(Offset(cx, baseline - 120), 200, glowPaint);

    final silhouetteColor = const Color(0xFF1A4A2E);
    final fillPaint = Paint()
      ..color = silhouetteColor
      ..style = PaintingStyle.fill;
    final strokePaint = Paint()
      ..color = silhouetteColor.withValues(alpha: 0.7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    // ── Central dome ──────────────────────────────────────────────────────
    // Dome: semicircle 300px wide, center of screen.
    final domeRadius = 150.0;
    final domeCenterY = baseline - domeRadius;
    final domePath = Path()
      ..moveTo(cx - domeRadius, baseline)
      ..arcTo(
        Rect.fromCircle(center: Offset(cx, domeCenterY), radius: domeRadius),
        math.pi,
        -math.pi,
        false,
      )
      ..lineTo(cx + domeRadius, baseline)
      ..close();
    canvas.drawPath(domePath, fillPaint);
    canvas.drawPath(domePath, strokePaint);

    // ── Left minaret ─────────────────────────────────────────────────────
    _drawMinaret(canvas, fillPaint, strokePaint,
        cx: cx - 200, baseline: baseline, width: 40, height: 200);

    // ── Right minaret ─────────────────────────────────────────────────────
    _drawMinaret(canvas, fillPaint, strokePaint,
        cx: cx + 200, baseline: baseline, width: 40, height: 200);
  }

  void _drawMinaret(
    Canvas canvas,
    Paint fillPaint,
    Paint strokePaint, {
    required double cx,
    required double baseline,
    required double width,
    required double height,
  }) {
    final half = width / 2;
    final top = baseline - height;

    // Shaft
    final shaft = Path()
      ..moveTo(cx - half, baseline)
      ..lineTo(cx - half, top + 20)
      ..lineTo(cx, top)
      ..lineTo(cx + half, top + 20)
      ..lineTo(cx + half, baseline)
      ..close();
    canvas.drawPath(shaft, fillPaint);
    canvas.drawPath(shaft, strokePaint);

    // Crescent atop minaret
    _drawCrescent(canvas, fillPaint, cx: cx, cy: top - 14, r: 10);

    // Star beside crescent
    _drawStar(canvas, fillPaint, cx: cx + 14, cy: top - 20, r: 5);
  }

  void _drawCrescent(Canvas canvas, Paint paint,
      {required double cx, required double cy, required double r}) {
    final path = Path()
      ..addOval(Rect.fromCircle(center: Offset(cx, cy), radius: r));
    // Subtract inner circle to form crescent
    final inner = Path()
      ..addOval(Rect.fromCircle(center: Offset(cx + r * 0.4, cy), radius: r * 0.75));
    final crescent = Path.combine(PathOperation.difference, path, inner);
    canvas.drawPath(crescent, paint);
  }

  void _drawStar(Canvas canvas, Paint paint,
      {required double cx, required double cy, required double r}) {
    const points = 5;
    final inner = r * 0.4;
    final path = Path();
    for (int i = 0; i < points * 2; i++) {
      final angle = (i * math.pi / points) - math.pi / 2;
      final radius = i.isEven ? r : inner;
      final x = cx + radius * math.cos(angle);
      final y = cy + radius * math.sin(angle);
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
  bool shouldRepaint(_MosqueSilhouettePainter old) =>
      old.animValue != animValue;
}

// ── Animated waveform (P-3) ────────────────────────────────────────────────

class _AdhanWaveform extends StatefulWidget {
  const _AdhanWaveform();

  @override
  State<_AdhanWaveform> createState() => _AdhanWaveformState();
}

class _AdhanWaveformState extends State<_AdhanWaveform>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
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
      builder: (ctx, _) {
        return SizedBox(
          height: 48,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: List.generate(13, (i) {
              // Each bar has a different phase so they ripple.
              final phase = i * math.pi / 6;
              final h = 8.0 +
                  (math.sin(_ctrl.value * math.pi * 2 + phase) + 1) / 2 * 36;
              return Container(
                width: 6,
                height: h,
                margin: const EdgeInsets.symmetric(horizontal: 3),
                decoration: BoxDecoration(
                  color: PrayCalcColors.mid
                      .withValues(alpha: 0.5 + (_ctrl.value * 0.5)),
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
        );
      },
    );
  }
}

// ── Snooze button (TV2-8.8) ────────────────────────────────────────────────

class _SnoozeButton extends StatefulWidget {
  const _SnoozeButton({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  State<_SnoozeButton> createState() => _SnoozeButtonState();
}

class _SnoozeButtonState extends State<_SnoozeButton> {
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    return Focus(
      onFocusChange: (f) => setState(() => _focused = f),
      onKeyEvent: (_, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          widget.onTap();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding:
              const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
          decoration: BoxDecoration(
            color: _focused
                ? PrayCalcColors.dark
                : Colors.white.withAlpha(20),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: _focused ? PrayCalcColors.light : Colors.white38,
              width: _focused ? 2 : 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.snooze, color: Colors.white70, size: 20),
              const SizedBox(width: 10),
              Text(
                widget.label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Corner notification card ───────────────────────────────────────────────

class _CornerAlert extends StatelessWidget {
  const _CornerAlert({
    required this.prayerName,
    required this.prayerTime,
    required this.onDismiss,
  });

  final String prayerName;
  final String prayerTime;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topRight,
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: GestureDetector(
          onTap: onDismiss,
          child: Container(
            width: 320,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: PrayCalcColors.deep.withAlpha(240),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: PrayCalcColors.mid, width: 2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(120),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.mosque,
                  color: PrayCalcColors.light,
                  size: 36,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        prayerName,
                        style: const TextStyle(
                          color: PrayCalcColors.light,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        prayerTime,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 20,
                          fontFeatures: [FontFeature.tabularFigures()],
                        ),
                      ),
                    ],
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

// ── Alert scheduler ────────────────────────────────────────────────────────

/// Manages scheduling of prayer alert overlays based on prayer times.
///
/// Checks every second whether a prayer time has arrived and fires the
/// corresponding alert. Tracks which prayers have already been alerted
/// today to prevent duplicates.
class TvAlertScheduler {
  TvAlertScheduler._();
  static final instance = TvAlertScheduler._();

  Timer? _ticker;
  final Set<String> _alertedToday = {};
  DateTime _lastDate = DateTime.now();

  /// Callback invoked when a prayer alert should be shown.
  /// Parameters: prayer name, formatted time string.
  void Function(String prayerName, String formattedTime)? onAlert;

  /// Start checking for prayer times every second.
  ///
  /// [prayerTimesH] maps prayer names to fractional hours (e.g. 5.5 = 5:30).
  /// [use24h] controls time formatting.
  void start({
    required Map<String, double> prayerTimesH,
    required bool use24h,
  }) {
    stop();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      _check(prayerTimesH, use24h);
    });
  }

  void stop() {
    _ticker?.cancel();
    _ticker = null;
  }

  void _check(Map<String, double> prayerTimesH, bool use24h) {
    final now = DateTime.now();

    // Reset alerted set at midnight.
    if (now.day != _lastDate.day) {
      _alertedToday.clear();
      _lastDate = now;
    }

    final nowH = now.hour + now.minute / 60.0 + now.second / 3600.0;

    for (final entry in prayerTimesH.entries) {
      final prayer = entry.key;
      final timeH = entry.value;

      if (_alertedToday.contains(prayer)) continue;
      if (!timeH.isFinite) continue;

      // Fire alert if we're within 30 seconds of the prayer time.
      final diffSeconds = ((nowH - timeH) * 3600).abs();
      if (nowH >= timeH && diffSeconds < 30) {
        _alertedToday.add(prayer);
        onAlert?.call(prayer, _formatH(timeH, use24h));
      }
    }
  }

  // T38: delegate to LocaleService.formatPrayerTime
  String _formatH(double h, bool use24h) {
    final totalMin = (h * 60).round();
    final hh = (totalMin ~/ 60) % 24;
    final mm = totalMin % 60;
    final now = DateTime.now();
    final t = DateTime(now.year, now.month, now.day, hh, mm);
    return LocaleService.instance.formatPrayerTime(t);
  }
}
