import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'prayer_provider.dart';

/// Lightweight Ramadan state — computed from the current Hijri date.
class RamadanState {
  /// True when the current Hijri month is Ramadan (month 9).
  final bool isRamadan;

  /// Current Hijri day of Ramadan (1–30). 0 when not Ramadan.
  final int hDay;

  /// True when today is in the last 10 nights (day 21+).
  final bool isLastTenNights;

  /// True on odd nights of the last 10 (21,23,25,27,29) — Laylatul Qadr candidates.
  final bool isLaylatulQadr;

  const RamadanState({
    required this.isRamadan,
    required this.hDay,
    required this.isLastTenNights,
    required this.isLaylatulQadr,
  });
}

/// Provider that returns whether today is in Ramadan and which day it is.
/// Re-evaluated once per app session (doesn't need to watch a clock).
final ramadanProvider = Provider<RamadanState>((ref) {
  HijriCalendar hijri;
  try {
    hijri = HijriCalendar.now();
  } catch (_) {
    return const RamadanState(
      isRamadan: false,
      hDay: 0,
      isLastTenNights: false,
      isLaylatulQadr: false,
    );
  }

  final isRamadan = hijri.hMonth == 9;
  final hDay = isRamadan ? hijri.hDay : 0;
  final isLastTenNights = isRamadan && hDay >= 21;
  final isLaylatulQadr = isLastTenNights &&
      (hDay == 21 || hDay == 23 || hDay == 25 || hDay == 27 || hDay == 29);

  return RamadanState(
    isRamadan: isRamadan,
    hDay: hDay,
    isLastTenNights: isLastTenNights,
    isLaylatulQadr: isLaylatulQadr,
  );
});

/// Writes Suhoor / Iftar minutes-remaining to SharedPreferences so the Android
/// foreground service can display a Ramadan countdown in the notification shade.
///
/// Keys written (Flutter prefix `flutter.` added automatically):
///   `sahur_mins_remaining`  — minutes until Fajr  (0 when Fajr has passed)
///   `iftar_mins_remaining`  — minutes until Maghrib (0 when Maghrib has passed)
///
/// Mount once near the app root alongside [notificationReschedulerProvider]:
///   ref.listen(ramadanShadeWriterProvider, (_, _) {});
final ramadanShadeWriterProvider = Provider<void>((ref) {
  final ramadan = ref.watch(ramadanProvider);
  final timesAsync = ref.watch(prayerTimesProvider);

  if (!ramadan.isRamadan) return;

  timesAsync.whenData((times) {
    Future.microtask(() async {
      final now = DateTime.now();
      final nowH = now.hour + now.minute / 60.0 + now.second / 3600.0;

      int minsUntil(double prayerH) {
        if (!prayerH.isFinite || prayerH <= nowH) return 0;
        return ((prayerH - nowH) * 60).round();
      }

      final sahurMins = minsUntil(times.fajr);
      final iftarMins = minsUntil(times.maghrib);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('sahur_mins_remaining', sahurMins);
      await prefs.setInt('iftar_mins_remaining', iftarMins);
    });
  });
});
