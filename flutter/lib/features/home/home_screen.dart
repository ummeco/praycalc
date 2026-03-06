import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:timezone/data/latest_10y.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;

import '../../core/providers/geo_provider.dart';
import '../../core/providers/prayer_provider.dart';
import '../../core/providers/ramadan_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/providers/travel_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/services/rating_service.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/settings_model.dart';
import '../../shared/widgets/adhan_modal.dart';
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

// ─── Timezone helper ──────────────────────────────────────────────────────────

bool _tzReady = false;

/// Returns the current moment expressed in [city]'s local timezone.
/// Handles both IANA names ("America/Los_Angeles") and legacy UTC±H strings.
/// Falls back to device local time if the timezone is unknown.
DateTime _cityLocalNow(City? city) {
  final deviceNow = DateTime.now();
  if (city == null) return deviceNow;

  final tz_ = city.timezone;

  // Legacy UTC±H strings from GPS reverse-geocode fallback (e.g. "UTC-8", "UTC+5:30")
  if (tz_.startsWith('UTC')) {
    final rest = tz_.substring(3);
    if (rest.isEmpty) return deviceNow.toUtc();
    final sign = rest.startsWith('-') ? -1 : 1;
    final parts = rest.substring(1).split(':');
    final h = int.tryParse(parts[0]) ?? 0;
    final m = parts.length > 1 ? (int.tryParse(parts[1]) ?? 0) : 0;
    return deviceNow.toUtc().add(Duration(minutes: sign * (h * 60 + m)));
  }

  // IANA timezone lookup (accounts for DST)
  if (!_tzReady) {
    tz_data.initializeTimeZones();
    _tzReady = true;
  }
  try {
    final location = tz.getLocation(tz_);
    final tzNow = tz.TZDateTime.fromMillisecondsSinceEpoch(
        location, deviceNow.millisecondsSinceEpoch);
    return DateTime(tzNow.year, tzNow.month, tzNow.day,
        tzNow.hour, tzNow.minute, tzNow.second);
  } catch (_) {
    return deviceNow;
  }
}

// ─── Clock formatter ──────────────────────────────────────────────────────────

String _formatClock(DateTime dt, bool use24h) {
  final h = dt.hour;
  final m = dt.minute;
  final s = dt.second;
  if (use24h) {
    return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }
  final period = h >= 12 ? 'PM' : 'AM';
  final h12 = h % 12 == 0 ? 12 : h % 12;
  return '${h12.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')} $period';
}

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
  // Incremented every second to drive rebuilds; actual time is computed in build().
  int _tick = 0;
  late final PageController _pageController;
  int _dayPage = 1; // 0 = yesterday · 1 = today · 2 = tomorrow

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 1);
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _tick++);
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
    setState(() => _tick++);
  }

  @override
  Widget build(BuildContext context) {
    final city = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);
    final todayTimes = ref.watch(prayerTimesForDayProvider(0)).valueOrNull;
    // Convert device time to the selected city's local timezone.
    // Prayer times are expressed in city-local hours, so this must match.
    final cityNow = _cityLocalNow(city);

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
                now: cityNow,
                dayPage: _dayPage,
                onCityTap: () => context.push(Routes.citySearch),
                onMoonTap: () => context.go(Routes.moon),
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
                      now: cityNow,
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

class _HomeHeader extends ConsumerWidget {
  const _HomeHeader({
    required this.city,
    required this.isAtHome,
    required this.now,
    required this.dayPage,
    required this.onCityTap,
    required this.onMoonTap,
  });

  final City? city;
  final bool isAtHome;
  final DateTime now;
  final int dayPage;
  final VoidCallback onCityTap;
  final VoidCallback onMoonTap;

  DateTime get _viewDate {
    final today = DateTime(now.year, now.month, now.day);
    return today.add(Duration(days: dayPage - 1));
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final gpsState = ref.watch(gpsProvider);
    final settings = ref.watch(settingsProvider);
    final gpsActive = gpsState.hasPosition;

    final vd = _viewDate;
    final isToday = dayPage == 1;

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    final dayName = dayNames[now.weekday - 1];
    final timeStr = _formatClock(now, settings.use24h);

    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 10, 18, 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Left column: entire city block is one tap → city search
            Expanded(
              child: GestureDetector(
                onTap: onCityTap,
                behavior: HitTestBehavior.opaque,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Flexible(
                          child: Text(
                            city?.displayName ?? 'Choose a city',
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                              color: city != null ? Colors.white : Colors.white60,
                              letterSpacing: -0.5,
                              height: 1.1,
                            ),
                          ),
                        ),
                        const SizedBox(width: 2),
                        Icon(
                          Icons.keyboard_arrow_down_rounded,
                          size: 20,
                          color: Colors.white.withAlpha(180),
                        ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    // DayName • HH:MM:SS AM/PM • home_icon • gps_icon
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (isToday) ...[
                          Text(
                            dayName,
                            style: TextStyle(
                              color: Colors.white.withAlpha(130),
                              fontSize: 12,
                            ),
                          ),
                          _HeaderDot(),
                          Text(
                            timeStr,
                            style: TextStyle(
                              color: Colors.white.withAlpha(130),
                              fontSize: 12,
                              fontFeatures: const [FontFeature.tabularFigures()],
                            ),
                          ),
                          _HeaderDot(),
                        ],
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          child: Icon(
                            isAtHome ? Icons.home_rounded : Icons.home_outlined,
                            key: ValueKey(isAtHome),
                            size: 14,
                            color: isAtHome
                                ? PrayCalcColors.light
                                : Colors.white.withAlpha(90),
                          ),
                        ),
                        _HeaderDot(),
                        Icon(
                          Icons.my_location_rounded,
                          size: 13,
                          color: gpsActive
                              ? PrayCalcColors.light
                              : Colors.white.withAlpha(90),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(width: 10),

            // Right column: date block (tappable → moon) + moon circle
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                GestureDetector(
                  onTap: onMoonTap,
                  behavior: HitTestBehavior.opaque,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: settings.hijriFirst
                        ? [
                            _HijriDateText(date: vd, isPrimary: true),
                            const SizedBox(height: 2),
                            _GregorianDateText(date: vd, isPrimary: false),
                          ]
                        : [
                            _GregorianDateText(date: vd, isPrimary: true),
                            const SizedBox(height: 2),
                            _HijriDateText(date: vd, isPrimary: false),
                          ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// Small helper widgets for the header

class _HeaderDot extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: Text('·',
            style: TextStyle(color: Colors.white.withAlpha(50), fontSize: 12)),
      );
}

class _HijriDateText extends StatelessWidget {
  const _HijriDateText({required this.date, required this.isPrimary});
  final DateTime date;
  final bool isPrimary;

  @override
  Widget build(BuildContext context) {
    final str = _hijriStr(date);
    if (str.isEmpty) return const SizedBox.shrink();
    final alpha = isPrimary ? 210 : 100;
    final suffixAlpha = isPrimary ? 110 : 55;
    return RichText(
      text: TextSpan(
        children: [
          TextSpan(
            text: str,
            style: TextStyle(
              color: Colors.white.withAlpha(alpha),
              fontSize: 10,
              fontWeight: isPrimary ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
          TextSpan(
            text: ' AH',
            style: TextStyle(
              color: Colors.white.withAlpha(suffixAlpha),
              fontSize: 9,
            ),
          ),
        ],
      ),
    );
  }

  static String _hijriStr(DateTime dt) {
    try {
      final hj = HijriCalendar.fromDate(dt);
      const months = [
        'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
        'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
      ];
      return '${months[hj.hMonth - 1]} ${hj.hDay}, ${hj.hYear}';
    } catch (_) {
      return '';
    }
  }
}

class _GregorianDateText extends StatelessWidget {
  const _GregorianDateText({required this.date, required this.isPrimary});
  final DateTime date;
  final bool isPrimary;

  @override
  Widget build(BuildContext context) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    final str = '${months[date.month - 1]} ${date.day}, ${date.year}';
    final alpha = isPrimary ? 210 : 100;
    final suffixAlpha = isPrimary ? 110 : 55;
    return RichText(
      text: TextSpan(
        children: [
          TextSpan(
            text: str,
            style: TextStyle(
              color: Colors.white.withAlpha(alpha),
              fontSize: 10,
              fontWeight: isPrimary ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
          TextSpan(
            text: ' CE',
            style: TextStyle(
              color: Colors.white.withAlpha(suffixAlpha),
              fontSize: 9,
            ),
          ),
        ],
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

class _HomeBody extends ConsumerStatefulWidget {
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

  @override
  ConsumerState<_HomeBody> createState() => _HomeBodyState();
}

class _HomeBodyState extends ConsumerState<_HomeBody> {
  int _lastActiveIdx = -2; // -2 = uninitialized
  final Set<String> _modalShownKeys = {}; // 'YYYY-M-D:prayer' — shown once per day

  double get _nowH =>
      widget.now.hour + widget.now.minute / 60.0 + widget.now.second / 3600.0;

  String _prayerLabel(String name, {bool isQasr = false}) {
    if (isQasr && (name == 'Dhuhr' || name == 'Asr' || name == 'Isha')) {
      return '$name (Qasr)';
    }
    return name;
  }

  String? _prayerSublabel(String name) {
    if (name == 'Fajr') return 'Suhoor';
    if (name == 'Maghrib') return 'Iftar';
    return null;
  }

  void _maybeShowAdhanModal(int activeIdx) {
    if (activeIdx < 0 || activeIdx == _lastActiveIdx) return;
    _lastActiveIdx = activeIdx;

    final isFard = activeIdx != 1 && activeIdx != 6; // Sunrise=1, Qiyam=6
    if (!isFard) return;

    final meta = _prayers[activeIdx];
    final now = widget.now;
    final dateKey = '${now.year}-${now.month}-${now.day}:${meta.label}';
    if (_modalShownKeys.contains(dateKey)) return;

    final soundMode = widget.settings.prayerSounds[meta.label] ?? PrayerSoundMode.off;
    if (soundMode == PrayerSoundMode.off) return;

    _modalShownKeys.add(dateKey);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && ModalRoute.of(context)?.isCurrent == true) {
        AdhanModal.show(context, meta.label);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final ramadan = ref.watch(ramadanProvider);
    final travel = ref.watch(travelProvider);
    final nowH = _nowH;
    final activeIdx = widget.isToday ? _activePrayerIndex(nowH) : -1;
    final nextIdx = widget.isToday ? _nextPrayerIndex(nowH) : -1;
    final countdownStr = (widget.isToday && nextIdx >= 0) ? _countdownString(nowH, nextIdx) : '';

    if (widget.isToday) _maybeShowAdhanModal(activeIdx);

    final nanCount = _prayers.where((m) => !m.getValue(widget.times).isFinite).length;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 32),
      children: [
        if (nanCount >= 3) ...[_PolarBanner(nanCount: nanCount), const SizedBox(height: 10)],
        const TravelBanner(),
        if (widget.isToday && ramadan.isRamadan) ...[const SizedBox(height: 10), _RamadanBanner(ramadan: ramadan)],
        const SizedBox(height: 10),

        // ── Prayer list — unified card ────────────────────────────────────
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF0D2010).withAlpha(235),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: PrayCalcColors.mid.withAlpha(70), width: 1),
            ),
            child: Column(
              children: () {
                final entries = _prayers.asMap().entries.toList();
                final tiles = <Widget>[];
                for (int i = 0; i < entries.length; i++) {
                  final idx = entries[i].key;
                  final meta = entries[i].value;
                  final h = meta.getValue(widget.times);
                  final isFard = idx != 1 && idx != 6; // Sunrise=1, Qiyam=6
                  final prayerKey = meta.label;
                  final isActiveTile = idx == activeIdx;
                  final isNextTile = idx == nextIdx;

                  final soundMode = widget.settings.prayerSounds[prayerKey] ?? PrayerSoundMode.off;

                  tiles.add(
                    _PrayerTile(
                      label: _prayerLabel(meta.label, isQasr: travel.isQasr),
                      sublabel: (widget.isToday && ramadan.isRamadan) ? _prayerSublabel(meta.label) : null,
                      hours: h,
                      use24h: widget.settings.use24h,
                      isActive: isActiveTile,
                      isNext: isNextTile,
                      isFard: isFard,
                      soundMode: soundMode,
                      onSoundTap: isFard
                          ? () {
                              const cycle = [
                                PrayerSoundMode.off,
                                PrayerSoundMode.vibrate,
                                PrayerSoundMode.beep,
                                PrayerSoundMode.adhan,
                                PrayerSoundMode.silent,
                              ];
                              final cur = cycle.indexOf(soundMode);
                              final next = cycle[(cur < 0 ? 0 : cur + 1) % cycle.length];
                              ref.read(settingsProvider.notifier).setPrayerSound(prayerKey, next);
                            }
                          : null,
                      countdown: isNextTile && countdownStr.isNotEmpty
                          ? countdownStr
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

        const SizedBox(height: 10),

        // ── Bottom action cards ───────────────────────────────────────────
        Row(
          children: [
            _ActionCard(
              icon: Icons.calendar_view_month_outlined,
              label: 'Monthly\nTimes',
              onTap: () => context.push(Routes.calendar),
            ),
            const SizedBox(width: 10),
            _ActionCard(
              icon: Icons.blur_circular_outlined,
              label: 'Dua &\nDhikr',
              onTap: () => context.push(Routes.tasbeeh),
            ),
            const SizedBox(width: 10),
            _ActionCard(
              icon: Icons.bar_chart_outlined,
              label: 'Prayer\nStats',
              onTap: () => context.push(Routes.stats),
            ),
          ],
        ),
      ],
    );
  }

  double _adjustedH(int idx) {
    final h = _prayers[idx].getValue(widget.times);
    if (idx == _prayers.length - 1 && h < _prayers[idx - 1].getValue(widget.times)) {
      return h + 24;
    }
    return h;
  }

  int _activePrayerIndex(double nowH) {
    int last = -1;
    for (int i = 0; i < _prayers.length; i++) {
      final h = _prayers[i].getValue(widget.times);
      if (!h.isFinite) continue;
      if (_adjustedH(i) <= nowH) last = i;
    }
    if (last == -1) {
      // Pre-dawn: between midnight and Fajr.
      // If we're past Qiyam (unadjusted), highlight Qiyam.
      final qH = widget.times.qiyam;
      if (qH.isFinite && qH <= nowH) return _prayers.length - 1;
      // Otherwise highlight Isha (last prayer of previous night).
      return _prayers.indexWhere((p) => p.label == 'Isha');
    }
    return last;
  }

  int _nextPrayerIndex(double nowH) {
    for (int i = 0; i < _prayers.length; i++) {
      final h = _prayers[i].getValue(widget.times);
      if (!h.isFinite) continue;
      if (_adjustedH(i) > nowH) return i;
    }
    return 0;
  }

  String _countdownString(double nowH, int nextIdx) {
    final h = _prayers[nextIdx].getValue(widget.times);
    if (!h.isFinite) return '';
    double diff = _adjustedH(nextIdx) - nowH;
    if (diff < 0) diff += 24;
    final totalSec = (diff * 3600).round();
    final hh = totalSec ~/ 3600;
    final mm = (totalSec % 3600) ~/ 60;
    final ss = totalSec % 60;
    if (totalSec < 60) return '${ss}s';
    if (hh == 0) return '$mm:${ss.toString().padLeft(2, '0')}';
    return '$hh:${mm.toString().padLeft(2, '0')}:${ss.toString().padLeft(2, '0')}';
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
    required this.isFard,
    required this.soundMode,
    this.sublabel,
    this.onSoundTap,
    this.countdown,
  });

  final String label;
  final String? sublabel;
  final double hours;
  final bool use24h;
  final bool isActive;
  final bool isNext;
  final bool isFard;
  final PrayerSoundMode soundMode;
  final VoidCallback? onSoundTap;
  final String? countdown;

  @override
  Widget build(BuildContext context) {
    final timeStr = hours.isFinite ? _formatH(hours) : '—';

    final Color bg;
    final Color nameColor;
    final Color timeColor;

    if (isActive) {
      bg = const Color(0xFF1A3A1E);
      nameColor = Colors.white;
      timeColor = PrayCalcColors.light;
    } else if (!isFard) {
      // Sunrise and Qiyam — dimmer
      bg = Colors.transparent;
      nameColor = Colors.white.withAlpha(85);
      timeColor = Colors.white.withAlpha(70);
    } else {
      bg = Colors.transparent;
      nameColor = Colors.white.withAlpha(isNext ? 220 : 185);
      timeColor = Colors.white.withAlpha(isNext ? 200 : 160);
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      decoration: BoxDecoration(color: bg),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
        child: Row(
          children: [
            // Prayer name + sublabel
            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      color: nameColor,
                      fontSize: 17,
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                      letterSpacing: -0.2,
                    ),
                  ),
                  if (sublabel != null) ...[
                    const SizedBox(width: 5),
                    Text(
                      '($sublabel)',
                      style: TextStyle(
                        color: Colors.white.withAlpha(70),
                        fontSize: 11,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // Countdown pill
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
              const SizedBox(width: 8),
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

            const SizedBox(width: 6),

            // Sound mode dot (fard only) or blank spacer for alignment
            if (isFard)
              GestureDetector(
                onTap: onSoundTap,
                behavior: HitTestBehavior.opaque,
                child: SizedBox(
                  width: 28,
                  height: 28,
                  child: Center(child: _SoundDot(mode: soundMode, isActive: isActive)),
                ),
              )
            else
              const SizedBox(width: 28, height: 28),

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

class _SoundDot extends StatelessWidget {
  const _SoundDot({required this.mode, required this.isActive});
  final PrayerSoundMode mode;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    final IconData icon;
    final Color color;

    switch (mode) {
      case PrayerSoundMode.off:
        icon = Icons.notifications_off_outlined;
        color = Colors.white.withAlpha(35);
      case PrayerSoundMode.silent:
        icon = Icons.notifications_paused_outlined;
        color = Colors.white.withAlpha(100);
      case PrayerSoundMode.vibrate:
        icon = Icons.vibration_rounded;
        color = Colors.white.withAlpha(160);
      case PrayerSoundMode.beep:
        icon = Icons.notifications_rounded;
        color = Colors.white.withAlpha(210);
      case PrayerSoundMode.adhan:
        icon = Icons.volume_up_rounded;
        color = Colors.white;
    }

    return Icon(icon, size: 15, color: color);
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
            color: const Color(0xFF0D2010).withAlpha(200),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: PrayCalcColors.mid.withAlpha(65), width: 1),
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
