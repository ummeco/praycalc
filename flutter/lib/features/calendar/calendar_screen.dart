import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:share_plus/share_plus.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest_10y.dart' as tz_data;

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/settings_model.dart';

/// Monthly prayer time calendar — PC-3.11.
/// Gregorian + Hijri header, month navigation, today highlight, text export.
class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key});

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  late DateTime _month;
  bool _tzReady = false;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _month = DateTime(now.year, now.month);
    if (!_tzReady) {
      tz_data.initializeTimeZones();
      _tzReady = true;
    }
  }

  void _prevMonth() => setState(() => _month = DateTime(_month.year, _month.month - 1));
  void _nextMonth() => setState(() => _month = DateTime(_month.year, _month.month + 1));

  List<_DayRow> _buildRows(City city, AppSettings settings) {
    final rows = <_DayRow>[];
    final daysInMonth = DateUtils.getDaysInMonth(_month.year, _month.month);
    for (var d = 1; d <= daysInMonth; d++) {
      final date = DateTime.utc(_month.year, _month.month, d, 12);
      final offset = _utcOffset(city.timezone, date);
      final times = getTimes(date, city.lat, city.lng, offset, hanafi: settings.hanafi);
      final hijri = HijriCalendar.fromDate(DateTime(_month.year, _month.month, d));
      rows.add(_DayRow(date: DateTime(_month.year, _month.month, d), hijri: hijri, times: times));
    }
    return rows;
  }

  void _export(List<_DayRow> rows, AppSettings settings) {
    final buf = StringBuffer();
    buf.writeln('PrayCalc — ${_monthLabel(_month)}');
    buf.writeln('${_hijriMonthLabel(_month)}\n');
    buf.writeln('Date         Hijri      Fajr     Sunrise  Dhuhr    Asr      Maghrib  Isha');
    buf.writeln('─' * 72);
    for (final r in rows) {
      buf.writeln(
        '${_fmtDate(r.date)}  ${_shortHijri(r.hijri).padRight(10)} '
        '${_fmtT(r.times.fajr, settings.use24h).padRight(8)} '
        '${_fmtT(r.times.sunrise, settings.use24h).padRight(8)} '
        '${_fmtT(r.times.dhuhr, settings.use24h).padRight(8)} '
        '${_fmtT(r.times.asr, settings.use24h).padRight(8)} '
        '${_fmtT(r.times.maghrib, settings.use24h).padRight(8)} '
        '${_fmtT(r.times.isha, settings.use24h)}',
      );
    }
    SharePlus.instance.share(ShareParams(text: buf.toString(), subject: 'Prayer Times — ${_monthLabel(_month)}'));
  }

  @override
  Widget build(BuildContext context) {
    final city = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_monthLabel(_month)),
            Text(
              _hijriMonthLabel(_month),
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: cs.onSurface.withValues(alpha: 0.65)),
            ),
          ],
        ),
        actions: [
          if (city != null)
            IconButton(
              icon: const Icon(Icons.share),
              tooltip: 'Share calendar',
              onPressed: () => _export(_buildRows(city, settings), settings),
            ),
          IconButton(
            icon: const Icon(Icons.chevron_left),
            tooltip: 'Previous month',
            onPressed: _prevMonth,
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            tooltip: 'Next month',
            onPressed: _nextMonth,
          ),
        ],
      ),
      body: city == null
          ? const Center(
              child: Text(
                'Set your city first\nto view the prayer calendar.',
                textAlign: TextAlign.center,
              ),
            )
          : _CalendarTable(rows: _buildRows(city, settings), settings: settings, month: _month),
    );
  }
}

// ─── Table widget ─────────────────────────────────────────────────────────────

class _CalendarTable extends StatelessWidget {
  const _CalendarTable({required this.rows, required this.settings, required this.month});
  final List<_DayRow> rows;
  final AppSettings settings;
  final DateTime month;

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final isCurrentMonth = month.year == today.year && month.month == today.month;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        child: DataTable(
          headingRowColor: WidgetStateProperty.all(
            PrayCalcColors.dark.withValues(alpha: 0.08),
          ),
          dataRowMinHeight: 36,
          dataRowMaxHeight: 40,
          columnSpacing: 12,
          horizontalMargin: 12,
          columns: const [
            DataColumn(label: _H('Date')),
            DataColumn(label: _H('Hijri')),
            DataColumn(label: _H('Fajr')),
            DataColumn(label: _H('Sunrise')),
            DataColumn(label: _H('Dhuhr')),
            DataColumn(label: _H('Asr')),
            DataColumn(label: _H('Maghrib')),
            DataColumn(label: _H('Isha')),
          ],
          rows: rows.map((r) {
            final isToday = isCurrentMonth && r.date.day == today.day;
            final lqColor = _lqRowColor(r.hijri);
            final isLq = lqColor != null;
            final ts = TextStyle(
              fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
              color: isToday ? PrayCalcColors.dark : null,
              fontSize: 13,
            );
            return DataRow(
              color: WidgetStateProperty.all(
                isToday
                    ? PrayCalcColors.light.withValues(alpha: 0.35)
                    : lqColor ?? Colors.transparent,
              ),
              cells: [
                DataCell(Text(_shortDate(r.date), style: ts)),
                DataCell(
                  isLq
                      ? Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(_shortHijri(r.hijri), style: ts),
                            const SizedBox(width: 4),
                            Icon(
                              Icons.auto_awesome,
                              size: 13,
                              color: Color(
                                r.hijri.hDay == 27 ? 0xFFFFB300 : 0xFFFFD54F,
                              ),
                            ),
                          ],
                        )
                      : Text(_shortHijri(r.hijri), style: ts),
                ),
                DataCell(Text(_fmtT(r.times.fajr, settings.use24h), style: ts)),
                DataCell(Text(_fmtT(r.times.sunrise, settings.use24h), style: ts)),
                DataCell(Text(_fmtT(r.times.dhuhr, settings.use24h), style: ts)),
                DataCell(Text(_fmtT(r.times.asr, settings.use24h), style: ts)),
                DataCell(Text(_fmtT(r.times.maghrib, settings.use24h), style: ts)),
                DataCell(Text(_fmtT(r.times.isha, settings.use24h), style: ts)),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _H extends StatelessWidget {
  const _H(this.text);
  final String text;

  @override
  Widget build(BuildContext context) =>
      Text(text, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13));
}

// ─── Data record ──────────────────────────────────────────────────────────────

class _DayRow {
  const _DayRow({required this.date, required this.hijri, required this.times});
  final DateTime date;
  final HijriCalendar hijri;
  final PrayerTimes times;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const _monthNames = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const _hijriMonths = [
  '', "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

String _monthLabel(DateTime d) => '${_monthNames[d.month]} ${d.year}';

String _hijriMonthLabel(DateTime d) {
  final h = HijriCalendar.fromDate(DateTime(d.year, d.month, 15));
  return '${_hijriMonths[h.hMonth]} ${h.hYear} AH';
}

String _fmtDate(DateTime d) {
  final m = d.month.toString().padLeft(2, '0');
  final day = d.day.toString().padLeft(2, '0');
  return '${d.year}-$m-$day';
}

String _shortDate(DateTime d) =>
    '${d.day.toString().padLeft(2)} ${_monthNames[d.month].substring(0, 3)}';

String _shortHijri(HijriCalendar h) {
  final word = _hijriMonths[h.hMonth].split(' ').first;
  return '${h.hDay.toString().padLeft(2)} ${word.substring(0, math.min(3, word.length))}';
}

/// Format fractional hours → HH:MM (24h) or H:MM AM/PM (12h).
String _fmtT(double h, bool use24h) {
  if (!h.isFinite) return '--:--';
  final total = h % 24;
  final hh = total.floor();
  final mm = ((total - hh) * 60).round() % 60;
  if (use24h) {
    return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
  }
  final period = hh < 12 ? 'AM' : 'PM';
  final h12 = hh % 12 == 0 ? 12 : hh % 12;
  return '$h12:${mm.toString().padLeft(2, '0')} $period';
}

/// Returns a gold tint color for Laylatul Qadr candidate nights in Ramadan
/// (odd nights 21/23/25/27/29 of Hijri month 9). Night 27 is brightest.
/// Returns null for all other days.
Color? _lqRowColor(HijriCalendar h) {
  if (h.hMonth != 9) return null;
  if (h.hDay == 27) return const Color(0xFFFFD700).withValues(alpha: 0.28);
  if (h.hDay == 21 || h.hDay == 23 || h.hDay == 25 || h.hDay == 29) {
    return const Color(0xFFFFD700).withValues(alpha: 0.12);
  }
  return null;
}

/// DST-aware UTC offset from IANA timezone string (mirrors prayer_provider logic).
double _utcOffset(String timezone, DateTime date) {
  if (timezone.startsWith('UTC')) {
    final rest = timezone.substring(3);
    if (rest.isEmpty) return 0.0;
    final sign = rest.startsWith('-') ? -1.0 : 1.0;
    final parts = rest.substring(1).split(':');
    final h = double.tryParse(parts[0]) ?? 0.0;
    final m = parts.length > 1 ? (double.tryParse(parts[1]) ?? 0.0) / 60.0 : 0.0;
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
