import 'package:flutter/material.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../../core/providers/auth_provider.dart';
import '../../core/providers/geo_provider.dart';
import '../../core/providers/prayer_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/settings_model.dart';

/// Language options for onboarding picker (no "System default" here — user picks explicitly).
const _onboardingLocales = [
  ('English', 'en'),
  ('العربية', 'ar'),
  ('Türkçe', 'tr'),
  ('اردو', 'ur'),
  ('Bahasa Indonesia', 'id'),
  ('Français', 'fr'),
  ('বাংলা', 'bn'),
  ('Soomaali', 'so'),
  ('Deutsch', 'de'),
  ('Español', 'es'),
  ('हिन्दी', 'hi'),
];

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

List<_Page> _getPages(AppLocalizations l) => [
  _Page(Icons.wb_sunny_outlined, l.onboardingTitle1, l.onboardingBody1),
  _Page(Icons.location_on_outlined, l.onboardingTitle2, l.onboardingBody2),
  _Page(Icons.notifications_outlined, l.onboardingTitle3, l.onboardingBody3),
  _Page(Icons.explore_outlined, l.onboardingTitle4, l.onboardingBody4),
];

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

enum _Step { language, info, signIn }

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _controller = PageController();
  int _page = 0;
  _Step _step = _Step.language;
  bool _completing = false;
  String? _socialError;
  City? _gpsCity;
  String _selectedLocale = 'en';

  @override
  void initState() {
    super.initState();
    // Pre-select the system language if it's one we support.
    final systemLang = WidgetsBinding.instance.platformDispatcher.locale.languageCode;
    final supported = _onboardingLocales.map((e) => e.$2).toSet();
    if (supported.contains(systemLang)) {
      _selectedLocale = systemLang;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  static const _pageCount = 4;

  void _confirmLanguage() {
    ref.read(settingsProvider.notifier).setLocale(_selectedLocale);
    setState(() => _step = _Step.info);
  }

  void _next() {
    if (_page < _pageCount - 1) {
      _controller.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      _goToSignIn();
    }
  }

  void _goToSignIn() {
    setState(() => _step = _Step.signIn);
    // Request GPS silently while user sees sign-in step
    _requestGpsInBackground();
  }

  void _requestGpsInBackground() {
    ref.read(gpsProvider.notifier).requestLocation().then((_) async {
      if (!mounted) return;
      final gpsState = ref.read(gpsProvider);
      if (gpsState.hasPosition) {
        final city = await reverseGeocodeToCity(gpsState.lat!, gpsState.lng!);
        if (mounted) setState(() => _gpsCity = city);
      }
    });
  }

  Future<void> _complete() async {
    if (_completing) return;
    setState(() => _completing = true);

    await markOnboardingDone();

    // Apply GPS city if we got one
    final city = _gpsCity;
    if (city != null) {
      ref.read(cityProvider.notifier).state = city;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('lastCity_name', city.name);
      await prefs.setString('lastCity_country', city.country);
      if (city.state != null) await prefs.setString('lastCity_state', city.state!);
      await prefs.setDouble('lastCity_lat', city.lat);
      await prefs.setDouble('lastCity_lng', city.lng);
      await prefs.setString('lastCity_tz', city.timezone);
    }

    if (mounted) context.go(Routes.home);
  }

  Future<void> _handleAppleSignIn() async {
    setState(() { _socialError = null; _completing = true; });
    final ok = await ref.read(authProvider.notifier).signInWithApple();
    if (!mounted) return;
    if (ok) {
      await _complete();
    } else {
      final error = ref.read(authProvider).error;
      setState(() { _completing = false; _socialError = error; });
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() { _socialError = null; _completing = true; });
    final ok = await ref.read(authProvider.notifier).signInWithGoogle();
    if (!mounted) return;
    if (ok) {
      await _complete();
    } else {
      final error = ref.read(authProvider).error;
      setState(() { _completing = false; _socialError = error; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context)!;
    return Scaffold(
      body: SafeArea(
        child: switch (_step) {
          _Step.language => _buildLanguageStep(context, l),
          _Step.info => _buildInfoPages(context, l),
          _Step.signIn => _buildSignInStep(context, l),
        },
      ),
    );
  }

  Widget _buildLanguageStep(BuildContext context, AppLocalizations l) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Column(
      children: [
        const SizedBox(height: 24),

        // Globe icon
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: cs.primary.withAlpha(25),
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.language, size: 40, color: cs.primary),
        ),
        const SizedBox(height: 20),

        Text(
          l.onboardingSelectLanguage,
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),

        // Language list
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            itemCount: _onboardingLocales.length,
            itemBuilder: (_, i) {
              final (label, code) = _onboardingLocales[i];
              final selected = code == _selectedLocale;
              return ListTile(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                selected: selected,
                selectedTileColor: cs.primary.withAlpha(20),
                leading: Icon(
                  selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                  color: selected ? cs.primary : cs.outline,
                  size: 22,
                ),
                title: Text(
                  label,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
                onTap: () => setState(() => _selectedLocale = code),
              );
            },
          ),
        ),

        // Continue button
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
          child: SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _confirmLanguage,
              style: FilledButton.styleFrom(
                backgroundColor: cs.primary,
                foregroundColor: cs.onPrimary,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: Text(
                l.commonNext,
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoPages(BuildContext context, AppLocalizations l) {
    final cs = Theme.of(context).colorScheme;
    final pages = _getPages(l);
    final isLast = _page == _pageCount - 1;

    return Column(
      children: [
        // Skip button
        Align(
          alignment: Alignment.topRight,
          child: TextButton(
            onPressed: _goToSignIn,
            child: Text(l.onboardingSkip),
          ),
        ),

        // Pages
        Expanded(
          child: PageView.builder(
            controller: _controller,
            onPageChanged: (i) => setState(() => _page = i),
            itemCount: pages.length,
            itemBuilder: (_, i) => _OnboardingPage(page: pages[i]),
          ),
        ),

        // Dots + button
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(pages.length, (i) {
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: i == _page ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: i == _page ? PrayCalcColors.mid : cs.outlineVariant,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _next,
                  style: FilledButton.styleFrom(
                    backgroundColor: cs.primary,
                    foregroundColor: cs.onPrimary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: Text(
                    isLast ? l.onboardingGetStarted : l.commonNext,
                    style: const TextStyle(fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSignInStep(BuildContext context, AppLocalizations l) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final isIOS = theme.platform == TargetPlatform.iOS;
    final busy = _completing;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 28),
      child: Column(
        children: [
          const Spacer(flex: 2),

          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              color: PrayCalcColors.dark.withAlpha(80),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.mosque_outlined, size: 48, color: PrayCalcColors.mid),
          ),
          const SizedBox(height: 22),

          Text(
            l.onboardingSignInTitle,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 10),
          Text(
            l.onboardingSignInSubtitle,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: cs.onSurface.withAlpha(155),
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),

          const Spacer(flex: 2),

          if (_socialError != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: cs.errorContainer,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                _socialError!,
                style: TextStyle(color: cs.onErrorContainer, fontSize: 13),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 14),
          ],

          // Apple Sign In (iOS only)
          if (isIOS) ...[
            SizedBox(
              width: double.infinity,
              height: 52,
              child: busy
                  ? _BusyButton(dark: true)
                  : SignInWithAppleButton(
                      onPressed: _handleAppleSignIn,
                      style: SignInWithAppleButtonStyle.black,
                      borderRadius:
                          const BorderRadius.all(Radius.circular(12)),
                    ),
            ),
            const SizedBox(height: 12),
          ],

          // Google Sign In
          SizedBox(
            width: double.infinity,
            height: 52,
            child: busy
                ? _BusyButton(dark: false)
                : OutlinedButton.icon(
                    onPressed: _handleGoogleSignIn,
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      side: BorderSide(color: cs.outline.withAlpha(120)),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                    icon: const _GoogleLogo(),
                    label: Text(
                      l.onboardingContinueGoogle,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
                    ),
                  ),
          ),

          const SizedBox(height: 20),

          TextButton(
            onPressed: busy ? null : _complete,
            child: Text(
              l.onboardingContinueWithoutAccount,
              style: TextStyle(color: cs.onSurface.withAlpha(130), fontSize: 14),
            ),
          ),

          const Spacer(flex: 1),
        ],
      ),
    );
  }
}

// ─── Shared button widgets ────────────────────────────────────────────────────

class _BusyButton extends StatelessWidget {
  const _BusyButton({required this.dark});
  final bool dark;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context)!;
    final bg = dark ? Colors.black : Theme.of(context).colorScheme.surfaceContainerHighest;
    final fg = dark ? Colors.white : Theme.of(context).colorScheme.onSurface;
    return Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2, color: fg.withAlpha(180)),
          ),
          const SizedBox(width: 10),
          Text(l.onboardingSigningIn, style: TextStyle(color: fg, fontSize: 15)),
        ],
      ),
    );
  }
}

class _GoogleLogo extends StatelessWidget {
  const _GoogleLogo();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(25),
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: const Center(
        child: Text(
          'G',
          style: TextStyle(
            color: Color(0xFF4285F4),
            fontSize: 13,
            fontWeight: FontWeight.bold,
            height: 1.1,
          ),
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
            child: Icon(page.icon, size: 56, color: cs.primary),
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
              color: cs.onSurface.withAlpha(180),
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
