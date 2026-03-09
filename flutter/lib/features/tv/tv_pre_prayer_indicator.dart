import 'dart:async';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';


/// P-4: Pre-prayer signal system.
///
/// Slides in a pill from the top of the screen when the next prayer is within
/// [warningMinutes] minutes. Shows a live MM:SS countdown and pulses an amber
/// dot. Calls [onPrayerTime] when the countdown reaches zero.
class TvPrePrayerIndicator extends StatefulWidget {
  const TvPrePrayerIndicator({
    super.key,
    required this.prayerName,
    required this.timeUntil,
    required this.warningMinutes,
    required this.visible,
    this.fontScale = 1.0,
    this.onPrayerTime,
  });

  /// Name of the upcoming prayer, e.g. "Asr".
  final String prayerName;

  /// Time remaining until the prayer begins (at widget creation / last update).
  final Duration timeUntil;

  /// Threshold from TvSettings (0 / 5 / 10 / 15 minutes).
  final int warningMinutes;

  /// Whether the pill should be visible. Drives the slide animation.
  final bool visible;

  /// Font scale from TvSettings.
  final double fontScale;

  /// Called when the internal countdown reaches zero.
  final VoidCallback? onPrayerTime;

  @override
  State<TvPrePrayerIndicator> createState() => _TvPrePrayerIndicatorState();
}

class _TvPrePrayerIndicatorState extends State<TvPrePrayerIndicator> {
  late Duration _remaining;
  Timer? _ticker;

  // Pulsing dot
  bool _dotLarge = false;
  Timer? _dotTimer;

  @override
  void initState() {
    super.initState();
    _remaining = widget.timeUntil;
    _startTicker();
    _startDotPulse();
  }

  @override
  void didUpdateWidget(TvPrePrayerIndicator old) {
    super.didUpdateWidget(old);
    if (old.timeUntil != widget.timeUntil) {
      _remaining = widget.timeUntil;
    }
    if (old.visible != widget.visible) {
      if (widget.visible) {
        _startTicker();
        _startDotPulse();
      } else {
        _stopTicker();
        _dotTimer?.cancel();
        _dotTimer = null;
      }
    }
  }

  void _startTicker() {
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        if (_remaining.inSeconds > 0) {
          _remaining -= const Duration(seconds: 1);
        } else {
          _stopTicker();
          widget.onPrayerTime?.call();
        }
      });
    });
  }

  void _stopTicker() {
    _ticker?.cancel();
    _ticker = null;
  }

  void _startDotPulse() {
    _dotTimer?.cancel();
    _dotTimer = Timer.periodic(const Duration(milliseconds: 800), (_) {
      if (!mounted) return;
      setState(() => _dotLarge = !_dotLarge);
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _dotTimer?.cancel();
    super.dispose();
  }

  String _formatCountdown(Duration d) {
    final total = d.inSeconds.clamp(0, 86400);
    final mm = (total ~/ 60).toString().padLeft(2, '0');
    final ss = (total % 60).toString().padLeft(2, '0');
    return '$mm:$ss';
  }

  @override
  Widget build(BuildContext context) {
    final fontSize = 16.0 * widget.fontScale;
    const amber = Color(0xFFFFC107);

    return AnimatedSlide(
      offset: widget.visible ? Offset.zero : const Offset(0, -1.5),
      duration: const Duration(milliseconds: 450),
      curve: widget.visible ? Curves.easeOutBack : Curves.easeInCubic,
      child: Align(
        alignment: Alignment.topCenter,
        child: Padding(
          padding: const EdgeInsets.only(top: 24),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: BackdropFilter(
              filter: ui.ImageFilter.blur(sigmaX: 8, sigmaY: 8),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.black.withAlpha(178), // ~70%
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(
                    color: amber.withAlpha(77), // ~30%
                    width: 1.0,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Pulsing amber dot
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 600),
                      curve: Curves.easeInOut,
                      width: _dotLarge ? 10 : 8,
                      height: _dotLarge ? 10 : 8,
                      decoration: BoxDecoration(
                        color: amber,
                        shape: BoxShape.circle,
                        boxShadow: _dotLarge
                            ? [
                                BoxShadow(
                                  color: amber.withAlpha(120),
                                  blurRadius: 6,
                                  spreadRadius: 1,
                                ),
                              ]
                            : null,
                      ),
                    ),
                    const SizedBox(width: 10),

                    // Countdown text
                    Text(
                      '${widget.prayerName} in ${_formatCountdown(_remaining)}',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: fontSize,
                        fontWeight: FontWeight.w500,
                        fontFeatures: const [FontFeature.tabularFigures()],
                      ),
                    ),
                    const SizedBox(width: 10),

                    // Bell icon
                    const Icon(
                      Icons.notifications_active,
                      color: amber,
                      size: 18,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
