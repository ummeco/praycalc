/// Platform-wide configuration for the PrayCalc TV app.
///
/// Fetched from https://smart.praycalc.com/api/v1/tv/platform-config
/// and cached in SharedPreferences. Defaults are used when offline or on error.
class TvPlatformConfig {
  final String version;
  final String attributionText;
  final String defaultRailPosition;
  final List<Map<String, dynamic>> defaultContentCycle;
  final Map<String, bool> featureFlags;
  final String minAppVersion;

  const TvPlatformConfig({
    required this.version,
    required this.attributionText,
    required this.defaultRailPosition,
    required this.defaultContentCycle,
    required this.featureFlags,
    required this.minAppVersion,
  });

  factory TvPlatformConfig.fromJson(Map<String, dynamic> json) {
    // Parse feature flags — tolerate mixed value types from the server.
    final rawFlags = json['featureFlags'] as Map<String, dynamic>? ?? {};
    final flags = rawFlags.map(
      (k, v) => MapEntry(k, v == true || v == 1 || v == 'true'),
    );

    // Merge with defaults so any new flag added to defaults is available
    // even when the server hasn't shipped it yet.
    final mergedFlags = <String, bool>{
      ...TvPlatformConfig.defaults.featureFlags,
      ...flags,
    };

    // Parse defaultContentCycle array — each element must be a map.
    final rawCycle = json['defaultContentCycle'];
    final cycle = rawCycle is List
        ? rawCycle.whereType<Map<String, dynamic>>().toList()
        : <Map<String, dynamic>>[];

    return TvPlatformConfig(
      version: (json['version'] as Object?)?.toString() ??
          TvPlatformConfig.defaults.version,
      attributionText: json['attributionText'] as String? ??
          TvPlatformConfig.defaults.attributionText,
      defaultRailPosition: json['defaultRailPosition'] as String? ??
          TvPlatformConfig.defaults.defaultRailPosition,
      defaultContentCycle: cycle,
      featureFlags: mergedFlags,
      minAppVersion: json['minAppVersion'] as String? ??
          TvPlatformConfig.defaults.minAppVersion,
    );
  }

  Map<String, dynamic> toJson() => {
        'version': version,
        'attributionText': attributionText,
        'defaultRailPosition': defaultRailPosition,
        'defaultContentCycle': defaultContentCycle,
        'featureFlags': featureFlags,
        'minAppVersion': minAppVersion,
      };

  /// Returns [true] if [flag] is enabled. Missing flags default to [false].
  bool isEnabled(String flag) => featureFlags[flag] ?? false;

  static const TvPlatformConfig defaults = TvPlatformConfig(
    version: '1',
    attributionText: 'PrayCalc · praycalc.com',
    defaultRailPosition: 'top',
    defaultContentCycle: [],
    featureFlags: {
      'quranPlayerEnabled': true,
      'sseEnabled': true,
      'googlePhotosEnabled': false,
    },
    minAppVersion: '0.9.7',
  );
}
