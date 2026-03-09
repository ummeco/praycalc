import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/tv_provider.dart';
import '../../core/services/tv_audio_router.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/tv_settings_model.dart';

// ---------------------------------------------------------------------------
// TvAdhanBubble — corner pill widget (TV2-8.1, TV2-8.4, TV2-8.5, TV2-8.7)
// ---------------------------------------------------------------------------

/// A small pill shown in a screen corner during/after adhan.
///
/// Slides in from the nearest edge. Shows prayer emoji, prayer name, and a
/// status line that cycles through three phases:
///
/// 1. **Adhan phase** — "Adhan Now" (iqamahCountdown == null)
/// 2. **Iqamah wait** — "Iqamah in MM:SS" (iqamahCountdown > 0)
/// 3. **Iqamah time** — "Time to stand" for 30 s, then auto-dismisses
///
/// Pressing OK/Enter on the remote expands to the full overlay; Back/Escape
/// dismisses the bubble.
///
/// Audio focus is requested on init based on the prayer's [TvMediaAction]
/// config (TV2-8.4/8.5) and released when the bubble dismisses (TV2-8.4).
///
/// When [snoozed] is true the status line shows "Snoozed" to indicate the
/// alert was re-shown after a snooze.
class TvAdhanBubble extends ConsumerStatefulWidget {
  const TvAdhanBubble({
    super.key,
    required this.prayerName,
    required this.position,
    this.iqamahMinutes = 15,
    this.iqamahCountdown,
    this.snoozed = false,
    this.onDismiss,
    this.onExpand,
  });

  /// Display name of the prayer (e.g. "Fajr").
  final String prayerName;

  /// Screen corner where the pill appears.
  final TvBubblePosition position;

  /// Iqamah wait time in minutes (default 15). Used to drive the internal
  /// countdown when the parent does not supply [iqamahCountdown].
  final int iqamahMinutes;

  /// Seconds remaining until iqamah supplied by the parent. When null the
  /// bubble is in adhan phase. When the parent drives this, the internal
  /// countdown is not started.
  final int? iqamahCountdown;

  /// When true the status line shows "Snoozed" instead of the normal text.
  final bool snoozed;

  /// Called when the user dismisses the bubble without expanding.
  final VoidCallback? onDismiss;

  /// Called when the user presses OK/Select to expand to the full overlay.
  final VoidCallback? onExpand;

  @override
  ConsumerState<TvAdhanBubble> createState() => _TvAdhanBubbleState();
}

/// Iqamah display phase.
enum _IqamahPhase { adhan, countdown, stand }

class _TvAdhanBubbleState extends ConsumerState<TvAdhanBubble>
    with SingleTickerProviderStateMixin {
  late final AnimationController _slideController;
  late final Animation<Offset> _slideAnimation;

  _IqamahPhase _phase = _IqamahPhase.adhan;

  Timer? _countdownTicker;
  Timer? _standDismissTimer;

  @override
  void initState() {
    super.initState();

    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _slideAnimation = Tween<Offset>(
      begin: _slideBegin,
      end: Offset.zero,
    ).animate(
        CurvedAnimation(parent: _slideController, curve: Curves.easeOut));
    _slideController.forward();

    // Determine initial phase from parent-supplied countdown.
    if (widget.iqamahCountdown != null) {
      _phase = widget.iqamahCountdown! > 0
          ? _IqamahPhase.countdown
          : _IqamahPhase.stand;
    }

    // Request audio focus based on prayer's media action (TV2-8.4, TV2-8.5).
    _applyMediaAction();
  }

  @override
  void didUpdateWidget(TvAdhanBubble old) {
    super.didUpdateWidget(old);

    if (widget.iqamahCountdown != old.iqamahCountdown) {
      final c = widget.iqamahCountdown;
      if (c == null) {
        _setPhase(_IqamahPhase.adhan);
      } else if (c > 0) {
        _setPhase(_IqamahPhase.countdown);
      } else {
        _setPhase(_IqamahPhase.stand);
      }
    }
  }

  void _setPhase(_IqamahPhase phase) {
    if (_phase == phase) return;
    setState(() => _phase = phase);
    if (phase == _IqamahPhase.stand) {
      _startStandDismissTimer();
    }
  }

  /// Starts the 30 s auto-dismiss after iqamah time arrives.
  void _startStandDismissTimer() {
    _standDismissTimer?.cancel();
    _standDismissTimer =
        Timer(const Duration(seconds: 30), _dismissWithFocusRelease);
  }

  Future<void> _applyMediaAction() async {
    final tvSettings = ref.read(tvSettingsProvider);
    final config = tvSettings.prayerAlertConfigs[widget.prayerName];
    final action = config?.mediaAction ?? TvMediaAction.pause;

    switch (action) {
      case TvMediaAction.pause:
        await TvAudioRouter.requestTransientFocus();
      case TvMediaAction.duck:
        await TvAudioRouter.duckAudio();
      case TvMediaAction.nothing:
        break;
    }
  }

  void _dismissWithFocusRelease() {
    _countdownTicker?.cancel();
    _standDismissTimer?.cancel();
    TvAudioRouter.releaseFocus();
    widget.onDismiss?.call();
  }

  @override
  void dispose() {
    _slideController.dispose();
    _countdownTicker?.cancel();
    _standDismissTimer?.cancel();
    super.dispose();
  }

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
    if (widget.snoozed) return 'Snoozed';

    switch (_phase) {
      case _IqamahPhase.adhan:
        return 'Adhan Now';
      case _IqamahPhase.countdown:
        final seconds = widget.iqamahCountdown ?? 0;
        final m = seconds ~/ 60;
        final s = seconds % 60;
        return 'Iqamah in '
            '${m.toString().padLeft(2, '0')}:'
            '${s.toString().padLeft(2, '0')}';
      case _IqamahPhase.stand:
        return 'Time to stand for prayer';
    }
  }

  Color get _statusColor {
    if (_phase == _IqamahPhase.stand) return PrayCalcColors.light;
    return PrayCalcColors.light;
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
              _dismissWithFocusRelease();
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
                            color: _statusColor,
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
    this.snoozed = false,
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

  /// When true the bubble shows "Snoozed" label.
  final bool snoozed;

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
                snoozed: snoozed,
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
