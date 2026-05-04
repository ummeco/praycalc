// praycalc/flutter/lib/shared/widgets/prayer_timeline_bar.dart
// PrayerTimelineBar — horizontal 5-prayer segmented progress bar.
// Spec §4.2, S19-C T16
//
// Used on: home screen, widget large layout, TV ambient, Watch large complication.
//
// Usage:
//   PrayerTimelineBar(
//     prayers: prayers,          // List<PrayerTimelineItem>
//     currentProgress: 0.43,     // position indicator (0.0–1.0 across the full day)
//   )

import 'package:flutter/material.dart';

/// A single entry in the prayer timeline.
class PrayerTimelineItem {
  final String name;
  final String displayTime;  // locale-formatted
  final bool isNext;
  final bool isCompleted;

  const PrayerTimelineItem({
    required this.name,
    required this.displayTime,
    required this.isNext,
    required this.isCompleted,
  });
}

/// Segmented horizontal progress bar showing 5 prayers.
/// [currentProgress] is the current time position as 0.0–1.0 of the full day.
class PrayerTimelineBar extends StatelessWidget {
  final List<PrayerTimelineItem> prayers;
  final double currentProgress;
  final double height;
  final Color completedColor;
  final Color nextColor;
  final Color pendingColor;
  final Color indicatorColor;

  static const _kDefaultCompleted = Color(0xFF79C24C);  // green-mid
  static const _kDefaultNext      = Color(0xFFC9F27A);  // green-light
  static const _kDefaultPending   = Color(0xFF2D2D2D);
  static const _kDefaultIndicator = Color(0xFFFFFFFF);

  const PrayerTimelineBar({
    super.key,
    required this.prayers,
    required this.currentProgress,
    this.height = 6.0,
    this.completedColor = _kDefaultCompleted,
    this.nextColor = _kDefaultNext,
    this.pendingColor = _kDefaultPending,
    this.indicatorColor = _kDefaultIndicator,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: _buildAccessibilityLabel(),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Prayer name labels above bar
          Row(
            children: prayers.map((p) {
              return Expanded(
                child: Center(
                  child: Text(
                    _shortName(p.name),
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: p.isNext ? FontWeight.bold : FontWeight.normal,
                      color: p.isNext
                          ? nextColor
                          : p.isCompleted
                              ? completedColor
                              : Colors.white54,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 3),
          // Segmented bar
          SizedBox(
            height: height + 8, // extra height for the indicator diamond
            child: CustomPaint(
              painter: _TimelineBarPainter(
                prayers: prayers,
                currentProgress: currentProgress.clamp(0.0, 1.0),
                completedColor: completedColor,
                nextColor: nextColor,
                pendingColor: pendingColor,
                indicatorColor: indicatorColor,
                barHeight: height,
              ),
            ),
          ),
          const SizedBox(height: 3),
          // Prayer time labels below bar
          Row(
            children: prayers.map((p) {
              return Expanded(
                child: Center(
                  child: Text(
                    p.displayTime,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: p.isNext ? FontWeight.bold : FontWeight.normal,
                      color: p.isNext
                          ? nextColor
                          : p.isCompleted
                              ? completedColor.withAlpha(178)
                              : Colors.white38,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  String _shortName(String name) {
    switch (name) {
      case 'Dhuhr':   return 'Dhr';
      case 'Maghrib': return 'Mgh';
      default:        return name.length > 4 ? name.substring(0, 3) : name;
    }
  }

  String _buildAccessibilityLabel() {
    final nextPrayer = prayers.firstWhere(
      (p) => p.isNext,
      orElse: () => prayers.last,
    );
    return 'Prayer timeline. Next: ${nextPrayer.name} at ${nextPrayer.displayTime}';
  }
}

class _TimelineBarPainter extends CustomPainter {
  final List<PrayerTimelineItem> prayers;
  final double currentProgress;
  final Color completedColor;
  final Color nextColor;
  final Color pendingColor;
  final Color indicatorColor;
  final double barHeight;

  const _TimelineBarPainter({
    required this.prayers,
    required this.currentProgress,
    required this.completedColor,
    required this.nextColor,
    required this.pendingColor,
    required this.indicatorColor,
    required this.barHeight,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (prayers.isEmpty) return;

    final count = prayers.length;
    final segmentWidth = size.width / count;
    final gapWidth = 2.0;
    final barY = (size.height - barHeight) / 2;
    final radius = Radius.circular(barHeight / 2);

    for (var i = 0; i < count; i++) {
      final prayer = prayers[i];
      final left  = i * segmentWidth + (i > 0 ? gapWidth / 2 : 0);
      final right = (i + 1) * segmentWidth - (i < count - 1 ? gapWidth / 2 : 0);

      final color = prayer.isCompleted
          ? completedColor
          : prayer.isNext
              ? nextColor.withAlpha(180)
              : pendingColor;

      final paint = Paint()..color = color;
      final rect = RRect.fromRectAndRadius(
        Rect.fromLTRB(left, barY, right, barY + barHeight),
        radius,
      );
      canvas.drawRRect(rect, paint);
    }

    // Current position indicator (small diamond / triangle)
    final indicatorX = currentProgress * size.width;
    final indicatorY = size.height / 2;
    final indicatorSize = barHeight + 2;

    final indicatorPaint = Paint()..color = indicatorColor;
    final path = Path()
      ..moveTo(indicatorX, indicatorY - indicatorSize)       // top
      ..lineTo(indicatorX + indicatorSize / 2, indicatorY)   // right
      ..lineTo(indicatorX, indicatorY + indicatorSize)       // bottom
      ..lineTo(indicatorX - indicatorSize / 2, indicatorY)   // left
      ..close();
    canvas.drawPath(path, indicatorPaint);
  }

  @override
  bool shouldRepaint(_TimelineBarPainter old) =>
      old.currentProgress != currentProgress ||
      old.prayers.length != prayers.length;
}
