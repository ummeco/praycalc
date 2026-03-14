// FastingTrackerScreen — Ramadan fasting day tracker.
//
// Pure SharedPreferences storage, no backend.
// Key: 'fasting_log_1447' — JSON list of {date, fasted} for Hijri year 1447.
// Key: 'ramadan_completed_juz' — JSON list of completed juz numbers (1–30).
// Route: '/ramadan/tracker'

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/ramadan_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/theme/app_theme.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ── Storage helpers ───────────────────────────────────────────────────────────

const _kLogKey = 'fasting_log_1447';
const _kJuzKey = 'ramadan_completed_juz';

Future<Map<String, bool>> _loadLog() async {
  final prefs = await SharedPreferences.getInstance();
  final raw = prefs.getString(_kLogKey) ?? '[]';
  try {
    final list = (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
    return {
      for (final e in list) (e['date'] as String): (e['fasted'] as bool),
    };
  } catch (_) {
    return {};
  }
}

Future<void> _saveLog(Map<String, bool> log) async {
  final prefs = await SharedPreferences.getInstance();
  final list = log.entries.map((e) => {'date': e.key, 'fasted': e.value}).toList();
  await prefs.setString(_kLogKey, jsonEncode(list));
}

Future<Set<int>> _loadJuz() async {
  final prefs = await SharedPreferences.getInstance();
  final raw = prefs.getString(_kJuzKey) ?? '[]';
  try {
    final list = (jsonDecode(raw) as List).cast<int>();
    return list.toSet();
  } catch (_) {
    return {};
  }
}

Future<void> _saveJuz(Set<int> completed) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString(_kJuzKey, jsonEncode(completed.toList()));
}

String _dayKey(int ramadanDay) {
  return '1447-${ramadanDay.toString().padLeft(2, '0')}';
}

// ── Ramadan date helpers ──────────────────────────────────────────────────────

/// Estimated Gregorian start dates for recent Ramadan years (1st of Ramadan).
/// These are moon-sighting estimates; adjust if local authority differs.
final _ramadanStarts = <int, DateTime>{
  1445: DateTime.utc(2024, 3, 11),
  1446: DateTime.utc(2025, 3, 1),
  1447: DateTime.utc(2026, 2, 18),
  1448: DateTime.utc(2027, 2, 7),
};

/// Returns the Hijri year of the currently active Ramadan, the start date,
/// the current day (1–30, clamped), and how many days remain until Eid.
({int hijriYear, DateTime start, int dayOfRamadan, int daysToEid}) _ramadanDateInfo() {
  final today = DateTime.now();
  final todayDate = DateTime.utc(today.year, today.month, today.day);

  // Try hijri package first — most accurate
  try {
    final h = HijriCalendar.now();
    if (h.hMonth == 9) {
      // We are in Ramadan — find the matching Gregorian start
      final year = h.hYear;
      // Use known start or approximate from hDay
      final knownStart = _ramadanStarts[year];
      final start = knownStart ?? todayDate.subtract(Duration(days: h.hDay - 1));
      final day = h.hDay.clamp(1, 30);
      final eid = start.add(const Duration(days: 30));
      final daysToEid = eid.difference(todayDate).inDays.clamp(0, 30);
      return (hijriYear: year, start: start, dayOfRamadan: day, daysToEid: daysToEid);
    }
  } catch (_) {
    // fall through to manual lookup
  }

  // Manual lookup: find the active Ramadan window
  for (final entry in _ramadanStarts.entries.toList()
    ..sort((a, b) => b.key.compareTo(a.key))) {
    final start = entry.value;
    final end = start.add(const Duration(days: 29));
    if (!todayDate.isBefore(start) && !todayDate.isAfter(end)) {
      final day = todayDate.difference(start).inDays + 1;
      final eid = start.add(const Duration(days: 30));
      final daysToEid = eid.difference(todayDate).inDays.clamp(0, 30);
      return (hijriYear: entry.key, start: start, dayOfRamadan: day, daysToEid: daysToEid);
    }
  }

  // Not currently Ramadan — show nearest upcoming Ramadan
  final upcoming = _ramadanStarts.entries
      .where((e) => e.value.isAfter(todayDate))
      .toList()
    ..sort((a, b) => a.value.compareTo(b.value));
  if (upcoming.isNotEmpty) {
    final e = upcoming.first;
    final daysToStart = e.value.difference(todayDate).inDays;
    return (hijriYear: e.key, start: e.value, dayOfRamadan: 0, daysToEid: 30 + daysToStart);
  }

  return (hijriYear: 1447, start: _ramadanStarts[1447]!, dayOfRamadan: 0, daysToEid: 0);
}

/// Formats a fractional-hour value (e.g. 18.533) to a time string.
String _formatH(double h, bool use24h) {
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

// ── Screen ────────────────────────────────────────────────────────────────────

class FastingTrackerScreen extends ConsumerStatefulWidget {
  const FastingTrackerScreen({super.key});

  @override
  ConsumerState<FastingTrackerScreen> createState() =>
      _FastingTrackerScreenState();
}

class _FastingTrackerScreenState extends ConsumerState<FastingTrackerScreen> {
  Map<String, bool> _log = {};
  Set<int> _completedJuz = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    Future.wait([_loadLog(), _loadJuz()]).then((results) {
      if (!mounted) return;
      setState(() {
        _log = results[0] as Map<String, bool>;
        _completedJuz = results[1] as Set<int>;
        _loading = false;
      });
    });
  }

  Future<void> _toggleDay(int day) async {
    final key = _dayKey(day);
    setState(() {
      _log[key] = !(_log[key] ?? false);
    });
    await _saveLog(_log);
  }

  Future<void> _toggleJuz(int juz) async {
    setState(() {
      if (_completedJuz.contains(juz)) {
        _completedJuz = Set.from(_completedJuz)..remove(juz);
      } else {
        _completedJuz = Set.from(_completedJuz)..add(juz);
      }
    });
    await _saveJuz(_completedJuz);
  }

  int get _fastedCount => _log.values.where((v) => v).length;

  // ── Prayer time countdown helpers ─────────────────────────────────────────

  String _countdown(double? prayerH) {
    if (prayerH == null || !prayerH.isFinite) return '--:--';
    final now = DateTime.now();
    final nowH = now.hour + now.minute / 60.0 + now.second / 3600.0;
    double diff = prayerH - nowH;
    if (diff < 0) diff += 24;
    final totalSec = (diff * 3600).round();
    if (totalSec <= 0) return 'Now';
    final hh = totalSec ~/ 3600;
    final mm = (totalSec % 3600) ~/ 60;
    if (hh == 0) return '${mm}m';
    return '${hh}h ${mm}m';
  }

  void _share() {
    final count = _fastedCount;
    final info = _ramadanDateInfo();
    SharePlus.instance.share(
      ShareParams(text: 'I fasted $count/30 days of Ramadan ${info.hijriYear} 🌙\nTracked with PrayCalc — praycalc.com'),
    );
  }

  @override
  Widget build(BuildContext context) {
    final timesAsync = ref.watch(prayerTimesProvider);
    final settings = ref.watch(settingsProvider);
    final ramadan = ref.watch(ramadanProvider);

    final fajrH = timesAsync.valueOrNull?.fajr;
    final maghribH = timesAsync.valueOrNull?.maghrib;

    final now = DateTime.now();
    final nowH = now.hour + now.minute / 60.0;

    // Sehri active if within 2h before Fajr
    final sehriActive = fajrH != null &&
        fajrH.isFinite &&
        nowH >= fajrH - 2 &&
        nowH < fajrH;

    final info = _ramadanDateInfo();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ramadan Tracker'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: _share,
            tooltip: 'Share progress',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // ── RAMADAN-3: Date header ───────────────────────────────
                _RamadanDateHeader(
                  dayOfRamadan: info.dayOfRamadan > 0
                      ? info.dayOfRamadan
                      : (ramadan.isRamadan ? ramadan.hDay : 0),
                  daysToEid: info.daysToEid,
                  hijriYear: info.hijriYear,
                ),

                const SizedBox(height: 14),

                // ── Streak header ────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A1F06).withAlpha(200),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                        color: const Color(0xFFD4A017).withAlpha(60)),
                  ),
                  child: Row(
                    children: [
                      const Text('🌙',
                          style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '$_fastedCount days fasted',
                            style: const TextStyle(
                              color: Color(0xFFD4A017),
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          Text(
                            '${30 - _fastedCount} remaining',
                            style: TextStyle(
                              color: const Color(0xFFD4A017).withAlpha(160),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // ── RAMADAN-1: Suhoor / Iftar time cards ─────────────────
                Row(
                  children: [
                    Expanded(
                      child: _PrayerTimeCard(
                        label: 'Suhoor (Fajr)',
                        time: fajrH != null && fajrH.isFinite
                            ? _formatH(fajrH, settings.use24h)
                            : '--:--',
                        countdown: sehriActive
                            ? 'ends in ${_countdown(fajrH)}'
                            : null,
                        icon: Icons.nightlight_round,
                        active: sehriActive,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _PrayerTimeCard(
                        label: 'Iftar (Maghrib)',
                        time: maghribH != null && maghribH.isFinite
                            ? _formatH(maghribH, settings.use24h)
                            : '--:--',
                        countdown: maghribH != null && maghribH.isFinite
                            ? 'in ${_countdown(maghribH)}'
                            : null,
                        icon: Icons.wb_twilight,
                        active: true,
                      ),
                    ),
                  ],
                ),

                // Iftar progress bar
                if (fajrH != null && maghribH != null &&
                    fajrH.isFinite && maghribH.isFinite) ...[
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: ((nowH - fajrH) / (maghribH - fajrH))
                          .clamp(0.0, 1.0),
                      minHeight: 6,
                      backgroundColor: Colors.white.withAlpha(20),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        Color(0xFFD4A017),
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 20),

                // ── Calendar grid ────────────────────────────────────────
                Text(
                  'Ramadan ${info.hijriYear}',
                  style: TextStyle(
                    color: PrayCalcColors.light,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 10),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 7,
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                    childAspectRatio: 1,
                  ),
                  itemCount: 30,
                  itemBuilder: (context, i) {
                    final day = i + 1;
                    final key = _dayKey(day);
                    final fasted = _log[key] ?? false;
                    final todayDay = info.dayOfRamadan > 0
                        ? info.dayOfRamadan
                        : (ramadan.isRamadan ? ramadan.hDay : -1);
                    final isToday = day == todayDay;

                    Color bg;
                    Color border;
                    if (isToday) {
                      bg = const Color(0xFF1565C0).withAlpha(180);
                      border = Colors.blueAccent;
                    } else if (fasted) {
                      bg = PrayCalcColors.mid.withAlpha(180);
                      border = PrayCalcColors.light.withAlpha(120);
                    } else {
                      bg = Colors.white.withAlpha(15);
                      border = Colors.white.withAlpha(25);
                    }

                    return GestureDetector(
                      onTap: () => _toggleDay(day),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        decoration: BoxDecoration(
                          color: bg,
                          shape: BoxShape.circle,
                          border: Border.all(color: border, width: 1.5),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '$day',
                          style: TextStyle(
                            color: fasted || isToday
                                ? Colors.white
                                : Colors.white.withAlpha(160),
                            fontSize: 13,
                            fontWeight: fasted || isToday
                                ? FontWeight.w700
                                : FontWeight.w400,
                          ),
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 24),

                // ── RAMADAN-2: Juz progress tracker ──────────────────────
                _JuzTracker(
                  completedJuz: _completedJuz,
                  onToggle: _toggleJuz,
                ),

                const SizedBox(height: 32),
              ],
            ),
    );
  }
}

// ── RAMADAN-3: Ramadan date header ────────────────────────────────────────────

class _RamadanDateHeader extends StatelessWidget {
  const _RamadanDateHeader({
    required this.dayOfRamadan,
    required this.daysToEid,
    required this.hijriYear,
  });

  final int dayOfRamadan;
  final int daysToEid;
  final int hijriYear;

  String get _hijriDateString {
    try {
      final h = HijriCalendar.now();
      return '${h.hDay} Ramadan $hijriYear AH';
    } catch (_) {
      return 'Ramadan $hijriYear AH';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isActive = dayOfRamadan > 0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      decoration: BoxDecoration(
        color: const Color(0xFF0D2F17),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E5E2F).withAlpha(180)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('☽', style: TextStyle(fontSize: 32)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isActive ? 'Day $dayOfRamadan of Ramadan' : 'Ramadan $hijriYear',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _hijriDateString,
                  style: TextStyle(
                    color: Colors.white.withAlpha(180),
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 6),
                if (daysToEid > 0)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E5E2F).withAlpha(180),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '$daysToEid day${daysToEid == 1 ? '' : 's'} to Eid Al-Fitr',
                      style: const TextStyle(
                        color: Color(0xFFC9F27A),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── RAMADAN-1: Prayer time card ───────────────────────────────────────────────

class _PrayerTimeCard extends StatelessWidget {
  const _PrayerTimeCard({
    required this.label,
    required this.time,
    required this.icon,
    required this.active,
    this.countdown,
  });

  final String label;
  final String time;
  final String? countdown;
  final IconData icon;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF2A1F06).withAlpha(160),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFD4A017).withAlpha(active ? 80 : 30),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon,
                  size: 14,
                  color: const Color(0xFFD4A017).withAlpha(180)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    color: const Color(0xFFD4A017).withAlpha(160),
                    fontSize: 11,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            time,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w700,
            ),
          ),
          if (countdown != null) ...[
            const SizedBox(height: 2),
            Text(
              countdown!,
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

// ── RAMADAN-2: Juz tracker ────────────────────────────────────────────────────

class _JuzTracker extends StatelessWidget {
  const _JuzTracker({
    required this.completedJuz,
    required this.onToggle,
  });

  final Set<int> completedJuz;
  final void Function(int juz) onToggle;

  @override
  Widget build(BuildContext context) {
    final completed = completedJuz.length;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(8),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Quran — Juz Progress',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '$completed / 30',
                style: TextStyle(
                  color: PrayCalcColors.light,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // 5 columns × 6 rows = 30 cells
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 5,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 1.2,
            ),
            itemCount: 30,
            itemBuilder: (context, i) {
              final juz = i + 1;
              final done = completedJuz.contains(juz);
              return GestureDetector(
                onTap: () => onToggle(juz),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  decoration: BoxDecoration(
                    color: done
                        ? PrayCalcColors.mid.withAlpha(200)
                        : Colors.white.withAlpha(15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: done
                          ? PrayCalcColors.light.withAlpha(160)
                          : Colors.white.withAlpha(25),
                      width: 1.2,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '$juz',
                    style: TextStyle(
                      color: done
                          ? Colors.white
                          : Colors.white.withAlpha(140),
                      fontSize: 13,
                      fontWeight:
                          done ? FontWeight.w700 : FontWeight.w400,
                    ),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 12),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: completed / 30,
              minHeight: 6,
              backgroundColor: Colors.white.withAlpha(20),
              valueColor: AlwaysStoppedAnimation<Color>(
                PrayCalcColors.mid,
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '$completed / 30 Juz completed',
            style: TextStyle(
              color: Colors.white.withAlpha(140),
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}
