import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/notification_configs_provider.dart';
import '../../core/services/adhan_service.dart';
import '../../shared/models/notification_model.dart';

class NotificationSettingsScreen extends ConsumerWidget {
  const NotificationSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final configs = ref.watch(notificationConfigsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications & Adhan')),
      body: ListView.builder(
        itemCount: configs.length,
        itemBuilder: (context, i) {
          final c = configs[i];
          return _PrayerNotifTile(
            config: c,
            onChanged: (updated) =>
                ref.read(notificationConfigsProvider.notifier).update(i, updated),
          );
        },
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
    return ExpansionTile(
      title: Text(config.prayerName,
          style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(_modeLabel(config.mode)),
      trailing: Switch(
        value: config.mode != PrayerNotificationMode.off,
        onChanged: (v) => onChanged(config.copyWith(
          mode: v
              ? PrayerNotificationMode.arrival
              : PrayerNotificationMode.off,
        )),
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
