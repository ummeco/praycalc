import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/adhan/adhan_library_screen.dart';
import '../../features/adhan/adhan_record_screen.dart';
import '../../features/agendas/agenda_edit_screen.dart';
import '../../features/agendas/agenda_list_screen.dart';
import '../../features/auth/account_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../shared/models/agenda_model.dart';
import '../../features/calendar/calendar_screen.dart';
import '../../features/calendar/yearly_calendar_screen.dart';
import '../../features/city_search/city_search_screen.dart';
import '../../features/dhikr/dhikr_flow_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/home/set_home_screen.dart';
import '../../features/moon/moon_screen.dart';
import '../../shared/widgets/moon_phase_icon.dart';
import '../../features/onboarding/onboarding_screen.dart';
import '../../features/qibla/qibla_screen.dart';
import '../../features/quran/quran_player_screen.dart';
import '../../features/ramadan/fasting_tracker_screen.dart';
import '../../features/settings/about_screen.dart';
import '../../features/settings/notification_settings_screen.dart';
import '../../features/settings/settings_screen.dart';
import '../../features/stats/prayer_stats_screen.dart';
import '../../features/dua_dhikr/dua_dhikr_screen.dart';
import '../../features/smart_home/smart_home_settings_screen.dart';
import '../../features/subscription/subscription_screen.dart';
import '../../features/travel/travel_rulings_screen.dart';
import '../../features/tv/tv_ambient_screen.dart';
import '../../features/tv/tv_google_photos_picker_screen.dart';
import '../../features/tv/tv_home_screen.dart';
import '../../features/tv/tv_splash_screen.dart';
import '../../features/tv/tv_masjid_screen.dart';
import '../../features/tv/tv_add_from_mobile_screen.dart';
import '../../features/tv/tv_device_list_screen.dart';
import '../../features/tv/tv_quran_control_screen.dart';
import '../../features/tv/tv_onboarding_screen.dart';
import '../../features/tv/tv_paired_screen.dart';
import '../../features/tv/tv_pairing_screen.dart';
import '../../features/tv/tv_quran_player_screen.dart';
import '../../features/tv/tv_remote_settings_screen.dart';
import '../../features/tv/tv_settings_screen.dart';
import '../../features/desktop/desktop_full_window.dart';

/// Named route paths.
class Routes {
  static const home                 = '/';
  static const onboarding           = '/onboarding';
  static const citySearch           = '/city-search';
  static const qibla                = '/qibla';
  static const calendar             = '/calendar';
  static const settings             = '/settings';
  static const notificationSettings = '/settings/notifications';
  static const adhanLibrary         = '/settings/adhan-library';
  static const adhanRecord          = '/settings/adhan-record';
  static const about                = '/about';
  static const moon                 = '/moon';
  static const duaDhikr             = '/dua-dhikr';
  static const dhikrFlow            = '/dhikr-flow';
  static const agendas              = '/agendas';
  static const agendaEdit           = '/agendas/edit';
  static const stats                = '/stats';
  static const yearlyCalendar       = '/yearly-calendar';
  static const login                = '/login';
  static const account              = '/account';
  static const travelRulings        = '/travel-rulings';
  static const setHome              = '/set-home';
  static const subscription         = '/subscription';
  static const smartHome            = '/smart-home';
  static const quranPlayer          = '/quran/player';
  static const ramadanTracker       = '/ramadan/tracker';
  static const tvSplash             = '/tv/splash';
  static const tvHome               = '/tv';
  static const tvMasjid             = '/tv/masjid';
  static const tvSettings           = '/tv/settings';
  static const tvAmbient            = '/tv/ambient';
  static const tvPairing            = '/tv/pairing';
  static const tvGooglePhotos       = '/tv/google-photos';
  static const pairedTvs            = '/paired-tvs';
  static const tvRemoteSettings     = '/paired-tvs/settings';
  static const tvAddFromMobile      = '/paired-tvs/add';
  static const tvQuranPlayer        = '/tv/quran-player';
  static const tvOnboarding         = '/tv/onboarding';
  static const tvDeviceList         = '/tv/devices';
  static const tvQuranControl       = '/paired-tvs/quran';
  static const desktopFullWindow    = '/desktop';
}

/// Set to true after first launch check resolves — prevents flicker redirect.
bool _onboardingDoneCache = false;

/// Call from main() with the resolved value before building the app.
void setOnboardingDone(bool done) => _onboardingDoneCache = done;

final appRouter = GoRouter(
  // Web = TV app (port 8080). Start at splash → animates → pairing → TV.
  initialLocation: kIsWeb ? Routes.tvSplash : Routes.home,
  redirect: (context, state) {
    final path = state.matchedLocation;
    // TV routes bypass mobile onboarding — TV has its own pairing flow.
    if (path.startsWith('/tv') || path.startsWith('/paired-tvs')) return null;
    final goingToOnboarding = path == Routes.onboarding;
    if (!_onboardingDoneCache && !goingToOnboarding) {
      return Routes.onboarding;
    }
    return null;
  },
  routes: [
    // ── Onboarding (full-screen, no shell) ────────────────────────────────
    GoRoute(
      path: Routes.onboarding,
      builder: (context, state) => const OnboardingScreen(),
    ),

    // ── Main app (bottom nav shell) ───────────────────────────────────────
    ShellRoute(
      builder: (context, state, child) => _AppShell(child: child),
      routes: [
        GoRoute(
          path: Routes.home,
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: HomeScreen()),
        ),
        GoRoute(
          path: Routes.qibla,
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: QiblaScreen()),
        ),
        GoRoute(
          path: Routes.duaDhikr,
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: DuaDhikrScreen()),
        ),
        GoRoute(
          path: Routes.agendas,
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: AgendaListScreen()),
        ),
        GoRoute(
          path: Routes.moon,
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: MoonScreen()),
        ),
        GoRoute(
          path: Routes.settings,
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: SettingsScreen()),
        ),
      ],
    ),
    // ── Full-screen push routes (no bottom nav) ────────────────────────────
    GoRoute(
      path: Routes.citySearch,
      builder: (context, state) => const CitySearchScreen(),
    ),
    GoRoute(
      path: Routes.calendar,
      builder: (context, state) {
        final initialMonth = state.extra as DateTime?;
        return CalendarScreen(initialMonth: initialMonth);
      },
    ),
    GoRoute(
      path: Routes.agendaEdit,
      builder: (context, state) =>
          AgendaEditScreen(agenda: state.extra as Agenda?),
    ),
    GoRoute(
      path: Routes.notificationSettings,
      builder: (context, state) => const NotificationSettingsScreen(),
    ),
    GoRoute(
      path: Routes.adhanLibrary,
      builder: (context, state) => const AdhanLibraryScreen(),
    ),
    GoRoute(
      path: Routes.adhanRecord,
      builder: (context, state) => const AdhanRecordScreen(),
    ),
    GoRoute(
      path: Routes.dhikrFlow,
      builder: (context, state) => const DhikrFlowScreen(),
    ),
    GoRoute(
      path: Routes.quranPlayer,
      builder: (context, state) => const QuranPlayerScreen(),
    ),
    GoRoute(
      path: Routes.ramadanTracker,
      builder: (context, state) => const FastingTrackerScreen(),
    ),
    GoRoute(
      path: Routes.about,
      builder: (context, state) => const AboutScreen(),
    ),
    GoRoute(
      path: Routes.stats,
      builder: (context, state) => const PrayerStatsScreen(),
    ),
    // ── Auth routes ──────────────────────────────────────────────────────
    GoRoute(
      path: Routes.login,
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: Routes.account,
      builder: (context, state) => const AccountScreen(),
    ),
    GoRoute(
      path: Routes.yearlyCalendar,
      builder: (context, state) => const YearlyCalendarScreen(),
    ),
    // ── Travel ────────────────────────────────────────────────────────────
    GoRoute(
      path: Routes.travelRulings,
      builder: (context, state) => const TravelRulingsScreen(),
    ),
    GoRoute(
      path: Routes.setHome,
      builder: (context, state) => const SetHomeScreen(),
    ),
    // ── Subscription & Smart Home ─────────────────────────────────────────
    GoRoute(
      path: Routes.subscription,
      builder: (context, state) => const SubscriptionScreen(),
    ),
    GoRoute(
      path: Routes.smartHome,
      builder: (context, state) => const SmartHomeSettingsScreen(),
    ),
    // ── TV routes ──────────────────────────────────────────────────────────
    GoRoute(
      path: Routes.tvSplash,
      builder: (context, state) => const TvSplashScreen(),
    ),
    GoRoute(
      path: Routes.tvGooglePhotos,
      builder: (context, state) => const TvGooglePhotosPickerScreen(),
    ),
    GoRoute(
      path: Routes.tvHome,
      builder: (context, state) => const TvHomeScreen(),
    ),
    GoRoute(
      path: Routes.tvMasjid,
      builder: (context, state) => const TvMasjidScreen(),
    ),
    GoRoute(
      path: Routes.tvSettings,
      builder: (context, state) => const TvSettingsScreen(),
    ),
    GoRoute(
      path: Routes.tvAmbient,
      builder: (context, state) => const TvAmbientScreen(),
    ),
    GoRoute(
      path: Routes.tvPairing,
      builder: (context, state) => const TvPairingScreen(),
    ),
    GoRoute(
      path: Routes.pairedTvs,
      builder: (context, state) => const TvPairedScreen(),
    ),
    GoRoute(
      path: Routes.tvRemoteSettings,
      builder: (context, state) {
        final extra = state.extra as Map<String, String>? ?? {};
        return TvRemoteSettingsScreen(
          deviceId: extra['deviceId'] ?? '',
          deviceName: extra['deviceName'] ?? 'TV',
        );
      },
    ),
    GoRoute(
      path: Routes.tvAddFromMobile,
      builder: (context, state) => const TvAddFromMobileScreen(),
    ),
    GoRoute(
      path: Routes.tvQuranPlayer,
      builder: (context, state) => const TvQuranPlayerScreen(),
    ),
    GoRoute(
      path: Routes.tvOnboarding,
      builder: (context, state) => const TvOnboardingScreen(),
    ),
    GoRoute(
      path: Routes.tvDeviceList,
      builder: (context, state) => const TvDeviceListScreen(),
    ),
    GoRoute(
      path: Routes.tvQuranControl,
      builder: (context, state) {
        final extra = state.extra as Map<String, String>? ?? {};
        return TvQuranControlScreen(
          deviceId: extra['deviceId'],
          deviceName: extra['deviceName'],
        );
      },
    ),
    // ── Desktop full window ────────────────────────────────────────────────
    GoRoute(
      path: Routes.desktopFullWindow,
      builder: (context, state) => const DesktopFullWindowScreen(),
    ),
  ],
);

class _AppShell extends StatelessWidget {
  const _AppShell({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    final selectedIndex = _indexForPath(location);

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (i) => _navigate(context, i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Prayers',
          ),
          NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore),
            label: 'Qibla',
          ),
          NavigationDestination(
            icon: MoonPhaseNavIcon(),
            selectedIcon: MoonPhaseNavIcon(),
            label: 'Hilal',
          ),
          NavigationDestination(
            icon: Icon(Icons.checklist_outlined),
            selectedIcon: Icon(Icons.checklist),
            label: 'Agenda',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings_rounded),
            label: 'Settings',
          ),
        ],
      ),
    );
  }

  int _indexForPath(String path) {
    if (path.startsWith(Routes.qibla)) return 1;
    if (path.startsWith(Routes.moon)) return 2;
    if (path.startsWith(Routes.agendas)) return 3;
    if (path.startsWith(Routes.settings)) return 4;
    return 0;
  }

  void _navigate(BuildContext context, int index) {
    switch (index) {
      case 0: context.go(Routes.home);
      case 1: context.go(Routes.qibla);
      case 2: context.go(Routes.moon);
      case 3: context.go(Routes.agendas);
      case 4: context.go(Routes.settings);
    }
  }
}
