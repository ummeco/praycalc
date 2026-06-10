// P-13: Ramadan primary display
//
// A banner shown during Ramadan that replaces the standard countdown with
// Suhoor/Iftar context. Shows:
//   - "Ramadan Day N" header with crescent moon icon
//   - Suhoor ends (Fajr) + Iftar begins (Maghrib) times
//   - Live countdown to whichever is next (Suhoor or Iftar)
//   - Last 10 nights indicator + Laylatul Qadr candidate badge

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../../core/providers/ramadan_provider.dart';
import 'tv_countdown_flip.dart';

// ─── Widget ──────────────────────────────────────────────────────────────────

/// Ramadan-specific display banner.
///
/// [ramadan]        — current Ramadan state (day, last-10, Qadr candidate).
/// [suhoorTime]     — formatted Fajr time string (Suhoor ends at Fajr).
/// [iftarTime]      — formatted Maghrib time string.
/// [countdown]      — live HH:MM:SS countdown to whichever event is next.
/// [countdownLabel] — "Until Suhoor ends" or "Until Iftar".
class TvRamadanDisplay extends StatelessWidget {
  const TvRamadanDisplay({
    super.key,
    required this.ramadan,
    required this.suhoorTime,
    required this.iftarTime,
    required this.countdown,
    required this.countdownLabel,
  });

  final RamadanState ramadan;
  final String suhoorTime;
  final String iftarTime;
  final String countdown;
  final String countdownLabel;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            PrayCalcColors.deep.withValues(alpha: 0.85),
            Colors.black.withValues(alpha: 0.70),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: ramadan.isLaylatulQadr
              ? const Color(0xFFE8D5A3).withValues(alpha: 0.6)
              : PrayCalcColors.mid.withValues(alpha: 0.4),
          width: ramadan.isLaylatulQadr ? 2 : 1,
        ),
        boxShadow: ramadan.isLastTenNights
            ? [
                BoxShadow(
                  color: PrayCalcColors.light.withValues(alpha: 0.12),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ]
            : const [],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header row: day number + badges
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.nightlight_round,
                  size: 20, color: Color(0xFFE8D5A3)),
              const SizedBox(width: 8),
              Text(
                'Ramadan — Day ${ramadan.hDay}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
              if (ramadan.isLaylatulQadr) ...[
                const SizedBox(width: 10),
                _Badge(label: 'Laylatul Qadr', color: const Color(0xFFE8D5A3)),
              ] else if (ramadan.isLastTenNights) ...[
                const SizedBox(width: 10),
                _Badge(label: 'Last 10 Nights', color: PrayCalcColors.light),
              ],
            ],
          ),
          const SizedBox(height: 14),

          // Suhoor / Iftar time row
          Row(
            children: [
              Expanded(
                child: _TimeCell(
                  label: 'Suhoor ends',
                  arabicLabel: 'السحور',
                  time: suhoorTime,
                  icon: Icons.brightness_3,
                  color: const Color(0xFF8BA7D4),
                ),
              ),
              Container(
                  width: 1, height: 60, color: Colors.white12),
              Expanded(
                child: _TimeCell(
                  label: 'Iftar',
                  arabicLabel: 'الإفطار',
                  time: iftarTime,
                  icon: Icons.wb_twilight,
                  color: const Color(0xFFE8A050),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Countdown
          Text(
            countdownLabel,
            style: TextStyle(
              fontSize: 13,
              color: Colors.white.withValues(alpha: 0.55),
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 6),
          TvCountdownFlip(time: countdown, digitFontSize: 34),
        ],
      ),
    );
  }
}

// ─── Sub-widgets ─────────────────────────────────────────────────────────────

class _TimeCell extends StatelessWidget {
  const _TimeCell({
    required this.label,
    required this.arabicLabel,
    required this.time,
    required this.icon,
    required this.color,
  });

  final String label;
  final String arabicLabel;
  final String time;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 18, color: color),
        const SizedBox(height: 4),
        Text(
          arabicLabel,
          style: TextStyle(
            fontFamily: 'Amiri',
            fontSize: 16,
            color: color,
            fontWeight: FontWeight.w700,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Colors.white.withValues(alpha: 0.5),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          time,
          style: TextStyle(
            fontSize: 24,
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontFeatures: const [FontFeature.tabularFigures()],
          ),
        ),
      ],
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
