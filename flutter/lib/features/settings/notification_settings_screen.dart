import 'package:flutter/material.dart';
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
      appBar: AppBar(title: const Text('Notifications & Adhan')),
      body: ListView(
        children: [
          // ── Global adhan defaults ──────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
            child: Text(
              'Default Adhan',
              style: TextStyle(
                color: PrayCalcColors.light,
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
          ),
          _AdhanPickerTile(
            label: 'Fajr Adhan',
            subtitle: 'Played at Fajr prayer time',
            value: fajrType,
            // Fajr-appropriate voices only: show all but filter beep/silent to bottom
            onChanged: (t) {
              ref.read(settingsProvider.notifier).setAdhanFajr(t.name);
              AdhanService.instance.play(t);
            },
          ),
          _AdhanPickerTile(
            label: 'Regular Adhan',
            subtitle: 'Played at Dhuhr, Asr, Maghrib, Isha',
            value: regularType,
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
              'Per-Prayer Settings',
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
    required this.onChanged,
  });

  final String label;
  final String subtitle;
  final AdhanType value;
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
            tooltip: 'Preview',
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
    final isEnabled = config.mode != PrayerNotificationMode.off;
    return ExpansionTile(
      title: Text(config.prayerName,
          style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(_modeLabel(config.mode)),
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
            title: const Text('Adhan'),
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
            title: Text('Reminder: ${config.minutesBefore} min before'),
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
            title: Text('Volume: ${(config.volume * 100).round()}%'),
            subtitle: Slider(
              value: config.volume,
              min: 0,
              max: 1,
              onChanged: (v) => onChanged(config.copyWith(volume: v)),
            ),
          ),
          ListTile(
            title: const Text('Test adhan'),
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

  String _modeLabel(PrayerNotificationMode m) {
    switch (m) {
      case PrayerNotificationMode.off:
        return 'Off';
      case PrayerNotificationMode.reminderOnly:
        return 'Reminder only';
      case PrayerNotificationMode.arrival:
        return 'At prayer time';
      case PrayerNotificationMode.both:
        return 'Reminder + arrival';
    }
  }
}
