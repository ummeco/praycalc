import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:share_plus/share_plus.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest_10y.dart' as tz_data;

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/settings_model.dart';
import 'ical_service.dart';

/// Monthly prayer time calendar — PC-3.11.
/// Two-line header, merged date/hijri column, Hijri/Gregorian mode toggle.
class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key, this.initialMonth});
  final DateTime? initialMonth;

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  late DateTime _month;
  bool _tzReady = false;

  /// When true, navigation and primary display use Hijri months.
  bool _hijriMode = false;

  /// Current Hijri year/month (used when _hijriMode is true).
  late int _hijriYear;
  late int _hijriMonth;

  @override
  void initState() {
    super.initState();
    final init = widget.initialMonth ?? DateTime.now();
    _month = DateTime(init.year, init.month);
    final h = HijriCalendar.fromDate(init);
    _hijriYear = h.hYear;
    _hijriMonth = h.hMonth;
    if (!_tzReady) {
      tz_data.initializeTimeZones();
      _tzReady = true;
    }
  }

  // ── Gregorian navigation ──────────────────────────────────────────────────

  void _prevMonthGreg() =>
      setState(() => _month = DateTime(_month.year, _month.month - 1));

  void _nextMonthGreg() =>
      setState(() => _month = DateTime(_month.year, _month.month + 1));

  // ── Hijri navigation ──────────────────────────────────────────────────────

  void _prevMonthHijri() {
    setState(() {
      _hijriMonth--;
      if (_hijriMonth < 1) {
        _hijriMonth = 12;
        _hijriYear--;
      }
    });
  }

  void _nextMonthHijri() {
    setState(() {
      _hijriMonth++;
      if (_hijriMonth > 12) {
        _hijriMonth = 1;
        _hijriYear++;
      }
    });
  }

  void _prevMonth() => _hijriMode ? _prevMonthHijri() : _prevMonthGreg();
  void _nextMonth() => _hijriMode ? _nextMonthHijri() : _nextMonthGreg();

  // ── Build rows ────────────────────────────────────────────────────────────

  /// Build rows for Gregorian month.
  List<_DayRow> _buildRowsGreg(City city, AppSettings settings) {
    final rows = <_DayRow>[];
    final daysInMonth = DateUtils.getDaysInMonth(_month.year, _month.month);
    for (var d = 1; d <= daysInMonth; d++) {
      final date = DateTime.utc(_month.year, _month.month, d, 12);
      final offset = _utcOffset(city.timezone, date);
      final times =
          getTimes(date, city.lat, city.lng, offset, hanafi: settings.hanafi);
      final hijri =
          HijriCalendar.fromDate(DateTime(_month.year, _month.month, d));
      rows.add(_DayRow(
          date: DateTime(_month.year, _month.month, d),
          hijri: hijri,
          times: times));
    }
    return rows;
  }

  /// Build rows for Hijri month (find all Gregorian dates that fall in this
  /// Hijri month, compute prayer times for each).
  List<_DayRow> _buildRowsHijri(City city, AppSettings settings) {
    final rows = <_DayRow>[];
    // Iterate day 1..30 and stop when day exceeds month length.
    for (var hDay = 1; hDay <= 30; hDay++) {
      final h = HijriCalendar()
        ..hYear = _hijriYear
        ..hMonth = _hijriMonth
        ..hDay = hDay;
      // Validate: if hDay exceeds this month's length, stop.
      if (hDay > h.getDaysInMonth(_hijriYear, _hijriMonth)) break;
      final gDate = h.hijriToGregorian(_hijriYear, _hijriMonth, hDay);
      final dateUtc = DateTime.utc(gDate.year, gDate.month, gDate.day, 12);
      final offset = _utcOffset(city.timezone, dateUtc);
      final times = getTimes(
          dateUtc, city.lat, city.lng, offset,
          hanafi: settings.hanafi);
      final hijri = HijriCalendar.fromDate(gDate);
      rows.add(_DayRow(date: gDate, hijri: hijri, times: times));
    }
    return rows;
  }

  List<_DayRow> _buildRows(City city, AppSettings settings) =>
      _hijriMode ? _buildRowsHijri(city, settings) : _buildRowsGreg(city, settings);

  // ── Header labels ─────────────────────────────────────────────────────────

  String _primaryLabel(AppLocalizations l) {
    if (_hijriMode) {
      return '${_hijriMonthsL10n(l)[_hijriMonth]} $_hijriYear ${l.homeSuffixAH}';
    }
    return _monthLabelL10n(l, _month);
  }

  String _subtitleLabel(AppLocalizations l) {
    if (_hijriMode) {
      // Show approximate Gregorian range.
      final h = HijriCalendar()
        ..hYear = _hijriYear
        ..hMonth = _hijriMonth
        ..hDay = 1;
      final gDate = h.hijriToGregorian(_hijriYear, _hijriMonth, 1);
      return '${_monthNamesL10n(l)[gDate.month]} ${gDate.year}';
    }
    return _hijriMonthLabelL10n(l, _month);
  }

  // ── Export / share ────────────────────────────────────────────────────────

  void _export(List<_DayRow> rows, AppSettings settings, AppLocalizations l) {
    final primary = _primaryLabel(l);
    final buf = StringBuffer();
    buf.writeln(l.calExportHeader(primary));
    buf.writeln('${_subtitleLabel(l)}\n');
    buf.writeln(
        'Date         Hijri      Fajr     Dhuhr    Asr      Maghrib  Isha');
    buf.writeln('─' * 66);
    for (final r in rows) {
      buf.writeln(
        '${_fmtDate(r.date)}  ${_shortHijri(r.hijri).padRight(10)} '
        '${_fmtT(r.times.fajr, settings.use24h).padRight(8)} '
        '${_fmtT(r.times.dhuhr, settings.use24h).padRight(8)} '
        '${_fmtT(r.times.asr, settings.use24h).padRight(8)} '
        '${_fmtT(r.times.maghrib, settings.use24h).padRight(8)} '
        '${_fmtT(r.times.isha, settings.use24h)}',
      );
    }
    SharePlus.instance.share(ShareParams(
        text: buf.toString(), subject: l.calExportSubject(primary)));
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context)!;
    final city = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 8,
        title: Row(
          children: [
            // Left: month name + year
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _primaryLabel(l),
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  Text(
                    _subtitleLabel(l),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: cs.onSurface.withValues(alpha: 0.65),
                          fontSize: 12,
                        ),
                  ),
                ],
              ),
            ),
            // Right: Hijri/Gregorian toggle
            _CalendarModeToggle(
              hijriMode: _hijriMode,
              onChanged: (v) => setState(() => _hijriMode = v),
              l: l,
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(40),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left, size: 22),
                  tooltip: l.calPrevMonthTooltip,
                  onPressed: _prevMonth,
                  visualDensity: VisualDensity.compact,
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right, size: 22),
                  tooltip: l.calNextMonthTooltip,
                  onPressed: _nextMonth,
                  visualDensity: VisualDensity.compact,
                ),
                const Spacer(),
                if (city != null) ...[
                  IconButton(
                    icon: const Icon(Icons.calendar_view_month, size: 20),
                    // TODO: i18n — calYearlyCalendarTooltip
                    tooltip: 'Yearly calendar',
                    onPressed: () => context.push(Routes.yearlyCalendar),
                    visualDensity: VisualDensity.compact,
                  ),
                  IconButton(
                    icon: const Icon(Icons.event_note, size: 20),
                    // TODO: i18n — calExportIcsTooltip
                    tooltip: 'Export .ics',
                    onPressed: () {
                      final ical = ICalService.generateIcal(
                        city: city,
                        hanafi: settings.hanafi,
                        year: _month.year,
                        month: _month.month,
                      );
                      SharePlus.instance.share(
                        ShareParams(
                          text: ical,
                          subject:
                              '${l.calExportSubject(_primaryLabel(l))} - ${city.name}.ics',
                        ),
                      );
                    },
                    visualDensity: VisualDensity.compact,
                  ),
                  IconButton(
                    icon: const Icon(Icons.share, size: 20),
                    tooltip: l.calShareTooltip,
                    onPressed: () =>
                        _export(_buildRows(city, settings), settings, l),
                    visualDensity: VisualDensity.compact,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
      body: city == null
          ? Center(
              child: Text(
                l.calNoCityText,
                textAlign: TextAlign.center,
              ),
            )
          : _CalendarTable(
              rows: _buildRows(city, settings),
              settings: settings,
              month: _month,
              hijriMode: _hijriMode,
              l: l,
            ),
    );
  }
}

// ─── Hijri / Gregorian toggle ──────────────────────────────────────────────────

class _CalendarModeToggle extends StatelessWidget {
  const _CalendarModeToggle({
    required this.hijriMode,
    required this.onChanged,
    required this.l,
  });
  final bool hijriMode;
  final ValueChanged<bool> onChanged;
  final AppLocalizations l;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ChoiceChip(
          label: Text(l.calGregToggle, style: const TextStyle(fontSize: 11)),
          selected: !hijriMode,
          onSelected: (_) => onChanged(false),
          selectedColor: PrayCalcColors.mid.withValues(alpha: 0.25),
          labelStyle: TextStyle(
            fontSize: 11,
            fontWeight: !hijriMode ? FontWeight.w600 : FontWeight.normal,
            color: cs.onSurface,
          ),
          visualDensity: VisualDensity.compact,
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          padding: const EdgeInsets.symmetric(horizontal: 4),
        ),
        const SizedBox(width: 4),
        ChoiceChip(
          label: Text(l.calHijriToggle, style: const TextStyle(fontSize: 11)),
          selected: hijriMode,
          onSelected: (_) => onChanged(true),
          selectedColor: PrayCalcColors.mid.withValues(alpha: 0.25),
          labelStyle: TextStyle(
            fontSize: 11,
            fontWeight: hijriMode ? FontWeight.w600 : FontWeight.normal,
            color: cs.onSurface,
          ),
          visualDensity: VisualDensity.compact,
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          padding: const EdgeInsets.symmetric(horizontal: 4),
        ),
      ],
    );
  }
}

// ─── Table widget ──────────────────────────────────────────────────────────────

class _CalendarTable extends StatelessWidget {
  const _CalendarTable({
    required this.rows,
    required this.settings,
    required this.month,
    required this.hijriMode,
    required this.l,
  });
  final List<_DayRow> rows;
  final AppSettings settings;
  final DateTime month;
  final bool hijriMode;
  final AppLocalizations l;

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();

    return SingleChildScrollView(
      child: DataTable(
        headingRowColor: WidgetStateProperty.all(
          Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
        ),
        dataRowMinHeight: 38,
        dataRowMaxHeight: 44,
        columnSpacing: 8,
        horizontalMargin: 8,
        columns: [
          DataColumn(label: _H(l.calDateCol)),
          DataColumn(label: _H(l.calFajrCol)),
          DataColumn(label: _H(l.calDhuhrCol)),
          DataColumn(label: _H(l.calAsrCol)),
          DataColumn(label: _H(l.calMaghribCol)),
          DataColumn(label: _H(l.calIshaCol)),
        ],
        rows: rows.map((r) {
          final isToday = r.date.year == today.year &&
              r.date.month == today.month &&
              r.date.day == today.day;
          final lqColor = _lqRowColor(r.hijri);
          final isLq = lqColor != null;
          final ts = TextStyle(
            fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
            color: isToday ? Theme.of(context).colorScheme.primary : null,
            fontSize: 12,
          );
          return DataRow(
            color: WidgetStateProperty.all(
              isToday
                  ? PrayCalcColors.light.withValues(alpha: 0.35)
                  : lqColor ?? Colors.transparent,
            ),
            cells: [
              // Merged date cell: primary date on top, secondary below
              DataCell(_DateCell(
                row: r,
                hijriMode: hijriMode,
                isToday: isToday,
                isLq: isLq,
                primaryStyle: ts,
              )),
              DataCell(Text(_fmtT(r.times.fajr, settings.use24h), style: ts)),
              DataCell(Text(_fmtT(r.times.dhuhr, settings.use24h), style: ts)),
              DataCell(Text(_fmtT(r.times.asr, settings.use24h), style: ts)),
              DataCell(
                  Text(_fmtT(r.times.maghrib, settings.use24h), style: ts)),
              DataCell(Text(_fmtT(r.times.isha, settings.use24h), style: ts)),
            ],
          );
        }).toList(),
      ),
    );
  }
}

// ─── Merged date cell ──────────────────────────────────────────────────────────

class _DateCell extends StatelessWidget {
  const _DateCell({
    required this.row,
    required this.hijriMode,
    required this.isToday,
    required this.isLq,
    required this.primaryStyle,
  });
  final _DayRow row;
  final bool hijriMode;
  final bool isToday;
  final bool isLq;
  final TextStyle primaryStyle;

  @override
  Widget build(BuildContext context) {
    final secondaryStyle = primaryStyle.copyWith(
      fontSize: 10,
      fontWeight: FontWeight.normal,
      color: (primaryStyle.color ?? Theme.of(context).colorScheme.onSurface)
          .withValues(alpha: 0.6),
    );

    final String primaryText;
    final String secondaryText;
    if (hijriMode) {
      primaryText = _shortHijri(row.hijri);
      secondaryText = _shortDate(row.date);
    } else {
      primaryText = _shortDate(row.date);
      secondaryText = _shortHijri(row.hijri);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(primaryText, style: primaryStyle),
            if (isLq) ...[
              const SizedBox(width: 3),
              Icon(
                Icons.auto_awesome,
                size: 11,
                color: Color(
                  row.hijri.hDay == 27 ? 0xFFFFB300 : 0xFFFFD54F,
                ),
              ),
            ],
          ],
        ),
        Text(secondaryText, style: secondaryStyle),
      ],
    );
  }
}

class _H extends StatelessWidget {
  const _H(this.text);
  final String text;

  @override
  Widget build(BuildContext context) =>
      Text(text, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12));
}

// ─── Data record ──────────────────────────────────────────────────────────────

class _DayRow {
  const _DayRow({required this.date, required this.hijri, required this.times});
  final DateTime date;
  final HijriCalendar hijri;
  final PrayerTimes times;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/// Localized full Gregorian month names (index 0 = empty placeholder).
List<String> _monthNamesL10n(AppLocalizations l) => [
  '',
  l.monthJanuary, l.monthFebruary, l.monthMarch, l.monthApril,
  l.monthMayFull, l.monthJune, l.monthJuly, l.monthAugust,
  l.monthSeptember, l.monthOctober, l.monthNovember, l.monthDecember,
];

/// Localized Hijri month names (index 0 = empty placeholder).
List<String> _hijriMonthsL10n(AppLocalizations l) => [
  '',
  l.hijriMuharram, l.hijriSafar, l.hijriRabiAlAwwal, l.hijriRabiAlThani,
  l.hijriJumadaAlAwwal, l.hijriJumadaAlThani, l.hijriRajab, l.hijriShaban,
  l.hijriRamadan, l.hijriShawwal, l.hijriDhulQidah, l.hijriDhulHijjah,
];

/// Localized short Gregorian month names (index 0 = empty placeholder).
List<String> _monthNamesShortL10n(AppLocalizations l) => [
  '',
  l.monthJan, l.monthFeb, l.monthMar, l.monthApr,
  l.monthMay, l.monthJun, l.monthJul, l.monthAug,
  l.monthSep, l.monthOct, l.monthNov, l.monthDec,
];

String _monthLabelL10n(AppLocalizations l, DateTime d) =>
    '${_monthNamesL10n(l)[d.month]} ${d.year}';

String _hijriMonthLabelL10n(AppLocalizations l, DateTime d) {
  final h = HijriCalendar.fromDate(DateTime(d.year, d.month, 15));
  return '${_hijriMonthsL10n(l)[h.hMonth]} ${h.hYear} ${l.homeSuffixAH}';
}

String _fmtDate(DateTime d) {
  final m = d.month.toString().padLeft(2, '0');
  final day = d.day.toString().padLeft(2, '0');
  return '${d.year}-$m-$day';
}

// Short month abbreviations for compact date cells and text export.
const _monthAbbr = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const _hijriAbbr = [
  '', 'Muh', 'Saf', 'Rab', 'Rab', 'Jum', 'Jum',
  'Raj', 'Sha', 'Ram', 'Sha', 'Dhu', 'Dhu',
];

String _shortDate(DateTime d) =>
    '${d.day.toString().padLeft(2)} ${_monthAbbr[d.month]}';

String _shortHijri(HijriCalendar h) =>
    '${h.hDay.toString().padLeft(2)} ${_hijriAbbr[h.hMonth]}';

/// Format fractional hours to HH:MM (24h) or H:MM AM/PM (12h).
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
