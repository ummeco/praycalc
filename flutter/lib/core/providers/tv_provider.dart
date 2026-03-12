import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';

import '../../features/tv/tv_quran_service.dart';
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

  Future<void> setMediaPauseEnabled(bool v) =>
      update(state.copyWith(mediaPauseEnabled: v));

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

  // ---------------------------------------------------------------------------
  // Layout setters (TV2-1.9)
  // ---------------------------------------------------------------------------

  Future<void> setLayoutSettings(TvLayoutSettings v) =>
      update(state.copyWith(layoutSettings: v));

  // ---------------------------------------------------------------------------
  // Per-prayer alert config setters (TV2-8.x)
  // ---------------------------------------------------------------------------

  Future<void> setPrayerAlertConfig(
      String prayer, TvPrayerAlertConfig config) {
    final configs =
        Map<String, TvPrayerAlertConfig>.from(state.prayerAlertConfigs);
    configs[prayer] = config;
    return update(state.copyWith(prayerAlertConfigs: configs));
  }

  Future<void> setGlobalAudioMode(TvAudioMode v) =>
      update(state.copyWith(globalAudioMode: v));

  Future<void> setDefaultBubblePosition(TvBubblePosition v) =>
      update(state.copyWith(defaultBubblePosition: v));

  // ---------------------------------------------------------------------------
  // Kiosk mode setters (TV2-11.x)
  // ---------------------------------------------------------------------------

  Future<void> setKioskMode(bool v) =>
      update(state.copyWith(kioskMode: v));

  Future<void> setKioskPinHash(String v) =>
      update(state.copyWith(kioskPinHash: v));

  // ---------------------------------------------------------------------------
  // Audio / stream setters (TV2-4.x)
  // ---------------------------------------------------------------------------

  Future<void> setTvAudioMode(String v) =>
      update(state.copyWith(tvAudioMode: v));

  Future<void> setSelectedStreamId(String v) =>
      update(state.copyWith(selectedStreamId: v));

  Future<void> setSelectedReciterId(String v) =>
      update(state.copyWith(selectedReciterId: v));

  Future<void> setQuranPlaybackMode(QuranPlaybackMode v) =>
      update(state.copyWith(quranPlaybackMode: v));

  Future<void> setQuranSpecificSurah(int? v) =>
      update(state.copyWith(quranSpecificSurah: v));

  // ---------------------------------------------------------------------------
  // Donation QR setters (TV2-11.4)
  // ---------------------------------------------------------------------------

  Future<void> setDonationQrMode(String v) =>
      update(state.copyWith(donationQrMode: v));

  Future<void> setDonationQrUrl(String? v) =>
      update(state.copyWith(donationQrUrl: v));

  // ---------------------------------------------------------------------------
  // Brightness schedule setters (TV2-6.x)
  // ---------------------------------------------------------------------------

  Future<void> setBrightnessSchedule(List<TvBrightnessRule> v) =>
      update(state.copyWith(brightnessSchedule: v));

  Future<void> setPrayerBrightnessOverride(String prayer, int brightness) {
    final overrides = Map<String, int>.from(state.prayerBrightnessOverrides);
    overrides[prayer] = brightness.clamp(0, 100);
    return update(state.copyWith(prayerBrightnessOverrides: overrides));
  }

  Future<void> clearPrayerBrightnessOverride(String prayer) {
    final overrides = Map<String, int>.from(state.prayerBrightnessOverrides);
    overrides.remove(prayer);
    return update(state.copyWith(prayerBrightnessOverrides: overrides));
  }

  // ---------------------------------------------------------------------------
  // Jumu'ah + second timezone setters (TV2-9.2, TV2-9.7)
  // ---------------------------------------------------------------------------

  Future<void> setJumuahKhutbahTime(int hour, int minute) => update(
        state.copyWith(
          jumuahKhutbahHour: hour.clamp(0, 23),
          jumuahKhutbahMinute: minute.clamp(0, 59),
        ),
      );

  Future<void> setSecondCity(
      String? slug, String? timeZone, double? lat, double? lng) =>
      update(state.copyWith(
        secondCitySlug: slug,
        secondCityTimeZone: timeZone,
        secondCityLat: lat,
        secondCityLng: lng,
      ));

  // ---------------------------------------------------------------------------
  // Info bar config setters (TV2-2.5)
  // ---------------------------------------------------------------------------

  Future<void> setInfoBarConfig(TvInfoBarConfig v) =>
      update(state.copyWith(infoBarConfig: v));

  // ---------------------------------------------------------------------------
  // Night mode / brightness setters (TV2-6.5)
  // ---------------------------------------------------------------------------

  Future<void> setNightModeEnabled(bool v) =>
      update(state.copyWith(nightModeEnabled: v));

  Future<void> setCurrentBrightness(int v) =>
      update(state.copyWith(currentBrightness: v.clamp(0, 100)));

  // ---------------------------------------------------------------------------
  // Photo source / categories setters (TV2-7.5)
  // ---------------------------------------------------------------------------

  Future<void> setPhotoSource(String v) =>
      update(state.copyWith(photoSource: v));

  Future<void> setUseBundledWallpapers(bool v) =>
      update(state.copyWith(useBundledWallpapers: v));

  Future<void> setPhotoCategories(List<String> v) =>
      update(state.copyWith(photoCategories: v));

  // ---------------------------------------------------------------------------
  // Slideshow timing setters (TV2-7.6)
  // ---------------------------------------------------------------------------

  Future<void> setSlideshowDurationSeconds(int v) =>
      update(state.copyWith(slideshowDurationSeconds: v));

  Future<void> setSlideshowTransition(String v) =>
      update(state.copyWith(slideshowTransition: v));

  // ---------------------------------------------------------------------------
  // Overlay density setter (TV2-7.8)
  // ---------------------------------------------------------------------------

  Future<void> setOverlayDensity(String v) =>
      update(state.copyWith(overlayDensity: v));

  // ---------------------------------------------------------------------------
  // Screensaver idle timeout setter (TV2-7.9)
  // ---------------------------------------------------------------------------

  Future<void> setScreensaverIdleSeconds(int v) =>
      update(state.copyWith(screensaverIdleSeconds: v));

  // ---------------------------------------------------------------------------
  // Custom stream setters (TV2-3.5)
  // ---------------------------------------------------------------------------

  Future<void> addCustomStream(TvCustomStream s) {
    final list = [...state.customStreams, s];
    return update(state.copyWith(customStreams: list));
  }

  Future<void> removeCustomStream(String id) {
    final list = state.customStreams.where((s) => s.id != id).toList();
    return update(state.copyWith(customStreams: list));
  }

  // ---------------------------------------------------------------------------
  // P-1 — Sky background setter
  // ---------------------------------------------------------------------------

  Future<void> setSkyBackgroundEnabled(bool v) =>
      update(state.copyWith(skyBackgroundEnabled: v));

  // ---------------------------------------------------------------------------
  // P-8 — Geometric pattern setters
  // ---------------------------------------------------------------------------

  Future<void> setGeometricPatternEnabled(bool v) =>
      update(state.copyWith(geometricPatternEnabled: v));

  Future<void> setGeometricPatternStyle(String v) =>
      update(state.copyWith(geometricPatternStyle: v));

  // ---------------------------------------------------------------------------
  // P-17 — Font scale setter
  // ---------------------------------------------------------------------------

  Future<void> setTvFontScale(double v) =>
      update(state.copyWith(tvFontScale: v.clamp(0.8, 1.6)));

  // ---------------------------------------------------------------------------
  // P-14 — Good Night mode setters
  // ---------------------------------------------------------------------------

  Future<void> setGoodNightEnabled(bool v) =>
      update(state.copyWith(goodNightEnabled: v));

  Future<void> setGoodNightDelayMinutes(int v) =>
      update(state.copyWith(goodNightDelayMinutes: v.clamp(0, 120)));

  // ---------------------------------------------------------------------------
  // Y-1 — Children's mode
  // ---------------------------------------------------------------------------

  Future<void> setChildrenModeEnabled(bool v) =>
      update(state.copyWith(childrenModeEnabled: v));

  // ---------------------------------------------------------------------------
  // TV2-11.3 — Kiosk layout enforcement
  // ---------------------------------------------------------------------------

  /// Returns the effective layout preset, forcing [TvLayoutPreset.masjid]
  /// when kiosk mode is active.
  TvLayoutPreset get effectiveLayoutPreset {
    if (state.kioskMode) return TvLayoutPreset.masjid;
    return state.layoutSettings.preset;
  }
}

/// Provider for TV settings.
final tvSettingsProvider =
    NotifierProvider<TvSettingsNotifier, TvSettings>(
  TvSettingsNotifier.new,
);

// ---------------------------------------------------------------------------
// Iqamah countdown provider (TV2-8.7)
// ---------------------------------------------------------------------------

/// Seconds remaining until iqamah for the currently-active prayer.
///
/// Yields null when no adhan alert is active. Non-null values are emitted
/// every second by TvAdhanNotifier once an alert fires (wired at that layer).
/// Consumers drive [TvAdhanBubble] and [TvPostAdhanBar] countdowns.
final iqamahCountdownProvider = StreamProvider<int?>((ref) async* {
  // Driven by TvAdhanNotifier in a real implementation. Yields null until
  // the notifier broadcasts a countdown stream.
  yield null;
});

// ---------------------------------------------------------------------------
// Iqamah times provider
// ---------------------------------------------------------------------------

/// Riverpod provider for the TV Quran audio service.
/// ChangeNotifierProvider auto-disposes the ChangeNotifier when the scope is destroyed.
final tvQuranServiceProvider = ChangeNotifierProvider<TvQuranService>(
  (ref) => TvQuranService(),
);

// ---------------------------------------------------------------------------
// Iqamah times provider
// ---------------------------------------------------------------------------

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
