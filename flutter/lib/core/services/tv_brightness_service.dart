import 'dart:developer' as dev;

import 'package:flutter/services.dart';

import '../../shared/models/tv_settings_model.dart';

/// Controls Android TV screen brightness via a native MethodChannel.
///
/// Channel: `com.praycalc.praycalc_app/tv_brightness`
///
/// Required native (Android) method implementations:
///   `setBrightness({'brightness': int 0-255})` — writes Settings.System.SCREEN_BRIGHTNESS
///     and updates WindowManager.LayoutParams.screenBrightness for the window.
///   `getBrightness()` → int — reads current Settings.System.SCREEN_BRIGHTNESS.
///   `hasWriteSettings()` → bool — checks Settings.System.canWrite().
///   `requestWriteSettings()` — launches ACTION_MANAGE_WRITE_SETTINGS intent.
class TvBrightnessService {
  TvBrightnessService._();

  static final TvBrightnessService instance = TvBrightnessService._();

  static const _channel =
      MethodChannel('com.praycalc.praycalc_app/tv_brightness');

  // ---------------------------------------------------------------------------
  // Native channel wrappers
  // ---------------------------------------------------------------------------

  /// Sets the system screen brightness to [brightness] (0–255).
  ///
  /// Returns `false` if the call fails (e.g. WRITE_SETTINGS not granted or
  /// the platform channel is not registered on non-Android platforms).
  Future<bool> setBrightness(int brightness) async {
    final clamped = brightness.clamp(0, 255);
    try {
      final granted = await hasWriteSettings();
      if (!granted) {
        dev.log(
          'WRITE_SETTINGS not granted; cannot set brightness to $clamped',
          name: 'TvBrightnessService',
        );
        return false;
      }
      await _channel.invokeMethod<void>('setBrightness', {'brightness': clamped});
      return true;
    } on PlatformException catch (e) {
      dev.log(
        'setBrightness failed: ${e.message}',
        name: 'TvBrightnessService',
      );
      return false;
    }
  }

  /// Returns the current screen brightness (0–255), or -1 on failure.
  Future<int> getBrightness() async {
    try {
      final result = await _channel.invokeMethod<int>('getBrightness');
      return result ?? -1;
    } on PlatformException catch (e) {
      dev.log(
        'getBrightness failed: ${e.message}',
        name: 'TvBrightnessService',
      );
      return -1;
    }
  }

  /// Returns `true` if the app has WRITE_SETTINGS permission.
  Future<bool> hasWriteSettings() async {
    try {
      final result = await _channel.invokeMethod<bool>('hasWriteSettings');
      return result ?? false;
    } on PlatformException catch (e) {
      dev.log(
        'hasWriteSettings failed: ${e.message}',
        name: 'TvBrightnessService',
      );
      return false;
    }
  }

  /// Opens the system ACTION_MANAGE_WRITE_SETTINGS intent so the user can
  /// grant WRITE_SETTINGS permission to PrayCalc.
  Future<void> requestWriteSettings() async {
    try {
      await _channel.invokeMethod<void>('requestWriteSettings');
    } on PlatformException catch (e) {
      dev.log(
        'requestWriteSettings failed: ${e.message}',
        name: 'TvBrightnessService',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Dart helpers
  // ---------------------------------------------------------------------------

  /// Evaluates [rules] against the current time and applies the first
  /// matching rule. [prayerTimes] maps prayer name → fractional hours
  /// (e.g. `{'Fajr': 5.5}` means 05:30).
  ///
  /// Rules are evaluated in list order. The last rule whose trigger time
  /// has already passed today wins (i.e. the most-recently-active rule).
  /// If no rule has passed yet today, wraps to the last valid rule in the
  /// list (previous day's final rule).
  ///
  /// Returns `true` if a rule was applied successfully.
  Future<bool> applySchedule(
    List<TvBrightnessRule> rules,
    Map<String, double> prayerTimes,
  ) async {
    if (rules.isEmpty) return false;

    final now = DateTime.now();
    final nowH = now.hour + now.minute / 60.0 + now.second / 3600.0;

    // Find the last rule whose trigger time is <= nowH.
    TvBrightnessRule? applicable;
    for (final rule in rules) {
      final triggerH = _ruleHour(rule, prayerTimes);
      if (triggerH == null) continue;
      if (triggerH <= nowH) {
        applicable = rule;
      }
    }

    // Nothing matched in today's window — wrap to the last rule of the list
    // that has a resolvable time (i.e. yesterday's final active rule).
    applicable ??= _lastValidRule(rules, prayerTimes);
    if (applicable == null) return false;

    if (applicable.screenOff) {
      // Screen-off: set brightness to 0. Native side may additionally use
      // WindowManager flags or DPMS to blank the display.
      return setBrightness(0);
    }

    final native = _percentToNative(applicable.brightnessPercent);
    return setBrightness(native);
  }

  /// Returns the brightness to apply for [prayer] as a native 0–255 value.
  ///
  /// If [overrides] contains a percent for [prayer], that value is used.
  /// Otherwise [defaultBrightness] (0–255) is returned unchanged.
  int brightnessForPrayer(
    String prayer,
    Map<String, int> overrides,
    int defaultBrightness,
  ) {
    final overridePct = overrides[prayer];
    if (overridePct != null) {
      return _percentToNative(overridePct.clamp(0, 100));
    }
    return defaultBrightness.clamp(0, 255);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /// Converts percent (0–100) to native Android brightness (0–255).
  int _percentToNative(int percent) =>
      (percent.clamp(0, 100) / 100.0 * 255).round();

  /// Returns the trigger time in fractional hours for [rule], or null if it
  /// cannot be resolved.
  double? _ruleHour(TvBrightnessRule rule, Map<String, double> prayerTimes) {
    switch (rule.trigger) {
      case BrightnessTrigger.prayerTime:
        final h = prayerTimes[rule.prayerName ?? ''];
        if (h == null || !h.isFinite) return null;
        return h;
      case BrightnessTrigger.fixedTime:
        final hour = rule.fixedHour;
        if (hour == null) return null;
        return hour + (rule.fixedMinute ?? 0) / 60.0;
      case BrightnessTrigger.sunset:
        // Approximate sunset as Maghrib time.
        final maghrib = prayerTimes['Maghrib'];
        if (maghrib == null || !maghrib.isFinite) return null;
        return maghrib;
    }
  }

  TvBrightnessRule? _lastValidRule(
    List<TvBrightnessRule> rules,
    Map<String, double> prayerTimes,
  ) {
    for (int i = rules.length - 1; i >= 0; i--) {
      if (_ruleHour(rules[i], prayerTimes) != null) return rules[i];
    }
    return null;
  }
}
