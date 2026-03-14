// IosWidgetConfig — writes prayer times data to AppGroup UserDefaults for iOS widgets.
//
// AppGroup ID: 'group.com.praycalc.app'
// The Swift widget extension reads these keys via UserDefaults(suiteName:).
// Call updateAllWidgetData() whenever prayer times are recalculated.
//
// Widgets served:
//   LockScreenWidget — reads individual widget_fajr / widget_dhuhr / etc. keys
//   HomeScreenWidget — reads widget_next_prayer / widget_next_prayer_time / widget_prayers

import 'dart:convert';

import 'package:home_widget/home_widget.dart';

/// Per-prayer entry used in the home screen schedule widget.
class PrayerEntry {
  final String name;
  final String time;
  final bool isNext;

  const PrayerEntry({
    required this.name,
    required this.time,
    required this.isNext,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'time': time,
        'isNext': isNext,
      };
}

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

  /// Write all widget keys and trigger a refresh of both lock screen and home
  /// screen widgets.
  ///
  /// [data] provides the 5-prayer times (used for LockScreenWidget legacy keys).
  /// [nextPrayer] is the name of the next upcoming fard prayer (e.g. "Asr").
  /// [nextPrayerTime] is the formatted time string (12h or 24h per user setting).
  /// [locationName] is the city/location display name.
  ///
  /// Call this whenever prayer times are recalculated (city change, midnight
  /// refill, etc.).
  static Future<void> updateAllWidgetData({
    required PrayerTimesData data,
    required String nextPrayer,
    required String nextPrayerTime,
    required String locationName,
  }) async {
    await HomeWidget.setAppGroupId(_appGroupId);

    // ── LockScreenWidget keys (individual per-prayer, HH:mm or h:mm AM/PM) ──
    await HomeWidget.saveWidgetData<String>('widget_fajr', data.fajr);
    await HomeWidget.saveWidgetData<String>('widget_dhuhr', data.dhuhr);
    await HomeWidget.saveWidgetData<String>('widget_asr', data.asr);
    await HomeWidget.saveWidgetData<String>('widget_maghrib', data.maghrib);
    await HomeWidget.saveWidgetData<String>('widget_isha', data.isha);

    // ── Shared key (both widget families) ──
    await HomeWidget.saveWidgetData<String>(
        'widget_location_name', locationName);

    // ── HomeScreenWidget keys ──
    await HomeWidget.saveWidgetData<String>(
        'widget_next_prayer', nextPrayer);
    await HomeWidget.saveWidgetData<String>(
        'widget_next_prayer_time', nextPrayerTime);

    // Build the JSON array for the medium home screen widget.
    final prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    final timeMap = {
      'Fajr': data.fajr,
      'Dhuhr': data.dhuhr,
      'Asr': data.asr,
      'Maghrib': data.maghrib,
      'Isha': data.isha,
    };
    final prayers = prayerOrder.map((name) {
      return PrayerEntry(
        name: name,
        time: timeMap[name] ?? '--:--',
        isNext: name == nextPrayer,
      );
    }).toList();

    final prayersJson = jsonEncode(prayers.map((e) => e.toJson()).toList());
    await HomeWidget.saveWidgetData<String>('widget_prayers', prayersJson);

    // Trigger a WidgetKit timeline reload for both widget kinds.
    await HomeWidget.updateWidget(
      name: 'LockScreenWidget',
      iOSName: 'LockScreenWidget',
    );
    await HomeWidget.updateWidget(
      name: 'HomeScreenWidget',
      iOSName: 'HomeScreenWidget',
    );
  }

  /// Legacy convenience method — kept for call sites that haven't migrated yet.
  /// Prefer [updateAllWidgetData] which also refreshes the home screen widgets.
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
