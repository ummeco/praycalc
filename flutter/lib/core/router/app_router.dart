import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/agendas/agenda_edit_screen.dart';
import '../../features/agendas/agenda_list_screen.dart';
import '../../shared/models/agenda_model.dart';
import '../../features/calendar/calendar_screen.dart';
import '../../features/city_search/city_search_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/moon/moon_screen.dart';
import '../../features/onboarding/onboarding_screen.dart';
import '../../features/qibla/qibla_screen.dart';
import '../../features/settings/about_screen.dart';
import '../../features/settings/notification_settings_screen.dart';
import '../../features/settings/settings_screen.dart';
import '../../features/tasbeeh/tasbeeh_screen.dart';

/// Named route paths.
class Routes {
  static const home                 = '/';
  static const onboarding           = '/onboarding';
  static const citySearch           = '/city-search';
  static const qibla                = '/qibla';
  static const calendar             = '/calendar';
  static const settings             = '/settings';
  static const notificationSettings = '/settings/notifications';
  static const about                = '/about';
  static const moon                 = '/moon';
  static const tasbeeh              = '/tasbeeh';
  static const agendas              = '/agendas';
  static const agendaEdit           = '/agendas/edit';
}

/// Set to true after first launch check resolves — prevents flicker redirect.
bool _onboardingDoneCache = false;

/// Call from main() with the resolved value before building the app.
void setOnboardingDone(bool done) => _onboardingDoneCache = done;

final appRouter = GoRouter(
  initialLocation: Routes.home,
  redirect: (context, state) {
    final goingToOnboarding = state.matchedLocation == Routes.onboarding;
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
          path: Routes.calendar,
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: CalendarScreen()),
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
      path: Routes.moon,
      builder: (context, state) => const MoonScreen(),
    ),
    GoRoute(
      path: Routes.tasbeeh,
      builder: (context, state) => const TasbeehScreen(),
    ),
    GoRoute(
      path: Routes.agendas,
      builder: (context, state) => const AgendaListScreen(),
      routes: [
        GoRoute(
          path: 'edit',
          builder: (context, state) {
            // Pass an existing Agenda via GoRouter extra for edit mode.
            // Null extra = create mode.
            return AgendaEditScreen(agenda: state.extra as Agenda?);
          },
        ),
      ],
    ),
    GoRoute(
      path: Routes.notificationSettings,
      builder: (context, state) => const NotificationSettingsScreen(),
    ),
    GoRoute(
      path: Routes.about,
      builder: (context, state) => const AboutScreen(),
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
            selectedIcon: Icon(Icons.home),
            label: 'Prayers',
          ),
          NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore),
            label: 'Qibla',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: 'Calendar',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
    );
  }

  int _indexForPath(String path) {
    if (path.startsWith(Routes.qibla)) return 1;
    if (path.startsWith(Routes.calendar)) return 2;
    if (path.startsWith(Routes.settings)) return 3;
    return 0;
  }

  void _navigate(BuildContext context, int index) {
    switch (index) {
      case 0: context.go(Routes.home);
      case 1: context.go(Routes.qibla);
      case 2: context.go(Routes.calendar);
      case 3: context.go(Routes.settings);
    }
  }
}
