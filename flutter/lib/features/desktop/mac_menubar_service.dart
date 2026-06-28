import 'dart:async';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/services/locale_service.dart';
import '../../shared/hijri/hijri.dart' show formatHijri;

/// Feeds prayer data to the native macOS MenuBarController via MethodChannel.
///
/// On macOS the native NSStatusItem + NSPopover handle all UI. This service
/// keeps the native side up to date by pushing fresh data whenever prayer times
/// or city change, and once per minute via timer.
///
/// Also handles the native→Flutter "openSettings" call so tapping "Settings…"
/// in the popover routes into the Flutter settings screen.
class MacMenuBarService {
  MacMenuBarService(this._ref);

  final WidgetRef _ref;
  static const _channel = MethodChannel('praycalc/menubar');

  Timer? _timer;

  void init() {
    if (!Platform.isMacOS) return;

    // Handle calls from native → Flutter.
    _channel.setMethodCallHandler(_handleNativeCall);

    // Push data immediately, then every 60 s.
    _pushData();
    _timer = Timer.periodic(const Duration(seconds: 60), (_) => _pushData());
  }

  Future<dynamic> _handleNativeCall(MethodCall call) async {
    switch (call.method) {
      case 'openSettings':
        appRouter.push(Routes.settings);
    }
  }

  void _pushData() {
    final timesAsync = _ref.read(prayerTimesProvider);
    final city = _ref.read(cityProvider);

    timesAsync.whenData((times) {
      final now = DateTime.now();
      final nowH = now.hour + now.minute / 60.0 + now.second / 3600.0;

      final prayerEntries = <(String, double)>[
        ('Fajr', times.fajr),
        ('Sunrise', times.sunrise),
        ('Dhuhr', times.dhuhr),
        ('Asr', times.asr),
        ('Maghrib', times.maghrib),
        ('Isha', times.isha),
      ];

      // Find next prayer
      String nextPrayer = 'Fajr';
      double nextTs = times.fajr;
      for (final (name, h) in prayerEntries) {
        if (h.isFinite && h > nowH) {
          nextPrayer = name;
          nextTs = h;
          break;
        }
      }

      // Convert fractional hours → unix timestamp today
      final today = DateTime(now.year, now.month, now.day);
      final nextPrayerTimestamp =
          today.add(Duration(seconds: (nextTs * 3600).round())).millisecondsSinceEpoch /
              1000.0;

      // Build prayer rows for the popover list
      final prayers = <Map<String, dynamic>>[];
      for (final (name, h) in prayerEntries) {
        if (!h.isFinite) continue;
        prayers.add({
          'name': name,
          'time': _formatH(h),
          'isNext': name == nextPrayer,
          'isDone': h <= nowH,
        });
      }

      // Hijri date
      final hijriStr = formatHijri(now, 'en');

      _channel.invokeMethod('onMenuBarDataReady', {
        'nextPrayer': nextPrayer,
        'nextPrayerTime': _formatH(nextTs),
        'nextPrayerTs': nextPrayerTimestamp,
        'prayers': prayers,
        'locationName': city?.displayName ?? '',
        'hijriDate': hijriStr,
      }).catchError((_) {});
    });
  }

  String _formatH(double h) {
    final totalMin = (h * 60).round();
    final hh = (totalMin ~/ 60) % 24;
    final mm = totalMin % 60;
    final now = DateTime.now();
    final t = DateTime(now.year, now.month, now.day, hh, mm);
    return LocaleService.instance.formatPrayerTime(t);
  }

  void dispose() {
    _timer?.cancel();
    _channel.setMethodCallHandler(null);
  }
}
