import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/providers/ramadan_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/providers/weather_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/moon_phase.dart';
import '../../shared/models/settings_model.dart';

// ─── Prayer metadata (shared with home_screen pattern) ─────────────────────

class _PrayerMeta {
  final String label;
  final IconData icon;
  final double Function(PrayerTimes) getValue;

  const _PrayerMeta(this.label, this.icon, this.getValue);
}

const _prayers = [
  _PrayerMeta('Fajr', Icons.nightlight_round, _fajr),
  _PrayerMeta('Sunrise', Icons.wb_twilight, _sunrise),
  _PrayerMeta('Dhuhr', Icons.wb_sunny, _dhuhr),
  _PrayerMeta('Asr', Icons.wb_cloudy, _asr),
  _PrayerMeta('Maghrib', Icons.wb_twilight, _maghrib),
  _PrayerMeta('Isha', Icons.brightness_3, _isha),
];

double _fajr(PrayerTimes t) => t.fajr;
double _sunrise(PrayerTimes t) => t.sunrise;
double _dhuhr(PrayerTimes t) => t.dhuhr;
double _asr(PrayerTimes t) => t.asr;
double _maghrib(PrayerTimes t) => t.maghrib;
double _isha(PrayerTimes t) => t.isha;

// ─── TV Home Screen ────────────────────────────────────────────────────────

class TvHomeScreen extends ConsumerStatefulWidget {
  const TvHomeScreen({super.key});

  @override
  ConsumerState<TvHomeScreen> createState() => _TvHomeScreenState();
}

class _TvHomeScreenState extends ConsumerState<TvHomeScreen> {
  late Timer _ticker;
  final _focusNode = FocusNode();
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _ticker.cancel();
    _focusNode.dispose();
    WakelockPlus.disable();
    super.dispose();
  }

  double get _nowH =>
      _now.hour + _now.minute / 60.0 + _now.second / 3600.0;

  int _activePrayerIndex(PrayerTimes times) {
    int last = 0;
    for (int i = 0; i < _prayers.length; i++) {
      final h = _prayers[i].getValue(times);
      if (!h.isFinite) continue;
      if (h <= _nowH) last = i;
    }
    return last;
  }

  int _nextPrayerIndex(PrayerTimes times) {
    for (int i = 0; i < _prayers.length; i++) {
      final h = _prayers[i].getValue(times);
      if (!h.isFinite) continue;
      if (h > _nowH) return i;
    }
    return 0; // wrap to Fajr
  }

  String _countdownString(PrayerTimes times, int nextIdx) {
    final h = _prayers[nextIdx].getValue(times);
    if (!h.isFinite) return '--:--:--';
    double diff = h - _nowH;
    if (diff < 0) diff += 24;
    final totalSec = (diff * 3600).round();
    final hh = totalSec ~/ 3600;
    final mm = (totalSec % 3600) ~/ 60;
    final ss = totalSec % 60;
    return '${hh.toString().padLeft(2, '0')}:'
        '${mm.toString().padLeft(2, '0')}:'
        '${ss.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final city = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);
    final timesAsync = ref.watch(prayerTimesProvider);
    final ramadan = ref.watch(ramadanProvider);

    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      body: FocusTraversalGroup(
        policy: OrderedTraversalPolicy(),
        child: KeyboardListener(
          focusNode: _focusNode,
          autofocus: true,
          onKeyEvent: (event) {
            if (event is KeyDownEvent) {
              if (event.logicalKey == LogicalKeyboardKey.select ||
                  event.logicalKey == LogicalKeyboardKey.enter) {
                context.push(Routes.tvSettings);
              }
            }
          },
          child: timesAsync.when(
            loading: () => const Center(
              child: CircularProgressIndicator(
                color: PrayCalcColors.mid,
              ),
            ),
            error: (e, _) => Center(
              child: Text(
                'Error: $e',
                style: const TextStyle(color: Colors.white, fontSize: 28),
              ),
            ),
            data: (times) => _TvHomeBody(
              times: times,
              now: _now,
              nowH: _nowH,
              city: city,
              settings: settings,
              ramadan: ramadan,
              activeIdx: _activePrayerIndex(times),
              nextIdx: _nextPrayerIndex(times),
              countdown: _countdownString(times, _nextPrayerIndex(times)),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Body ──────────────────────────────────────────────────────────────────

class _TvHomeBody extends StatelessWidget {
  const _TvHomeBody({
    required this.times,
    required this.now,
    required this.nowH,
    required this.city,
    required this.settings,
    required this.ramadan,
    required this.activeIdx,
    required this.nextIdx,
    required this.countdown,
  });

  final PrayerTimes times;
  final DateTime now;
  final double nowH;
  final City? city;
  final AppSettings settings;
  final RamadanState ramadan;
  final int activeIdx;
  final int nextIdx;
  final String countdown;

  @override
  Widget build(BuildContext context) {
    final moonResult = MoonPhase.calculate(now);
    final hijri = _hijriDateString(now);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 32),
        child: Column(
          children: [
            // ── Top bar: city + date ──
            _TvTopBar(
              cityName: city?.displayName ?? 'No city',
              hijri: hijri,
              gregorian: _gregorianLabel(now),
            ),
            const SizedBox(height: 24),

            // ── Current time ──
            _TvCurrentTime(now: now, use24h: settings.use24h),
            const SizedBox(height: 8),

            // ── Next prayer countdown ──
            _TvCountdownBanner(
              label: _prayerLabel(
                _prayers[nextIdx].label,
                ramadan.isRamadan,
              ),
              countdown: countdown,
            ),
            const SizedBox(height: 32),

            // ── Prayer times grid: 2 columns x 3 rows ──
            Expanded(
              child: _TvPrayerGrid(
                times: times,
                use24h: settings.use24h,
                activeIdx: activeIdx,
                nextIdx: nextIdx,
                isRamadan: ramadan.isRamadan,
              ),
            ),

            // ── Bottom: moon phase + weather ──
            const SizedBox(height: 16),
            _TvBottomBar(moonResult: moonResult),
          ],
        ),
      ),
    );
  }

  String _prayerLabel(String name, bool isRamadan) {
    if (isRamadan && name == 'Fajr') return 'Suhoor';
    if (isRamadan && name == 'Maghrib') return 'Iftar';
    return name;
  }

  String _gregorianLabel(DateTime dt) {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${dayNames[dt.weekday - 1]}, ${dt.day} ${monthNames[dt.month - 1]} ${dt.year}';
  }

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

// ─── Sub-widgets ───────────────────────────────────────────────────────────

class _TvTopBar extends StatelessWidget {
  const _TvTopBar({
    required this.cityName,
    required this.hijri,
    required this.gregorian,
  });

  final String cityName;
  final String hijri;
  final String gregorian;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // City name (left)
        Expanded(
          child: Row(
            children: [
              const Icon(Icons.location_on, color: PrayCalcColors.mid, size: 28),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  cityName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
        // Date (right)
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              gregorian,
              style: const TextStyle(color: Colors.white70, fontSize: 24),
            ),
            if (hijri.isNotEmpty)
              Text(
                hijri,
                style: const TextStyle(color: Colors.white54, fontSize: 20),
              ),
          ],
        ),
      ],
    );
  }
}

class _TvCurrentTime extends StatelessWidget {
  const _TvCurrentTime({required this.now, required this.use24h});

  final DateTime now;
  final bool use24h;

  @override
  Widget build(BuildContext context) {
    final timeStr = _formatCurrentTime();
    return Semantics(
      label: 'Current time: $timeStr',
      child: Text(
        timeStr,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 72,
          fontWeight: FontWeight.bold,
          fontFeatures: [FontFeature.tabularFigures()],
        ),
      ),
    );
  }

  String _formatCurrentTime() {
    final hh = now.hour;
    final mm = now.minute.toString().padLeft(2, '0');
    final ss = now.second.toString().padLeft(2, '0');
    if (use24h) {
      return '${hh.toString().padLeft(2, '0')}:$mm:$ss';
    }
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:$mm:$ss $period';
  }
}

class _TvCountdownBanner extends StatelessWidget {
  const _TvCountdownBanner({
    required this.label,
    required this.countdown,
  });

  final String label;
  final String countdown;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$label in $countdown',
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
        decoration: BoxDecoration(
          color: PrayCalcColors.dark,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$label in  ',
              style: const TextStyle(
                color: PrayCalcColors.light,
                fontSize: 32,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              countdown,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 36,
                fontWeight: FontWeight.bold,
                fontFeatures: [FontFeature.tabularFigures()],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TvPrayerGrid extends StatelessWidget {
  const _TvPrayerGrid({
    required this.times,
    required this.use24h,
    required this.activeIdx,
    required this.nextIdx,
    required this.isRamadan,
  });

  final PrayerTimes times;
  final bool use24h;
  final int activeIdx;
  final int nextIdx;
  final bool isRamadan;

  @override
  Widget build(BuildContext context) {
    // 2 columns x 3 rows: left = Fajr, Dhuhr, Maghrib; right = Sunrise, Asr, Isha
    const leftIndices = [0, 2, 4]; // Fajr, Dhuhr, Maghrib
    const rightIndices = [1, 3, 5]; // Sunrise, Asr, Isha

    return Row(
      children: [
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: leftIndices
                .map((i) => _buildTile(i))
                .toList(),
          ),
        ),
        const SizedBox(width: 32),
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: rightIndices
                .map((i) => _buildTile(i))
                .toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildTile(int idx) {
    final meta = _prayers[idx];
    final h = meta.getValue(times);
    final timeStr = h.isFinite ? _formatH(h) : 'N/A';
    final isActive = idx == activeIdx;
    final isNext = idx == nextIdx;

    String label = meta.label;
    if (isRamadan && label == 'Fajr') label = 'Suhoor';
    if (isRamadan && label == 'Maghrib') label = 'Iftar';

    final semanticLabel = isNext
        ? '$label at $timeStr, next prayer'
        : isActive
            ? '$label at $timeStr, current prayer'
            : '$label at $timeStr';

    return Semantics(
      label: semanticLabel,
      child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: isNext
            ? PrayCalcColors.dark.withAlpha(120)
            : isActive
                ? PrayCalcColors.deep.withAlpha(200)
                : Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        border: isNext
            ? Border.all(color: PrayCalcColors.mid, width: 2)
            : null,
      ),
      child: Row(
        children: [
          Icon(
            meta.icon,
            color: isNext
                ? PrayCalcColors.light
                : isActive
                    ? PrayCalcColors.mid
                    : Colors.white54,
            size: 36,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                color: isActive || isNext ? Colors.white : Colors.white70,
                fontSize: 32,
                fontWeight:
                    isActive || isNext ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
          Text(
            timeStr,
            style: TextStyle(
              color: isNext
                  ? PrayCalcColors.light
                  : isActive
                      ? Colors.white
                      : Colors.white70,
              fontSize: 48,
              fontWeight:
                  isActive || isNext ? FontWeight.bold : FontWeight.normal,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
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

class _TvBottomBar extends ConsumerWidget {
  const _TvBottomBar({required this.moonResult});

  final MoonPhaseResult moonResult;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final phaseName = MoonPhase.phaseName(moonResult.phase);
    final pct = moonResult.illuminationPct.round();
    final weather = ref.watch(weatherProvider);

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Moon phase (left)
        Semantics(
          label: 'Moon phase: $phaseName, $pct% illumination',
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                MoonPhase.phaseEmoji(moonResult.phase),
                style: const TextStyle(fontSize: 32),
              ),
              const SizedBox(width: 12),
              Text(
                phaseName,
                style: const TextStyle(color: Colors.white54, fontSize: 24),
              ),
              const SizedBox(width: 8),
              Text(
                '$pct%',
                style: const TextStyle(color: Colors.white38, fontSize: 20),
              ),
            ],
          ),
        ),

        // Weather (right) — only shown when data is available
        if (weather != null) ...[
          const SizedBox(width: 32),
          Container(
            width: 1,
            height: 28,
            color: Colors.white24,
          ),
          const SizedBox(width: 32),
          Semantics(
            label: 'Weather: ${weather.description}, ${weather.tempCelsius.round()}°C',
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  weather.emoji,
                  style: const TextStyle(fontSize: 32),
                ),
                const SizedBox(width: 12),
                Text(
                  '${weather.tempCelsius.round()}°C',
                  style: const TextStyle(color: Colors.white54, fontSize: 24),
                ),
                const SizedBox(width: 8),
                Text(
                  weather.description,
                  style: const TextStyle(color: Colors.white38, fontSize: 20),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
