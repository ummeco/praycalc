import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'tv_platform_config.dart';

const _kConfigUrl =
    'https://smart.praycalc.com/api/v1/tv/platform-config';
const _kCacheKey = 'tv_platform_config';
const _kRefreshInterval = Duration(minutes: 60);

/// Fetches and caches platform-wide TV configuration from the smart service.
///
/// Usage:
/// ```dart
/// // On TV startup
/// await TvPlatformConfigService.instance.fetch();
/// TvPlatformConfigService.instance.startPeriodicRefresh();
///
/// // Read config
/// final cfg = TvPlatformConfigService.instance.config;
/// ```
///
/// The service:
/// - Loads from SharedPreferences cache immediately on [fetch].
/// - Then fetches a fresh copy from the network.
/// - On any error, silently retains the last known good value.
/// - Notifies listeners whenever [_config] changes.
class TvPlatformConfigService extends ChangeNotifier {
  TvPlatformConfigService._();
  static final instance = TvPlatformConfigService._();

  TvPlatformConfig _config = TvPlatformConfig.defaults;
  Timer? _refreshTimer;

  /// The current platform config. Always non-null; falls back to [TvPlatformConfig.defaults].
  TvPlatformConfig get config => _config;

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /// Load from cache then fetch fresh from network.
  ///
  /// Safe to call from main() or initState. Never throws.
  Future<void> fetch() async {
    await _loadFromCache();
    await _fetchFromNetwork();
  }

  /// Start a recurring 60-minute refresh. Call after [fetch] on TV startup.
  ///
  /// Calling this more than once cancels the previous timer.
  void startPeriodicRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(_kRefreshInterval, (_) => _fetchFromNetwork());
  }

  /// Cancel the periodic refresh timer (e.g., when the TV screen is disposed).
  void stopPeriodicRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = null;
  }

  @override
  void dispose() {
    stopPeriodicRefresh();
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  Future<void> _loadFromCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_kCacheKey);
      if (raw == null) return;
      final json = jsonDecode(raw) as Map<String, dynamic>;
      _config = TvPlatformConfig.fromJson(json);
      notifyListeners();
    } catch (e, st) {
      // Corrupted cache — keep defaults.
    }
  }

  Future<void> _fetchFromNetwork() async {
    try {
      final response = await http
          .get(Uri.parse(_kConfigUrl))
          .timeout(const Duration(seconds: 10));

      if (response.statusCode != 200) return;

      final raw = response.body;
      final json = jsonDecode(raw) as Map<String, dynamic>;
      final newConfig = TvPlatformConfig.fromJson(json);

      // Persist to cache before notifying, so the next cold start sees fresh data.
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kCacheKey, raw);

      _config = newConfig;
      notifyListeners();
    } catch (e, st) {
      // Offline or parse error — silently retain last good config.
    }
  }
}
