import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// TvCalendarTicker — upcoming Islamic events scroller (TV2-9.4)
// ---------------------------------------------------------------------------

class _IslamicEvent {
  final String name;
  final DateTime date;
  _IslamicEvent(this.name, this.date);
}

/// Approximate Gregorian dates for major Islamic events in 2026.
/// Hijri calendar shifts yearly — update this list each year or compute
/// dynamically from a Hijri library.
final List<_IslamicEvent> _kEvents2026 = [
  _IslamicEvent('Ramadan begins', DateTime.utc(2026, 3, 1)),
  _IslamicEvent('Laylat al-Qadr (27th)', DateTime.utc(2026, 3, 27)),
  _IslamicEvent('Eid al-Fitr', DateTime.utc(2026, 3, 31)),
  _IslamicEvent('Eid al-Adha', DateTime.utc(2026, 6, 6)),
  _IslamicEvent('Islamic New Year (1 Muharram)', DateTime.utc(2026, 7, 27)),
  _IslamicEvent('Ashura (10 Muharram)', DateTime.utc(2026, 8, 5)),
  _IslamicEvent('Mawlid an-Nabi', DateTime.utc(2026, 9, 4)),
];

/// A horizontally-scrolling ticker showing upcoming Islamic calendar events
/// within the next 60 days. Falls back to the hadith ticker text style.
///
/// Events scroll continuously left from right, identical in animation to
/// [TvHadithTicker]. If no events are upcoming the widget renders nothing.
class TvCalendarTicker extends StatefulWidget {
  const TvCalendarTicker({super.key, this.lookaheadDays = 60});

  /// How many days ahead to include in the ticker.
  final int lookaheadDays;

  @override
  State<TvCalendarTicker> createState() => _TvCalendarTickerState();
}

class _TvCalendarTickerState extends State<TvCalendarTicker>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 30),
    )..repeat();
    _slideAnimation = Tween<Offset>(
      begin: const Offset(1.0, 0.0),
      end: const Offset(-1.0, 0.0),
    ).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  List<_IslamicEvent> _upcomingEvents() {
    final now = DateTime.now();
    final cutoff = now.add(Duration(days: widget.lookaheadDays));
    return _kEvents2026
        .where((e) => e.date.isAfter(now) && e.date.isBefore(cutoff))
        .toList()
      ..sort((a, b) => a.date.compareTo(b.date));
  }

  String _daysUntil(_IslamicEvent event) {
    final diff = event.date.difference(DateTime.now());
    final days = diff.inDays;
    if (days == 0) return 'Today';
    if (days == 1) return 'Tomorrow';
    return 'In $days days';
  }

  String _buildText(List<_IslamicEvent> events) {
    return events
        .map((e) => '${e.name} — ${_daysUntil(e)}')
        .join('     •     ');
  }

  @override
  Widget build(BuildContext context) {
    final events = _upcomingEvents();
    if (events.isEmpty) return const SizedBox.shrink();

    final text = _buildText(events);

    return Container(
      color: PrayCalcColors.deep.withAlpha(200),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      alignment: Alignment.centerLeft,
      child: Row(
        children: [
          const Icon(Icons.calendar_month,
              color: PrayCalcColors.mid, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: ClipRect(
              child: SlideTransition(
                position: _slideAnimation,
                child: Text(
                  text,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 16,
                    fontStyle: FontStyle.italic,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.visible,
                  softWrap: false,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
