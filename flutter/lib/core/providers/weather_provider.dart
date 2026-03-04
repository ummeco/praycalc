import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/weather_service.dart';
import 'settings_provider.dart';

/// Riverpod provider for weather data.
///
/// Watches the current city coordinates and fetches weather on change.
/// Auto-refreshes every 60 minutes while active.
class WeatherNotifier extends Notifier<WeatherData?> {
  Timer? _refreshTimer;

  @override
  WeatherData? build() {
    _init();
    ref.onDispose(_dispose);
    return WeatherService.instance.cached;
  }

  void _init() {
    if (!WeatherService.instance.isConfigured) return;

    // Watch city changes to trigger refresh.
    ref.listen(settingsProvider, (prev, next) {
      final prevLat = prev?.homeLat;
      final nextLat = next.homeLat;
      if (prevLat != nextLat && nextLat != null) {
        refresh();
      }
    });

    // Auto-refresh every 60 minutes.
    _refreshTimer = Timer.periodic(
      const Duration(minutes: WeatherService.cacheDurationMinutes),
      (_) => refresh(),
    );

    // Initial fetch.
    Future.microtask(refresh);
  }

  /// Fetch or refresh weather for the current city.
  Future<void> refresh() async {
    final settings = ref.read(settingsProvider);
    final lat = settings.homeLat;
    final lng = settings.homeLng;
    if (lat == null || lng == null) return;

    final data = await WeatherService.instance.fetch(lat, lng);
    state = data;
  }

  void _dispose() {
    _refreshTimer?.cancel();
    _refreshTimer = null;
  }
}

final weatherProvider = NotifierProvider<WeatherNotifier, WeatherData?>(
  WeatherNotifier.new,
);
