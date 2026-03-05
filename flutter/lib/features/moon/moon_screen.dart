import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hijri/hijri_calendar.dart';

import '../../core/theme/app_theme.dart';
import '../../shared/models/moon_phase.dart';

// ── Hijri month names ────────────────────────────────────────────────────────

const _hijriMonths = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

const _gregorianMonths = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// ── Screen ───────────────────────────────────────────────────────────────────

class MoonScreen extends ConsumerWidget {
  const MoonScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final now = DateTime.now();
    final moonResult = MoonPhase.calculate(now);

    HijriCalendar hijri;
    try {
      hijri = HijriCalendar.now();
    } catch (_) {
      // Approximate: Hijri year ≈ Gregorian year - 579
      final approxYear = now.year - 579;
      hijri = HijriCalendar()
        ..hYear = approxYear
        ..hMonth = 1
        ..hDay = 1;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Moon & Hijri Calendar'),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          _MoonPhaseHeader(result: moonResult, now: now),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 16),
          _HijriSection(hijri: hijri, now: now),
          const SizedBox(height: 20),
          _WeekRow(now: now),
          const SizedBox(height: 20),
          _NextRamadanCard(hijri: hijri),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

// ── Moon phase header ────────────────────────────────────────────────────────

class _MoonPhaseHeader extends StatelessWidget {
  const _MoonPhaseHeader({required this.result, required this.now});

  final MoonPhaseResult result;
  final DateTime now;

  int get _daysToFullMoon {
    final diff = result.nextFullMoon.difference(now);
    return diff.inDays + (diff.inSeconds % 86400 > 0 ? 1 : 0);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final daysToFull = _daysToFullMoon;
    final illumRounded = result.illuminationPct.round();

    return Column(
      children: [
        const SizedBox(height: 8),
        Text(
          MoonPhase.phaseEmoji(result.phase),
          style: const TextStyle(fontSize: 80),
        ),
        const SizedBox(height: 12),
        Text(
          MoonPhase.phaseName(result.phase),
          style: theme.textTheme.displayMedium?.copyWith(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.primary,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          '$illumRounded% illuminated',
          style: theme.textTheme.bodyLarge?.copyWith(
            fontSize: 16,
            color: theme.colorScheme.onSurface.withAlpha(180),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          daysToFull == 0
              ? 'Full moon tonight!'
              : daysToFull == 1
                  ? 'Next full moon tomorrow'
                  : 'Next full moon in $daysToFull days',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: PrayCalcColors.mid,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Moon age: ${result.moonAge.toStringAsFixed(1)} days',
          style: theme.textTheme.bodyMedium?.copyWith(
            fontSize: 13,
            color: theme.colorScheme.onSurface.withAlpha(140),
          ),
        ),
      ],
    );
  }
}

// ── Hijri date section ───────────────────────────────────────────────────────

class _HijriSection extends StatelessWidget {
  const _HijriSection({required this.hijri, required this.now});

  final HijriCalendar hijri;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final monthName = (hijri.hMonth >= 1 && hijri.hMonth <= 12)
        ? _hijriMonths[hijri.hMonth - 1]
        : 'Unknown';
    final hijriStr = '${hijri.hDay} $monthName ${hijri.hYear} AH';

    return Column(
      children: [
        Text(
          'Today in the Hijri Calendar',
          style: theme.textTheme.titleMedium?.copyWith(
            color: theme.colorScheme.onSurface.withAlpha(160),
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          hijriStr,
          style: theme.textTheme.displayMedium?.copyWith(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.primary,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

// ── 7-day week row ───────────────────────────────────────────────────────────

class _WeekRow extends StatelessWidget {
  const _WeekRow({required this.now});

  final DateTime now;

  @override
  Widget build(BuildContext context) {
    // Show 7 days: 3 before today, today, 3 after.
    final days = List.generate(7, (i) => now.add(Duration(days: i - 3)));

    return SizedBox(
      height: 72,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: days.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final day = days[i];
          final isToday = i == 3;
          final result = MoonPhase.calculate(day);
          return _DayCell(
            date: day,
            emoji: MoonPhase.phaseEmoji(result.phase),
            isToday: isToday,
          );
        },
      ),
    );
  }
}

class _DayCell extends StatelessWidget {
  const _DayCell({
    required this.date,
    required this.emoji,
    required this.isToday,
  });

  final DateTime date;
  final String emoji;
  final bool isToday;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: 60,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      decoration: BoxDecoration(
        color: isToday
            ? theme.colorScheme.primary.withAlpha(30)
            : theme.cardTheme.color,
        borderRadius: BorderRadius.circular(12),
        border: isToday
            ? Border.all(color: theme.colorScheme.primary, width: 1.5)
            : null,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            emoji,
            style: const TextStyle(fontSize: 22),
          ),
          const SizedBox(height: 4),
          Text(
            '${date.day}',
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight:
                  isToday ? FontWeight.bold : FontWeight.normal,
              fontSize: 12,
              color: isToday
                  ? theme.colorScheme.primary
                  : theme.colorScheme.onSurface.withAlpha(200),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Next Ramadan card ────────────────────────────────────────────────────────

class _NextRamadanCard extends StatelessWidget {
  const _NextRamadanCard({required this.hijri});

  final HijriCalendar hijri;

  /// Estimate the Gregorian start date of Ramadan for [hijriYear].
  ///
  /// We compute the Julian Day of 1 Ramadan [hijriYear] using the Kuwaiti
  /// algorithm bundled in the hijri package, then convert to Gregorian.
  DateTime _ramadanStart(int hijriYear) {
    final ramadanFirst = HijriCalendar()
      ..hYear = hijriYear
      ..hMonth = 9
      ..hDay = 1;
    return ramadanFirst.hijriToGregorian(
      ramadanFirst.hYear,
      ramadanFirst.hMonth,
      ramadanFirst.hDay,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Determine which Ramadan is "next":
    // if we are currently in or before Ramadan this year, use this year;
    // otherwise use next year.
    final now = DateTime.now();

    int targetHijriYear = hijri.hYear;
    if (hijri.hMonth > 9) {
      targetHijriYear += 1;
    }

    DateTime startDate;
    try {
      startDate = _ramadanStart(targetHijriYear);
    } catch (_) {
      // Fallback: skip 354 days (approx. one lunar year) from today.
      startDate = now.add(const Duration(days: 354));
    }

    // If the computed start date has already passed this year, advance.
    if (startDate.isBefore(now)) {
      targetHijriYear += 1;
      try {
        startDate = _ramadanStart(targetHijriYear);
      } catch (_) {
        startDate = startDate.add(const Duration(days: 354));
      }
    }

    final gregStr =
        '${startDate.day} ${_gregorianMonths[startDate.month - 1]} ${startDate.year}';
    final daysAway = startDate.difference(now).inDays;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Text('☪️', style: TextStyle(fontSize: 28)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Ramadan $targetHijriYear AH begins',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    gregStr,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: PrayCalcColors.mid,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (daysAway > 0)
                    Text(
                      '$daysAway days away',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withAlpha(160),
                        fontSize: 12,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
