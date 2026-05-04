// praycalc/flutter/lib/core/models/notification_prefs.dart
// NotificationPrefs model — matches pc_notification_prefs schema (spec §3.2)

enum PrayerName {
  fajr,
  dhuhr,
  asr,
  maghrib,
  isha;

  static PrayerName fromString(String v) => PrayerName.values.firstWhere(
        (p) => p.name == v,
        orElse: () => PrayerName.fajr,
      );
}

enum NotifSound {
  defaultSound('default'),
  adhanMakkah('adhan_makkah'),
  beep('beep'),
  silent('silent');

  final String value;
  const NotifSound(this.value);

  static NotifSound fromString(String v) => NotifSound.values.firstWhere(
        (s) => s.value == v,
        orElse: () => NotifSound.defaultSound,
      );
}

class NotificationPrefs {
  final String id;
  final String? userId;
  final String deviceId;
  final PrayerName prayer;
  final bool atAdhan;

  /// Pre-reminder offsets in minutes, e.g. [5, 15, 30]
  final List<int> preReminderMinutes;
  final NotifSound sound;
  final bool vibrate;
  final bool enabled;

  const NotificationPrefs({
    required this.id,
    this.userId,
    required this.deviceId,
    required this.prayer,
    this.atAdhan = true,
    this.preReminderMinutes = const [],
    this.sound = NotifSound.defaultSound,
    this.vibrate = true,
    this.enabled = true,
  });

  factory NotificationPrefs.fromJson(Map<String, dynamic> json) => NotificationPrefs(
        id: json['id'] as String,
        userId: json['user_id'] as String?,
        deviceId: json['device_id'] as String,
        prayer: PrayerName.fromString(json['prayer'] as String),
        atAdhan: (json['at_adhan'] as bool?) ?? true,
        preReminderMinutes: List<int>.from(
          (json['pre_reminder_minutes'] as List<dynamic>?) ?? [],
        ),
        sound: NotifSound.fromString((json['sound'] as String?) ?? 'default'),
        vibrate: (json['vibrate'] as bool?) ?? true,
        enabled: (json['enabled'] as bool?) ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        if (userId != null) 'user_id': userId,
        'device_id': deviceId,
        'prayer': prayer.name,
        'at_adhan': atAdhan,
        'pre_reminder_minutes': preReminderMinutes,
        'sound': sound.value,
        'vibrate': vibrate,
        'enabled': enabled,
      };

  NotificationPrefs copyWith({
    bool? atAdhan,
    List<int>? preReminderMinutes,
    NotifSound? sound,
    bool? vibrate,
    bool? enabled,
  }) => NotificationPrefs(
        id: id,
        userId: userId,
        deviceId: deviceId,
        prayer: prayer,
        atAdhan: atAdhan ?? this.atAdhan,
        preReminderMinutes: preReminderMinutes ?? this.preReminderMinutes,
        sound: sound ?? this.sound,
        vibrate: vibrate ?? this.vibrate,
        enabled: enabled ?? this.enabled,
      );
}
