import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/providers/subscription_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';

// ─── Prefs keys ───────────────────────────────────────────────────────────────

const _kAlertType         = 'sh_alert_type';       // 0=modal 1=corner 2=none
const _kPauseMedia        = 'sh_pause_media';
const _kQuietEnabled      = 'sh_quiet_enabled';
const _kQuietStartH       = 'sh_quiet_start_h';
const _kQuietStartM       = 'sh_quiet_start_m';
const _kQuietEndH         = 'sh_quiet_end_h';
const _kQuietEndM         = 'sh_quiet_end_m';
// Per-prayer audio: 0=adhan 1=beep 2=silent  keys: sh_audio_fajr, sh_audio_dhuhr, etc.

const _prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
String _audioKey(String p) => 'sh_audio_${p.toLowerCase()}';

// ─── State model ──────────────────────────────────────────────────────────────

class _SmartHomeState {
  final int alertType;         // 0=modal 1=corner 2=none
  final bool pauseMedia;
  final bool quietEnabled;
  final TimeOfDay quietStart;
  final TimeOfDay quietEnd;
  final Map<String, int> prayerAudio; // prayer → 0=adhan 1=beep 2=silent

  const _SmartHomeState({
    this.alertType = 1,
    this.pauseMedia = false,
    this.quietEnabled = false,
    this.quietStart = const TimeOfDay(hour: 23, minute: 0),
    this.quietEnd = const TimeOfDay(hour: 5, minute: 0),
    this.prayerAudio = const {},
  });

  _SmartHomeState copyWith({
    int? alertType,
    bool? pauseMedia,
    bool? quietEnabled,
    TimeOfDay? quietStart,
    TimeOfDay? quietEnd,
    Map<String, int>? prayerAudio,
  }) =>
      _SmartHomeState(
        alertType: alertType ?? this.alertType,
        pauseMedia: pauseMedia ?? this.pauseMedia,
        quietEnabled: quietEnabled ?? this.quietEnabled,
        quietStart: quietStart ?? this.quietStart,
        quietEnd: quietEnd ?? this.quietEnd,
        prayerAudio: prayerAudio ?? this.prayerAudio,
      );

  int audioFor(String prayer) => prayerAudio[prayer] ?? 0;
}

// ─── Notifier ─────────────────────────────────────────────────────────────────

class _SmartHomeNotifier extends Notifier<_SmartHomeState> {
  @override
  _SmartHomeState build() {
    Future.microtask(_load);
    return const _SmartHomeState();
  }

  Future<void> _load() async {
    final p = await SharedPreferences.getInstance();
    final audio = <String, int>{};
    for (final prayer in _prayers) {
      audio[prayer] = p.getInt(_audioKey(prayer)) ?? 0;
    }
    state = _SmartHomeState(
      alertType: p.getInt(_kAlertType) ?? 1,
      pauseMedia: p.getBool(_kPauseMedia) ?? false,
      quietEnabled: p.getBool(_kQuietEnabled) ?? false,
      quietStart: TimeOfDay(
        hour: p.getInt(_kQuietStartH) ?? 23,
        minute: p.getInt(_kQuietStartM) ?? 0,
      ),
      quietEnd: TimeOfDay(
        hour: p.getInt(_kQuietEndH) ?? 5,
        minute: p.getInt(_kQuietEndM) ?? 0,
      ),
      prayerAudio: audio,
    );
  }

  Future<void> _save() async {
    final p = await SharedPreferences.getInstance();
    await p.setInt(_kAlertType, state.alertType);
    await p.setBool(_kPauseMedia, state.pauseMedia);
    await p.setBool(_kQuietEnabled, state.quietEnabled);
    await p.setInt(_kQuietStartH, state.quietStart.hour);
    await p.setInt(_kQuietStartM, state.quietStart.minute);
    await p.setInt(_kQuietEndH, state.quietEnd.hour);
    await p.setInt(_kQuietEndM, state.quietEnd.minute);
    for (final prayer in _prayers) {
      await p.setInt(_audioKey(prayer), state.audioFor(prayer));
    }
  }

  void setAlertType(int v) {
    state = state.copyWith(alertType: v);
    _save();
  }

  void setPauseMedia(bool v) {
    state = state.copyWith(pauseMedia: v);
    _save();
  }

  void setQuietEnabled(bool v) {
    state = state.copyWith(quietEnabled: v);
    _save();
  }

  void setQuietStart(TimeOfDay v) {
    state = state.copyWith(quietStart: v);
    _save();
  }

  void setQuietEnd(TimeOfDay v) {
    state = state.copyWith(quietEnd: v);
    _save();
  }

  void setPrayerAudio(String prayer, int v) {
    final updated = Map<String, int>.from(state.prayerAudio)..[prayer] = v;
    state = state.copyWith(prayerAudio: updated);
    _save();
  }
}

final _smartHomeProvider =
    NotifierProvider<_SmartHomeNotifier, _SmartHomeState>(
  _SmartHomeNotifier.new,
);

// ─── Screen ───────────────────────────────────────────────────────────────────

class SmartHomeSettingsScreen extends ConsumerWidget {
  const SmartHomeSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sub = ref.watch(subscriptionProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Smart Home')),
      body: sub.isPlus
          ? const _SmartHomeBody()
          : const _UpgradePrompt(),
    );
  }
}

// ─── Upgrade prompt ───────────────────────────────────────────────────────────

class _UpgradePrompt extends StatelessWidget {
  const _UpgradePrompt();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.lock_outline, size: 64,
                color: theme.colorScheme.onSurfaceVariant),
            const SizedBox(height: 16),
            Text('Smart Home requires Ummat+',
                style: theme.textTheme.titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(
              'Control prayer announcements on Google Home, Alexa, '
              'Siri, and Home Assistant. Configure which devices play '
              'adhan, when to pause media, and set quiet hours.',
              style: theme.textTheme.bodyMedium
                  ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () => context.push(Routes.subscription),
              icon: const Icon(Icons.workspace_premium),
              label: const Text('Upgrade to Ummat+'),
              style: FilledButton.styleFrom(minimumSize: const Size(200, 48)),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Main body ────────────────────────────────────────────────────────────────

class _SmartHomeBody extends ConsumerWidget {
  const _SmartHomeBody();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sh = ref.watch(_smartHomeProvider);
    final notifier = ref.read(_smartHomeProvider.notifier);

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      children: [
        // ── Integrations ──────────────────────────────────────────────────
        _SectionHeader('Integrations'),
        _IntegrationCard(
          icon: Icons.home,
          iconColor: const Color(0xFF4285F4),
          name: 'Google Home',
          description: 'Broadcast adhan on Nest speakers and displays.',
          status: _IntegrationStatus.notLinked,
          actionLabel: 'Link account',
          onAction: () => _launchOAuth(
            context,
            'https://api.praycalc.com/integrations/google-home/auth',
          ),
        ),
        const SizedBox(height: 10),
        _IntegrationCard(
          icon: Icons.speaker,
          iconColor: const Color(0xFF00CAFF),
          name: 'Amazon Alexa',
          description: 'Enable the PrayCalc skill on Alexa.',
          status: _IntegrationStatus.notLinked,
          actionLabel: 'Link account',
          onAction: () => _launchOAuth(
            context,
            'https://api.praycalc.com/integrations/alexa/auth',
          ),
        ),
        const SizedBox(height: 10),
        _IntegrationCard(
          icon: Icons.phone_iphone,
          iconColor: const Color(0xFF007AFF),
          name: 'Siri Shortcuts',
          description: 'Ask Siri for prayer times or set automations.',
          status: _IntegrationStatus.notLinked,
          actionLabel: 'Setup guide',
          onAction: () => _showSiriInstructions(context),
        ),
        const SizedBox(height: 10),
        _IntegrationCard(
          icon: Icons.developer_board,
          iconColor: const Color(0xFF41BDF5),
          name: 'Home Assistant',
          description: 'Add via HACS for full automation support.',
          status: _IntegrationStatus.notLinked,
          actionLabel: 'Setup guide',
          onAction: () => _showHassInstructions(context),
        ),

        const SizedBox(height: 24),

        // ── Devices ───────────────────────────────────────────────────────
        _SectionHeader('Linked Speakers & Displays'),
        _DevicesPlaceholder(),

        const SizedBox(height: 24),

        // ── Alert display ─────────────────────────────────────────────────
        _SectionHeader('Alert Display'),
        _SegmentRow<int>(
          label: 'At adhan time show',
          options: const [
            _Opt(0, Icons.open_in_full, 'Modal'),
            _Opt(1, Icons.notification_important_outlined, 'Corner'),
            _Opt(2, Icons.notifications_off_outlined, 'None'),
          ],
          selected: sh.alertType,
          onChanged: notifier.setAlertType,
        ),
        const SizedBox(height: 8),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Pause media at adhan'),
          subtitle: const Text('Resumes after the adhan ends'),
          value: sh.pauseMedia,
          onChanged: notifier.setPauseMedia,
        ),

        const SizedBox(height: 16),

        // ── Per-prayer audio ──────────────────────────────────────────────
        _SectionHeader('Prayer Audio'),
        ..._prayers.map((prayer) => _PrayerAudioRow(
              prayer: prayer,
              value: sh.audioFor(prayer),
              onChanged: (v) => notifier.setPrayerAudio(prayer, v),
            )),

        const SizedBox(height: 16),

        // ── Quiet hours ───────────────────────────────────────────────────
        _SectionHeader('Quiet Hours'),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Enable quiet hours'),
          subtitle: const Text('All smart home alerts are silenced'),
          value: sh.quietEnabled,
          onChanged: notifier.setQuietEnabled,
        ),
        if (sh.quietEnabled) ...[
          _TimeRow(
            label: 'From',
            time: sh.quietStart,
            onChanged: notifier.setQuietStart,
          ),
          _TimeRow(
            label: 'To',
            time: sh.quietEnd,
            onChanged: notifier.setQuietEnd,
          ),
        ],
        const SizedBox(height: 32),
      ],
    );
  }

  Future<void> _launchOAuth(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
    } else if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open the link.')),
      );
    }
  }

  void _showSiriInstructions(BuildContext context) {
    _showInstructionsSheet(
      context,
      title: 'Siri Shortcuts Setup',
      steps: const [
        'Open the Shortcuts app on your iPhone or iPad.',
        'Tap "+" to create a new shortcut.',
        'Search for "PrayCalc" in the actions list.',
        'Add "Next Prayer Time" or "Prayer Times Today".',
        'Optionally add it to an automation (e.g. daily at Fajr).',
        'Say "Hey Siri, next prayer time" to test.',
      ],
      footnote: 'Requires iOS 16 or later.',
    );
  }

  void _showHassInstructions(BuildContext context) {
    _showInstructionsSheet(
      context,
      title: 'Home Assistant Setup',
      steps: const [
        'Install HACS (Home Assistant Community Store).',
        'In HACS, search for "PrayCalc" and install.',
        'Go to Settings > Devices & Services > Add Integration.',
        'Search for "PrayCalc" and select it.',
        'Enter your PrayCalc API key (generated in your account).',
        'Configure your location and calculation method.',
      ],
      footnote: 'Requires Home Assistant 2024.1+ with HACS.',
      extraWidget: _ApiKeyButton(),
    );
  }

  void _showInstructionsSheet(
    BuildContext context, {
    required String title,
    required List<String> steps,
    String? footnote,
    Widget? extraWidget,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.65,
        maxChildSize: 0.85,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.all(24),
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[400],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(title,
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ...steps.asMap().entries.map(
                  (e) => _InstructionStep('${e.key + 1}', e.value),
                ),
            if (extraWidget != null) ...[
              const SizedBox(height: 8),
              extraWidget,
            ],
            if (footnote != null) ...[
              const SizedBox(height: 16),
              Text(
                footnote,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  fontSize: 13,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Section header ───────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.title);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}

// ─── Devices placeholder ──────────────────────────────────────────────────────

class _DevicesPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withAlpha(80),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outlineVariant.withAlpha(80),
        ),
      ),
      child: Row(
        children: [
          Icon(Icons.devices_outlined,
              size: 32, color: theme.colorScheme.onSurfaceVariant),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('No devices linked yet',
                    style: theme.textTheme.titleSmall
                        ?.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(
                  'Link Google Home or Alexa above, then your speakers '
                  'and displays will appear here.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Segment row (alert type selector) ───────────────────────────────────────

class _Opt<T> {
  final T value;
  final IconData icon;
  final String label;
  const _Opt(this.value, this.icon, this.label);
}

class _SegmentRow<T> extends StatelessWidget {
  const _SegmentRow({
    required this.label,
    required this.options,
    required this.selected,
    required this.onChanged,
  });

  final String label;
  final List<_Opt<T>> options;
  final T selected;
  final void Function(T) onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: theme.textTheme.bodyMedium),
          const SizedBox(height: 8),
          Row(
            children: options.map((opt) {
              final isSelected = opt.value == selected;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: InkWell(
                    onTap: () => onChanged(opt.value),
                    borderRadius: BorderRadius.circular(10),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(
                          vertical: 10, horizontal: 4),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? PrayCalcColors.dark
                            : theme.colorScheme.surfaceContainerHighest
                                .withAlpha(120),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected
                              ? PrayCalcColors.mid
                              : theme.colorScheme.outlineVariant.withAlpha(80),
                        ),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            opt.icon,
                            size: 20,
                            color: isSelected
                                ? PrayCalcColors.light
                                : theme.colorScheme.onSurfaceVariant,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            opt.label,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                              color: isSelected
                                  ? PrayCalcColors.light
                                  : theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

// ─── Per-prayer audio row ─────────────────────────────────────────────────────

const _audioLabels = ['Adhan', 'Beep', 'Silent'];
const _audioIcons = [
  Icons.volume_up_outlined,
  Icons.notifications_outlined,
  Icons.volume_off_outlined,
];

class _PrayerAudioRow extends StatelessWidget {
  const _PrayerAudioRow({
    required this.prayer,
    required this.value,
    required this.onChanged,
  });

  final String prayer;
  final int value;
  final void Function(int) onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          SizedBox(
            width: 72,
            child: Text(prayer,
                style:
                    theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
          ),
          Expanded(
            child: Row(
              children: List.generate(3, (i) {
                final sel = value == i;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    child: InkWell(
                      onTap: () => onChanged(i),
                      borderRadius: BorderRadius.circular(8),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(vertical: 7),
                        decoration: BoxDecoration(
                          color: sel
                              ? PrayCalcColors.dark
                              : theme.colorScheme.surfaceContainerHighest
                                  .withAlpha(80),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: sel
                                ? PrayCalcColors.mid
                                : theme.colorScheme.outlineVariant
                                    .withAlpha(60),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(_audioIcons[i],
                                size: 14,
                                color: sel
                                    ? PrayCalcColors.light
                                    : theme.colorScheme.onSurfaceVariant),
                            const SizedBox(width: 4),
                            Text(
                              _audioLabels[i],
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: sel
                                    ? FontWeight.w600
                                    : FontWeight.normal,
                                color: sel
                                    ? PrayCalcColors.light
                                    : theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Time row ─────────────────────────────────────────────────────────────────

class _TimeRow extends StatelessWidget {
  const _TimeRow({
    required this.label,
    required this.time,
    required this.onChanged,
  });

  final String label;
  final TimeOfDay time;
  final void Function(TimeOfDay) onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(label),
      trailing: InkWell(
        onTap: () async {
          final picked = await showTimePicker(
            context: context,
            initialTime: time,
          );
          if (picked != null) onChanged(picked);
        },
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest.withAlpha(120),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: theme.colorScheme.outlineVariant.withAlpha(80),
            ),
          ),
          child: Text(
            time.format(context),
            style: theme.textTheme.bodyMedium
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
        ),
      ),
    );
  }
}

// ─── Integration card ─────────────────────────────────────────────────────────

enum _IntegrationStatus { linked, notLinked }

class _IntegrationCard extends StatelessWidget {
  const _IntegrationCard({
    required this.icon,
    required this.iconColor,
    required this.name,
    required this.description,
    required this.status,
    required this.actionLabel,
    required this.onAction,
  });

  final IconData icon;
  final Color iconColor;
  final String name;
  final String description;
  final _IntegrationStatus status;
  final String actionLabel;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLinked = status == _IntegrationStatus.linked;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: iconColor.withAlpha(30),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(name,
                          style: theme.textTheme.titleSmall
                              ?.copyWith(fontWeight: FontWeight.w600)),
                      const SizedBox(width: 8),
                      _StatusBadge(isLinked: isLinked),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(description,
                      style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant)),
                  const SizedBox(height: 10),
                  SizedBox(
                    height: 34,
                    child: isLinked
                        ? OutlinedButton(
                            onPressed: onAction,
                            child: const Text('Unlink'),
                          )
                        : FilledButton.tonal(
                            onPressed: onAction,
                            child: Text(actionLabel),
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.isLinked});
  final bool isLinked;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: isLinked
            ? PrayCalcColors.mid.withAlpha(40)
            : theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        isLinked ? 'Linked' : 'Not linked',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: isLinked
              ? PrayCalcColors.mid
              : theme.colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}

// ─── API key button (Home Assistant sheet) ────────────────────────────────────

class _ApiKeyButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('API Key',
            style: Theme.of(context)
                .textTheme
                .titleSmall
                ?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        FilledButton.tonal(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'API key generation will be available once the '
                  'PrayCalc smart service is deployed.',
                ),
              ),
            );
          },
          child: const Text('Generate API Key'),
        ),
        const SizedBox(height: 8),
        Text(
          'You will need an API key to connect Home Assistant '
          'to your PrayCalc account.',
          style: TextStyle(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
            fontSize: 13,
          ),
        ),
      ],
    );
  }
}

// ─── Instruction step ─────────────────────────────────────────────────────────

class _InstructionStep extends StatelessWidget {
  const _InstructionStep(this.number, this.text);
  final String number;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 26,
            height: 26,
            decoration: BoxDecoration(
              color: PrayCalcColors.dark,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              number,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 3),
              child: Text(text, style: const TextStyle(fontSize: 15)),
            ),
          ),
        ],
      ),
    );
  }
}
