import 'dart:math' as math;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'prayer_provider.dart';
import 'settings_provider.dart';

/// Minimum distance in km before Qasr is available (Hanafi: 77 km).
const _kQasrThresholdKm = 77.0;

class TravelState {
  /// True when travel mode is enabled AND the user is > 77 km from home.
  final bool isTraveling;

  /// Distance in km from home city. 0 when home coords are unknown.
  final double distanceKm;

  /// Whether the user has enabled Qasr (shortened) prayers.
  /// Toggled manually — not automatically set when travel is detected.
  final bool isQasr;

  const TravelState({
    required this.isTraveling,
    required this.distanceKm,
    required this.isQasr,
  });

  TravelState copyWith({bool? isTraveling, double? distanceKm, bool? isQasr}) =>
      TravelState(
        isTraveling: isTraveling ?? this.isTraveling,
        distanceKm: distanceKm ?? this.distanceKm,
        isQasr: isQasr ?? this.isQasr,
      );
}

class TravelNotifier extends Notifier<TravelState> {
  static const _kQasrKey = 'pc_qasr_enabled';

  @override
  TravelState build() {
    final city = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);

    if (!settings.travelModeEnabled ||
        city == null ||
        settings.homeLat == null ||
        settings.homeLng == null) {
      return const TravelState(isTraveling: false, distanceKm: 0, isQasr: false);
    }

    final dist = _haversineKm(
      settings.homeLat!,
      settings.homeLng!,
      city.lat,
      city.lng,
    );
    final traveling = dist >= _kQasrThresholdKm;

    // Load persisted Qasr preference (fire-and-forget, state updated below).
    _loadQasr(traveling);

    return TravelState(isTraveling: traveling, distanceKm: dist, isQasr: false);
  }

  Future<void> _loadQasr(bool traveling) async {
    if (!traveling) return;
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getBool(_kQasrKey) ?? false;
    if (saved) {
      state = state.copyWith(isQasr: true);
    }
  }

  Future<void> toggleQasr() async {
    final next = !state.isQasr;
    state = state.copyWith(isQasr: next);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kQasrKey, next);
  }
}

final travelProvider = NotifierProvider<TravelNotifier, TravelState>(
  TravelNotifier.new,
);

/// Auto-sets home coordinates to the first city the user selects,
/// so travel distance can be computed without manual configuration.
///
/// Mount once near the app root:
///   ref.listen(travelHomeAutosetProvider, (_, _) {});
final travelHomeAutosetProvider = Provider<void>((ref) {
  final city = ref.watch(cityProvider);
  final settings = ref.watch(settingsProvider);

  if (city == null) return;
  if (settings.homeLat != null) return; // already set

  // First city selected and no home coords yet — save as home.
  Future.microtask(() async {
    try {
      await ref.read(settingsProvider.notifier).setHomeCoords(city.lat, city.lng);
    } catch (_) {}
  });
});

/// Haversine great-circle distance in kilometres.
double _haversineKm(double lat1, double lng1, double lat2, double lng2) {
  const r = 6371.0; // Earth radius km
  final dLat = _deg2rad(lat2 - lat1);
  final dLng = _deg2rad(lng2 - lng1);
  final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
      math.cos(_deg2rad(lat1)) *
          math.cos(_deg2rad(lat2)) *
          math.sin(dLng / 2) *
          math.sin(dLng / 2);
  return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
}

double _deg2rad(double deg) => deg * math.pi / 180.0;
