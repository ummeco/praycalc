import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../shared/models/settings_model.dart';

/// Async provider for SharedPreferences instance (loaded once at startup).
final sharedPrefsProvider = FutureProvider<SharedPreferences>(
  (ref) => SharedPreferences.getInstance(),
);

/// Settings notifier — backed by SharedPreferences.
class SettingsNotifier extends Notifier<AppSettings> {
  @override
  AppSettings build() {
    // Load persisted settings asynchronously after first render with defaults.
    Future.microtask(load);
    return const AppSettings();
  }

  Future<void> load() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    state = AppSettings.fromPrefs({
      'hanafi': prefs.getBool('hanafi'),
      'use24h': prefs.getBool('use24h'),
      'darkMode': prefs.getBool('darkMode'),
      'followSystem': prefs.getBool('followSystem'),
      'locale': prefs.getString('locale'),
      'sky_gradient_enabled': prefs.getBool('sky_gradient_enabled'),
      'sky_gradient_weather': prefs.getBool('sky_gradient_weather'),
      'countdown_animation_enabled': prefs.getBool('countdown_animation_enabled'),
      'prayer_tracking_enabled': prefs.getBool('prayer_tracking_enabled'),
      'jumuah_kahf_reminder': prefs.getBool('jumuah_kahf_reminder'),
      'travel_mode_enabled': prefs.getBool('travel_mode_enabled'),
      'home_lat': prefs.getDouble('home_lat'),
      'home_lng': prefs.getDouble('home_lng'),
    });
  }

  Future<void> update(AppSettings updated) async {
    state = updated;
    final prefs = await ref.read(sharedPrefsProvider.future);
    for (final e in updated.toPrefs().entries) {
      final v = e.value;
      if (v == null) {
        await prefs.remove(e.key);
      } else if (v is bool) {
        await prefs.setBool(e.key, v);
      } else if (v is double) {
        await prefs.setDouble(e.key, v);
      } else if (v is String) {
        await prefs.setString(e.key, v);
      }
    }
  }

  Future<void> setHanafi(bool v) => update(state.copyWith(hanafi: v));
  Future<void> setUse24h(bool v) => update(state.copyWith(use24h: v));
  Future<void> setDarkMode(bool v) =>
      update(state.copyWith(darkMode: v, followSystem: false));
  Future<void> setFollowSystem(bool v) => update(state.copyWith(followSystem: v));
  Future<void> setLocale(String? v) => update(state.copyWith(locale: v));
  Future<void> setSkyGradientEnabled(bool v) =>
      update(state.copyWith(skyGradientEnabled: v));
  Future<void> setSkyGradientWeather(bool v) =>
      update(state.copyWith(skyGradientWeather: v));
  Future<void> setCountdownAnimationEnabled(bool v) =>
      update(state.copyWith(countdownAnimationEnabled: v));
  Future<void> setPrayerTrackingEnabled(bool v) =>
      update(state.copyWith(prayerTrackingEnabled: v));
  Future<void> setJumuahKahfReminder(bool v) =>
      update(state.copyWith(jumuahKahfReminder: v));
  Future<void> setTravelModeEnabled(bool v) =>
      update(state.copyWith(travelModeEnabled: v));
  Future<void> setHomeCoords(double lat, double lng) =>
      update(state.copyWith(homeLat: lat, homeLng: lng));
  Future<void> clearHomeCoords() =>
      update(state.copyWith(homeLat: null, homeLng: null));
}

final settingsProvider = NotifierProvider<SettingsNotifier, AppSettings>(
  SettingsNotifier.new,
);
