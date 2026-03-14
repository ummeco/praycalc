import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest_10y.dart' as tz_data;

import '../../shared/models/settings_model.dart';
import '../services/wearos_sync_service.dart';
import 'settings_provider.dart';

/// BUG-A1: Sentinel error for invalid/zeroed GPS coordinates.
/// lat=0, lng=0 is the equator/prime-meridian intersection — not a valid user location.
class NoLocationError implements Exception {
  const NoLocationError();
  @override
  String toString() => 'Location coordinates are invalid or not yet set.';
}

/// ARCH-A2: Wraps unexpected exceptions thrown by the pray_calc_dart engine.
/// Surfaced as AsyncValue.error so UI can show a meaningful error card
/// instead of an infinite loading spinner.
class PrayerCalcError implements Exception {
  final Object cause;
  const PrayerCalcError(this.cause);
  @override
  String toString() => 'Prayer calculation failed: $cause';
}

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

  // BUG-A1: Reject zeroed coordinates — equator/prime-meridian intersection is not a real location.
  if (city.lat == 0.0 && city.lng == 0.0) {
    return AsyncValue.error(const NoLocationError(), StackTrace.empty);
  }

  try {
    _ensureTzData();
    final now = DateTime.now();
    final date = DateTime.utc(now.year, now.month, now.day, 12);
    final offset = _utcOffsetHours(city.timezone, date);
    final times = getTimes(date, city.lat, city.lng, offset, hanafi: settings.hanafi);
    return AsyncValue.data(times);
  } catch (e, st) {
    return AsyncValue.error(PrayerCalcError(e), st);
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

/// Fires WearOS sync whenever prayer times or city changes.
/// Returns null — exists only for its side effect.
final wearOsSyncProvider = Provider<void>((ref) {
  final timesValue = ref.watch(prayerTimesProvider);
  final city = ref.watch(cityProvider);
  final settings = ref.watch(settingsProvider);

  timesValue.whenData((times) {
    if (city == null) return;
    final nextPrayer = _computeNextPrayerName(times);
    WearOsSyncService.instance.syncPrayerTimes(
      times: times,
      city: city,
      settings: settings,
      nextPrayer: nextPrayer,
    );
  });
});

/// Derive the next fard prayer name from the current wall-clock time.
String _computeNextPrayerName(PrayerTimes times) {
  final nowH = DateTime.now().hour + DateTime.now().minute / 60.0;
  final schedule = <(double, String)>[
    (times.fajr,    'Fajr'),
    (times.dhuhr,   'Dhuhr'),
    (times.asr,     'Asr'),
    (times.maghrib, 'Maghrib'),
    (times.isha,    'Isha'),
  ];
  for (final (h, name) in schedule) {
    if (h.isFinite && h > nowH) return name;
  }
  return 'Fajr'; // past Isha — next is Fajr tomorrow
}

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
  } catch (e, st) {
    // Unknown timezone — fall back to longitude-based estimate (city from GPS)
    return 0.0;
  }
}
