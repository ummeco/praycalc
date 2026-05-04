// tv_prayer_arrival_overlay.dart — v1.1 prayer arrival full-screen overlay.
// Spec §8.3, S19-F T28
//
// Shown when a prayer time arrives on Android TV / Fire TV:
//   - Full-screen SYSTEM_ALERT_WINDOW overlay (managed by platform channel)
//   - WAKE_LOCK requested to wake the TV display
//   - Auto-dismisses after 60 seconds
//   - D-pad BACK or center button dismisses immediately
//   - Accessible: Semantics labels on all elements
//
// Usage:
//   TvPrayerArrivalOverlay.show(context, prayer: 'Asr', time: '3:47 PM');
//   // or watch [tvPrayerArrivalProvider] via Riverpod

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// Platform channel for WAKE_LOCK + SYSTEM_ALERT_WINDOW management
// ---------------------------------------------------------------------------

const _kChannel = MethodChannel('praycalc/tv_overlay');

Future<void> _requestWakeLock()   async => _kChannel.invokeMethod('acquireWakeLock').catchError((_) {});
Future<void> _releaseWakeLock()   async => _kChannel.invokeMethod('releaseWakeLock').catchError((_) {});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/// Holds current overlay state (null = no overlay showing).
class TvPrayerArrivalState {
  final String prayerName;
  final String prayerTime;
  const TvPrayerArrivalState({required this.prayerName, required this.prayerTime});
}

final tvPrayerArrivalProvider =
    StateProvider<TvPrayerArrivalState?>((ref) => null);

// ---------------------------------------------------------------------------
// TvPrayerArrivalOverlay — root widget
// ---------------------------------------------------------------------------

/// Full-screen prayer arrival overlay for Android TV / Fire TV.
///
/// Wrap the [TvHomeScreen] stack with [TvPrayerArrivalLayer]; it watches
/// [tvPrayerArrivalProvider] and shows/hides the overlay automatically.
class TvPrayerArrivalLayer extends ConsumerWidget {
  final Widget child;
  const TvPrayerArrivalLayer({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final arrival = ref.watch(tvPrayerArrivalProvider);
    return Stack(
      fit: StackFit.expand,
      children: [
        child,
        if (arrival != null)
          TvPrayerArrivalOverlay(
            prayerName: arrival.prayerName,
            prayerTime: arrival.prayerTime,
            onDismiss: () => ref.read(tvPrayerArrivalProvider.notifier).state = null,
          ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// TvPrayerArrivalOverlay — the overlay itself
// ---------------------------------------------------------------------------

class TvPrayerArrivalOverlay extends StatefulWidget {
  final String prayerName;
  final String prayerTime;
  final VoidCallback onDismiss;

  const TvPrayerArrivalOverlay({
    super.key,
    required this.prayerName,
    required this.prayerTime,
    required this.onDismiss,
  });

  @override
  State<TvPrayerArrivalOverlay> createState() => _TvPrayerArrivalOverlayState();
}

class _TvPrayerArrivalOverlayState extends State<TvPrayerArrivalOverlay>
    with SingleTickerProviderStateMixin {

  late final AnimationController _anim;
  late final Animation<double>    _fadeIn;
  late final Animation<double>    _scaleIn;
  Timer? _autoDismiss;

  static const _autoDismissSec = 60;

  @override
  void initState() {
    super.initState();

    _anim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _fadeIn  = CurvedAnimation(parent: _anim, curve: Curves.easeOut);
    _scaleIn = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(parent: _anim, curve: Curves.easeOutCubic),
    );

    _anim.forward();
    _requestWakeLock();

    _autoDismiss = Timer(const Duration(seconds: _autoDismissSec), _dismiss);
  }

  @override
  void dispose() {
    _autoDismiss?.cancel();
    _releaseWakeLock();
    _anim.dispose();
    super.dispose();
  }

  void _dismiss() {
    if (!mounted) return;
    _anim.reverse().then((_) {
      if (mounted) widget.onDismiss();
    });
  }

  // ---------------------------------------------------------------------------
  // Keyboard / D-pad handling
  // ---------------------------------------------------------------------------

  KeyEventResult _handleKey(FocusNode _, KeyEvent event) {
    if (event is! KeyDownEvent) return KeyEventResult.ignored;
    final logicalKey = event.logicalKey;
    if (logicalKey == LogicalKeyboardKey.goBack ||
        logicalKey == LogicalKeyboardKey.escape ||
        logicalKey == LogicalKeyboardKey.select ||
        logicalKey == LogicalKeyboardKey.enter) {
      _dismiss();
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    // 4K scaling: if device pixel ratio >= 3.0, bump text 1.3×
    final dpr     = MediaQuery.of(context).devicePixelRatio;
    final tvScale = dpr >= 3.0 ? 1.3 : 1.0;

    return Semantics(
      label: '${widget.prayerName} prayer time has arrived at ${widget.prayerTime}. '
             'Press back or select to dismiss.',
      child: Focus(
        autofocus: true,
        onKeyEvent: _handleKey,
        child: FadeTransition(
          opacity: _fadeIn,
          child: Container(
            color: PrayCalcColors.deep.withAlpha(230),
            child: ScaleTransition(
              scale: _scaleIn,
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Crescent icon
                    Icon(
                      Icons.nightlight_round,
                      color: PrayCalcColors.mid,
                      size: 80 * tvScale,
                      semanticLabel: '',
                    ),
                    const SizedBox(height: 32),

                    // Prayer name
                    Semantics(
                      header: true,
                      child: Text(
                        widget.prayerName,
                        style: TextStyle(
                          color: PrayCalcColors.light,
                          fontSize: 72 * tvScale,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                        ),
                        textScaler: TextScaler.noScaling,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Prayer time
                    Text(
                      widget.prayerTime,
                      style: TextStyle(
                        color: Colors.white.withAlpha(200),
                        fontSize: 40 * tvScale,
                        fontWeight: FontWeight.w300,
                      ),
                      textScaler: TextScaler.noScaling,
                    ),
                    const SizedBox(height: 48),

                    // "It is time for prayer" label
                    Text(
                      'Time to pray',
                      style: TextStyle(
                        color: Colors.white.withAlpha(160),
                        fontSize: 28 * tvScale,
                        fontStyle: FontStyle.italic,
                      ),
                      textScaler: TextScaler.noScaling,
                    ),
                    const SizedBox(height: 48),

                    // Dismiss hint
                    Text(
                      'Press  ⏎  or  ← Back  to dismiss',
                      style: TextStyle(
                        color: Colors.white.withAlpha(100),
                        fontSize: 20 * tvScale,
                      ),
                      textScaler: TextScaler.noScaling,
                    ),

                    // Auto-dismiss countdown bar (visual only)
                    const SizedBox(height: 24),
                    _CountdownBar(totalSeconds: _autoDismissSec),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Countdown bar
// ---------------------------------------------------------------------------

class _CountdownBar extends StatefulWidget {
  final int totalSeconds;
  const _CountdownBar({required this.totalSeconds});

  @override
  State<_CountdownBar> createState() => _CountdownBarState();
}

class _CountdownBarState extends State<_CountdownBar> {
  late int _remaining;
  Timer? _t;

  @override
  void initState() {
    super.initState();
    _remaining = widget.totalSeconds;
    _t = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() { _remaining = (_remaining - 1).clamp(0, widget.totalSeconds); });
    });
  }

  @override
  void dispose() { _t?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final progress = _remaining / widget.totalSeconds;
    return SizedBox(
      width: 200,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: LinearProgressIndicator(
          value: progress,
          backgroundColor: Colors.white.withAlpha(30),
          valueColor: AlwaysStoppedAnimation<Color>(
            PrayCalcColors.mid.withAlpha(180),
          ),
          minHeight: 4,
        ),
      ),
    );
  }
}
