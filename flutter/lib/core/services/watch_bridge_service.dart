import 'dart:async';
import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Bridge between the Flutter phone app and WatchOS/Wear OS companion apps.
///
/// On iOS: uses WatchConnectivity via method channel to sync prayer data
/// to the Apple Watch companion app.
///
/// On Android: uses Wearable DataLayer API via method channel to sync
/// prayer data to the Wear OS companion app.
///
/// Both platforms fall back to the REST API if the phone bridge is unavailable.
class WatchBridgeService {
  WatchBridgeService._();
  static final instance = WatchBridgeService._();

  static const _channel = MethodChannel('com.praycalc.app/watch');

  bool _isReachable = false;
  bool get isWatchReachable => _isReachable;

  final _reachabilityController = StreamController<bool>.broadcast();
  Stream<bool> get reachabilityStream => _reachabilityController.stream;

  /// Initialize the watch bridge. Call once at app startup.
  Future<void> init() async {
    try {
      _channel.setMethodCallHandler(_handleWatchMessage);
      final reachable = await _channel.invokeMethod<bool>('isReachable');
      _isReachable = reachable ?? false;
      _reachabilityController.add(_isReachable);
    } on MissingPluginException {
      // Platform doesn't support watch connectivity (e.g., tablets)
      _isReachable = false;
    } on PlatformException {
      _isReachable = false;
    }
  }

  /// Send prayer times data to the watch.
  ///
  /// [prayerData] should be a JSON-serializable map matching the PrayCalc API
  /// response format: { prayers: {...}, nextPrayer: {...}, qibla: {...}, meta: {...} }
  Future<bool> syncPrayerTimes(Map<String, dynamic> prayerData) async {
    if (!_isReachable) return false;

    try {
      final result = await _channel.invokeMethod<bool>('syncPrayerTimes', {
        'data': jsonEncode(prayerData),
        'timestamp': DateTime.now().toIso8601String(),
      });
      return result ?? false;
    } on PlatformException {
      return false;
    }
  }

  /// Send user settings to the watch (method, madhab, notification prefs).
  Future<bool> syncSettings(Map<String, dynamic> settings) async {
    if (!_isReachable) return false;

    try {
      final result = await _channel.invokeMethod<bool>('syncSettings', {
        'data': jsonEncode(settings),
      });
      return result ?? false;
    } on PlatformException {
      return false;
    }
  }

  /// Send subscription status to the watch.
  Future<bool> syncSubscriptionStatus({
    required bool isPlus,
    DateTime? expiresAt,
  }) async {
    if (!_isReachable) return false;

    try {
      final result =
          await _channel.invokeMethod<bool>('syncSubscriptionStatus', {
        'isPlus': isPlus,
        'expiresAt': expiresAt?.toIso8601String(),
      });
      return result ?? false;
    } on PlatformException {
      return false;
    }
  }

  /// Request the watch to send its current complication data for debugging.
  Future<Map<String, dynamic>?> requestWatchStatus() async {
    if (!_isReachable) return null;

    try {
      final result =
          await _channel.invokeMethod<String>('requestWatchStatus');
      if (result != null) {
        return jsonDecode(result) as Map<String, dynamic>;
      }
    } on PlatformException {
      // Watch unavailable
    }
    return null;
  }

  /// Handle incoming messages from the watch.
  Future<dynamic> _handleWatchMessage(MethodCall call) async {
    switch (call.method) {
      case 'onReachabilityChanged':
        _isReachable = call.arguments as bool? ?? false;
        _reachabilityController.add(_isReachable);
        break;

      case 'onRequestPrayerTimes':
        // Watch is requesting fresh prayer data. Read from SharedPrefs
        // and send back via syncPrayerTimes.
        final prefs = await SharedPreferences.getInstance();
        final cached = prefs.getString('cached_prayer_times');
        if (cached != null) {
          await syncPrayerTimes(
              jsonDecode(cached) as Map<String, dynamic>);
        }
        break;

      case 'onWatchSettingsChanged':
        // Watch changed a setting (e.g., method). Sync back to phone.
        final data = call.arguments as String?;
        if (data != null) {
          // Could emit via a stream for the settings provider to pick up
        }
        break;
    }
    return null;
  }

  void dispose() {
    _reachabilityController.close();
  }
}
