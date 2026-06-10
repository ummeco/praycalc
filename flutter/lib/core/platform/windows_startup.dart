import 'dart:io';

import 'package:flutter/services.dart';

/// Manages Windows auto-startup registration via the Windows registry.
///
/// Uses `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` to register
/// PrayCalc for automatic launch at user login. Communicates with the native
/// platform via method channel `com.praycalc/startup`.
class WindowsStartup {
  static const _channel = MethodChannel('com.praycalc/startup');

  /// Registers PrayCalc in the Windows registry for auto-startup.
  ///
  /// Writes the current executable path to
  /// `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\PrayCalc`.
  static Future<bool> register() async {
    if (!Platform.isWindows) return false;
    try {
      final result = await _channel.invokeMethod<bool>('registerStartup');
      return result ?? false;
    } on PlatformException {
      return false;
    }
  }

  /// Removes PrayCalc from the Windows auto-startup registry key.
  static Future<bool> unregister() async {
    if (!Platform.isWindows) return false;
    try {
      final result = await _channel.invokeMethod<bool>('unregisterStartup');
      return result ?? false;
    } on PlatformException {
      return false;
    }
  }

  /// Checks whether PrayCalc is currently registered for auto-startup.
  static Future<bool> isRegistered() async {
    if (!Platform.isWindows) return false;
    try {
      final result = await _channel.invokeMethod<bool>('isRegistered');
      return result ?? false;
    } on PlatformException {
      return false;
    }
  }
}
