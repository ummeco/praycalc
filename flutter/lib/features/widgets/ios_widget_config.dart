// IosWidgetConfig — writes prayer times data to AppGroup UserDefaults for iOS widgets.
//
// AppGroup ID: 'group.com.praycalc.app'
// The LockScreenWidget Swift extension reads these keys via UserDefaults(suiteName:).
// Call updateWidgetData() whenever prayer times are recalculated.
//
// NOTE: The home_widget package must be added to pubspec.yaml:
//   home_widget: ^0.9.0
// And the AppGroup must be configured in Xcode for both the Runner and
// PrayCalcWidgets extension targets.

import 'package:home_widget/home_widget.dart';

/// Prayer times data passed to the iOS lock screen widget.
class PrayerTimesData {
  final String fajr;
  final String dhuhr;
  final String asr;
  final String maghrib;
  final String isha;

  const PrayerTimesData({
    required this.fajr,
    required this.dhuhr,
    required this.asr,
    required this.maghrib,
    required this.isha,
  });
}

class IosWidgetConfig {
  IosWidgetConfig._();

  static const _appGroupId = 'group.com.praycalc.app';

  /// Write [data] to the shared AppGroup UserDefaults and request a widget refresh.
  /// Call this whenever prayer times are recalculated (city change, midnight refill, etc.).
  static Future<void> updateWidgetData(PrayerTimesData data) async {
    await HomeWidget.setAppGroupId(_appGroupId);
    await HomeWidget.saveWidgetData<String>('widget_fajr', data.fajr);
    await HomeWidget.saveWidgetData<String>('widget_dhuhr', data.dhuhr);
    await HomeWidget.saveWidgetData<String>('widget_asr', data.asr);
    await HomeWidget.saveWidgetData<String>('widget_maghrib', data.maghrib);
    await HomeWidget.saveWidgetData<String>('widget_isha', data.isha);
    await HomeWidget.updateWidget(
      name: 'LockScreenWidget',
      iOSName: 'LockScreenWidget',
    );
  }
}
