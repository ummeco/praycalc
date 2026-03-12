// FastingTrackerScreen — Ramadan fasting day tracker.
//
// Pure SharedPreferences storage, no backend.
// Key: 'fasting_log_1447' — JSON list of {date, fasted} for Hijri year 1447.
// Route: '/ramadan/tracker'

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/theme/app_theme.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ── Storage helpers ───────────────────────────────────────────────────────────

const _kLogKey = 'fasting_log_1447';

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

String _dayKey(int ramadanDay) {
  // Approximate Ramadan 1447: starts ~2027-02-18 (day 1 = index 0).
  // Stored as a simple day string so it is self-contained.
  return '1447-${ramadanDay.toString().padLeft(2, '0')}';
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
  bool _loading = true;

  // Approximate current Ramadan day (1-30) — treat today as day 15 fallback
  // if we can't determine it from context (no Hijri date API called here).
  // In production the home screen ramadanProvider supplies the real hDay.
  final int _todayRamadanDay = 15;

  @override
  void initState() {
    super.initState();
    _loadLog().then((log) {
      if (!mounted) return;
      setState(() {
        _log = log;
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
    SharePlus.instance.share(
      ShareParams(text: 'I fasted $count/30 days of Ramadan 1447 🌙\nTracked with PrayCalc — praycalc.com'),
    );
  }

  @override
  Widget build(BuildContext context) {
    final timesAsync = ref.watch(prayerTimesProvider);
    final settings = ref.watch(settingsProvider);

    final fajrH = timesAsync.valueOrNull?.fajr;
    final maghribH = timesAsync.valueOrNull?.maghrib;

    final now = DateTime.now();
    final nowH = now.hour + now.minute / 60.0;

    // Sehri active if within 2h before Fajr
    final sehriActive = fajrH != null &&
        fajrH.isFinite &&
        nowH >= fajrH - 2 &&
        nowH < fajrH;

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

                // ── Sehri / Iftar countdowns ─────────────────────────────
                Row(
                  children: [
                    Expanded(
                      child: _CountdownCard(
                        label: 'Sehri ends',
                        time: sehriActive
                            ? _countdown(fajrH)
                            : (settings.use24h ? 'See Fajr' : 'See Fajr'),
                        icon: Icons.nightlight_round,
                        active: sehriActive,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _CountdownCard(
                        label: 'Iftar in',
                        time: _countdown(maghribH),
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
                  'Ramadan 1447',
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
                    final isToday = day == _todayRamadanDay;

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
                const SizedBox(height: 32),
              ],
            ),
    );
  }
}

// ── Countdown card ────────────────────────────────────────────────────────────

class _CountdownCard extends StatelessWidget {
  const _CountdownCard({
    required this.label,
    required this.time,
    required this.icon,
    required this.active,
  });

  final String label;
  final String time;
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
              Text(
                label,
                style: TextStyle(
                  color: const Color(0xFFD4A017).withAlpha(160),
                  fontSize: 11,
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
        ],
      ),
    );
  }
}
