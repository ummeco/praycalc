import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/notification_service.dart';
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
    } catch (_) {}
  });
});
