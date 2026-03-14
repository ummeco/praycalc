import 'package:flutter/foundation.dart' show debugPrint, kIsWeb;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/notification_service.dart';
import '../services/widget_service.dart';
import 'agenda_provider.dart';
import 'notification_configs_provider.dart';
import 'prayer_provider.dart';
import 'settings_provider.dart';

/// Reschedules all notifications whenever city, hanafi setting, agendas,
/// or notification configs change.
///
/// This is a side-effect provider (no state). Mount it once near the app
/// root so it stays alive for the session:
///
///   // In PrayCalcApp.build():
///   ref.listen(notificationReschedulerProvider, (_, __) {});
final notificationReschedulerProvider = Provider<void>((ref) {
  final city = ref.watch(cityProvider);
  final settings = ref.watch(settingsProvider);
  final agendas = ref.watch(agendaProvider);
  final configs = ref.watch(notificationConfigsProvider);

  if (city == null) return;

  // Fire-and-forget. Errors silently swallowed to avoid UI crashes on
  // notification permission denials or OS scheduling failures.
  Future.microtask(() async {
    try {
      await NotificationService.instance.rescheduleAll(
        city: city,
        hanafi: settings.hanafi,
        configs: configs,
        agendas: agendas,
        jumuahKahfReminder: settings.jumuahKahfReminder,
      );
    } catch (e, st) { debugPrint('[NotifProvider] $e\n$st'); }
  });
});

// ── Widget data updater ─────────────────────────────────────────────────────

/// Names and accessors for the five fard prayers in widget order.
const _kWidgetPrayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/// Updates home screen widget data whenever city or prayer times change.
///
/// Mount once near the app root alongside [notificationReschedulerProvider]:
///
///   ref.listen(widgetUpdaterProvider, (_, __) {});
final widgetUpdaterProvider = Provider<void>((ref) {
  if (kIsWeb) return;

  final city = ref.watch(cityProvider);
  final settings = ref.watch(settingsProvider);
  final timesValue = ref.watch(prayerTimesProvider);

  final times = timesValue.valueOrNull;
  if (city == null || times == null) return;

  Future.microtask(() async {
    try {
      await WidgetService.instance.init();

      // Compute which fard prayer is next based on current time.
      final prayerHours = [
        times.fajr,
        times.dhuhr,
        times.asr,
        times.maghrib,
        times.isha,
      ];
      final now = DateTime.now();
      final nowH = now.hour + now.minute / 60.0 + now.second / 3600.0;

      String nextPrayer = _kWidgetPrayerNames.first;
      for (var i = 0; i < _kWidgetPrayerNames.length; i++) {
        final h = prayerHours[i];
        if (h.isFinite && h > nowH) {
          nextPrayer = _kWidgetPrayerNames[i];
          break;
        }
      }

      // Build a countdown string (H:MM or M:SS) for the next prayer.
      final nextH = prayerHours[_kWidgetPrayerNames.indexOf(nextPrayer)];
      String countdown = '--:--';
      if (nextH.isFinite) {
        double diff = nextH - nowH;
        if (diff < 0) diff += 24;
        final totalSec = (diff * 3600).round();
        final hh = totalSec ~/ 3600;
        final mm = (totalSec % 3600) ~/ 60;
        final ss = totalSec % 60;
        if (totalSec < 60) {
          countdown = '${ss}s';
        } else if (hh == 0) {
          countdown = '$mm:${ss.toString().padLeft(2, '0')}';
        } else {
          countdown = '$hh:${mm.toString().padLeft(2, '0')}:${ss.toString().padLeft(2, '0')}';
        }
      }

      await WidgetService.instance.updateWidget(
        city: city,
        times: times,
        use24h: settings.use24h,
        nextPrayer: nextPrayer,
        countdown: countdown,
      );
    } catch (e, st) { debugPrint('[NotifProvider] $e\n$st'); }
  });
});
