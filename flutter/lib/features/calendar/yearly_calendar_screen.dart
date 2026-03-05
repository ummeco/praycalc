import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:timezone/timezone.dart' as tz;

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/settings_model.dart';

/// Yearly prayer time calendar — PC-8.7.
///
/// Displays a 12-month grid where each cell represents a day.
/// Color intensity encodes total prayer duration (fajr-to-isha).
/// Islamic holiday annotations are shown with gold dots.
class YearlyCalendarScreen extends ConsumerStatefulWidget {
  const YearlyCalendarScreen({super.key});

  @override
  ConsumerState<YearlyCalendarScreen> createState() =>
      _YearlyCalendarScreenState();
}

class _YearlyCalendarScreenState extends ConsumerState<YearlyCalendarScreen> {
  late int _year;

  @override
  void initState() {
    super.initState();
    _year = DateTime.now().year;
  }

  void _prevYear() => setState(() => _year--);
  void _nextYear() => setState(() => _year++);

  @override
  Widget build(BuildContext context) {
    final city = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('$_year Prayer Calendar'),
        actions: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            tooltip: 'Previous year',
            onPressed: _prevYear,
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            tooltip: 'Next year',
            onPressed: _nextYear,
          ),
        ],
      ),
      body: city == null
          ? Center(
              child: Text(
                'Set your city first\nto view the yearly calendar.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyLarge,
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  for (int row = 0; row < 4; row++)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          for (int col = 0; col < 3; col++)
                            Expanded(
                              child: Padding(
                                padding: EdgeInsets.only(
                                  left: col == 0 ? 0 : 4,
                                  right: col == 2 ? 0 : 4,
                                ),
                                child: _MonthMiniCalendar(
                                  year: _year,
                                  month: row * 3 + col + 1,
                                  city: city,
                                  settings: settings,
                                  onTap: () {
                                    // Navigate to monthly calendar for this month.
                                    // The monthly calendar screen always starts with
                                    // the current month, so we pass month as extra.
                                    context.push(
                                      Routes.calendar,
                                      extra: DateTime(_year, row * 3 + col + 1),
                                    );
                                  },
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 8),
                  _Legend(),
                ],
              ),
            ),
    );
  }
}

// ─── Month mini calendar ──────────────────────────────────────────────────────

class _MonthMiniCalendar extends StatelessWidget {
  const _MonthMiniCalendar({
    required this.year,
    required this.month,
    required this.city,
    required this.settings,
    required this.onTap,
  });

  final int year;
  final int month;
  final City city;
  final AppSettings settings;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final daysInMonth = DateUtils.getDaysInMonth(year, month);
    final today = DateTime.now();
    final isCurrentMonth = year == today.year && month == today.month;

    // Pre-compute durations for the month.
    final durations = <double>[];
    final holidays = <int, bool>{};
    for (var d = 1; d <= daysInMonth; d++) {
      final date = DateTime.utc(year, month, d, 12);
      final offset = _utcOffset(city.timezone, date);
      final times =
          getTimes(date, city.lat, city.lng, offset, hanafi: settings.hanafi);
      final duration = _prayerDuration(times);
      durations.add(duration);

      // Check for Islamic holidays.
      try {
        final hijri = HijriCalendar.fromDate(DateTime(year, month, d));
        if (_isIslamicHoliday(hijri)) {
          holidays[d] = true;
        }
      } catch (_) {}
    }

    // Normalise durations across this month for color intensity.
    final validDurations = durations.where((d) => d.isFinite && d > 0);
    final minD = validDurations.isEmpty ? 0.0 : validDurations.reduce(_min);
    final maxD = validDurations.isEmpty ? 1.0 : validDurations.reduce(_max);
    final range = maxD - minD;

    return GestureDetector(
      onTap: onTap,
      child: Card(
        margin: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.all(6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Month header
              Text(
                _monthNames[month],
                style: theme.textTheme.labelMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: isCurrentMonth ? theme.colorScheme.primary : null,
                ),
              ),
              const SizedBox(height: 4),
              // Day grid (7 columns for Sun-Sat)
              _DayGrid(
                year: year,
                month: month,
                daysInMonth: daysInMonth,
                durations: durations,
                holidays: holidays,
                minDuration: minD,
                range: range,
                today: isCurrentMonth ? today.day : -1,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Day grid ──────────────────────────────────────────────────────────────────

class _DayGrid extends StatelessWidget {
  const _DayGrid({
    required this.year,
    required this.month,
    required this.daysInMonth,
    required this.durations,
    required this.holidays,
    required this.minDuration,
    required this.range,
    required this.today,
  });

  final int year;
  final int month;
  final int daysInMonth;
  final List<double> durations;
  final Map<int, bool> holidays;
  final double minDuration;
  final double range;
  final int today;

  @override
  Widget build(BuildContext context) {
    // First day of the month (0 = Mon in DateTime.weekday, we shift to Sun = 0).
    final firstWeekday = DateTime(year, month, 1).weekday % 7; // Sun=0

    final cells = <Widget>[];
    // Empty cells before the first day.
    for (var i = 0; i < firstWeekday; i++) {
      cells.add(const SizedBox(width: 14, height: 14));
    }

    for (var d = 1; d <= daysInMonth; d++) {
      final duration = durations[d - 1];
      final intensity = (range > 0 && duration.isFinite)
          ? ((duration - minDuration) / range).clamp(0.0, 1.0)
          : 0.5;
      final isToday = d == today;
      final isHoliday = holidays.containsKey(d);

      cells.add(
        Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            color: _intensityColor(intensity, isToday),
            borderRadius: BorderRadius.circular(2),
            border: isToday
                ? Border.all(color: Theme.of(context).colorScheme.primary, width: 1.5)
                : null,
          ),
          child: isHoliday
              ? Center(
                  child: Container(
                    width: 4,
                    height: 4,
                    decoration: const BoxDecoration(
                      color: Color(0xFFFFD700),
                      shape: BoxShape.circle,
                    ),
                  ),
                )
              : null,
        ),
      );
    }

    return Wrap(
      spacing: 2,
      runSpacing: 2,
      children: cells,
    );
  }

  Color _intensityColor(double intensity, bool isToday) {
    if (isToday) {
      return PrayCalcColors.light;
    }
    // Blend from a very light green to the brand mid green.
    return Color.lerp(
      PrayCalcColors.light.withAlpha(60),
      PrayCalcColors.mid,
      intensity,
    )!;
  }
}

// ─── Legend widget ─────────────────────────────────────────────────────────────

class _Legend extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Duration gradient legend
        Text('Shorter day ', style: theme.textTheme.labelSmall),
        for (var i = 0; i < 5; i++)
          Container(
            width: 12,
            height: 12,
            margin: const EdgeInsets.symmetric(horizontal: 1),
            decoration: BoxDecoration(
              color: Color.lerp(
                PrayCalcColors.light.withAlpha(60),
                PrayCalcColors.mid,
                i / 4.0,
              ),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        Text(' Longer day', style: theme.textTheme.labelSmall),
        const SizedBox(width: 16),
        // Holiday marker
        Container(
          width: 6,
          height: 6,
          decoration: const BoxDecoration(
            color: Color(0xFFFFD700),
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text('Islamic holiday', style: theme.textTheme.labelSmall),
      ],
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const _monthNames = [
  '',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/// Total prayer span in hours (Isha - Fajr).
double _prayerDuration(PrayerTimes times) {
  if (!times.fajr.isFinite || !times.isha.isFinite) return double.nan;
  return times.isha - times.fajr;
}

double _min(double a, double b) => a < b ? a : b;
double _max(double a, double b) => a > b ? a : b;

/// Check if a Hijri date falls on a major Islamic holiday.
bool _isIslamicHoliday(HijriCalendar h) {
  // Eid al-Fitr: Shawwal 1-3
  if (h.hMonth == 10 && h.hDay >= 1 && h.hDay <= 3) return true;
  // Eid al-Adha: Dhu al-Hijjah 10-13
  if (h.hMonth == 12 && h.hDay >= 10 && h.hDay <= 13) return true;
  // Day of Arafah: Dhu al-Hijjah 9
  if (h.hMonth == 12 && h.hDay == 9) return true;
  // Laylat al-Qadr candidates: Ramadan 21,23,25,27,29
  if (h.hMonth == 9 && (h.hDay == 21 || h.hDay == 23 || h.hDay == 25 || h.hDay == 27 || h.hDay == 29)) return true;
  // Isra wal Miraj: Rajab 27
  if (h.hMonth == 7 && h.hDay == 27) return true;
  // Shab-e-Barat: Sha'ban 15
  if (h.hMonth == 8 && h.hDay == 15) return true;
  // Islamic New Year: Muharram 1
  if (h.hMonth == 1 && h.hDay == 1) return true;
  // Ashura: Muharram 10
  if (h.hMonth == 1 && h.hDay == 10) return true;
  // Mawlid an-Nabi: Rabi' al-Awwal 12
  if (h.hMonth == 3 && h.hDay == 12) return true;
  // Start of Ramadan: Ramadan 1
  if (h.hMonth == 9 && h.hDay == 1) return true;

  return false;
}

/// DST-aware UTC offset from IANA timezone string.
double _utcOffset(String timezone, DateTime date) {
  if (timezone.startsWith('UTC')) {
    final rest = timezone.substring(3);
    if (rest.isEmpty) return 0.0;
    final sign = rest.startsWith('-') ? -1.0 : 1.0;
    final parts = rest.substring(1).split(':');
    final h = double.tryParse(parts[0]) ?? 0.0;
    final m =
        parts.length > 1 ? (double.tryParse(parts[1]) ?? 0.0) / 60.0 : 0.0;
    return sign * (h + m);
  }
  try {
    final location = tz.getLocation(timezone);
    final tzTime = tz.TZDateTime.from(date, location);
    return tzTime.timeZoneOffset.inSeconds / 3600.0;
  } catch (_) {
    return 0.0;
  }
}
