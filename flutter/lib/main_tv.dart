import 'dart:async' show unawaited;

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:shorebird_code_push/shorebird_code_push.dart';

import 'core/providers/geo_provider.dart';
import 'core/providers/prayer_provider.dart';
import 'core/providers/settings_provider.dart';
import 'core/services/notification_service.dart';
import 'core/theme/app_theme.dart';
import 'features/city_search/city_search_screen.dart';
import 'features/tv/tv_ambient_screen.dart';
import 'features/tv/tv_home_screen.dart';
import 'features/tv/tv_masjid_screen.dart';
import 'features/tv/tv_settings_screen.dart';
import 'l10n/app_localizations.dart';

// DSN is injected at build time via --dart-define=SENTRY_DSN=https://...
const _kSentryDsn = String.fromEnvironment('SENTRY_DSN');

/// Silently downloads a Shorebird OTA patch if one is available.
Future<void> _checkShorebirdUpdate() async {
  try {
    final codePush = ShorebirdCodePush();
    final isAvailable = await codePush.isNewPatchAvailableForDownload();
    if (isAvailable) {
      await codePush.downloadUpdateIfAvailable();
    }
  } catch (_) {
    // Network errors or Shorebird not configured.
  }
}

// ─── TV Router ─────────────────────────────────────────────────────────────

class _TvRoutes {
  static const home = '/';
  static const masjid = '/masjid';
  static const settings = '/settings';
  static const ambient = '/ambient';
  static const citySearch = '/city-search';
}

final _tvRouter = GoRouter(
  initialLocation: _TvRoutes.home,
  routes: [
    GoRoute(
      path: _TvRoutes.home,
      builder: (context, state) => const TvHomeScreen(),
    ),
    GoRoute(
      path: _TvRoutes.masjid,
      builder: (context, state) => const TvMasjidScreen(),
    ),
    GoRoute(
      path: _TvRoutes.settings,
      builder: (context, state) => const TvSettingsScreen(),
    ),
    GoRoute(
      path: _TvRoutes.ambient,
      builder: (context, state) => const TvAmbientScreen(),
    ),
    GoRoute(
      path: _TvRoutes.citySearch,
      builder: (context, state) => const CitySearchScreen(),
    ),
  ],
);

// ─── TV Theme ──────────────────────────────────────────────────────────────

ThemeData _tvTheme() {
  final base = AppTheme.dark();
  return base.copyWith(
    scaffoldBackgroundColor: PrayCalcColors.deep,
    textTheme: base.textTheme.copyWith(
      displayLarge: base.textTheme.displayLarge?.copyWith(fontSize: 72),
      displayMedium: base.textTheme.displayMedium?.copyWith(fontSize: 56),
      titleLarge: base.textTheme.titleLarge?.copyWith(fontSize: 36),
      titleMedium: base.textTheme.titleMedium?.copyWith(fontSize: 28),
      bodyLarge: base.textTheme.bodyLarge?.copyWith(fontSize: 24),
      bodyMedium: base.textTheme.bodyMedium?.copyWith(fontSize: 22),
    ),
  );
}

// ─── Entry point ───────────────────────────────────────────────────────────

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.instance.init();
  final lastCity = await loadLastCity();

  // Immersive full-screen for TV.
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);

  // OTA update check in background.
  if (!kIsWeb) {
    unawaited(_checkShorebirdUpdate());
  }

  final app = ProviderScope(
    overrides: [
      if (lastCity != null) cityProvider.overrideWith((ref) => lastCity),
    ],
    child: const PrayCalcTvApp(),
  );

  if (kIsWeb || _kSentryDsn.isEmpty) {
    runApp(app);
  } else {
    await SentryFlutter.init(
      (options) {
        options.dsn = _kSentryDsn;
        options.tracesSampleRate = 0.2;
        options.environment =
            const bool.fromEnvironment('dart.vm.product')
                ? 'production'
                : 'debug';
      },
      appRunner: () => runApp(app),
    );
  }
}

// ─── TV App ────────────────────────────────────────────────────────────────

class PrayCalcTvApp extends ConsumerWidget {
  const PrayCalcTvApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final locale =
        settings.locale != null ? Locale(settings.locale!) : null;

    return Shortcuts(
      shortcuts: <ShortcutActivator, Intent>{
        // Map TV remote D-pad keys to focus traversal.
        const SingleActivator(LogicalKeyboardKey.arrowUp):
            const DirectionalFocusIntent(TraversalDirection.up),
        const SingleActivator(LogicalKeyboardKey.arrowDown):
            const DirectionalFocusIntent(TraversalDirection.down),
        const SingleActivator(LogicalKeyboardKey.arrowLeft):
            const DirectionalFocusIntent(TraversalDirection.left),
        const SingleActivator(LogicalKeyboardKey.arrowRight):
            const DirectionalFocusIntent(TraversalDirection.right),
      },
      child: MaterialApp.router(
        title: 'PrayCalc TV',
        debugShowCheckedModeBanner: false,
        theme: _tvTheme(),
        darkTheme: _tvTheme(),
        themeMode: ThemeMode.dark, // TV always dark
        routerConfig: _tvRouter,
        locale: locale,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
      ),
    );
  }
}
