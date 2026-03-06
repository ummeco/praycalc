import 'dart:convert';

import 'package:flutter/foundation.dart' show kIsWeb;
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

/// WorkManager callback dispatcher — must be a top-level function.
@pragma('vm:entry-point')
void workManagerCallbackDispatcher() {
  Workmanager().executeTask((task, _) async {
    if (task == _kRescheduleTask) {
      await NotificationService.instance.init();
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
    const ios = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    await _plugin.initialize(
      settings: const InitializationSettings(android: android, iOS: ios),
      onDidReceiveNotificationResponse: _onNotificationResponse,
      onDidReceiveBackgroundNotificationResponse: onBackgroundNotificationResponse,
    );
    await _createChannels();
    await _initWorkManager();
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
    final androidPlugin = _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    await androidPlugin?.createNotificationChannel(prayers);
    await androidPlugin?.createNotificationChannel(reminders);
    await androidPlugin?.createNotificationChannel(persistent);
    await androidPlugin?.createNotificationChannel(ramadan);
    await androidPlugin?.createNotificationChannel(travel);
    await androidPlugin?.createNotificationChannel(prayersCheck);
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

  void _onNotificationResponse(NotificationResponse response) {
    if (response.actionId == 'travel_learn_more' ||
        response.payload == 'praycalc://travel-rulings') {
      // Deep link handled by the router — no action needed here.
      // The app foreground handler in main.dart navigates via GoRouter.
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
    } catch (_) {}
  }

  Future<void> _reschedulePrayerCheck(String? payload) async {
    if (payload == null) return;
    final parts = payload.split('|');
    if (parts.length != 2) return;
    final prayerName = parts[0];
    const fardNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    final idx = fardNames.indexOf(prayerName);

    await _scheduleNotification(
      id: NotificationIds.prayerCheck(idx < 0 ? 0 : idx),
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
            actions: const [
              AndroidNotificationAction('snooze', 'Snooze 10 min'),
              AndroidNotificationAction('dismiss', 'Dismiss'),
            ],
            payload: c.prayerName,
          );
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
      } catch (_) {}
    }

    List<Agenda> agendas = [];
    final agendasRaw = prefs.getString('pc_agendas');
    if (agendasRaw != null) {
      try {
        agendas = (jsonDecode(agendasRaw) as List)
            .cast<Map<String, dynamic>>()
            .map(Agenda.fromJson)
            .toList();
      } catch (_) {}
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

  // ── Internal ────────────────────────────────────────────────────────────────

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
  }) async {
    final tzDate = tz.TZDateTime.from(scheduledDate, tz.local);
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
        ),
        iOS: DarwinNotificationDetails(
          interruptionLevel: isTimeSensitive
              ? InterruptionLevel.timeSensitive
              : InterruptionLevel.active,
          // iosSound is the filename of a sound bundled in the Runner target.
          // Files must be added via Xcode: Runner → Build Phases → Copy Bundle Resources.
          // Supported formats: .caf, .aiff, .mp3 (≤ 30 seconds).
          sound: iosSound,
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
