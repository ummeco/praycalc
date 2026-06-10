import 'dart:convert';

import 'package:http/http.dart' as http;

/// OpenWeatherMap API key injected at build time via --dart-define.
const _kApiKey = String.fromEnvironment(
  'OPENWEATHERMAP_API_KEY',
  defaultValue: '',
);

/// Current weather data from OpenWeatherMap.
class WeatherData {
  final double tempCelsius;
  final double feelsLikeCelsius;
  final String description;
  final String icon;
  final int humidity;
  final DateTime fetchedAt;

  const WeatherData({
    required this.tempCelsius,
    required this.feelsLikeCelsius,
    required this.description,
    required this.icon,
    required this.humidity,
    required this.fetchedAt,
  });

  double get tempFahrenheit => tempCelsius * 9 / 5 + 32;
  double get feelsLikeFahrenheit => feelsLikeCelsius * 9 / 5 + 32;

  /// Whether this data is older than the cache duration.
  bool get isStale =>
      DateTime.now().difference(fetchedAt).inMinutes > WeatherService.cacheDurationMinutes;

  /// Weather condition emoji based on the OpenWeatherMap icon code.
  String get emoji {
    switch (icon.substring(0, 2)) {
      case '01':
        return '☀️';
      case '02':
        return '⛅';
      case '03':
      case '04':
        return '☁️';
      case '09':
        return '🌧️';
      case '10':
        return '🌦️';
      case '11':
        return '⛈️';
      case '13':
        return '❄️';
      case '50':
        return '🌫️';
      default:
        return '🌤️';
    }
  }

  factory WeatherData.fromJson(Map<String, dynamic> json) {
    final main = json['main'] as Map<String, dynamic>;
    final weather = (json['weather'] as List).first as Map<String, dynamic>;
    return WeatherData(
      tempCelsius: (main['temp'] as num).toDouble() - 273.15,
      feelsLikeCelsius: (main['feels_like'] as num).toDouble() - 273.15,
      description: weather['description'] as String,
      icon: weather['icon'] as String,
      humidity: main['humidity'] as int,
      fetchedAt: DateTime.now(),
    );
  }
}

/// Temperature display format.
enum TempUnit { celsius, fahrenheit, both }

/// Weather service with in-memory cache.
///
/// Calls OpenWeatherMap Current Weather API. Caches for 60 minutes.
/// Requires OPENWEATHERMAP_API_KEY via --dart-define.
class WeatherService {
  WeatherService._();
  static final instance = WeatherService._();

  static const cacheDurationMinutes = 60;

  WeatherData? _cached;
  double? _lastLat;
  double? _lastLng;

  /// Whether the API key is configured.
  bool get isConfigured => _kApiKey.isNotEmpty;

  /// Get the cached weather data (may be null or stale).
  WeatherData? get cached => _cached;

  /// Fetch current weather for the given coordinates.
  ///
  /// Returns cached data if still fresh and coordinates haven't changed
  /// significantly (within ~1km).
  Future<WeatherData?> fetch(double lat, double lng) async {
    if (!isConfigured) return null;

    // Return cache if still fresh and same location.
    if (_cached != null &&
        !_cached!.isStale &&
        _lastLat != null &&
        (lat - _lastLat!).abs() < 0.01 &&
        (lng - _lastLng!).abs() < 0.01) {
      return _cached;
    }

    try {
      final uri = Uri.parse(
        'https://api.openweathermap.org/data/2.5/weather'
        '?lat=$lat&lon=$lng&appid=$_kApiKey',
      );
      final response = await http.get(uri).timeout(
        const Duration(seconds: 5),
      );
      if (response.statusCode == 200) {
        _cached = WeatherData.fromJson(
          jsonDecode(response.body) as Map<String, dynamic>,
        );
        _lastLat = lat;
        _lastLng = lng;
        return _cached;
      }
    } catch (_) {
      // Return stale cache on network error.
    }
    return _cached;
  }

  /// Clear the cache.
  void clear() {
    _cached = null;
    _lastLat = null;
    _lastLng = null;
  }
}
