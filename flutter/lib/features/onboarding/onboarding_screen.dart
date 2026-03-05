import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/providers/geo_provider.dart';
import '../../core/providers/prayer_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';

const _kOnboardingDone = 'onboarding_done';

/// Marks onboarding complete and persists the flag.
Future<void> markOnboardingDone() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool(_kOnboardingDone, true);
  setOnboardingDone(true);
}

/// Returns true if the user has already completed onboarding.
Future<bool> isOnboardingDone() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool(_kOnboardingDone) ?? false;
}

class _Page {
  final IconData icon;
  final String title;
  final String body;
  const _Page(this.icon, this.title, this.body);
}

const _pages = [
  _Page(
    Icons.wb_sunny_outlined,
    'Prayer times, wherever you are',
    'GPS-accurate salah times for every city on earth. '
        'Fajr to Isha, sunrise to Qiyam. '
        'Powered by our own calculation engine, built for precision.',
  ),
  _Page(
    Icons.location_on_outlined,
    'Your location, your times',
    'Search any city or let GPS detect your location. '
        'PrayCalc finds times for 5 million cities worldwide.',
  ),
  _Page(
    Icons.notifications_outlined,
    'Never miss a prayer',
    'Adhan at prayer time, reminders before it. '
        'Custom agendas for Suhoor, classes, and more.',
  ),
  _Page(
    Icons.explore_outlined,
    'Everything you need',
    'Qibla compass, prayer calendar, Hijri moon phase, '
        'Tasbeeh counter. All in one place.',
  ),
];

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _page = 0;
  bool _finishing = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _next() {
    if (_page < _pages.length - 1) {
      _controller.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      _finish();
    }
  }

  void _finish() async {
    if (_finishing) return;
    setState(() => _finishing = true);
    await markOnboardingDone();
    if (!mounted) return;
    // Auto-detect GPS location before navigating to home
    final container = ProviderScope.containerOf(context);
    final gps = container.read(gpsProvider.notifier);
    await gps.requestLocation();
    final gpsState = container.read(gpsProvider);
    if (gpsState.hasPosition) {
      final city = await reverseGeocodeToCity(gpsState.lat!, gpsState.lng!);
      if (city != null) {
        container.read(cityProvider.notifier).state = city;
        // Persist city directly (persistCity requires WidgetRef)
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('lastCity_name', city.name);
        await prefs.setString('lastCity_country', city.country);
        if (city.state != null) await prefs.setString('lastCity_state', city.state!);
        await prefs.setDouble('lastCity_lat', city.lat);
        await prefs.setDouble('lastCity_lng', city.lng);
        await prefs.setString('lastCity_tz', city.timezone);
      }
    }
    if (mounted) context.go(Routes.home);
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isLast = _page == _pages.length - 1;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            Align(
              alignment: Alignment.topRight,
              child: TextButton(
                onPressed: _finishing ? null : _finish,
                child: const Text('Skip'),
              ),
            ),

            // Pages
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (i) => setState(() => _page = i),
                itemCount: _pages.length,
                itemBuilder: (_, i) => _OnboardingPage(page: _pages[i]),
              ),
            ),

            // Dots + button
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              child: Column(
                children: [
                  // Page dots
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_pages.length, (i) {
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: i == _page ? 24 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: i == _page
                              ? PrayCalcColors.mid
                              : cs.outlineVariant,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 24),

                  // Next / Get Started button
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _finishing ? null : _next,
                      style: FilledButton.styleFrom(
                        backgroundColor: cs.primary,
                        foregroundColor: cs.onPrimary,
                        padding:
                            const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _finishing
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Text(
                              isLast ? 'Get Started' : 'Next',
                              style: const TextStyle(fontSize: 16),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingPage extends StatelessWidget {
  const _OnboardingPage({required this.page});
  final _Page page;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: cs.primary.withAlpha(25),
              shape: BoxShape.circle,
            ),
            child: Icon(
              page.icon,
              size: 56,
              color: cs.primary,
            ),
          ),
          const SizedBox(height: 40),
          Text(
            page.title,
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: cs.onSurface,
              height: 1.2,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            page.body,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurface.withAlpha(180),
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
