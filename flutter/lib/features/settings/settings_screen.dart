import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/auth_provider.dart';
import '../../core/providers/geo_provider.dart';
import '../../core/providers/prayer_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/providers/sync_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/services/sync_service.dart';

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
    final auth = ref.watch(authProvider);
    final sync = ref.watch(syncProvider);

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
          // ── Account & Sync ──────────────────────────────────────────────
          const _SectionHeader('Account'),
          if (auth.isAuthenticated) ...[
            ListTile(
              leading: CircleAvatar(
                backgroundColor: Theme.of(context).colorScheme.primary,
                child: Text(
                  auth.user?.initials ?? '?',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              title: Text(auth.user?.displayName ?? auth.user?.email ?? ''),
              subtitle: Row(
                children: [
                  Icon(
                    _syncIcon(sync.status),
                    size: 14,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 4),
                  Text(_syncStatusLabel(sync.status)),
                ],
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push(Routes.account),
            ),
          ] else ...[
            ListTile(
              leading: const Icon(Icons.sync),
              title: const Text('Sign in to sync'),
              subtitle: const Text('Keep your data across devices'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push(Routes.login),
            ),
          ],

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
          if (settings.prayerTrackingEnabled)
            ListTile(
              leading: const Icon(Icons.bar_chart),
              title: const Text('Prayer statistics'),
              subtitle: const Text('Streaks, weekly and monthly charts'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push(Routes.stats),
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
                settings.homeLat != null && settings.homeLng != null
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
              onTap: () => _setHomeLocation(context, ref, notifier),
            ),
          ListTile(
            leading: const Icon(Icons.menu_book_outlined),
            title: const Text('Travel prayer rulings'),
            subtitle: const Text('Qasr, combining, and traveler guidelines'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.travelRulings),
          ),

          // ── Smart Home ──────────────────────────────────────────────────
          const _SectionHeader('Smart Home'),
          ListTile(
            leading: const Icon(Icons.home_max_outlined),
            title: const Text('Smart home integrations'),
            subtitle: const Text('HomeKit, Google Home, Alexa, Home Assistant'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.smartHome),
          ),

          // ── TV Display ──────────────────────────────────────────────────
          const _SectionHeader('TV Display'),
          ListTile(
            leading: const Icon(Icons.tv),
            title: const Text('TV home display'),
            subtitle: const Text('Full-screen prayer clock for TV'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.tvHome),
          ),
          ListTile(
            leading: const Icon(Icons.mosque),
            title: const Text('Masjid display'),
            subtitle: const Text('Adhan/iqamah table for masjid screens'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.tvMasjid),
          ),
          ListTile(
            leading: const Icon(Icons.settings_outlined),
            title: const Text('TV settings'),
            subtitle: const Text('Masjid mode, iqamah offsets, ambient'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.tvSettings),
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

  IconData _syncIcon(SyncStatus status) {
    switch (status) {
      case SyncStatus.synced:
        return Icons.cloud_done;
      case SyncStatus.syncing:
        return Icons.cloud_sync;
      case SyncStatus.offline:
        return Icons.cloud_off;
      case SyncStatus.error:
        return Icons.cloud_off;
    }
  }

  String _syncStatusLabel(SyncStatus status) {
    switch (status) {
      case SyncStatus.synced:
        return 'Synced';
      case SyncStatus.syncing:
        return 'Syncing...';
      case SyncStatus.offline:
        return 'Offline';
      case SyncStatus.error:
        return 'Sync error';
    }
  }

  Future<void> _setHomeLocation(
    BuildContext context,
    WidgetRef ref,
    SettingsNotifier notifier,
  ) async {
    final city = ref.read(cityProvider);

    final confirmed = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Set home location'),
        content: Text(
          city != null
              ? 'Use "${city.displayName}" as your home location? '
                'Travel mode will detect when you are away from here.'
              : 'Use your current GPS position as home? Travel mode will '
                'detect when you are away.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(null),
            child: const Text('Cancel'),
          ),
          if (city != null)
            FilledButton(
              onPressed: () => Navigator.of(ctx).pop('city'),
              child: Text('Use ${city.name}'),
            )
          else
            FilledButton(
              onPressed: () => Navigator.of(ctx).pop('gps'),
              child: const Text('Use current location'),
            ),
        ],
      ),
    );
    if (confirmed == null || !context.mounted) return;

    if (confirmed == 'city' && city != null) {
      await notifier.setHomeCoords(city.lat, city.lng);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Home set to ${city.displayName}')),
        );
      }
    } else {
      final gps = ref.read(gpsProvider.notifier);
      await gps.requestLocation();
      final gpsState = ref.read(gpsProvider);
      if (gpsState.hasPosition) {
        await notifier.setHomeCoords(gpsState.lat!, gpsState.lng!);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Home location set from GPS')),
          );
        }
      } else if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(gpsState.errorMessage ?? 'Could not get GPS location'),
          ),
        );
      }
    }
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
