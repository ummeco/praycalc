// praycalc/flutter/lib/core/models/user_prefs.dart
// UserPrefs model — matches pc_user_prefs schema (spec §3.2)
// Cross-device preferences synced via Hasura on login.

class UserPrefs {
  final String id;
  final String userId;
  final String calcMethod;
  final bool hanafiAsr;

  /// 'auto' | '12h' | '24h' — v1.1 default is 'auto' (locale-driven)
  /// NOTE: actual display format derived by LocaleService, not stored pref
  final String timeFormat;
  final int hijriOffset;
  final bool showMoonPhase;
  final double? homeLat;
  final double? homeLng;
  final String? homeLabel;
  final String? locale;
  final DateTime updatedAt;

  const UserPrefs({
    required this.id,
    required this.userId,
    this.calcMethod = 'isna',
    this.hanafiAsr = false,
    this.timeFormat = 'auto',
    this.hijriOffset = 0,
    this.showMoonPhase = true,
    this.homeLat,
    this.homeLng,
    this.homeLabel,
    this.locale,
    required this.updatedAt,
  });

  factory UserPrefs.fromJson(Map<String, dynamic> json) => UserPrefs(
        id: json['id'] as String,
        userId: json['user_id'] as String,
        calcMethod: (json['calc_method'] as String?) ?? 'isna',
        hanafiAsr: (json['hanafi_asr'] as bool?) ?? false,
        timeFormat: (json['time_format'] as String?) ?? 'auto',
        hijriOffset: (json['hijri_offset'] as int?) ?? 0,
        showMoonPhase: (json['show_moon_phase'] as bool?) ?? true,
        homeLat: (json['home_lat'] as num?)?.toDouble(),
        homeLng: (json['home_lng'] as num?)?.toDouble(),
        homeLabel: json['home_label'] as String?,
        locale: json['locale'] as String?,
        updatedAt: DateTime.parse(json['updated_at'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'calc_method': calcMethod,
        'hanafi_asr': hanafiAsr,
        'time_format': timeFormat,
        'hijri_offset': hijriOffset,
        'show_moon_phase': showMoonPhase,
        if (homeLat != null) 'home_lat': homeLat,
        if (homeLng != null) 'home_lng': homeLng,
        if (homeLabel != null) 'home_label': homeLabel,
        if (locale != null) 'locale': locale,
        'updated_at': updatedAt.toIso8601String(),
      };

  UserPrefs copyWith({
    String? calcMethod,
    bool? hanafiAsr,
    String? timeFormat,
    int? hijriOffset,
    bool? showMoonPhase,
    double? homeLat,
    double? homeLng,
    String? homeLabel,
    String? locale,
  }) => UserPrefs(
        id: id,
        userId: userId,
        calcMethod: calcMethod ?? this.calcMethod,
        hanafiAsr: hanafiAsr ?? this.hanafiAsr,
        timeFormat: timeFormat ?? this.timeFormat,
        hijriOffset: hijriOffset ?? this.hijriOffset,
        showMoonPhase: showMoonPhase ?? this.showMoonPhase,
        homeLat: homeLat ?? this.homeLat,
        homeLng: homeLng ?? this.homeLng,
        homeLabel: homeLabel ?? this.homeLabel,
        locale: locale ?? this.locale,
        updatedAt: DateTime.now(),
      );
}
