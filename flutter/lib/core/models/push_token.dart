// praycalc/flutter/lib/core/models/push_token.dart
// PushToken model — matches pc_push_tokens schema (spec §3.2)

/// Platform identifiers for push token registration.
enum PushPlatform {
  ios,
  android,
  watchIos,
  watchAndroid,
  macos,
  windows,
  tvAndroid,
  tvApple,
  alexa;

  String get value {
    switch (this) {
      case PushPlatform.watchIos:
        return 'watch_ios';
      case PushPlatform.watchAndroid:
        return 'watch_android';
      case PushPlatform.tvAndroid:
        return 'tv_android';
      case PushPlatform.tvApple:
        return 'tv_apple';
      default:
        return name;
    }
  }

  static PushPlatform fromString(String v) {
    return PushPlatform.values.firstWhere(
      (p) => p.value == v,
      orElse: () => throw ArgumentError('Unknown PushPlatform: $v'),
    );
  }
}

/// iOS notification permission states.
enum PermissionState {
  granted,
  denied,
  provisional,
  notDetermined;

  String get value {
    if (this == PermissionState.notDetermined) return 'not_determined';
    return name;
  }

  static PermissionState fromString(String v) {
    switch (v) {
      case 'not_determined':
        return PermissionState.notDetermined;
      default:
        return PermissionState.values.firstWhere(
          (s) => s.name == v,
          orElse: () => PermissionState.notDetermined,
        );
    }
  }
}

class PushToken {
  final String id;
  final String? userId;
  final String deviceId;
  final PushPlatform platform;
  final String token;
  final PermissionState permissionState;
  final DateTime? lastSeenAt;
  final DateTime createdAt;

  const PushToken({
    required this.id,
    this.userId,
    required this.deviceId,
    required this.platform,
    required this.token,
    required this.permissionState,
    this.lastSeenAt,
    required this.createdAt,
  });

  factory PushToken.fromJson(Map<String, dynamic> json) => PushToken(
        id: json['id'] as String,
        userId: json['user_id'] as String?,
        deviceId: json['device_id'] as String,
        platform: PushPlatform.fromString(json['platform'] as String),
        token: json['token'] as String,
        permissionState: PermissionState.fromString(json['permission_state'] as String),
        lastSeenAt: json['last_seen_at'] != null
            ? DateTime.parse(json['last_seen_at'] as String)
            : null,
        createdAt: DateTime.parse(json['created_at'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        if (userId != null) 'user_id': userId,
        'device_id': deviceId,
        'platform': platform.value,
        'token': token,
        'permission_state': permissionState.value,
        if (lastSeenAt != null) 'last_seen_at': lastSeenAt!.toIso8601String(),
        'created_at': createdAt.toIso8601String(),
      };
}
