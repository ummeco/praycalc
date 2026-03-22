// PERF-C1: Device tier detection for low-end Android TV / Fire TV Stick Lite.
//
// On Android, queries the native DeviceTierPlugin via MethodChannel.
// On all other platforms (iOS, macOS, Windows, Linux, Web) returns false.
//
// Usage:
//   final isLowEnd = ref.watch(isLowEndDeviceProvider);

import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Returns true when running on a low-end Android device (< 1.5 GB RAM) or
/// on a known low-spec Fire TV model (e.g. Fire TV Stick Lite AFTRSS/AFTSS).
final isLowEndDeviceProvider = FutureProvider<bool>((ref) async {
  if (kIsWeb || !Platform.isAndroid) return false;
  try {
    const channel = MethodChannel('com.praycalc.app/device_tier');
    final result = await channel.invokeMethod<bool>('isLowEnd');
    return result ?? false;
  } catch (_) {
    return false;
  }
});

/// Returns true when running on an Android TV device.
final isTvDeviceProvider = FutureProvider<bool>((ref) async {
  if (kIsWeb || !Platform.isAndroid) return false;
  try {
    const channel = MethodChannel('com.praycalc.app/device_tier');
    final result = await channel.invokeMethod<bool>('isTv');
    return result ?? false;
  } catch (_) {
    return false;
  }
});
