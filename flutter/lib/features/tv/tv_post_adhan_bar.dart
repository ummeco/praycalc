import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// TvPostAdhanBar — thin bottom bar shown after adhan (TV2-8.8 + TV2-8.9)
// ---------------------------------------------------------------------------

/// A slim 48-px bar pinned to the bottom of the screen.
///
/// Shown for up to 10 minutes after the adhan overlay dismisses, giving the
/// viewer a persistent iqamah countdown without blocking content. The bar
/// fades out automatically when [iqamahCountdownSeconds] reaches zero or when
/// the caller removes it from the widget tree.
///
/// Usage — wrap your TV screen body with a [Column]:
/// ```dart
/// Column(
///   children: [
///     Expanded(child: myTvContent),
///     if (showBar)
///       TvPostAdhanBar(
///         prayerName: 'Fajr',
///         iqamahCountdownSeconds: seconds,
///       ),
///   ],
/// )
/// ```
class TvPostAdhanBar extends StatelessWidget {
  const TvPostAdhanBar({
    super.key,
    required this.prayerName,
    required this.iqamahCountdownSeconds,
  });

  /// Display name of the prayer whose iqamah is approaching.
  final String prayerName;

  /// Seconds remaining until iqamah. Must be >= 0.
  final int iqamahCountdownSeconds;

  String get _countdown {
    final m = iqamahCountdownSeconds ~/ 60;
    final s = iqamahCountdownSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      color: PrayCalcColors.dark.withAlpha(230),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.mosque, color: Colors.white54, size: 18),
          const SizedBox(width: 8),
          Text(
            '$prayerName  \u2022  Iqamah in $_countdown',
            style: const TextStyle(color: Colors.white70, fontSize: 18),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// TvSnoozeBar — snooze action bar for the adhan overlay (TV2-8.9)
// ---------------------------------------------------------------------------

/// A focusable action row shown inside the full adhan overlay allowing the
/// viewer to snooze the alert for a fixed number of minutes.
///
/// Presents three snooze options (5 min, 10 min, 15 min) as remote-navigable
/// buttons. Triggers [onSnooze] with the chosen duration; triggers [onDismiss]
/// when the user picks "Dismiss".
class TvSnoozeBar extends StatelessWidget {
  const TvSnoozeBar({
    super.key,
    required this.onSnooze,
    required this.onDismiss,
  });

  /// Called with the chosen snooze duration in minutes (5, 10, or 15).
  final void Function(int minutes) onSnooze;

  /// Called when the user taps "Dismiss" without snoozing.
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _SnoozeButton(label: 'Snooze 5 min', onTap: () => onSnooze(5)),
        const SizedBox(width: 16),
        _SnoozeButton(label: 'Snooze 10 min', onTap: () => onSnooze(10)),
        const SizedBox(width: 16),
        _SnoozeButton(label: 'Snooze 15 min', onTap: () => onSnooze(15)),
        const SizedBox(width: 32),
        _SnoozeButton(
          label: 'Dismiss',
          onTap: onDismiss,
          isDismiss: true,
        ),
      ],
    );
  }
}

class _SnoozeButton extends StatefulWidget {
  const _SnoozeButton({
    required this.label,
    required this.onTap,
    this.isDismiss = false,
  });

  final String label;
  final VoidCallback onTap;
  final bool isDismiss;

  @override
  State<_SnoozeButton> createState() => _SnoozeButtonState();
}

class _SnoozeButtonState extends State<_SnoozeButton> {
  bool _focused = false;

  @override
  Widget build(BuildContext context) {
    return Focus(
      onFocusChange: (v) => setState(() => _focused = v),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding:
              const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          decoration: BoxDecoration(
            color: _focused
                ? (widget.isDismiss
                    ? Colors.white.withAlpha(30)
                    : PrayCalcColors.dark)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: _focused
                  ? (widget.isDismiss
                      ? Colors.white54
                      : PrayCalcColors.light)
                  : Colors.white24,
              width: _focused ? 2 : 1,
            ),
          ),
          child: Text(
            widget.label,
            style: TextStyle(
              color: _focused ? Colors.white : Colors.white60,
              fontSize: 18,
              fontWeight:
                  _focused ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }
}
