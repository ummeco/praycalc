import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/tasbeeh_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/tasbeeh_model.dart';

// ── Screen ───────────────────────────────────────────────────────────────────

class TasbeehScreen extends ConsumerStatefulWidget {
  const TasbeehScreen({super.key});

  @override
  ConsumerState<TasbeehScreen> createState() => _TasbeehScreenState();
}

class _TasbeehScreenState extends ConsumerState<TasbeehScreen> {
  // Track which presets have been completed in the current full-cycle so we
  // can fire the "Tasbih complete" SnackBar when all three finish.
  final Set<int> _completedInCycle = {};
  int _lastPresetIndex = 0;

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(tasbeehProvider);
    _checkCompletion(context, state);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tasbeeh'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Reset',
            onPressed: () => _confirmReset(context),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _TasbeehBody(state: state),
          ),
          _HistorySection(state: state),
        ],
      ),
    );
  }

  // ── Completion detection ───────────────────────────────────────────────────

  void _checkCompletion(BuildContext context, TasbeehState state) {
    // Detect when the notifier auto-advanced the preset index after a tap,
    // meaning the previous preset just completed.
    if (state.presetIndex != _lastPresetIndex) {
      final completedIndex = _lastPresetIndex;
      _completedInCycle.add(completedIndex);

      final preset = state.presets[completedIndex];
      HapticFeedback.lightImpact();

      // Show single-preset completion snack.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!context.mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ ${preset.label} × ${preset.target}'),
            duration: const Duration(seconds: 2),
          ),
        );
      });

      // Check if all presets in the cycle are complete.
      if (_completedInCycle.length >= state.presets.length) {
        _completedInCycle.clear();
        HapticFeedback.heavyImpact();
        final totalDhikr =
            state.presets.fold<int>(0, (sum, p) => sum + p.target);
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!context.mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Tasbih complete! $totalDhikr dhikr'),
              duration: const Duration(seconds: 3),
            ),
          );
        });
      }
    }

    _lastPresetIndex = state.presetIndex;
  }

  // ── Reset confirmation dialog ──────────────────────────────────────────────

  Future<void> _confirmReset(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reset counter?'),
        content: const Text('This will reset the current count to zero.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Reset'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      ref.read(tasbeehProvider.notifier).reset();
    }
  }
}

// ── Main body ────────────────────────────────────────────────────────────────

class _TasbeehBody extends ConsumerWidget {
  const _TasbeehBody({required this.state});

  final TasbeehState state;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final progress =
        state.target > 0 ? (state.count / state.target).clamp(0.0, 1.0) : 0.0;

    return Semantics(
      button: true,
      label: 'Tasbeeh counter. Count: ${state.count}. Tap anywhere to count.',
      child: GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        HapticFeedback.lightImpact();
        ref.read(tasbeehProvider.notifier).tap();
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Preset label — tap to cycle through presets.
            Semantics(
              button: true,
              label: 'Current dhikr: ${state.currentPreset.label}. Tap to switch.',
              excludeSemantics: true,
              child: GestureDetector(
                onTap: () => ref.read(tasbeehProvider.notifier).nextPreset(),
                child: Text(
                  state.currentPreset.label,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontSize: 20,
                    color: PrayCalcColors.mid,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Tap label to switch',
              style: theme.textTheme.bodyMedium?.copyWith(
                fontSize: 11,
                color: theme.colorScheme.onSurface.withAlpha(155),
              ),
            ),
            const SizedBox(height: 24),

            // Arc progress + count.
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 200,
                  height: 200,
                  child: CircularProgressIndicator(
                    value: progress,
                    strokeWidth: 10,
                    backgroundColor:
                        PrayCalcColors.mid.withAlpha(40),
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      PrayCalcColors.mid,
                    ),
                  ),
                ),
                Column(
                  children: [
                    Text(
                      '${state.count}',
                      style: theme.textTheme.displayLarge?.copyWith(
                        fontSize: 56,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                    Text(
                      '/ ${state.target}',
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withAlpha(160),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              'Tap anywhere to count',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withAlpha(155),
                fontSize: 13,
              ),
            ),

            const Spacer(),

            // Preset chips.
            _PresetChips(state: state),
            const SizedBox(height: 8),
          ],
        ),
      ),
    ),  // Semantics
    );
  }
}

// ── Preset chip row ──────────────────────────────────────────────────────────

class _PresetChips extends ConsumerWidget {
  const _PresetChips({required this.state});

  final TasbeehState state;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      alignment: WrapAlignment.center,
      children: state.presets.asMap().entries.map((entry) {
        final i = entry.key;
        final preset = entry.value;
        final isActive = i == state.presetIndex;
        return ChoiceChip(
          label: Text('${preset.label} ×${preset.target}'),
          selected: isActive,
          selectedColor: PrayCalcColors.mid.withAlpha(60),
          onSelected: (_) {
            if (!isActive) {
              // Jump to this preset, resetting count.
              final notifier = ref.read(tasbeehProvider.notifier);
              for (int step = 0;
                  step < (i - state.presetIndex + state.presets.length) %
                      state.presets.length;
                  step++) {
                notifier.nextPreset();
              }
            }
          },
        );
      }).toList(),
    );
  }
}

// ── History section ──────────────────────────────────────────────────────────

class _HistorySection extends StatelessWidget {
  const _HistorySection({required this.state});

  final TasbeehState state;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.cardTheme.color,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Today: ${state.dailyTotal} dhikr',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.primary,
                ),
              ),
              const Spacer(),
              Text(
                'Last 7 days',
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontSize: 12,
                  color: theme.colorScheme.onSurface.withAlpha(140),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (state.history.isEmpty && state.dailyTotal == 0)
            Text(
              'No history yet — start counting!',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withAlpha(120),
                fontSize: 13,
              ),
            )
          else
            _HistoryChart(state: state),
        ],
      ),
    );
  }
}

// ── History bar chart ────────────────────────────────────────────────────────

class _HistoryChart extends StatelessWidget {
  const _HistoryChart({required this.state});

  final TasbeehState state;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Build data: today + up to 6 history records (most recent first → reverse
    // so the chart shows oldest on the left).
    final now = DateTime.now();

    // Combine today's total with history for the chart.
    final allRecords = <TasbeehDayRecord>[
      TasbeehDayRecord(date: now, total: state.dailyTotal),
      ...state.history,
    ];

    // Take at most 7 entries.
    final records =
        allRecords.length > 7 ? allRecords.sublist(0, 7) : allRecords;
    final reversed = records.reversed.toList();

    final maxVal =
        reversed.fold<int>(1, (m, r) => math.max(m, r.total)).toDouble();

    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    final bars = reversed.asMap().entries.map((entry) {
      final i = entry.key;
      final record = entry.value;
      final isToday = i == reversed.length - 1;
      return BarChartGroupData(
        x: i,
        barRods: [
          BarChartRodData(
            toY: record.total.toDouble(),
            color: isToday ? PrayCalcColors.mid : PrayCalcColors.mid.withAlpha(100),
            width: 18,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
          ),
        ],
      );
    }).toList();

    return SizedBox(
      height: 100,
      child: BarChart(
        BarChartData(
          maxY: maxVal * 1.25,
          barGroups: bars,
          gridData: const FlGridData(show: false),
          borderData: FlBorderData(show: false),
          titlesData: FlTitlesData(
            leftTitles: const AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            rightTitles: const AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            topTitles: const AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  final idx = value.toInt();
                  if (idx < 0 || idx >= reversed.length) {
                    return const SizedBox.shrink();
                  }
                  final date = reversed[idx].date;
                  final label = dayLabels[date.weekday % 7];
                  return Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      label,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontSize: 11,
                        color: theme.colorScheme.onSurface.withAlpha(160),
                      ),
                    ),
                  );
                },
                reservedSize: 22,
              ),
            ),
          ),
          barTouchData: BarTouchData(
            touchTooltipData: BarTouchTooltipData(
              getTooltipColor: (_) => PrayCalcColors.deep.withAlpha(220),
              getTooltipItem: (group, _, rod, _) => BarTooltipItem(
                '${rod.toY.toInt()}',
                const TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
