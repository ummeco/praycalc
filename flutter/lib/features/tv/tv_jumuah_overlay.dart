import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// TvJumuahOverlay — Friday Jumu'ah banner (TV2-9.2)
// ---------------------------------------------------------------------------

/// A top banner shown on Fridays between 11:00 and 14:00 local time.
///
/// Displays "Jumu'ah Mubarak" with a countdown to the khutbah start time
/// configured in TvSettings ([khutbahHour] / [khutbahMinute], default 13:30).
class TvJumuahOverlay extends StatelessWidget {
  const TvJumuahOverlay({
    super.key,
    required this.now,
    this.khutbahHour = 13,
    this.khutbahMinute = 30,
  });

  final DateTime now;

  /// Hour (0–23) of the Jumu'ah khutbah start time.
  final int khutbahHour;

  /// Minute (0–59) of the Jumu'ah khutbah start time.
  final int khutbahMinute;

  /// Returns true when the banner should be visible:
  /// - Today is Friday
  /// - Local time is between 11:00 and 14:00
  static bool shouldShow(DateTime now) {
    return now.weekday == DateTime.friday &&
        now.hour >= 11 &&
        now.hour < 14;
  }

  String _countdown() {
    final khutbah = DateTime(
      now.year,
      now.month,
      now.day,
      khutbahHour,
      khutbahMinute,
    );
    final diff = khutbah.difference(now);
    if (diff.isNegative) return 'Now';
    final h = diff.inHours;
    final m = diff.inMinutes.remainder(60);
    final s = diff.inSeconds.remainder(60);
    if (h > 0) {
      return '${h}h ${m.toString().padLeft(2, '0')}m';
    }
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final countdown = _countdown();
    final khutbahStarted = now.hour > khutbahHour ||
        (now.hour == khutbahHour && now.minute >= khutbahMinute);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF7B5E00).withAlpha(230),
            const Color(0xFFB8860B).withAlpha(230),
            const Color(0xFF7B5E00).withAlpha(230),
          ],
        ),
        border: const Border(
          bottom: BorderSide(color: Color(0xFFFFD700), width: 1),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            '🕌',
            style: TextStyle(fontSize: 28),
          ),
          const SizedBox(width: 16),
          Text(
            'Jumu\'ah Mubarak',
            style: const TextStyle(
              color: Color(0xFFFFD700),
              fontSize: 28,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(width: 24),
          Container(
            width: 1,
            height: 28,
            color: Colors.white24,
          ),
          const SizedBox(width: 24),
          Text(
            khutbahStarted
                ? 'Khutbah in progress'
                : 'Khutbah begins in $countdown',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
            ),
          ),
        ],
      ),
    );
  }
}
