// praycalc/flutter/lib/shared/widgets/ambient_overlay.dart
// AmbientOverlay — burn-in-safe screensaver overlay for TV, macOS, Windows.
// Spec §4.2, S19-C T16
//
// Features:
//   - Burn-in prevention: position drifts by ±12px in X/Y every 60s (OLED safe)
//   - Auto-dismiss after [autoDissmissAfter] (default 30 min)
//   - Optional snooze: re-appears after [snoozeFor] (default 10 min)
//   - Semantics live region: announces next prayer every 5 minutes
//
// Usage:
//   AmbientOverlay(
//     nextPrayer: 'Asr',
//     nextPrayerTime: '3:47 PM',
//     countdownSeconds: 4020,
//     locationName: 'Mecca',
//     onDismiss: () { ... },
//     onSnooze: () { ... },
//   )

import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'progress_arc.dart';
import '../../core/services/locale_service.dart';

class AmbientOverlay extends StatefulWidget {
  final String nextPrayer;
  final String nextPrayerTime;
  final int countdownSeconds;
  final double progress;  // 0.0–1.0 for arc
  final String locationName;
  final String hijriDate;
  final VoidCallback? onDismiss;
  final VoidCallback? onSnooze;
  final Duration autoDismissAfter;
  final Duration snoozeFor;

  const AmbientOverlay({
    super.key,
    required this.nextPrayer,
    required this.nextPrayerTime,
    required this.countdownSeconds,
    this.progress = 0.5,
    this.locationName = '',
    this.hijriDate = '',
    this.onDismiss,
    this.onSnooze,
    this.autoDismissAfter = const Duration(minutes: 30),
    this.snoozeFor = const Duration(minutes: 10),
  });

  @override
  State<AmbientOverlay> createState() => _AmbientOverlayState();
}

class _AmbientOverlayState extends State<AmbientOverlay>
    with TickerProviderStateMixin {

  // Burn-in drift offset — updated every 60s
  Offset _driftOffset = Offset.zero;
  Timer? _driftTimer;
  Timer? _dismissTimer;
  Timer? _liveRegionTimer;
  final _random = math.Random();
  int _liveCountdown = 0;
  String _liveAnnouncementText = '';

  late AnimationController _fadeIn;

  @override
  void initState() {
    super.initState();
    _liveCountdown = widget.countdownSeconds;

    _fadeIn = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();

    // Burn-in drift: shift by ±12px every 60 seconds
    _driftTimer = Timer.periodic(const Duration(seconds: 60), (_) {
      if (mounted) {
        setState(() {
          _driftOffset = Offset(
            (_random.nextDouble() * 24) - 12,
            (_random.nextDouble() * 24) - 12,
          );
        });
      }
    });

    // Auto-dismiss
    _dismissTimer = Timer(widget.autoDismissAfter, () {
      widget.onDismiss?.call();
    });

    // Live region announcement every 5 minutes (for TalkBack/VoiceOver on TV)
    _liveRegionTimer = Timer.periodic(const Duration(minutes: 5), (_) {
      if (mounted) {
        setState(() {
          _liveAnnouncementText =
              '${widget.nextPrayer} in ${_formatCountdown(_liveCountdown)}';
        });
      }
    });

    // Countdown tick — decrease every second for display
    Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() {
        if (_liveCountdown > 0) _liveCountdown--;
      });
    });
  }

  @override
  void dispose() {
    _driftTimer?.cancel();
    _dismissTimer?.cancel();
    _liveRegionTimer?.cancel();
    _fadeIn.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      label: _liveAnnouncementText.isEmpty
          ? '${widget.nextPrayer} at ${widget.nextPrayerTime}'
          : _liveAnnouncementText,
      child: FadeTransition(
        opacity: _fadeIn,
        child: GestureDetector(
          onTap: widget.onDismiss,
          child: Container(
            width: double.infinity,
            height: double.infinity,
            color: Colors.black.withAlpha(230),
            child: Center(
              child: Transform.translate(
                offset: _driftOffset,
                child: _buildContent(),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Progress arc with prayer initial
        SizedBox(
          width: 160,
          height: 160,
          child: Stack(
            alignment: Alignment.center,
            children: [
              ProgressArc(
                progress: widget.progress,
                color: const Color(0xFFC9F27A),
                strokeWidth: 8,
              ),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    widget.nextPrayer,
                    style: const TextStyle(
                      color: Color(0xFFC9F27A),
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                  Text(
                    widget.nextPrayerTime,
                    style: TextStyle(
                      color: Colors.white.withAlpha(204),
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        // Countdown
        Text(
          _formatCountdown(_liveCountdown),
          style: TextStyle(
            color: Colors.white.withAlpha(178),
            fontSize: 20,
            fontWeight: FontWeight.w300,
          ),
        ),
        const SizedBox(height: 8),
        // Location + Hijri date
        if (widget.locationName.isNotEmpty)
          Text(
            widget.locationName,
            style: TextStyle(
              color: Colors.white.withAlpha(128),
              fontSize: 14,
            ),
          ),
        if (widget.hijriDate.isNotEmpty) ...[
          const SizedBox(height: 4),
          Text(
            widget.hijriDate,
            style: TextStyle(
              color: Colors.white.withAlpha(102),
              fontSize: 13,
            ),
          ),
        ],
        const SizedBox(height: 32),
        // Action buttons
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (widget.onSnooze != null)
              _AmbientButton(
                label: 'Snooze 10m',
                icon: Icons.snooze,
                onPressed: widget.onSnooze!,
              ),
            if (widget.onSnooze != null && widget.onDismiss != null)
              const SizedBox(width: 16),
            if (widget.onDismiss != null)
              _AmbientButton(
                label: 'Dismiss',
                icon: Icons.close,
                onPressed: widget.onDismiss!,
              ),
          ],
        ),
        const SizedBox(height: 16),
        Text(
          'Tap anywhere to dismiss',
          style: TextStyle(
            color: Colors.white.withAlpha(77),
            fontSize: 11,
          ),
        ),
      ],
    );
  }

  // T38: unified via LocaleService.formatCountdown
  String _formatCountdown(int secs) {
    if (secs <= 0) return 'Now!';
    return LocaleService.instance.formatCountdown(Duration(seconds: secs));
  }
}

class _AmbientButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onPressed;

  const _AmbientButton({
    required this.label,
    required this.icon,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      child: Material(
        color: Colors.white.withAlpha(26),
        borderRadius: BorderRadius.circular(24),
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: Colors.white70, size: 16),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
