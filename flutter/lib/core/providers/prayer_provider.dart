import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest_10y.dart' as tz_data;

import '../../shared/models/settings_model.dart';
import 'settings_provider.dart';

bool _tzInitialised = false;

void _ensureTzData() {
  if (_tzInitialised) return;
  tz_data.initializeTimeZones();
  _tzInitialised = true;
}

/// The currently selected city.
final cityProvider = StateProvider<City?>((ref) => null);

/// Prayer times for the current city + date, recomputed when city/settings change.
final prayerTimesProvider = Provider<AsyncValue<PrayerTimes>>((ref) {
  final city = ref.watch(cityProvider);
  final settings = ref.watch(settingsProvider);

  if (city == null) return const AsyncValue.loading();

  try {
    _ensureTzData();
    final now = DateTime.now();
    final date = DateTime.utc(now.year, now.month, now.day, 12);
    final offset = _utcOffsetHours(city.timezone, date);
    final times = getTimes(date, city.lat, city.lng, offset, hanafi: settings.hanafi);
    return AsyncValue.data(times);
  } catch (e, st) {
    return AsyncValue.error(e, st);
  }
});

/// Prayer times for [dayOffset] days from today (0 = today, -1 = yesterday, 1 = tomorrow).
final prayerTimesForDayProvider =
    Provider.family<AsyncValue<PrayerTimes>, int>((ref, dayOffset) {
  final city = ref.watch(cityProvider);
  final settings = ref.watch(settingsProvider);

  if (city == null) return const AsyncValue.loading();

  try {
    _ensureTzData();
    final today = DateTime.now();
    final target = today.add(Duration(days: dayOffset));
    final date = DateTime.utc(target.year, target.month, target.day, 12);
    final offset = _utcOffsetHours(city.timezone, date);
    final times = getTimes(date, city.lat, city.lng, offset, hanafi: settings.hanafi);
    return AsyncValue.data(times);
  } catch (e, st) {
    return AsyncValue.error(e, st);
  }
});

/// Resolve a timezone identifier to a UTC offset in fractional hours for [date].
/// Handles both IANA names ("America/New_York") and "UTC±H" strings.
double _utcOffsetHours(String timezone, DateTime date) {
  // Legacy "UTC+5:30" strings (from GPS reverse-geocode fallback)
  if (timezone.startsWith('UTC')) {
    final rest = timezone.substring(3);
    if (rest.isEmpty) return 0.0;
    final sign = rest.startsWith('-') ? -1.0 : 1.0;
    final parts = rest.substring(1).split(':');
    final h = double.tryParse(parts[0]) ?? 0.0;
    final m = parts.length > 1 ? (double.tryParse(parts[1]) ?? 0.0) / 60.0 : 0.0;
    return sign * (h + m);
  }

  // IANA timezone lookup — accounts for DST
  try {
    final location = tz.getLocation(timezone);
    // Use a UTC time at solar noon on the requested date
    final utcNoon = DateTime.utc(date.year, date.month, date.day, 12);
    final tzTime = tz.TZDateTime.from(utcNoon, location);
    return tzTime.timeZoneOffset.inSeconds / 3600.0;
  } catch (_) {
    // Unknown timezone — fall back to longitude-based estimate (city from GPS)
    return 0.0;
  }
}
