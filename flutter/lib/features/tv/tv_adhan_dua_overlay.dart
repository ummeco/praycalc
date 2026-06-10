// P-12: Post-adhan calligraphy dua overlay
//
// Shown immediately after the adhan alert dismisses. Displays the post-adhan
// dua in Arabic calligraphy (Amiri font) with transliteration and English
// translation. Fades in over 600 ms, holds for [holdSeconds], then fades out
// and calls [onDone] so the parent can remove it from the tree.

import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Post-adhan dua overlay.
///
/// Mount this widget and it will display the dua for [holdSeconds] (default 8),
/// then call [onDone]. Wire in from the parent by wrapping the screen body in
/// a [Stack] and toggling visibility via a bool in state.
class TvAdhanDuaOverlay extends StatefulWidget {
  const TvAdhanDuaOverlay({
    super.key,
    this.holdSeconds = 8,
    required this.onDone,
  });

  final int holdSeconds;
  final VoidCallback onDone;

  @override
  State<TvAdhanDuaOverlay> createState() => _TvAdhanDuaOverlayState();
}

class _TvAdhanDuaOverlayState extends State<TvAdhanDuaOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fadeIn;
  late Animation<double> _fadeOut;
  Timer? _holdTimer;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeIn = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _fadeOut = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);

    // Fade in, hold, fade out.
    _ctrl.forward().then((_) {
      _holdTimer = Timer(Duration(seconds: widget.holdSeconds), () {
        if (!mounted) return;
        _ctrl.reverse().then((_) {
          if (mounted) widget.onDone();
        });
      });
    });
  }

  @override
  void dispose() {
    _holdTimer?.cancel();
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Use FadeIn for entry, FadeOut for exit based on animation direction.
    final opacity = _ctrl.status == AnimationStatus.reverse
        ? _fadeOut
        : _fadeIn;

    return FadeTransition(
      opacity: opacity,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.center,
            radius: 1.0,
            colors: [
              Colors.black.withValues(alpha: 0.82),
              Colors.black.withValues(alpha: 0.95),
            ],
          ),
        ),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 760),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Decorative top line.
                  _DividerLine(),
                  const SizedBox(height: 28),

                  // Arabic dua — Amiri, RTL.
                  const Text(
                    'اللَّهُمَّ رَبَّ هَٰذِهِ الدَّعْوَةِ التَّامَّةِ\n'
                    'وَالصَّلَاةِ الْقَائِمَةِ\n'
                    'آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ\n'
                    'وَابْعَثْهُ مَقَامًا مَّحْمُودًا الَّذِي وَعَدْتَهُ',
                    textAlign: TextAlign.center,
                    textDirection: TextDirection.rtl,
                    style: TextStyle(
                      fontFamily: 'Amiri',
                      fontSize: 30,
                      height: 1.9,
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Transliteration.
                  Text(
                    'Allahumma Rabba hadhihi al-da\'wati al-tammah\n'
                    'wa al-salati al-qa\'imah\n'
                    'ati Muhammadan al-wasilata wa al-fadilah\n'
                    'wab\'ath-hu maqaman mahmudani alladhi wa\'adtah',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.7,
                      color: Colors.white.withValues(alpha: 0.55),
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  const SizedBox(height: 18),

                  // English translation.
                  const Text(
                    '"O Allah, Lord of this perfect call and the prayer '
                    'about to be established,\ngrant Muhammad the intercession '
                    'and the favour, and raise him to the praised station\n'
                    'that You have promised him."',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      height: 1.6,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Reference.
                  Text(
                    'Sahih al-Bukhari 614',
                    style: TextStyle(
                      fontSize: 13,
                      color: PrayCalcColors.mid,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 28),
                  _DividerLine(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _DividerLine extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(height: 1, color: PrayCalcColors.mid.withValues(alpha: 0.3)),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Icon(Icons.star, size: 14, color: PrayCalcColors.mid.withValues(alpha: 0.6)),
        ),
        Expanded(
          child: Container(height: 1, color: PrayCalcColors.mid.withValues(alpha: 0.3)),
        ),
      ],
    );
  }
}
