import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hijri/hijri_calendar.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/moon_phase.dart';
import '../../shared/models/settings_model.dart';
import '../../shared/models/hilal_visibility.dart';

const _hijriMonths = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
];

const _gregorianMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Reference locations for Hilal visibility (lat, lon, label)
const _kRegions = <(double, double, String)>[
  (21.42, 39.83, 'Middle East'),
  (6.45, 3.39, 'West Africa'),
  (24.86, 67.01, 'South Asia'),
  (51.50, -0.12, 'Europe'),
  (29.76, -95.37, 'Americas'),
];

// ── Screen ────────────────────────────────────────────────────────────────────

class MoonScreen extends ConsumerWidget {
  const MoonScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final now = DateTime.now();
    final moonResult = MoonPhase.calculate(now);
    final city = ref.watch(cityProvider);

    HijriCalendar hijri;
    try {
      hijri = HijriCalendar.now();
    } catch (_) {
      hijri = HijriCalendar()
        ..hYear = now.year - 579
        ..hMonth = 1
        ..hDay = 1;
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Moon & Hijri Calendar')),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        children: [
          _MoonImageHeader(result: moonResult, now: now),
          const SizedBox(height: 16),
          _HijriCard(hijri: hijri, now: now),
          const SizedBox(height: 12),
          _LunarCycleCard(result: moonResult),
          Divider(height: 28, color: PrayCalcColors.mid.withAlpha(30)),
          _HilalForecastCard(hijri: hijri, city: city),
          const SizedBox(height: 12),
          _HilalWorldMapCard(hijri: hijri, city: city),
          Divider(height: 28, color: PrayCalcColors.mid.withAlpha(30)),
          _WeekRow(now: now),
          Divider(height: 28, color: PrayCalcColors.mid.withAlpha(30)),
          _IslamicEventsSection(hijri: hijri),
          const SizedBox(height: 12),
          _NextRamadanCard(hijri: hijri),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

// ── Moon image header ─────────────────────────────────────────────────────────

class _MoonImageHeader extends StatelessWidget {
  const _MoonImageHeader({required this.result, required this.now});
  final MoonPhaseResult result;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final illum = result.illuminationPct.round();
    final imageUrl = MoonPhase.cycleMonthUrl(now);

    // Determine next upcoming phase event from current moon age.
    final fraction = result.moonAge / 29.53059;
    final String nextLabel;
    final double nextFrac;
    if (fraction < 0.25) {
      nextLabel = 'First Qtr';
      nextFrac = 0.25;
    } else if (fraction < 0.5) {
      nextLabel = 'Full Moon';
      nextFrac = 0.5;
    } else if (fraction < 0.75) {
      nextLabel = 'Last Qtr';
      nextFrac = 0.75;
    } else {
      nextLabel = 'New Moon';
      nextFrac = 1.0;
    }
    final daysToNext = ((nextFrac - fraction) * 29.53059).round();
    final nextValue = daysToNext <= 0
        ? 'Tonight'
        : daysToNext == 1
            ? 'Tomorrow'
            : '${daysToNext}d';

    return Column(
      children: [
        const SizedBox(height: 8),
        Container(
          width: 240,
          height: 240,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: PrayCalcColors.light.withAlpha(25),
                blurRadius: 60,
                spreadRadius: 12,
              ),
              BoxShadow(
                color: Colors.white.withAlpha(12),
                blurRadius: 30,
                spreadRadius: 4,
              ),
            ],
          ),
          child: ClipOval(
            child: Image.network(
              imageUrl,
              width: 240,
              height: 240,
              fit: BoxFit.cover,
              loadingBuilder: (_, child, progress) => progress == null
                  ? child
                  : Center(
                      child: Text(
                        MoonPhase.phaseEmoji(result.phase),
                        style: const TextStyle(fontSize: 100),
                      ),
                    ),
              errorBuilder: (context, error, stack) => Center(
                child: Text(
                  MoonPhase.phaseEmoji(result.phase),
                  style: const TextStyle(fontSize: 100),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          MoonPhase.phaseName(result.phase),
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: theme.colorScheme.primary,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _StatChip(label: 'Illuminated', value: '$illum%'),
            const SizedBox(width: 8),
            _StatChip(
                label: 'Age',
                value: '${result.moonAge.toStringAsFixed(1)}d'),
            const SizedBox(width: 8),
            _StatChip(label: nextLabel, value: nextValue),
          ],
        ),
      ],
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: theme.dividerColor.withAlpha(80)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.primary,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: theme.colorScheme.onSurface.withAlpha(150),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Hijri + Gregorian card ────────────────────────────────────────────────────

class _HijriCard extends StatelessWidget {
  const _HijriCard({required this.hijri, required this.now});
  final HijriCalendar hijri;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final monthName = (hijri.hMonth >= 1 && hijri.hMonth <= 12)
        ? _hijriMonths[hijri.hMonth - 1]
        : 'Unknown';

    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Hijri',
                      style: theme.textTheme.bodySmall?.copyWith(
                          color:
                              theme.colorScheme.onSurface.withAlpha(130))),
                  const SizedBox(height: 4),
                  Text(
                    '$monthName ${hijri.hDay}, ${hijri.hYear} AH',
                    style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('Gregorian',
                    style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withAlpha(130))),
                const SizedBox(height: 4),
                Text(
                  '${_gregorianMonths[now.month - 1]} ${now.day}, ${now.year}',
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Lunar cycle progress card ─────────────────────────────────────────────────

class _LunarCycleCard extends StatelessWidget {
  const _LunarCycleCard({required this.result});
  final MoonPhaseResult result;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final progress = (result.moonAge / 29.53059).clamp(0.0, 1.0);

    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Lunar Cycle',
                style: theme.textTheme.titleSmall
                    ?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('🌑', style: TextStyle(fontSize: 14)),
                Text('🌓', style: TextStyle(fontSize: 14)),
                Text('🌕', style: TextStyle(fontSize: 14)),
                Text('🌗', style: TextStyle(fontSize: 14)),
                Text('🌑', style: TextStyle(fontSize: 14)),
              ],
            ),
            const SizedBox(height: 4),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: theme.dividerColor.withAlpha(60),
              valueColor: AlwaysStoppedAnimation<Color>(PrayCalcColors.mid),
              borderRadius: BorderRadius.circular(4),
              minHeight: 6,
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('New Moon',
                    style: theme.textTheme.bodySmall?.copyWith(
                        fontSize: 10,
                        color: theme.colorScheme.onSurface.withAlpha(120))),
                Text(
                  'Day ${result.moonAge.round()} of ~29.5',
                  style: theme.textTheme.bodySmall?.copyWith(
                      fontSize: 11,
                      color: theme.colorScheme.onSurface.withAlpha(180)),
                ),
                Text('New Moon',
                    style: theme.textTheme.bodySmall?.copyWith(
                        fontSize: 10,
                        color: theme.colorScheme.onSurface.withAlpha(120))),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Zone badge ────────────────────────────────────────────────────────────────

Color _zoneColor(HilalZone zone) {
  switch (zone) {
    case HilalZone.naked:
      return _kMapVisible;
    case HilalZone.binoculars:
      return _kMapBino;
    case HilalZone.difficult:
      return _kMapDifficult;
    case HilalZone.invisible:
      return _kMapInvisible;
  }
}

String _zoneLabel(HilalZone zone) {
  switch (zone) {
    case HilalZone.naked:
      return 'Naked Eye';
    case HilalZone.binoculars:
      return 'Binoculars';
    case HilalZone.difficult:
      return 'Very Difficult';
    case HilalZone.invisible:
      return 'Not Visible';
  }
}

class _ZoneBadge extends StatelessWidget {
  const _ZoneBadge({required this.zone});
  final HilalZone zone;

  @override
  Widget build(BuildContext context) {
    final c = _zoneColor(zone);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: c, shape: BoxShape.circle),
        ),
        const SizedBox(width: 5),
        Text(
          _zoneLabel(zone),
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: c,
          ),
        ),
      ],
    );
  }
}

// ── Hilal sighting forecast card ──────────────────────────────────────────────

class _HilalForecastCard extends StatefulWidget {
  const _HilalForecastCard({required this.hijri, required this.city});
  final HijriCalendar hijri;
  final City? city;

  @override
  State<_HilalForecastCard> createState() => _HilalForecastCardState();
}

class _HilalForecastCardState extends State<_HilalForecastCard> {
  int _selectedDay = 29;

  DateTime _hijriDayToGreg(int day) {
    try {
      final h = HijriCalendar()
        ..hYear = widget.hijri.hYear
        ..hMonth = widget.hijri.hMonth
        ..hDay = day;
      return h.hijriToGregorian(h.hYear, h.hMonth, h.hDay);
    } catch (_) {
      return DateTime.now().add(const Duration(days: 14));
    }
  }

  /// Best zone across all regional reference points = "global" possibility.
  HilalZone _globalZone(DateTime date) {
    HilalZone best = HilalZone.invisible;
    for (final (lat, lon, _) in _kRegions) {
      final v = computeHilalVisibility(date, lat, lon);
      if (v.zone.index < best.index) best = v.zone;
    }
    return best;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final monthName = (widget.hijri.hMonth >= 1 && widget.hijri.hMonth <= 12)
        ? _hijriMonths[widget.hijri.hMonth - 1]
        : 'Unknown';

    final date28 = _hijriDayToGreg(28);
    final date29 = _hijriDayToGreg(29);

    final cityZone28 = widget.city != null
        ? computeHilalVisibility(date28, widget.city!.lat, widget.city!.lng)
        : null;
    final cityZone29 = widget.city != null
        ? computeHilalVisibility(date29, widget.city!.lat, widget.city!.lng)
        : null;

    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Text('Hilal Sighting Forecast',
                    style: theme.textTheme.titleSmall
                        ?.copyWith(fontWeight: FontWeight.w600)),
                const Spacer(),
                Text(
                  '$monthName ${widget.hijri.hYear} AH',
                  style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withAlpha(140)),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Day tab selector
            Row(
              children: [28, 29].map((day) {
                final sel = day == _selectedDay;
                return GestureDetector(
                  onTap: () => setState(() => _selectedDay = day),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 5),
                    decoration: BoxDecoration(
                      color: sel ? PrayCalcColors.mid : theme.cardTheme.color,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: sel
                            ? PrayCalcColors.mid
                            : theme.dividerColor.withAlpha(80),
                      ),
                    ),
                    child: Text(
                      'Day $day',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight:
                            sel ? FontWeight.w700 : FontWeight.w400,
                        color: sel
                            ? Colors.white
                            : theme.colorScheme.onSurface.withAlpha(160),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 12),

            // Content for selected day
            _buildDaySection(
              context: context,
              date: _selectedDay == 28 ? date28 : date29,
              cityZone: _selectedDay == 28 ? cityZone28 : cityZone29,
            ),

            Divider(
                height: 18,
                color: theme.dividerColor.withAlpha(60)),

            // Month prediction
            Row(
              children: [
                Icon(Icons.calendar_today_outlined,
                    size: 13, color: PrayCalcColors.mid),
                const SizedBox(width: 7),
                Expanded(
                  child: Text(
                    _monthPrediction(monthName, date29),
                    style: theme.textTheme.bodySmall?.copyWith(height: 1.4),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDaySection({
    required BuildContext context,
    required DateTime date,
    required HilalVisibility? cityZone,
  }) {
    final theme = Theme.of(context);
    final globalZone = _globalZone(date);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Global
        _ForecastRow(
          label: 'Global Sighting',
          zone: globalZone,
          isGlobal: true,
        ),
        const SizedBox(height: 2),
        Divider(height: 10, color: theme.dividerColor.withAlpha(40)),

        // Regions
        for (final (lat, lon, label) in _kRegions)
          _ForecastRow(
            label: label,
            zone: computeHilalVisibility(date, lat, lon).zone,
            indent: true,
          ),

        // User city
        if (cityZone != null) ...[
          Divider(height: 10, color: theme.dividerColor.withAlpha(40)),
          _ForecastRow(
            label: widget.city!.displayName,
            zone: cityZone.zone,
            isCity: true,
          ),
        ],
      ],
    );
  }

  String _monthPrediction(String monthName, DateTime date29) {
    final meccaresult =
        computeHilalVisibility(date29, 21.42, 39.83);
    final monthLength =
        meccaresult.zone != HilalZone.invisible ? 29 : 30;
    return '$monthName ${widget.hijri.hYear} AH will likely be $monthLength days. '
        '${monthLength == 29 ? 'Crescent expected to be sighted on the 29th, in sha Allah.' : 'Crescent unlikely on the 29th — month completes 30 days.'}';
  }
}

class _ForecastRow extends StatelessWidget {
  const _ForecastRow({
    required this.label,
    required this.zone,
    this.indent = false,
    this.isGlobal = false,
    this.isCity = false,
  });
  final String label;
  final HilalZone zone;
  final bool indent;
  final bool isGlobal;
  final bool isCity;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 3.0),
      child: Row(
        children: [
          if (isCity)
            Icon(Icons.location_on, size: 12, color: PrayCalcColors.mid)
          else if (indent)
            const SizedBox(width: 12)
          else
            Icon(Icons.public, size: 12,
                color: theme.colorScheme.onSurface.withAlpha(160)),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: isGlobal || isCity
                    ? FontWeight.w600
                    : FontWeight.w400,
              ),
            ),
          ),
          _ZoneBadge(zone: zone),
        ],
      ),
    );
  }
}

// ── Hilal world visibility map ────────────────────────────────────────────────

class _HilalWorldMapCard extends StatefulWidget {
  const _HilalWorldMapCard({required this.hijri, required this.city});
  final HijriCalendar hijri;
  final City? city;

  @override
  State<_HilalWorldMapCard> createState() => _HilalWorldMapCardState();
}

class _HilalWorldMapCardState extends State<_HilalWorldMapCard> {
  int _selectedDay = 29;
  late int _displayYear;
  late int _displayMonth;
  HilalGrid? _grid;

  @override
  void initState() {
    super.initState();
    _displayYear = widget.hijri.hYear;
    _displayMonth = widget.hijri.hMonth;
    _updateGrid();
  }

  void _updateGrid() {
    final date = _hijriDayToGreg(_selectedDay);
    _grid = HilalGrid.compute(date);
  }

  void _prevMonth() {
    setState(() {
      if (_displayMonth == 1) {
        _displayMonth = 12;
        _displayYear--;
      } else {
        _displayMonth--;
      }
      _updateGrid();
    });
  }

  void _nextMonth() {
    setState(() {
      if (_displayMonth == 12) {
        _displayMonth = 1;
        _displayYear++;
      } else {
        _displayMonth++;
      }
      _updateGrid();
    });
  }

  DateTime _hijriDayToGreg(int day) {
    try {
      final h = HijriCalendar()
        ..hYear = _displayYear
        ..hMonth = _displayMonth
        ..hDay = day;
      return h.hijriToGregorian(h.hYear, h.hMonth, h.hDay);
    } catch (_) {
      return DateTime.now().add(const Duration(days: 14));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final gregDate = _hijriDayToGreg(_selectedDay);
    final sunset = DateTime(gregDate.year, gregDate.month, gregDate.day, 18);
    final moonResult = MoonPhase.calculate(sunset);
    final moonAgeHours = moonResult.moonAge * 24;
    final monthName = (_displayMonth >= 1 && _displayMonth <= 12)
        ? _hijriMonths[_displayMonth - 1]
        : 'Unknown';

    // UAQ/FCNA predictions always for day 29 of current month
    final day29Greg = _hijriDayToGreg(29);
    final uaqResult = computeHilalVisibility(day29Greg, 21.42, 39.83);
    final fcnaResult = computeHilalVisibility(day29Greg, 29.76, -95.37);
    final uaq29 = uaqResult.zone != HilalZone.invisible;
    final fcna29 = fcnaResult.zone != HilalZone.invisible;
    final nextMonthLabel = ((_displayMonth % 12) + 1) >= 1
        ? _hijriMonths[(_displayMonth % 12)]
        : 'Unknown';
    final day29Str =
        '${_gregorianMonths[day29Greg.month - 1]} ${day29Greg.day}';
    final day30Greg = day29Greg.add(const Duration(days: 1));
    final day30Str =
        '${_gregorianMonths[day30Greg.month - 1]} ${day30Greg.day}';

    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Title row ─────────────────────────────────────────────────
            Row(
              children: [
                Text(
                  'Hilal Visibility Map',
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: _prevMonth,
                  behavior: HitTestBehavior.opaque,
                  child: Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    child: Icon(Icons.chevron_left,
                        size: 20, color: PrayCalcColors.mid),
                  ),
                ),
                Text(
                  '$monthName $_displayYear',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface.withAlpha(200),
                  ),
                ),
                GestureDetector(
                  onTap: _nextMonth,
                  behavior: HitTestBehavior.opaque,
                  child: Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    child: Icon(Icons.chevron_right,
                        size: 20, color: PrayCalcColors.mid),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // ── UAQ / FCNA prediction ─────────────────────────────────────
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest
                    .withAlpha(60),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                    color: theme.dividerColor.withAlpha(50)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$nextMonthLabel starts:',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface.withAlpha(180),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: _CalcBadge(
                          method: 'Umm al-Qura',
                          subtitle: 'Saudi Arabia',
                          date: uaq29 ? day29Str : day30Str,
                          days: uaq29 ? 29 : 30,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _CalcBadge(
                          method: 'FCNA / Calc.',
                          subtitle: 'North America',
                          date: fcna29 ? day29Str : day30Str,
                          days: fcna29 ? 29 : 30,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // ── Day selector ──────────────────────────────────────────────
            Row(
              children: [
                Text(
                  'Moon age at sunset: ${moonAgeHours.toStringAsFixed(1)} h',
                  style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withAlpha(130)),
                ),
                const Spacer(),
                ...[28, 29, 30].map((day) {
                  final sel = day == _selectedDay;
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedDay = day;
                        _updateGrid();
                      });
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      margin: const EdgeInsets.only(left: 6),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 9, vertical: 3),
                      decoration: BoxDecoration(
                        color: sel
                            ? PrayCalcColors.mid
                            : theme.cardTheme.color,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: sel
                              ? PrayCalcColors.mid
                              : theme.dividerColor.withAlpha(80),
                        ),
                      ),
                      child: Text(
                        'Day $day',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight:
                              sel ? FontWeight.w700 : FontWeight.w400,
                          color: sel
                              ? Colors.white
                              : theme.colorScheme.onSurface.withAlpha(160),
                        ),
                      ),
                    ),
                  );
                }),
              ],
            ),
            const SizedBox(height: 10),

            // ── World map ─────────────────────────────────────────────────
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: AspectRatio(
                aspectRatio: 2.0,
                child: CustomPaint(
                  painter: _HilalMapPainter(
                    grid: _grid,
                    isDark: theme.brightness == Brightness.dark,
                    cityLat: widget.city?.lat,
                    cityLon: widget.city?.lng,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),

            // ── Legend ────────────────────────────────────────────────────
            Wrap(
              spacing: 12,
              runSpacing: 4,
              children: const [
                _MapLegendDot(color: _kMapVisible, label: 'Naked Eye'),
                _MapLegendDot(color: _kMapBino, label: 'Binoculars'),
                _MapLegendDot(color: _kMapDifficult, label: 'Very Difficult'),
                _MapLegendDot(color: _kMapInvisible, label: 'Not Visible'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _CalcBadge extends StatelessWidget {
  const _CalcBadge({
    required this.method,
    required this.subtitle,
    required this.date,
    required this.days,
  });
  final String method;
  final String subtitle;
  final String date;
  final int days;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = days == 29 ? PrayCalcColors.mid : Colors.orange.shade400;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withAlpha(80)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(method,
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: color)),
          Text(subtitle,
              style: theme.textTheme.bodySmall?.copyWith(
                  fontSize: 10,
                  color: theme.colorScheme.onSurface.withAlpha(120))),
          const SizedBox(height: 4),
          Text(date,
              style: theme.textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurface.withAlpha(220))),
          Text('$days days',
              style: TextStyle(fontSize: 10, color: color)),
        ],
      ),
    );
  }
}

// ── Map colors ────────────────────────────────────────────────────────────────

const _kMapVisible = Color(0xFF4CAF50);
const _kMapBino = Color(0xFFC8E435);
const _kMapDifficult = Color(0xFFFF9800);
const _kMapInvisible = Color(0xFFE53935);

class _MapLegendDot extends StatelessWidget {
  const _MapLegendDot({required this.color, required this.label});
  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 9,
          height: 9,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(label,
            style: TextStyle(
                fontSize: 10,
                color: Theme.of(context)
                    .colorScheme
                    .onSurface
                    .withAlpha(170))),
      ],
    );
  }
}

// ── Hilal map painter ─────────────────────────────────────────────────────────

class _HilalMapPainter extends CustomPainter {
  const _HilalMapPainter({
    required this.grid,
    required this.isDark,
    this.cityLat,
    this.cityLon,
  });

  final HilalGrid? grid;
  final bool isDark;
  final double? cityLat;
  final double? cityLon;

  Color _colorForZone(HilalZone zone) {
    switch (zone) {
      case HilalZone.naked:
        return _kMapVisible;
      case HilalZone.binoculars:
        return _kMapBino;
      case HilalZone.difficult:
        return _kMapDifficult;
      case HilalZone.invisible:
        return _kMapInvisible;
    }
  }

  Offset _project(double lat, double lon, Size size) => Offset(
        (lon + 180) / 360 * size.width,
        (90 - lat) / 180 * size.height,
      );

  Path _continentPath(List<List<double>> coords, Size size) {
    final path = Path();
    for (var i = 0; i < coords.length; i++) {
      final p = _project(coords[i][0], coords[i][1], size);
      if (i == 0) {
        path.moveTo(p.dx, p.dy);
      } else {
        path.lineTo(p.dx, p.dy);
      }
    }
    path.close();
    return path;
  }

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Ocean background
    canvas.drawRect(
      Rect.fromLTWH(0, 0, w, h),
      Paint()
        ..color =
            isDark ? const Color(0xFF0D1B2A) : const Color(0xFF1A3A5C),
    );

    // Visibility grid from precomputed HilalGrid
    if (grid != null) {
      const step = 5.0;
      final cellH = step / 180 * h + 1;
      final cellW = step / 360 * w + 1;
      for (double lat = 80; lat >= -80; lat -= step) {
        final y = (90 - lat) / 180 * h - cellH + 1;
        for (double lon = -180; lon < 180; lon += step) {
          final x = (lon + 180) / 360 * w;
          final zone = grid!.zoneAt(lat, lon);
          final paint = Paint()..color = _colorForZone(zone).withAlpha(155);
          canvas.drawRect(Rect.fromLTWH(x, y, cellW, cellH), paint);
        }
      }
    }

    // Land masses
    final landFill = Paint()
      ..color = isDark
          ? const Color(0xFF1E3D20)
          : const Color(0xFF2E5C30)
      ..style = PaintingStyle.fill;
    final landBorder = Paint()
      ..color = isDark
          ? const Color(0xFF3A6A3C)
          : const Color(0xFF1A3C1C)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.7;

    for (final continent in _kContinents) {
      final path = _continentPath(continent, size);
      canvas.drawPath(path, landFill);
      canvas.drawPath(path, landBorder);
    }

    // City marker dot (if set)
    if (cityLat != null && cityLon != null) {
      final pos = _project(cityLat!, cityLon!, size);
      canvas.drawCircle(
        pos,
        4,
        Paint()..color = Colors.white.withAlpha(230),
      );
      canvas.drawCircle(
        pos,
        4,
        Paint()
          ..color = PrayCalcColors.mid
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.5,
      );
    }
  }

  @override
  bool shouldRepaint(_HilalMapPainter old) =>
      old.grid != grid ||
      old.isDark != isDark ||
      old.cityLat != cityLat ||
      old.cityLon != cityLon;
}

// ── Continent outlines [lat, lon] ─────────────────────────────────────────────

const _kContinents = <List<List<double>>>[
  // North America
  [
    [72, -140], [72, -72], [60, -65], [48, -54],
    [45, -66], [40, -74], [30, -80], [25, -80],
    [10, -85], [8, -77], [10, -75], [8, -82],
    [15, -92], [18, -103], [23, -110], [30, -116],
    [50, -128], [60, -142], [72, -140],
  ],
  // Greenland
  [
    [83, -45], [83, -14], [76, -14], [72, -22],
    [60, -44], [64, -52], [72, -52], [76, -45], [83, -45],
  ],
  // South America
  [
    [12, -73], [10, -63], [6, -53], [2, -50],
    [-5, -35], [-15, -37], [-23, -43], [-35, -55],
    [-55, -65], [-55, -73], [-40, -72], [-18, -70],
    [5, -77], [12, -73],
  ],
  // Europe (simplified)
  [
    [71, -26], [71, 32], [60, 32], [50, 38],
    [45, 35], [37, 36], [36, 28], [40, 26],
    [41, 20], [44, 14], [46, 10], [43, 5],
    [43, -8], [44, -9], [50, -5], [58, -5],
    [65, -14], [71, -26],
  ],
  // Africa
  [
    [37, -5], [37, 42], [12, 52], [5, 44],
    [-5, 40], [-12, 40], [-35, 26], [-35, 16],
    [-22, 16], [-5, 8], [5, -8], [15, -17],
    [21, -17], [30, -5], [37, -5],
  ],
  // Asia (includes Middle East)
  [
    [71, 32], [71, 180], [60, 165], [52, 142],
    [42, 140], [35, 130], [25, 122], [15, 110],
    [10, 105], [2, 104], [5, 100], [8, 78],
    [23, 68], [22, 58], [28, 50], [30, 48],
    [35, 36], [37, 36], [45, 35], [50, 38],
    [60, 32], [71, 32],
  ],
  // Indian subcontinent
  [
    [8, 78], [22, 88], [23, 92], [20, 93],
    [10, 80], [6, 80], [8, 78],
  ],
  // Australia
  [
    [-15, 128], [-15, 146], [-25, 153], [-38, 148],
    [-40, 135], [-33, 116], [-22, 114], [-17, 122], [-15, 128],
  ],
  // Japan
  [
    [31, 130], [35, 137], [38, 140], [44, 145],
    [45, 141], [40, 140], [37, 138], [33, 131], [31, 130],
  ],
];

// ── 7-day lunar calendar ──────────────────────────────────────────────────────

class _WeekRow extends StatelessWidget {
  const _WeekRow({required this.now});
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final days = List.generate(7, (i) => now.add(Duration(days: i - 3)));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 2, bottom: 10),
          child: Text('7-Day Lunar Calendar',
              style: theme.textTheme.titleSmall
                  ?.copyWith(fontWeight: FontWeight.w600)),
        ),
        SizedBox(
          height: 96,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: days.length,
            separatorBuilder: (_, _) => const SizedBox(width: 8),
            itemBuilder: (context, i) {
              return _DayCell(date: days[i], isToday: i == 3);
            },
          ),
        ),
      ],
    );
  }
}

class _DayCell extends StatelessWidget {
  const _DayCell({required this.date, required this.isToday});
  final DateTime date;
  final bool isToday;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final result = MoonPhase.calculate(date);
    final imageUrl = MoonPhase.cycleMonthUrl(date);
    const dayAbbr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return Container(
      width: 64,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      decoration: BoxDecoration(
        color: isToday
            ? theme.colorScheme.primary.withAlpha(30)
            : theme.cardTheme.color,
        borderRadius: BorderRadius.circular(12),
        border: isToday
            ? Border.all(color: theme.colorScheme.primary, width: 1.5)
            : Border.all(color: theme.dividerColor.withAlpha(40)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ClipOval(
            child: Image.network(
              imageUrl,
              width: 34,
              height: 34,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Text(
                MoonPhase.phaseEmoji(result.phase),
                style: const TextStyle(fontSize: 24),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            dayAbbr[date.weekday - 1],
            style: theme.textTheme.bodySmall?.copyWith(
              fontSize: 10,
              fontWeight:
                  isToday ? FontWeight.bold : FontWeight.normal,
              color: isToday
                  ? theme.colorScheme.primary
                  : theme.colorScheme.onSurface.withAlpha(140),
            ),
          ),
          Text(
            '${date.day}',
            style: theme.textTheme.bodySmall?.copyWith(
              fontSize: 12,
              fontWeight:
                  isToday ? FontWeight.bold : FontWeight.normal,
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

// ── Islamic calendar events ──────────────────────────────────────────────────

class _IslamicEvent {
  const _IslamicEvent({
    required this.hijriMonth,
    required this.hijriDay,
    required this.name,
    required this.nameAr,
  });
  final int hijriMonth;
  final int hijriDay;
  final String name;
  final String nameAr;
}

const _islamicEvents = [
  _IslamicEvent(hijriMonth: 1, hijriDay: 1, name: 'Islamic New Year', nameAr: '\u0631\u0623\u0633 \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u0647\u062C\u0631\u064A\u0629'),
  _IslamicEvent(hijriMonth: 1, hijriDay: 10, name: 'Day of Ashura', nameAr: '\u064A\u0648\u0645 \u0639\u0627\u0634\u0648\u0631\u0627\u0621'),
  _IslamicEvent(hijriMonth: 3, hijriDay: 12, name: 'Mawlid an-Nabi', nameAr: '\u0627\u0644\u0645\u0648\u0644\u062F \u0627\u0644\u0646\u0628\u0648\u064A'),
  _IslamicEvent(hijriMonth: 7, hijriDay: 27, name: "Isra' and Mi'raj", nameAr: '\u0627\u0644\u0625\u0633\u0631\u0627\u0621 \u0648\u0627\u0644\u0645\u0639\u0631\u0627\u062C'),
  _IslamicEvent(hijriMonth: 8, hijriDay: 15, name: "Sha'ban Night", nameAr: '\u0644\u064A\u0644\u0629 \u0627\u0644\u0646\u0635\u0641 \u0645\u0646 \u0634\u0639\u0628\u0627\u0646'),
  _IslamicEvent(hijriMonth: 9, hijriDay: 1, name: 'Ramadan Begins', nameAr: '\u0628\u062F\u0627\u064A\u0629 \u0631\u0645\u0636\u0627\u0646'),
  _IslamicEvent(hijriMonth: 9, hijriDay: 27, name: 'Laylatul Qadr', nameAr: '\u0644\u064A\u0644\u0629 \u0627\u0644\u0642\u062F\u0631'),
  _IslamicEvent(hijriMonth: 10, hijriDay: 1, name: 'Eid al-Fitr', nameAr: '\u0639\u064A\u062F \u0627\u0644\u0641\u0637\u0631'),
  _IslamicEvent(hijriMonth: 12, hijriDay: 8, name: 'Day of Tarwiyah', nameAr: '\u064A\u0648\u0645 \u0627\u0644\u062A\u0631\u0648\u064A\u0629'),
  _IslamicEvent(hijriMonth: 12, hijriDay: 9, name: 'Day of Arafah', nameAr: '\u064A\u0648\u0645 \u0639\u0631\u0641\u0629'),
  _IslamicEvent(hijriMonth: 12, hijriDay: 10, name: 'Eid al-Adha', nameAr: '\u0639\u064A\u062F \u0627\u0644\u0623\u0636\u062D\u0649'),
];

class _UpcomingEvent {
  const _UpcomingEvent({
    required this.event,
    required this.gregorianDate,
    required this.daysUntil,
  });
  final _IslamicEvent event;
  final DateTime gregorianDate;
  final int daysUntil;
}

class _IslamicEventsSection extends StatelessWidget {
  const _IslamicEventsSection({required this.hijri});
  final HijriCalendar hijri;

  List<_UpcomingEvent> _computeUpcoming() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final results = <_UpcomingEvent>[];

    for (final event in _islamicEvents) {
      // Try current Hijri year first, then next year
      for (final yearOffset in [0, 1]) {
        final targetYear = hijri.hYear + yearOffset;
        try {
          final h = HijriCalendar()
            ..hYear = targetYear
            ..hMonth = event.hijriMonth
            ..hDay = event.hijriDay;
          final greg = h.hijriToGregorian(h.hYear, h.hMonth, h.hDay);
          final gregDay = DateTime(greg.year, greg.month, greg.day);
          final diff = gregDay.difference(today).inDays;
          if (diff >= 0) {
            results.add(_UpcomingEvent(
              event: event,
              gregorianDate: gregDay,
              daysUntil: diff,
            ));
            break;
          }
        } catch (_) {
          // Skip if date conversion fails
        }
      }
    }

    results.sort((a, b) => a.daysUntil.compareTo(b.daysUntil));
    return results;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final upcoming = _computeUpcoming();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 2, bottom: 10),
          child: Row(
            children: [
              Icon(Icons.nightlight_round,
                  size: 18, color: PrayCalcColors.mid),
              const SizedBox(width: 8),
              Text('Upcoming Islamic Events',
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600)),
            ],
          ),
        ),
        for (final item in upcoming)
          _IslamicEventTile(item: item),
      ],
    );
  }
}

class _IslamicEventTile extends StatelessWidget {
  const _IslamicEventTile({required this.item});
  final _UpcomingEvent item;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isToday = item.daysUntil == 0;
    final gregStr =
        '${_gregorianMonths[item.gregorianDate.month - 1]} ${item.gregorianDate.day}, ${item.gregorianDate.year}';
    final daysStr = isToday
        ? 'Today'
        : item.daysUntil == 1
            ? 'Tomorrow'
            : '${item.daysUntil} days';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: isToday
            ? const Color(0xFFFFD700).withAlpha(20)
            : theme.cardTheme.color,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isToday
              ? const Color(0xFFFFD700).withAlpha(100)
              : theme.dividerColor.withAlpha(50),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.event.name,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: isToday
                        ? const Color(0xFFFFD700)
                        : theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  item.event.nameAr,
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontSize: 12,
                    color: theme.colorScheme.onSurface.withAlpha(140),
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                gregStr,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontSize: 11,
                  color: theme.colorScheme.onSurface.withAlpha(160),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                daysStr,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: isToday
                      ? const Color(0xFFFFD700)
                      : PrayCalcColors.mid,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Next Ramadan card ─────────────────────────────────────────────────────────

class _NextRamadanCard extends StatelessWidget {
  const _NextRamadanCard({required this.hijri});
  final HijriCalendar hijri;

  DateTime _ramadanStart(int hijriYear) {
    final h = HijriCalendar()
      ..hYear = hijriYear
      ..hMonth = 9
      ..hDay = 1;
    return h.hijriToGregorian(h.hYear, h.hMonth, h.hDay);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final now = DateTime.now();

    int targetYear = hijri.hYear;
    if (hijri.hMonth > 9) targetYear += 1;

    DateTime startDate;
    try {
      startDate = _ramadanStart(targetYear);
    } catch (_) {
      startDate = now.add(const Duration(days: 354));
    }

    if (startDate.isBefore(now)) {
      targetYear += 1;
      try {
        startDate = _ramadanStart(targetYear);
      } catch (_) {
        startDate = startDate.add(const Duration(days: 354));
      }
    }

    final gregStr =
        '${_gregorianMonths[startDate.month - 1]} ${startDate.day}, ${startDate.year}';
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
                    'Ramadan $targetYear AH begins',
                    style: theme.textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    gregStr,
                    style: theme.textTheme.bodyLarge?.copyWith(
                        color: PrayCalcColors.mid,
                        fontWeight: FontWeight.bold),
                  ),
                  if (daysAway > 0)
                    Text(
                      '$daysAway days away',
                      style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurface.withAlpha(160),
                          fontSize: 12),
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
