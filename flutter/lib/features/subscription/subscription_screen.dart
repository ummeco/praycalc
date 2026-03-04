import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/providers/subscription_provider.dart';
import '../../core/theme/app_theme.dart';

/// Subscription / upgrade screen.
///
/// Shows a feature comparison between Free and Ummat+ tiers.
/// If the user is already subscribed, shows subscription status and
/// a manage button instead of the purchase CTA.
class SubscriptionScreen extends ConsumerWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sub = ref.watch(subscriptionProvider);
    final notifier = ref.read(subscriptionProvider.notifier);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ummat+'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        children: [
          // ── Header ──
          Icon(
            Icons.workspace_premium,
            size: 64,
            color: PrayCalcColors.mid,
          ),
          const SizedBox(height: 12),
          Text(
            sub.isPlus ? 'You have Ummat+' : 'Upgrade to Ummat+',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            sub.isPlus
                ? 'Thank you for supporting PrayCalc.'
                : 'Unlock premium features across all your devices.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

          // ── Feature comparison table ──
          _FeatureComparisonCard(isDark: isDark),
          const SizedBox(height: 24),

          // ── Subscription status or purchase CTA ──
          if (sub.isPlus) ...[
            _SubscriptionStatusCard(sub: sub, isDark: isDark),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: () => _openSubscriptionManagement(context),
              icon: const Icon(Icons.settings_outlined),
              label: const Text('Manage subscription'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
              ),
            ),
          ] else ...[
            _PriceCard(isDark: isDark),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: sub.isLoading
                  ? null
                  : () async {
                      final success = await notifier.purchase();
                      if (success && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Welcome to Ummat+!'),
                          ),
                        );
                      }
                    },
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(52),
                backgroundColor: PrayCalcColors.dark,
                foregroundColor: Colors.white,
                textStyle: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              child: sub.isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Subscribe — \$9.99/year'),
            ),
            const SizedBox(height: 12),
            Center(
              child: TextButton(
                onPressed: sub.isLoading
                    ? null
                    : () async {
                        final restored = await notifier.restore();
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                restored
                                    ? 'Subscription restored.'
                                    : 'No previous subscription found.',
                              ),
                            ),
                          );
                        }
                      },
                child: const Text('Restore purchase'),
              ),
            ),
          ],

          // ── Error display ──
          if (sub.error != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.errorContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.error_outline,
                    color: theme.colorScheme.error,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      sub.error!,
                      style: TextStyle(color: theme.colorScheme.error),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 18),
                    onPressed: notifier.clearError,
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

// ─── Manage subscription helper ─────────────────────────────────────────────

Future<void> _openSubscriptionManagement(BuildContext context) async {
  final platform = Theme.of(context).platform;
  final Uri uri;

  if (platform == TargetPlatform.iOS || platform == TargetPlatform.macOS) {
    uri = Uri.parse('https://apps.apple.com/account/subscriptions');
  } else {
    uri = Uri.parse('https://play.google.com/store/account/subscriptions');
  }

  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  } else if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Open your device settings to manage your subscription.'),
      ),
    );
  }
}

// ─── Feature comparison card ────────────────────────────────────────────────

class _FeatureComparisonCard extends StatelessWidget {
  const _FeatureComparisonCard({required this.isDark});
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Header row
            Row(
              children: [
                const Expanded(
                  flex: 3,
                  child: Text(
                    'Feature',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                Expanded(
                  child: Text(
                    'Free',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                Expanded(
                  child: Text(
                    'Plus',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: PrayCalcColors.mid,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            // Free features
            _featureRow('Prayer times', true, true),
            _featureRow('Qibla compass', true, true),
            _featureRow('Hijri calendar', true, true),
            _featureRow('Notifications', true, true),
            _featureRow('Home screen widgets', true, true),
            const Divider(height: 24),
            // Plus-only features
            _featureRow('Smart home integrations', false, true),
            _featureRow('TV app', false, true),
            _featureRow('Apple Watch', false, true),
            _featureRow('Desktop app', false, true),
            _featureRow('Cross-device sync', false, true),
          ],
        ),
      ),
    );
  }

  Widget _featureRow(String name, bool free, bool plus) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(flex: 3, child: Text(name)),
          Expanded(
            child: Icon(
              free ? Icons.check_circle : Icons.remove_circle_outline,
              color: free ? PrayCalcColors.mid : Colors.grey,
              size: 20,
            ),
          ),
          Expanded(
            child: Icon(
              plus ? Icons.check_circle : Icons.remove_circle_outline,
              color: plus ? PrayCalcColors.mid : Colors.grey,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Price card ─────────────────────────────────────────────────────────────

class _PriceCard extends StatelessWidget {
  const _PriceCard({required this.isDark});
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: PrayCalcColors.dark.withAlpha(isDark ? 80 : 30),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              '\$9.99',
              style: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                color: isDark ? PrayCalcColors.light : PrayCalcColors.dark,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'per year',
              style: TextStyle(
                fontSize: 16,
                color: isDark ? Colors.white70 : Colors.black54,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Less than \$1/month. Cancel anytime.',
              style: TextStyle(
                fontSize: 13,
                color: isDark ? Colors.white54 : Colors.black45,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Subscription status card ───────────────────────────────────────────────

class _SubscriptionStatusCard extends StatelessWidget {
  const _SubscriptionStatusCard({
    required this.sub,
    required this.isDark,
  });
  final SubscriptionState sub;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final expiresLabel = sub.expiresAt != null
        ? '${sub.expiresAt!.year}-'
            '${sub.expiresAt!.month.toString().padLeft(2, '0')}-'
            '${sub.expiresAt!.day.toString().padLeft(2, '0')}'
        : 'N/A';

    return Card(
      color: PrayCalcColors.dark.withAlpha(isDark ? 80 : 30),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.verified, color: PrayCalcColors.mid, size: 24),
                const SizedBox(width: 8),
                Text(
                  'Active',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: PrayCalcColors.mid,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'Renews $expiresLabel',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.white54 : Colors.black45,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
