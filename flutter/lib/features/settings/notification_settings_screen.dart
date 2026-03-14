import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/providers/notification_configs_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/services/adhan_service.dart';
import '../../core/services/notification_service.dart';
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
          const HapticAdhanTile(),
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
          const Divider(height: 24),

          // ── Sunnah Prayers ─────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
            child: Text(
              'Sunnah Prayers',
              style: TextStyle(
                color: PrayCalcColors.light,
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const _SunnahSettingsSection(),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

// ── Haptic adhan toggle ────────────────────────────────────────────────────────

/// SwitchListTile that toggles haptic adhan mode.
/// When enabled, prayer notifications with silent adhan type vibrate instead
/// of playing a sound — useful during quiet hours.
class HapticAdhanTile extends StatefulWidget {
  const HapticAdhanTile({super.key});

  @override
  State<HapticAdhanTile> createState() => _HapticAdhanTileState();
}

class _HapticAdhanTileState extends State<HapticAdhanTile> {
  bool _enabled = false;

  @override
  void initState() {
    super.initState();
    NotificationService.instance.getAdhanHapticMode().then((v) {
      if (mounted) setState(() => _enabled = v);
    });
  }

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      title: const Text('Haptic Mode'),
      subtitle: Text(
        'Vibrate instead of sound during silent hours',
        style: TextStyle(color: Colors.white.withAlpha(100), fontSize: 12),
      ),
      value: _enabled,
      onChanged: (v) {
        setState(() => _enabled = v);
        NotificationService.instance.setAdhanHapticMode(v);
      },
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
              tooltip: l.notifTestAdhan,
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

// ── Sunnah settings section ────────────────────────────────────────────────────

class _SunnahSettingsSection extends StatefulWidget {
  const _SunnahSettingsSection();

  @override
  State<_SunnahSettingsSection> createState() => _SunnahSettingsSectionState();
}

class _SunnahSettingsSectionState extends State<_SunnahSettingsSection> {
  bool _iqamahEnabled = false;
  int _iqamahOffset = 15;
  bool _tahajjudEnabled = false;
  bool _duhaEnabled = false;

  static const _iqamahOffsetOptions = [5, 10, 15, 20, 30];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _iqamahEnabled = prefs.getBool('notif_iqamah_enabled') ?? false;
      _iqamahOffset = prefs.getInt('notif_iqamah_offset') ?? 15;
      _tahajjudEnabled = prefs.getBool('notif_tahajjud_enabled') ?? false;
      _duhaEnabled = prefs.getBool('notif_duha_enabled') ?? false;
    });
  }

  Future<void> _setIqamahEnabled(bool v) async {
    setState(() => _iqamahEnabled = v);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notif_iqamah_enabled', v);
  }

  Future<void> _setIqamahOffset(int v) async {
    setState(() => _iqamahOffset = v);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('notif_iqamah_offset', v);
  }

  Future<void> _setTahajjudEnabled(bool v) async {
    setState(() => _tahajjudEnabled = v);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notif_tahajjud_enabled', v);
  }

  Future<void> _setDuhaEnabled(bool v) async {
    setState(() => _duhaEnabled = v);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notif_duha_enabled', v);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // ── Iqamah reminder ─────────────────────────────────────────────────
        SwitchListTile(
          title: const Text('Iqamah Reminder'),
          subtitle: Text(
            'Notify after adhan begins',
            style: TextStyle(color: Colors.white.withAlpha(100), fontSize: 12),
          ),
          value: _iqamahEnabled,
          onChanged: _setIqamahEnabled,
        ),
        if (_iqamahEnabled)
          ListTile(
            title: const Text('Iqamah delay'),
            subtitle: Text(
              'Notify $_iqamahOffset min after adhan',
              style: TextStyle(color: Colors.white.withAlpha(100), fontSize: 12),
            ),
            trailing: DropdownButton<int>(
              value: _iqamahOffsetOptions.contains(_iqamahOffset)
                  ? _iqamahOffset
                  : 15,
              underline: const SizedBox.shrink(),
              items: _iqamahOffsetOptions
                  .map((m) => DropdownMenuItem(
                        value: m,
                        child: Text('$m min'),
                      ))
                  .toList(),
              onChanged: (v) {
                if (v != null) _setIqamahOffset(v);
              },
            ),
          ),

        // ── Tahajjud ────────────────────────────────────────────────────────
        SwitchListTile(
          title: const Text('Tahajjud'),
          subtitle: Text(
            'Last third of the night',
            style: TextStyle(color: Colors.white.withAlpha(100), fontSize: 12),
          ),
          value: _tahajjudEnabled,
          onChanged: _setTahajjudEnabled,
        ),

        // ── Duha ────────────────────────────────────────────────────────────
        SwitchListTile(
          title: const Text('Duha'),
          subtitle: Text(
            '20 min after sunrise',
            style: TextStyle(color: Colors.white.withAlpha(100), fontSize: 12),
          ),
          value: _duhaEnabled,
          onChanged: _setDuhaEnabled,
        ),
      ],
    );
  }
}
