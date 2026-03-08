import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// Small green check badge shown next to a prayer when marked as prayed.
class TvPrayerCompletionBadge extends StatelessWidget {
  const TvPrayerCompletionBadge({super.key, required this.completed});
  final bool completed;

  @override
  Widget build(BuildContext context) {
    if (!completed) return const SizedBox(width: 24);
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        color: PrayCalcColors.mid.withAlpha(40),
        shape: BoxShape.circle,
      ),
      child: Icon(
        Icons.check,
        color: PrayCalcColors.light,
        size: 16,
      ),
    );
  }
}
