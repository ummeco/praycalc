// P-6: Countdown number flip animation
//
// Displays a countdown string (e.g. "01:23:45") with a per-digit vertical
// slide animation (100 ms) whenever a digit value changes. Colons are static.
// Each digit sits in a dark rounded tile container.

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Flip-digit countdown display. Accepts a pre-formatted HH:MM:SS string.
/// Each digit that changes slides in from below while the previous slides out
/// upward, giving a classic split-flap clock feel.
class TvCountdownFlip extends StatefulWidget {
  const TvCountdownFlip({
    super.key,
    required this.time,
    this.digitFontSize = 40,
  });

  /// Pre-formatted time string — e.g. "01:23:45" or "--:--:--".
  final String time;

  /// Font size for each digit tile.
  final double digitFontSize;

  @override
  State<TvCountdownFlip> createState() => _TvCountdownFlipState();
}

class _TvCountdownFlipState extends State<TvCountdownFlip> {
  late List<String> _chars;

  @override
  void initState() {
    super.initState();
    _chars = widget.time.split('');
  }

  @override
  void didUpdateWidget(TvCountdownFlip old) {
    super.didUpdateWidget(old);
    if (old.time != widget.time) {
      setState(() => _chars = widget.time.split(''));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(_chars.length, (i) {
        final c = _chars[i];
        if (c == ':') {
          return _ColonSeparator(fontSize: widget.digitFontSize);
        }
        return _FlipDigit(
          // Use positional key so each slot keeps its own AnimationController.
          key: ValueKey('fd_$i'),
          value: c,
          fontSize: widget.digitFontSize,
        );
      }),
    );
  }
}

// ─── Single animated digit tile ─────────────────────────────────────────────

class _FlipDigit extends StatefulWidget {
  const _FlipDigit({
    super.key,
    required this.value,
    required this.fontSize,
  });

  final String value;
  final double fontSize;

  @override
  State<_FlipDigit> createState() => _FlipDigitState();
}

class _FlipDigitState extends State<_FlipDigit>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<Offset> _incoming; // bottom → centre
  late Animation<Offset> _outgoing; // centre → top
  String _prev = '';

  @override
  void initState() {
    super.initState();
    _prev = widget.value;
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
    );
    _incoming = Tween<Offset>(
      begin: const Offset(0, 1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    _outgoing = Tween<Offset>(
      begin: Offset.zero,
      end: const Offset(0, -1),
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeIn));
  }

  @override
  void didUpdateWidget(_FlipDigit old) {
    super.didUpdateWidget(old);
    if (old.value != widget.value) {
      _prev = old.value;
      _ctrl.forward(from: 0).whenComplete(() {
        if (mounted) setState(() => _prev = widget.value);
      });
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tileSize = widget.fontSize * 1.45;
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (ctx, _) {
        final animating = _ctrl.status == AnimationStatus.forward;
        return Container(
          width: tileSize,
          height: tileSize,
          margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(
            color: PrayCalcColors.dark,
            borderRadius: BorderRadius.circular(8),
          ),
          clipBehavior: Clip.hardEdge,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Outgoing digit slides upward during animation.
              if (animating)
                FractionalTranslation(
                  translation: _outgoing.value,
                  child: _DigitText(value: _prev, fontSize: widget.fontSize),
                ),
              // Incoming digit slides in from below, or sits static.
              FractionalTranslation(
                translation: animating ? _incoming.value : Offset.zero,
                child: _DigitText(
                  value: widget.value,
                  fontSize: widget.fontSize,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

class _DigitText extends StatelessWidget {
  const _DigitText({required this.value, required this.fontSize});
  final String value;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    return Text(
      value,
      style: TextStyle(
        color: Colors.white,
        fontSize: fontSize,
        fontWeight: FontWeight.bold,
        height: 1,
        fontFeatures: const [FontFeature.tabularFigures()],
      ),
    );
  }
}

class _ColonSeparator extends StatelessWidget {
  const _ColonSeparator({required this.fontSize});
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Text(
        ':',
        style: TextStyle(
          color: PrayCalcColors.mid,
          fontSize: fontSize * 0.9,
          fontWeight: FontWeight.bold,
          height: 1,
        ),
      ),
    );
  }
}
