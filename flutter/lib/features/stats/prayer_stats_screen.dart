import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest_10y.dart' as tz_data;

import '../../core/providers/prayer_completion_provider.dart';
import '../../core/theme/app_theme.dart';

// ─── Prayer goal provider (STATS-2) ─────────────────────────────────────────

const _kGoalKey = 'prayer_goal';
const _kBestStreakKey = 'prayer_best_streak';

/// Reads/writes the daily prayer goal (1–5, default 5) via SharedPreferences.
class _GoalNotifier extends Notifier<int> {
  @override
  int build() {
    Future.microtask(_load);
    return 5;
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    state = prefs.getInt(_kGoalKey) ?? 5;
  }

  Future<void> setGoal(int goal) async {
    state = goal;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_kGoalKey, goal);
  }
}

final _goalProvider = NotifierProvider<_GoalNotifier, int>(_GoalNotifier.new);

// ─── Heatmap data helper (STATS-1) ───────────────────────────────────────────

/// Returns a map of date-string → completed prayer count for the last 52 weeks.
/// Uses the flat `pc_prayer_completions` map: keys "YYYY-MM-DD_PrayerName".
Map<String, int> _buildHeatmapCounts(Map<String, String> completions) {
  final counts = <String, int>{};
  for (final key in completions.keys) {
    final parts = key.split('_');
    if (parts.length != 2) continue;
    final dateStr = parts[0];
    counts[dateStr] = (counts[dateStr] ?? 0) + 1;
  }
  return counts;
}

// ─── Streak helpers (STATS-2) ────────────────────────────────────────────────

/// Computes consecutive-day streak where the user met [goal] prayers/day.
int _computeStreak(Map<String, String> completions, int goal) {
  final counts = _buildHeatmapCounts(completions);
  final now = DateTime.now();
  int streak = 0;
  for (int d = 0; d < 365; d++) {
    final date = now.subtract(Duration(days: d));
    final ds = _dateStr(date);
    if ((counts[ds] ?? 0) >= goal) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/// Computes the best-ever streak from stored history and current run.
Future<int> _computeAndSaveBestStreak(
    Map<String, String> completions, int goal, int current) async {
  final prefs = await SharedPreferences.getInstance();
  final stored = prefs.getInt(_kBestStreakKey) ?? 0;
  final best = current > stored ? current : stored;
  if (current > stored) await prefs.setInt(_kBestStreakKey, current);
  return best;
}

String _dateStr(DateTime d) =>
    '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

// ─── Milestone notifications (STATS-2) ───────────────────────────────────────

const _kMilestoneNotifId = 1000;
const _kMilestonePrefKey = 'prayer_streak_last_milestone';

Future<void> _scheduleMilestoneIfNeeded(int streak) async {
  const milestones = [7, 30, 100];
  if (!milestones.contains(streak)) return;

  final prefs = await SharedPreferences.getInstance();
  final last = prefs.getInt(_kMilestonePrefKey) ?? 0;
  if (last >= streak) return; // already notified for this milestone
  await prefs.setInt(_kMilestonePrefKey, streak);

  // Schedule the congratulations notification for ~1 minute from now.
  try {
    tz_data.initializeTimeZones();
    final plugin = FlutterLocalNotificationsPlugin();
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings();
    await plugin.initialize(
        settings: const InitializationSettings(android: android, iOS: ios));

    final scheduledDate =
        tz.TZDateTime.from(DateTime.now().add(const Duration(minutes: 1)), tz.local);

    await plugin.zonedSchedule(
      id: _kMilestoneNotifId,
      title: 'MashaAllah!',
      body: "You've prayed consistently for $streak days!",
      scheduledDate: scheduledDate,
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          'praycalc_prayers',
          'Prayer Times',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(
          interruptionLevel: InterruptionLevel.active,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
    );
  } catch (_) {
    // Non-fatal — notification scheduling is best-effort.
  }
}

// ─── Stats provider ─────────────────────────────────────────────────────────

/// Computed prayer statistics from completion data.
class PrayerStats {
  final Map<String, int> weeklyByPrayer;
  final double weeklyPct;
  final int currentStreak;
  final String? mostMissedPrayer;
  final int totalLogged;
  final Map<String, int> monthlyByPrayer;
  final double monthlyPct;

  const PrayerStats({
    required this.weeklyByPrayer,
    required this.weeklyPct,
    required this.currentStreak,
    required this.mostMissedPrayer,
    required this.totalLogged,
    required this.monthlyByPrayer,
    required this.monthlyPct,
  });
}

final prayerStatsProvider = Provider<PrayerStats>((ref) {
  final completions = ref.watch(prayerCompletionProvider);
  const fard = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  // Weekly stats
  final weeklyByPrayer = <String, int>{};
  final monthlyByPrayer = <String, int>{};
  final now = DateTime.now();
  final weekCutoff = now.subtract(const Duration(days: 7));
  final monthCutoff = now.subtract(const Duration(days: 30));

  for (final entry in completions.entries) {
    try {
      final completedAt = DateTime.parse(entry.value);
      final parts = entry.key.split('_');
      if (parts.length != 2) continue;
      final prayer = parts[1];
      if (!fard.contains(prayer)) continue;

      if (completedAt.isAfter(weekCutoff)) {
        weeklyByPrayer[prayer] = (weeklyByPrayer[prayer] ?? 0) + 1;
      }
      if (completedAt.isAfter(monthCutoff)) {
        monthlyByPrayer[prayer] = (monthlyByPrayer[prayer] ?? 0) + 1;
      }
    } catch (_) {}
  }

  final weekTotal = fard.fold(0, (sum, p) => sum + (weeklyByPrayer[p] ?? 0));
  final monthTotal = fard.fold(0, (sum, p) => sum + (monthlyByPrayer[p] ?? 0));
  final weeklyPct = (weekTotal / 35.0).clamp(0.0, 1.0);
  final monthlyPct = (monthTotal / 150.0).clamp(0.0, 1.0);

  // Most missed prayer (lowest count in last 7 days)
  String? mostMissed;
  int minCount = 8;
  for (final p in fard) {
    final count = weeklyByPrayer[p] ?? 0;
    if (count < minCount) {
      minCount = count;
      mostMissed = p;
    }
  }

  // Current streak: consecutive days with all 5 fard completed
  int streak = 0;
  for (int d = 0; d < 365; d++) {
    final date = now.subtract(Duration(days: d));
    final dateStr =
        '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    final allDone = fard.every((p) => completions.containsKey('${dateStr}_$p'));
    if (allDone) {
      streak++;
    } else {
      break;
    }
  }

  return PrayerStats(
    weeklyByPrayer: weeklyByPrayer,
    weeklyPct: weeklyPct,
    currentStreak: streak,
    mostMissedPrayer: mostMissed,
    totalLogged: completions.length,
    monthlyByPrayer: monthlyByPrayer,
    monthlyPct: monthlyPct,
  );
});

// ─── Stats screen ───────────────────────────────────────────────────────────

class PrayerStatsScreen extends ConsumerWidget {
  const PrayerStatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppLocalizations.of(context)!;
    final stats = ref.watch(prayerStatsProvider);
    final completions = ref.watch(prayerCompletionProvider);
    final goal = ref.watch(_goalProvider);
    final goalNotifier = ref.read(_goalProvider.notifier);
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    final goalStreak = _computeStreak(completions, goal);

    // Fire-and-forget: update best streak record + trigger milestone notification.
    Future.microtask(() async {
      await _computeAndSaveBestStreak(completions, goal, goalStreak);
      await _scheduleMilestoneIfNeeded(goalStreak);
    });

    return Scaffold(
      appBar: AppBar(
        title: Text(l.statsTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            tooltip: l.statsShareTooltip,
            onPressed: () => _shareStats(context, stats),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Today's prayers ──────────────────────────────────────────────
          const _TodayPrayersCard(),
          const SizedBox(height: 16),

          // ── Daily goal slider (STATS-2) ───────────────────────────────────
          _DailyGoalCard(
            l: l,
            goal: goal,
            onChanged: (v) => goalNotifier.setGoal(v),
          ),
          const SizedBox(height: 12),

          // ── Streak + summary cards ───────────────────────────────────────
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  title: l.statsGoalStreak,
                  value: '$goalStreak',
                  subtitle: l.statsDays,
                  icon: Icons.local_fire_department,
                  color: goalStreak > 0
                      ? PrayCalcColors.mid
                      : cs.onSurface.withAlpha(100),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _BestStreakCard(
                  l: l,
                  completions: completions,
                  goal: goal,
                  currentStreak: goalStreak,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  title: l.statsThisWeek,
                  value: '${(stats.weeklyPct * 100).round()}%',
                  subtitle: l.statsCompletion,
                  icon: Icons.trending_up,
                  color: _completionColor(stats.weeklyPct),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  title: l.statsMostMissed,
                  value: stats.mostMissedPrayer ?? '-',
                  subtitle: l.statsThisWeekLabel,
                  icon: Icons.warning_amber_rounded,
                  color: cs.error.withAlpha(180),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // ── Year heatmap (STATS-1) ────────────────────────────────────────
          Text(
            l.statsHeatmapTitle,
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: 12),
          _PrayerHeatmap(completions: completions, l: l),
          const SizedBox(height: 24),

          // ── Weekly bar chart ─────────────────────────────────────────────
          Text(
            l.statsWeeklyChart,
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 200,
            child: _WeeklyBarChart(stats: stats),
          ),
          const SizedBox(height: 24),

          // ── Monthly bar chart ───────────────────────────────────────────
          Text(
            l.statsMonthlyChart,
            style: theme.textTheme.titleMedium,
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 200,
            child: _MonthlyBarChart(stats: stats),
          ),
          const SizedBox(height: 24),

          // ── Total logged ────────────────────────────────────────────────
          Card(
            child: ListTile(
              leading: Icon(Icons.check_circle, color: PrayCalcColors.mid),
              title: Text(l.statsTotalLogged(stats.totalLogged)),
              subtitle: Text(l.statsKeepItUp),
            ),
          ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Color _completionColor(double pct) {
    if (pct >= 0.9) return PrayCalcColors.mid;
    if (pct >= 0.7) return const Color(0xFFD4A017);
    return const Color(0xFFE57373);
  }

  void _shareStats(BuildContext context, PrayerStats stats) {
    final l = AppLocalizations.of(context)!;
    final lines = <String>[
      l.statsShareTitle,
      '',
      l.statsShareStreak(stats.currentStreak),
      l.statsShareWeekly((stats.weeklyPct * 100).round()),
      l.statsShareMonthly((stats.monthlyPct * 100).round()),
      '',
      l.statsShareBreakdown,
      ...['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(
        (p) => '  $p: ${stats.weeklyByPrayer[p] ?? 0}/7',
      ),
      '',
      'praycalc.com',
    ];
    SharePlus.instance.share(ShareParams(text: lines.join('\n')));
  }
}

// ─── Sub-widgets ────────────────────────────────────────────────────────────

/// Tap-to-toggle log buttons for today's five fard prayers.
class _TodayPrayersCard extends ConsumerWidget {
  const _TodayPrayersCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppLocalizations.of(context)!;
    final completions = ref.watch(prayerCompletionProvider);
    final notifier = ref.read(prayerCompletionProvider.notifier);
    final now = DateTime.now();
    final dateStr =
        '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    const fard = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    final theme = Theme.of(context);

    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.checklist_rounded,
                    size: 17, color: PrayCalcColors.mid),
                const SizedBox(width: 7),
                Text(
                  l.statsTodayPrayers,
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                Text(
                  l.statsTodayCount(fard.where((p) => completions.containsKey('${dateStr}_$p')).length),
                  style: theme.textTheme.bodySmall?.copyWith(
                      color: PrayCalcColors.mid, fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: fard.map((prayer) {
                final key = '${dateStr}_$prayer';
                final done = completions.containsKey(key);
                return GestureDetector(
                  onTap: () {
                    if (done) {
                      notifier.unmark(dateStr, prayer);
                    } else {
                      notifier.markCompleted(dateStr, prayer);
                    }
                  },
                  child: Column(
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 46,
                        height: 46,
                        decoration: BoxDecoration(
                          color: done
                              ? PrayCalcColors.mid.withAlpha(38)
                              : theme.colorScheme.surface,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: done
                                ? PrayCalcColors.mid
                                : theme.dividerColor.withAlpha(120),
                            width: done ? 2.0 : 1.0,
                          ),
                        ),
                        child: Icon(
                          done
                              ? Icons.check_rounded
                              : Icons.circle_outlined,
                          size: 22,
                          color: done
                              ? PrayCalcColors.mid
                              : theme.colorScheme.onSurface.withAlpha(70),
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        prayer,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight:
                              done ? FontWeight.w600 : FontWeight.normal,
                          color: done
                              ? PrayCalcColors.mid
                              : theme.colorScheme.onSurface.withAlpha(140),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
  });

  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 18, color: color),
                const SizedBox(width: 6),
                Text(title, style: theme.textTheme.bodySmall),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(subtitle, style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _WeeklyBarChart extends StatelessWidget {
  const _WeeklyBarChart({required this.stats});
  final PrayerStats stats;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: 7,
        barTouchData: BarTouchData(
          touchTooltipData: BarTouchTooltipData(
            getTooltipItem: (group, groupIdx, rod, rodIdx) {
              return BarTooltipItem(
                '${prayers[groupIdx]}: ${rod.toY.toInt()}/7',
                TextStyle(color: cs.onSurface, fontSize: 12),
              );
            },
          ),
        ),
        titlesData: FlTitlesData(
          show: true,
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final i = value.toInt();
                if (i < 0 || i >= prayers.length) return const SizedBox.shrink();
                return Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    prayers[i],
                    style: TextStyle(fontSize: 11, color: cs.onSurface),
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 1,
              reservedSize: 28,
              getTitlesWidget: (value, meta) => Text(
                value.toInt().toString(),
                style: TextStyle(fontSize: 10, color: cs.onSurface.withAlpha(140)),
              ),
            ),
          ),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        gridData: FlGridData(
          show: true,
          horizontalInterval: 1,
          getDrawingHorizontalLine: (value) => FlLine(
            color: cs.onSurface.withAlpha(30),
            strokeWidth: 0.5,
          ),
        ),
        barGroups: List.generate(5, (i) {
          final count = (stats.weeklyByPrayer[prayers[i]] ?? 0).toDouble();
          return BarChartGroupData(
            x: i,
            barRods: [
              BarChartRodData(
                toY: count,
                color: _barColor(count / 7),
                width: 28,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
              ),
            ],
          );
        }),
      ),
    );
  }

  Color _barColor(double pct) {
    if (pct >= 0.9) return PrayCalcColors.mid;
    if (pct >= 0.6) return const Color(0xFFD4A017);
    return const Color(0xFFE57373);
  }
}

class _MonthlyBarChart extends StatelessWidget {
  const _MonthlyBarChart({required this.stats});
  final PrayerStats stats;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: 30,
        barTouchData: BarTouchData(
          touchTooltipData: BarTouchTooltipData(
            getTooltipItem: (group, groupIdx, rod, rodIdx) {
              return BarTooltipItem(
                '${prayers[groupIdx]}: ${rod.toY.toInt()}/30',
                TextStyle(color: cs.onSurface, fontSize: 12),
              );
            },
          ),
        ),
        titlesData: FlTitlesData(
          show: true,
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final i = value.toInt();
                if (i < 0 || i >= prayers.length) return const SizedBox.shrink();
                return Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    prayers[i],
                    style: TextStyle(fontSize: 11, color: cs.onSurface),
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 5,
              reservedSize: 28,
              getTitlesWidget: (value, meta) => Text(
                value.toInt().toString(),
                style: TextStyle(fontSize: 10, color: cs.onSurface.withAlpha(140)),
              ),
            ),
          ),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        gridData: FlGridData(
          show: true,
          horizontalInterval: 5,
          getDrawingHorizontalLine: (value) => FlLine(
            color: cs.onSurface.withAlpha(30),
            strokeWidth: 0.5,
          ),
        ),
        barGroups: List.generate(5, (i) {
          final count = (stats.monthlyByPrayer[prayers[i]] ?? 0).toDouble();
          return BarChartGroupData(
            x: i,
            barRods: [
              BarChartRodData(
                toY: count,
                color: _barColor(count / 30),
                width: 28,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
              ),
            ],
          );
        }),
      ),
    );
  }

  Color _barColor(double pct) {
    if (pct >= 0.9) return PrayCalcColors.mid;
    if (pct >= 0.6) return const Color(0xFFD4A017);
    return const Color(0xFFE57373);
  }
}

// ─── Daily Goal Card (STATS-2) ───────────────────────────────────────────────

class _DailyGoalCard extends StatelessWidget {
  const _DailyGoalCard({
    required this.l,
    required this.goal,
    required this.onChanged,
  });

  final AppLocalizations l;
  final int goal;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.flag_rounded, size: 17, color: PrayCalcColors.mid),
                const SizedBox(width: 7),
                Text(
                  l.statsDailyGoalTitle,
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                Text(
                  l.statsDailyGoalLabel(goal),
                  style: theme.textTheme.bodySmall?.copyWith(
                      color: PrayCalcColors.mid, fontWeight: FontWeight.w600),
                ),
              ],
            ),
            Slider(
              value: goal.toDouble(),
              min: 1,
              max: 5,
              divisions: 4,
              activeColor: PrayCalcColors.mid,
              onChanged: (v) => onChanged(v.round()),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Best Streak Card (STATS-2) ──────────────────────────────────────────────

class _BestStreakCard extends StatefulWidget {
  const _BestStreakCard({
    required this.l,
    required this.completions,
    required this.goal,
    required this.currentStreak,
  });

  final AppLocalizations l;
  final Map<String, String> completions;
  final int goal;
  final int currentStreak;

  @override
  State<_BestStreakCard> createState() => _BestStreakCardState();
}

class _BestStreakCardState extends State<_BestStreakCard> {
  int _best = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(_BestStreakCard old) {
    super.didUpdateWidget(old);
    if (old.goal != widget.goal || old.currentStreak != widget.currentStreak) {
      _load();
    }
  }

  Future<void> _load() async {
    final best = await _computeAndSaveBestStreak(
        widget.completions, widget.goal, widget.currentStreak);
    if (mounted) setState(() => _best = best);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = _best > 0
        ? PrayCalcColors.mid
        : theme.colorScheme.onSurface.withAlpha(100);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.emoji_events_rounded, size: 18, color: color),
                const SizedBox(width: 6),
                Text(widget.l.statsBestStreak,
                    style: theme.textTheme.bodySmall),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              '$_best',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(widget.l.statsDays, style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

// ─── Prayer Heatmap (STATS-1) ────────────────────────────────────────────────

/// 52-column × 7-row grid showing one year of prayer completion.
/// Each cell colour: dark grey = no data, shades of green = 1–5 completions.
/// Tap a cell to see a day-detail bottom sheet.
class _PrayerHeatmap extends StatelessWidget {
  const _PrayerHeatmap({
    required this.completions,
    required this.l,
  });

  final Map<String, String> completions;
  final AppLocalizations l;

  static const _fard = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  static const _cellSize = 11.0;
  static const _cellGap = 2.0;

  // Colour ramp: 0 prayers = dark grey, 1–5 = green gradient.
  static Color _cellColor(int count) {
    switch (count) {
      case 0:  return const Color(0xFF2A2A2A);
      case 1:  return const Color(0xFF1E5E2F);
      case 2:  return Color.fromARGB(180, 30, 94, 47);
      case 3:  return Color.fromARGB(160, 121, 194, 76);
      case 4:  return const Color(0xFF79C24C);
      default: return const Color(0xFFC9F27A);
    }
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    // Align to the Monday of the current week so columns are full ISO weeks.
    final todayWeekday = now.weekday; // 1=Mon … 7=Sun
    final startOfThisWeek = now.subtract(Duration(days: todayWeekday - 1));
    // 51 prior full weeks + this week = 52 columns total.
    final gridStart =
        startOfThisWeek.subtract(const Duration(days: 51 * 7));

    final counts = _buildHeatmapCounts(completions);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Day-of-week labels.
              Column(
                children: List.generate(7, (row) {
                  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                  return SizedBox(
                    height: _cellSize + _cellGap,
                    width: 14,
                    child: Text(
                      labels[row],
                      style: TextStyle(
                        fontSize: 8,
                        color: Theme.of(context)
                            .colorScheme
                            .onSurface
                            .withAlpha(80),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(width: 4),
              // 52 week columns.
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: List.generate(52, (col) {
                  return Column(
                    children: List.generate(7, (row) {
                      final date =
                          gridStart.add(Duration(days: col * 7 + row));
                      if (date.isAfter(now)) {
                        return SizedBox(
                          width: _cellSize + _cellGap,
                          height: _cellSize + _cellGap,
                        );
                      }
                      final ds = _dateStr(date);
                      final count = counts[ds] ?? 0;
                      final prayers = _fard
                          .where((p) =>
                              completions.containsKey('${ds}_$p'))
                          .toList();

                      return GestureDetector(
                        onTap: () =>
                            _showDetail(context, date, count, prayers),
                        child: Container(
                          width: _cellSize,
                          height: _cellSize,
                          margin:
                              const EdgeInsets.all(_cellGap / 2),
                          decoration: BoxDecoration(
                            color: _cellColor(count),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      );
                    }),
                  );
                }),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Legend row.
          Row(
            children: [
              const SizedBox(width: 18),
              Text(
                'Less',
                style: TextStyle(
                  fontSize: 9,
                  color: Theme.of(context)
                      .colorScheme
                      .onSurface
                      .withAlpha(80),
                ),
              ),
              const SizedBox(width: 4),
              ...List.generate(
                6,
                (i) => Container(
                  width: _cellSize,
                  height: _cellSize,
                  margin: const EdgeInsets.symmetric(horizontal: 1),
                  decoration: BoxDecoration(
                    color: _cellColor(i),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Text(
                'More',
                style: TextStyle(
                  fontSize: 9,
                  color: Theme.of(context)
                      .colorScheme
                      .onSurface
                      .withAlpha(80),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showDetail(
      BuildContext context, DateTime date, int count, List<String> prayers) {
    final ds = _dateStr(date);
    final label =
        '${date.day} ${_monthName(date.month)} ${date.year}';

    showModalBottomSheet<void>(
      context: context,
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              count == 0
                  ? Text(l.statsHeatmapNoData,
                      style: Theme.of(context).textTheme.bodyMedium)
                  : Text(l.statsHeatmapDetail(count),
                      style: Theme.of(context).textTheme.bodyMedium),
              if (prayers.isNotEmpty) ...[
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  children: prayers
                      .map((p) => Chip(
                            label: Text(p),
                            backgroundColor:
                                PrayCalcColors.mid.withAlpha(38),
                            side: BorderSide(
                                color: PrayCalcColors.mid.withAlpha(80)),
                            labelStyle: TextStyle(
                                color: PrayCalcColors.mid,
                                fontSize: 12),
                            padding: EdgeInsets.zero,
                          ))
                      .toList(),
                ),
              ],
              const SizedBox(height: 4),
              Text(
                ds,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context)
                          .colorScheme
                          .onSurface
                          .withAlpha(80),
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static String _monthName(int month) {
    const names = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return names[month];
  }
}
