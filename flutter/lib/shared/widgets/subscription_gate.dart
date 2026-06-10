/// S6-15 — SubscriptionGate widget.
///
/// Wraps any widget that requires an active Ummat+ subscription.
/// When the user taps while not subscribed, shows [UpgradeSheet].
/// Does NOT remove the underlying feature — only gates entry.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/subscription_provider.dart';
import 'upgrade_sheet.dart';

/// Gate widget that blocks access to a premium feature for non-subscribers.
///
/// Usage:
/// ```dart
/// SubscriptionGate(
///   child: SmartHomeSettingsTile(...),
/// )
/// ```
///
/// If the user is already an Ummat+ subscriber, renders [child] as-is.
/// If not, wraps [child] in a GestureDetector that intercepts taps and
/// shows the [UpgradeSheet] bottom sheet instead.
class SubscriptionGate extends ConsumerWidget {
  const SubscriptionGate({
    super.key,
    required this.child,
    this.featureName,
  });

  /// The premium feature widget to gate.
  final Widget child;

  /// Optional feature name shown in logs/analytics.
  final String? featureName;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isPlus = ref.watch(subscriptionProvider.select((s) => s.isPlus));

    if (isPlus) return child;

    // Overlay a Premium badge and intercept taps.
    return Stack(
      children: [
        // Slightly dimmed underlying widget (still visible, not removed).
        Opacity(
          opacity: 0.55,
          child: IgnorePointer(child: child),
        ),

        // Full-area tap interceptor.
        Positioned.fill(
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(8),
              onTap: () => _showUpgrade(context),
              child: Align(
                alignment: Alignment.topRight,
                child: _PremiumBadge(),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _showUpgrade(BuildContext context) async {
    await showUpgradeSheet(context);
  }
}

/// Small "Ummat+" badge overlaid on gated features.
class _PremiumBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(6),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFF1E5E2F),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.workspace_premium, size: 12, color: Color(0xFFC9F27A)),
          SizedBox(width: 3),
          Text(
            'Ummat+',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Color(0xFFC9F27A),
            ),
          ),
        ],
      ),
    );
  }
}
