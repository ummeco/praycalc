// P-14: "Good Night" Isha mode overlay
//
// A semi-transparent dimming overlay that appears [delayMinutes] after Isha
// and shows the next Fajr time in a compact pill. Audio is not controlled
// here — the caller may fade media independently via TvAdhanAudioCoordinator.
//
// The overlay dismisses automatically when Fajr time is reached.

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Dimming overlay shown after Isha. Displays a night pill with Fajr time.
///
/// [fajrTime] — pre-formatted Fajr time string (e.g. "5:12 AM" or "05:12").
/// [onDismiss] — called when user presses OK / select on D-pad.
class TvGoodNightOverlay extends StatefulWidget {
  const TvGoodNightOverlay({
    super.key,
    required this.fajrTime,
    required this.onDismiss,
  });

  final String fajrTime;
  final VoidCallback onDismiss;

  @override
  State<TvGoodNightOverlay> createState() => _TvGoodNightOverlayState();
}

class _TvGoodNightOverlayState extends State<TvGoodNightOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _fade;
  late Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _fade = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();
    _opacity = CurvedAnimation(parent: _fade, curve: Curves.easeIn);
  }

  @override
  void dispose() {
    _fade.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: widget.onDismiss,
        child: Focus(
          autofocus: true,
          onKeyEvent: (_, event) {
            widget.onDismiss();
            return KeyEventResult.handled;
          },
          child: Container(
            color: Colors.black.withAlpha(178), // ~70% dim
            alignment: Alignment.center,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Moon icon
                const Icon(
                  Icons.nightlight_round,
                  color: Colors.white54,
                  size: 72,
                ),
                const SizedBox(height: 24),
                // Good night pill
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 48, vertical: 20),
                  decoration: BoxDecoration(
                    color: PrayCalcColors.deep.withAlpha(230),
                    borderRadius: BorderRadius.circular(48),
                    border: Border.all(
                        color: PrayCalcColors.mid.withAlpha(80), width: 1.5),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'Good Night',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 44,
                          fontWeight: FontWeight.w300,
                          letterSpacing: 2,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.wb_sunny_outlined,
                              color: PrayCalcColors.mid, size: 24),
                          const SizedBox(width: 8),
                          Text(
                            'Fajr at ${widget.fajrTime}',
                            style: const TextStyle(
                              color: PrayCalcColors.light,
                              fontSize: 28,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                Text(
                  'Press any key to dismiss',
                  style: TextStyle(
                    color: Colors.white.withAlpha(77),
                    fontSize: 20,
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
