import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';

/// Preference key tracking whether the onboarding has been dismissed.
const _kOnboardingSeen = 'smart_home_onboarding_seen';

/// Returns `true` if the smart home onboarding has already been shown.
Future<bool> isSmartHomeOnboardingSeen() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool(_kOnboardingSeen) ?? false;
}

/// Marks the smart home onboarding as seen so it is not shown again.
Future<void> markSmartHomeOnboardingSeen() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool(_kOnboardingSeen, true);
}

/// Shows the smart home onboarding bottom sheet if the user has not
/// dismissed it before.
///
/// Call this from [SmartHomeSettingsScreen.build] on first visit:
/// ```dart
/// WidgetsBinding.instance.addPostFrameCallback((_) async {
///   await maybeShowSmartHomeOnboarding(context);
/// });
/// ```
Future<void> maybeShowSmartHomeOnboarding(BuildContext context) async {
  if (await isSmartHomeOnboardingSeen()) return;
  if (!context.mounted) return;

  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (_) => const SmartHomeOnboardingSheet(),
  );

  await markSmartHomeOnboardingSeen();
}

/// Data class for each onboarding step.
class _Step {
  final IconData icon;
  final String title;
  final String description;
  const _Step(this.icon, this.title, this.description);
}

const _steps = [
  _Step(
    Icons.record_voice_over,
    'Voice Control',
    'Ask Google or Alexa for prayer times and get adhan announcements.',
  ),
  _Step(
    Icons.developer_board,
    'Home Automation',
    'Trigger lights, scenes, and routines at every prayer with Home Assistant.',
  ),
  _Step(
    Icons.tv,
    'TV Display',
    'Pair your TV to show a full-screen prayer clock and ambient photos.',
  ),
];

/// A 3-step carousel shown as a bottom sheet the first time a user
/// visits the smart home settings.
class SmartHomeOnboardingSheet extends StatefulWidget {
  const SmartHomeOnboardingSheet({super.key});

  @override
  State<SmartHomeOnboardingSheet> createState() =>
      _SmartHomeOnboardingSheetState();
}

class _SmartHomeOnboardingSheetState extends State<SmartHomeOnboardingSheet> {
  final _controller = PageController();
  int _page = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _next() {
    if (_page < _steps.length - 1) {
      _controller.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLast = _page == _steps.length - 1;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[400],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Carousel
            SizedBox(
              height: 240,
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (i) => setState(() => _page = i),
                itemCount: _steps.length,
                itemBuilder: (_, i) => _OnboardingStepView(step: _steps[i]),
              ),
            ),
            const SizedBox(height: 16),

            // Page dots
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_steps.length, (i) {
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: i == _page ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: i == _page
                        ? PrayCalcColors.mid
                        : theme.colorScheme.outlineVariant,
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
            const SizedBox(height: 24),

            // Action button
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _next,
                style: FilledButton.styleFrom(
                  backgroundColor: PrayCalcColors.dark,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: Text(
                  isLast ? 'Get Started' : 'Next',
                  style: const TextStyle(fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingStepView extends StatelessWidget {
  const _OnboardingStepView({required this.step});
  final _Step step;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              color: PrayCalcColors.dark.withAlpha(15),
              shape: BoxShape.circle,
            ),
            child: Icon(
              step.icon,
              size: 40,
              color: PrayCalcColors.dark,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            step.title,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            step.description,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
