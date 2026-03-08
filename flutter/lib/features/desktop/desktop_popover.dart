import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/theme/app_theme.dart';

/// Compact dark popover card shown when clicking the system tray icon.
///
/// Displays: city name, all six prayer times with current highlighted,
/// countdown to next prayer, and a close button.
class DesktopPopover extends ConsumerStatefulWidget {
  const DesktopPopover({super.key});

  @override
  ConsumerState<DesktopPopover> createState() => _DesktopPopoverState();
}

class _DesktopPopoverState extends ConsumerState<DesktopPopover> {
  late Timer _ticker;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _ticker.cancel();
    super.dispose();
  }

  double get _nowH =>
      _now.hour + _now.minute / 60.0 + _now.second / 3600.0;

  @override
  Widget build(BuildContext context) {
    final city = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);
    final timesAsync = ref.watch(prayerTimesProvider);

    return Material(
      color: Colors.transparent,
      child: Container(
        width: 280,
        decoration: BoxDecoration(
          color: PrayCalcColors.deep,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: PrayCalcColors.dark, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(128),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // City name header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: const BoxDecoration(
                color: PrayCalcColors.dark,
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on, color: PrayCalcColors.mid, size: 16),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      city?.displayName ?? 'No city set',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            // Prayer times list
            timesAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(24),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: PrayCalcColors.mid,
                  ),
                ),
              ),
              error: (e, _) => Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Error loading times',
                  style: TextStyle(color: Colors.white.withAlpha(178), fontSize: 12),
                ),
              ),
              data: (times) => _PopoverPrayerList(
                times: times,
                use24h: settings.use24h,
                nowH: _nowH,
                now: _now,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PopoverPrayerList extends StatelessWidget {
  const _PopoverPrayerList({
    required this.times,
    required this.use24h,
    required this.nowH,
    required this.now,
  });

  final PrayerTimes times;
  final bool use24h;
  final double nowH;
  final DateTime now;

  static const _prayers = [
    ('Fajr', Icons.nightlight_round),
    ('Sunrise', Icons.wb_twilight),
    ('Dhuhr', Icons.wb_sunny),
    ('Asr', Icons.wb_cloudy),
    ('Maghrib', Icons.wb_twilight),
    ('Isha', Icons.brightness_3),
  ];

  double _getTime(int idx) {
    switch (idx) {
      case 0: return times.fajr;
      case 1: return times.sunrise;
      case 2: return times.dhuhr;
      case 3: return times.asr;
      case 4: return times.maghrib;
      case 5: return times.isha;
      default: return 0;
    }
  }

  int get _activeIdx {
    int last = 0;
    for (int i = 0; i < _prayers.length; i++) {
      final h = _getTime(i);
      if (h.isFinite && h <= nowH) last = i;
    }
    return last;
  }

  int get _nextIdx {
    for (int i = 0; i < _prayers.length; i++) {
      final h = _getTime(i);
      if (h.isFinite && h > nowH) return i;
    }
    return 0;
  }

  String get _countdown {
    final h = _getTime(_nextIdx);
    if (!h.isFinite) return '--:--';
    double diff = h - nowH;
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
    final activeIdx = _activeIdx;
    final nextIdx = _nextIdx;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Countdown banner
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: PrayCalcColors.dark.withAlpha(100),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '${_prayers[nextIdx].$1} in ',
                style: const TextStyle(
                  color: PrayCalcColors.light,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                _countdown,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  fontFeatures: [FontFeature.tabularFigures()],
                ),
              ),
            ],
          ),
        ),

        // Individual prayer rows
        for (int i = 0; i < _prayers.length; i++)
          _PopoverPrayerRow(
            name: _prayers[i].$1,
            icon: _prayers[i].$2,
            time: _formatH(_getTime(i)),
            isActive: i == activeIdx,
            isNext: i == nextIdx,
          ),

        const SizedBox(height: 4),
      ],
    );
  }

  String _formatH(double h) {
    if (!h.isFinite) return 'N/A';
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

class _PopoverPrayerRow extends StatelessWidget {
  const _PopoverPrayerRow({
    required this.name,
    required this.icon,
    required this.time,
    required this.isActive,
    required this.isNext,
  });

  final String name;
  final IconData icon;
  final String time;
  final bool isActive;
  final bool isNext;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: isNext
            ? PrayCalcColors.dark.withAlpha(80)
            : isActive
                ? PrayCalcColors.deep.withAlpha(180)
                : Colors.transparent,
        border: isNext
            ? const Border(
                left: BorderSide(color: PrayCalcColors.mid, width: 2),
              )
            : null,
      ),
      child: Row(
        children: [
          Icon(
            icon,
            size: 14,
            color: isNext
                ? PrayCalcColors.light
                : isActive
                    ? PrayCalcColors.mid
                    : Colors.white54,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              name,
              style: TextStyle(
                color: isActive || isNext ? Colors.white : Colors.white70,
                fontSize: 12,
                fontWeight: isActive || isNext
                    ? FontWeight.w600
                    : FontWeight.normal,
              ),
            ),
          ),
          Text(
            time,
            style: TextStyle(
              color: isNext
                  ? PrayCalcColors.light
                  : isActive
                      ? Colors.white
                      : Colors.white70,
              fontSize: 13,
              fontWeight: isActive || isNext
                  ? FontWeight.w600
                  : FontWeight.normal,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }
}
