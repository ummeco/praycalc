import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/settings_provider.dart';
import '../../core/providers/travel_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';

/// Card-style travel alert shown in the home page list view when the user
/// is > 77 km from home. Placed below the action tiles for more space.
///
/// Shows exact distance, Qasr toggle, Change Home, and Info buttons.
/// Dismissible for the current session.
class TravelBanner extends ConsumerStatefulWidget {
  const TravelBanner({super.key});

  @override
  ConsumerState<TravelBanner> createState() => _TravelBannerState();
}

class _TravelBannerState extends ConsumerState<TravelBanner> {
  bool _dismissed = false;

  String _formatDist(double km, bool imperial) {
    final value = imperial ? km * 0.621371 : km;
    final unit = imperial ? 'mi' : 'km';
    final rounded = value.round();
    final s = rounded.toString();
    final buf = StringBuffer();
    for (int i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
      buf.write(s[i]);
    }
    return '${buf.toString()} $unit';
  }

  @override
  Widget build(BuildContext context) {
    final travel = ref.watch(travelProvider);
    final settings = ref.watch(settingsProvider);
    if (!travel.isTraveling || _dismissed) return const SizedBox.shrink();

    final distLabel = _formatDist(travel.distanceKm, settings.useImperial);

    return Container(
      margin: EdgeInsets.zero,
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      decoration: BoxDecoration(
        color: const Color(0xFF062030).withAlpha(220),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF2196F3).withAlpha(60), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Title row ──────────────────────────────────────────────────
          Row(
            children: [
              const Icon(Icons.flight_takeoff, color: Color(0xFF64B5F6), size: 16),
              const SizedBox(width: 8),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: const TextStyle(fontSize: 14),
                    children: [
                      const TextSpan(
                        text: 'Traveling',
                        style: TextStyle(
                          color: Color(0xFF64B5F6),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      TextSpan(
                        text: '  $distLabel from home',
                        style: TextStyle(
                          color: Colors.white.withAlpha(180),
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              GestureDetector(
                onTap: () => setState(() => _dismissed = true),
                behavior: HitTestBehavior.opaque,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 4, 8),
                  child: Icon(Icons.close, size: 16, color: Colors.white.withAlpha(100)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // ── Action buttons ─────────────────────────────────────────────
          Row(
            children: [
              _TravelActionChip(
                label: 'Qasr Info',
                active: false,
                icon: Icons.info_outline,
                onTap: () => context.push(Routes.travelRulings),
              ),
              const SizedBox(width: 8),
              _TravelActionChip(
                label: 'Change Home',
                active: false,
                icon: Icons.home_outlined,
                onTap: () => context.push(Routes.setHome),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TravelActionChip extends StatelessWidget {
  const _TravelActionChip({
    required this.label,
    required this.active,
    required this.icon,
    required this.onTap,
  });
  final String label;
  final bool active;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: active
              ? PrayCalcColors.dark.withAlpha(220)
              : Colors.white.withAlpha(18),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: active
                ? PrayCalcColors.mid.withAlpha(160)
                : Colors.white.withAlpha(40),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 12,
              color: active ? PrayCalcColors.light : Colors.white.withAlpha(170),
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: active ? PrayCalcColors.light : Colors.white.withAlpha(170),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

