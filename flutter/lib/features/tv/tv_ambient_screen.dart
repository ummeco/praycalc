import 'dart:async';
import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/ramadan_provider.dart';
import '../../core/providers/screensaver_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/providers/tv_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/moon_phase.dart';

/// Ambient / screensaver mode for TV.
///
/// Shows current time, next prayer countdown, Qibla direction, and moon phase
/// over full-screen photos from MinIO storage (with crossfade transitions) or
/// an Islamic geometric pattern fallback. Text drifts slowly for OLED burn-in
/// prevention. Wakes on any remote button press.
class TvAmbientScreen extends ConsumerStatefulWidget {
  const TvAmbientScreen({super.key});

  @override
  ConsumerState<TvAmbientScreen> createState() => _TvAmbientScreenState();
}

class _TvAmbientScreenState extends ConsumerState<TvAmbientScreen>
    with TickerProviderStateMixin {
  late Timer _ticker;
  late AnimationController _patternController;
  late AnimationController _crossfadeController;
  final _focusNode = FocusNode();
  DateTime _now = DateTime.now();
  Timer? _photoTimer;

  // Drift offsets for burn-in prevention (pixels from center).
  double _driftX = 0;
  double _driftY = 0;
  static const _maxDrift = 150.0; // max px from center
  static const _driftCycleSec = 1800.0; // 30 min full cycle

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();

    _patternController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 120),
    )..repeat();

    _crossfadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {
        _now = DateTime.now();
        _updateDrift();
      });
    });

    // Start photo rotation timer after first frame.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startPhotoRotation();
    });
  }

  void _startPhotoRotation() {
    final tvSettings = ref.read(tvSettingsProvider);
    final intervalSec = tvSettings.ambientIntervalSeconds;

    _photoTimer?.cancel();
    _photoTimer = Timer.periodic(Duration(seconds: intervalSec), (_) async {
      final mode = ref.read(tvSettingsProvider).screensaverMode;
      if (mode == 'pattern') return;

      // Advance to next photo.
      await ref.read(screensaverProvider.notifier).next();

      // Trigger crossfade animation.
      _crossfadeController.forward(from: 0);
    });
  }

  void _updateDrift() {
    // Sinusoidal drift over 30 minutes.
    final elapsed = _now.millisecondsSinceEpoch / 1000.0;
    final phase = (elapsed % _driftCycleSec) / _driftCycleSec * 2 * math.pi;
    _driftX = math.sin(phase) * _maxDrift;
    _driftY = math.cos(phase * 0.7) * _maxDrift * 0.6;
  }

  @override
  void dispose() {
    _ticker.cancel();
    _photoTimer?.cancel();
    _focusNode.dispose();
    _patternController.dispose();
    _crossfadeController.dispose();
    WakelockPlus.disable();
    super.dispose();
  }

  double get _nowH =>
      _now.hour + _now.minute / 60.0 + _now.second / 3600.0;

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsProvider);
    final tvSettings = ref.watch(tvSettingsProvider);
    final timesAsync = ref.watch(prayerTimesProvider);
    final city = ref.watch(cityProvider);
    final moonResult = MoonPhase.calculate(_now);
    final ssState = ref.watch(screensaverProvider);
    final ramadan = ref.watch(ramadanProvider);
    final screensaverMode = tvSettings.screensaverMode;

    final showPhotos =
        screensaverMode != 'pattern' && ssState.isReady && ssState.currentFile != null;

    return Scaffold(
      backgroundColor: Colors.black,
      body: KeyboardListener(
        focusNode: _focusNode,
        autofocus: true,
        onKeyEvent: (event) {
          if (event is KeyDownEvent) {
            context.pop();
          }
        },
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => context.pop(),
          child: Stack(
            children: [
              // ── Background ──
              if (showPhotos)
                _PhotoBackground(
                  currentFile: ssState.currentFile!,
                  crossfadeAnimation: _crossfadeController,
                )
              else
                Positioned.fill(
                  child: AnimatedBuilder(
                    animation: _patternController,
                    builder: (context, child) {
                      return CustomPaint(
                        painter: _IslamicPatternPainter(
                          rotation: _patternController.value * 2 * math.pi,
                        ),
                      );
                    },
                  ),
                ),

              // ── Dark overlay for text readability over photos ──
              if (showPhotos)
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withAlpha(80),
                          Colors.black.withAlpha(30),
                          Colors.black.withAlpha(30),
                          Colors.black.withAlpha(140),
                        ],
                        stops: const [0.0, 0.3, 0.7, 1.0],
                      ),
                    ),
                  ),
                ),

              // ── Ramadan day counter (bottom-left) ──
              if (ramadan.isRamadan)
                Positioned(
                  left: 40,
                  bottom: 40,
                  child: Transform.translate(
                    offset: Offset(_driftX * 0.3, _driftY * 0.3),
                    child: _RamadanBadge(day: ramadan.hDay),
                  ),
                ),

              // ── Photo description (bottom-right) ──
              if (showPhotos && ssState.currentPhoto != null)
                Positioned(
                  right: 40,
                  bottom: 40,
                  child: Transform.translate(
                    offset: Offset(_driftX * 0.3, _driftY * 0.3),
                    child: Text(
                      ssState.currentPhoto!.description,
                      style: TextStyle(
                        color: Colors.white.withAlpha(100),
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),

              // ── Drifting content ──
              Center(
                child: Transform.translate(
                  offset: Offset(_driftX, _driftY),
                  child: timesAsync.when(
                    loading: () => const SizedBox.shrink(),
                    error: (_, _) => const SizedBox.shrink(),
                    data: (times) => _AmbientContent(
                      now: _now,
                      nowH: _nowH,
                      times: times,
                      use24h: settings.use24h,
                      moonResult: moonResult,
                      cityLat: city?.lat,
                      cityLng: city?.lng,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Photo background with crossfade ─────────────────────────────────────────

class _PhotoBackground extends StatelessWidget {
  const _PhotoBackground({
    required this.currentFile,
    required this.crossfadeAnimation,
  });

  final File currentFile;
  final Animation<double> crossfadeAnimation;

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: AnimatedBuilder(
        animation: crossfadeAnimation,
        builder: (context, child) {
          return Opacity(
            opacity: crossfadeAnimation.value.clamp(0.0, 1.0),
            child: Image.file(
              currentFile,
              fit: BoxFit.cover,
              width: double.infinity,
              height: double.infinity,
              errorBuilder: (_, _, _) => const ColoredBox(color: Colors.black),
            ),
          );
        },
      ),
    );
  }
}

// ─── Ramadan day counter badge ───────────────────────────────────────────────

class _RamadanBadge extends StatelessWidget {
  const _RamadanBadge({required this.day});

  final int day;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFD4A017).withAlpha(50),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFD4A017).withAlpha(80),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('🌙', style: TextStyle(fontSize: 24)),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Ramadan',
                style: TextStyle(
                  color: Color(0xFFD4A017),
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                'Day $day',
                style: TextStyle(
                  color: const Color(0xFFD4A017).withAlpha(180),
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Ambient content ─────────────────────────────────────────────────────────

class _AmbientContent extends StatelessWidget {
  const _AmbientContent({
    required this.now,
    required this.nowH,
    required this.times,
    required this.use24h,
    required this.moonResult,
    this.cityLat,
    this.cityLng,
  });

  final DateTime now;
  final double nowH;
  final PrayerTimes times;
  final bool use24h;
  final MoonPhaseResult moonResult;
  final double? cityLat;
  final double? cityLng;

  @override
  Widget build(BuildContext context) {
    final nextLabel = _nextPrayerLabel();
    final countdown = _countdownString();

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Current time
        Text(
          _formatCurrentTime(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 80,
            fontWeight: FontWeight.w300,
            fontFeatures: [FontFeature.tabularFigures()],
          ),
        ),
        const SizedBox(height: 24),

        // Next prayer countdown
        if (nextLabel.isNotEmpty)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 10),
            decoration: BoxDecoration(
              color: PrayCalcColors.dark.withAlpha(100),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              '$nextLabel in $countdown',
              style: const TextStyle(
                color: PrayCalcColors.light,
                fontSize: 32,
                fontWeight: FontWeight.w400,
                fontFeatures: [FontFeature.tabularFigures()],
              ),
            ),
          ),
        const SizedBox(height: 32),

        // Moon phase + Qibla row
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Moon phase
            Text(
              MoonPhase.phaseEmoji(moonResult.phase),
              style: const TextStyle(fontSize: 36),
            ),
            const SizedBox(width: 8),
            Text(
              '${moonResult.illuminationPct.round()}%',
              style: const TextStyle(color: Colors.white38, fontSize: 22),
            ),

            // Qibla direction
            if (cityLat != null && cityLng != null) ...[
              const SizedBox(width: 32),
              Icon(Icons.explore, color: PrayCalcColors.mid.withAlpha(150), size: 28),
              const SizedBox(width: 6),
              Text(
                'Qibla ${_qiblaDirection()}',
                style: TextStyle(
                  color: PrayCalcColors.mid.withAlpha(150),
                  fontSize: 22,
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }

  String _formatCurrentTime() {
    final hh = now.hour;
    final mm = now.minute.toString().padLeft(2, '0');
    if (use24h) return '${hh.toString().padLeft(2, '0')}:$mm';
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:$mm $period';
  }

  String _nextPrayerLabel() {
    const labels = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    final getters = [
      times.fajr, times.sunrise, times.dhuhr,
      times.asr, times.maghrib, times.isha,
    ];
    for (int i = 0; i < getters.length; i++) {
      if (getters[i].isFinite && getters[i] > nowH) return labels[i];
    }
    return labels[0]; // wrap to Fajr
  }

  String _countdownString() {
    final getters = [
      times.fajr, times.sunrise, times.dhuhr,
      times.asr, times.maghrib, times.isha,
    ];
    double target = getters[0]; // default: Fajr
    for (final h in getters) {
      if (h.isFinite && h > nowH) {
        target = h;
        break;
      }
    }
    double diff = target - nowH;
    if (diff < 0) diff += 24;
    final totalSec = (diff * 3600).round();
    final hh = totalSec ~/ 3600;
    final mm = (totalSec % 3600) ~/ 60;
    final ss = totalSec % 60;
    return '${hh.toString().padLeft(2, '0')}:'
        '${mm.toString().padLeft(2, '0')}:'
        '${ss.toString().padLeft(2, '0')}';
  }

  /// Simple Qibla bearing as compass direction string.
  String _qiblaDirection() {
    if (cityLat == null || cityLng == null) return '';
    // Kaaba coordinates
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;

    final lat1 = cityLat! * math.pi / 180;
    final lng1 = cityLng! * math.pi / 180;
    const lat2 = kaabaLat * math.pi / 180;
    const lng2 = kaabaLng * math.pi / 180;

    final dLng = lng2 - lng1;
    final y = math.sin(dLng) * math.cos(lat2);
    final x = math.cos(lat1) * math.sin(lat2) -
        math.sin(lat1) * math.cos(lat2) * math.cos(dLng);
    var bearing = math.atan2(y, x) * 180 / math.pi;
    bearing = (bearing + 360) % 360;

    // Convert to compass direction
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    final idx = ((bearing + 22.5) / 45).floor() % 8;
    return '${bearing.round()}° ${directions[idx]}';
  }
}

// ─── Islamic geometric pattern painter ───────────────────────────────────────

class _IslamicPatternPainter extends CustomPainter {
  final double rotation;

  _IslamicPatternPainter({required this.rotation});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;

    // Subtle rotating geometric pattern
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5;

    // Layer 1: green octagonal grid
    paint.color = PrayCalcColors.dark.withAlpha(30);
    _drawOctagonalGrid(canvas, cx, cy, size, paint, rotation * 0.3);

    // Layer 2: gold star pattern (slower rotation)
    paint.color = const Color(0xFFD4A017).withAlpha(15);
    paint.strokeWidth = 0.8;
    _drawStarPattern(canvas, cx, cy, size, paint, -rotation * 0.15);
  }

  void _drawOctagonalGrid(
    Canvas canvas,
    double cx,
    double cy,
    Size size,
    Paint paint,
    double angle,
  ) {
    canvas.save();
    canvas.translate(cx, cy);
    canvas.rotate(angle);

    final maxR = math.sqrt(cx * cx + cy * cy);
    const spacing = 120.0;
    final count = (maxR / spacing).ceil() + 1;

    for (int i = -count; i <= count; i++) {
      for (int j = -count; j <= count; j++) {
        final x = i * spacing;
        final y = j * spacing;
        _drawOctagon(canvas, x, y, spacing * 0.4, paint);
      }
    }

    canvas.restore();
  }

  void _drawOctagon(Canvas canvas, double cx, double cy, double r, Paint paint) {
    final path = Path();
    for (int i = 0; i < 8; i++) {
      final angle = (i * math.pi / 4) - math.pi / 8;
      final x = cx + r * math.cos(angle);
      final y = cy + r * math.sin(angle);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  void _drawStarPattern(
    Canvas canvas,
    double cx,
    double cy,
    Size size,
    Paint paint,
    double angle,
  ) {
    canvas.save();
    canvas.translate(cx, cy);
    canvas.rotate(angle);

    final maxR = math.sqrt(cx * cx + cy * cy);
    const spacing = 200.0;
    final count = (maxR / spacing).ceil() + 1;

    for (int i = -count; i <= count; i++) {
      for (int j = -count; j <= count; j++) {
        final x = i * spacing;
        final y = j * spacing;
        _drawSixPointStar(canvas, x, y, spacing * 0.3, paint);
      }
    }

    canvas.restore();
  }

  void _drawSixPointStar(
      Canvas canvas, double cx, double cy, double r, Paint paint) {
    // Two overlapping triangles
    for (int t = 0; t < 2; t++) {
      final offset = t * math.pi / 6;
      final path = Path();
      for (int i = 0; i < 3; i++) {
        final angle = offset + (i * 2 * math.pi / 3) - math.pi / 2;
        final x = cx + r * math.cos(angle);
        final y = cy + r * math.sin(angle);
        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }
      path.close();
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(_IslamicPatternPainter oldDelegate) =>
      oldDelegate.rotation != rotation;
}
