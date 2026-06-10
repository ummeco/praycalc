import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/ramadan_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/providers/weather_provider.dart';
import '../../core/services/locale_service.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/moon_phase.dart';
import '../tv/tv_device_list_screen.dart';

/// Static helper to trigger showing the full window from outside widget tree.
/// In practice, the router navigates to this screen.
class DesktopFullWindow {
  static VoidCallback? _showCallback;

  /// Register a callback that opens the full window (set by the app shell).
  static void registerShowCallback(VoidCallback callback) {
    _showCallback = callback;
  }

  /// Trigger showing the full desktop window.
  static void show() {
    _showCallback?.call();
  }
}

// ---- Prayer metadata (matches TV home screen pattern) ----

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

// ---- Desktop Full Window Screen ----

/// Full-window desktop display, reusing the TV home screen layout.
///
/// Shows a large prayer times grid with countdown, Hijri date, sky gradient
/// background, moon phase, and weather. Triggered when the user double-clicks
/// the system tray icon or selects "Open Full Window" from the tray menu.
class DesktopFullWindowScreen extends ConsumerStatefulWidget {
  const DesktopFullWindowScreen({super.key});

  @override
  ConsumerState<DesktopFullWindowScreen> createState() =>
      _DesktopFullWindowScreenState();
}

class _DesktopFullWindowScreenState
    extends ConsumerState<DesktopFullWindowScreen> {
  late Timer _ticker;
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
    return 0;
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

  /// Returns a sky-gradient based on time of day for visual atmosphere.
  LinearGradient _skyGradient() {
    final hour = _now.hour + _now.minute / 60.0;

    if (hour < 5 || hour > 21) {
      // Night
      return const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF0A0E1A), Color(0xFF0D2F17)],
      );
    } else if (hour < 7) {
      // Dawn
      return const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF1A1040), Color(0xFF2D1B4E), Color(0xFF0D2F17)],
      );
    } else if (hour < 17) {
      // Day
      return const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF0F3D1A), Color(0xFF0D2F17)],
      );
    } else {
      // Dusk
      return const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xFF2D1B30), Color(0xFF1A1030), Color(0xFF0D2F17)],
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final city = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);
    final timesAsync = ref.watch(prayerTimesProvider);
    final ramadan = ref.watch(ramadanProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        body: Container(
          decoration: BoxDecoration(gradient: _skyGradient()),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 48,
                vertical: 32,
              ),
              child: Column(
                children: [
                  // Top bar: city + date (shared across tabs)
                  _DesktopTopBar(
                    cityName: city?.displayName ?? 'No city',
                    hijri: _hijriDateString(_now),
                    gregorian: _gregorianLabel(_now),
                    onClose: () => Navigator.of(context).maybePop(),
                  ),
                  const SizedBox(height: 16),

                  // Tab selector
                  const TabBar(
                    tabs: [
                      Tab(icon: Icon(Icons.home_rounded), text: 'Prayer Times'),
                      Tab(icon: Icon(Icons.tv_rounded), text: 'TV Displays'),
                    ],
                    labelColor: PrayCalcColors.light,
                    unselectedLabelColor: Colors.white54,
                    indicatorColor: PrayCalcColors.mid,
                    dividerColor: Colors.transparent,
                  ),
                  const SizedBox(height: 16),

                  // Tab content
                  Expanded(
                    child: TabBarView(
                      children: [
                        // Tab 0: Prayer times
                        timesAsync.when(
                          loading: () => const Center(
                            child: CircularProgressIndicator(
                                color: PrayCalcColors.mid),
                          ),
                          error: (e, _) => Center(
                            child: Text(
                              'Error: $e',
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 20),
                            ),
                          ),
                          data: (times) {
                            final activeIdx = _activePrayerIndex(times);
                            final nextIdx = _nextPrayerIndex(times);
                            final countdown = _countdownString(times, nextIdx);
                            final moonResult = MoonPhase.calculate(_now);

                            return Column(
                              children: [
                                _DesktopCurrentTime(
                                    now: _now, use24h: settings.use24h),
                                const SizedBox(height: 8),
                                _DesktopCountdownBanner(
                                  label: _prayerLabel(
                                    _prayers[nextIdx].label,
                                    ramadan.isRamadan,
                                  ),
                                  countdown: countdown,
                                ),
                                const SizedBox(height: 32),
                                Expanded(
                                  child: _DesktopPrayerGrid(
                                    times: times,
                                    use24h: settings.use24h,
                                    activeIdx: activeIdx,
                                    nextIdx: nextIdx,
                                    isRamadan: ramadan.isRamadan,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                _DesktopBottomBar(moonResult: moonResult),
                              ],
                            );
                          },
                        ),

                        // Tab 1: TV Displays — embeds TvDeviceListScreen
                        const TvDeviceListScreen(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _prayerLabel(String name, bool isRamadan) {
    // Banner template appends " in  countdown" so we return the prefix only.
    if (isRamadan && name == 'Fajr') return 'Suhoor ends';
    if (isRamadan && name == 'Maghrib') return 'Iftar is';
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

// ---- Sub-widgets (adapted from TV home screen for desktop) ----

class _DesktopTopBar extends StatelessWidget {
  const _DesktopTopBar({
    required this.cityName,
    required this.hijri,
    required this.gregorian,
    required this.onClose,
  });

  final String cityName;
  final String hijri;
  final String gregorian;
  final VoidCallback onClose;

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
        const SizedBox(width: 16),
        // Close button (desktop only, not on TV)
        IconButton(
          onPressed: onClose,
          icon: const Icon(Icons.close, color: Colors.white54, size: 24),
          tooltip: 'Close full window',
        ),
      ],
    );
  }
}

class _DesktopCurrentTime extends StatelessWidget {
  const _DesktopCurrentTime({required this.now, required this.use24h});

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

  // T38: delegate to LocaleService (seconds added manually)
  String _formatCurrentTime() {
    final fmt = LocaleService.instance.timeFormat;
    final hh = now.hour;
    final mm = now.minute.toString().padLeft(2, '0');
    final ss = now.second.toString().padLeft(2, '0');
    if (fmt == TimeFormat.h24) {
      return '${hh.toString().padLeft(2, '0')}:$mm:$ss';
    }
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:$mm:$ss $period';
  }
}

class _DesktopCountdownBanner extends StatelessWidget {
  const _DesktopCountdownBanner({
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

class _DesktopPrayerGrid extends StatelessWidget {
  const _DesktopPrayerGrid({
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
    const leftIndices = [0, 2, 4]; // Fajr, Dhuhr, Maghrib
    const rightIndices = [1, 3, 5]; // Sunrise, Asr, Isha

    return Row(
      children: [
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: leftIndices.map((i) => _buildTile(i)).toList(),
          ),
        ),
        const SizedBox(width: 32),
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: rightIndices.map((i) => _buildTile(i)).toList(),
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

  // T38: delegate to LocaleService.formatPrayerTime
  String _formatH(double h) {
    final totalMin = (h * 60).round();
    final hh = (totalMin ~/ 60) % 24;
    final mm = totalMin % 60;
    final now = DateTime.now();
    final t = DateTime(now.year, now.month, now.day, hh, mm);
    return LocaleService.instance.formatPrayerTime(t);
  }
}

class _DesktopBottomBar extends ConsumerWidget {
  const _DesktopBottomBar({required this.moonResult});

  final MoonPhaseResult moonResult;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final phaseName = MoonPhase.phaseName(moonResult.phase);
    final pct = moonResult.illuminationPct.round();
    final weather = ref.watch(weatherProvider);

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
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
