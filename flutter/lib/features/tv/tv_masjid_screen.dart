import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/ramadan_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/providers/tv_provider.dart';
import '../../core/theme/app_theme.dart';
import 'tv_announcement_overlay.dart';

// ─── Prayer data accessors ─────────────────────────────────────────────────

class _PrayerEntry {
  final String label;
  final double Function(PrayerTimes) getAdhan;

  const _PrayerEntry(this.label, this.getAdhan);
}

const _fardPrayers = [
  _PrayerEntry('Fajr', _fajr),
  _PrayerEntry('Dhuhr', _dhuhr),
  _PrayerEntry('Asr', _asr),
  _PrayerEntry('Maghrib', _maghrib),
  _PrayerEntry('Isha', _isha),
];

double _fajr(PrayerTimes t) => t.fajr;
double _dhuhr(PrayerTimes t) => t.dhuhr;
double _asr(PrayerTimes t) => t.asr;
double _maghrib(PrayerTimes t) => t.maghrib;
double _isha(PrayerTimes t) => t.isha;

// ─── Masjid Screen ─────────────────────────────────────────────────────────

class TvMasjidScreen extends ConsumerStatefulWidget {
  const TvMasjidScreen({super.key});

  @override
  ConsumerState<TvMasjidScreen> createState() => _TvMasjidScreenState();
}

class _TvMasjidScreenState extends ConsumerState<TvMasjidScreen> {
  late Timer _ticker;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
    // Force landscape on masjid display.
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _ticker.cancel();
    SystemChrome.setPreferredOrientations(DeviceOrientation.values);
    WakelockPlus.disable();
    super.dispose();
  }

  double get _nowH =>
      _now.hour + _now.minute / 60.0 + _now.second / 3600.0;

  int _nextPrayerIndex(PrayerTimes times) {
    for (int i = 0; i < _fardPrayers.length; i++) {
      final h = _fardPrayers[i].getAdhan(times);
      if (!h.isFinite) continue;
      if (h > _nowH) return i;
    }
    return 0;
  }

  String _countdownString(PrayerTimes times, int nextIdx) {
    final h = _fardPrayers[nextIdx].getAdhan(times);
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
    final tvSettings = ref.watch(tvSettingsProvider);
    final settings = ref.watch(settingsProvider);
    final timesAsync = ref.watch(prayerTimesProvider);
    final iqamahTimes = ref.watch(iqamahTimesProvider);
    final ramadan = ref.watch(ramadanProvider);
    final isFriday = _now.weekday == DateTime.friday;

    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      body: FocusTraversalGroup(
        policy: OrderedTraversalPolicy(),
        child: KeyboardListener(
          focusNode: FocusNode(),
          autofocus: true,
          onKeyEvent: (event) {
            if (event is KeyDownEvent &&
                event.logicalKey == LogicalKeyboardKey.contextMenu) {
              context.push('/settings');
            }
          },
          child: timesAsync.when(
            loading: () => const Center(
              child: CircularProgressIndicator(color: PrayCalcColors.mid),
            ),
            error: (e, _) => Center(
              child: Text('Error: $e',
                  style: const TextStyle(color: Colors.white, fontSize: 28)),
            ),
            data: (times) {
              final nextIdx = _nextPrayerIndex(times);
              return Stack(
                children: [
                  SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 48, vertical: 24),
                      child: Column(
                        children: [
                          // ── Masjid name + current time ──
                          _MasjidHeader(
                            masjidName: tvSettings.masjidName.isNotEmpty
                                ? tvSettings.masjidName
                                : 'Masjid',
                            now: _now,
                            use24h: settings.use24h,
                          ),
                          const SizedBox(height: 8),
                          // ── Date row ──
                          _MasjidDateRow(now: _now),
                          const SizedBox(height: 24),

                          // ── Next prayer countdown ──
                          _MasjidCountdown(
                            label: _displayLabel(
                              _fardPrayers[nextIdx].label,
                              ramadan.isRamadan,
                              isFriday,
                            ),
                            countdown:
                                _countdownString(times, nextIdx),
                          ),
                          const SizedBox(height: 32),

                          // ── Prayer times table ──
                          Expanded(
                            child: _MasjidPrayerTable(
                              times: times,
                              iqamahTimes: iqamahTimes,
                              use24h: settings.use24h,
                              isRamadan: ramadan.isRamadan,
                              isFriday: isFriday,
                              nextIdx: nextIdx,
                            ),
                          ),

                          // ── Announcement bar ──
                          if (tvSettings.announcements.isNotEmpty)
                            SizedBox(
                              height: 60,
                              child: TvAnnouncementOverlay(
                                announcements: tvSettings.announcements,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  // ── QR code overlay ──
                  if (tvSettings.showQrCode &&
                      tvSettings.qrCodeUrl != null &&
                      tvSettings.qrCodeUrl!.isNotEmpty)
                    Positioned(
                      right: 32,
                      bottom: 80,
                      child: _QrPlaceholder(url: tvSettings.qrCodeUrl!),
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  String _displayLabel(String name, bool isRamadan, bool isFriday) {
    if (isFriday && name == 'Dhuhr') return "Jumu'ah";
    if (isRamadan && name == 'Fajr') return 'Suhoor';
    if (isRamadan && name == 'Maghrib') return 'Iftar';
    return name;
  }
}

// ─── Sub-widgets ───────────────────────────────────────────────────────────

class _MasjidHeader extends StatelessWidget {
  const _MasjidHeader({
    required this.masjidName,
    required this.now,
    required this.use24h,
  });

  final String masjidName;
  final DateTime now;
  final bool use24h;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            masjidName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 42,
              fontWeight: FontWeight.bold,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
        Text(
          _formatTime(),
          style: const TextStyle(
            color: PrayCalcColors.light,
            fontSize: 52,
            fontWeight: FontWeight.bold,
            fontFeatures: [FontFeature.tabularFigures()],
          ),
        ),
      ],
    );
  }

  String _formatTime() {
    final hh = now.hour;
    final mm = now.minute.toString().padLeft(2, '0');
    final ss = now.second.toString().padLeft(2, '0');
    if (use24h) return '${hh.toString().padLeft(2, '0')}:$mm:$ss';
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:$mm:$ss $period';
  }
}

class _MasjidDateRow extends StatelessWidget {
  const _MasjidDateRow({required this.now});
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday', 'Sunday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May',
        'June', 'July', 'August', 'September', 'October', 'November',
        'December'];

    final gregorian =
        '${dayNames[now.weekday - 1]}, ${monthNames[now.month - 1]} ${now.day}, ${now.year}';

    String hijri = '';
    try {
      final hj = HijriCalendar.fromDate(now);
      const hMonths = [
        'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
        'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
      ];
      hijri = '${hj.hDay} ${hMonths[hj.hMonth - 1]} ${hj.hYear} AH';
    } catch (_) {}

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          gregorian,
          style: const TextStyle(color: Colors.white60, fontSize: 24),
        ),
        if (hijri.isNotEmpty) ...[
          const SizedBox(width: 24),
          Container(width: 1, height: 20, color: Colors.white24),
          const SizedBox(width: 24),
          Text(
            hijri,
            style: const TextStyle(color: Colors.white60, fontSize: 24),
          ),
        ],
      ],
    );
  }
}

class _MasjidCountdown extends StatelessWidget {
  const _MasjidCountdown({
    required this.label,
    required this.countdown,
  });

  final String label;
  final String countdown;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
      decoration: BoxDecoration(
        color: PrayCalcColors.dark,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '$label in  ',
            style: const TextStyle(
              color: PrayCalcColors.light,
              fontSize: 36,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            countdown,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 42,
              fontWeight: FontWeight.bold,
              fontFeatures: [FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }
}

class _MasjidPrayerTable extends StatelessWidget {
  const _MasjidPrayerTable({
    required this.times,
    required this.iqamahTimes,
    required this.use24h,
    required this.isRamadan,
    required this.isFriday,
    required this.nextIdx,
  });

  final PrayerTimes times;
  final Map<String, double> iqamahTimes;
  final bool use24h;
  final bool isRamadan;
  final bool isFriday;
  final int nextIdx;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header row
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              const Expanded(
                flex: 2,
                child: Text('Prayer',
                    style: TextStyle(
                        color: PrayCalcColors.mid,
                        fontSize: 28,
                        fontWeight: FontWeight.w600)),
              ),
              Expanded(
                flex: 2,
                child: Text('Adhan',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: PrayCalcColors.mid.withAlpha(200),
                        fontSize: 28,
                        fontWeight: FontWeight.w600)),
              ),
              Expanded(
                flex: 2,
                child: Text('Iqamah',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: PrayCalcColors.mid.withAlpha(200),
                        fontSize: 28,
                        fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ),
        const Divider(color: Colors.white12, height: 1),
        // Prayer rows
        ...List.generate(_fardPrayers.length, (i) {
          final entry = _fardPrayers[i];
          final adhanH = entry.getAdhan(times);
          final iqamahH = iqamahTimes[entry.label];
          final isNext = i == nextIdx;

          String label = entry.label;
          if (isFriday && label == 'Dhuhr') label = "Jumu'ah";
          if (isRamadan && label == 'Fajr') label = 'Suhoor';
          if (isRamadan && label == 'Maghrib') label = 'Iftar';

          // Suhoor/Iftar labels for Ramadan
          String? sublabel;
          if (isRamadan && entry.label == 'Fajr') sublabel = 'Fajr';
          if (isRamadan && entry.label == 'Maghrib') sublabel = 'Maghrib';

          final adhanStr = adhanH.isFinite ? _formatH(adhanH) : 'N/A';
          final iqamahStr = iqamahH != null && iqamahH.isFinite
              ? _formatH(iqamahH)
              : 'not set';
          final semanticDesc = isNext
              ? '$label, next prayer. Adhan: $adhanStr. Iqamah: $iqamahStr'
              : '$label. Adhan: $adhanStr. Iqamah: $iqamahStr';

          return Semantics(
            label: semanticDesc,
            child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: isNext ? PrayCalcColors.dark.withAlpha(100) : null,
              border: isNext
                  ? Border.all(color: PrayCalcColors.mid, width: 2)
                  : const Border(
                      bottom: BorderSide(color: Colors.white10, width: 0.5),
                    ),
              borderRadius: isNext ? BorderRadius.circular(12) : null,
            ),
            child: Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: TextStyle(
                          color: isNext ? Colors.white : Colors.white70,
                          fontSize: 36,
                          fontWeight: isNext
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                      ),
                      if (sublabel != null)
                        Text(
                          sublabel,
                          style: const TextStyle(
                            color: Colors.white38,
                            fontSize: 22,
                          ),
                        ),
                    ],
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    adhanH.isFinite ? _formatH(adhanH) : 'N/A',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: isNext ? PrayCalcColors.light : Colors.white60,
                      fontSize: 40,
                      fontWeight:
                          isNext ? FontWeight.bold : FontWeight.normal,
                      fontFeatures: const [FontFeature.tabularFigures()],
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    iqamahH != null && iqamahH.isFinite
                        ? _formatH(iqamahH)
                        : '--',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: isNext ? Colors.white : Colors.white54,
                      fontSize: 40,
                      fontWeight:
                          isNext ? FontWeight.bold : FontWeight.normal,
                      fontFeatures: const [FontFeature.tabularFigures()],
                    ),
                  ),
                ),
              ],
            ),
          ),
          );
        }),
      ],
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

/// Placeholder for QR code. A real QR generator package (e.g. qr_flutter)
/// would replace this. Shows URL text and a bordered square for now.
class _QrPlaceholder extends StatelessWidget {
  const _QrPlaceholder({required this.url});
  final String url;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 120,
      height: 120,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.qr_code, size: 64, color: PrayCalcColors.deep),
            const SizedBox(height: 4),
            Text(
              'Scan',
              style: TextStyle(
                color: PrayCalcColors.deep,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
