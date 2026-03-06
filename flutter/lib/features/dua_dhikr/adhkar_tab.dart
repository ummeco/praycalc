import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';
import 'adhkar_data.dart';

/// Tab showing a list of adhkar (morning or evening) with completion tracking.
class AdhkarTab extends StatefulWidget {
  const AdhkarTab({super.key, required this.adhkar, required this.title});
  final List<Dhikr> adhkar;
  final String title;

  @override
  State<AdhkarTab> createState() => _AdhkarTabState();
}

class _AdhkarTabState extends State<AdhkarTab>
    with AutomaticKeepAliveClientMixin {
  // Track completion counts per dhikr index for today.
  late List<int> _counts;
  String _todayKey = '';

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _counts = List.filled(widget.adhkar.length, 0);
    _todayKey = _makeTodayKey();
    _load();
  }

  String get _prefsKey =>
      'adhkar_${widget.title.toLowerCase().replaceAll(' ', '_')}';

  String _makeTodayKey() {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final storedDate = prefs.getString('${_prefsKey}_date') ?? '';
    if (storedDate == _todayKey) {
      final stored = prefs.getStringList('${_prefsKey}_counts');
      if (stored != null && stored.length == widget.adhkar.length) {
        setState(() {
          _counts = stored.map((s) => int.tryParse(s) ?? 0).toList();
        });
      }
    }
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('${_prefsKey}_date', _todayKey);
    await prefs.setStringList(
        '${_prefsKey}_counts', _counts.map((c) => c.toString()).toList());
  }

  void _increment(int index) {
    final dhikr = widget.adhkar[index];
    if (_counts[index] >= dhikr.repeatCount) return;
    HapticFeedback.lightImpact();
    setState(() => _counts[index]++);
    _save();
  }

  void _resetAll() {
    setState(() {
      for (var i = 0; i < _counts.length; i++) {
        _counts[i] = 0;
      }
    });
    _save();
  }

  int get _completedCount {
    var c = 0;
    for (var i = 0; i < widget.adhkar.length; i++) {
      if (_counts[i] >= widget.adhkar[i].repeatCount) c++;
    }
    return c;
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final theme = Theme.of(context);
    final completed = _completedCount;
    final total = widget.adhkar.length;
    final progress = total > 0 ? completed / total : 0.0;

    return Column(
      children: [
        // Progress header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          color: PrayCalcColors.mid.withAlpha(20),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$completed / $total completed',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: PrayCalcColors.mid,
                      ),
                    ),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progress,
                        minHeight: 6,
                        backgroundColor: PrayCalcColors.mid.withAlpha(40),
                        valueColor: AlwaysStoppedAnimation<Color>(
                          completed == total
                              ? PrayCalcColors.light
                              : PrayCalcColors.mid,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              if (completed > 0)
                TextButton.icon(
                  onPressed: _resetAll,
                  icon: const Icon(Icons.refresh, size: 16),
                  label: const Text('Reset'),
                  style: TextButton.styleFrom(
                    foregroundColor: theme.colorScheme.onSurface.withAlpha(140),
                    textStyle: const TextStyle(fontSize: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                  ),
                ),
            ],
          ),
        ),
        // Adhkar list
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: widget.adhkar.length,
            itemBuilder: (context, index) {
              final dhikr = widget.adhkar[index];
              final count = _counts[index];
              final isDone = count >= dhikr.repeatCount;

              return _DhikrCard(
                dhikr: dhikr,
                count: count,
                isDone: isDone,
                onTap: () => _increment(index),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _DhikrCard extends StatelessWidget {
  const _DhikrCard({
    required this.dhikr,
    required this.count,
    required this.isDone,
    required this.onTap,
  });

  final Dhikr dhikr;
  final int count;
  final bool isDone;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isDone
              ? PrayCalcColors.mid.withAlpha(20)
              : theme.cardTheme.color,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDone
                ? PrayCalcColors.mid.withAlpha(80)
                : theme.dividerColor.withAlpha(40),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Arabic text
            Text(
              dhikr.arabic,
              style: TextStyle(
                fontSize: 20,
                fontFamily: 'serif',
                height: 1.8,
                color: isDone
                    ? theme.colorScheme.onSurface.withAlpha(120)
                    : theme.colorScheme.onSurface,
              ),
              textDirection: TextDirection.rtl,
              textAlign: TextAlign.right,
            ),
            const SizedBox(height: 10),
            // Transliteration
            Text(
              dhikr.transliteration,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontStyle: FontStyle.italic,
                color: theme.colorScheme.onSurface.withAlpha(160),
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 6),
            // Translation
            Text(
              dhikr.translation,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withAlpha(140),
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 8),
            // Bottom row: reference + counter
            Row(
              children: [
                if (dhikr.reference != null)
                  Text(
                    dhikr.reference!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: PrayCalcColors.mid.withAlpha(180),
                      fontSize: 11,
                    ),
                  ),
                const Spacer(),
                if (dhikr.repeatCount > 1)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDone
                          ? PrayCalcColors.mid.withAlpha(40)
                          : PrayCalcColors.mid.withAlpha(20),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '$count / ${dhikr.repeatCount}',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isDone ? PrayCalcColors.light : PrayCalcColors.mid,
                      ),
                    ),
                  )
                else if (isDone)
                  Icon(Icons.check_circle, size: 20, color: PrayCalcColors.mid),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
