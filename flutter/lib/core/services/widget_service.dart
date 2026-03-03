import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:home_widget/home_widget.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import '../../shared/models/settings_model.dart';

/// Pushes prayer time data to home screen widgets (iOS + Android).
class WidgetService {
  WidgetService._();
  static final instance = WidgetService._();

  static const _appGroupId = 'group.com.praycalc.app';
  static const _iOSWidgetName = 'PrayCalcWidget';
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

    for (var i = 0; i < prayerNames.length; i++) {
      await HomeWidget.saveWidgetData('widget_${prayerNames[i].toLowerCase()}', prayerNames[i]);
      await HomeWidget.saveWidgetData('widget_${prayerNames[i].toLowerCase()}_time', _fmtT(prayerTimes[i], use24h));
    }

    await HomeWidget.updateWidget(
      androidName: _androidWidgetName,
      iOSName: _iOSWidgetName,
    );
  }

  String _fmtT(double h, bool use24h) {
    if (!h.isFinite) return '--:--';
    final total = h % 24;
    final hh = total.floor();
    final mm = ((total - hh) * 60).round() % 60;
    if (use24h) return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    final period = hh < 12 ? 'AM' : 'PM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:${mm.toString().padLeft(2, '0')} $period';
  }
}
