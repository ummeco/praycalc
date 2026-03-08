import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/alert_config.dart';
import '../../core/services/adhan_service.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/notification_model.dart';

/// Alert settings screen: configure per-prayer alert overlays and audio.
///
/// Shared between TV and desktop via responsive layout. On TV-sized screens,
/// uses larger fonts and D-pad-friendly focus navigation. On smaller screens,
/// uses standard Material list tiles.
class AlertSettingsScreen extends ConsumerWidget {
  const AlertSettingsScreen({super.key});

  static const _prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  static const _prayerLabels = {
    'fajr': 'Fajr',
    'dhuhr': 'Dhuhr',
    'asr': 'Asr',
    'maghrib': 'Maghrib',
    'isha': 'Isha',
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertSettings = ref.watch(alertSettingsProvider);
    final notifier = ref.read(alertSettingsProvider.notifier);
    final isTv = MediaQuery.of(context).size.width > 960;

    return Scaffold(
      backgroundColor: isTv ? PrayCalcColors.deep : null,
      appBar: AppBar(
        backgroundColor: isTv ? PrayCalcColors.deep : null,
        foregroundColor: isTv ? Colors.white : null,
        title: Text(
          'Alert Settings',
          style: TextStyle(
            fontSize: isTv ? 32 : 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: FocusTraversalGroup(
        policy: OrderedTraversalPolicy(),
        child: ListView(
          padding: EdgeInsets.symmetric(
            horizontal: isTv ? 48 : 16,
            vertical: isTv ? 24 : 8,
          ),
          children: [
            // ── Global toggles ──
            _SectionHeader(title: 'General', isTv: isTv),
            const SizedBox(height: 8),
            _AlertTile(
              icon: Icons.notifications_active,
              title: 'Enable Alerts',
              subtitle: 'Show prayer time alerts on this device',
              isTv: isTv,
              trailing: Switch(
                value: alertSettings.globalEnabled,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: (v) => notifier.setGlobalEnabled(v),
              ),
              onTap: () =>
                  notifier.setGlobalEnabled(!alertSettings.globalEnabled),
            ),
            const SizedBox(height: 8),
            _AlertTile(
              icon: Icons.pause_circle_outline,
              title: 'Pause Other Media',
              subtitle: 'Pause music/video during adhan playback',
              isTv: isTv,
              trailing: Switch(
                value: alertSettings.mediaPauseEnabled,
                activeThumbColor: PrayCalcColors.mid,
                onChanged: alertSettings.globalEnabled
                    ? (v) => notifier.setMediaPauseEnabled(v)
                    : null,
              ),
              onTap: alertSettings.globalEnabled
                  ? () => notifier.setMediaPauseEnabled(
                      !alertSettings.mediaPauseEnabled)
                  : null,
            ),
            SizedBox(height: isTv ? 24 : 16),

            // ── Per-prayer settings ──
            if (alertSettings.globalEnabled) ...[
              _SectionHeader(title: 'Per-Prayer Settings', isTv: isTv),
              const SizedBox(height: 8),
              for (final prayer in _prayers)
                _PrayerAlertTile(
                  prayer: prayer,
                  label: _prayerLabels[prayer] ?? prayer,
                  config: alertSettings.perPrayer[prayer] ??
                      const PrayerAlertConfig(),
                  isTv: isTv,
                  onConfigChanged: (config) =>
                      notifier.setPrayerConfig(prayer, config),
                ),
              SizedBox(height: isTv ? 24 : 16),

              // ── Preview ──
              _SectionHeader(title: 'Preview', isTv: isTv),
              const SizedBox(height: 8),
              _AlertTile(
                icon: Icons.play_circle_outline,
                title: 'Preview Alert',
                subtitle: 'See and hear what the alert looks like',
                isTv: isTv,
                trailing: Icon(
                  Icons.chevron_right,
                  color: Colors.white54,
                  size: isTv ? 32 : 24,
                ),
                onTap: () => _showPreview(context, alertSettings),
              ),
            ],
            SizedBox(height: isTv ? 48 : 32),
          ],
        ),
      ),
    );
  }

  void _showPreview(BuildContext context, AlertSettings settings) {
    final fajrConfig =
        settings.perPrayer['fajr'] ?? const PrayerAlertConfig();

    showDialog(
      context: context,
      barrierDismissible: true,
      barrierColor: fajrConfig.overlayType == AlertOverlayType.modal
          ? Colors.black.withAlpha(220)
          : Colors.black.withAlpha(100),
      builder: (ctx) => _PreviewDialog(config: fajrConfig),
    );
  }
}

// ── Per-prayer config tile ─────────────────────────────────────────────────

class _PrayerAlertTile extends StatelessWidget {
  const _PrayerAlertTile({
    required this.prayer,
    required this.label,
    required this.config,
    required this.isTv,
    required this.onConfigChanged,
  });

  final String prayer;
  final String label;
  final PrayerAlertConfig config;
  final bool isTv;
  final ValueChanged<PrayerAlertConfig> onConfigChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: ExpansionTile(
        leading: Icon(
          _prayerIcon(prayer),
          color: PrayCalcColors.mid,
          size: isTv ? 32 : 24,
        ),
        title: Text(
          label,
          style: TextStyle(
            color: isTv ? Colors.white : null,
            fontSize: isTv ? 26 : 16,
            fontWeight: FontWeight.w500,
          ),
        ),
        subtitle: Text(
          _configSummary(),
          style: TextStyle(
            color: isTv ? Colors.white54 : Colors.grey,
            fontSize: isTv ? 20 : 12,
          ),
        ),
        children: [
          // Overlay type
          ListTile(
            title: Text(
              'Overlay Type',
              style: TextStyle(fontSize: isTv ? 22 : 14),
            ),
            trailing: DropdownButton<AlertOverlayType>(
              value: config.overlayType,
              underline: const SizedBox.shrink(),
              items: AlertOverlayType.values
                  .map((t) => DropdownMenuItem(
                        value: t,
                        child: Text(_overlayLabel(t)),
                      ))
                  .toList(),
              onChanged: (t) {
                if (t != null) {
                  onConfigChanged(config.copyWith(overlayType: t));
                }
              },
            ),
          ),

          // Audio type
          ListTile(
            title: Text(
              'Audio Type',
              style: TextStyle(fontSize: isTv ? 22 : 14),
            ),
            trailing: DropdownButton<AlertAudioType>(
              value: config.audioType,
              underline: const SizedBox.shrink(),
              items: AlertAudioType.values
                  .map((t) => DropdownMenuItem(
                        value: t,
                        child: Text(_audioLabel(t)),
                      ))
                  .toList(),
              onChanged: (t) {
                if (t != null) {
                  onConfigChanged(config.copyWith(audioType: t));
                }
              },
            ),
          ),

          // Duration slider
          if (config.overlayType != AlertOverlayType.none)
            ListTile(
              title: Text(
                'Duration: ${config.durationSeconds}s',
                style: TextStyle(fontSize: isTv ? 22 : 14),
              ),
              subtitle: Slider(
                value: config.durationSeconds.toDouble(),
                min: 10,
                max: 300,
                divisions: 29,
                label: '${config.durationSeconds}s',
                activeColor: PrayCalcColors.mid,
                onChanged: (v) => onConfigChanged(
                  config.copyWith(durationSeconds: v.round()),
                ),
              ),
            ),

          // Auto-dismiss toggle
          if (config.overlayType != AlertOverlayType.none)
            SwitchListTile(
              title: Text(
                'Auto-dismiss',
                style: TextStyle(fontSize: isTv ? 22 : 14),
              ),
              subtitle: Text(
                'Automatically close the overlay after duration',
                style: TextStyle(fontSize: isTv ? 18 : 12),
              ),
              value: config.autoDismiss,
              activeThumbColor: PrayCalcColors.mid,
              onChanged: (v) =>
                  onConfigChanged(config.copyWith(autoDismiss: v)),
            ),

          // Test audio button
          if (config.audioType != AlertAudioType.silent)
            ListTile(
              title: Text(
                'Test Audio',
                style: TextStyle(fontSize: isTv ? 22 : 14),
              ),
              trailing: IconButton(
                icon: Icon(
                  Icons.play_arrow,
                  color: PrayCalcColors.mid,
                  size: isTv ? 32 : 24,
                ),
                onPressed: () {
                  final adhanType = config.audioType == AlertAudioType.adhan
                      ? AdhanType.makkah
                      : AdhanType.beep;
                  AdhanService.instance.play(adhanType);
                },
              ),
            ),
        ],
      ),
    );
  }

  String _configSummary() {
    final overlay = _overlayLabel(config.overlayType);
    final audio = _audioLabel(config.audioType);
    return '$overlay, $audio, ${config.durationSeconds}s';
  }

  IconData _prayerIcon(String prayer) {
    switch (prayer) {
      case 'fajr':
        return Icons.nightlight_round;
      case 'dhuhr':
        return Icons.wb_sunny;
      case 'asr':
        return Icons.wb_cloudy;
      case 'maghrib':
        return Icons.wb_twilight;
      case 'isha':
        return Icons.brightness_3;
      default:
        return Icons.access_time;
    }
  }

  static String _overlayLabel(AlertOverlayType type) {
    switch (type) {
      case AlertOverlayType.modal:
        return 'Full Screen';
      case AlertOverlayType.corner:
        return 'Corner';
      case AlertOverlayType.none:
        return 'No Overlay';
    }
  }

  static String _audioLabel(AlertAudioType type) {
    switch (type) {
      case AlertAudioType.adhan:
        return 'Adhan';
      case AlertAudioType.beep:
        return 'Beep';
      case AlertAudioType.silent:
        return 'Silent';
    }
  }
}

// ── Preview dialog ─────────────────────────────────────────────────────────

class _PreviewDialog extends StatefulWidget {
  const _PreviewDialog({required this.config});
  final PrayerAlertConfig config;

  @override
  State<_PreviewDialog> createState() => _PreviewDialogState();
}

class _PreviewDialogState extends State<_PreviewDialog> {
  @override
  void initState() {
    super.initState();
    // Play preview audio.
    if (widget.config.audioType == AlertAudioType.adhan) {
      AdhanService.instance.play(AdhanType.makkah, volume: 0.5);
    } else if (widget.config.audioType == AlertAudioType.beep) {
      AdhanService.instance.play(AdhanType.beep, volume: 0.5);
    }
  }

  @override
  void dispose() {
    AdhanService.instance.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.config.overlayType == AlertOverlayType.corner) {
      return _buildCornerPreview();
    }
    return _buildModalPreview();
  }

  Widget _buildModalPreview() {
    return GestureDetector(
      onTap: () => Navigator.of(context).pop(),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.mosque,
              color: PrayCalcColors.light,
              size: 64,
            ),
            const SizedBox(height: 20),
            const Text(
              'Fajr',
              style: TextStyle(
                color: PrayCalcColors.light,
                fontSize: 56,
                fontWeight: FontWeight.bold,
                decoration: TextDecoration.none,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              '5:23 AM',
              style: TextStyle(
                color: Colors.white,
                fontSize: 40,
                fontWeight: FontWeight.w300,
                decoration: TextDecoration.none,
                fontFeatures: [FontFeature.tabularFigures()],
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Tap anywhere to dismiss',
              style: TextStyle(
                color: Colors.white.withAlpha(80),
                fontSize: 16,
                decoration: TextDecoration.none,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCornerPreview() {
    return Stack(
      children: [
        // Transparent backdrop to allow dismiss
        GestureDetector(
          onTap: () => Navigator.of(context).pop(),
          child: Container(color: Colors.transparent),
        ),
        // Corner card
        Positioned(
          top: 32,
          right: 32,
          child: GestureDetector(
            onTap: () => Navigator.of(context).pop(),
            child: Container(
              width: 280,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: PrayCalcColors.deep.withAlpha(240),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: PrayCalcColors.mid, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(120),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: const Row(
                children: [
                  Icon(Icons.mosque, color: PrayCalcColors.light, size: 32),
                  SizedBox(width: 12),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Fajr',
                        style: TextStyle(
                          color: PrayCalcColors.light,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          decoration: TextDecoration.none,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        '5:23 AM',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 16,
                          decoration: TextDecoration.none,
                          fontFeatures: [FontFeature.tabularFigures()],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Reusable widgets ───────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, this.isTv = false});
  final String title;
  final bool isTv;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: TextStyle(
        color: PrayCalcColors.mid,
        fontSize: isTv ? 24 : 14,
        fontWeight: FontWeight.w600,
      ),
    );
  }
}

class _AlertTile extends StatelessWidget {
  const _AlertTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
    this.isTv = false,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final bool isTv;

  @override
  Widget build(BuildContext context) {
    final tile = ListTile(
      leading: Icon(icon, color: PrayCalcColors.mid, size: isTv ? 32 : 24),
      title: Text(
        title,
        style: TextStyle(
          color: isTv ? Colors.white : null,
          fontSize: isTv ? 26 : 16,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: subtitle != null
          ? Text(
              subtitle!,
              style: TextStyle(
                color: isTv ? Colors.white54 : Colors.grey,
                fontSize: isTv ? 20 : 12,
              ),
            )
          : null,
      trailing: trailing,
      onTap: onTap,
      contentPadding:
          EdgeInsets.symmetric(horizontal: isTv ? 20 : 16, vertical: 4),
    );

    if (!isTv) return tile;

    // TV: wrap with focus-aware container for D-pad navigation.
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onTap?.call();
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
            child: tile,
          );
        },
      ),
    );
  }
}
