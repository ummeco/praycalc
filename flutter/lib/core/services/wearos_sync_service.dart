import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/services.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';

import '../../shared/models/settings_model.dart';

/// Sends prayer time data to the paired WearOS device via the Android
/// Wearable DataClient (DataMap path: /prayer_times).
///
/// Uses a MethodChannel to the native Android side which calls
/// Wearable.getDataClient(context).putDataItem(). No-ops on iOS and web.
class WearOsSyncService {
  WearOsSyncService._();
  static final instance = WearOsSyncService._();

  static const _channel = MethodChannel('com.praycalc.app/wearos');

  bool get _supported => !kIsWeb && Platform.isAndroid;

  /// Send current prayer times to the WearOS tile.
  ///
  /// [times]      — PrayerTimes object for today.
  /// [city]       — Current city (name used as location label).
  /// [settings]   — App settings (for 24h format).
  /// [nextPrayer] — Name of the next prayer (e.g. "Dhuhr").
  Future<void> syncPrayerTimes({
    required PrayerTimes times,
    required City city,
    required AppSettings settings,
    required String nextPrayer,
  }) async {
    if (!_supported) return;

    final use24h = settings.use24h;
    final payload = <String, String>{
      'fajr': _fmt(times.fajr, use24h),
      'dhuhr': _fmt(times.dhuhr, use24h),
      'asr': _fmt(times.asr, use24h),
      'maghrib': _fmt(times.maghrib, use24h),
      'isha': _fmt(times.isha, use24h),
      'next_prayer': nextPrayer,
      'next_prayer_time': _nextPrayerTime(times, nextPrayer),
      'location': city.name,
    };

    try {
      await _channel.invokeMethod<void>('syncPrayerTimes', payload);
    } on PlatformException {
      // WearOS not paired or Play Services unavailable — silently ignore.
    } on MissingPluginException {
      // Running in a build variant without WearOS support (e.g., Amazon).
    }
  }

  /// Returns the 24h time string for the next prayer so the tile can compute
  /// the countdown even if the user has 12h display on the phone.
  String _nextPrayerTime(PrayerTimes times, String nextPrayer) {
    switch (nextPrayer) {
      case 'Fajr':
        return _fmt24(times.fajr);
      case 'Dhuhr':
        return _fmt24(times.dhuhr);
      case 'Asr':
        return _fmt24(times.asr);
      case 'Maghrib':
        return _fmt24(times.maghrib);
      case 'Isha':
        return _fmt24(times.isha);
      default:
        return _fmt24(times.fajr);
    }
  }

  String _fmt(double h, bool use24h) {
    if (!h.isFinite) return '--:--';
    final total = h % 24;
    final hh = total.floor();
    final mm = ((total - hh) * 60).round() % 60;
    if (use24h) {
      return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    }
    final period = hh < 12 ? 'AM' : 'PM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:${mm.toString().padLeft(2, '0')} $period';
  }

  /// Always returns HH:mm in 24h format — used for countdown computation on watch.
  String _fmt24(double h) {
    if (!h.isFinite) return '--:--';
    final total = h % 24;
    final hh = total.floor();
    final mm = ((total - hh) * 60).round() % 60;
    return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
  }
}
