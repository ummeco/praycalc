import 'dart:convert';

/// TV-specific settings: masjid mode, iqamah offsets, announcements, ambient.
class TvSettings {
  final bool isMasjidMode;
  final String masjidName;

  /// Prayer name -> minutes after adhan for iqamah.
  final Map<String, int> iqamahOffsets;

  final bool showQrCode;
  final String? qrCodeUrl;

  /// Photo/pattern rotation interval in seconds (30-120).
  final int ambientIntervalSeconds;

  /// Idle time in minutes before ambient mode activates.
  final int ambientIdleMinutes;

  /// Screensaver background mode: 'photo', 'pattern', or 'both'.
  final String screensaverMode;

  /// Photo category filter for screensaver. Empty string = all.
  final String screensaverCategory;

  final List<Announcement> announcements;

  const TvSettings({
    this.isMasjidMode = false,
    this.masjidName = '',
    this.iqamahOffsets = const {
      'Fajr': 20,
      'Dhuhr': 15,
      'Asr': 15,
      'Maghrib': 5,
      'Isha': 15,
      'Jumuah': 30,
    },
    this.showQrCode = false,
    this.qrCodeUrl,
    this.ambientIntervalSeconds = 60,
    this.ambientIdleMinutes = 10,
    this.screensaverMode = 'photo',
    this.screensaverCategory = '',
    this.announcements = const [],
  });

  TvSettings copyWith({
    bool? isMasjidMode,
    String? masjidName,
    Map<String, int>? iqamahOffsets,
    bool? showQrCode,
    String? qrCodeUrl,
    int? ambientIntervalSeconds,
    int? ambientIdleMinutes,
    String? screensaverMode,
    String? screensaverCategory,
    List<Announcement>? announcements,
  }) {
    return TvSettings(
      isMasjidMode: isMasjidMode ?? this.isMasjidMode,
      masjidName: masjidName ?? this.masjidName,
      iqamahOffsets: iqamahOffsets ?? this.iqamahOffsets,
      showQrCode: showQrCode ?? this.showQrCode,
      qrCodeUrl: qrCodeUrl ?? this.qrCodeUrl,
      ambientIntervalSeconds:
          ambientIntervalSeconds ?? this.ambientIntervalSeconds,
      ambientIdleMinutes: ambientIdleMinutes ?? this.ambientIdleMinutes,
      screensaverMode: screensaverMode ?? this.screensaverMode,
      screensaverCategory: screensaverCategory ?? this.screensaverCategory,
      announcements: announcements ?? this.announcements,
    );
  }

  Map<String, dynamic> toJson() => {
        'isMasjidMode': isMasjidMode,
        'masjidName': masjidName,
        'iqamahOffsets': iqamahOffsets,
        'showQrCode': showQrCode,
        'qrCodeUrl': qrCodeUrl,
        'ambientIntervalSeconds': ambientIntervalSeconds,
        'ambientIdleMinutes': ambientIdleMinutes,
        'screensaverMode': screensaverMode,
        'screensaverCategory': screensaverCategory,
        'announcements': announcements.map((a) => a.toJson()).toList(),
      };

  factory TvSettings.fromJson(Map<String, dynamic> json) {
    return TvSettings(
      isMasjidMode: json['isMasjidMode'] as bool? ?? false,
      masjidName: json['masjidName'] as String? ?? '',
      iqamahOffsets: (json['iqamahOffsets'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, v as int)) ??
          const {
            'Fajr': 20,
            'Dhuhr': 15,
            'Asr': 15,
            'Maghrib': 5,
            'Isha': 15,
            'Jumuah': 30,
          },
      showQrCode: json['showQrCode'] as bool? ?? false,
      qrCodeUrl: json['qrCodeUrl'] as String?,
      ambientIntervalSeconds:
          json['ambientIntervalSeconds'] as int? ?? 60,
      ambientIdleMinutes: json['ambientIdleMinutes'] as int? ?? 10,
      screensaverMode: json['screensaverMode'] as String? ?? 'photo',
      screensaverCategory: json['screensaverCategory'] as String? ?? '',
      announcements: (json['announcements'] as List<dynamic>?)
              ?.map((e) =>
                  Announcement.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }

  /// Encode to a JSON string for SharedPreferences storage.
  String encode() => jsonEncode(toJson());

  /// Decode from a JSON string stored in SharedPreferences.
  factory TvSettings.decode(String source) =>
      TvSettings.fromJson(jsonDecode(source) as Map<String, dynamic>);
}

/// A single announcement displayed in masjid mode.
class Announcement {
  final String id;
  final String title;
  final String body;
  final DateTime? expiresAt;

  const Announcement({
    required this.id,
    required this.title,
    required this.body,
    this.expiresAt,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'expiresAt': expiresAt?.toIso8601String(),
      };

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt'] as String)
          : null,
    );
  }

  /// True when this announcement has expired and should be hidden.
  bool get isExpired =>
      expiresAt != null && DateTime.now().isAfter(expiresAt!);
}
