import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';

import '../../core/providers/prayer_completion_provider.dart';
import '../../core/providers/prayer_provider.dart';
import '../../core/providers/ramadan_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/providers/travel_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/services/rating_service.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/settings_model.dart';
import '../../shared/widgets/breathing_ring.dart';
import '../../shared/widgets/sky_gradient_background.dart';
import '../../shared/widgets/travel_banner.dart';

// ─── Prayer metadata ──────────────────────────────────────────────────────────

class _PrayerMeta {
  final String label;
  final IconData icon;
  final double Function(PrayerTimes) getValue;

  const _PrayerMeta(this.label, this.icon, this.getValue);
}

const _prayers = [
  _PrayerMeta('Fajr',    Icons.nightlight_round, _fajr),
  _PrayerMeta('Sunrise', Icons.wb_twilight,       _sunrise),
  _PrayerMeta('Dhuhr',   Icons.wb_sunny,          _dhuhr),
  _PrayerMeta('Asr',     Icons.wb_cloudy,         _asr),
  _PrayerMeta('Maghrib', Icons.wb_twilight,       _maghrib),
  _PrayerMeta('Isha',    Icons.brightness_3,      _isha),
  _PrayerMeta('Qiyam',   Icons.star_outline,      _qiyam),
];

double _fajr(PrayerTimes t)    => t.fajr;
double _sunrise(PrayerTimes t) => t.sunrise;
double _dhuhr(PrayerTimes t)   => t.dhuhr;
double _asr(PrayerTimes t)     => t.asr;
double _maghrib(PrayerTimes t) => t.maghrib;
double _isha(PrayerTimes t)    => t.isha;
double _qiyam(PrayerTimes t)   => t.qiyam;

// ─── Home screen ──────────────────────────────────────────────────────────────

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  late Timer _ticker;
  DateTime _now = DateTime.now();
  late final PageController _pageController;
  int _dayPage = 1; // 0 = yesterday · 1 = today · 2 = tomorrow

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 1);
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _now = DateTime.now());
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(settingsProvider.notifier).load();
      // Trigger rating prompt after 7+ days of use (throttled inside service).
      maybeRequestReview();
    });
  }

  @override
  void dispose() {
    _ticker.cancel();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    for (int d = -1; d <= 1; d++) {
      ref.invalidate(prayerTimesForDayProvider(d));
    }
    setState(() => _now = DateTime.now());
  }

  void _goToPage(int page) {
    _pageController.animateToPage(
      page,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final city = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.home_outlined, size: 22),
          tooltip: 'Home',
          onPressed: () => context.push(Routes.citySearch),
        ),
        title: Semantics(
          button: true,
          label: city != null
              ? 'Current city: ${city.displayName}. Tap to change.'
              : 'No city selected. Tap to search.',
          excludeSemantics: true,
          child: GestureDetector(
            onTap: () => context.push(Routes.citySearch),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.location_on_rounded,
                  size: 15,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 4),
                Flexible(
                  child: Text(
                    city?.displayName ?? 'Choose a city',
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                      letterSpacing: -0.3,
                    ),
                  ),
                ),
                const SizedBox(width: 2),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  size: 20,
                  color: Theme.of(context).colorScheme.onSurface.withAlpha(160),
                ),
              ],
            ),
          ),
        ),
        centerTitle: false,
        actions: const [],
      ),
      body: Column(
        children: [
          _DayTabBar(
            selectedPage: _dayPage,
            now: _now,
            onPageSelected: _goToPage,
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _refresh,
              child: PageView.builder(
                controller: _pageController,
                itemCount: 3,
                onPageChanged: (i) => setState(() => _dayPage = i),
                itemBuilder: (_, i) => _HomeDayPage(
                  dayOffset: i - 1,
                  now: _now,
                  settings: settings,
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: city == null
          ? FloatingActionButton.extended(
              onPressed: () => context.push(Routes.citySearch),
              icon: const Icon(Icons.search),
              label: const Text('Set city'),
            )
          : FloatingActionButton(
              onPressed: () => context.push(Routes.tasbeeh),
              tooltip: 'Tasbeeh counter',
              child: const Icon(Icons.radio_button_checked),
            ),
    );
  }
}

// ─── Day tab bar ──────────────────────────────────────────────────────────────

class _DayTabBar extends StatelessWidget {
  const _DayTabBar({
    required this.selectedPage,
    required this.now,
    required this.onPageSelected,
  });

  final int selectedPage;
  final DateTime now;
  final ValueChanged<int> onPageSelected;

  static const _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String _shortDate(DateTime dt) =>
      '${dt.day} ${_monthNames[dt.month - 1]}';

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final theme = Theme.of(context);

    final labels = [
      _shortDate(now.subtract(const Duration(days: 1))),
      'Today',
      _shortDate(now.add(const Duration(days: 1))),
    ];

    return Row(
      children: List.generate(3, (i) {
        final isSelected = i == selectedPage;
        return Expanded(
          child: Semantics(
            button: true,
            label: labels[i],
            selected: isSelected,
            child: InkWell(
              onTap: () => onPageSelected(i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: isSelected
                    ? BoxDecoration(
                        border: Border(
                          bottom: BorderSide(color: cs.primary, width: 2),
                        ),
                      )
                    : const BoxDecoration(
                        border: Border(
                          bottom: BorderSide(color: Colors.transparent, width: 2),
                        ),
                      ),
                child: Text(
                  labels[i],
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight:
                        isSelected ? FontWeight.w600 : FontWeight.normal,
                    color: isSelected
                        ? cs.primary
                        : cs.onSurface.withAlpha(140),
                  ),
                ),
              ),
            ),
          ),
        );
      }),
    );
  }
}

// ─── Day page ─────────────────────────────────────────────────────────────────

class _HomeDayPage extends ConsumerWidget {
  const _HomeDayPage({
    required this.dayOffset,
    required this.now,
    required this.settings,
  });

  final int dayOffset;
  final DateTime now;
  final AppSettings settings;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final city = ref.watch(cityProvider);
    if (city == null) return const _NoCityBody();

    final timesAsync = ref.watch(prayerTimesForDayProvider(dayOffset));
    final viewDate = DateTime(
      now.year, now.month, now.day,
    ).add(Duration(days: dayOffset));

    return timesAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => _ErrorBody(
        error: e,
        onRetry: () => ref.invalidate(prayerTimesForDayProvider(dayOffset)),
      ),
      data: (times) => _HomeBody(
        times: times,
        now: now,
        viewDate: viewDate,
        settings: settings,
        isToday: dayOffset == 0,
      ),
    );
  }
}

// ─── No city body ─────────────────────────────────────────────────────────────

class _NoCityBody extends StatelessWidget {
  const _NoCityBody();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.location_city_outlined,
              size: 64,
              color: cs.onSurface.withAlpha(80),
            ),
            const SizedBox(height: 16),
            Text(
              'No city selected',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Tap the city name above or the button below to set your location.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: cs.onSurface.withAlpha(160),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Error body ───────────────────────────────────────────────────────────────

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({required this.error, this.onRetry});
  final Object error;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: cs.error),
            const SizedBox(height: 12),
            Text(
              'Could not calculate prayer times.',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              '$error',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: cs.onSurface.withAlpha(140),
              ),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 16),
              FilledButton.tonal(
                onPressed: onRetry,
                child: const Text('Retry'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Body ─────────────────────────────────────────────────────────────────────

class _HomeBody extends ConsumerWidget {
  const _HomeBody({
    required this.times,
    required this.now,
    required this.viewDate,
    required this.settings,
    required this.isToday,
  });

  final PrayerTimes times;
  final DateTime now;
  final DateTime viewDate;
  final AppSettings settings;
  final bool isToday;

  double get _nowH =>
      now.hour + now.minute / 60.0 + now.second / 3600.0;

  String _prayerLabel(String name, bool isRamadan, {bool isQasr = false}) {
    if (isRamadan && name == 'Fajr') return 'Suhoor';
    if (isRamadan && name == 'Maghrib') return 'Iftar';
    if (isQasr && (name == 'Dhuhr' || name == 'Asr' || name == 'Isha')) {
      return '$name (Qasr)';
    }
    return name;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ramadan = ref.watch(ramadanProvider);
    final travel = ref.watch(travelProvider);
    final nowH = _nowH;
    final activeIdx = isToday ? _activePrayerIndex(nowH) : -1;
    final nextIdx = isToday ? _nextPrayerIndex(nowH) : -1;
    final countdown = (isToday && nextIdx >= 0)
        ? _countdownString(nowH, nextIdx)
        : '';
    final hijri = _hijriDateString(viewDate);

    final Color accentColor =
        ramadan.isRamadan ? const Color(0xFFD4A017) : PrayCalcColors.mid;

    final String countdownLabel = (isToday && nextIdx >= 0)
        ? _prayerLabel(_prayers[nextIdx].label, ramadan.isRamadan, isQasr: travel.isQasr)
        : '';

    // Countdown as Duration for the breathing ring.
    final Duration remaining = (isToday && nextIdx >= 0)
        ? () {
            double diff = _adjustedH(nextIdx) - nowH;
            if (diff < 0) diff += 24;
            return Duration(seconds: (diff * 3600).round());
          }()
        : Duration.zero;

    // Prayer tracking — only used when prayerTrackingEnabled.
    final completions = settings.prayerTrackingEnabled
        ? ref.watch(prayerCompletionProvider)
        : const <String, String>{};
    final completionNotifier = settings.prayerTrackingEnabled
        ? ref.read(prayerCompletionProvider.notifier)
        : null;
    final todayStr =
        '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

    // Detect polar NaN: 3+ non-finite prayer times means calculation is
    // unreliable for this location/season (midnight sun or polar night).
    final nanCount = _prayers
        .where((m) => !m.getValue(times).isFinite)
        .length;

    return SkyGradientBackground(
      prayers: times,
      settings: settings,
      child: Column(
        children: [
          const TravelBanner(),
          Expanded(
            child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      children: [
        Semantics(
          button: true,
          label: 'Date: ${_gregorianLabel(viewDate)}. Tap for moon phase and Hijri calendar.',
          excludeSemantics: true,
          child: GestureDetector(
            onTap: () => context.push(Routes.moon),
            child: _DateHeader(gregorian: viewDate, hijri: hijri),
          ),
        ),
        const SizedBox(height: 8),
        if (nanCount >= 3)
          _PolarBanner(nanCount: nanCount),
        if (isToday && ramadan.isRamadan) _RamadanBanner(ramadan: ramadan),
        if (isToday)
          Stack(
            alignment: Alignment.center,
            children: [
              BreathingRing(
                remaining: remaining,
                enabled: settings.countdownAnimationEnabled,
              ),
              _CountdownCard(
                nextLabel: countdownLabel,
                countdown: countdown,
                accentColor: accentColor,
              ),
            ],
          ),
        const SizedBox(height: 12),
        // ── Prayer list — grouped card, PTQ-style ────────────────────────────
        ClipRRect(
          borderRadius: BorderRadius.circular(14),
          child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).cardTheme.color,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
            children: () {
              final entries = _prayers.asMap().entries.toList();
              final tiles = <Widget>[];
              for (int i = 0; i < entries.length; i++) {
                final idx = entries[i].key;
                final meta = entries[i].value;
                final h = meta.getValue(times);
                // Fard: Fajr(0) Dhuhr(2) Asr(3) Maghrib(4) Isha(5)
                // Sunrise(1) and Qiyam(6) are not fard — no tracking.
                final isFard = idx != 1 && idx != 6;
                final prayerKey = meta.label;
                final isCompleted = isFard && completions.isNotEmpty
                    ? completionNotifier?.isCompleted(todayStr, prayerKey) ?? false
                    : false;
                final isActiveTile = idx == activeIdx;
                tiles.add(
                  _PrayerTile(
                    label: _prayerLabel(meta.label, ramadan.isRamadan, isQasr: travel.isQasr),
                    hours: h,
                    use24h: settings.use24h,
                    isActive: isActiveTile,
                    isNext: idx == nextIdx,
                    isCompleted: isCompleted,
                    onCompletionToggle: isFard && isToday
                        ? () {
                            if (isCompleted) {
                              completionNotifier?.unmark(todayStr, prayerKey);
                            } else {
                              completionNotifier?.markCompleted(todayStr, prayerKey);
                            }
                          }
                        : null,
                  ),
                );
                // Add divider between tiles (not after last, not before/after active)
                if (i < entries.length - 1) {
                  final nextIsActive = entries[i + 1].key == activeIdx;
                  if (!isActiveTile && !nextIsActive) {
                    tiles.add(Divider(
                      height: 1,
                      thickness: 1,
                      indent: 16,
                      endIndent: 16,
                      color: Theme.of(context).dividerColor,
                    ));
                  }
                }
              }
              return tiles;
            }(),
            ),   // Column
          ),     // Container
        ),       // ClipRRect
        const SizedBox(height: 80),
      ],
    ),   // ListView
          ), // Expanded
        ],
      ), // Column
    ); // SkyGradientBackground
  }

  double _adjustedH(int idx) {
    final h = _prayers[idx].getValue(times);
    if (idx == _prayers.length - 1 && h < _prayers[idx - 1].getValue(times)) {
      return h + 24;
    }
    return h;
  }

  int _activePrayerIndex(double nowH) {
    int last = -1;
    for (int i = 0; i < _prayers.length; i++) {
      final h = _prayers[i].getValue(times);
      if (!h.isFinite) continue;
      if (_adjustedH(i) <= nowH) last = i;
    }
    return last;
  }

  int _nextPrayerIndex(double nowH) {
    for (int i = 0; i < _prayers.length; i++) {
      final h = _prayers[i].getValue(times);
      if (!h.isFinite) continue;
      if (_adjustedH(i) > nowH) return i;
    }
    return 0;
  }

  String _countdownString(double nowH, int nextIdx) {
    final h = _prayers[nextIdx].getValue(times);
    if (!h.isFinite) return '--:--:--';
    double target = _adjustedH(nextIdx);
    double diff = target - nowH;
    if (diff < 0) diff += 24;
    final totalSec = (diff * 3600).round();
    final hh = totalSec ~/ 3600;
    final mm = (totalSec % 3600) ~/ 60;
    final ss = totalSec % 60;
    return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}:${ss.toString().padLeft(2, '0')}';
  }

  static const _dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  static const _monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  String _gregorianLabel(DateTime dt) =>
      '${_dayNames[dt.weekday - 1]}, ${dt.day} ${_monthNames[dt.month - 1]} ${dt.year}';

  String _hijriDateString(DateTime dt) {
    try {
      final hj = HijriCalendar.fromDate(dt);
      const months = [
        'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
        'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
      ];
      return '${hj.hDay} ${months[hj.hMonth - 1]} ${hj.hYear} AH';
    } catch (_) {
      return '';
    }
  }
}

// ─── Sub-widgets ──────────────────────────────────────────────────────────────

class _DateHeader extends StatelessWidget {
  const _DateHeader({required this.gregorian, required this.hijri});
  final DateTime gregorian;
  final String hijri;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final day = dayNames[gregorian.weekday - 1];
    final month = monthNames[gregorian.month - 1];

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            '$day, ${gregorian.day} $month ${gregorian.year}',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w700,
              letterSpacing: -0.2,
            ),
          ),
          if (hijri.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(
              hijri,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: cs.onSurface.withAlpha(140),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _CountdownCard extends StatelessWidget {
  const _CountdownCard({
    required this.nextLabel,
    required this.countdown,
    this.accentColor,
  });
  final String nextLabel;
  final String countdown;
  final Color? accentColor;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final accent = accentColor ?? cs.primary;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: [
          Text(
            nextLabel.isNotEmpty ? '$nextLabel in' : '',
            style: TextStyle(
              color: accent,
              fontSize: 13,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            countdown,
            style: TextStyle(
              color: cs.onSurface,
              fontSize: 52,
              fontWeight: FontWeight.w300,
              letterSpacing: -1,
              fontFeatures: const [FontFeature.tabularFigures()],
              height: 1.0,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Ramadan banner ───────────────────────────────────────────────────────────

class _PolarBanner extends StatelessWidget {
  const _PolarBanner({required this.nanCount});
  final int nanCount;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: cs.tertiaryContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline, size: 18, color: cs.onTertiaryContainer),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '$nanCount prayer times cannot be calculated for your location '
              'during this period (midnight sun / polar night). '
              'Try the nearest-latitude estimation method in settings.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: cs.onTertiaryContainer,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RamadanBanner extends StatelessWidget {
  const _RamadanBanner({required this.ramadan});
  final RamadanState ramadan;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFFD4A017),
      margin: const EdgeInsets.fromLTRB(0, 0, 0, 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  'Ramadan Mubarak 🌙',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
                const Spacer(),
                Text(
                  'Day ${ramadan.hDay}',
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                ),
              ],
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: (ramadan.hDay / 30.0).clamp(0.0, 1.0),
              backgroundColor: Colors.white30,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(Colors.white),
              borderRadius: BorderRadius.circular(4),
            ),
            if (ramadan.isLastTenNights) ...[
              const SizedBox(height: 6),
              Text(
                ramadan.isLaylatulQadr
                    ? 'Laylatul Qadr ✨'
                    : 'Last 10 Nights ✨',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _PrayerTile extends StatelessWidget {
  const _PrayerTile({
    required this.label,
    required this.hours,
    required this.use24h,
    required this.isActive,
    required this.isNext,
    this.isCompleted = false,
    this.onCompletionToggle,
  });

  final String label;
  final double hours;
  final bool use24h;
  final bool isActive;
  final bool isNext;
  final bool isCompleted;
  final VoidCallback? onCompletionToggle;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final timeStr = hours.isFinite ? _formatH(hours) : '—';

    // Active: solid green bg with high-contrast text
    // Next: subtle tint
    // Inactive: transparent
    final Color bg;
    final Color nameColor;
    final Color timeColor;
    final Color? checkColor;

    if (isActive) {
      bg = isDark ? PrayCalcColors.dark : PrayCalcColors.dark;
      nameColor = Colors.white;
      timeColor = Colors.white;
      checkColor = PrayCalcColors.light;
    } else if (isNext) {
      bg = isDark
          ? PrayCalcColors.surface.withAlpha(200)
          : cs.primary.withAlpha(12);
      nameColor = cs.onSurface;
      timeColor = cs.primary;
      checkColor = null;
    } else {
      bg = Colors.transparent;
      nameColor = cs.onSurface.withAlpha(isDark ? 200 : 210);
      timeColor = cs.onSurface.withAlpha(isDark ? 180 : 200);
      checkColor = null;
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            // Prayer name
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  color: nameColor,
                  fontSize: 17,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                  letterSpacing: -0.2,
                ),
              ),
            ),
            // Time
            Text(
              timeStr,
              style: TextStyle(
                color: timeColor,
                fontSize: 17,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                fontFeatures: const [FontFeature.tabularFigures()],
                letterSpacing: -0.3,
              ),
            ),
            // Completion toggle
            if (onCompletionToggle != null) ...[
              const SizedBox(width: 4),
              IconButton(
                onPressed: onCompletionToggle,
                icon: Icon(
                  isCompleted
                      ? Icons.check_circle_rounded
                      : Icons.radio_button_unchecked,
                  color: isCompleted
                      ? (isActive
                          ? PrayCalcColors.light
                          : (checkColor ?? cs.primary))
                      : (isActive
                          ? Colors.white.withAlpha(100)
                          : cs.onSurface.withAlpha(60)),
                  size: 20,
                ),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatH(double h) {
    final totalMin = (h * 60).round();
    final hh = (totalMin ~/ 60) % 24;
    final mm = totalMin % 60;
    if (use24h) {
      return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    }
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:${mm.toString().padLeft(2, '0')} $period';
  }
}
