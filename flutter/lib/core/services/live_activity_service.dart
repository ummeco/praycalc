// praycalc/flutter/lib/core/services/live_activity_service.dart
// LiveActivityService — ActivityKit integration (iOS 16.1+ only)
// Spec §10.1, §5.2

import 'dart:async';

import 'package:flutter/foundation.dart' show debugPrint, kIsWeb;
import 'package:flutter/services.dart';

/// Platform channel contract for ActivityKit operations.
/// Implemented natively in ios/Runner/LiveActivityPlugin.swift
const _kChannel = MethodChannel('com.praycalc/live_activity');

/// Data fields for PrayerActivityAttributes.ContentState (spec §5.2)
class LiveActivityState {
  final String nextPrayer;
  final DateTime nextTime;
  final int countdownSeconds;
  final double progress; // 0.0 – 1.0
  final List<String> completedPrayers;
  final String locationName;

  const LiveActivityState({
    required this.nextPrayer,
    required this.nextTime,
    required this.countdownSeconds,
    required this.progress,
    required this.completedPrayers,
    required this.locationName,
  });

  Map<String, dynamic> toMap() => {
        'nextPrayer': nextPrayer,
        'nextTimeMs': nextTime.millisecondsSinceEpoch,
        'countdownSeconds': countdownSeconds,
        'progress': progress,
        'completedPrayers': completedPrayers,
        'locationName': locationName,
      };
}

/// LiveActivityService — manages the PrayCalc Live Activity and Dynamic Island.
///
/// isSupported: iOS 16.1+ only. On older iOS / Android / other platforms,
/// all methods are no-ops (graceful degradation per spec §4.2 S1-S7).
class LiveActivityService {
  LiveActivityService._();
  static final LiveActivityService instance = LiveActivityService._();

  bool _activityStarted = false;
  Timer? _countdownTimer;

  /// True only on iOS 16.1+. Always false on Android, Web, macOS, Windows.
  bool get isSupported {
    if (kIsWeb) return false;
    // Runtime check via platform channel — returns false on iOS < 16.1
    return _supportedCache;
  }

  bool _supportedCache = false;

  /// Call once at app startup to determine if ActivityKit is available.
  Future<void> checkSupport() async {
    if (kIsWeb) return;
    try {
      _supportedCache = await _kChannel.invokeMethod<bool>('isSupported') ?? false;
    } on PlatformException {
      _supportedCache = false;
    }
  }

  /// Start a new Live Activity for the given next prayer.
  /// No-op if [isSupported] is false.
  Future<void> startActivity(
    String nextPrayer,
    DateTime nextTime,
    String locationName, {
    List<String> completedPrayers = const [],
  }) async {
    if (!isSupported) return;
    try {
      final now = DateTime.now();
      final countdown = nextTime.difference(now).inSeconds;
      final dayDuration = const Duration(hours: 24).inSeconds;
      final progress = (dayDuration - countdown) / dayDuration;

      final state = LiveActivityState(
        nextPrayer: nextPrayer,
        nextTime: nextTime,
        countdownSeconds: countdown.clamp(0, dayDuration),
        progress: progress.clamp(0.0, 1.0),
        completedPrayers: completedPrayers,
        locationName: locationName,
      );

      await _kChannel.invokeMethod('startActivity', state.toMap());
      _activityStarted = true;
      _startCountdownUpdater(nextTime, completedPrayers, locationName);
      debugPrint('[LiveActivity] started for $nextPrayer at $nextTime');
    } on PlatformException catch (e) {
      debugPrint('[LiveActivity] startActivity error: $e');
    }
  }

  /// Update an existing Live Activity (countdown, progress).
  Future<void> updateActivity(
    String nextPrayer,
    DateTime nextTime,
    Duration countdown,
    double progress,
    List<String> completedPrayers,
    String locationName,
  ) async {
    if (!isSupported || !_activityStarted) return;
    try {
      final state = LiveActivityState(
        nextPrayer: nextPrayer,
        nextTime: nextTime,
        countdownSeconds: countdown.inSeconds,
        progress: progress,
        completedPrayers: completedPrayers,
        locationName: locationName,
      );
      await _kChannel.invokeMethod('updateActivity', state.toMap());
    } on PlatformException catch (e) {
      debugPrint('[LiveActivity] updateActivity error: $e');
    }
  }

  /// End the current Live Activity.
  Future<void> endActivity() async {
    if (!isSupported) return;
    _countdownTimer?.cancel();
    _countdownTimer = null;
    _activityStarted = false;
    try {
      await _kChannel.invokeMethod('endActivity');
      debugPrint('[LiveActivity] ended');
    } on PlatformException catch (e) {
      debugPrint('[LiveActivity] endActivity error: $e');
    }
  }

  // ── Internal countdown updater ─────────────────────────────────────────────

  void _startCountdownUpdater(
    DateTime nextTime,
    List<String> completedPrayers,
    String locationName,
  ) {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) async {
      final now = DateTime.now();
      final remaining = nextTime.difference(now);
      if (remaining.isNegative) {
        await endActivity();
        return;
      }
      final daySeconds = const Duration(hours: 24).inSeconds;
      final progress = 1.0 - (remaining.inSeconds / daySeconds).clamp(0.0, 1.0);
      // Extract prayer name from last started activity (not stored here — use updateActivity directly)
      // Countdown updates are fire-and-forget; errors are logged but not propagated
      try {
        await _kChannel.invokeMethod('updateCountdown', {
          'countdownSeconds': remaining.inSeconds,
          'progress': progress,
        });
      } on PlatformException {
        // Silently ignore — Live Activity may have been dismissed
      }
    });
  }
}
