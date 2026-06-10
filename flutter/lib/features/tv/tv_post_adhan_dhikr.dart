import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// P-12: Post-adhan calligraphy dua overlay.
///
/// Shown for 45 seconds after the adhan is dismissed. Displays the dua after
/// the adhan in Arabic with transliteration and English translation. Calls
/// [onDismiss] when the timer elapses or the user presses OK / the D-pad
/// select button.
class TvPostAdhanDhikr extends StatefulWidget {
  const TvPostAdhanDhikr({
    super.key,
    required this.prayerName,
    required this.onDismiss,
  });

  /// Name of the prayer whose adhan just completed (reserved for future
  /// per-prayer dua customisation).
  final String prayerName;

  /// Called when the 45-second timer elapses or the user skips.
  final VoidCallback onDismiss;

  @override
  State<TvPostAdhanDhikr> createState() => _TvPostAdhanDhikrState();
}

class _TvPostAdhanDhikrState extends State<TvPostAdhanDhikr>
    with SingleTickerProviderStateMixin {
  static const _totalSeconds = 45;

  late AnimationController _fadeController;
  late Animation<double> _fadeAnim;

  Timer? _ticker;
  int _secondsLeft = _totalSeconds;

  final _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnim = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeIn,
    );
    _fadeController.forward();

    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        _secondsLeft--;
        if (_secondsLeft <= 0) {
          _ticker?.cancel();
          widget.onDismiss();
        }
      });
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _fadeController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  double get _progress => _secondsLeft / _totalSeconds;

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnim,
      child: KeyboardListener(
        focusNode: _focusNode,
        onKeyEvent: (event) {
          if (event is KeyDownEvent) {
            // D-pad OK / Select / Enter dismisses
            if (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter ||
                event.logicalKey == LogicalKeyboardKey.gameButtonA) {
              widget.onDismiss();
            }
          }
        },
        child: Stack(
          children: [
            // Semi-transparent dark overlay
            Positioned.fill(
              child: ColoredBox(
                color: const Color(0xFF0D1A10).withAlpha(242), // ~95%
              ),
            ),

            // Main content
            Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 800),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 48),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Arabic calligraphy
                      const Text(
                        'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ',
                        textAlign: TextAlign.center,
                        textDirection: TextDirection.rtl,
                        style: TextStyle(
                          fontFamily: 'Amiri',
                          fontSize: 52,
                          height: 1.9,
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Transliteration
                      Text(
                        'Allāhumma Rabba hādhihi al-daʿwat il-tāmmah',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          height: 1.6,
                          color: Colors.white.withAlpha(153), // ~60%
                          fontStyle: FontStyle.italic,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // English translation
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 600),
                        child: Text(
                          'O Allah, Lord of this perfect call and the prayer to be offered, '
                          'grant Muhammad the intercession and superiority, and raise him '
                          'to the praised station that You have promised him.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 18,
                            height: 1.6,
                            color: Colors.white.withAlpha(204), // ~80%
                            fontWeight: FontWeight.w300,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Attribution
                      Text(
                        'After adhan — Sahih al-Bukhari 614',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withAlpha(102), // ~40%
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      const SizedBox(height: 40),

                      // Progress bar (45s countdown)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: _progress,
                          minHeight: 3,
                          backgroundColor: Colors.white.withAlpha(30),
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            Color(0xFF79C24C), // PrayCalcColors.mid
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Skip button — bottom-right
            Positioned(
              right: 40,
              bottom: 32,
              child: TextButton(
                onPressed: widget.onDismiss,
                style: TextButton.styleFrom(
                  foregroundColor: Colors.white.withAlpha(128), // ~50%
                  textStyle: const TextStyle(fontSize: 15),
                ),
                child: const Text('Skip ›'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
