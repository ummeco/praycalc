import 'dart:async' show unawaited;

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:shorebird_code_push/shorebird_code_push.dart';

import 'core/providers/geo_provider.dart';
import 'core/providers/notification_provider.dart';
import 'core/providers/prayer_provider.dart';
import 'core/providers/ramadan_provider.dart';
import 'core/providers/settings_provider.dart';
import 'core/providers/travel_provider.dart';
import 'core/router/app_router.dart';
import 'core/services/notification_service.dart';
import 'core/theme/app_theme.dart';
import 'features/onboarding/onboarding_screen.dart';

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
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.instance.init();
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

class PrayCalcApp extends ConsumerWidget {
  const PrayCalcApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Keep the notification rescheduler alive for the full app session.
    // It watches city + hanafi + agendas + configs and reschedules on any change.
    ref.listen(notificationReschedulerProvider, (_, _) {});
    // During Ramadan: write sahur/iftar mins-remaining to SharedPrefs for the shade.
    ref.listen(ramadanShadeWriterProvider, (_, _) {});
    // Auto-set home coordinates from the first city the user selects.
    ref.listen(travelHomeAutosetProvider, (_, _) {});

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
