import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// TvPortraitLayout (P-19)
// ---------------------------------------------------------------------------
// Portrait mode layout for TVs mounted vertically. Shows a large clock at the
// top, a highlighted next-prayer countdown in the middle, a scrollable prayer
// list, and a bottom ticker strip.
//
// This is a StatelessWidget — the parent is responsible for rebuilding it each
// second by passing updated clockText and nextCountdown values.
// ---------------------------------------------------------------------------

/// Record type for a single prayer row.
typedef TvPrayerRowData = ({
  String name,
  String nameArabic,
  String time,
  bool isCurrent,
  bool isNext,
});

class TvPortraitLayout extends StatelessWidget {
  /// All prayers to display in the list (typically 6: Fajr–Isha).
  final List<TvPrayerRowData> prayers;

  /// Current time string, e.g. "14:23".
  final String clockText;

  /// Gregorian date string, e.g. "Monday, 9 March 2026".
  final String dateText;

  /// Hijri date string, e.g. "9 Ramadan 1447".
  final String hijriText;

  /// Name of the next upcoming prayer.
  final String nextPrayerName;

  /// Countdown to next prayer, e.g. "1:23:45".
  final String nextCountdown;

  final double fontScale;

  /// Ticker text shown in the bottom strip. Falls back to a default message
  /// when left empty.
  final String tickerText;

  const TvPortraitLayout({
    super.key,
    required this.prayers,
    required this.clockText,
    required this.dateText,
    required this.hijriText,
    required this.nextPrayerName,
    required this.nextCountdown,
    this.fontScale = 1.0,
    this.tickerText = '',
  });

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF060E08),
      child: Column(
        children: [
          // 1. Clock section (top ~30% of screen).
          _ClockSection(
            clockText: clockText,
            dateText: dateText,
            hijriText: hijriText,
            fontScale: fontScale,
          ),
          // 2. Next prayer highlight (~20% of screen).
          _NextPrayerHighlight(
            prayerName: nextPrayerName,
            countdown: nextCountdown,
            fontScale: fontScale,
          ),
          // 3. Prayer list (fills remaining space).
          Expanded(
            child: _PrayerList(
              prayers: prayers,
              fontScale: fontScale,
            ),
          ),
          // 4. Bottom ticker strip (fixed 40 px height).
          _TickerStrip(
            text: tickerText.isNotEmpty
                ? tickerText
                : 'Prayer times by PrayCalc · praycalc.com',
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Clock section
// ---------------------------------------------------------------------------

class _ClockSection extends StatelessWidget {
  final String clockText;
  final String dateText;
  final String hijriText;
  final double fontScale;

  const _ClockSection({
    required this.clockText,
    required this.dateText,
    required this.hijriText,
    required this.fontScale,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      // Roughly 30% of a 1080-px portrait screen.
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            clockText,
            style: TextStyle(
              fontSize: 72 * fontScale,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              fontFeatures: const [FontFeature.tabularFigures()],
              height: 1.1,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            dateText,
            style: TextStyle(
              fontSize: 18 * fontScale,
              color: Colors.white.withValues(alpha: 0.60),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            hijriText,
            style: TextStyle(
              fontSize: 16 * fontScale,
              color: Colors.white.withValues(alpha: 0.40),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Next prayer highlight
// ---------------------------------------------------------------------------

class _NextPrayerHighlight extends StatelessWidget {
  final String prayerName;
  final String countdown;
  final double fontScale;

  const _NextPrayerHighlight({
    required this.prayerName,
    required this.countdown,
    required this.fontScale,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF0A1A0F),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFC9F27A).withValues(alpha: 0.50),
          width: 1.5,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Next: $prayerName',
            style: TextStyle(
              fontSize: 20 * fontScale,
              color: Colors.white.withValues(alpha: 0.80),
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            countdown,
            style: TextStyle(
              fontSize: 48 * fontScale,
              fontWeight: FontWeight.bold,
              color: const Color(0xFFC9F27A),
              fontFeatures: const [FontFeature.tabularFigures()],
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Prayer list
// ---------------------------------------------------------------------------

class _PrayerList extends StatelessWidget {
  final List<TvPrayerRowData> prayers;
  final double fontScale;

  const _PrayerList({
    required this.prayers,
    required this.fontScale,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 0, vertical: 4),
      physics: const NeverScrollableScrollPhysics(),
      itemCount: prayers.length,
      itemBuilder: (context, index) {
        final p = prayers[index];
        return _PrayerRow(
          data: p,
          fontScale: fontScale,
        );
      },
    );
  }
}

class _PrayerRow extends StatelessWidget {
  final TvPrayerRowData data;
  final double fontScale;

  const _PrayerRow({
    required this.data,
    required this.fontScale,
  });

  @override
  Widget build(BuildContext context) {
    final isCurrent = data.isCurrent;
    final isNext = data.isNext;

    Color rowBg;
    if (isCurrent) {
      rowBg = const Color(0xFF1A3D20); // activeTile
    } else if (isNext) {
      rowBg = const Color(0xFF0F2414); // nextTile
    } else {
      rowBg = Colors.transparent;
    }

    return Container(
      decoration: BoxDecoration(
        color: rowBg,
        border: isCurrent
            ? const Border(
                left: BorderSide(color: Color(0xFFC9F27A), width: 4),
              )
            : null,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Left: Arabic name + divider + English name.
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                data.nameArabic,
                style: TextStyle(
                  fontFamily: 'Amiri',
                  fontSize: 20 * fontScale,
                  color: isCurrent
                      ? const Color(0xFFC9F27A)
                      : Colors.white.withValues(alpha: 0.85),
                ),
                textDirection: TextDirection.rtl,
              ),
              Text(
                ' / ',
                style: TextStyle(
                  fontSize: 14 * fontScale,
                  color: Colors.white.withValues(alpha: 0.30),
                ),
              ),
              Text(
                data.name,
                style: TextStyle(
                  fontSize: 14 * fontScale,
                  color: isCurrent
                      ? const Color(0xFFC9F27A)
                      : Colors.white.withValues(alpha: 0.70),
                ),
              ),
            ],
          ),
          // Right: time.
          Text(
            data.time,
            style: TextStyle(
              fontSize: 18 * fontScale,
              fontWeight: FontWeight.bold,
              color: isCurrent ? const Color(0xFFC9F27A) : Colors.white,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Ticker strip
// ---------------------------------------------------------------------------

class _TickerStrip extends StatefulWidget {
  final String text;

  const _TickerStrip({required this.text});

  @override
  State<_TickerStrip> createState() => _TickerStripState();
}

class _TickerStripState extends State<_TickerStrip>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<Offset> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 18),
    )..repeat();

    _animation = Tween<Offset>(
      begin: const Offset(1, 0),
      end: const Offset(-1, 0),
    ).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      color: Colors.black.withValues(alpha: 0.50),
      clipBehavior: Clip.hardEdge,
      child: SlideTransition(
        position: _animation,
        child: Center(
          child: Text(
            widget.text,
            style: TextStyle(
              fontSize: 13,
              color: Colors.white.withValues(alpha: 0.55),
              letterSpacing: 0.5,
            ),
            maxLines: 1,
            overflow: TextOverflow.visible,
            softWrap: false,
          ),
        ),
      ),
    );
  }
}
