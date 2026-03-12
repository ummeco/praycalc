import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../../core/models/alert_config.dart';
import '../../core/services/adhan_service.dart';
import '../../core/services/media_pause_service.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/notification_model.dart';

/// Desktop adhan alert: OS-native notification + optional overlay window.
///
/// On macOS, Windows, and Linux this fires a system notification via
/// flutter_local_notifications and optionally shows an in-app overlay
/// dialog with adhan audio playback.
///
/// Usage:
/// ```dart
/// DesktopAdhanAlert.show(
///   context: context,
///   prayerName: 'Fajr',
///   prayerTimeFormatted: '5:23 AM',
///   config: alertConfig,
/// );
/// ```
class DesktopAdhanAlert {
  DesktopAdhanAlert._();

  static final _notifications = FlutterLocalNotificationsPlugin();
  static bool _initialized = false;

  /// Initialize the notification plugin for the current desktop platform.
  static Future<void> init() async {
    if (_initialized) return;

    const linuxSettings = LinuxInitializationSettings(
      defaultActionName: 'Open PrayCalc',
    );

    const darwinSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestSoundPermission: true,
    );

    const windowsSettings = WindowsInitializationSettings(
      appName: 'PrayCalc',
      appUserModelId: 'com.praycalc.app',
      guid: 'd8f4f3c9-4b1a-4a0e-9c2e-7b5e3f1a8c4d',
    );

    const initSettings = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      macOS: darwinSettings,
      linux: linuxSettings,
      windows: windowsSettings,
    );

    await _notifications.initialize(settings: initSettings);
    _initialized = true;
  }

  /// Show the OS notification for a prayer time.
  static Future<void> _showSystemNotification({
    required String prayerName,
    required String prayerTime,
  }) async {
    await init();

    const darwinDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentSound: false, // We play audio ourselves via just_audio.
    );

    const linuxDetails = LinuxNotificationDetails(
      urgency: LinuxNotificationUrgency.critical,
    );

    const windowsDetails = WindowsNotificationDetails();

    const details = NotificationDetails(
      macOS: darwinDetails,
      linux: linuxDetails,
      windows: windowsDetails,
    );

    await _notifications.show(
      id: prayerName.hashCode,
      title: 'Prayer Time: $prayerName',
      body: 'It is time for $prayerName ($prayerTime)',
      notificationDetails: details,
    );
  }

  /// Show a desktop adhan alert: system notification + optional overlay + audio.
  static Future<void> show({
    required BuildContext context,
    required String prayerName,
    required String prayerTimeFormatted,
    required PrayerAlertConfig config,
    bool mediaPauseEnabled = true,
  }) async {
    // Always fire the OS-native notification.
    await _showSystemNotification(
      prayerName: prayerName,
      prayerTime: prayerTimeFormatted,
    );

    // Play audio.
    switch (config.audioType) {
      case AlertAudioType.adhan:
        if (mediaPauseEnabled) {
          MediaPauseService.instance.pauseForAdhan(
            duration: Duration(seconds: config.durationSeconds),
          );
        }
        await AdhanService.instance.play(AdhanType.makkah);
      case AlertAudioType.beep:
        await AdhanService.instance.play(AdhanType.beep);
      case AlertAudioType.silent:
        break;
    }

    // Show overlay dialog if configured.
    if (config.overlayType == AlertOverlayType.modal && context.mounted) {
      await showDialog(
        context: context,
        barrierDismissible: true,
        barrierColor: Colors.black.withAlpha(180),
        builder: (ctx) => _DesktopAlertDialog(
          prayerName: prayerName,
          prayerTime: prayerTimeFormatted,
          durationSeconds: config.durationSeconds,
          autoDismiss: config.autoDismiss,
        ),
      );
    }
  }
}

// ── Desktop overlay dialog ─────────────────────────────────────────────────

class _DesktopAlertDialog extends StatefulWidget {
  const _DesktopAlertDialog({
    required this.prayerName,
    required this.prayerTime,
    required this.durationSeconds,
    required this.autoDismiss,
  });

  final String prayerName;
  final String prayerTime;
  final int durationSeconds;
  final bool autoDismiss;

  @override
  State<_DesktopAlertDialog> createState() => _DesktopAlertDialogState();
}

class _DesktopAlertDialogState extends State<_DesktopAlertDialog> {
  Timer? _dismissTimer;

  @override
  void initState() {
    super.initState();
    if (widget.autoDismiss) {
      _dismissTimer = Timer(
        Duration(seconds: widget.durationSeconds),
        () {
          if (mounted) {
            AdhanService.instance.fadeOut();
            Navigator.of(context).pop();
          }
        },
      );
    }
  }

  @override
  void dispose() {
    _dismissTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: PrayCalcColors.deep,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: PrayCalcColors.dark, width: 2),
      ),
      child: SizedBox(
        width: 400,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 36),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.mosque,
                color: PrayCalcColors.light,
                size: 56,
              ),
              const SizedBox(height: 20),
              Text(
                widget.prayerName,
                style: const TextStyle(
                  color: PrayCalcColors.light,
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                widget.prayerTime,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.w300,
                  fontFeatures: [FontFeature.tabularFigures()],
                ),
              ),
              const SizedBox(height: 32),
              TextButton(
                onPressed: () {
                  AdhanService.instance.fadeOut();
                  Navigator.of(context).pop();
                },
                child: const Text(
                  'Dismiss',
                  style: TextStyle(
                    color: PrayCalcColors.mid,
                    fontSize: 18,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Desktop alert scheduler ────────────────────────────────────────────────

/// Scheduler that monitors prayer times and fires desktop alerts.
///
/// Similar to [TvAlertScheduler] but invokes [DesktopAdhanAlert.show]
/// instead of using overlay widgets.
class DesktopAlertScheduler {
  DesktopAlertScheduler._();
  static final instance = DesktopAlertScheduler._();

  Timer? _ticker;
  final Set<String> _alertedToday = {};
  DateTime _lastDate = DateTime.now();

  /// Called when a prayer alert should fire.
  /// The callback receives the prayer name and formatted time.
  void Function(String prayerName, String formattedTime)? onAlert;

  /// Whether the current platform is a desktop OS.
  static bool get isDesktop =>
      Platform.isMacOS || Platform.isWindows || Platform.isLinux;

  /// Start monitoring prayer times (checks every second).
  void start({
    required Map<String, double> prayerTimesH,
    required bool use24h,
  }) {
    stop();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      _check(prayerTimesH, use24h);
    });
  }

  void stop() {
    _ticker?.cancel();
    _ticker = null;
  }

  void _check(Map<String, double> prayerTimesH, bool use24h) {
    final now = DateTime.now();

    if (now.day != _lastDate.day) {
      _alertedToday.clear();
      _lastDate = now;
    }

    final nowH = now.hour + now.minute / 60.0 + now.second / 3600.0;

    for (final entry in prayerTimesH.entries) {
      final prayer = entry.key;
      final timeH = entry.value;

      if (_alertedToday.contains(prayer)) continue;
      if (!timeH.isFinite) continue;

      final diffSeconds = ((nowH - timeH) * 3600).abs();
      if (nowH >= timeH && diffSeconds < 30) {
        _alertedToday.add(prayer);
        onAlert?.call(prayer, _formatH(timeH, use24h));
      }
    }
  }

  String _formatH(double h, bool use24h) {
    final totalMin = (h * 60).round();
    final hh = (totalMin ~/ 60) % 24;
    final mm = totalMin % 60;
    if (use24h) {
      return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    }
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:${mm.toString().padLeft(2, '0')} $period';
  }
}
