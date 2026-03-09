// TV2-2.5: Info bar content configurator
//
// A dedicated full-screen settings page for toggling info bar items on/off.
// Navigated to from the "Info Bar" section in TvSettingsScreen.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/tv_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/tv_settings_model.dart';

/// Full-screen info bar configurator. Allows users to toggle each info bar
/// item on/off and configure the weather temperature unit.
///
/// All changes are applied immediately via [TvSettingsNotifier].
class TvInfoBarConfigurator extends ConsumerWidget {
  const TvInfoBarConfigurator({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tvSettings = ref.watch(tvSettingsProvider);
    final tvNotifier = ref.read(tvSettingsProvider.notifier);
    final config = tvSettings.infoBarConfig;

    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      appBar: AppBar(
        backgroundColor: PrayCalcColors.deep,
        foregroundColor: Colors.white,
        title: const Text(
          'Info Bar',
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, size: 32),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: FocusTraversalGroup(
        policy: OrderedTraversalPolicy(),
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 24),
          children: [
            // ── Top bar items ──────────────────────────────────────────────────
            _SectionLabel(title: 'Top Bar Items'),
            const SizedBox(height: 8),

            _InfoBarToggle(
              icon: Icons.calendar_today,
              title: 'Hijri Date',
              subtitle: 'Islamic calendar date (e.g. 5 Ramadan 1446)',
              value: config.showHijri,
              onChanged: (v) => tvNotifier.setInfoBarConfig(
                  config.copyWith(showHijri: v)),
            ),
            const SizedBox(height: 8),
            _InfoBarToggle(
              icon: Icons.date_range,
              title: 'Gregorian Date',
              subtitle: 'Standard calendar date (e.g. March 8, 2026)',
              value: config.showGregorian,
              onChanged: (v) => tvNotifier.setInfoBarConfig(
                  config.copyWith(showGregorian: v)),
            ),
            const SizedBox(height: 8),
            _InfoBarToggle(
              icon: Icons.location_on,
              title: 'Location Name',
              subtitle: 'City name from your GPS or saved location',
              value: config.showLocation,
              onChanged: (v) => tvNotifier.setInfoBarConfig(
                  config.copyWith(showLocation: v)),
            ),
            const SizedBox(height: 8),
            _InfoBarToggle(
              icon: Icons.timer_outlined,
              title: 'Prayer Countdown',
              subtitle: 'Time remaining until the next prayer',
              value: true, // always on — not yet a model field; placeholder
              onChanged: null, // countdown is always shown
            ),
            const SizedBox(height: 8),
            _InfoBarToggle(
              icon: Icons.cloud,
              title: 'Weather',
              subtitle: 'Current conditions and temperature',
              value: config.showWeather,
              onChanged: (v) => tvNotifier.setInfoBarConfig(
                  config.copyWith(showWeather: v)),
            ),

            // Temperature unit sub-option (visible only when weather is on)
            if (config.showWeather) ...[
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.only(left: 24),
                child: _InfoBarChoiceTile(
                  icon: Icons.thermostat,
                  title: 'Temperature Unit',
                  subtitle: _weatherUnitLabel(config.weatherUnit),
                  onTap: () => _showWeatherUnitDialog(
                      context, tvNotifier, config),
                ),
              ),
            ],

            const SizedBox(height: 8),
            _InfoBarToggle(
              icon: Icons.nightlight,
              title: 'Moon Phase',
              subtitle: 'Current lunar phase icon and name',
              value: config.showMoon,
              onChanged: (v) => tvNotifier.setInfoBarConfig(
                  config.copyWith(showMoon: v)),
            ),
            const SizedBox(height: 24),

            // ── Bottom bar items ───────────────────────────────────────────────
            _SectionLabel(title: 'Bottom Bar Items'),
            const SizedBox(height: 8),

            _InfoBarToggle(
              icon: Icons.format_quote,
              title: 'Hadith Ticker',
              subtitle: 'Scrolling authentic hadith across the bottom',
              value: config.showHadithTicker,
              onChanged: (v) => tvNotifier.setInfoBarConfig(
                  config.copyWith(showHadithTicker: v)),
            ),
            const SizedBox(height: 8),
            _InfoBarToggle(
              icon: Icons.event,
              title: 'Islamic Calendar Ticker',
              subtitle: 'Upcoming Islamic dates scrolling across the bottom',
              value: config.showCalendarTicker,
              onChanged: (v) => tvNotifier.setInfoBarConfig(
                  config.copyWith(showCalendarTicker: v)),
            ),
            const SizedBox(height: 8),
            _InfoBarToggle(
              icon: Icons.auto_awesome,
              title: '99 Names of Allah',
              subtitle: 'Mix Asmāʾ al-Ḥusnā into the hadith ticker rotation',
              value: config.showAsmaAlHusna,
              onChanged: (v) => tvNotifier.setInfoBarConfig(
                  config.copyWith(showAsmaAlHusna: v)),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  String _weatherUnitLabel(String unit) {
    switch (unit) {
      case 'F':
        return 'Fahrenheit (°F)';
      case 'both':
        return 'Both (°C / °F)';
      case 'C':
      default:
        return 'Celsius (°C)';
    }
  }

  void _showWeatherUnitDialog(
    BuildContext context,
    TvSettingsNotifier tvNotifier,
    TvInfoBarConfig config,
  ) {
    const options = [
      ('C', 'Celsius (°C)'),
      ('F', 'Fahrenheit (°F)'),
      ('both', 'Both (°C / °F)'),
    ];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text(
          'Temperature Unit',
          style: TextStyle(color: Colors.white, fontSize: 28),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((opt) {
            final isSelected = config.weatherUnit == opt.$1;
            return _DialogOption(
              label: opt.$2,
              isSelected: isSelected,
              onTap: () {
                tvNotifier.setInfoBarConfig(
                    config.copyWith(weatherUnit: opt.$1));
                Navigator.of(ctx).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }
}

// ─── Private widgets ────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        color: PrayCalcColors.mid,
        fontSize: 24,
        fontWeight: FontWeight.w600,
      ),
    );
  }
}

/// A D-pad-navigable toggle tile for an info bar item.
class _InfoBarToggle extends StatelessWidget {
  const _InfoBarToggle({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;

  /// Null means the toggle is disabled (item is always on/off).
  final ValueChanged<bool>? onChanged;

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (onChanged == null) return KeyEventResult.ignored;
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onChanged!(!value);
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(
        builder: (ctx) {
          final hasFocus = Focus.of(ctx).hasFocus;
          return Container(
            decoration: BoxDecoration(
              color: hasFocus
                  ? PrayCalcColors.dark.withAlpha(120)
                  : PrayCalcColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: hasFocus
                  ? Border.all(color: PrayCalcColors.mid, width: 2)
                  : null,
            ),
            child: ListTile(
              leading: Icon(icon, color: PrayCalcColors.mid, size: 32),
              title: Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                subtitle,
                style: const TextStyle(color: Colors.white54, fontSize: 20),
              ),
              trailing: Switch(
                value: value,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: onChanged,
              ),
              onTap: onChanged != null ? () => onChanged!(!value) : null,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            ),
          );
        },
      ),
    );
  }
}

/// A D-pad-navigable tile that navigates to a sub-choice (e.g. temperature unit).
class _InfoBarChoiceTile extends StatelessWidget {
  const _InfoBarChoiceTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onTap();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(
        builder: (ctx) {
          final hasFocus = Focus.of(ctx).hasFocus;
          return Container(
            decoration: BoxDecoration(
              color: hasFocus
                  ? PrayCalcColors.dark.withAlpha(120)
                  : PrayCalcColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: hasFocus
                  ? Border.all(color: PrayCalcColors.mid, width: 2)
                  : null,
            ),
            child: ListTile(
              leading: Icon(icon, color: PrayCalcColors.mid, size: 32),
              title: Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 26,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                subtitle,
                style: const TextStyle(color: Colors.white54, fontSize: 20),
              ),
              trailing: const Icon(
                  Icons.chevron_right, color: Colors.white54, size: 32),
              onTap: onTap,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            ),
          );
        },
      ),
    );
  }
}

/// Simple option row used inside dialogs.
class _DialogOption extends StatelessWidget {
  const _DialogOption({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onTap();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: ListTile(
        title: Text(
          label,
          style: TextStyle(
            color: isSelected ? PrayCalcColors.light : Colors.white70,
            fontSize: 24,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        trailing: isSelected
            ? const Icon(Icons.check, color: PrayCalcColors.light, size: 28)
            : null,
        onTap: onTap,
      ),
    );
  }
}
