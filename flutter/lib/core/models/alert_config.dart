import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/settings_provider.dart';

/// How the prayer alert overlay is displayed.
enum AlertOverlayType { modal, corner, none }

/// What audio plays when a prayer alert fires.
enum AlertAudioType { adhan, beep, silent }

/// Configuration for a single prayer's alert behavior.
class PrayerAlertConfig {
  final AlertOverlayType overlayType;
  final AlertAudioType audioType;

  /// How long the overlay stays on screen (seconds).
  final int durationSeconds;

  /// Whether the overlay auto-dismisses after [durationSeconds].
  final bool autoDismiss;

  const PrayerAlertConfig({
    this.overlayType = AlertOverlayType.modal,
    this.audioType = AlertAudioType.adhan,
    this.durationSeconds = 60,
    this.autoDismiss = true,
  });

  PrayerAlertConfig copyWith({
    AlertOverlayType? overlayType,
    AlertAudioType? audioType,
    int? durationSeconds,
    bool? autoDismiss,
  }) =>
      PrayerAlertConfig(
        overlayType: overlayType ?? this.overlayType,
        audioType: audioType ?? this.audioType,
        durationSeconds: durationSeconds ?? this.durationSeconds,
        autoDismiss: autoDismiss ?? this.autoDismiss,
      );

  Map<String, dynamic> toJson() => {
        'overlayType': overlayType.name,
        'audioType': audioType.name,
        'durationSeconds': durationSeconds,
        'autoDismiss': autoDismiss,
      };

  factory PrayerAlertConfig.fromJson(Map<String, dynamic> json) =>
      PrayerAlertConfig(
        overlayType: AlertOverlayType.values
            .byName(json['overlayType'] as String? ?? 'modal'),
        audioType: AlertAudioType.values
            .byName(json['audioType'] as String? ?? 'adhan'),
        durationSeconds: json['durationSeconds'] as int? ?? 60,
        autoDismiss: json['autoDismiss'] as bool? ?? true,
      );
}

/// Top-level alert settings: per-prayer configs + global toggles.
class AlertSettings {
  /// Per-prayer alert configuration keyed by prayer name.
  final Map<String, PrayerAlertConfig> perPrayer;

  /// Master toggle for all alert overlays and audio.
  final bool globalEnabled;

  /// Whether to pause other media apps during adhan playback.
  final bool mediaPauseEnabled;

  const AlertSettings({
    this.perPrayer = const {
      'fajr': PrayerAlertConfig(),
      'dhuhr': PrayerAlertConfig(),
      'asr': PrayerAlertConfig(),
      'maghrib': PrayerAlertConfig(),
      'isha': PrayerAlertConfig(),
    },
    this.globalEnabled = true,
    this.mediaPauseEnabled = true,
  });

  AlertSettings copyWith({
    Map<String, PrayerAlertConfig>? perPrayer,
    bool? globalEnabled,
    bool? mediaPauseEnabled,
  }) =>
      AlertSettings(
        perPrayer: perPrayer ?? this.perPrayer,
        globalEnabled: globalEnabled ?? this.globalEnabled,
        mediaPauseEnabled: mediaPauseEnabled ?? this.mediaPauseEnabled,
      );

  Map<String, dynamic> toJson() => {
        'perPrayer': perPrayer
            .map((key, value) => MapEntry(key, value.toJson())),
        'globalEnabled': globalEnabled,
        'mediaPauseEnabled': mediaPauseEnabled,
      };

  factory AlertSettings.fromJson(Map<String, dynamic> json) {
    final perPrayerRaw =
        json['perPrayer'] as Map<String, dynamic>? ?? {};
    final perPrayer = perPrayerRaw.map(
      (key, value) => MapEntry(
        key,
        PrayerAlertConfig.fromJson(value as Map<String, dynamic>),
      ),
    );

    // Ensure all 5 prayers have configs (fill missing with defaults).
    const defaultPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (final prayer in defaultPrayers) {
      perPrayer.putIfAbsent(prayer, () => const PrayerAlertConfig());
    }

    return AlertSettings(
      perPrayer: perPrayer,
      globalEnabled: json['globalEnabled'] as bool? ?? true,
      mediaPauseEnabled: json['mediaPauseEnabled'] as bool? ?? true,
    );
  }

  String encode() => jsonEncode(toJson());

  factory AlertSettings.decode(String source) =>
      AlertSettings.fromJson(jsonDecode(source) as Map<String, dynamic>);
}

// ── Riverpod provider ──────────────────────────────────────────────────────

const _kAlertSettingsKey = 'pc_alert_settings';

/// Notifier for alert settings, persisted via SharedPreferences.
class AlertSettingsNotifier extends Notifier<AlertSettings> {
  @override
  AlertSettings build() {
    Future.microtask(_load);
    return const AlertSettings();
  }

  Future<void> _load() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    final raw = prefs.getString(_kAlertSettingsKey);
    if (raw != null) {
      try {
        state = AlertSettings.decode(raw);
      } catch (_) {
        // Corrupted data: keep defaults.
      }
    }
  }

  Future<void> _persist() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    await prefs.setString(_kAlertSettingsKey, state.encode());
  }

  Future<void> update(AlertSettings updated) async {
    state = updated;
    await _persist();
  }

  Future<void> setGlobalEnabled(bool v) =>
      update(state.copyWith(globalEnabled: v));

  Future<void> setMediaPauseEnabled(bool v) =>
      update(state.copyWith(mediaPauseEnabled: v));

  /// Update the alert config for a single prayer.
  Future<void> setPrayerConfig(String prayer, PrayerAlertConfig config) {
    final updated = Map<String, PrayerAlertConfig>.from(state.perPrayer);
    updated[prayer] = config;
    return update(state.copyWith(perPrayer: updated));
  }

  /// Update overlay type for a single prayer.
  Future<void> setOverlayType(String prayer, AlertOverlayType type) {
    final current = state.perPrayer[prayer] ?? const PrayerAlertConfig();
    return setPrayerConfig(prayer, current.copyWith(overlayType: type));
  }

  /// Update audio type for a single prayer.
  Future<void> setAudioType(String prayer, AlertAudioType type) {
    final current = state.perPrayer[prayer] ?? const PrayerAlertConfig();
    return setPrayerConfig(prayer, current.copyWith(audioType: type));
  }

  /// Update duration for a single prayer.
  Future<void> setDuration(String prayer, int seconds) {
    final current = state.perPrayer[prayer] ?? const PrayerAlertConfig();
    return setPrayerConfig(
        prayer, current.copyWith(durationSeconds: seconds.clamp(10, 300)));
  }

  /// Toggle auto-dismiss for a single prayer.
  Future<void> setAutoDismiss(String prayer, bool v) {
    final current = state.perPrayer[prayer] ?? const PrayerAlertConfig();
    return setPrayerConfig(prayer, current.copyWith(autoDismiss: v));
  }
}

final alertSettingsProvider =
    NotifierProvider<AlertSettingsNotifier, AlertSettings>(
  AlertSettingsNotifier.new,
);
