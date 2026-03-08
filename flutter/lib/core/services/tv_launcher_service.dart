import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Manages TV launcher mode: enable/disable as home launcher,
/// triple-back-press detection for escape to stock launcher.
class TvLauncherService {
  static const _channel = MethodChannel('com.praycalc.app/launcher');

  /// Enable PrayCalc as the TV home launcher.
  static Future<void> enableLauncher() async {
    await _channel.invokeMethod('enableLauncher');
  }

  /// Disable PrayCalc as the TV home launcher (restore stock).
  static Future<void> disableLauncher() async {
    await _channel.invokeMethod('disableLauncher');
  }

  /// Launch the stock Android TV launcher (escape route).
  static Future<void> launchStockLauncher() async {
    await _channel.invokeMethod('launchStockLauncher');
  }
}

/// Mixin for TV screens that need triple-back-press escape detection.
/// Usage: add `with TvBackPressMixin` to State class.
mixin TvBackPressMixin<T extends StatefulWidget> on State<T> {
  int _backPressCount = 0;
  DateTime? _lastBackPress;

  /// Call this from KeyboardListener onKeyEvent for Back/Escape keys.
  /// Returns true if the triple-press escape was triggered.
  bool handleBackPress() {
    final now = DateTime.now();
    if (_lastBackPress == null ||
        now.difference(_lastBackPress!) > const Duration(seconds: 2)) {
      _backPressCount = 1;
    } else {
      _backPressCount++;
    }
    _lastBackPress = now;

    if (_backPressCount >= 3) {
      _backPressCount = 0;
      TvLauncherService.launchStockLauncher();
      return true;
    }
    return false;
  }
}
