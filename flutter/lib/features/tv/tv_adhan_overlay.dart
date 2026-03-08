import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hijri/hijri_calendar.dart';

import '../../core/models/alert_config.dart';
import '../../core/services/adhan_service.dart';
import '../../core/services/media_pause_service.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/notification_model.dart';

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
class TvAdhanOverlay extends ConsumerStatefulWidget {
  const TvAdhanOverlay({
    super.key,
    required this.prayerName,
    required this.prayerTimeFormatted,
    required this.config,
    required this.onDismiss,
  });

  /// Display name of the prayer (e.g. "Fajr", "Maghrib").
  final String prayerName;

  /// Formatted prayer time string (e.g. "5:23 AM" or "17:23").
  final String prayerTimeFormatted;

  /// Alert configuration for this prayer.
  final PrayerAlertConfig config;

  /// Called when the overlay should be removed (auto-dismiss or user dismiss).
  final VoidCallback onDismiss;

  @override
  ConsumerState<TvAdhanOverlay> createState() => _TvAdhanOverlayState();
}

class _TvAdhanOverlayState extends ConsumerState<TvAdhanOverlay>
    with SingleTickerProviderStateMixin {
  Timer? _dismissTimer;
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

    // Play audio based on config.
    _playAudio();

    // Request media pause if enabled.
    _requestMediaPause();

    // Start auto-dismiss timer.
    if (widget.config.autoDismiss) {
      _dismissTimer = Timer(
        Duration(seconds: widget.config.durationSeconds),
        _dismiss,
      );
    }
  }

  Future<void> _playAudio() async {
    switch (widget.config.audioType) {
      case AlertAudioType.adhan:
        await AdhanService.instance.play(AdhanType.makkah);
      case AlertAudioType.beep:
        await AdhanService.instance.play(AdhanType.beep);
      case AlertAudioType.silent:
        break;
    }
  }

  void _requestMediaPause() {
    final alertSettings = ref.read(alertSettingsProvider);
    if (alertSettings.mediaPauseEnabled) {
      MediaPauseService.instance.pauseForAdhan(
        duration: Duration(seconds: widget.config.durationSeconds),
      );
    }
  }

  void _dismiss() {
    _dismissTimer?.cancel();
    AdhanService.instance.fadeOut();
    _fadeController.reverse().then((_) {
      if (mounted) widget.onDismiss();
    });
  }

  @override
  void dispose() {
    _dismissTimer?.cancel();
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
              ),
      ),
    );
  }
}

// ── Full-screen modal overlay ──────────────────────────────────────────────

class _ModalAlert extends StatelessWidget {
  const _ModalAlert({
    required this.prayerName,
    required this.prayerTime,
    required this.onDismiss,
  });

  final String prayerName;
  final String prayerTime;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    final hijri = _hijriString();

    return GestureDetector(
      onTap: onDismiss,
      child: Container(
        color: Colors.black.withAlpha(220),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Prayer icon
              const Icon(
                Icons.mosque,
                color: PrayCalcColors.light,
                size: 80,
              ),
              const SizedBox(height: 24),

              // Prayer name
              Text(
                prayerName,
                style: const TextStyle(
                  color: PrayCalcColors.light,
                  fontSize: 72,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 16),

              // Prayer time
              Text(
                prayerTime,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 56,
                  fontWeight: FontWeight.w300,
                  fontFeatures: [FontFeature.tabularFigures()],
                ),
              ),
              const SizedBox(height: 24),

              // Hijri date
              if (hijri.isNotEmpty)
                Text(
                  hijri,
                  style: const TextStyle(
                    color: Colors.white54,
                    fontSize: 28,
                  ),
                ),
              const SizedBox(height: 48),

              // Dismiss hint
              Text(
                'Press OK to dismiss',
                style: TextStyle(
                  color: Colors.white.withAlpha(80),
                  fontSize: 20,
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
    } catch (_) {
      return '';
    }
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

  String _formatH(double h, bool use24h) {
    final totalMin = (h * 60).round();
    final hh = (totalMin ~/ 60) % 24;
    final mm = totalMin % 60;
    if (use24h) {
      return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    }
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:${mm.toString().padLeft(2, '0')} $period';
  }
}
