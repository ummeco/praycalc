import 'dart:async' show unawaited;
import 'dart:io' show Platform;

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:shorebird_code_push/shorebird_code_push.dart';
import 'package:window_manager/window_manager.dart';

import 'core/models/alert_config.dart';
import 'core/platform/url_strategy.dart';
import 'core/providers/geo_provider.dart';
import 'core/providers/notification_provider.dart';
import 'core/providers/prayer_provider.dart';
import 'core/providers/ramadan_provider.dart';
import 'core/providers/settings_provider.dart';
import 'core/providers/travel_provider.dart';
import 'core/router/app_router.dart';
import 'core/services/notification_service.dart';
import 'core/services/watch_bridge_service.dart';
import 'core/theme/app_theme.dart';
import 'features/desktop/desktop_adhan_alert.dart';
import 'features/desktop/desktop_full_window.dart';
import 'features/desktop/desktop_tray_app.dart';
import 'features/onboarding/onboarding_screen.dart';
import 'features/quran/quran_audio_handler.dart';

// DSN is injected at build time via --dart-define=SENTRY_DSN=https://...
// If empty (dev / CI without secrets), Sentry initialises but sends nothing.
const _kSentryDsn = String.fromEnvironment('SENTRY_DSN');

/// Silently downloads a Shorebird OTA patch if one is available.
/// Staged patch is applied on the next cold restart — never mid-session.
Future<void> _checkShorebirdUpdate() async {
  try {
    final codePush = ShorebirdCodePush();
    final isAvailable = await codePush.isNewPatchAvailableForDownload();
    if (isAvailable) {
      await codePush.downloadUpdateIfAvailable();
    }
  } catch (_) {
    // Network errors or Shorebird not configured — silently ignore.
  }
}

void main() async {
  setPathUrlStrategy(); // path-based URLs on web (no hash); no-op on other platforms
  WidgetsFlutterBinding.ensureInitialized();

  // Desktop: initialize window manager before anything else.
  if (!kIsWeb && (Platform.isMacOS || Platform.isWindows || Platform.isLinux)) {
    await windowManager.ensureInitialized();
    const WindowOptions windowOptions = WindowOptions(
      size: Size(1280, 800),
      minimumSize: Size(800, 600),
      center: true,
      title: 'PrayCalc',
      titleBarStyle: TitleBarStyle.normal,
    );
    await windowManager.waitUntilReadyToShow(windowOptions, () async {
      await windowManager.show();
      await windowManager.focus();
    });
  }

  await NotificationService.instance.init();
  // QURAN-2: Initialize audio_service handler for background playback + lock screen controls.
  if (!kIsWeb) await QuranAudioHandler.init();
  if (!kIsWeb && Platform.isIOS) {
    await WatchBridgeService.instance.init();
  }
  final lastCity = await loadLastCity();
  final onboardingDone = await isOnboardingDone();
  setOnboardingDone(onboardingDone);

  // Silently check for a Shorebird OTA patch in the background.
  // Never blocks startup — downloads and stages for the next cold restart.
  if (!kIsWeb) {
    unawaited(_checkShorebirdUpdate());
  }

  final app = ProviderScope(
    overrides: [
      if (lastCity != null) cityProvider.overrideWith((ref) => lastCity),
    ],
    child: const PrayCalcApp(),
  );

  // Sentry wraps runApp in its own zone, which causes a zone mismatch on web.
  // Skip it on web and when no DSN is configured (local dev).
  if (kIsWeb || _kSentryDsn.isEmpty) {
    runApp(app);
  } else {
    await SentryFlutter.init(
      (options) {
        options.dsn = _kSentryDsn;
        options.tracesSampleRate = 0.2;
        options.environment =
            const bool.fromEnvironment('dart.vm.product') ? 'production' : 'debug';
      },
      appRunner: () => runApp(app),
    );
  }
}

class PrayCalcApp extends ConsumerStatefulWidget {
  const PrayCalcApp({super.key});

  @override
  ConsumerState<PrayCalcApp> createState() => _PrayCalcAppState();
}

class _PrayCalcAppState extends ConsumerState<PrayCalcApp> with WindowListener {
  DesktopTrayApp? _trayApp;

  @override
  void initState() {
    super.initState();
    if (!kIsWeb && (Platform.isMacOS || Platform.isWindows || Platform.isLinux)) {
      windowManager.addListener(this);
      // Intercept close button so we can hide-to-tray instead of quitting.
      windowManager.setPreventClose(true);
      DesktopAdhanAlert.init().catchError((_) {});
      WidgetsBinding.instance.addPostFrameCallback((_) {
        DesktopFullWindow.registerShowCallback(() {
          appRouter.push(Routes.desktopFullWindow);
        });
        final l10n = AppLocalizations.of(context)!;
        final tray = DesktopTrayApp(ref, l10n);
        tray.init();
        _trayApp = tray;
      });
    }

    // LINK-C2: Consume pendingRoute set during cold-start notification launch.
    // Navigate once the first frame is rendered so GoRouter is ready.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final route = NotificationService.instance.pendingRoute;
      if (route != null) {
        NotificationService.instance.pendingRoute = null;
        appRouter.push(route);
      }
    });
  }

  @override
  void dispose() {
    if (!kIsWeb && (Platform.isMacOS || Platform.isWindows || Platform.isLinux)) {
      windowManager.removeListener(this);
    }
    _trayApp?.dispose();
    super.dispose();
  }

  @override
  void onWindowClose() async {
    await windowManager.hide();
  }

  @override
  Widget build(BuildContext context) {
    // Keep the notification rescheduler alive for the full app session.
    // It watches city + hanafi + agendas + configs and reschedules on any change.
    ref.listen(notificationReschedulerProvider, (_, _) {});
    // IOS-W-3: push widget_next_prayer, widget_next_prayer_time, widget_location_name
    // to home screen widgets whenever city or prayer times change.
    ref.listen(widgetUpdaterProvider, (_, _) {});
    // During Ramadan: write sahur/iftar mins-remaining to SharedPrefs for the shade.
    ref.listen(ramadanShadeWriterProvider, (_, _) {});
    // Auto-set home coordinates from the first city the user selects.
    ref.listen(travelHomeAutosetProvider, (_, _) {});
    // WearOS: push prayer times to paired Wear OS device whenever they change.
    if (!kIsWeb && Platform.isAndroid) {
      ref.listen(wearOsSyncProvider, (_, _) {});
    }

    // Desktop prayer alert monitoring.
    if (!kIsWeb && DesktopAlertScheduler.isDesktop) {
      ref.listen(prayerTimesProvider, (_, next) {
        next.whenData((times) {
          final settings = ref.read(settingsProvider);
          DesktopAlertScheduler.instance.start(
            prayerTimesH: {
              'Fajr': times.fajr,
              'Sunrise': times.sunrise,
              'Dhuhr': times.dhuhr,
              'Asr': times.asr,
              'Maghrib': times.maghrib,
              'Isha': times.isha,
            },
            use24h: settings.use24h,
          );
        });
      });
      DesktopAlertScheduler.instance.onAlert ??= (prayer, formattedTime) {
        final alertSettings = ref.read(alertSettingsProvider);
        if (!alertSettings.globalEnabled) return;
        final config = alertSettings.perPrayer[prayer.toLowerCase()]
            ?? const PrayerAlertConfig();
        final ctx = appRouter.routerDelegate.navigatorKey.currentContext;
        if (ctx != null && ctx.mounted) {
          DesktopAdhanAlert.show(
            context: ctx,
            prayerName: prayer,
            prayerTimeFormatted: formattedTime,
            config: config,
            mediaPauseEnabled: alertSettings.mediaPauseEnabled,
          );
        }
      };
    }

    final settings = ref.watch(settingsProvider);

    final ThemeMode themeMode;
    if (settings.followSystem ?? true) {
      themeMode = ThemeMode.system;
    } else {
      themeMode = settings.darkMode ? ThemeMode.dark : ThemeMode.light;
    }

    final locale =
        settings.locale != null ? Locale(settings.locale!) : null;

    return MaterialApp.router(
      title: 'PrayCalc',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: themeMode,
      routerConfig: appRouter,
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
    );
  }
}
