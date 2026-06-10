// P-2: Prayer card grid redesign
// L-5: Prayer-complete badge overlay (green checkmark from SSE event)
//
// A 3×2 grid of prayer time cards covering all 6 prayers: Fajr, Sunrise,
// Dhuhr, Asr, Maghrib, Isha. The current prayer card pulses with a green
// animated dot; past cards are dimmed; future cards are subtle.
// When a prayer_complete event arrives via TvSseService, the card for that
// prayer shows a green checkmark badge in the top-right corner.

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

// ─── Enums & data ─────────────────────────────────────────────────────────────

/// Rendering state for a single prayer card.
enum PrayerCardState { past, current, next, future }

/// All data needed to render one prayer card.
class PrayerCardData {
  final String nameArabic;
  final String nameEnglish;
  final String timeFormatted;
  final PrayerCardState state;

  /// Asset path for the prayer icon, e.g. `assets/tv/prayer_icons/fajr.svg`.
  final String iconPath;

  const PrayerCardData({
    required this.nameArabic,
    required this.nameEnglish,
    required this.timeFormatted,
    required this.state,
    required this.iconPath,
  });
}

// ─── Grid widget ──────────────────────────────────────────────────────────────

/// Displays [prayers] (exactly 6 expected) in a 3-column grid.
///
/// [fontScale]        — multiplied against all text sizes; useful for larger screens.
/// [completedPrayers] — L-5: set of prayer names that received a prayer_complete event.
///                      Cards whose [PrayerCardData.nameEnglish] is in this set show
///                      a green checkmark badge.
class TvPrayerGrid extends StatelessWidget {
  const TvPrayerGrid({
    super.key,
    required this.prayers,
    this.fontScale = 1.0,
    this.completedPrayers = const {},
  });

  final List<PrayerCardData> prayers;
  final double fontScale;
  final Set<String> completedPrayers;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 3,
      childAspectRatio: 1.4,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: prayers
          .map((p) => _TvPrayerCard(
                data: p,
                fontScale: fontScale,
                completed: completedPrayers.contains(p.nameEnglish),
              ))
          .toList(),
    );
  }
}

// ─── Single prayer card ───────────────────────────────────────────────────────

class _TvPrayerCard extends StatefulWidget {
  const _TvPrayerCard({
    required this.data,
    required this.fontScale,
    this.completed = false,
  });

  final PrayerCardData data;
  final double fontScale;
  // L-5: true when a prayer_complete SSE event was received for this prayer
  final bool completed;

  @override
  State<_TvPrayerCard> createState() => _TvPrayerCardState();
}

class _TvPrayerCardState extends State<_TvPrayerCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulse;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
      lowerBound: 0.0,
      upperBound: 1.0,
    );
    _scale = Tween<double>(begin: 0.8, end: 1.2).animate(
      CurvedAnimation(parent: _pulse, curve: Curves.easeInOut),
    );
    if (widget.data.state == PrayerCardState.current) {
      _pulse.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(_TvPrayerCard old) {
    super.didUpdateWidget(old);
    if (widget.data.state == PrayerCardState.current) {
      if (!_pulse.isAnimating) _pulse.repeat(reverse: true);
    } else {
      if (_pulse.isAnimating) _pulse.stop();
    }
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  // ── Appearance helpers ────────────────────────────────────────────────────

  Color get _bgColor {
    switch (widget.data.state) {
      case PrayerCardState.current:
        return const Color(0xFF1E5E2F);
      case PrayerCardState.next:
        return const Color(0xFF0D2F17);
      case PrayerCardState.past:
        return Colors.black.withValues(alpha: 0.30);
      case PrayerCardState.future:
        return Colors.black.withValues(alpha: 0.15);
    }
  }

  Color get _borderColor {
    switch (widget.data.state) {
      case PrayerCardState.current:
        return PrayCalcColors.light.withValues(alpha: 0.50);
      case PrayerCardState.next:
        return PrayCalcColors.mid.withValues(alpha: 0.30);
      case PrayerCardState.past:
        return Colors.white.withValues(alpha: 0.10);
      case PrayerCardState.future:
        return Colors.white.withValues(alpha: 0.08);
    }
  }

  double get _cardOpacity =>
      widget.data.state == PrayerCardState.past ? 0.6 : 1.0;

  Widget _statusDot() {
    switch (widget.data.state) {
      case PrayerCardState.current:
        return AnimatedBuilder(
          animation: _scale,
          builder: (_, _) => Transform.scale(
            scale: _scale.value,
            child: Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(
                color: PrayCalcColors.mid,
                shape: BoxShape.circle,
              ),
            ),
          ),
        );
      case PrayerCardState.next:
        return Container(
          width: 6,
          height: 6,
          decoration: const BoxDecoration(
            color: Colors.amber,
            shape: BoxShape.circle,
          ),
        );
      case PrayerCardState.past:
        return Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.35),
            shape: BoxShape.circle,
          ),
        );
      case PrayerCardState.future:
        return const SizedBox(width: 6, height: 6);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fs = widget.fontScale;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Opacity(
          opacity: _cardOpacity,
          child: Container(
        decoration: BoxDecoration(
          color: _bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _borderColor, width: 1),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Arabic prayer name
            Text(
              widget.data.nameArabic,
              textAlign: TextAlign.center,
              textDirection: TextDirection.rtl,
              style: TextStyle(
                fontFamily: 'Amiri',
                fontSize: 20 * fs,
                color: Colors.white,
                height: 1.3,
              ),
            ),
            const SizedBox(height: 2),
            // English prayer name
            Text(
              widget.data.nameEnglish,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14 * fs,
                color: Colors.white.withValues(alpha: 0.60),
              ),
            ),
            const SizedBox(height: 6),
            // Prayer time
            Text(
              widget.data.timeFormatted,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 22 * fs,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 6),
            // Status dot
            _statusDot(),
          ],
        ),
      ),
    ),

    // L-5: Prayer-complete badge — green checkmark in top-right corner
    if (widget.completed)
      Positioned(
        top: 6,
        right: 6,
        child: Container(
          width: 22,
          height: 22,
          decoration: const BoxDecoration(
            color: Color(0xFF1E5E2F),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.check,
            color: Colors.white,
            size: 14,
          ),
        ),
      ),
  ],
);
  }
}
