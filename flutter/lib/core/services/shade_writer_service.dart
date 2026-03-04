import 'package:shared_preferences/shared_preferences.dart';

import '../../shared/models/moon_phase.dart';

/// Writes prayer-related data to SharedPreferences for native Android
/// components (ForegroundNotificationService, DreamService, widgets).
///
/// Native Kotlin code reads these keys with the "flutter." prefix that
/// the shared_preferences package adds automatically.
class ShadeWriterService {
  ShadeWriterService._();
  static final instance = ShadeWriterService._();

  /// Update the next prayer name and countdown for the notification shade
  /// and DreamService screensaver.
  Future<void> updateNextPrayer({
    required String prayerName,
    required String countdown,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('next_prayer_name', prayerName);
    await prefs.setString('next_prayer_countdown', countdown);
  }

  /// Update the moon phase emoji for the DreamService screensaver.
  Future<void> updateMoonEmoji(DateTime date) async {
    final prefs = await SharedPreferences.getInstance();
    final result = MoonPhase.calculate(date);
    await prefs.setString('dream_moon_emoji', MoonPhase.phaseEmoji(result.phase));
  }

  /// Update Ramadan countdown values for the notification shade.
  Future<void> updateRamadanCountdown({
    int? sahurMinsRemaining,
    int? iftarMinsRemaining,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    if (sahurMinsRemaining != null) {
      await prefs.setInt('sahur_mins_remaining', sahurMinsRemaining);
    } else {
      await prefs.remove('sahur_mins_remaining');
    }
    if (iftarMinsRemaining != null) {
      await prefs.setInt('iftar_mins_remaining', iftarMinsRemaining);
    } else {
      await prefs.remove('iftar_mins_remaining');
    }
  }

  /// Clear all shade data (e.g., on sign out or when prayer data is stale).
  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('next_prayer_name');
    await prefs.remove('next_prayer_countdown');
    await prefs.remove('dream_moon_emoji');
    await prefs.remove('sahur_mins_remaining');
    await prefs.remove('iftar_mins_remaining');
  }
}
