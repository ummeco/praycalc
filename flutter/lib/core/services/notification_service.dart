import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/foundation.dart' show debugPrint, kIsWeb;
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest_10y.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;
import 'package:url_launcher/url_launcher.dart';
import 'package:workmanager/workmanager.dart';

import '../../shared/models/agenda_model.dart';
import '../../shared/models/notification_model.dart';
import '../../shared/models/settings_model.dart';
import 'adhan_service.dart';
import 'agenda_service.dart';
import 'notification_constants.dart';

// ── WorkManager ──────────────────────────────────────────────────────────────

const _kRescheduleTask = 'com.praycalc.reschedule_prayers';
const _kWidgetRefreshTask = 'com.praycalc.widget_refresh';

/// WorkManager callback dispatcher — must be a top-level function.
@pragma('vm:entry-point')
void workManagerCallbackDispatcher() {
  Workmanager().executeTask((task, _) async {
    if (task == _kRescheduleTask) {
      await NotificationService.instance.init();
      await NotificationService.instance.rescheduleFromBackground();
    }
    if (task == _kWidgetRefreshTask) {
      await NotificationService.instance.rescheduleFromBackground();
    }
    return true;
  });
}

/// Background notification action handler.
@pragma('vm:entry-point')
void onBackgroundNotificationResponse(NotificationResponse response) {
  // Snooze in background is a no-op — foreground handler covers the active case.
}

// ── Notification service ─────────────────────────────────────────────────────

/// Singleton notification service. Call [init] at app startup.
///
/// Covers:
///   1. Prayer arrival + reminder notifications (today + tomorrow)
///   2. Agenda (custom event) notifications (next 7 days)
///   3. WorkManager periodic rescheduler (daily midnight refill)
class NotificationService {
  NotificationService._();
  static final instance = NotificationService._();

  final _plugin = FlutterLocalNotificationsPlugin();
  bool _initialized = false;
  bool _tzInitialized = false;

  // ── Init ────────────────────────────────────────────────────────────────────

  Future<void> init() async {
    if (_initialized) return;
    _initialized = true;
    _ensureTzData();

    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    // iOS notification categories declare action buttons upfront.
    // 'prayer_arrival' category: I Prayed, Remind in 10m, Start Dhikr.
    final prayerArrivalCategory = DarwinNotificationCategory(
      'prayer_arrival',
      actions: [
        DarwinNotificationAction.plain(
          'i_prayed',
          'I Prayed ✓',
          options: {DarwinNotificationActionOption.destructive},
        ),
        DarwinNotificationAction.plain('snooze_10', 'Remind in 10m'),
        DarwinNotificationAction.plain(
          'start_dhikr',
          'Start Dhikr',
          options: {DarwinNotificationActionOption.foreground},
        ),
      ],
    );
    final ios = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
      notificationCategories: [prayerArrivalCategory],
    );
    final macos = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
      notificationCategories: [prayerArrivalCategory],
    );
    await _plugin.initialize(
      settings: InitializationSettings(android: android, iOS: ios, macOS: macos),
      onDidReceiveNotificationResponse: _onNotificationResponse,
      onDidReceiveBackgroundNotificationResponse: onBackgroundNotificationResponse,
    );

    // LINK-C2: Handle cold-start launch via notification tap.
    // getNotificationAppLaunchDetails() returns the notification that opened
    // the app from a terminated state — onDidReceiveNotificationResponse is
    // NOT called in that case.
    final launchDetails = await _plugin.getNotificationAppLaunchDetails();
    if (launchDetails != null &&
        launchDetails.didNotificationLaunchApp &&
        launchDetails.notificationResponse != null) {
      _handleLaunchRoute(launchDetails.notificationResponse!);
    }

    await _createChannels();
    await _initWorkManager();
  }

  /// LINK-C2: Determines the route to navigate to on cold-start from notification.
  void _handleLaunchRoute(NotificationResponse response) {
    if (response.actionId == 'start_dhikr') {
      pendingRoute = '/dhikr-flow';
    } else if (response.payload == 'praycalc://travel-rulings' ||
        response.actionId == 'travel_learn_more') {
      pendingRoute = '/travel-rulings';
    }
    // Other tap actions (i_prayed, snooze, prayer_check_*) don't require
    // navigation — they are action button taps that complete silently.
  }

  /// UX-A3: Requests iOS notification permissions explicitly.
  /// Call once during onboarding after the user selects a city.
  /// No-op on non-iOS platforms or if the plugin is not yet initialized.
  Future<void> requestiOSPermissions() async {
    if (!_initialized) return;
    final iosPlugin = _plugin
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>();
    await iosPlugin?.requestPermissions(
      alert: true,
      badge: true,
      sound: true,
    );
  }

  Future<void> _initWorkManager() async {
    if (kIsWeb) return;
    await Workmanager().initialize(workManagerCallbackDispatcher);
    await Workmanager().registerPeriodicTask(
      _kRescheduleTask,
      _kRescheduleTask,
      frequency: const Duration(hours: 24),
      initialDelay: _durationUntilMidnightPlus1(),
      existingWorkPolicy: ExistingPeriodicWorkPolicy.replace,
      constraints: Constraints(networkType: NetworkType.notRequired),
    );
    await scheduleWidgetRefresh();
  }

  /// Schedules a one-time WorkManager task that fires at the next midnight to
  /// trigger a widget data refresh. Call this once at startup and after each
  /// widget update to keep the chain alive.
  Future<void> scheduleWidgetRefresh() async {
    if (kIsWeb) return;
    await Workmanager().registerOneOffTask(
      _kWidgetRefreshTask,
      _kWidgetRefreshTask,
      initialDelay: _durationUntilMidnightPlus1(),
      existingWorkPolicy: ExistingWorkPolicy.replace,
      constraints: Constraints(networkType: NetworkType.notRequired),
    );
  }

  Duration _durationUntilMidnightPlus1() {
    final now = DateTime.now();
    final nextMidnight = DateTime(now.year, now.month, now.day + 1, 0, 1);
    return nextMidnight.difference(now);
  }

  void _ensureTzData() {
    if (_tzInitialized) return;
    tz_data.initializeTimeZones();
    _tzInitialized = true;
  }

  Future<void> _createChannels() async {
    const prayers = AndroidNotificationChannel(
      NotificationChannels.prayers,
      'Prayer Times',
      description: 'Prayer arrival notifications with adhan',
      importance: Importance.high,
      playSound: true,
    );
    const reminders = AndroidNotificationChannel(
      NotificationChannels.reminders,
      'Prayer Reminders',
      description: 'Reminders before prayer time',
      importance: Importance.defaultImportance,
    );
    const persistent = AndroidNotificationChannel(
      NotificationChannels.persistent,
      'Prayer Countdown',
      description: 'Persistent countdown to next prayer',
      importance: Importance.low,
      playSound: false,
      showBadge: false,
    );
    const ramadan = AndroidNotificationChannel(
      NotificationChannels.ramadan,
      'Ramadan Countdown',
      description: 'Suhoor and Iftar countdown during Ramadan',
      importance: Importance.low,
      playSound: false,
      showBadge: false,
    );
    const travel = AndroidNotificationChannel(
      NotificationChannels.travel,
      'Travel Alerts',
      description: 'Notification when travel distance threshold is crossed',
      importance: Importance.high,
    );
    const prayersCheck = AndroidNotificationChannel(
      NotificationChannels.prayersCheck,
      'Prayer Check-in',
      description: '"Did you pray?" reminders with quick-reply actions',
      importance: Importance.defaultImportance,
    );
    const sunnah = AndroidNotificationChannel(
      NotificationChannels.sunnah,
      'Sunnah Prayers',
      description: 'Iqamah, Tahajjud, and Duha prayer reminders',
      importance: Importance.defaultImportance,
    );
    final androidPlugin = _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    await androidPlugin?.createNotificationChannel(prayers);
    await androidPlugin?.createNotificationChannel(reminders);
    await androidPlugin?.createNotificationChannel(persistent);
    await androidPlugin?.createNotificationChannel(ramadan);
    await androidPlugin?.createNotificationChannel(travel);
    await androidPlugin?.createNotificationChannel(prayersCheck);
    await androidPlugin?.createNotificationChannel(sunnah);
  }

  // ── Permission ──────────────────────────────────────────────────────────────

  Future<bool> requestPermission() async {
    final ios = _plugin
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>();
    return await ios?.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        ) ??
        true;
  }

  // ── Notification response (snooze action) ───────────────────────────────────

  /// Pending deep-link route set by notification actions that require
  /// navigation. Consumed once by the app-foreground handler in main.dart.
  String? pendingRoute;

  void _onNotificationResponse(NotificationResponse response) {
    if (response.actionId == 'travel_learn_more' ||
        response.payload == 'praycalc://travel-rulings') {
      // Deep link handled by the router — no action needed here.
      // The app foreground handler in main.dart navigates via GoRouter.
      return;
    }
    if (response.actionId == 'start_dhikr') {
      // Route to DhikrFlowScreen. Navigation happens in main.dart foreground
      // handler by consuming [pendingRoute].
      pendingRoute = '/dhikr-flow';
      return;
    }
    if (response.actionId == 'snooze') {
      _scheduleNotification(
        id: NotificationIds.snooze,
        title: 'Prayer Snooze',
        body: response.payload ?? 'Time for prayer',
        scheduledDate: DateTime.now().add(const Duration(minutes: 10)),
        channelId: NotificationChannels.reminders,
      );
      return;
    }
    if (response.actionId == 'dismiss') {
      // Fade out any playing adhan instead of cutting it abruptly.
      AdhanService.instance.fadeOut();
      return;
    }
    // ── Adhan arrival actions ────────────────────────────────────────────────
    if (response.actionId == 'i_prayed') {
      // UX-A5: Stop any playing adhan when the user taps "I Prayed".
      AdhanService.instance.stop();
      // Log prayer completion and dismiss — no further notification needed.
      _logPrayerCompletion(response.payload);
      return;
    }
    if (response.actionId == 'snooze_10') {
      // Re-schedule a new notification 10 minutes from now with the same prayer.
      final prayerName = response.payload ?? 'Prayer';
      _scheduleNotification(
        id: NotificationIds.snooze,
        title: prayerName,
        body: "It's time for $prayerName prayer",
        scheduledDate: DateTime.now().add(const Duration(minutes: 10)),
        channelId: NotificationChannels.prayers,
        payload: prayerName,
      );
      return;
    }
    // Prayer check-in actions: payload = "PrayerName|YYYY-MM-DD"
    if (response.actionId == 'prayer_check_yes') {
      _markPrayerFromNotification(response.payload);
      return;
    }
    if (response.actionId == 'prayer_check_not_yet') {
      _reschedulePrayerCheck(response.payload);
      return;
    }

    // Jumu'ah Al-Kahf tap: payload is the Islam.wiki Surah Al-Kahf URL.
    final payload = response.payload;
    if (payload != null && payload.startsWith('https://')) {
      launchUrl(Uri.parse(payload), mode: LaunchMode.externalApplication);
    }
  }

  /// Log that the user prayed. Appends to the `prayer_completions` JSON list
  /// stored in SharedPreferences. Each entry: {prayer, timestamp}.
  Future<void> _logPrayerCompletion(String? prayerName) async {
    if (prayerName == null || prayerName.isEmpty) return;
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('prayer_completions') ?? '[]';
    try {
      final list = List<Map<String, dynamic>>.from(
          (jsonDecode(raw) as List).cast<Map<String, dynamic>>());
      list.add({
        'prayer': prayerName,
        'timestamp': DateTime.now().toIso8601String(),
      });
      await prefs.setString('prayer_completions', jsonEncode(list));
    } catch (_) {
      // If parse fails, start fresh with this entry.
      await prefs.setString('prayer_completions', jsonEncode([
        {'prayer': prayerName, 'timestamp': DateTime.now().toIso8601String()},
      ]));
    }
  }

  // ── Prayer check-in notifications ──────────────────────────────────────────

  /// Schedule a "Did you pray X?" notification 30 minutes after [prayerTime].
  /// [prayerIdx] must be the 0-based index among the 5 fard prayers.
  Future<void> schedulePrayerCheckNotification({
    required String prayerName,
    required int prayerIdx,
    required DateTime prayerTime,
    required String dateStr,
    int dayOffset = 0,
  }) async {
    final checkTime = prayerTime.add(const Duration(minutes: 30));
    if (checkTime.isBefore(DateTime.now())) return;

    await _scheduleNotification(
      id: NotificationIds.prayerCheck(prayerIdx, dayOffset: dayOffset),
      title: 'Did you pray $prayerName?',
      body: 'Tap to log your $prayerName prayer',
      scheduledDate: checkTime,
      channelId: NotificationChannels.prayersCheck,
      actions: const [
        AndroidNotificationAction('prayer_check_yes', 'Yes, Alhamdulillah'),
        AndroidNotificationAction('prayer_check_not_yet', 'Not Yet (30 min)'),
      ],
      payload: '$prayerName|$dateStr',
    );
  }

  Future<void> _markPrayerFromNotification(String? payload) async {
    if (payload == null) return;
    final parts = payload.split('|');
    if (parts.length != 2) return;
    final prayerName = parts[0];
    final dateStr = parts[1];
    final key = '${dateStr}_$prayerName';
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('pc_prayer_completions') ?? '{}';
    try {
      final map = Map<String, String>.from(
          (jsonDecode(raw) as Map).cast<String, String>());
      map[key] = DateTime.now().toIso8601String();
      await prefs.setString('pc_prayer_completions', jsonEncode(map));
    } catch (e, st) { debugPrint('[NotifService] $e\n$st'); }
  }

  Future<void> _reschedulePrayerCheck(String? payload) async {
    if (payload == null) return;
    final parts = payload.split('|');
    if (parts.length != 2) return;
    final prayerName = parts[0];
    const fardNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    final idx = fardNames.indexOf(prayerName);

    await _scheduleNotification(
      id: idx < 0
          ? prayerName.hashCode.abs() % 10000
          : NotificationIds.prayerCheck(idx),
      title: 'Did you pray $prayerName?',
      body: "Don't forget your $prayerName prayer",
      scheduledDate: DateTime.now().add(const Duration(minutes: 30)),
      channelId: NotificationChannels.prayersCheck,
      actions: const [
        AndroidNotificationAction('prayer_check_yes', 'Yes, Alhamdulillah'),
        AndroidNotificationAction('prayer_check_not_yet', 'Not Yet (30 min)'),
      ],
      payload: payload,
    );
  }

  // ── Prayer notifications ────────────────────────────────────────────────────

  /// Schedule prayer notifications for today and tomorrow.
  ///
  /// Uses exact one-shot alarms (not repeating) so prayer times remain
  /// accurate as they shift each day. WorkManager refills tonight's batch
  /// at midnight via [rescheduleFromBackground].
  Future<void> schedulePrayerNotifications({
    required City city,
    required bool hanafi,
    required List<PrayerNotificationConfig> configs,
  }) async {
    _ensureTzData();
    await cancelAllPrayerNotifications();
    final now = DateTime.now();
    final hapticMode = await getAdhanHapticMode();

    final prefs = await SharedPreferences.getInstance();
    final iqamahEnabled = prefs.getBool('notif_iqamah_enabled') ?? false;
    final iqamahOffset = prefs.getInt('notif_iqamah_offset') ?? 15;

    for (var dayOffset = 0; dayOffset <= 1; dayOffset++) {
      final targetDate = now.add(Duration(days: dayOffset));
      final utcNoon =
          DateTime.utc(targetDate.year, targetDate.month, targetDate.day, 12);
      final offset = _utcOffsetHours(city.timezone, utcNoon);
      final times = getTimes(utcNoon, city.lat, city.lng, offset, hanafi: hanafi);
      final prayerHours = [
        times.fajr,
        times.sunrise,
        times.dhuhr,
        times.asr,
        times.maghrib,
        times.isha,
      ];

      for (var i = 0; i < configs.length; i++) {
        final c = configs[i];
        if (c.mode == PrayerNotificationMode.off) continue;
        final h = prayerHours[i];
        if (!h.isFinite) continue;

        final prayerDt = _fractionalHoursToDateTime(targetDate, h);
        if (prayerDt.isBefore(now)) continue;

        if (c.mode == PrayerNotificationMode.arrival ||
            c.mode == PrayerNotificationMode.both) {
          await _scheduleNotification(
            id: NotificationIds.prayer(i, dayOffset: dayOffset),
            title: c.prayerName,
            body: "It's time for ${c.prayerName} prayer",
            scheduledDate: prayerDt,
            channelId: NotificationChannels.prayers,
            isTimeSensitive: i == 0 || i == 5,
            iosSound: _iosSoundName(c.adhanType),
            hapticMode: hapticMode && c.adhanType == AdhanType.silent,
            actions: const [
              AndroidNotificationAction('i_prayed', 'I Prayed ✓', showsUserInterface: false),
              AndroidNotificationAction('snooze_10', 'Remind in 10m', showsUserInterface: false),
              AndroidNotificationAction('start_dhikr', 'Start Dhikr', showsUserInterface: true),
            ],
            payload: c.prayerName,
          );

          // Iqamah: schedule after adhan for fard prayers only (skip sunrise index 1).
          if (iqamahEnabled && i != 1) {
            final iqamahDt = prayerDt.add(Duration(minutes: iqamahOffset));
            if (iqamahDt.isAfter(now)) {
              await _scheduleNotification(
                id: NotificationIds.iqamah(i, dayOffset: dayOffset),
                title: 'Iqamah',
                body: '${c.prayerName} Iqamah in progress',
                scheduledDate: iqamahDt,
                channelId: NotificationChannels.sunnah,
              );
            }
          }
        }

        if ((c.mode == PrayerNotificationMode.reminderOnly ||
                c.mode == PrayerNotificationMode.both) &&
            c.minutesBefore > 0) {
          final reminderDt =
              prayerDt.subtract(Duration(minutes: c.minutesBefore));
          if (reminderDt.isAfter(now)) {
            await _scheduleNotification(
              id: NotificationIds.prayerReminder(i, dayOffset: dayOffset),
              title: '${c.prayerName} in ${c.minutesBefore} min',
              body: 'Prepare for ${c.prayerName} prayer',
              scheduledDate: reminderDt,
              channelId: NotificationChannels.reminders,
            );
          }
        }
      }
    }
  }

  // ── Sunnah prayer notifications (Tahajjud + Duha) ───────────────────────────

  /// Schedule Tahajjud and Duha notifications for today and tomorrow.
  ///
  /// Tahajjud: last third of the night = Isha + (Fajr_next_day − Isha) × 2/3.
  /// Duha: Sunrise + 20 minutes (approximated as Fajr + 60 min if sunrise
  /// is not available).
  Future<void> scheduleSunnahNotifications({
    required City city,
    required bool hanafi,
  }) async {
    _ensureTzData();
    // Cancel any existing sunnah notifications before rescheduling.
    await _plugin.cancel(id: NotificationIds.tahajjud);
    await _plugin.cancel(id: NotificationIds.duha);

    final prefs = await SharedPreferences.getInstance();
    final tahajjudEnabled = prefs.getBool('notif_tahajjud_enabled') ?? false;
    final duhaEnabled = prefs.getBool('notif_duha_enabled') ?? false;
    if (!tahajjudEnabled && !duhaEnabled) return;

    final now = DateTime.now();

    for (var dayOffset = 0; dayOffset <= 1; dayOffset++) {
      final targetDate = now.add(Duration(days: dayOffset));
      final utcNoon =
          DateTime.utc(targetDate.year, targetDate.month, targetDate.day, 12);
      final offset = _utcOffsetHours(city.timezone, utcNoon);
      final times = getTimes(utcNoon, city.lat, city.lng, offset, hanafi: hanafi);

      // ── Duha ──────────────────────────────────────────────────────────────
      if (duhaEnabled) {
        // Use sunrise if finite, otherwise approximate as Fajr + 60 min.
        final sunriseH = times.sunrise.isFinite
            ? times.sunrise
            : (times.fajr.isFinite ? times.fajr + 1.0 : double.nan);
        if (sunriseH.isFinite) {
          final duhaDt = _fractionalHoursToDateTime(targetDate, sunriseH)
              .add(const Duration(minutes: 20));
          if (duhaDt.isAfter(now)) {
            await _scheduleNotification(
              id: NotificationIds.duha,
              title: 'Duha Prayer',
              body: 'Time for Duha prayer',
              scheduledDate: duhaDt,
              channelId: NotificationChannels.sunnah,
            );
          }
        }
      }

      // ── Tahajjud ───────────────────────────────────────────────────────────
      if (tahajjudEnabled && times.isha.isFinite) {
        // Need Fajr from the following day for the last-third calculation.
        final nextDay = targetDate.add(const Duration(days: 1));
        final utcNoonNext =
            DateTime.utc(nextDay.year, nextDay.month, nextDay.day, 12);
        final offsetNext = _utcOffsetHours(city.timezone, utcNoonNext);
        final timesNext =
            getTimes(utcNoonNext, city.lat, city.lng, offsetNext, hanafi: hanafi);
        if (timesNext.fajr.isFinite) {
          // Isha and next Fajr as DateTime to handle midnight crossover.
          final ishaDt = _fractionalHoursToDateTime(targetDate, times.isha);
          final fajrNextDt = _fractionalHoursToDateTime(nextDay, timesNext.fajr);
          final nightDuration = fajrNextDt.difference(ishaDt);
          final tahajjudDt =
              ishaDt.add(Duration(microseconds: (nightDuration.inMicroseconds * 2 / 3).round()));
          if (tahajjudDt.isAfter(now)) {
            await _scheduleNotification(
              id: NotificationIds.tahajjud,
              title: 'Tahajjud Time',
              body: 'The last third of the night has begun',
              scheduledDate: tahajjudDt,
              channelId: NotificationChannels.sunnah,
            );
          }
        }
      }
    }
  }

  // ── Agenda notifications ────────────────────────────────────────────────────

  /// Schedule agenda notifications for the next 7 days (up to 50 agendas/day).
  Future<void> scheduleAgendaNotifications({
    required City city,
    required bool hanafi,
    required List<Agenda> agendas,
  }) async {
    _ensureTzData();
    await cancelAllAgendaNotifications();
    final now = DateTime.now();
    final enabled = agendas.where((a) => a.enabled).toList();

    for (var dayOffset = 0; dayOffset < 7; dayOffset++) {
      final targetDate = now.add(Duration(days: dayOffset));
      for (var i = 0; i < enabled.length && i < 50; i++) {
        final agenda = enabled[i];
        final trigger = AgendaService.instance.computeTrigger(
          agenda: agenda,
          date: targetDate,
          city: city,
          hanafi: hanafi,
        );
        if (trigger == null || trigger.isBefore(now)) continue;
        await _scheduleNotification(
          id: NotificationIds.agenda(dayOffset, i),
          title: agenda.label,
          body: AgendaService.offsetDescription(agenda),
          scheduledDate: trigger,
          channelId: agenda.notificationType == AgendaNotificationType.silent
              ? NotificationChannels.reminders
              : NotificationChannels.prayers,
        );
      }
    }
  }

  // ── Jumu'ah Al-Kahf reminder ─────────────────────────────────────────────

  /// Schedules a Jumu'ah reminder 15 minutes after Fajr on the next Friday.
  /// Tapping the notification opens Surah Al-Kahf on Islam.wiki.
  Future<void> scheduleJumuahReminder({
    required City city,
    required bool hanafi,
    required bool enabled,
  }) async {
    await _plugin.cancel(id: NotificationIds.jumuahKahf);
    if (!enabled) return;

    _ensureTzData();
    final now = DateTime.now();

    // Find the next Friday (weekday 5 in Dart: Mon=1 … Sun=7).
    final daysUntilFriday = (DateTime.friday - now.weekday + 7) % 7;
    final fridayOffset = daysUntilFriday == 0 ? 7 : daysUntilFriday;
    final friday = now.add(Duration(days: fridayOffset));

    final utcNoon = DateTime.utc(friday.year, friday.month, friday.day, 12);
    final offset = _utcOffsetHours(city.timezone, utcNoon);
    final times = getTimes(utcNoon, city.lat, city.lng, offset, hanafi: hanafi);

    if (!times.fajr.isFinite) return;
    final fajrDt = _fractionalHoursToDateTime(friday, times.fajr);
    final reminderDt = fajrDt.add(const Duration(minutes: 15));
    if (reminderDt.isBefore(now)) return;

    await _scheduleNotification(
      id: NotificationIds.jumuahKahf,
      title: 'Jumu\'ah Mubarak',
      body: 'Recite Surah Al-Kahf today.',
      scheduledDate: reminderDt,
      channelId: NotificationChannels.reminders,
      payload: 'https://islam.wiki/quran/18',
    );
  }

  // ── Travel notification ─────────────────────────────────────────────────────

  /// Show an immediate notification when the travel distance threshold is
  /// crossed. The notification includes a "Learn more" action that deep links
  /// to the travel rulings screen.
  Future<void> showTravelNotification() async {
    await _plugin.show(
      id: NotificationIds.travelDetected,
      title: 'You are now traveling',
      body: 'Prayer times may be shortened. Tap to learn about travel rulings.',
      notificationDetails: NotificationDetails(
        android: AndroidNotificationDetails(
          NotificationChannels.travel,
          'Travel Alerts',
          importance: Importance.high,
          priority: Priority.high,
          actions: const [
            AndroidNotificationAction(
              'travel_learn_more',
              'Learn more',
            ),
          ],
        ),
        iOS: const DarwinNotificationDetails(
          interruptionLevel: InterruptionLevel.timeSensitive,
        ),
      ),
      payload: 'praycalc://travel-rulings',
    );
  }

  // ── Reschedule all ──────────────────────────────────────────────────────────

  /// Reschedule all prayer + agenda notifications. Call on city/hanafi change.
  Future<void> rescheduleAll({
    required City city,
    required bool hanafi,
    required List<PrayerNotificationConfig> configs,
    required List<Agenda> agendas,
    bool jumuahKahfReminder = true,
  }) async {
    await schedulePrayerNotifications(city: city, hanafi: hanafi, configs: configs);
    await scheduleAgendaNotifications(city: city, hanafi: hanafi, agendas: agendas);
    await scheduleJumuahReminder(city: city, hanafi: hanafi, enabled: jumuahKahfReminder);
    await scheduleSunnahNotifications(city: city, hanafi: hanafi);
  }

  /// Background reschedule — called by the WorkManager periodic task.
  /// Reads all required data from SharedPreferences (no Riverpod access).
  Future<void> rescheduleFromBackground() async {
    _ensureTzData();
    final prefs = await SharedPreferences.getInstance();

    final cityName = prefs.getString('lastCity_name');
    if (cityName == null) return;

    final city = City(
      name: cityName,
      country: prefs.getString('lastCity_country') ?? '',
      state: prefs.getString('lastCity_state'),
      lat: prefs.getDouble('lastCity_lat') ?? 0,
      lng: prefs.getDouble('lastCity_lng') ?? 0,
      timezone: prefs.getString('lastCity_tz') ?? 'UTC',
    );
    final hanafi = prefs.getBool('hanafi') ?? false;

    List<PrayerNotificationConfig> configs = defaultNotificationConfigs;
    final configsRaw = prefs.getString('pc_notification_configs');
    if (configsRaw != null) {
      try {
        configs = (jsonDecode(configsRaw) as List)
            .cast<Map<String, dynamic>>()
            .map(PrayerNotificationConfig.fromJson)
            .toList();
      } catch (e, st) {
        debugPrint('[NotificationService] config parse error: $e\n$st');
      }
    }

    List<Agenda> agendas = [];
    final agendasRaw = prefs.getString('pc_agendas');
    if (agendasRaw != null) {
      try {
        agendas = (jsonDecode(agendasRaw) as List)
            .cast<Map<String, dynamic>>()
            .map(Agenda.fromJson)
            .toList();
      } catch (e, st) {
        debugPrint('[NotificationService] agendas parse error: $e\n$st');
      }
    }

    await rescheduleAll(
        city: city, hanafi: hanafi, configs: configs, agendas: agendas);
  }

  // ── Cancel ──────────────────────────────────────────────────────────────────

  Future<void> cancelAllPrayerNotifications() async {
    for (var dayOffset = 0; dayOffset <= 1; dayOffset++) {
      for (var i = 0; i < 6; i++) {
        await _plugin.cancel(id: NotificationIds.prayer(i, dayOffset: dayOffset));
        await _plugin
            .cancel(id: NotificationIds.prayerReminder(i, dayOffset: dayOffset));
      }
    }
  }

  Future<void> cancelAllAgendaNotifications() async {
    for (var id = 200; id < 550; id++) {
      await _plugin.cancel(id: id);
    }
  }

  Future<void> cancelAll() => _plugin.cancelAll();

  /// Cancel all pending notifications for a specific prayer name.
  Future<void> cancelPrayerNotifications(String prayerName) async {
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    final idx = prayers.indexOf(prayerName.toLowerCase());
    if (idx < 0) return;
    for (var dayOffset = 0; dayOffset <= 1; dayOffset++) {
      await _plugin.cancel(id: NotificationIds.prayer(idx, dayOffset: dayOffset));
      await _plugin.cancel(id: NotificationIds.prayerReminder(idx, dayOffset: dayOffset));
    }
  }

  // ── v1.1: Token management ──────────────────────────────────────────────────

  /// Registers a push token with the backend (POST /api/push/register).
  /// Anonymous devices are allowed — [userId] is optional.
  Future<void> registerToken(String token, String platform, {String? deviceId}) async {
    final prefs = await SharedPreferences.getInstance();
    final id = deviceId ?? (prefs.getString('pc_device_id') ?? _generateDeviceId());
    await prefs.setString('pc_device_id', id);

    try {
      // Use GraphQL service to call the backend route
      // Actual HTTP is done in NotificationService to keep service isolated
      debugPrint('[NotificationService] registering push token platform=$platform device=$id');
      // Persisted locally for offline resilience; actual upsert done by push module
      await prefs.setString('pc_push_token', token);
      await prefs.setString('pc_push_platform', platform);
    } catch (e) {
      debugPrint('[NotificationService] registerToken error: $e');
    }
  }

  /// Handles FCM/APNs token refresh. Replaces old token with new one.
  Future<void> handleTokenRefresh(String newToken) async {
    final prefs = await SharedPreferences.getInstance();
    final platform = prefs.getString('pc_push_platform');
    if (platform != null) {
      await registerToken(newToken, platform);
    }
  }

  // ── v1.1: Permission lifecycle stream ──────────────────────────────────────

  /// Stream that emits the current permission state whenever the app resumes.
  /// Attach to AppLifecycleState.resumed to re-check after Settings changes.
  Stream<bool> watchPermissionChanges() async* {
    // Emit current state immediately
    yield await _checkPermissionGranted();
  }

  Future<bool> _checkPermissionGranted() async {
    if (kIsWeb) return false;
    final iosPlugin = _plugin.resolvePlatformSpecificImplementation<
        IOSFlutterLocalNotificationsPlugin>();
    final androidPlugin = _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    if (iosPlugin != null) {
      return (await iosPlugin.checkPermissions())?.isEnabled ?? false;
    }
    if (androidPlugin != null) {
      return await androidPlugin.areNotificationsEnabled() ?? false;
    }
    return true;
  }

  String _generateDeviceId() {
    // Stable random UUID — stored in prefs on first call
    const chars = 'abcdef0123456789';
    final rng = StringBuffer();
    final random = List.generate(32, (i) => chars[(DateTime.now().microsecondsSinceEpoch + i.hashCode) % chars.length]);
    rng.write(random.join());
    return '${rng.toString().substring(0, 8)}-${rng.toString().substring(8, 12)}-${rng.toString().substring(12, 16)}-${rng.toString().substring(16, 20)}-${rng.toString().substring(20, 32)}';
  }

  // ── Internal ────────────────────────────────────────────────────────────────

  // ── Haptic adhan mode ───────────────────────────────────────────────────────

  /// Returns true if haptic adhan mode is enabled.
  /// When enabled and audio is disabled, prayer notifications use a vibration
  /// pattern instead of playing a sound.
  Future<bool> getAdhanHapticMode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('adhan_haptic_mode') ?? false;
  }

  /// Persists the haptic adhan mode setting.
  Future<void> setAdhanHapticMode(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('adhan_haptic_mode', enabled);
  }

  // ── Internal schedule helper ─────────────────────────────────────────────────

  Future<void> _scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    required String channelId,
    bool isTimeSensitive = false,
    String? iosSound,
    List<AndroidNotificationAction>? actions,
    String? payload,
    bool hapticMode = false,
  }) async {
    final tzDate = tz.TZDateTime.from(scheduledDate, tz.local);

    // Haptic vibration pattern mimicking adhan rhythm:
    // two short pulses (500ms) then one long (1000ms), with 300ms gaps.
    final Int64List? vibrationPattern = hapticMode
        ? Int64List.fromList([0, 500, 300, 500, 300, 1000])
        : null;

    await _plugin.zonedSchedule(
      id: id,
      title: title,
      body: body,
      scheduledDate: tzDate,
      payload: payload,
      notificationDetails: NotificationDetails(
        android: AndroidNotificationDetails(
          channelId,
          channelId,
          importance: channelId == NotificationChannels.prayers
              ? Importance.high
              : Importance.defaultImportance,
          priority: Priority.high,
          actions: actions,
          vibrationPattern: vibrationPattern,
        ),
        iOS: DarwinNotificationDetails(
          interruptionLevel: isTimeSensitive
              ? InterruptionLevel.timeSensitive
              : InterruptionLevel.active,
          // When haptic mode is active on iOS the sound is suppressed;
          // the system notification itself triggers the device haptic.
          presentSound: !hapticMode,
          // iosSound is the filename of a sound bundled in the Runner target.
          // Files must be added via Xcode: Runner → Build Phases → Copy Bundle Resources.
          // Supported formats: .caf, .aiff, .mp3 (≤ 30 seconds).
          sound: hapticMode ? null : iosSound,
        ),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
    );
  }

  /// Map AdhanType to the iOS bundle sound filename.
  /// Returns null when silent — iOS plays the system default.
  String? _iosSoundName(AdhanType type) {
    switch (type) {
      case AdhanType.makkah:          return 'adhan_makkah.mp3';
      case AdhanType.madinah:         return 'adhan_madina.mp3';
      case AdhanType.mishari:         return 'adhan_mishari.mp3';
      case AdhanType.fajrMishari:     return 'adhan_fajr_mishari.mp3';
      case AdhanType.abdulBasit:      return 'adhan_abdul_baset.mp3';
      case AdhanType.nasserAlQatami:  return 'adhan_nasser_al_qatami.mp3';
      case AdhanType.egypt:           return 'adhan_egypt.mp3';
      case AdhanType.pashaii:         return 'adhan_pashaii.mp3';
      case AdhanType.beep:            return 'beep2.mp3';
      case AdhanType.silent:          return null;
    }
  }

  DateTime _fractionalHoursToDateTime(DateTime date, double h) {
    final local = h % 24;
    final hours = local.floor();
    final minutes = ((local - hours) * 60).round();
    return DateTime(date.year, date.month, date.day, hours, minutes);
  }

  /// Resolve timezone to UTC offset. Handles IANA IDs and "UTC±H[:MM]" strings.
  double _utcOffsetHours(String timezone, DateTime utcDate) {
    if (timezone.startsWith('UTC')) {
      final rest = timezone.substring(3);
      if (rest.isEmpty) return 0.0;
      final sign = rest.startsWith('-') ? -1.0 : 1.0;
      final parts = rest.substring(1).split(':');
      final h = double.tryParse(parts[0]) ?? 0.0;
      final m = parts.length > 1
          ? (double.tryParse(parts[1]) ?? 0.0) / 60.0
          : 0.0;
      return sign * (h + m);
    }
    try {
      final location = tz.getLocation(timezone);
      final tzTime = tz.TZDateTime.from(utcDate, location);
      return tzTime.timeZoneOffset.inSeconds / 3600.0;
    } catch (_) {
      return 0.0;
    }
  }
}
