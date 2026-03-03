import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/settings_provider.dart';
import '../../core/router/app_router.dart';

/// Supported locales: (display name, language code or null for system default).
const _supportedLocales = [
  ('System default', null),
  ('English', 'en'),
  ('العربية', 'ar'),
  ('اردو', 'ur'),
  ('বাংলা', 'bn'),
  ('Français', 'fr'),
  ('Bahasa Indonesia', 'id'),
  ('Türkçe', 'tr'),
  ('Soomaali', 'so'),
];

/// Settings screen: calculation method, madhab, time format, theme, language,
/// plus navigation to notification settings and agendas.
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final notifier = ref.read(settingsProvider.notifier);

    final currentLocaleLabel = _supportedLocales
        .firstWhere(
          (e) => e.$2 == settings.locale,
          orElse: () => _supportedLocales.first,
        )
        .$1;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          // ── Prayer calculation ───────────────────────────────────────────
          const _SectionHeader('Prayer Calculation'),
          SwitchListTile(
            title: const Text('Hanafi Asr'),
            subtitle: const Text('Shadow factor 2x (later Asr time)'),
            value: settings.hanafi,
            onChanged: notifier.setHanafi,
          ),

          // ── Home Screen ──────────────────────────────────────────────────
          const _SectionHeader('Home Screen'),
          SwitchListTile(
            title: const Text('Sky gradient background'),
            subtitle: const Text('Animated sky colors matching the time of day'),
            value: settings.skyGradientEnabled,
            onChanged: notifier.setSkyGradientEnabled,
          ),
          if (settings.skyGradientEnabled)
            SwitchListTile(
              title: const Text('Weather-tinted gradient'),
              subtitle: const Text('Adjust sky colors based on local weather'),
              value: settings.skyGradientWeather,
              onChanged: notifier.setSkyGradientWeather,
            ),
          SwitchListTile(
            title: const Text('Countdown animation'),
            subtitle: const Text('Breathing ring on the next prayer countdown'),
            value: settings.countdownAnimationEnabled,
            onChanged: notifier.setCountdownAnimationEnabled,
          ),

          // ── Display ──────────────────────────────────────────────────────
          const _SectionHeader('Display'),
          SwitchListTile(
            title: const Text('24-hour clock'),
            value: settings.use24h,
            onChanged: notifier.setUse24h,
          ),
          SwitchListTile(
            title: const Text('Follow system theme'),
            value: settings.followSystem ?? true,
            onChanged: notifier.setFollowSystem,
          ),
          if (!(settings.followSystem ?? true))
            SwitchListTile(
              title: const Text('Dark mode'),
              value: settings.darkMode,
              onChanged: notifier.setDarkMode,
            ),
          ListTile(
            leading: const Icon(Icons.language),
            title: const Text('Language'),
            subtitle: Text(currentLocaleLabel),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showLanguagePicker(context, settings.locale, notifier),
          ),

          // ── Prayer Tracking ──────────────────────────────────────────────
          const _SectionHeader('Prayer Tracking'),
          SwitchListTile(
            title: const Text('Track my prayers'),
            subtitle: const Text('Log which prayers you complete each day'),
            value: settings.prayerTrackingEnabled,
            onChanged: notifier.setPrayerTrackingEnabled,
          ),

          // ── Notifications ────────────────────────────────────────────────
          const _SectionHeader('Notifications'),
          ListTile(
            leading: const Icon(Icons.notifications_outlined),
            title: const Text('Prayer notifications'),
            subtitle: const Text('Adhan, reminders, and per-prayer settings'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.notificationSettings),
          ),
          ListTile(
            leading: const Icon(Icons.alarm_outlined),
            title: const Text('Prayer agendas'),
            subtitle: const Text('Custom reminders offset from prayer times'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.agendas),
          ),
          SwitchListTile(
            title: const Text('Jumu\'ah Al-Kahf reminder'),
            subtitle: const Text('Reminder on Fridays to read Surah Al-Kahf'),
            value: settings.jumuahKahfReminder,
            onChanged: notifier.setJumuahKahfReminder,
          ),

          // ── Travel ───────────────────────────────────────────────────────
          const _SectionHeader('Travel'),
          SwitchListTile(
            title: const Text('Travel mode'),
            subtitle: const Text(
                'Automatically detect when away from home and adjust prayers'),
            value: settings.travelModeEnabled,
            onChanged: notifier.setTravelModeEnabled,
          ),
          if (settings.travelModeEnabled)
            ListTile(
              leading: const Icon(Icons.home_outlined),
              title: const Text('Home location'),
              subtitle: Text(
                settings.homeLat != null
                    ? '${settings.homeLat!.toStringAsFixed(4)}, '
                        '${settings.homeLng!.toStringAsFixed(4)}'
                    : 'Not set — tap to use current location',
              ),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (settings.homeLat != null)
                    IconButton(
                      icon: const Icon(Icons.clear),
                      tooltip: 'Clear home location',
                      onPressed: () => notifier.clearHomeCoords(),
                    ),
                  const Icon(Icons.chevron_right),
                ],
              ),
              onTap: () => _setHomeLocation(context, notifier),
            ),

          // ── About ─────────────────────────────────────────────────────────
          const _SectionHeader('About'),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('About PrayCalc'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.about),
          ),
        ],
      ),
    );
  }

  Future<void> _setHomeLocation(
    BuildContext context,
    SettingsNotifier notifier,
  ) async {
    // Prompt user to confirm using current GPS position as home.
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Set home location'),
        content: const Text(
          'Use your current location as home? Travel mode will use this '
          'to detect when you are away.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Use current location'),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;
    // Reads lat/lng from the existing location provider via the city.
    // A full GPS call is out of scope here — show a snackbar instructing
    // the user to visit the main screen first to set their city.
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Set your city on the main screen, then return here to lock it as home.',
        ),
      ),
    );
  }

  Future<void> _showLanguagePicker(
    BuildContext context,
    String? current,
    SettingsNotifier notifier,
  ) async {
    final selected = await showDialog<String?>(
      context: context,
      builder: (ctx) => SimpleDialog(
        title: const Text('Language'),
        children: [
          for (final (label, code) in _supportedLocales)
            SimpleDialogOption(
              onPressed: () => Navigator.of(ctx).pop(code ?? ''),
              child: Row(
                children: [
                  Icon(
                    (code == current || (code == null && current == null))
                        ? Icons.radio_button_checked
                        : Icons.radio_button_unchecked,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Text(label),
                ],
              ),
            ),
        ],
      ),
    );
    if (selected == null) return; // dialog dismissed
    await notifier.setLocale(selected.isEmpty ? null : selected);
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.title);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Text(
        title,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: Theme.of(context).colorScheme.primary,
            ),
      ),
    );
  }
}
