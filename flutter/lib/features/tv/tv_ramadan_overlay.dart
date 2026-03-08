import 'package:flutter/material.dart';
import 'package:hijri/hijri_calendar.dart';
import '../../core/theme/app_theme.dart';

/// Returns true if the current Hijri date is in Ramadan (month 9).
bool get isRamadan {
  final hijri = HijriCalendar.now();
  return hijri.hMonth == 9;
}

/// Returns current Ramadan day (1-30), or 0 if not Ramadan.
int get ramadanDay {
  if (!isRamadan) return 0;
  return HijriCalendar.now().hDay;
}

/// Badge showing "Day N of Ramadan" — displayed in top corner during Ramadan.
class RamadanDayBadge extends StatelessWidget {
  const RamadanDayBadge({super.key});

  @override
  Widget build(BuildContext context) {
    final day = ramadanDay;
    if (day == 0) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1E5E2F),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Color(0xFF79C24C), width: 1),
      ),
      child: Text(
        'Day $day of Ramadan',
        style: const TextStyle(
          color: Color(0xFFC9F27A),
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

/// Large countdown widget showing time until Iftar (Maghrib) or Suhoor (Fajr).
/// [targetTimeHours] is the fractional-hour time of the target prayer.
/// [label] is "Iftar" or "Suhoor".
class RamadanCountdown extends StatefulWidget {
  const RamadanCountdown({
    super.key,
    required this.targetTimeHours,
    required this.label,
  });

  final double targetTimeHours;
  final String label;

  @override
  State<RamadanCountdown> createState() => _RamadanCountdownState();
}

class _RamadanCountdownState extends State<RamadanCountdown> {
  late Duration _remaining;

  @override
  void initState() {
    super.initState();
    _update();
    _startTimer();
  }

  void _update() {
    final now = DateTime.now();
    final nowH = now.hour + now.minute / 60.0 + now.second / 3600.0;
    var diffH = widget.targetTimeHours - nowH;
    if (diffH < 0) diffH += 24;
    _remaining = Duration(seconds: (diffH * 3600).round());
  }

  void _startTimer() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(_update);
      return true;
    });
  }

  String _pad(int n) => n.toString().padLeft(2, '0');

  @override
  Widget build(BuildContext context) {
    final h = _remaining.inHours;
    final m = _remaining.inMinutes % 60;
    final s = _remaining.inSeconds % 60;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          widget.label,
          style: TextStyle(
            color: PrayCalcColors.light,
            fontSize: 24,
            fontWeight: FontWeight.w600,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '${_pad(h)}:${_pad(m)}:${_pad(s)}',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 56,
            fontWeight: FontWeight.bold,
            fontFeatures: [FontFeature.tabularFigures()],
          ),
        ),
      ],
    );
  }
}
