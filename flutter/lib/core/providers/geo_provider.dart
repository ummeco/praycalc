import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart' as gc;
import 'package:shared_preferences/shared_preferences.dart';

import '../../shared/models/settings_model.dart';

// ─── GPS state ────────────────────────────────────────────────────────────────

enum GpsStatus { idle, requesting, denied, unavailable, acquired }

class GpsState {
  final GpsStatus status;
  final double? lat;
  final double? lng;
  final String? errorMessage;

  const GpsState({
    this.status = GpsStatus.idle,
    this.lat,
    this.lng,
    this.errorMessage,
  });

  bool get hasPosition => lat != null && lng != null;
}

// ─── GPS notifier ─────────────────────────────────────────────────────────────

class GpsNotifier extends Notifier<GpsState> {
  @override
  GpsState build() => const GpsState();

  Future<void> requestLocation() async {
    state = const GpsState(status: GpsStatus.requesting);

    // Check service availability
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      state = const GpsState(
        status: GpsStatus.unavailable,
        errorMessage: 'Location services are disabled.',
      );
      return;
    }

    // Check / request permission
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      state = const GpsState(
        status: GpsStatus.denied,
        errorMessage: 'Location permission denied.',
      );
      return;
    }

    try {
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.reduced, // city-level is sufficient
          timeLimit: Duration(seconds: 10),
        ),
      );
      state = GpsState(
        status: GpsStatus.acquired,
        lat: pos.latitude,
        lng: pos.longitude,
      );
    } catch (e) {
      state = GpsState(
        status: GpsStatus.unavailable,
        errorMessage: e.toString(),
      );
    }
  }
}

final gpsProvider = NotifierProvider<GpsNotifier, GpsState>(GpsNotifier.new);

// ─── Reverse-geocode GPS → City ───────────────────────────────────────────────

/// Attempts to detect city name from GPS coordinates.
/// Returns a [City] or null on failure.
Future<City?> reverseGeocodeToCity(double lat, double lng) async {
  try {
    final placemarks = await gc.placemarkFromCoordinates(lat, lng);
    if (placemarks.isEmpty) return null;
    final p = placemarks.first;
    final name = p.locality ?? p.subAdministrativeArea ?? p.administrativeArea ?? 'Unknown';
    final country = p.country ?? '';
    final state = p.administrativeArea;
    // Best-effort timezone: stored when a city is selected from search;
    // for GPS fallback we use a UTC-based estimate (improved in PC-3.5 final).
    final tzOffsetH = _estimateUtcOffset(lng);
    final tzStr = _offsetToUtcString(tzOffsetH);
    return City(
      name: name,
      country: country,
      state: state,
      lat: lat,
      lng: lng,
      timezone: tzStr,
    );
  } catch (_) {
    return null;
  }
}

/// Rough UTC offset from longitude (±15° per hour).
double _estimateUtcOffset(double lng) => (lng / 15.0).roundToDouble();

String _offsetToUtcString(double offset) {
  if (offset == 0) return 'UTC';
  final sign = offset > 0 ? '+' : '-';
  final abs = offset.abs();
  final h = abs.truncate();
  final m = ((abs - h) * 60).round();
  return m == 0 ? 'UTC$sign$h' : 'UTC$sign$h:${m.toString().padLeft(2, '0')}';
}

// ─── Persisted last-city ──────────────────────────────────────────────────────

const _kCityName = 'lastCity_name';
const _kCityCountry = 'lastCity_country';
const _kCityState = 'lastCity_state';
const _kCityLat = 'lastCity_lat';
const _kCityLng = 'lastCity_lng';
const _kCityTz = 'lastCity_tz';

Future<City?> loadLastCity() async {
  final prefs = await SharedPreferences.getInstance();
  final name = prefs.getString(_kCityName);
  if (name == null) return null;
  return City(
    name: name,
    country: prefs.getString(_kCityCountry) ?? '',
    state: prefs.getString(_kCityState),
    lat: prefs.getDouble(_kCityLat) ?? 0,
    lng: prefs.getDouble(_kCityLng) ?? 0,
    timezone: prefs.getString(_kCityTz) ?? 'UTC',
  );
}

Future<void> persistCity(City city, WidgetRef ref) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString(_kCityName, city.name);
  await prefs.setString(_kCityCountry, city.country);
  if (city.state != null) await prefs.setString(_kCityState, city.state!);
  await prefs.setDouble(_kCityLat, city.lat);
  await prefs.setDouble(_kCityLng, city.lng);
  await prefs.setString(_kCityTz, city.timezone);
}
