import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/providers/smart_home_provider.dart';
import '../../core/providers/subscription_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/services/smart_home_api_service.dart';
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
    final l = AppLocalizations.of(context)!;
    final sub = ref.watch(subscriptionProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l.smartHomeTitle)),
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
    final l = AppLocalizations.of(context)!;
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
            Text(l.smartHomeRequiresPlus,
                style: theme.textTheme.titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold),
                textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(
              l.smartHomeRequiresPlusDesc,
              style: theme.textTheme.bodyMedium
                  ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () => context.push(Routes.subscription),
              icon: const Icon(Icons.workspace_premium),
              label: Text(l.subscriptionUpgrade),
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
    final l = AppLocalizations.of(context)!;
    final sh = ref.watch(_smartHomeProvider);
    final notifier = ref.read(_smartHomeProvider.notifier);
    final intState = ref.watch(integrationsProvider);

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      children: [
        // ── Integrations ──────────────────────────────────────────────────
        _SectionHeader(l.smartHomeIntegrations),
        if (intState.isLoading)
          const Padding(
            padding: EdgeInsets.all(20),
            child: Center(child: CircularProgressIndicator()),
          )
        else if (intState.error != null)
          _ErrorCard(
            message: intState.error!,
            onRetry: () => ref.read(integrationsProvider.notifier).load(),
          )
        else ...[
          _IntegrationCardLive(
            icon: Icons.home,
            iconColor: const Color(0xFF4285F4),
            name: l.smartHomeGoogleHome,
            description: l.smartHomeBroadcastGoogle,
            platform: 'google-home',
            oauthUrl: 'https://api.praycalc.com/integrations/google-home/auth',
          ),
          const SizedBox(height: 10),
          _IntegrationCardLive(
            icon: Icons.speaker,
            iconColor: const Color(0xFF00CAFF),
            name: l.smartHomeAlexa,
            description: l.smartHomeEnableAlexa,
            platform: 'alexa',
            oauthUrl: 'https://api.praycalc.com/integrations/alexa/auth',
          ),
          const SizedBox(height: 10),
          _IntegrationCardLive(
            icon: Icons.phone_iphone,
            iconColor: const Color(0xFF007AFF),
            name: l.smartHomeSiri,
            description: l.smartHomeSiriAsk,
            platform: 'siri',
            isManualSetup: true,
            onSetup: () => _showSiriInstructions(context),
          ),
          const SizedBox(height: 10),
          _IntegrationCardLive(
            icon: Icons.home_filled,
            iconColor: const Color(0xFF34C759),
            name: 'Apple Home',
            description: 'Play adhan and automate lights via HomeKit',
            platform: 'homekit',
            isManualSetup: true,
            onSetup: () => _showHomeKitInstructions(context),
          ),
          const SizedBox(height: 10),
          _IntegrationCardLive(
            icon: Icons.developer_board,
            iconColor: const Color(0xFF41BDF5),
            name: l.smartHomeHomeAssistant,
            description: l.smartHomeHassAdd,
            platform: 'home-assistant',
            isManualSetup: true,
            onSetup: () => _showHassInstructions(context),
          ),
        ],

        const SizedBox(height: 24),

        // ── Devices ───────────────────────────────────────────────────────
        _SectionHeader(l.smartHomeLinkedSpeakers),
        const _DevicesSection(),

        const SizedBox(height: 24),

        // ── Alert display ─────────────────────────────────────────────────
        _SectionHeader(l.smartHomeAlertDisplay),
        _SegmentRow<int>(
          label: l.smartHomeAtAdhanShow,
          options: [
            _Opt(0, Icons.open_in_full, l.smartHomeAlertModal),
            _Opt(1, Icons.notification_important_outlined, l.smartHomeAlertCorner),
            _Opt(2, Icons.notifications_off_outlined, l.smartHomeAlertNone),
          ],
          selected: sh.alertType,
          onChanged: notifier.setAlertType,
        ),
        const SizedBox(height: 8),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(l.smartHomePauseMediaTitle),
          subtitle: Text(l.smartHomePauseMediaSubtitle),
          value: sh.pauseMedia,
          onChanged: notifier.setPauseMedia,
        ),

        const SizedBox(height: 16),

        // ── Per-prayer audio ──────────────────────────────────────────────
        _SectionHeader(l.smartHomePrayerAudioSection),
        ..._prayers.map((prayer) => _PrayerAudioRow(
              prayer: prayer,
              value: sh.audioFor(prayer),
              onChanged: (v) => notifier.setPrayerAudio(prayer, v),
            )),

        const SizedBox(height: 16),

        // ── Quiet hours ───────────────────────────────────────────────────
        _SectionHeader(l.smartHomeQuietHoursSection),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(l.smartHomeEnableQuietHours),
          subtitle: Text(l.smartHomeQuietHoursSubtitle),
          value: sh.quietEnabled,
          onChanged: notifier.setQuietEnabled,
        ),
        if (sh.quietEnabled) ...[
          _TimeRow(
            label: l.smartHomeQuietFrom,
            time: sh.quietStart,
            onChanged: notifier.setQuietStart,
          ),
          _TimeRow(
            label: l.smartHomeQuietTo,
            time: sh.quietEnd,
            onChanged: notifier.setQuietEnd,
          ),
        ],
        const SizedBox(height: 32),
      ],
    );
  }

  void _showSiriInstructions(BuildContext context) {
    final l = AppLocalizations.of(context)!;
    _showInstructionsSheet(
      context,
      title: l.smartHomeSiriSetupTitle,
      steps: [
        l.smartHomeSiriStep1,
        l.smartHomeSiriStep2,
        l.smartHomeSiriStep3,
        l.smartHomeSiriStep4,
        l.smartHomeSiriStep5,
        l.smartHomeSiriStep6,
      ],
      footnote: l.smartHomeSiriFootnote,
    );
  }

  void _showHomeKitInstructions(BuildContext context) {
    _showInstructionsSheet(
      context,
      title: 'Apple Home Setup',
      steps: const [
        'Install the PrayCalc Homebridge plugin on your Home hub or Mac:\n'
            'npm install -g homebridge-praycalc',
        'Add PrayCalc to Homebridge config with your API key from Settings → Account.',
        'Open the Home app, tap +, and scan the Homebridge QR code to add PrayCalc accessories.',
        'Create automations in the Home app triggered by the PrayCalc prayer-time sensors.',
      ],
    );
  }

  void _showHassInstructions(BuildContext context) {
    final l = AppLocalizations.of(context)!;
    _showInstructionsSheet(
      context,
      title: l.smartHomeHassSetupTitle,
      steps: [
        l.smartHomeHassStep1,
        l.smartHomeHassStep2,
        l.smartHomeHassStep3,
        l.smartHomeHassStep4,
        l.smartHomeHassStep5,
        l.smartHomeHassStep6,
      ],
      footnote: l.smartHomeHassFootnote,
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

// ─── Integration card (live API) ─────────────────────────────────────────────

class _IntegrationCardLive extends ConsumerWidget {
  const _IntegrationCardLive({
    required this.icon,
    required this.iconColor,
    required this.name,
    required this.description,
    required this.platform,
    this.oauthUrl,
    this.isManualSetup = false,
    this.onSetup,
  });

  final IconData icon;
  final Color iconColor;
  final String name;
  final String description;
  final String platform;
  final String? oauthUrl;
  final bool isManualSetup;
  final VoidCallback? onSetup;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final intState = ref.watch(integrationsProvider);
    final isLinked = intState.isConnected(platform);
    final testResult = intState.testResults[platform]; // null=testing, true/false

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

                  // Test result feedback
                  if (intState.testResults.containsKey(platform)) ...[
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: testResult == null
                          ? Row(
                              children: [
                                const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                ),
                                const SizedBox(width: 8),
                                Text(l.smartHomeTesting,
                                    style: theme.textTheme.bodySmall),
                              ],
                            )
                          : Row(
                              children: [
                                Icon(
                                  testResult
                                      ? Icons.check_circle
                                      : Icons.error_outline,
                                  size: 16,
                                  color: testResult
                                      ? PrayCalcColors.mid
                                      : Colors.red[400],
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    testResult
                                        ? l.smartHomeTestSuccess
                                        : l.smartHomeTestFailed,
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: testResult
                                          ? PrayCalcColors.mid
                                          : Colors.red[400],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ],

                  // Action buttons
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      if (isLinked) ...[
                        SizedBox(
                          height: 34,
                          child: OutlinedButton(
                            onPressed: () => ref
                                .read(integrationsProvider.notifier)
                                .unlink(platform),
                            child: Text(l.smartHomeUnlink),
                          ),
                        ),
                        SizedBox(
                          height: 34,
                          child: FilledButton.tonal(
                            onPressed: () => ref
                                .read(integrationsProvider.notifier)
                                .testConnection(platform),
                            child: Text(l.smartHomeTestConnection),
                          ),
                        ),
                      ] else ...[
                        SizedBox(
                          height: 34,
                          child: FilledButton.tonal(
                            onPressed: isManualSetup
                                ? onSetup
                                : () => _launchOAuth(context, oauthUrl!),
                            child: Text(isManualSetup
                                ? l.smartHomeSetupGuide
                                : l.smartHomeLinkAccount),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _launchOAuth(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
    } else if (context.mounted) {
      final l = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l.smartHomeCouldNotOpen)),
      );
    }
  }
}

// ─── Devices section (live API) ──────────────────────────────────────────────

class _DevicesSection extends ConsumerWidget {
  const _DevicesSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final devState = ref.watch(devicesProvider);

    if (devState.isLoading) {
      return const Padding(
        padding: EdgeInsets.all(20),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (devState.error != null) {
      return _ErrorCard(
        message: devState.error!,
        onRetry: () => ref.read(devicesProvider.notifier).load(),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (devState.devices.isEmpty)
          Container(
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
                      Text(l.smartHomeNoDevices,
                          style: theme.textTheme.titleSmall
                              ?.copyWith(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text(
                        l.smartHomeNoDevicesDesc,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          )
        else
          ...devState.devices.map((device) => _DeviceCard(device: device)),

        const SizedBox(height: 12),
        Center(
          child: FilledButton.icon(
            onPressed: () => _showAddDeviceDialog(context, ref),
            icon: const Icon(Icons.add, size: 18),
            label: Text(l.smartHomeAddDevice),
            style: FilledButton.styleFrom(
              minimumSize: const Size(180, 40),
            ),
          ),
        ),
      ],
    );
  }

  void _showAddDeviceDialog(BuildContext context, WidgetRef ref) {
    final l = AppLocalizations.of(context)!;
    final nameController = TextEditingController();
    String selectedType = 'speaker';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          title: Text(l.smartHomeAddDevice),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: InputDecoration(
                  labelText: l.smartHomeDeviceName,
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: selectedType,
                decoration: InputDecoration(
                  labelText: l.smartHomeDeviceType,
                  border: const OutlineInputBorder(),
                ),
                items: [
                  DropdownMenuItem(value: 'tv', child: Text(l.smartHomeDeviceTypeTv)),
                  DropdownMenuItem(value: 'speaker', child: Text(l.smartHomeDeviceTypeSpeaker)),
                  DropdownMenuItem(value: 'watch', child: Text(l.smartHomeDeviceTypeWatch)),
                  DropdownMenuItem(value: 'desktop', child: Text(l.smartHomeDeviceTypeDesktop)),
                  DropdownMenuItem(value: 'other', child: Text(l.smartHomeDeviceTypeOther)),
                ],
                onChanged: (v) => setState(() => selectedType = v ?? 'speaker'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: Text(MaterialLocalizations.of(ctx).cancelButtonLabel),
            ),
            FilledButton(
              onPressed: () {
                final name = nameController.text.trim();
                if (name.isEmpty) return;
                ref.read(devicesProvider.notifier).addDevice(
                      name: name,
                      type: selectedType,
                    );
                Navigator.of(ctx).pop();
              },
              child: Text(l.smartHomeAddDevice),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Device card ─────────────────────────────────────────────────────────────

class _DeviceCard extends ConsumerWidget {
  const _DeviceCard({required this.device});
  final SmartHomeDevice device;

  IconData get _deviceIcon {
    switch (device.type) {
      case 'tv': return Icons.tv;
      case 'speaker': return Icons.speaker;
      case 'watch': return Icons.watch;
      case 'desktop': return Icons.desktop_windows;
      default: return Icons.devices_other;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ExpansionTile(
        leading: Icon(_deviceIcon, color: PrayCalcColors.mid),
        title: Row(
          children: [
            Expanded(
              child: Text(device.name,
                  style: theme.textTheme.titleSmall
                      ?.copyWith(fontWeight: FontWeight.w600)),
            ),
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: device.online ? PrayCalcColors.mid : Colors.grey,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              device.online ? l.smartHomeDeviceOnline : l.smartHomeDeviceOffline,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Adhan toggle (PC-093-3.2) ────────────────────────
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(l.smartHomeDeviceAdhan),
                  subtitle: Text(l.smartHomeDeviceAdhanDesc),
                  value: device.adhanEnabled,
                  onChanged: (v) => ref
                      .read(devicesProvider.notifier)
                      .updateDeviceSettings(
                        id: device.id,
                        adhanEnabled: v,
                      ),
                ),

                if (device.adhanEnabled) ...[
                  const Divider(),

                  // ── Volume (PC-093-3.3) ────────────────────────────
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        Text(l.smartHomeDeviceVolume,
                            style: theme.textTheme.bodyMedium),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Slider(
                            value: device.volumeLevel.toDouble(),
                            min: 0,
                            max: 100,
                            divisions: 20,
                            label: '${device.volumeLevel}%',
                            onChanged: (v) => ref
                                .read(devicesProvider.notifier)
                                .updateDeviceSettings(
                                  id: device.id,
                                  volumeLevel: v.round(),
                                ),
                          ),
                        ),
                        SizedBox(
                          width: 40,
                          child: Text('${device.volumeLevel}%',
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodySmall),
                        ),
                      ],
                    ),
                  ),

                  // ── Audio type (PC-093-3.3) ────────────────────────
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(l.smartHomeDeviceAudioType,
                            style: theme.textTheme.bodyMedium),
                        const SizedBox(height: 8),
                        _SegmentRow<int>(
                          label: '',
                          options: [
                            _Opt(0, Icons.volume_up, l.smartHomeAudioAdhan),
                            _Opt(1, Icons.notifications, l.smartHomeAudioBeep),
                            _Opt(2, Icons.volume_off, l.smartHomeAudioSilent),
                          ],
                          selected: device.audioType,
                          onChanged: (v) => ref
                              .read(devicesProvider.notifier)
                              .updateDeviceSettings(
                                id: device.id,
                                audioType: v,
                              ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 8),

                  // ── Enabled prayers (PC-093-3.3) ───────────────────
                  Text(l.smartHomeDeviceEnabledPrayers,
                      style: theme.textTheme.bodyMedium),
                  const SizedBox(height: 4),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
                        .map((prayer) {
                      final enabled = device.enabledPrayers.contains(prayer);
                      return FilterChip(
                        label: Text(prayer),
                        selected: enabled,
                        onSelected: (v) {
                          final updated = List<String>.from(device.enabledPrayers);
                          if (v) {
                            if (!updated.contains(prayer)) updated.add(prayer);
                          } else {
                            updated.remove(prayer);
                          }
                          ref
                              .read(devicesProvider.notifier)
                              .updateDeviceSettings(
                                id: device.id,
                                enabledPrayers: updated,
                              );
                        },
                      );
                    }).toList(),
                  ),
                ],

                const SizedBox(height: 12),
                // ── Delete device button ─────────────────────────────
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton.icon(
                    onPressed: () => _confirmDelete(context, ref),
                    icon: const Icon(Icons.delete_outline, size: 18,
                        color: Colors.red),
                    label: Text(l.smartHomeDeleteDevice,
                        style: const TextStyle(color: Colors.red)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, WidgetRef ref) {
    final l = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l.smartHomeDeleteDeviceConfirm),
        content: Text(device.name),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(MaterialLocalizations.of(ctx).cancelButtonLabel),
          ),
          FilledButton(
            onPressed: () {
              ref.read(devicesProvider.notifier).deleteDevice(device.id);
              Navigator.of(ctx).pop();
            },
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: Text(l.smartHomeDeleteDevice),
          ),
        ],
      ),
    );
  }
}

// ─── Error card ──────────────────────────────────────────────────────────────

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message, this.onRetry});
  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.withAlpha(20),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.withAlpha(60)),
      ),
      child: Column(
        children: [
          Text(message,
              style: theme.textTheme.bodySmall
                  ?.copyWith(color: Colors.red[300])),
          if (onRetry != null) ...[
            const SizedBox(height: 8),
            TextButton(
              onPressed: onRetry,
              child: const Text('Retry'),
            ),
          ],
        ],
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
          if (label.isNotEmpty)
            Text(label, style: theme.textTheme.bodyMedium),
          if (label.isNotEmpty)
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
    final l = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final audioLabels = [l.smartHomeAudioAdhan, l.smartHomeAudioBeep, l.smartHomeAudioSilent];
    const audioIcons = [
      Icons.volume_up_outlined,
      Icons.notifications_outlined,
      Icons.volume_off_outlined,
    ];
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
                            Icon(audioIcons[i],
                                size: 14,
                                color: sel
                                    ? PrayCalcColors.light
                                    : theme.colorScheme.onSurfaceVariant),
                            const SizedBox(width: 4),
                            Text(
                              audioLabels[i],
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

// ─── Status badge ────────────────────────────────────────────────────────────

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.isLinked});
  final bool isLinked;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context)!;
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
        isLinked ? l.smartHomeLinkedStatus : l.smartHomeNotLinkedStatus,
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
    final l = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l.smartHomeApiKey,
            style: Theme.of(context)
                .textTheme
                .titleSmall
                ?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        FilledButton.tonal(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(l.smartHomeApiKeyNotReady),
              ),
            );
          },
          child: Text(l.smartHomeGenerateApiKey),
        ),
        const SizedBox(height: 8),
        Text(
          l.smartHomeApiKeyDesc,
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
