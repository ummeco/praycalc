import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/providers/prayer_completion_provider.dart';
import '../../core/theme/app_theme.dart';

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
    final stats = ref.watch(prayerStatsProvider);
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Prayer Statistics'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            tooltip: 'Share stats',
            onPressed: () => _shareStats(stats),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Today's prayers ──────────────────────────────────────────────
          const _TodayPrayersCard(),
          const SizedBox(height: 16),

          // ── Streak + summary cards ───────────────────────────────────────
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  title: 'Streak',
                  value: '${stats.currentStreak}',
                  subtitle: 'days',
                  icon: Icons.local_fire_department,
                  color: stats.currentStreak > 0
                      ? PrayCalcColors.mid
                      : cs.onSurface.withAlpha(100),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  title: 'This Week',
                  value: '${(stats.weeklyPct * 100).round()}%',
                  subtitle: 'completion',
                  icon: Icons.trending_up,
                  color: _completionColor(stats.weeklyPct),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  title: 'This Month',
                  value: '${(stats.monthlyPct * 100).round()}%',
                  subtitle: 'completion',
                  icon: Icons.calendar_month,
                  color: _completionColor(stats.monthlyPct),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  title: 'Most Missed',
                  value: stats.mostMissedPrayer ?? '-',
                  subtitle: 'this week',
                  icon: Icons.warning_amber_rounded,
                  color: cs.error.withAlpha(180),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // ── Weekly bar chart ─────────────────────────────────────────────
          Text(
            'Weekly Completion by Prayer',
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
            'Monthly Completion by Prayer',
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
              title: Text('${stats.totalLogged} total prayers logged'),
              subtitle: const Text('Keep it up!'),
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

  void _shareStats(PrayerStats stats) {
    final lines = <String>[
      'PrayCalc Prayer Statistics',
      '',
      'Streak: ${stats.currentStreak} days',
      'Weekly: ${(stats.weeklyPct * 100).round()}%',
      'Monthly: ${(stats.monthlyPct * 100).round()}%',
      '',
      'Weekly breakdown:',
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
                  "Today's Prayers",
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                Text(
                  '${fard.where((p) => completions.containsKey('${dateStr}_$p')).length} / 5',
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
