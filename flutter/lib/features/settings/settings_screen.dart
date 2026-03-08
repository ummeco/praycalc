import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/auth_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/providers/sync_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/services/sync_service.dart';
import '../../core/utils/locale_calc_method.dart';

/// Supported locales: (display name, language code or null for system default).
const _supportedLocales = [
  ('System default', null),
  ('English', 'en'),
  ('العربية', 'ar'),
  ('Türkçe', 'tr'),
  ('اردو', 'ur'),
  ('Bahasa Indonesia', 'id'),
  ('Français', 'fr'),
  ('বাংলা', 'bn'),
  ('Soomaali', 'so'),
  ('Deutsch', 'de'),
  ('Español', 'es'),
  ('हिन्दी', 'hi'),
  ('Bahasa Melayu', 'ms'),
  ('فارسی', 'fa'),
  ('پښتو', 'ps'),
  ('Kiswahili', 'sw'),
  ('Hausa', 'ha'),
  ('Oʻzbek', 'uz'),
  ('کوردی', 'ku'),
  ('ไทย', 'th'),
  ('中文', 'zh'),
  ('Русский', 'ru'),
  ('Português', 'pt'),
];

/// Settings screen: calculation method, madhab, time format, theme, language,
/// plus navigation to notification settings and agendas.
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppLocalizations.of(context)!;
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
      appBar: AppBar(title: Text(l.settingsTitle)),
      body: ListView(
        children: [
          // ── Account & Sync ──────────────────────────────────────────────
          _SectionHeader(l.settingsAccount),
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
                  Text(_syncStatusLabel(l, sync.status)),
                ],
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push(Routes.account),
            ),
          ] else ...[
            ListTile(
              leading: const Icon(Icons.sync),
              title: Text(l.settingsSignInToSync),
              subtitle: Text(l.settingsSignInToSyncSubtitle),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push(Routes.login),
            ),
          ],

          // ── Prayer calculation ───────────────────────────────────────────
          _SectionHeader(l.settingsSectionPrayerCalc),
          ListTile(
            leading: const Icon(Icons.calculate_outlined),
            title: Text(l.settingsCalcMethod),
            subtitle: Text(_calcMethodLabel(settings.calcMethod)),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showCalcMethodPicker(context, settings.calcMethod, notifier, ref),
          ),
          SwitchListTile(
            title: Text(l.settingsHanafiAsr),
            subtitle: Text(l.settingsHanafiAsrSubtitle),
            value: settings.hanafi,
            onChanged: notifier.setHanafi,
          ),

          // ── Home Screen ──────────────────────────────────────────────────
          _SectionHeader(l.settingsHomeScreen),
          SwitchListTile(
            title: Text(l.settingsSkyGradient),
            subtitle: Text(l.settingsSkyGradientSubtitle),
            value: settings.skyGradientEnabled,
            onChanged: notifier.setSkyGradientEnabled,
          ),
          if (settings.skyGradientEnabled)
            SwitchListTile(
              title: Text(l.settingsWeatherGradient),
              subtitle: Text(l.settingsWeatherGradientSubtitle),
              value: settings.skyGradientWeather,
              onChanged: notifier.setSkyGradientWeather,
            ),
          SwitchListTile(
            title: Text(l.settingsCountdownAnimation),
            subtitle: Text(l.settingsCountdownAnimationSubtitle),
            value: settings.countdownAnimationEnabled,
            onChanged: notifier.setCountdownAnimationEnabled,
          ),

          // ── Display ──────────────────────────────────────────────────────
          _SectionHeader(l.settingsSectionDisplay),
          SwitchListTile(
            title: Text(l.settings24hClock),
            value: settings.use24h,
            onChanged: notifier.setUse24h,
          ),
          SwitchListTile(
            title: Text(l.settingsFollowSystemTheme),
            value: settings.followSystem ?? true,
            onChanged: notifier.setFollowSystem,
          ),
          if (!(settings.followSystem ?? true))
            SwitchListTile(
              title: Text(l.settingsDarkMode),
              value: settings.darkMode,
              onChanged: notifier.setDarkMode,
            ),
          ListTile(
            leading: const Icon(Icons.language),
            title: Text(l.commonLanguage),
            subtitle: Text(currentLocaleLabel),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showLanguagePicker(context, settings.locale, notifier),
          ),

          // ── Prayer Tracking ──────────────────────────────────────────────
          _SectionHeader(l.settingsPrayerTracking),
          SwitchListTile(
            title: Text(l.settingsTrackMyPrayers),
            subtitle: Text(l.settingsTrackMyPrayersSubtitle),
            value: settings.prayerTrackingEnabled,
            onChanged: notifier.setPrayerTrackingEnabled,
          ),
          if (settings.prayerTrackingEnabled)
            ListTile(
              leading: const Icon(Icons.bar_chart),
              title: Text(l.settingsPrayerStats),
              subtitle: Text(l.settingsPrayerStatsSubtitle),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => context.push(Routes.stats),
            ),

          // ── Notifications ────────────────────────────────────────────────
          _SectionHeader(l.settingsSectionNotifications),
          ListTile(
            leading: const Icon(Icons.notifications_outlined),
            title: Text(l.settingsPrayerNotifications),
            subtitle: Text(l.settingsPrayerNotificationsSubtitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.notificationSettings),
          ),
          ListTile(
            leading: const Icon(Icons.alarm_outlined),
            title: Text(l.settingsPrayerAgendas),
            subtitle: Text(l.settingsPrayerAgendasSubtitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.agendas),
          ),
          SwitchListTile(
            title: Text(l.settingsJumuahKahf),
            subtitle: Text(l.settingsJumuahKahfSubtitle),
            value: settings.jumuahKahfReminder,
            onChanged: notifier.setJumuahKahfReminder,
          ),

          // ── Travel ───────────────────────────────────────────────────────
          _SectionHeader(l.settingsTravel),
          SwitchListTile(
            title: Text(l.settingsTravelMode),
            subtitle: Text(l.settingsTravelModeSubtitle),
            value: settings.travelModeEnabled,
            onChanged: notifier.setTravelModeEnabled,
          ),
          if (settings.travelModeEnabled)
            ListTile(
              leading: const Icon(Icons.home_outlined),
              title: Text(l.settingsHomeLocation),
              subtitle: Text(
                settings.homeLat != null && settings.homeLng != null
                    ? '${settings.homeLat!.toStringAsFixed(4)}, '
                        '${settings.homeLng!.toStringAsFixed(4)}'
                    : l.settingsHomeLocationNotSet,
              ),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (settings.homeLat != null)
                    IconButton(
                      icon: const Icon(Icons.clear),
                      tooltip: l.settingsClearHomeLocation,
                      onPressed: () => notifier.clearHomeCoords(),
                    ),
                  const Icon(Icons.chevron_right),
                ],
              ),
              onTap: () => _setHomeLocation(context, ref, notifier),
            ),
          ListTile(
            leading: const Icon(Icons.menu_book_outlined),
            title: Text(l.settingsTravelRulings),
            subtitle: Text(l.settingsTravelRulingsSubtitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.travelRulings),
          ),

          // ── Smart Home ──────────────────────────────────────────────────
          _SectionHeader(l.settingsSmartHome),
          ListTile(
            leading: const Icon(Icons.home_max_outlined),
            title: Text(l.settingsSmartHomeIntegrations),
            subtitle: Text(l.settingsSmartHomeIntegrationsSubtitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.smartHome),
          ),

          // ── TV Display ──────────────────────────────────────────────────
          _SectionHeader(l.settingsTvDisplay),
          ListTile(
            leading: const Icon(Icons.tv),
            title: Text(l.settingsTvHome),
            subtitle: Text(l.settingsTvHomeSubtitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.tvHome),
          ),
          ListTile(
            leading: const Icon(Icons.mosque),
            title: Text(l.settingsMasjidDisplay),
            subtitle: Text(l.settingsMasjidDisplaySubtitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.tvMasjid),
          ),
          ListTile(
            leading: const Icon(Icons.settings_outlined),
            title: Text(l.settingsTvSettings),
            subtitle: Text(l.settingsTvSettingsSubtitle),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push(Routes.tvSettings),
          ),

          // ── About ─────────────────────────────────────────────────────────
          _SectionHeader(l.commonAbout),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: Text(l.settingsAboutPrayCalc),
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

  String _syncStatusLabel(AppLocalizations l, SyncStatus status) {
    switch (status) {
      case SyncStatus.synced:
        return l.syncSynced;
      case SyncStatus.syncing:
        return l.syncSyncing;
      case SyncStatus.offline:
        return l.syncOffline;
      case SyncStatus.error:
        return l.syncError;
    }
  }

  /// Display label for the current calculation method.
  String _calcMethodLabel(String? method) {
    if (method == null) return 'Auto (Dynamic)';
    const labels = {
      'isna': 'ISNA',
      'mwl': 'MWL',
      'egypt': 'Egypt',
      'ummAlQura': 'Umm al-Qura',
      'tehran': 'Tehran',
      'karachi': 'Karachi',
      'kuwait': 'Kuwait',
      'qatar': 'Qatar',
      'singapore': 'Singapore',
      'turkey': 'Turkey',
      'dubai': 'Dubai',
      'morocco': 'Morocco',
      'moonsighting': 'Moon Sighting',
    };
    return labels[method] ?? method;
  }

  Future<void> _showCalcMethodPicker(
    BuildContext context,
    String? current,
    SettingsNotifier notifier,
    WidgetRef ref,
  ) async {
    final l = AppLocalizations.of(context)!;
    final methods = <(String, String?)>[
      (l.settingsCalcMethodAuto, null),
      ('ISNA', 'isna'),
      ('MWL', 'mwl'),
      ('Egypt', 'egypt'),
      ('Umm al-Qura', 'ummAlQura'),
      ('Tehran', 'tehran'),
      ('Karachi', 'karachi'),
      ('Kuwait', 'kuwait'),
      ('Qatar', 'qatar'),
      ('Singapore', 'singapore'),
      ('Turkey', 'turkey'),
      ('Dubai', 'dubai'),
      ('Morocco', 'morocco'),
      ('Moon Sighting', 'moonsighting'),
    ];

    // Show the locale-suggested method at the top if not already selected
    final locale = ref.read(settingsProvider).locale;
    final suggested = locale != null ? getDefaultCalcMethod(locale).name : null;

    final selected = await showDialog<String?>(
      context: context,
      builder: (ctx) => SimpleDialog(
        title: Text(l.settingsCalcMethod),
        children: [
          for (final (label, code) in methods)
            SimpleDialogOption(
              onPressed: () => Navigator.of(ctx).pop(code ?? ''),
              child: Row(
                children: [
                  Icon(
                    code == current || (code == null && current == null)
                        ? Icons.radio_button_checked
                        : Icons.radio_button_unchecked,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Text(label)),
                  if (code != null && code == suggested && code != current)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primary.withAlpha(30),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'Suggested',
                        style: TextStyle(
                          fontSize: 10,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
    if (selected == null) return; // dialog dismissed
    await notifier.setCalcMethod(selected.isEmpty ? null : selected);
  }

  void _setHomeLocation(BuildContext context, WidgetRef ref, SettingsNotifier notifier) {
    context.push(Routes.setHome);
  }

  Future<void> _showLanguagePicker(
    BuildContext context,
    String? current,
    SettingsNotifier notifier,
  ) async {
    final selected = await showDialog<String?>(
      context: context,
      builder: (ctx) => SimpleDialog(
        title: Text(AppLocalizations.of(context)!.commonLanguage),
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
