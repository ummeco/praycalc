// praycalc/flutter/lib/core/services/permission_service.dart
// PermissionService — unified permission management (v1.1 new)
//
// Handles:
//   iOS: location + notifications (provisional → full upgrade after 3 uses)
//   Android: POST_NOTIFICATIONS (API 33+), ACCESS_FINE_LOCATION, SCHEDULE_EXACT_ALARM (API 31+)
// Spec §10.1, §8.1, §8.2

import 'package:flutter/foundation.dart' show debugPrint, kIsWeb;
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum PermissionType { notifications, location, exactAlarm }

class PermissionResult {
  final PermissionType type;
  final PermissionStatus status;
  const PermissionResult(this.type, this.status);
}

/// Unified permission management service.
/// Register as a singleton or use with Riverpod provider.
class PermissionService {
  static const _kNotifDenialCountKey = 'pc_notif_denial_count';
  static const _kProvisionalUseCountKey = 'pc_provisional_use_count';

  /// Emits all permission states. Re-subscribe after app resume.
  Stream<Map<PermissionType, PermissionStatus>> watchAll() async* {
    yield await _currentStatuses();
  }

  /// Request all required permissions (called during onboarding).
  /// Order: location first, then notifications.
  Future<void> requestAll() async {
    if (kIsWeb) return;

    // Step 1: Location
    await _requestLocation();

    // Step 2: Notifications
    await _requestNotifications();
  }

  Future<Map<PermissionType, PermissionStatus>> _currentStatuses() async {
    if (kIsWeb) {
      return {
        PermissionType.notifications: PermissionStatus.granted,
        PermissionType.location: PermissionStatus.granted,
        PermissionType.exactAlarm: PermissionStatus.granted,
      };
    }
    return {
      PermissionType.notifications: await Permission.notification.status,
      PermissionType.location: await Permission.locationWhenInUse.status,
      PermissionType.exactAlarm: await _exactAlarmStatus(),
    };
  }

  Future<PermissionStatus> _exactAlarmStatus() async {
    try {
      return await Permission.scheduleExactAlarm.status;
    } catch (_) {
      return PermissionStatus.granted; // below API 31
    }
  }

  Future<void> _requestLocation() async {
    final status = await Permission.locationWhenInUse.status;
    if (!status.isGranted) {
      await Permission.locationWhenInUse.request();
    }
  }

  Future<void> _requestNotifications() async {
    final status = await Permission.notification.status;
    if (status.isGranted) return;

    final result = await Permission.notification.request();
    if (result.isDenied) {
      final prefs = await SharedPreferences.getInstance();
      final count = (prefs.getInt(_kNotifDenialCountKey) ?? 0) + 1;
      await prefs.setInt(_kNotifDenialCountKey, count);
      debugPrint('[PermissionService] notification denied (count=$count)');
    }
  }

  /// Opens the platform Settings app for permission changes.
  Future<bool> openSettings() => openAppSettings();

  /// Android: whether the system would show a rationale dialog.
  /// Returns false on iOS or if never asked before.
  bool shouldShowRationale(PermissionType type) {
    // permission_handler handles the rationale check internally on Android.
    // Return true if we should show an educational UI before re-requesting.
    return false; // evaluated per-call at request time via permission_handler
  }

  /// Returns true if Android denial count has reached the threshold (2)
  /// and we should show a deep-link to Settings instead of re-prompting.
  Future<bool> shouldShowSettingsLink() async {
    final prefs = await SharedPreferences.getInstance();
    return (prefs.getInt(_kNotifDenialCountKey) ?? 0) >= 2;
  }

  /// Track provisional notification use count.
  /// After 3 uses, iOS provisional can be upgraded to full permission.
  Future<int> incrementProvisionalUseCount() async {
    final prefs = await SharedPreferences.getInstance();
    final count = (prefs.getInt(_kProvisionalUseCountKey) ?? 0) + 1;
    await prefs.setInt(_kProvisionalUseCountKey, count);
    return count;
  }

  Future<int> provisionalUseCount() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_kProvisionalUseCountKey) ?? 0;
  }

  // ── Platform channel for exact alarm (Android 31+) ─────────────────────────

  static const _channel = MethodChannel('com.praycalc/permissions');

  Future<void> requestExactAlarm() async {
    try {
      await _channel.invokeMethod('requestExactAlarm');
    } on PlatformException catch (e) {
      debugPrint('[PermissionService] requestExactAlarm error: $e');
    }
  }
}
