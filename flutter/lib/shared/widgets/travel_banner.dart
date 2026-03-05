import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/travel_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';

/// Shown at the top of the home screen when the user is > 77 km from home.
/// Displays travel distance and a Qasr toggle.
///
/// "Qasr" shortens Dhuhr / Asr / Isha to 2 rakaat — the label `(Qasr)` is
/// applied to those prayers in the prayer list; prayer times are unchanged.
class TravelBanner extends ConsumerWidget {
  const TravelBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final travel = ref.watch(travelProvider);
    if (!travel.isTraveling) return const SizedBox.shrink();

    final cs = Theme.of(context).colorScheme;
    final distLabel = travel.distanceKm >= 1000
        ? '${(travel.distanceKm / 1000).toStringAsFixed(1)}k km'
        : '${travel.distanceKm.round()} km';

    return GestureDetector(
      onTap: () => context.push(Routes.travelRulings),
      child: Material(
        color: PrayCalcColors.dark.withValues(alpha: 0.92),
        child: SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.flight_takeoff, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Traveling · $distLabel from home',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                _QasrChip(isQasr: travel.isQasr, cs: cs),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _QasrChip extends ConsumerWidget {
  const _QasrChip({required this.isQasr, required this.cs});
  final bool isQasr;
  final ColorScheme cs;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: () => ref.read(travelProvider.notifier).toggleQasr(),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isQasr
              ? PrayCalcColors.light
              : Colors.white.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isQasr ? PrayCalcColors.light : Colors.white38,
            width: 1,
          ),
        ),
        child: Text(
          isQasr ? 'Qasr ✓' : 'Qasr',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isQasr ? PrayCalcColors.dark : Colors.white,
          ),
        ),
      ),
    );
  }
}
