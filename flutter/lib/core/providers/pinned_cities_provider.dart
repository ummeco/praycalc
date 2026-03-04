import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../shared/models/settings_model.dart';
import 'settings_provider.dart';

/// Maximum number of pinned cities for free users.
const _maxPinnedCities = 5;

/// SharedPreferences key for the pinned cities JSON list.
const _prefsKey = 'pc_pinned_cities';

/// Generates a stable key for a city based on its coordinates.
String cityKey(City city) =>
    '${city.lat.toStringAsFixed(4)}_${city.lng.toStringAsFixed(4)}';

/// Serialise a [City] to a JSON-compatible map.
Map<String, dynamic> _cityToJson(City city) => {
      'name': city.name,
      'country': city.country,
      'state': city.state,
      'lat': city.lat,
      'lng': city.lng,
      'timezone': city.timezone,
    };

/// Deserialise a [City] from a JSON map.
City _cityFromJson(Map<String, dynamic> json) => City(
      name: json['name'] as String,
      country: json['country'] as String,
      state: json['state'] as String?,
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      timezone: json['timezone'] as String,
    );

/// Notifier that manages the list of pinned (saved) cities.
///
/// Backed by [SharedPreferences] so pins persist across app restarts.
/// Free users are limited to [_maxPinnedCities] pinned cities.
class PinnedCitiesNotifier extends Notifier<List<City>> {
  @override
  List<City> build() {
    Future.microtask(_load);
    return const [];
  }

  // ── Persistence ──────────────────────────────────────────────────────────

  Future<void> _load() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    final raw = prefs.getString(_prefsKey);
    if (raw == null || raw.isEmpty) return;

    try {
      final list = (jsonDecode(raw) as List)
          .cast<Map<String, dynamic>>()
          .map(_cityFromJson)
          .toList();
      state = list;
    } catch (_) {
      // Corrupted data — reset silently.
      state = [];
    }
  }

  Future<void> _save() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    final encoded = jsonEncode(state.map(_cityToJson).toList());
    await prefs.setString(_prefsKey, encoded);
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /// Pin a city. Returns `true` if added, `false` if the limit was reached.
  bool pin(City city) {
    if (isPinned(city)) return true;
    if (state.length >= _maxPinnedCities) return false;

    state = [...state, city];
    _save();
    return true;
  }

  /// Unpin a city by its coordinate key.
  void unpin(String key) {
    state = state.where((c) => cityKey(c) != key).toList();
    _save();
  }

  /// Reorder pinned cities (drag-and-drop support).
  void reorder(int oldIdx, int newIdx) {
    if (oldIdx < 0 || oldIdx >= state.length) return;
    if (newIdx < 0 || newIdx >= state.length) return;
    if (oldIdx == newIdx) return;

    final updated = List<City>.from(state);
    final item = updated.removeAt(oldIdx);
    updated.insert(newIdx, item);
    state = updated;
    _save();
  }

  /// Whether a city is already pinned.
  bool isPinned(City city) {
    final key = cityKey(city);
    return state.any((c) => cityKey(c) == key);
  }
}

/// Provider for the list of pinned cities.
final pinnedCitiesProvider =
    NotifierProvider<PinnedCitiesNotifier, List<City>>(
  PinnedCitiesNotifier.new,
);
