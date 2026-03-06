import 'dart:convert';

/// Sentinel object used in copyWith to distinguish "not passed" from null.
const _sentinel = Object();

/// Per-prayer notification sound mode.
/// Cycle order on tap: off → silent → vibrate → beep → adhan → off
enum PrayerSoundMode { off, silent, vibrate, beep, adhan }

/// User settings for PrayCalc app.
class AppSettings {
  final bool hanafi;
  final bool use24h;
  final bool darkMode; // null = follow system
  final bool? followSystem;
  final String? locale; // null = follow system locale

  // ── Home Screen ────────────────────────────────────────────
  final bool skyGradientEnabled;
  final bool skyGradientWeather;
  final bool countdownAnimationEnabled;

  // ── Date display ───────────────────────────────────────────
  final bool hijriFirst; // Hijri shown above Gregorian when true (default)

  // ── Prayer Tracking ────────────────────────────────────────
  final bool prayerTrackingEnabled;

  // ── Notifications ──────────────────────────────────────────
  final bool jumuahKahfReminder;

  // ── Travel ────────────────────────────────────────────────
  final bool travelModeEnabled;
  final double? homeLat;
  final double? homeLng;
  /// true = show distances in miles (US/UK), false = km (default).
  final bool useImperial;

  // ── Per-prayer sound ───────────────────────────────────────
  final Map<String, PrayerSoundMode> prayerSounds;

  // ── Adhan defaults ─────────────────────────────────────────
  // These are stored as string names to avoid importing notification_model here.
  // adhanFajr defaults to 'fajrMishari', adhanRegular defaults to 'makkah'.
  final String adhanFajr;
  final String adhanRegular;

  const AppSettings({
    this.hanafi = false,
    this.use24h = false,
    this.darkMode = false,
    this.followSystem = true,
    this.locale,
    this.skyGradientEnabled = true,
    this.skyGradientWeather = false,
    this.countdownAnimationEnabled = true,
    this.hijriFirst = true,
    this.prayerTrackingEnabled = false,
    this.jumuahKahfReminder = true,
    this.travelModeEnabled = true,
    this.useImperial = false,
    this.prayerSounds = const {},
    this.adhanFajr = 'fajrMishari',
    this.adhanRegular = 'makkah',
    Object? homeLat = _sentinel,
    Object? homeLng = _sentinel,
  })  : homeLat = homeLat == _sentinel ? null : homeLat as double?,
        homeLng = homeLng == _sentinel ? null : homeLng as double?;

  AppSettings copyWith({
    bool? hanafi,
    bool? use24h,
    bool? darkMode,
    bool? followSystem,
    Object? locale = _sentinel,
    bool? skyGradientEnabled,
    bool? skyGradientWeather,
    bool? countdownAnimationEnabled,
    bool? hijriFirst,
    bool? prayerTrackingEnabled,
    bool? jumuahKahfReminder,
    bool? travelModeEnabled,
    bool? useImperial,
    Map<String, PrayerSoundMode>? prayerSounds,
    String? adhanFajr,
    String? adhanRegular,
    Object? homeLat = _sentinel,
    Object? homeLng = _sentinel,
  }) =>
      AppSettings(
        hanafi: hanafi ?? this.hanafi,
        use24h: use24h ?? this.use24h,
        darkMode: darkMode ?? this.darkMode,
        followSystem: followSystem ?? this.followSystem,
        locale: locale == _sentinel ? this.locale : locale as String?,
        skyGradientEnabled: skyGradientEnabled ?? this.skyGradientEnabled,
        skyGradientWeather: skyGradientWeather ?? this.skyGradientWeather,
        countdownAnimationEnabled:
            countdownAnimationEnabled ?? this.countdownAnimationEnabled,
        hijriFirst: hijriFirst ?? this.hijriFirst,
        prayerTrackingEnabled:
            prayerTrackingEnabled ?? this.prayerTrackingEnabled,
        jumuahKahfReminder: jumuahKahfReminder ?? this.jumuahKahfReminder,
        travelModeEnabled: travelModeEnabled ?? this.travelModeEnabled,
        useImperial: useImperial ?? this.useImperial,
        prayerSounds: prayerSounds ?? this.prayerSounds,
        adhanFajr: adhanFajr ?? this.adhanFajr,
        adhanRegular: adhanRegular ?? this.adhanRegular,
        homeLat: homeLat == _sentinel ? this.homeLat : homeLat as double?,
        homeLng: homeLng == _sentinel ? this.homeLng : homeLng as double?,
      );

  static AppSettings fromPrefs(Map<String, Object?> prefs) => AppSettings(
        hanafi: prefs['hanafi'] as bool? ?? false,
        use24h: prefs['use24h'] as bool? ?? false,
        darkMode: prefs['darkMode'] as bool? ?? false,
        followSystem: prefs['followSystem'] as bool? ?? true,
        locale: prefs['locale'] as String?,
        skyGradientEnabled: prefs['sky_gradient_enabled'] as bool? ?? true,
        skyGradientWeather: prefs['sky_gradient_weather'] as bool? ?? false,
        countdownAnimationEnabled:
            prefs['countdown_animation_enabled'] as bool? ?? true,
        hijriFirst: prefs['hijri_first'] as bool? ?? true,
        prayerTrackingEnabled:
            prefs['prayer_tracking_enabled'] as bool? ?? false,
        jumuahKahfReminder: prefs['jumuah_kahf_reminder'] as bool? ?? true,
        travelModeEnabled: prefs['travel_mode_enabled'] as bool? ?? true,
        useImperial: prefs['use_imperial'] as bool? ?? false,
        prayerSounds: _decodeSounds(prefs['prayer_sounds'] as String?),
        adhanFajr: prefs['adhan_fajr'] as String? ?? 'fajrMishari',
        adhanRegular: prefs['adhan_regular'] as String? ?? 'makkah',
        homeLat: prefs['home_lat'] as double?,
        homeLng: prefs['home_lng'] as double?,
      );

  static Map<String, PrayerSoundMode> _decodeSounds(String? json) {
    if (json == null || json.isEmpty) return {};
    try {
      final decoded = jsonDecode(json) as Map<String, dynamic>;
      return decoded.map((k, v) {
        final mode = PrayerSoundMode.values.firstWhere(
          (m) => m.name == v,
          orElse: () => PrayerSoundMode.off,
        );
        return MapEntry(k, mode);
      });
    } catch (_) {
      return {};
    }
  }

  Map<String, Object?> toPrefs() => {
        'hanafi': hanafi,
        'use24h': use24h,
        'darkMode': darkMode,
        'followSystem': followSystem,
        'locale': locale,
        'sky_gradient_enabled': skyGradientEnabled,
        'sky_gradient_weather': skyGradientWeather,
        'countdown_animation_enabled': countdownAnimationEnabled,
        'hijri_first': hijriFirst,
        'prayer_tracking_enabled': prayerTrackingEnabled,
        'jumuah_kahf_reminder': jumuahKahfReminder,
        'travel_mode_enabled': travelModeEnabled,
        'use_imperial': useImperial,
        'prayer_sounds': prayerSounds.isEmpty
            ? null
            : jsonEncode(prayerSounds.map((k, v) => MapEntry(k, v.name))),
        'adhan_fajr': adhanFajr,
        'adhan_regular': adhanRegular,
        'home_lat': homeLat,
        'home_lng': homeLng,
      };
}

/// A city record (used for home city and search results).
class City {
  final String name;
  final String country;
  final String? state;
  final double lat;
  final double lng;
  final String timezone;

  const City({
    required this.name,
    required this.country,
    this.state,
    required this.lat,
    required this.lng,
    required this.timezone,
  });

  String get displayName => state != null ? '$name, $state' : '$name, $country';
}
