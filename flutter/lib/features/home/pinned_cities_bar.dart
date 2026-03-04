import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/pinned_cities_provider.dart';
import '../../core/providers/prayer_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/settings_model.dart';

/// Horizontal scrollable bar of pinned city chips.
///
/// Shows at the top of the home screen when the user has pinned cities.
/// Tapping a chip switches [cityProvider] to that city.
/// Long-pressing a chip unpins it (with undo snackbar).
/// A trailing "+" chip lets the user pin the current city.
class PinnedCitiesBar extends ConsumerWidget {
  const PinnedCitiesBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pinned = ref.watch(pinnedCitiesProvider);
    final currentCity = ref.watch(cityProvider);

    // Hide when there are no pinned cities and no current city to pin.
    if (pinned.isEmpty && currentCity == null) {
      return const SizedBox.shrink();
    }

    final notifier = ref.read(pinnedCitiesProvider.notifier);
    final currentIsPinned =
        currentCity != null && notifier.isPinned(currentCity);

    return SizedBox(
      height: 48,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        children: [
          // Pinned city chips
          for (final city in pinned) _buildCityChip(
            context: context,
            ref: ref,
            city: city,
            isSelected: currentCity != null &&
                cityKey(city) == cityKey(currentCity),
            notifier: notifier,
          ),

          // "+" chip to add current city
          if (currentCity != null && !currentIsPinned)
            Padding(
              padding: const EdgeInsets.only(left: 4),
              child: ActionChip(
                avatar: const Icon(Icons.add, size: 16),
                label: const Text('Pin'),
                labelStyle: const TextStyle(fontSize: 12),
                visualDensity: VisualDensity.compact,
                onPressed: () {
                  final added = notifier.pin(currentCity);
                  if (!added && context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Maximum 5 pinned cities. '
                          'Upgrade to Ummat+ for more.',
                        ),
                      ),
                    );
                  }
                },
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCityChip({
    required BuildContext context,
    required WidgetRef ref,
    required City city,
    required bool isSelected,
    required PinnedCitiesNotifier notifier,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: GestureDetector(
        onLongPress: () {
          final key = cityKey(city);
          final removedCity = city;
          notifier.unpin(key);

          if (!context.mounted) return;
          ScaffoldMessenger.of(context).clearSnackBars();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${city.name} unpinned'),
              action: SnackBarAction(
                label: 'Undo',
                onPressed: () => notifier.pin(removedCity),
              ),
            ),
          );
        },
        child: FilterChip(
          selected: isSelected,
          label: Text(
            city.name,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              color: isSelected ? Colors.white : null,
            ),
          ),
          selectedColor: PrayCalcColors.dark,
          checkmarkColor: Colors.white,
          visualDensity: VisualDensity.compact,
          onSelected: (_) {
            ref.read(cityProvider.notifier).state = city;
          },
        ),
      ),
    );
  }
}
