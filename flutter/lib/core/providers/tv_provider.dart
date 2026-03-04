import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';

import '../../shared/models/tv_settings_model.dart';
import 'prayer_provider.dart';
import 'settings_provider.dart';

const _kTvSettingsKey = 'tv_settings';

/// Notifier for TV-specific settings, persisted via SharedPreferences.
class TvSettingsNotifier extends Notifier<TvSettings> {
  @override
  TvSettings build() {
    Future.microtask(load);
    return const TvSettings();
  }

  Future<void> load() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    final raw = prefs.getString(_kTvSettingsKey);
    if (raw != null) {
      try {
        state = TvSettings.decode(raw);
      } catch (_) {
        // Corrupted data: keep defaults.
      }
    }
  }

  Future<void> _persist() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    await prefs.setString(_kTvSettingsKey, state.encode());
  }

  Future<void> update(TvSettings updated) async {
    state = updated;
    await _persist();
  }

  Future<void> setMasjidMode(bool v) =>
      update(state.copyWith(isMasjidMode: v));

  Future<void> setMasjidName(String v) =>
      update(state.copyWith(masjidName: v));

  Future<void> setIqamahOffset(String prayer, int minutes) {
    final offsets = Map<String, int>.from(state.iqamahOffsets);
    offsets[prayer] = minutes.clamp(0, 60);
    return update(state.copyWith(iqamahOffsets: offsets));
  }

  Future<void> setShowQrCode(bool v) =>
      update(state.copyWith(showQrCode: v));

  Future<void> setQrCodeUrl(String? v) =>
      update(state.copyWith(qrCodeUrl: v));

  Future<void> setAmbientIntervalSeconds(int v) =>
      update(state.copyWith(ambientIntervalSeconds: v.clamp(30, 120)));

  Future<void> setAmbientIdleMinutes(int v) =>
      update(state.copyWith(ambientIdleMinutes: v.clamp(1, 60)));

  Future<void> setScreensaverMode(String v) =>
      update(state.copyWith(screensaverMode: v));

  Future<void> setScreensaverCategory(String v) =>
      update(state.copyWith(screensaverCategory: v));

  Future<void> setAnnouncements(List<Announcement> list) =>
      update(state.copyWith(announcements: list));

  Future<void> addAnnouncement(Announcement a) {
    final list = [...state.announcements, a];
    // Cap at 10 announcements.
    if (list.length > 10) list.removeAt(0);
    return update(state.copyWith(announcements: list));
  }

  Future<void> removeAnnouncement(String id) {
    final list =
        state.announcements.where((a) => a.id != id).toList();
    return update(state.copyWith(announcements: list));
  }
}

/// Provider for TV settings.
final tvSettingsProvider =
    NotifierProvider<TvSettingsNotifier, TvSettings>(
  TvSettingsNotifier.new,
);

/// Computed iqamah times: prayer name -> fractional hours for the iqamah.
/// Adds the configured offset (in minutes) to the adhan time.
final iqamahTimesProvider =
    Provider<Map<String, double>>((ref) {
  final tvSettings = ref.watch(tvSettingsProvider);
  final timesAsync = ref.watch(prayerTimesProvider);

  return timesAsync.when(
    loading: () => {},
    error: (_, _) => {},
    data: (times) {
      final result = <String, double>{};
      final prayerGetters = <String, double Function(PrayerTimes)>{
        'Fajr': (t) => t.fajr,
        'Dhuhr': (t) => t.dhuhr,
        'Asr': (t) => t.asr,
        'Maghrib': (t) => t.maghrib,
        'Isha': (t) => t.isha,
      };

      for (final entry in prayerGetters.entries) {
        final adhanH = entry.value(times);
        if (!adhanH.isFinite) continue;
        final offsetMin =
            tvSettings.iqamahOffsets[entry.key] ?? 15;
        result[entry.key] = adhanH + (offsetMin / 60.0);
      }

      return result;
    },
  );
});
