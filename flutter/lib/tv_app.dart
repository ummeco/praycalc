import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/providers/settings_provider.dart';
import 'core/theme/app_theme.dart';
import 'features/city_search/city_search_screen.dart';
import 'features/tv/tv_ambient_screen.dart';
import 'features/tv/tv_home_screen.dart';
import 'features/tv/tv_splash_screen.dart';
import 'features/tv/tv_masjid_screen.dart';
import 'features/tv/tv_onboarding_screen.dart';
import 'features/tv/tv_pairing_screen.dart';
import 'features/tv/tv_settings_screen.dart';
import 'l10n/app_localizations.dart';

// P-21: Whether a TV session JWT is already stored.
bool kTvIsPaired = false;

class TvRoutes {
  static const home        = '/';
  static const masjid      = '/masjid';
  static const settings    = '/settings';
  static const ambient     = '/tv/ambient';
  static const citySearch  = '/city-search';
  static const splash      = '/splash';
  static const onboarding  = '/onboarding';
  static const pairing     = '/pairing';
}

final tvRouter = GoRouter(
  initialLocation: TvRoutes.splash,
  redirect: (context, state) {
    final loc = state.matchedLocation;
    const setupPaths = {
      TvRoutes.splash,
      TvRoutes.onboarding,
      TvRoutes.pairing,
      '/tv',
    };
    if (!kTvIsPaired && !setupPaths.contains(loc)) {
      return TvRoutes.splash;
    }
    return null;
  },
  routes: [
    GoRoute(
      path: TvRoutes.home,
      builder: (context, state) => const TvHomeScreen(),
    ),
    GoRoute(
      path: TvRoutes.masjid,
      builder: (context, state) => const TvMasjidScreen(),
    ),
    GoRoute(
      path: TvRoutes.settings,
      builder: (context, state) => const TvSettingsScreen(),
    ),
    GoRoute(
      path: TvRoutes.ambient,
      builder: (context, state) => const TvAmbientScreen(),
    ),
    GoRoute(
      path: TvRoutes.citySearch,
      builder: (context, state) => const CitySearchScreen(),
    ),
    GoRoute(
      path: TvRoutes.splash,
      builder: (context, state) => const TvSplashScreen(),
    ),
    GoRoute(
      path: TvRoutes.onboarding,
      builder: (context, state) => const TvOnboardingScreen(),
    ),
    GoRoute(
      path: TvRoutes.pairing,
      builder: (context, state) => const TvPairingScreen(),
    ),
    GoRoute(
      path: '/tv',
      builder: (context, state) {
        kTvIsPaired = true;
        return const TvHomeScreen();
      },
    ),
  ],
);

ThemeData tvTheme() {
  final base = AppTheme.dark();
  return base.copyWith(
    scaffoldBackgroundColor: const Color(0xFF0D2010), // PrayCalcColors.deep
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

class PrayCalcTvApp extends ConsumerWidget {
  const PrayCalcTvApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final locale = settings.locale != null ? Locale(settings.locale!) : null;

    return Shortcuts(
      shortcuts: <ShortcutActivator, Intent>{
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
        theme: tvTheme(),
        darkTheme: tvTheme(),
        themeMode: ThemeMode.dark,
        routerConfig: tvRouter,
        locale: locale,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
      ),
    );
  }
}
