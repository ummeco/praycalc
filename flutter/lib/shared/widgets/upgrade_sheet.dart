/// S6-14 — Upgrade/paywall bottom sheet for Ummat+.
///
/// Shown when a non-subscriber taps a premium feature.
/// Dispatches purchase/restore to [SubscriptionNotifier].
///
/// TEST MODE: shows an amber "Test Mode — no real charges" banner
/// when APPLE_IAP_SANDBOX / GOOGLE_IAP_SANDBOX compile flags are active.
library;

import 'dart:io' show Platform;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/subscription_provider.dart';
import '../../core/theme/app_theme.dart';

// ── Sandbox detection ─────────────────────────────────────────────────────────

/// Compile-time flag — true when running in sandbox/test mode.
/// Set via --dart-define=IAP_SANDBOX=true in build scripts.
const bool _kIapSandbox = bool.fromEnvironment(
  'IAP_SANDBOX',
  defaultValue: true, // default true for P3 — no real charges
);

// ── Feature list ──────────────────────────────────────────────────────────────

/// Features unlocked by Ummat+ subscription.
const _kPlusFeatures = [
  (Icons.home_outlined, 'Smart Home', 'Adhan alerts on your smart speakers and displays'),
  (Icons.tv_outlined, 'TV Widgets', 'Prayer time overlays on Apple TV and Android TV'),
  (Icons.explore_outlined, 'Advanced Qibla', 'AR Qibla compass with elevation correction'),
  (Icons.cloud_sync_outlined, 'Cloud Sync', 'Sync settings and prayer logs across all your devices'),
];

// ── Public API ────────────────────────────────────────────────────────────────

/// Show the Ummat+ upgrade bottom sheet.
///
/// Returns true if the user completed a purchase or restored successfully.
Future<bool> showUpgradeSheet(BuildContext context) async {
  final result = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => const _UpgradeSheetContent(),
  );
  return result ?? false;
}

// ── Widget ────────────────────────────────────────────────────────────────────

class _UpgradeSheetContent extends ConsumerStatefulWidget {
  const _UpgradeSheetContent();

  @override
  ConsumerState<_UpgradeSheetContent> createState() =>
      _UpgradeSheetContentState();
}

class _UpgradeSheetContentState extends ConsumerState<_UpgradeSheetContent> {
  bool _purchasing = false;

  @override
  Widget build(BuildContext context) {
    final sub = ref.watch(subscriptionProvider);
    final notifier = ref.read(subscriptionProvider.notifier);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? PrayCalcColors.canvas : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.fromLTRB(
        24,
        8,
        24,
        MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // ── Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withAlpha(50),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // ── Sandbox banner
          if (_kIapSandbox) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.amber.withAlpha(40),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.shade700, width: 1),
              ),
              child: Row(
                children: [
                  Icon(Icons.science_outlined,
                      size: 16, color: Colors.amber.shade800),
                  const SizedBox(width: 8),
                  Text(
                    'Test Mode — no real charges',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: Colors.amber.shade900,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          // ── Icon + Title
          Icon(
            Icons.workspace_premium,
            size: 56,
            color: PrayCalcColors.mid,
          ),
          const SizedBox(height: 8),
          Text(
            'Unlock Ummat+',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '\$9.99 / year — cancel anytime',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 20),

          // ── Feature list
          ..._kPlusFeatures.map(
            (f) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  Icon(f.$1, size: 20, color: PrayCalcColors.mid),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          f.$2,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          f.$3,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // ── Subscribe button
          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: PrayCalcColors.dark,
              ),
              onPressed: (sub.isLoading || _purchasing)
                  ? null
                  : () => _onSubscribeTapped(notifier),
              child: (sub.isLoading || _purchasing)
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      Platform.isIOS
                          ? 'Subscribe with Apple'
                          : 'Subscribe with Google Play',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 8),

          // ── Restore link
          TextButton(
            onPressed: (sub.isLoading || _purchasing)
                ? null
                : () => _onRestoreTapped(notifier),
            child: Text(
              'Restore Purchase',
              style: TextStyle(color: PrayCalcColors.mid),
            ),
          ),

          // ── Error
          if (sub.error != null) ...[
            const SizedBox(height: 8),
            Text(
              sub.error!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.error,
              ),
              textAlign: TextAlign.center,
            ),
          ],

          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Future<void> _onSubscribeTapped(SubscriptionNotifier notifier) async {
    if (_purchasing) return;
    setState(() => _purchasing = true);
    try {
      final success = await notifier.purchase();
      if (mounted && success) {
        Navigator.of(context).pop(true);
      }
    } finally {
      if (mounted) setState(() => _purchasing = false);
    }
  }

  Future<void> _onRestoreTapped(SubscriptionNotifier notifier) async {
    if (_purchasing) return;
    setState(() => _purchasing = true);
    try {
      final success = await notifier.restore();
      if (mounted && success) {
        Navigator.of(context).pop(true);
      }
    } finally {
      if (mounted) setState(() => _purchasing = false);
    }
  }
}
