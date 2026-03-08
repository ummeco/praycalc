import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_theme.dart';
import '../../shared/models/tv_settings_model.dart';

// ---------------------------------------------------------------------------
// TvAdhanBubble — corner pill widget (TV2-8.1)
// ---------------------------------------------------------------------------

/// A small pill shown in a screen corner during/after adhan.
///
/// Slides in from the nearest edge. Shows prayer emoji, prayer name, and a
/// status line ("Adhan Now" or "Iqamah in MM:SS"). Pressing OK/Enter on the
/// remote expands to the full overlay; Back/Escape dismisses it.
class TvAdhanBubble extends StatefulWidget {
  const TvAdhanBubble({
    super.key,
    required this.prayerName,
    required this.position,
    this.iqamahCountdown,
    this.onDismiss,
    this.onExpand,
  });

  /// Display name of the prayer (e.g. "Fajr").
  final String prayerName;

  /// Screen corner where the pill appears.
  final TvBubblePosition position;

  /// Seconds remaining until iqamah. Null means adhan is playing now.
  final int? iqamahCountdown;

  /// Called when the user dismisses the bubble without expanding.
  final VoidCallback? onDismiss;

  /// Called when the user presses OK/Select to expand to the full overlay.
  final VoidCallback? onExpand;

  @override
  State<TvAdhanBubble> createState() => _TvAdhanBubbleState();
}

class _TvAdhanBubbleState extends State<TvAdhanBubble>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _slideAnimation = Tween<Offset>(
      begin: _slideBegin,
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  /// Slide-in direction: pills enter from the closest screen edge.
  Offset get _slideBegin {
    switch (widget.position) {
      case TvBubblePosition.topLeft:
        return const Offset(-1, 0);
      case TvBubblePosition.topRight:
        return const Offset(1, 0);
      case TvBubblePosition.bottomLeft:
        return const Offset(-1, 0);
      case TvBubblePosition.bottomRight:
        return const Offset(1, 0);
    }
  }

  String get _prayerEmoji {
    switch (widget.prayerName.toLowerCase()) {
      case 'fajr':
        return '\u{1F305}'; // 🌅
      case 'dhuhr':
        return '\u{2600}\uFE0F'; // ☀️
      case 'asr':
        return '\u{1F324}\uFE0F'; // 🌤️
      case 'maghrib':
        return '\u{1F307}'; // 🌇
      case 'isha':
        return '\u{1F319}'; // 🌙
      case 'jumuah':
        return '\u{1F54C}'; // 🕌
      default:
        return '\u{1F54C}'; // 🕌
    }
  }

  String get _statusText {
    if (widget.iqamahCountdown == null) return 'Adhan Now';
    final m = widget.iqamahCountdown! ~/ 60;
    final s = widget.iqamahCountdown! % 60;
    return 'Iqamah in ${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: _slideAnimation,
      child: Focus(
        onKeyEvent: (node, event) {
          if (event is KeyDownEvent) {
            if (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter) {
              widget.onExpand?.call();
              return KeyEventResult.handled;
            }
            if (event.logicalKey == LogicalKeyboardKey.escape ||
                event.logicalKey == LogicalKeyboardKey.goBack) {
              widget.onDismiss?.call();
              return KeyEventResult.handled;
            }
          }
          return KeyEventResult.ignored;
        },
        child: Builder(
          builder: (ctx) {
            final focused = Focus.of(ctx).hasFocus;
            return GestureDetector(
              onTap: widget.onExpand,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: PrayCalcColors.deep.withAlpha(230),
                  borderRadius: BorderRadius.circular(40),
                  border: Border.all(
                    color: focused
                        ? PrayCalcColors.light
                        : PrayCalcColors.mid,
                    width: focused ? 2 : 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(100),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _prayerEmoji,
                      style: const TextStyle(fontSize: 22),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.prayerName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          _statusText,
                          style: TextStyle(
                            color: PrayCalcColors.light,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 10),
                    const Icon(
                      Icons.chevron_right,
                      color: Colors.white54,
                      size: 20,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// TvAdhanBubbleOverlay — wraps a screen with an optional corner bubble
// ---------------------------------------------------------------------------

/// Wraps any TV screen with an adhan bubble overlay.
///
/// When [prayerName] is null the child is returned unchanged. Otherwise a
/// [TvAdhanBubble] is positioned in the requested corner using a [Stack].
class TvAdhanBubbleOverlay extends StatelessWidget {
  const TvAdhanBubbleOverlay({
    super.key,
    required this.child,
    this.prayerName,
    this.position = TvBubblePosition.topRight,
    this.iqamahCountdown,
    this.onDismiss,
    this.onExpand,
  });

  final Widget child;

  /// Prayer name to display. When null, no bubble is shown.
  final String? prayerName;

  /// Corner for the bubble.
  final TvBubblePosition position;

  /// Seconds until iqamah. Null = adhan is live now.
  final int? iqamahCountdown;

  final VoidCallback? onDismiss;
  final VoidCallback? onExpand;

  @override
  Widget build(BuildContext context) {
    if (prayerName == null) return child;

    final EdgeInsets insets = switch (position) {
      TvBubblePosition.topLeft =>
        const EdgeInsets.only(top: 24, left: 24),
      TvBubblePosition.topRight =>
        const EdgeInsets.only(top: 24, right: 24),
      TvBubblePosition.bottomLeft =>
        const EdgeInsets.only(bottom: 24, left: 24),
      TvBubblePosition.bottomRight =>
        const EdgeInsets.only(bottom: 24, right: 24),
    };

    final AlignmentGeometry alignment = switch (position) {
      TvBubblePosition.topLeft => Alignment.topLeft,
      TvBubblePosition.topRight => Alignment.topRight,
      TvBubblePosition.bottomLeft => Alignment.bottomLeft,
      TvBubblePosition.bottomRight => Alignment.bottomRight,
    };

    return Stack(
      children: [
        child,
        Positioned.fill(
          child: Align(
            alignment: alignment,
            child: Padding(
              padding: insets,
              child: TvAdhanBubble(
                prayerName: prayerName!,
                position: position,
                iqamahCountdown: iqamahCountdown,
                onDismiss: onDismiss,
                onExpand: onExpand,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
