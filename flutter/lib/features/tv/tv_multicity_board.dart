// P-9: Multi-city prayer board
//
// Displays 2–6 city columns side by side, each showing the current prayer
// and next-prayer countdown. The column for the device's own city is
// highlighted with a green accent strip and slightly lighter background.

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

// ─── Data model ───────────────────────────────────────────────────────────────

/// Prayer time summary for a single city column.
class TvCityPrayerData {
  final String cityName;
  final String currentPrayerName;
  final String currentPrayerTime;
  final String nextPrayerName;

  /// Formatted countdown string, e.g. "1h 23m".
  final String nextCountdown;

  /// When true this column receives the green highlight treatment.
  final bool isCurrentCity;

  const TvCityPrayerData({
    required this.cityName,
    required this.currentPrayerName,
    required this.currentPrayerTime,
    required this.nextPrayerName,
    required this.nextCountdown,
    required this.isCurrentCity,
  });
}

// ─── Board widget ─────────────────────────────────────────────────────────────

/// Side-by-side prayer time columns for [cities] (2–6 items).
class TvMulticityBoard extends StatelessWidget {
  const TvMulticityBoard({super.key, required this.cities});

  final List<TvCityPrayerData> cities;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0D2F17),
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(16),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            for (int i = 0; i < cities.length; i++) ...[
              Expanded(child: _CityColumn(data: cities[i])),
              if (i < cities.length - 1)
                VerticalDivider(
                  color: Colors.white.withValues(alpha: 0.15),
                  width: 1,
                  thickness: 1,
                ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── City column ─────────────────────────────────────────────────────────────

class _CityColumn extends StatelessWidget {
  const _CityColumn({required this.data});

  final TvCityPrayerData data;

  @override
  Widget build(BuildContext context) {
    final Color timeColor =
        data.isCurrentCity ? PrayCalcColors.light : Colors.white;

    return Container(
      decoration: BoxDecoration(
        color: data.isCurrentCity
            ? Colors.white.withValues(alpha: 0.05)
            : Colors.transparent,
        border: data.isCurrentCity
            ? Border.symmetric(
                vertical: BorderSide(
                  color: PrayCalcColors.mid.withValues(alpha: 0.20),
                  width: 1,
                ),
              )
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 8),
          // City name
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text(
              data.cityName,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 6),
          Divider(
            color: Colors.white.withValues(alpha: 0.20),
            thickness: 1,
            indent: 12,
            endIndent: 12,
          ),
          const SizedBox(height: 6),
          // Current prayer name
          Text(
            data.currentPrayerName,
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withValues(alpha: 0.70),
            ),
          ),
          const SizedBox(height: 4),
          // Current prayer time — green for home city
          Text(
            data.currentPrayerTime,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: timeColor,
            ),
          ),
          const SizedBox(height: 8),
          // Next prayer line
          Text(
            'Next: ${data.nextPrayerName} in ${data.nextCountdown}',
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withValues(alpha: 0.50),
            ),
          ),
          const Spacer(),
          // Bottom accent strip
          Container(
            height: 4,
            decoration: BoxDecoration(
              color: data.isCurrentCity
                  ? PrayCalcColors.mid
                  : Colors.transparent,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(4),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
