import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/notification_configs_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/services/adhan_service.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/notification_model.dart';

class NotificationSettingsScreen extends ConsumerWidget {
  const NotificationSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppLocalizations.of(context)!;
    final configs = ref.watch(notificationConfigsProvider);
    final settings = ref.watch(settingsProvider);

    final fajrType = AdhanType.values.firstWhere(
      (t) => t.name == settings.adhanFajr,
      orElse: () => AdhanType.fajrMishari,
    );
    final regularType = AdhanType.values.firstWhere(
      (t) => t.name == settings.adhanRegular,
      orElse: () => AdhanType.makkah,
    );

    return Scaffold(
      appBar: AppBar(title: Text(l.notifSettingsTitle)),
      body: ListView(
        children: [
          // ── Global adhan defaults ──────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
            child: Text(
              l.notifDefaultAdhan,
              style: TextStyle(
                color: PrayCalcColors.light,
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
          ),
          _AdhanPickerTile(
            label: l.notifFajrAdhan,
            subtitle: l.notifFajrAdhanSubtitle,
            value: fajrType,
            previewTooltip: l.notifPreview,
            // Fajr-appropriate voices only: show all but filter beep/silent to bottom
            onChanged: (t) {
              ref.read(settingsProvider.notifier).setAdhanFajr(t.name);
              AdhanService.instance.play(t);
            },
          ),
          _AdhanPickerTile(
            label: l.notifRegularAdhan,
            subtitle: l.notifRegularAdhanSubtitle,
            value: regularType,
            previewTooltip: l.notifPreview,
            onChanged: (t) {
              ref.read(settingsProvider.notifier).setAdhanRegular(t.name);
              AdhanService.instance.play(t);
            },
          ),
          const Divider(height: 24),

          // ── Per-prayer overrides ───────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
            child: Text(
              l.notifPerPrayerSettings,
              style: TextStyle(
                color: PrayCalcColors.light,
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
          ),
          for (int i = 0; i < configs.length; i++)
            _PrayerNotifTile(
              config: configs[i],
              onChanged: (updated) =>
                  ref.read(notificationConfigsProvider.notifier).update(i, updated),
            ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

// ── Global adhan picker row ────────────────────────────────────────────────────

class _AdhanPickerTile extends StatelessWidget {
  const _AdhanPickerTile({
    required this.label,
    required this.subtitle,
    required this.value,
    required this.previewTooltip,
    required this.onChanged,
  });

  final String label;
  final String subtitle;
  final AdhanType value;
  final String previewTooltip;
  final void Function(AdhanType) onChanged;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(label),
      subtitle: Text(subtitle, style: TextStyle(color: Colors.white.withAlpha(100), fontSize: 12)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          DropdownButton<AdhanType>(
            value: value,
            underline: const SizedBox.shrink(),
            items: AdhanType.values
                .map((t) => DropdownMenuItem(
                      value: t,
                      child: Text(AdhanService.displayName(t)),
                    ))
                .toList(),
            onChanged: (t) {
              if (t != null) onChanged(t);
            },
          ),
          const SizedBox(width: 4),
          IconButton(
            icon: Icon(Icons.play_circle_outline_rounded,
                color: PrayCalcColors.mid, size: 28),
            onPressed: () => AdhanService.instance.play(value),
            tooltip: previewTooltip,
          ),
        ],
      ),
    );
  }
}

class _PrayerNotifTile extends StatelessWidget {
  const _PrayerNotifTile({required this.config, required this.onChanged});
  final PrayerNotificationConfig config;
  final void Function(PrayerNotificationConfig) onChanged;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context)!;
    final isEnabled = config.mode != PrayerNotificationMode.off;
    return ExpansionTile(
      title: Text(config.prayerName,
          style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(_modeLabel(l, config.mode)),
      trailing: Switch(
        value: isEnabled,
        onChanged: (v) {
          if (v) {
            onChanged(config.copyWith(mode: PrayerNotificationMode.arrival));
          } else {
            onChanged(config.copyWith(mode: PrayerNotificationMode.off));
          }
        },
      ),
      children: [
        if (config.mode != PrayerNotificationMode.off) ...[
          ListTile(
            title: Text(l.notifAdhanLabel),
            trailing: DropdownButton<AdhanType>(
              value: config.adhanType,
              items: AdhanType.values
                  .map((t) => DropdownMenuItem(
                        value: t,
                        child: Text(AdhanService.displayName(t)),
                      ))
                  .toList(),
              onChanged: (t) {
                if (t != null) onChanged(config.copyWith(adhanType: t));
              },
            ),
          ),
          ListTile(
            title: Text(l.notifReminderMinBefore(config.minutesBefore)),
            subtitle: Slider(
              value: config.minutesBefore.toDouble(),
              min: 0,
              max: 30,
              divisions: 6,
              onChanged: (v) =>
                  onChanged(config.copyWith(minutesBefore: v.round())),
            ),
          ),
          ListTile(
            title: Text(l.notifVolumePct((config.volume * 100).round())),
            subtitle: Slider(
              value: config.volume,
              min: 0,
              max: 1,
              onChanged: (v) => onChanged(config.copyWith(volume: v)),
            ),
          ),
          ListTile(
            title: Text(l.notifTestAdhan),
            trailing: IconButton(
              icon: const Icon(Icons.play_arrow),
              onPressed: () => AdhanService.instance
                  .play(config.adhanType, volume: config.volume),
            ),
          ),
        ],
      ],
    );
  }

  String _modeLabel(AppLocalizations l, PrayerNotificationMode m) {
    switch (m) {
      case PrayerNotificationMode.off:
        return l.notifModeOff;
      case PrayerNotificationMode.reminderOnly:
        return l.notifModeReminderOnly;
      case PrayerNotificationMode.arrival:
        return l.notifModeArrival;
      case PrayerNotificationMode.both:
        return l.notifModeBoth;
    }
  }
}
