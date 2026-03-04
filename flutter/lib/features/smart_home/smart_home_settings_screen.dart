import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/providers/subscription_provider.dart';
import '../../core/theme/app_theme.dart';

/// Smart home integration settings screen (PC-F1-9).
///
/// Shows integration cards for Google Home, Alexa, Siri Shortcuts, and
/// Home Assistant. Each card displays connection status and an action button.
/// Requires Ummat+ subscription. Shows an upgrade prompt if on the free plan.
class SmartHomeSettingsScreen extends ConsumerWidget {
  const SmartHomeSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sub = ref.watch(subscriptionProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Smart Home')),
      body: sub.isPlus
          ? _IntegrationsList(theme: theme)
          : _UpgradePrompt(theme: theme),
    );
  }
}

// ─── Upgrade prompt (shown when user is on free plan) ───────────────────────

class _UpgradePrompt extends StatelessWidget {
  const _UpgradePrompt({required this.theme});
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.lock_outline,
              size: 64,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text(
              'Smart Home requires Ummat+',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Control your prayer time announcements through Google Home, '
              'Alexa, Siri, and Home Assistant.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () => context.push('/subscription'),
              icon: const Icon(Icons.workspace_premium),
              label: const Text('Upgrade to Ummat+'),
              style: FilledButton.styleFrom(
                backgroundColor: PrayCalcColors.dark,
                foregroundColor: Colors.white,
                minimumSize: const Size(200, 48),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Integrations list (shown when user has Ummat+) ─────────────────────────

class _IntegrationsList extends StatelessWidget {
  const _IntegrationsList({required this.theme});
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Connect PrayCalc to your smart home devices to receive prayer '
          'time announcements and automate routines.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 24),
        _IntegrationCard(
          icon: Icons.home,
          iconColor: const Color(0xFF4285F4),
          name: 'Google Home',
          description:
              'Broadcast adhan times on Google Nest speakers and displays.',
          status: _IntegrationStatus.notLinked,
          actionLabel: 'Link account',
          onAction: () => _launchOAuth(
            context,
            'https://api.praycalc.com/integrations/google-home/auth',
          ),
        ),
        const SizedBox(height: 12),
        _IntegrationCard(
          icon: Icons.speaker,
          iconColor: const Color(0xFF00CAFF),
          name: 'Amazon Alexa',
          description:
              'Enable the PrayCalc skill on Alexa for prayer reminders.',
          status: _IntegrationStatus.notLinked,
          actionLabel: 'Link account',
          onAction: () => _launchOAuth(
            context,
            'https://api.praycalc.com/integrations/alexa/auth',
          ),
        ),
        const SizedBox(height: 12),
        _IntegrationCard(
          icon: Icons.phone_iphone,
          iconColor: const Color(0xFF007AFF),
          name: 'Siri Shortcuts',
          description:
              'Ask Siri for the next prayer time or add prayer automations.',
          status: _IntegrationStatus.notLinked,
          actionLabel: 'Setup guide',
          onAction: () => _showSiriInstructions(context),
        ),
        const SizedBox(height: 12),
        _IntegrationCard(
          icon: Icons.developer_board,
          iconColor: const Color(0xFF41BDF5),
          name: 'Home Assistant',
          description:
              'Add PrayCalc as a custom integration via HACS for full automation.',
          status: _IntegrationStatus.notLinked,
          actionLabel: 'Setup guide',
          onAction: () => _showHomeAssistantInstructions(context),
        ),
      ],
    );
  }

  Future<void> _launchOAuth(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
    } else if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open the link.')),
      );
    }
  }

  void _showSiriInstructions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        maxChildSize: 0.85,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.all(24),
          children: [
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
            Text(
              'Siri Shortcuts Setup',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            _instructionStep(
              '1',
              'Open the Shortcuts app on your iPhone or iPad.',
            ),
            _instructionStep(
              '2',
              'Tap the "+" button to create a new shortcut.',
            ),
            _instructionStep(
              '3',
              'Search for "PrayCalc" in the actions list.',
            ),
            _instructionStep(
              '4',
              'Add the "Next Prayer Time" or "Prayer Times Today" action.',
            ),
            _instructionStep(
              '5',
              'Optionally add it to an automation (e.g., daily at Fajr time).',
            ),
            _instructionStep(
              '6',
              'Say "Hey Siri, next prayer time" to test.',
            ),
            const SizedBox(height: 16),
            Text(
              'Siri Shortcuts require iOS 16 or later.',
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showHomeAssistantInstructions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.65,
        maxChildSize: 0.85,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.all(24),
          children: [
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
            Text(
              'Home Assistant Setup',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            _instructionStep(
              '1',
              'Install HACS (Home Assistant Community Store) if you '
                  'haven\'t already.',
            ),
            _instructionStep(
              '2',
              'In HACS, search for "PrayCalc" and install the integration.',
            ),
            _instructionStep(
              '3',
              'Go to Settings > Devices & Services > Add Integration.',
            ),
            _instructionStep(
              '4',
              'Search for "PrayCalc" and select it.',
            ),
            _instructionStep(
              '5',
              'Enter your PrayCalc API key (copy from below).',
            ),
            _instructionStep(
              '6',
              'Configure your location and calculation method.',
            ),
            const SizedBox(height: 20),
            Text(
              'API Key',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            FilledButton.tonal(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'API key generation will be available once the '
                      'PrayCalc smart service is deployed.',
                    ),
                  ),
                );
              },
              child: const Text('Generate API Key'),
            ),
            const SizedBox(height: 8),
            Text(
              'You will need an API key to connect Home Assistant '
              'to your PrayCalc account.',
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Requires Home Assistant 2024.1 or later with HACS installed.',
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _instructionStep(String number, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: PrayCalcColors.dark,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              number,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(text, style: const TextStyle(fontSize: 15)),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Integration card ───────────────────────────────────────────────────────

enum _IntegrationStatus { linked, notLinked }

class _IntegrationCard extends StatelessWidget {
  const _IntegrationCard({
    required this.icon,
    required this.iconColor,
    required this.name,
    required this.description,
    required this.status,
    required this.actionLabel,
    required this.onAction,
  });

  final IconData icon;
  final Color iconColor;
  final String name;
  final String description;
  final _IntegrationStatus status;
  final String actionLabel;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLinked = status == _IntegrationStatus.linked;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: iconColor.withAlpha(30),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: iconColor, size: 28),
            ),
            const SizedBox(width: 16),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        name,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: isLinked
                              ? PrayCalcColors.mid.withAlpha(40)
                              : theme.colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          isLinked ? 'Linked' : 'Not linked',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: isLinked
                                ? PrayCalcColors.mid
                                : theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 36,
                    child: isLinked
                        ? OutlinedButton(
                            onPressed: onAction,
                            child: const Text('Unlink'),
                          )
                        : FilledButton.tonal(
                            onPressed: onAction,
                            child: Text(actionLabel),
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
