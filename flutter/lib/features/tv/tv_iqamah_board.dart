// P-10: Iqamah board mode
//
// A full-screen display that takes over the TV when iqamah is imminent
// (within [thresholdSeconds] of the iqamah time). Shows:
//   - Large Arabic "الإقامة" header
//   - Prayer name + countdown in flip digits
//   - "Straighten your rows" / "استووا" reminder
//
// The board fades in when [secondsRemaining] <= [thresholdSeconds],
// and fades out when the countdown reaches 0 (caller removes the widget).

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import 'tv_countdown_flip.dart';

/// Full-screen iqamah countdown board.
///
/// [prayerName]       — e.g. "Dhuhr", "Asr".
/// [secondsRemaining] — live countdown value supplied by parent every second.
/// [thresholdSeconds] — board becomes visible when <= this value (default 120).
class TvIqamahBoard extends StatefulWidget {
  const TvIqamahBoard({
    super.key,
    required this.prayerName,
    required this.secondsRemaining,
    this.thresholdSeconds = 120,
  });

  final String prayerName;
  final int secondsRemaining;
  final int thresholdSeconds;

  @override
  State<TvIqamahBoard> createState() => _TvIqamahBoardState();
}

class _TvIqamahBoardState extends State<TvIqamahBoard>
    with SingleTickerProviderStateMixin {
  late AnimationController _fade;

  @override
  void initState() {
    super.initState();
    _fade = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
      value: widget.secondsRemaining <= widget.thresholdSeconds ? 0.0 : 0.0,
    );
    if (widget.secondsRemaining <= widget.thresholdSeconds) {
      _fade.forward();
    }
  }

  @override
  void didUpdateWidget(TvIqamahBoard old) {
    super.didUpdateWidget(old);
    if (old.secondsRemaining > widget.thresholdSeconds &&
        widget.secondsRemaining <= widget.thresholdSeconds) {
      _fade.forward();
    }
  }

  @override
  void dispose() {
    _fade.dispose();
    super.dispose();
  }

  String _countdown(int s) {
    final m = (s ~/ 60).toString().padLeft(2, '0');
    final sec = (s % 60).toString().padLeft(2, '0');
    return '$m:$sec';
  }

  @override
  Widget build(BuildContext context) {
    if (widget.secondsRemaining > widget.thresholdSeconds) {
      return const SizedBox.shrink();
    }

    final isUrgent = widget.secondsRemaining <= 30;

    return FadeTransition(
      opacity: _fade,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.center,
            radius: 0.9,
            colors: [
              PrayCalcColors.deep.withValues(alpha: 0.97),
              Colors.black.withValues(alpha: 0.99),
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Arabic "الإقامة" header
              Text(
                'الإقامة',
                style: TextStyle(
                  fontFamily: 'Amiri',
                  fontSize: 64,
                  height: 1.2,
                  color: PrayCalcColors.light,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),

              // English label
              Text(
                'Iqamah — ${widget.prayerName}',
                style: TextStyle(
                  fontSize: 22,
                  color: Colors.white.withValues(alpha: 0.7),
                  letterSpacing: 1.5,
                  fontWeight: FontWeight.w400,
                ),
              ),
              const SizedBox(height: 40),

              // Flip countdown
              TvCountdownFlip(
                time: _countdown(widget.secondsRemaining),
                digitFontSize: 72,
              ),
              const SizedBox(height: 48),

              // Straighten-rows reminder (shown in last 60 seconds)
              AnimatedOpacity(
                opacity: widget.secondsRemaining <= 60 ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 600),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'استووا وتراصّوا',
                      style: TextStyle(
                        fontFamily: 'Amiri',
                        fontSize: 36,
                        color: isUrgent
                            ? PrayCalcColors.light
                            : Colors.white.withValues(alpha: 0.75),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Straighten and close your rows',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white.withValues(alpha: 0.55),
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
