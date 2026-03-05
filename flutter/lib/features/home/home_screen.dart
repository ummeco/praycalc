import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
import '../../shared/widgets/sky_gradient_background.dart';
import '../../shared/widgets/travel_banner.dart';

// ─── Prayer metadata ──────────────────────────────────────────────────────────

class _PrayerMeta {
  final String label;
  final double Function(PrayerTimes) getValue;
  const _PrayerMeta(this.label, this.getValue);
}

const _prayers = [
  _PrayerMeta('Fajr',    _fajr),
  _PrayerMeta('Sunrise', _sunrise),
  _PrayerMeta('Dhuhr',   _dhuhr),
  _PrayerMeta('Asr',     _asr),
  _PrayerMeta('Maghrib', _maghrib),
  _PrayerMeta('Isha',    _isha),
  _PrayerMeta('Qiyam',   _qiyam),
];

double _fajr(PrayerTimes t)    => t.fajr;
double _sunrise(PrayerTimes t) => t.sunrise;
double _dhuhr(PrayerTimes t)   => t.dhuhr;
double _asr(PrayerTimes t)     => t.asr;
double _maghrib(PrayerTimes t) => t.maghrib;
double _isha(PrayerTimes t)    => t.isha;
double _qiyam(PrayerTimes t)   => t.qiyam;

// ─── Home city helpers ────────────────────────────────────────────────────────

bool _cityIsHome(City? city, AppSettings settings) {
  if (city == null || settings.homeLat == null || settings.homeLng == null) {
    return false;
  }
  const delta = 0.05; // ~5 km tolerance
  return (city.lat - settings.homeLat!).abs() < delta &&
      (city.lng - settings.homeLng!).abs() < delta;
}

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

  // ── Home city actions ──────────────────────────────────────────────────────

  void _onHomeTap(City? city, AppSettings settings) {
    if (city == null) {
      context.push(Routes.citySearch);
      return;
    }
    final notifier = ref.read(settingsProvider.notifier);
    if (settings.homeLat == null) {
      _showSetHomeDialog(city, notifier);
    } else if (_cityIsHome(city, settings)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: PrayCalcColors.surface,
          content: Text(
            '${city.displayName} is your home location',
            style: const TextStyle(color: Colors.white),
          ),
          action: SnackBarAction(
            label: 'Change',
            textColor: PrayCalcColors.light,
            onPressed: () => _showSetHomeDialog(city, notifier),
          ),
        ),
      );
    } else {
      _showHomeOptionsSheet(city, settings, notifier);
    }
  }

  void _showSetHomeDialog(City city, SettingsNotifier notifier) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Set home location',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        content: Text(
          'Use ${city.displayName} as your home location?\n\n'
          'This enables travel mode auto-detection and geo-fencing reminders.',
          style: TextStyle(color: Colors.white.withAlpha(180), height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: TextStyle(color: Colors.white.withAlpha(120))),
          ),
          TextButton(
            onPressed: () {
              notifier.setHomeCoords(city.lat, city.lng);
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: PrayCalcColors.dark,
                  content: Text(
                    '${city.displayName} set as home',
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
              );
            },
            child: Text('Set as Home', style: TextStyle(color: PrayCalcColors.light)),
          ),
        ],
      ),
    );
  }

  void _showHomeOptionsSheet(City city, AppSettings settings, SettingsNotifier notifier) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: PrayCalcColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: Icon(Icons.home_outlined, color: Colors.white.withAlpha(160)),
              title: Text(
                'Set ${city.displayName} as home',
                style: const TextStyle(color: Colors.white),
              ),
              subtitle: Text(
                'Updates your saved home location',
                style: TextStyle(color: Colors.white.withAlpha(100)),
              ),
              onTap: () {
                notifier.setHomeCoords(city.lat, city.lng);
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: Icon(Icons.search_rounded, color: Colors.white.withAlpha(160)),
              title: const Text('Search another city', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(ctx);
                context.push(Routes.citySearch);
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final city = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);
    final todayTimes = ref.watch(prayerTimesForDayProvider(0)).valueOrNull;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: PrayCalcColors.canvas,
        body: SkyGradientBackground(
          prayers: todayTimes,
          settings: settings,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _HomeHeader(
                city: city,
                isAtHome: _cityIsHome(city, settings),
                hasHomeSet: settings.homeLat != null,
                now: _now,
                dayPage: _dayPage,
                onHomeTap: () => _onHomeTap(city, settings),
                onCityTap: () => context.push(Routes.citySearch),
                onMoonTap: () => context.push(Routes.moon),
                onPrevDay: _dayPage > 0 ? () => _goToPage(_dayPage - 1) : null,
                onNextDay: _dayPage < 2 ? () => _goToPage(_dayPage + 1) : null,
                onDateTap: () => context.push(Routes.calendar),
              ),
              const TravelBanner(),
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
        ),
      ),
    );
  }
}

// ─── Header ───────────────────────────────────────────────────────────────────

class _HomeHeader extends StatelessWidget {
  const _HomeHeader({
    required this.city,
    required this.isAtHome,
    required this.hasHomeSet,
    required this.now,
    required this.dayPage,
    required this.onHomeTap,
    required this.onCityTap,
    required this.onMoonTap,
    required this.onPrevDay,
    required this.onNextDay,
    required this.onDateTap,
  });

  final City? city;
  final bool isAtHome;
  final bool hasHomeSet;
  final DateTime now;
  final int dayPage;
  final VoidCallback onHomeTap;
  final VoidCallback onCityTap;
  final VoidCallback onMoonTap;
  final VoidCallback? onPrevDay;
  final VoidCallback? onNextDay;
  final VoidCallback onDateTap;

  DateTime get _viewDate {
    final today = DateTime(now.year, now.month, now.day);
    return today.add(Duration(days: dayPage - 1));
  }

  @override
  Widget build(BuildContext context) {
    final vd = _viewDate;
    final isToday = dayPage == 1;
    final gregorianStr = _gregorianStr(vd);
    final hijriStr = _hijriStr(vd);
    final timeStr = isToday
        ? '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}:${now.second.toString().padLeft(2, '0')}'
        : '';

    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 10, 18, 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row 1: Home icon (left) + Moon button (right)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GestureDetector(
                  onTap: onHomeTap,
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    child: Icon(
                      isAtHome ? Icons.home_rounded : Icons.home_outlined,
                      key: ValueKey(isAtHome),
                      size: 26,
                      color: isAtHome
                          ? PrayCalcColors.light
                          : Colors.white.withAlpha(160),
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: onMoonTap,
                  child: Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withAlpha(12),
                      border: Border.all(color: Colors.white.withAlpha(35), width: 1),
                    ),
                    child: Icon(
                      Icons.nightlight_round,
                      size: 16,
                      color: Colors.white.withAlpha(160),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8),

            // Row 2: City name + dropdown arrow
            GestureDetector(
              onTap: onCityTap,
              behavior: HitTestBehavior.opaque,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Flexible(
                    child: Text(
                      city?.displayName ?? 'Choose a city',
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: city != null ? Colors.white : Colors.white60,
                        letterSpacing: -0.5,
                        height: 1.1,
                      ),
                    ),
                  ),
                  const SizedBox(width: 3),
                  Icon(
                    Icons.keyboard_arrow_down_rounded,
                    size: 24,
                    color: Colors.white.withAlpha(200),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 8),

            // Row 3: ← date/time · Hijri →
            Row(
              children: [
                _DayArrow(icon: Icons.chevron_left_rounded, onTap: onPrevDay),
                const SizedBox(width: 2),
                Expanded(
                  child: GestureDetector(
                    onTap: onDateTap,
                    behavior: HitTestBehavior.opaque,
                    child: Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(
                          isToday ? 'Today · $gregorianStr' : gregorianStr,
                          style: TextStyle(
                            color: Colors.white.withAlpha(190),
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (timeStr.isNotEmpty)
                          Text(
                            '  ·  $timeStr',
                            style: TextStyle(
                              color: Colors.white.withAlpha(120),
                              fontSize: 13,
                              fontFeatures: const [FontFeature.tabularFigures()],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                if (hijriStr.isNotEmpty) ...[
                  const SizedBox(width: 6),
                  Text(
                    hijriStr,
                    style: TextStyle(
                      color: PrayCalcColors.light.withAlpha(160),
                      fontSize: 11,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
                const SizedBox(width: 2),
                _DayArrow(icon: Icons.chevron_right_rounded, onTap: onNextDay),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static String _gregorianStr(DateTime dt) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${days[dt.weekday - 1]}, ${dt.day} ${months[dt.month - 1]}';
  }

  static String _hijriStr(DateTime dt) {
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

class _DayArrow extends StatelessWidget {
  const _DayArrow({required this.icon, this.onTap});
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 6),
        child: Icon(
          icon,
          size: 20,
          color: onTap != null ? Colors.white54 : Colors.white12,
        ),
      ),
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
    final viewDate = DateTime(now.year, now.month, now.day)
        .add(Duration(days: dayOffset));

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
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.location_city_outlined, size: 64, color: Colors.white.withAlpha(50)),
            const SizedBox(height: 16),
            const Text(
              'No city selected',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(
              'Tap the city name above to get started.',
              style: TextStyle(color: Colors.white.withAlpha(140), fontSize: 14),
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
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: Colors.red.withAlpha(180)),
            const SizedBox(height: 12),
            const Text(
              'Could not calculate prayer times.',
              style: TextStyle(color: Colors.white, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              '$error',
              style: TextStyle(color: Colors.white.withAlpha(100), fontSize: 12),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: onRetry,
                style: OutlinedButton.styleFrom(
                  foregroundColor: PrayCalcColors.light,
                  side: BorderSide(color: PrayCalcColors.light.withAlpha(100)),
                ),
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

  double get _nowH => now.hour + now.minute / 60.0 + now.second / 3600.0;

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
    final countdownStr = (isToday && nextIdx >= 0) ? _countdownString(nowH, nextIdx) : '';

    final completions = settings.prayerTrackingEnabled
        ? ref.watch(prayerCompletionProvider)
        : const <String, String>{};
    final completionNotifier = settings.prayerTrackingEnabled
        ? ref.read(prayerCompletionProvider.notifier)
        : null;
    final todayStr = '${now.year}-${now.month.toString().padLeft(2, '0')}'
        '-${now.day.toString().padLeft(2, '0')}';

    final nanCount = _prayers.where((m) => !m.getValue(times).isFinite).length;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
      children: [
        if (nanCount >= 3) _PolarBanner(nanCount: nanCount),
        if (isToday && ramadan.isRamadan) _RamadanBanner(ramadan: ramadan),

        // ── Prayer list — glass card ──────────────────────────────────────
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.black.withAlpha(90),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withAlpha(18), width: 1),
            ),
            child: Column(
              children: () {
                final entries = _prayers.asMap().entries.toList();
                final tiles = <Widget>[];
                for (int i = 0; i < entries.length; i++) {
                  final idx = entries[i].key;
                  final meta = entries[i].value;
                  final h = meta.getValue(times);
                  final isFard = idx != 1 && idx != 6; // Sunrise=1, Qiyam=6
                  final prayerKey = meta.label;
                  final isCompleted = isFard && completions.isNotEmpty
                      ? completionNotifier?.isCompleted(todayStr, prayerKey) ?? false
                      : false;
                  final isActiveTile = idx == activeIdx;
                  final isNextTile = idx == nextIdx;

                  tiles.add(
                    _PrayerTile(
                      label: _prayerLabel(meta.label, ramadan.isRamadan,
                          isQasr: travel.isQasr),
                      hours: h,
                      use24h: settings.use24h,
                      isActive: isActiveTile,
                      isNext: isNextTile,
                      isSunrise: meta.label == 'Sunrise',
                      countdown: isNextTile && countdownStr.isNotEmpty
                          ? countdownStr
                          : null,
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

                  if (i < entries.length - 1) {
                    final nextIsActive = entries[i + 1].key == activeIdx;
                    if (!isActiveTile && !nextIsActive) {
                      tiles.add(Divider(
                        height: 1,
                        thickness: 1,
                        indent: 16,
                        endIndent: 16,
                        color: Colors.white.withAlpha(12),
                      ));
                    }
                  }
                }
                return tiles;
              }(),
            ),
          ),
        ),

        const SizedBox(height: 16),

        // ── Bottom action cards ───────────────────────────────────────────
        Row(
          children: [
            _ActionCard(
              icon: Icons.calendar_view_month_outlined,
              label: 'Monthly\nTable',
              onTap: () => context.push(Routes.calendar),
            ),
            const SizedBox(width: 10),
            _ActionCard(
              icon: Icons.calendar_today_outlined,
              label: 'Yearly\nCalendar',
              onTap: () => context.push(Routes.yearlyCalendar),
            ),
            const SizedBox(width: 10),
            _ActionCard(
              icon: Icons.explore_outlined,
              label: 'Qibla\nDirection',
              onTap: () => context.go(Routes.qibla),
            ),
          ],
        ),
      ],
    );
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
    if (!h.isFinite) return '';
    double diff = _adjustedH(nextIdx) - nowH;
    if (diff < 0) diff += 24;
    final totalSec = (diff * 3600).round();
    final hh = totalSec ~/ 3600;
    final mm = (totalSec % 3600) ~/ 60;
    final ss = totalSec % 60;
    return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}:${ss.toString().padLeft(2, '0')}';
  }
}

// ─── Prayer tile ──────────────────────────────────────────────────────────────

class _PrayerTile extends StatelessWidget {
  const _PrayerTile({
    required this.label,
    required this.hours,
    required this.use24h,
    required this.isActive,
    required this.isNext,
    this.isSunrise = false,
    this.countdown,
    this.isCompleted = false,
    this.onCompletionToggle,
  });

  final String label;
  final double hours;
  final bool use24h;
  final bool isActive;
  final bool isNext;
  final bool isSunrise;
  final String? countdown;
  final bool isCompleted;
  final VoidCallback? onCompletionToggle;

  @override
  Widget build(BuildContext context) {
    final timeStr = hours.isFinite ? _formatH(hours) : '—';

    final Color bg;
    final Color nameColor;
    final Color timeColor;

    if (isActive) {
      bg = PrayCalcColors.dark.withAlpha(210);
      nameColor = Colors.white;
      timeColor = Colors.white;
    } else if (isSunrise) {
      bg = Colors.transparent;
      nameColor = PrayCalcColors.light;
      timeColor = PrayCalcColors.light;
    } else {
      bg = Colors.transparent;
      nameColor = Colors.white.withAlpha(isNext ? 230 : 175);
      timeColor = Colors.white.withAlpha(isNext ? 220 : 155);
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
            // Countdown pill — only shown on next prayer row
            if (countdown != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: PrayCalcColors.mid.withAlpha(38),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: PrayCalcColors.mid.withAlpha(75), width: 1),
                ),
                child: Text(
                  countdown!,
                  style: TextStyle(
                    color: PrayCalcColors.light,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    fontFeatures: const [FontFeature.tabularFigures()],
                    letterSpacing: 0.3,
                  ),
                ),
              ),
              const SizedBox(width: 10),
            ],
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
            if (onCompletionToggle != null) ...[
              const SizedBox(width: 4),
              IconButton(
                onPressed: onCompletionToggle,
                icon: Icon(
                  isCompleted
                      ? Icons.check_circle_rounded
                      : Icons.radio_button_unchecked,
                  color: isCompleted
                      ? (isActive ? PrayCalcColors.light : PrayCalcColors.mid)
                      : Colors.white.withAlpha(55),
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

// ─── Action card ──────────────────────────────────────────────────────────────

class _ActionCard extends StatelessWidget {
  const _ActionCard({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: Colors.black.withAlpha(90),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white.withAlpha(18), width: 1),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 26, color: PrayCalcColors.mid),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white.withAlpha(180),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Banners ──────────────────────────────────────────────────────────────────

class _PolarBanner extends StatelessWidget {
  const _PolarBanner({required this.nanCount});
  final int nanCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.black.withAlpha(80),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withAlpha(20), width: 1),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline, size: 18, color: Colors.white.withAlpha(160)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              '$nanCount prayer times cannot be calculated for your location '
              'during this period (midnight sun / polar night). '
              'Try nearest-latitude estimation in settings.',
              style: TextStyle(
                color: Colors.white.withAlpha(160),
                fontSize: 12,
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
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      decoration: BoxDecoration(
        color: const Color(0xFF2A1F06).withAlpha(220),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFD4A017).withAlpha(60), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Ramadan Mubarak',
                style: TextStyle(
                  color: const Color(0xFFD4A017).withAlpha(230),
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
              const SizedBox(width: 6),
              Text('🌙', style: const TextStyle(fontSize: 14)),
              const Spacer(),
              Text(
                'Day ${ramadan.hDay} / 30',
                style: TextStyle(
                  color: const Color(0xFFD4A017).withAlpha(160),
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: (ramadan.hDay / 30.0).clamp(0.0, 1.0),
            backgroundColor: Colors.white.withAlpha(20),
            valueColor: AlwaysStoppedAnimation<Color>(
              const Color(0xFFD4A017).withAlpha(160),
            ),
            borderRadius: BorderRadius.circular(4),
          ),
          if (ramadan.isLastTenNights) ...[
            const SizedBox(height: 6),
            Text(
              ramadan.isLaylatulQadr ? 'Laylatul Qadr ✨' : 'Last 10 Nights ✨',
              style: TextStyle(
                color: const Color(0xFFD4A017).withAlpha(180),
                fontSize: 11,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
