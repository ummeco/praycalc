import 'dart:convert';
import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:home_widget/home_widget.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import '../../shared/models/settings_model.dart';
import 'locale_service.dart';

/// Pushes prayer time data to home screen widgets (iOS + Android).
class WidgetService {
  WidgetService._();
  static final instance = WidgetService._();

  static const _appGroupId = 'group.com.praycalc.app';
  static const _androidWidgetName = 'PrayCalcWidgetReceiver';

  Future<void> init() async {
    if (kIsWeb) return;
    await HomeWidget.setAppGroupId(_appGroupId);
  }

  Future<void> updateWidget({
    required City city,
    required PrayerTimes times,
    required bool use24h,
    required String nextPrayer,
    required String countdown,
  }) async {
    if (kIsWeb) return;
    final prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    final prayerTimes = [times.fajr, times.dhuhr, times.asr, times.maghrib, times.isha];

    await HomeWidget.saveWidgetData('widget_next_prayer', nextPrayer);
    await HomeWidget.saveWidgetData('widget_countdown', countdown);

    final nextIdx = prayerNames.indexOf(nextPrayer);
    final nextTime = nextIdx >= 0 ? _fmtT(prayerTimes[nextIdx], use24h) : '--:--';
    await HomeWidget.saveWidgetData('widget_next_prayer_time', nextTime);
    await HomeWidget.saveWidgetData('widget_location_name', city.name);

    // Individual keys read by LockScreenWidget (Swift).
    for (var i = 0; i < prayerNames.length; i++) {
      final key = 'widget_${prayerNames[i].toLowerCase()}';
      await HomeWidget.saveWidgetData(key, _fmtT(prayerTimes[i], use24h));
    }

    // JSON array read by HomeScreenWidget systemMedium (Swift).
    // Format: [{"name":"Fajr","time":"5:23 AM","isNext":false}, ...]
    if (!kIsWeb && Platform.isIOS) {
      final prayers = List.generate(prayerNames.length, (i) => {
        'name': prayerNames[i],
        'time': _fmtT(prayerTimes[i], use24h),
        'isNext': prayerNames[i] == nextPrayer,
      });
      await HomeWidget.saveWidgetData('widget_prayers', jsonEncode(prayers));

      // Reload timelines for both iOS widget kinds.
      await HomeWidget.updateWidget(iOSName: 'LockScreenWidget');
      await HomeWidget.updateWidget(iOSName: 'HomeScreenWidget');
    } else {
      await HomeWidget.updateWidget(androidName: _androidWidgetName);
    }
  }

  // T38: delegate to LocaleService.formatPrayerTime
  String _fmtT(double h, bool use24h) {
    if (!h.isFinite) return '--:--';
    final total = h % 24;
    final hh = total.floor();
    final mm = ((total - hh) * 60).round() % 60;
    final now = DateTime.now();
    final t = DateTime(now.year, now.month, now.day, hh, mm);
    return LocaleService.instance.formatPrayerTime(t);
  }
}
