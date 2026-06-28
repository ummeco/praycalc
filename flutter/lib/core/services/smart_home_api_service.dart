import 'dart:convert';

import 'package:http/http.dart' as http;

import 'auth_service.dart';

/// Smart home API base URL injected at build time via --dart-define.
const _kSmartHomeUrl = String.fromEnvironment(
  'SMART_HOME_API_URL',
  defaultValue: 'https://api.praycalc.com',
);

// ─── Data models ─────────────────────────────────────────────────────────────

enum RoutinePlatform { googleHome, alexa, homekit }
enum ActionType { lightColor, lightBrightness, speakerAudio }

class SmartHomeRoutine {
  final String? id;
  final String triggerPrayer;
  final int offsetMinutes;
  final List<String> daysOfWeek;
  final RoutinePlatform platform;
  final List<String> deviceIds;
  final ActionType actionType;
  final String actionValue;
  final int durationSeconds;
  final bool revertAfter;
  final bool enabled;

  const SmartHomeRoutine({
    this.id,
    this.triggerPrayer = 'Fajr',
    this.offsetMinutes = 0,
    this.daysOfWeek = const [],
    this.platform = RoutinePlatform.googleHome,
    this.deviceIds = const [],
    this.actionType = ActionType.lightColor,
    this.actionValue = '#C9F27A',
    this.durationSeconds = 300,
    this.revertAfter = true,
    this.enabled = true,
  });

  SmartHomeRoutine copyWith({
    String? id, String? triggerPrayer, int? offsetMinutes,
    List<String>? daysOfWeek, RoutinePlatform? platform,
    List<String>? deviceIds, ActionType? actionType,
    String? actionValue, int? durationSeconds,
    bool? revertAfter, bool? enabled,
  }) => SmartHomeRoutine(
    id: id ?? this.id,
    triggerPrayer: triggerPrayer ?? this.triggerPrayer,
    offsetMinutes: offsetMinutes ?? this.offsetMinutes,
    daysOfWeek: daysOfWeek ?? this.daysOfWeek,
    platform: platform ?? this.platform,
    deviceIds: deviceIds ?? this.deviceIds,
    actionType: actionType ?? this.actionType,
    actionValue: actionValue ?? this.actionValue,
    durationSeconds: durationSeconds ?? this.durationSeconds,
    revertAfter: revertAfter ?? this.revertAfter,
    enabled: enabled ?? this.enabled,
  );

  factory SmartHomeRoutine.fromJson(Map<String, dynamic> j) => SmartHomeRoutine(
    id: j['id'] as String?,
    triggerPrayer: j['triggerPrayer'] as String? ?? 'Fajr',
    offsetMinutes: j['offsetMinutes'] as int? ?? 0,
    daysOfWeek: (j['daysOfWeek'] as List<dynamic>?)?.cast<String>() ?? const [],
    platform: RoutinePlatform.values.firstWhere(
      (e) => e.name == (j['platform'] as String? ?? ''),
      orElse: () => RoutinePlatform.googleHome,
    ),
    deviceIds: (j['deviceIds'] as List<dynamic>?)?.cast<String>() ?? const [],
    actionType: ActionType.values.firstWhere(
      (e) => e.name == (j['actionType'] as String? ?? ''),
      orElse: () => ActionType.lightColor,
    ),
    actionValue: j['actionValue'] as String? ?? '#C9F27A',
    durationSeconds: j['durationSeconds'] as int? ?? 300,
    revertAfter: j['revertAfter'] as bool? ?? true,
    enabled: j['enabled'] as bool? ?? true,
  );

  Map<String, dynamic> toJson() => {
    if (id != null) 'id': id,
    'triggerPrayer': triggerPrayer,
    'offsetMinutes': offsetMinutes,
    'daysOfWeek': daysOfWeek,
    'platform': platform.name,
    'deviceIds': deviceIds,
    'actionType': actionType.name,
    'actionValue': actionValue,
    'durationSeconds': durationSeconds,
    'revertAfter': revertAfter,
    'enabled': enabled,
  };
}

/// Integration (Google Home, Alexa, etc.) returned from the API.
class SmartHomeIntegration {
  final String platform;
  final bool connected;
  final String? lastSynced;

  const SmartHomeIntegration({
    required this.platform,
    required this.connected,
    this.lastSynced,
  });

  factory SmartHomeIntegration.fromJson(Map<String, dynamic> json) {
    return SmartHomeIntegration(
      platform: json['platform'] as String? ?? '',
      connected: json['connected'] as bool? ?? false,
      lastSynced: json['lastSynced'] as String?,
    );
  }
}

/// A paired device returned from the API.
class SmartHomeDevice {
  final String id;
  final String name;
  final String type; // tv, watch, desktop, speaker, other
  final bool online;
  final String? lastSeen;
  final String pairedAt;
  final bool adhanEnabled;
  final int volumeLevel; // 0-100
  final int audioType; // 0=adhan 1=beep 2=silent
  final List<String> enabledPrayers;

  const SmartHomeDevice({
    required this.id,
    required this.name,
    required this.type,
    required this.online,
    this.lastSeen,
    required this.pairedAt,
    this.adhanEnabled = true,
    this.volumeLevel = 80,
    this.audioType = 0,
    this.enabledPrayers = const ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
  });

  factory SmartHomeDevice.fromJson(Map<String, dynamic> json) {
    return SmartHomeDevice(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Unknown',
      type: json['type'] as String? ?? 'other',
      online: json['online'] as bool? ?? false,
      lastSeen: json['lastSeen'] as String?,
      pairedAt: json['pairedAt'] as String? ?? '',
      adhanEnabled: json['adhanEnabled'] as bool? ?? true,
      volumeLevel: json['volumeLevel'] as int? ?? 80,
      audioType: json['audioType'] as int? ?? 0,
      enabledPrayers: (json['enabledPrayers'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
    );
  }

  SmartHomeDevice copyWith({
    bool? adhanEnabled,
    int? volumeLevel,
    int? audioType,
    List<String>? enabledPrayers,
  }) {
    return SmartHomeDevice(
      id: id,
      name: name,
      type: type,
      online: online,
      lastSeen: lastSeen,
      pairedAt: pairedAt,
      adhanEnabled: adhanEnabled ?? this.adhanEnabled,
      volumeLevel: volumeLevel ?? this.volumeLevel,
      audioType: audioType ?? this.audioType,
      enabledPrayers: enabledPrayers ?? this.enabledPrayers,
    );
  }
}

/// A webhook registration.
class SmartHomeWebhook {
  final String id;
  final String callbackUrl;
  final List<String> events;
  final double lat;
  final double lng;
  final bool active;
  final String createdAt;

  const SmartHomeWebhook({
    required this.id,
    required this.callbackUrl,
    required this.events,
    required this.lat,
    required this.lng,
    required this.active,
    required this.createdAt,
  });

  factory SmartHomeWebhook.fromJson(Map<String, dynamic> json) {
    return SmartHomeWebhook(
      id: json['id'] as String? ?? '',
      callbackUrl: json['callbackUrl'] as String? ?? '',
      events: (json['events'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      lat: (json['lat'] as num?)?.toDouble() ?? 0,
      lng: (json['lng'] as num?)?.toDouble() ?? 0,
      active: json['active'] as bool? ?? false,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

// ─── API exception ───────────────────────────────────────────────────────────

class SmartHomeApiException implements Exception {
  final String message;
  final int? statusCode;
  const SmartHomeApiException(this.message, {this.statusCode});

  @override
  String toString() => 'SmartHomeApiException: $message';
}

// ─── Service ─────────────────────────────────────────────────────────────────

/// HTTP client for the PrayCalc smart home REST API.
///
/// All methods require the user to be authenticated via [AuthService].
/// The auth token is injected automatically into every request.
class SmartHomeApiService {
  SmartHomeApiService._();
  static final instance = SmartHomeApiService._();

  Map<String, String> _headers() {
    final token = AuthService.instance.accessToken;
    final h = <String, String>{'Content-Type': 'application/json'};
    if (token != null) {
      h['Authorization'] = 'Bearer $token';
    }
    return h;
  }

  void _requireAuth() {
    if (!AuthService.instance.isAuthenticated) {
      throw const SmartHomeApiException(
        'Authentication required',
        statusCode: 401,
      );
    }
  }

  // ── Integrations ────────────────────────────────────────────────────────

  /// Fetch the list of smart home integrations for the current user.
  Future<List<SmartHomeIntegration>> getIntegrations() async {
    _requireAuth();
    final res = await http.get(
      Uri.parse('$_kSmartHomeUrl/api/v1/integrations'),
      headers: _headers(),
    );
    if (res.statusCode != 200) {
      throw SmartHomeApiException(
        _errorMessage(res, 'Failed to load integrations'),
        statusCode: res.statusCode,
      );
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    final list = data['integrations'] as List<dynamic>? ?? [];
    return list
        .map((e) =>
            SmartHomeIntegration.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Link or unlink an integration.
  Future<void> updateIntegration({
    required String action, // "link" or "unlink"
    required String platform,
  }) async {
    _requireAuth();
    final res = await http.post(
      Uri.parse('$_kSmartHomeUrl/api/v1/integrations'),
      headers: _headers(),
      body: jsonEncode({'action': action, 'platform': platform}),
    );
    if (res.statusCode != 200) {
      throw SmartHomeApiException(
        _errorMessage(res, 'Failed to update integration'),
        statusCode: res.statusCode,
      );
    }
  }

  /// Test connectivity for a given integration platform.
  Future<bool> testIntegration(String platform) async {
    _requireAuth();
    final res = await http.post(
      Uri.parse('$_kSmartHomeUrl/api/v1/integrations/test'),
      headers: _headers(),
      body: jsonEncode({'platform': platform}),
    );
    if (res.statusCode != 200) {
      return false;
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return data['success'] as bool? ?? false;
  }

  // ── Devices ─────────────────────────────────────────────────────────────

  /// Fetch the list of paired devices.
  Future<List<SmartHomeDevice>> getDevices() async {
    _requireAuth();
    final res = await http.get(
      Uri.parse('$_kSmartHomeUrl/api/v1/devices'),
      headers: _headers(),
    );
    if (res.statusCode != 200) {
      throw SmartHomeApiException(
        _errorMessage(res, 'Failed to load devices'),
        statusCode: res.statusCode,
      );
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    final list = data['devices'] as List<dynamic>? ?? [];
    return list
        .map((e) => SmartHomeDevice.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Register (pair) a new device.
  Future<SmartHomeDevice> addDevice({
    required String name,
    required String type,
    String? pairingCode,
  }) async {
    _requireAuth();
    final body = <String, dynamic>{
      'name': name,
      'type': type,
    };
    if (pairingCode != null) body['code'] = pairingCode;

    final res = await http.post(
      Uri.parse('$_kSmartHomeUrl/api/v1/devices'),
      headers: _headers(),
      body: jsonEncode(body),
    );
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw SmartHomeApiException(
        _errorMessage(res, 'Failed to add device'),
        statusCode: res.statusCode,
      );
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    final device = data['device'] as Map<String, dynamic>? ?? data;
    return SmartHomeDevice.fromJson(device);
  }

  /// Update device settings (adhan, volume, audio type, prayers).
  Future<void> updateDevice({
    required String id,
    bool? adhanEnabled,
    int? volumeLevel,
    int? audioType,
    List<String>? enabledPrayers,
  }) async {
    _requireAuth();
    final body = <String, dynamic>{'id': id};
    if (adhanEnabled != null) body['adhanEnabled'] = adhanEnabled;
    if (volumeLevel != null) body['volumeLevel'] = volumeLevel;
    if (audioType != null) body['audioType'] = audioType;
    if (enabledPrayers != null) body['enabledPrayers'] = enabledPrayers;

    final res = await http.put(
      Uri.parse('$_kSmartHomeUrl/api/v1/devices/$id'),
      headers: _headers(),
      body: jsonEncode(body),
    );
    if (res.statusCode != 200) {
      throw SmartHomeApiException(
        _errorMessage(res, 'Failed to update device'),
        statusCode: res.statusCode,
      );
    }
  }

  /// Delete (unpair) a device.
  Future<void> deleteDevice(String id) async {
    _requireAuth();
    final res = await http.delete(
      Uri.parse('$_kSmartHomeUrl/api/v1/devices/$id'),
      headers: _headers(),
    );
    if (res.statusCode != 200 && res.statusCode != 204) {
      throw SmartHomeApiException(
        _errorMessage(res, 'Failed to delete device'),
        statusCode: res.statusCode,
      );
    }
  }

  // ── Webhooks ────────────────────────────────────────────────────────────

  /// Fetch the list of webhook registrations.
  Future<List<SmartHomeWebhook>> getWebhooks() async {
    _requireAuth();
    final res = await http.get(
      Uri.parse('$_kSmartHomeUrl/api/v1/webhooks'),
      headers: _headers(),
    );
    if (res.statusCode != 200) {
      throw SmartHomeApiException(
        _errorMessage(res, 'Failed to load webhooks'),
        statusCode: res.statusCode,
      );
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    final list = data['webhooks'] as List<dynamic>? ?? [];
    return list
        .map((e) => SmartHomeWebhook.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Create a new webhook.
  Future<void> createWebhook({
    required String callbackUrl,
    required List<String> events,
    required double lat,
    required double lng,
  }) async {
    _requireAuth();
    final res = await http.post(
      Uri.parse('$_kSmartHomeUrl/api/v1/webhooks'),
      headers: _headers(),
      body: jsonEncode({
        'callbackUrl': callbackUrl,
        'events': events,
        'lat': lat,
        'lng': lng,
      }),
    );
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw SmartHomeApiException(
        _errorMessage(res, 'Failed to create webhook'),
        statusCode: res.statusCode,
      );
    }
  }

  /// Delete a webhook.
  Future<void> deleteWebhook(String id) async {
    _requireAuth();
    final res = await http.delete(
      Uri.parse('$_kSmartHomeUrl/api/v1/webhooks/$id'),
      headers: _headers(),
    );
    if (res.statusCode != 200 && res.statusCode != 204) {
      throw SmartHomeApiException(
        _errorMessage(res, 'Failed to delete webhook'),
        statusCode: res.statusCode,
      );
    }
  }

  // ── Routines ─────────────────────────────────────────────────────────────

  Future<List<SmartHomeRoutine>> fetchRoutines() async {
    _requireAuth();
    final res = await http.get(
      Uri.parse('$_kSmartHomeUrl/api/v1/routines'),
      headers: _headers(),
    );
    if (res.statusCode != 200) {
      throw SmartHomeApiException(_errorMessage(res, 'Failed to load routines'), statusCode: res.statusCode);
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return ((data['routines'] as List<dynamic>?) ?? [])
        .map((e) => SmartHomeRoutine.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<SmartHomeRoutine> fetchRoutine(String id) async {
    _requireAuth();
    final res = await http.get(
      Uri.parse('$_kSmartHomeUrl/api/v1/routines/$id'),
      headers: _headers(),
    );
    if (res.statusCode != 200) {
      throw SmartHomeApiException(_errorMessage(res, 'Failed to load routine'), statusCode: res.statusCode);
    }
    return SmartHomeRoutine.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<SmartHomeRoutine> createRoutine(SmartHomeRoutine routine) async {
    _requireAuth();
    final res = await http.post(
      Uri.parse('$_kSmartHomeUrl/api/v1/routines'),
      headers: _headers(),
      body: jsonEncode(routine.toJson()),
    );
    if (res.statusCode != 201 && res.statusCode != 200) {
      throw SmartHomeApiException(_errorMessage(res, 'Failed to create routine'), statusCode: res.statusCode);
    }
    return SmartHomeRoutine.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  Future<void> updateRoutine(SmartHomeRoutine routine) async {
    _requireAuth();
    final res = await http.put(
      Uri.parse('$_kSmartHomeUrl/api/v1/routines/${routine.id}'),
      headers: _headers(),
      body: jsonEncode(routine.toJson()),
    );
    if (res.statusCode != 200 && res.statusCode != 204) {
      throw SmartHomeApiException(_errorMessage(res, 'Failed to update routine'), statusCode: res.statusCode);
    }
  }

  Future<void> toggleRoutine(String id, bool enabled) async {
    _requireAuth();
    final res = await http.patch(
      Uri.parse('$_kSmartHomeUrl/api/v1/routines/$id/toggle'),
      headers: _headers(),
      body: jsonEncode({'enabled': enabled}),
    );
    if (res.statusCode != 200 && res.statusCode != 204) {
      throw SmartHomeApiException(_errorMessage(res, 'Failed to toggle routine'), statusCode: res.statusCode);
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  String _errorMessage(http.Response res, String fallback) {
    try {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return data['error'] as String? ?? data['message'] as String? ?? fallback;
    } catch (_) {
      return fallback;
    }
  }
}
