import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

const _arabicNames = {
  'Fajr':    'الفجر',
  'Dhuhr':   'الظهر',
  'Asr':     'العصر',
  'Maghrib': 'المغرب',
  'Isha':    'العشاء',
};

/// Full-screen adhan overlay shown when a wajib prayer time begins (foreground only).
/// Auto-dismisses after [_autoDismissMinutes] minutes.
class AdhanModal extends StatefulWidget {
  const AdhanModal({super.key, required this.prayerName});

  final String prayerName;

  /// Show the adhan modal for [prayerName] from [context].
  /// No-op if [prayerName] has no Arabic translation (i.e., non-fard prayer).
  static Future<void> show(BuildContext context, String prayerName) {
    return showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Dismiss adhan',
      barrierColor: Colors.black.withAlpha(160),
      transitionDuration: const Duration(milliseconds: 220),
      transitionBuilder: (ctx, anim, _, child) {
        final curved = CurvedAnimation(parent: anim, curve: Curves.easeOutBack);
        return FadeTransition(
          opacity: anim,
          child: ScaleTransition(scale: Tween(begin: 0.88, end: 1.0).animate(curved), child: child),
        );
      },
      pageBuilder: (ctx, anim1, anim2) => AdhanModal(prayerName: prayerName),
    );
  }

  @override
  State<AdhanModal> createState() => _AdhanModalState();
}

class _AdhanModalState extends State<AdhanModal> {
  static const _autoDismissMinutes = 3;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer(const Duration(minutes: _autoDismissMinutes), () {
      if (mounted) Navigator.of(context).pop();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final arabicName = _arabicNames[widget.prayerName];
    return Center(
      child: Material(
        color: Colors.transparent,
        child: Container(
          width: 280,
          padding: const EdgeInsets.fromLTRB(28, 28, 28, 24),
          decoration: BoxDecoration(
            color: const Color(0xFF062030),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: const Color(0xFF2196F3).withAlpha(50),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: PrayCalcColors.mid.withAlpha(40),
                blurRadius: 32,
                spreadRadius: 4,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Label
              Text(
                'PRAYER TIME',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 2.5,
                  color: const Color(0xFF64B5F6).withAlpha(200),
                ),
              ),

              const SizedBox(height: 18),

              // Arabic name
              if (arabicName != null)
                Text(
                  arabicName,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 52,
                    color: PrayCalcColors.light,
                    height: 1.1,
                  ),
                ),

              const SizedBox(height: 10),

              // English name
              Text(
                widget.prayerName,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                  letterSpacing: -0.3,
                ),
              ),

              const SizedBox(height: 20),

              // Divider
              Container(
                height: 1,
                color: PrayCalcColors.mid.withAlpha(60),
              ),

              const SizedBox(height: 20),

              // Close button
              OutlinedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: OutlinedButton.styleFrom(
                  foregroundColor: PrayCalcColors.light,
                  side: BorderSide(color: PrayCalcColors.mid.withAlpha(140)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  minimumSize: const Size(double.infinity, 44),
                ),
                child: const Text(
                  'Close',
                  style: TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
