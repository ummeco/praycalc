import 'package:flutter/material.dart';

import '../../shared/models/tv_settings_model.dart';

// ---------------------------------------------------------------------------
// PrayerEntry — data for a single prayer time card
// ---------------------------------------------------------------------------

class PrayerEntry {
  final String name;
  final String arabicName;
  final String time;
  final bool isNext;

  const PrayerEntry({
    required this.name,
    required this.arabicName,
    required this.time,
    this.isNext = false,
  });
}

// ---------------------------------------------------------------------------
// TvPrayerRail
// ---------------------------------------------------------------------------

/// Displays the 5 daily prayer times in a rail along one screen edge.
///
/// For [TvRailPosition.top] and [TvRailPosition.bottom] the rail is a
/// horizontal row of cards (height: 80 px). For [TvRailPosition.left] and
/// [TvRailPosition.right] the rail is a vertical column of cards
/// (width: 160 px).
class TvPrayerRail extends StatelessWidget {
  const TvPrayerRail({
    super.key,
    required this.prayers,
    required this.position,
  });

  final List<PrayerEntry> prayers;
  final TvRailPosition position;

  bool get _isHorizontal =>
      position == TvRailPosition.top || position == TvRailPosition.bottom;

  @override
  Widget build(BuildContext context) {
    final cards = _buildCards();

    if (_isHorizontal) {
      return Container(
        height: 80,
        color: Colors.black.withValues(alpha: 0.6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: _intersperse(cards, _HorizontalDivider()),
        ),
      );
    } else {
      return Container(
        width: 160,
        color: Colors.black.withValues(alpha: 0.6),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: cards,
        ),
      );
    }
  }

  List<Widget> _buildCards() {
    return prayers.map((entry) => _PrayerCard(
          entry: entry,
          isHorizontal: _isHorizontal,
        )).toList();
  }

  List<Widget> _intersperse(List<Widget> items, Widget separator) {
    if (items.isEmpty) return items;
    final result = <Widget>[];
    for (var i = 0; i < items.length; i++) {
      result.add(items[i]);
      if (i < items.length - 1) result.add(separator);
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// _PrayerCard
// ---------------------------------------------------------------------------

const _kAccent = Color(0xFFC9F27A);

class _PrayerCard extends StatelessWidget {
  const _PrayerCard({
    required this.entry,
    required this.isHorizontal,
  });

  final PrayerEntry entry;
  final bool isHorizontal;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeInOut,
      padding: isHorizontal
          ? const EdgeInsets.symmetric(horizontal: 12, vertical: 6)
          : const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: entry.isNext
            ? _kAccent.withValues(alpha: 0.15)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(6),
        border: entry.isNext
            ? Border.all(color: _kAccent.withValues(alpha: 0.5), width: 1)
            : null,
      ),
      child: isHorizontal
          ? _HorizontalCardContent(entry: entry)
          : _VerticalCardContent(entry: entry),
    );
  }
}

// ---------------------------------------------------------------------------
// _HorizontalCardContent
// ---------------------------------------------------------------------------

class _HorizontalCardContent extends StatelessWidget {
  const _HorizontalCardContent({required this.entry});
  final PrayerEntry entry;

  @override
  Widget build(BuildContext context) {
    final nameColor = entry.isNext ? _kAccent : Colors.white;
    final timeColor = entry.isNext ? _kAccent : Colors.white70;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          entry.arabicName,
          style: TextStyle(
            color: nameColor,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          entry.name,
          style: TextStyle(
            color: nameColor,
            fontSize: 11,
            fontWeight: entry.isNext ? FontWeight.w700 : FontWeight.w400,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          entry.time,
          style: TextStyle(
            color: timeColor,
            fontSize: 14,
            fontWeight: FontWeight.w600,
            fontFeatures: const [FontFeature.tabularFigures()],
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// _VerticalCardContent
// ---------------------------------------------------------------------------

class _VerticalCardContent extends StatelessWidget {
  const _VerticalCardContent({required this.entry});
  final PrayerEntry entry;

  @override
  Widget build(BuildContext context) {
    final nameColor = entry.isNext ? _kAccent : Colors.white;
    final timeColor = entry.isNext ? _kAccent : Colors.white70;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              entry.arabicName,
              style: TextStyle(
                color: nameColor,
                fontSize: 11,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              entry.name,
              style: TextStyle(
                color: nameColor,
                fontSize: 11,
                fontWeight: entry.isNext ? FontWeight.w700 : FontWeight.w400,
              ),
            ),
          ],
        ),
        Text(
          entry.time,
          style: TextStyle(
            color: timeColor,
            fontSize: 13,
            fontWeight: FontWeight.w600,
            fontFeatures: const [FontFeature.tabularFigures()],
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// _HorizontalDivider
// ---------------------------------------------------------------------------

class _HorizontalDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 48,
      color: Colors.white.withValues(alpha: 0.12),
    );
  }
}
