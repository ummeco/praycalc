import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../shared/models/tv_settings_model.dart';

/// Announcement carousel for masjid mode.
///
/// Rotates through a list of [Announcement] objects with a 10-second interval
/// and a fade transition. Automatically hides expired announcements and
/// supports RTL text (Arabic). Maximum 10 announcements.
class TvAnnouncementOverlay extends StatefulWidget {
  const TvAnnouncementOverlay({
    super.key,
    required this.announcements,
  });

  final List<Announcement> announcements;

  @override
  State<TvAnnouncementOverlay> createState() => _TvAnnouncementOverlayState();
}

class _TvAnnouncementOverlayState extends State<TvAnnouncementOverlay> {
  late Timer _rotationTimer;
  int _currentIndex = 0;

  List<Announcement> get _active =>
      widget.announcements.where((a) => !a.isExpired).take(10).toList();

  @override
  void initState() {
    super.initState();
    _rotationTimer = Timer.periodic(
      const Duration(seconds: 10),
      (_) => _advance(),
    );
  }

  @override
  void didUpdateWidget(TvAnnouncementOverlay oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Reset index if announcements list changed.
    if (widget.announcements.length != oldWidget.announcements.length) {
      final active = _active;
      if (_currentIndex >= active.length) {
        _currentIndex = 0;
      }
    }
  }

  void _advance() {
    final active = _active;
    if (active.isEmpty) return;
    setState(() {
      _currentIndex = (_currentIndex + 1) % active.length;
    });
  }

  @override
  void dispose() {
    _rotationTimer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final active = _active;
    if (active.isEmpty) return const SizedBox.shrink();

    final safeIndex = _currentIndex.clamp(0, active.length - 1);
    final announcement = active[safeIndex];

    // Detect RTL: simple heuristic based on first character being Arabic.
    final isRtl = announcement.body.isNotEmpty &&
        _isArabicChar(announcement.body.codeUnitAt(0));

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 10),
      decoration: BoxDecoration(
        color: PrayCalcColors.dark.withAlpha(180),
        borderRadius: BorderRadius.circular(12),
      ),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 600),
        transitionBuilder: (child, animation) =>
            FadeTransition(opacity: animation, child: child),
        child: Row(
          key: ValueKey(announcement.id),
          textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
          children: [
            const Icon(Icons.campaign, color: PrayCalcColors.light, size: 28),
            const SizedBox(width: 16),
            // Title
            if (announcement.title.isNotEmpty) ...[
              Text(
                announcement.title,
                style: const TextStyle(
                  color: PrayCalcColors.light,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
                textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
              ),
              const SizedBox(width: 16),
              Container(width: 1, height: 24, color: Colors.white24),
              const SizedBox(width: 16),
            ],
            // Body
            Expanded(
              child: Text(
                announcement.body,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
              ),
            ),
            // Page indicator
            if (active.length > 1) ...[
              const SizedBox(width: 16),
              Text(
                '${safeIndex + 1}/${active.length}',
                style: const TextStyle(color: Colors.white38, fontSize: 18),
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Check if a Unicode code unit falls in the Arabic block.
  bool _isArabicChar(int codeUnit) =>
      (codeUnit >= 0x0600 && codeUnit <= 0x06FF) ||
      (codeUnit >= 0x0750 && codeUnit <= 0x077F) ||
      (codeUnit >= 0xFB50 && codeUnit <= 0xFDFF) ||
      (codeUnit >= 0xFE70 && codeUnit <= 0xFEFF);
}
