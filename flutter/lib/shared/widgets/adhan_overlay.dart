import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// Arabic names for the five fard prayers.
const _arabicPrayerNames = <String, String>{
  'Fajr': 'الفجر',
  'Dhuhr': 'الظهر',
  'Asr': 'العصر',
  'Maghrib': 'المغرب',
  'Isha': 'العشاء',
};

/// Show a full-screen adhan overlay.
///
/// Auto-dismisses after 30 seconds or when the user taps Close.
void showAdhanOverlay(
  BuildContext context, {
  required String prayerNameEn,
  String? prayerNameAr,
}) {
  final arabic = prayerNameAr ?? _arabicPrayerNames[prayerNameEn] ?? prayerNameEn;

  showGeneralDialog(
    context: context,
    barrierDismissible: true,
    barrierLabel: 'Dismiss adhan overlay',
    barrierColor: Colors.transparent,
    transitionDuration: const Duration(milliseconds: 400),
    transitionBuilder: (context, primary, secondary, child) {
      final curve = CurvedAnimation(parent: primary, curve: Curves.easeOutCubic);
      return FadeTransition(
        opacity: curve,
        child: ScaleTransition(
          scale: Tween<double>(begin: 0.85, end: 1.0).animate(curve),
          child: child,
        ),
      );
    },
    pageBuilder: (context, animation, secondaryAnimation) {
      return _AdhanOverlay(
        prayerNameEn: prayerNameEn,
        prayerNameAr: arabic,
      );
    },
  );
}

class _AdhanOverlay extends StatefulWidget {
  const _AdhanOverlay({
    required this.prayerNameEn,
    required this.prayerNameAr,
  });

  final String prayerNameEn;
  final String prayerNameAr;

  @override
  State<_AdhanOverlay> createState() => _AdhanOverlayState();
}

class _AdhanOverlayState extends State<_AdhanOverlay> {
  Timer? _autoDismissTimer;

  @override
  void initState() {
    super.initState();
    _autoDismissTimer = Timer(const Duration(seconds: 30), _dismiss);
  }

  @override
  void dispose() {
    _autoDismissTimer?.cancel();
    super.dispose();
  }

  void _dismiss() {
    if (mounted && Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Frosted glass background
          BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              color: PrayCalcColors.deep.withAlpha(217), // ~85% opacity
            ),
          ),

          // Content
          SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 3),

                // Center card
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 40),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 36,
                    vertical: 40,
                  ),
                  decoration: BoxDecoration(
                    color: PrayCalcColors.deep.withAlpha(180),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: PrayCalcColors.light.withAlpha(40),
                      width: 1.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: PrayCalcColors.light.withAlpha(15),
                        blurRadius: 40,
                        spreadRadius: 8,
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // "PRAYER TIME" label
                      Text(
                        'PRAYER TIME',
                        style: TextStyle(
                          color: PrayCalcColors.light.withAlpha(180),
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 3,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Arabic prayer name
                      Text(
                        widget.prayerNameAr,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.w700,
                          height: 1.2,
                        ),
                        textDirection: TextDirection.rtl,
                      ),
                      const SizedBox(height: 8),

                      // English prayer name
                      Text(
                        widget.prayerNameEn,
                        style: TextStyle(
                          color: Colors.white.withAlpha(200),
                          fontSize: 18,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),

                const Spacer(flex: 3),

                // Close button
                TextButton(
                  onPressed: _dismiss,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 48,
                      vertical: 14,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                      side: BorderSide(
                        color: Colors.white.withAlpha(60),
                      ),
                    ),
                  ),
                  child: Text(
                    'Close',
                    style: TextStyle(
                      color: Colors.white.withAlpha(200),
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),

                const SizedBox(height: 48),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
