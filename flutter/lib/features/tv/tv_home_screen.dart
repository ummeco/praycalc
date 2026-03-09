import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/ramadan_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/providers/tv_provider.dart';
import '../../core/providers/weather_provider.dart';
import '../../core/router/app_router.dart';
import '../../core/services/media_pause_service.dart';
import '../../core/services/tv_launcher_service.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/moon_phase.dart';
import '../../shared/models/settings_model.dart';
import '../../shared/models/tv_settings_model.dart';
import 'tv_adhan_bubble.dart';
import 'tv_announcement_overlay.dart';
import 'tv_eid_overlay.dart';
import 'tv_countdown_flip.dart';
import 'tv_good_night_overlay.dart';
import 'tv_hadith_ticker.dart';
import 'tv_geometric_pattern.dart';
import 'tv_jumuah_overlay.dart';
import 'tv_sky_background.dart';
import 'tv_adhan_dua_overlay.dart';
import 'tv_ayah_of_hour.dart';
import 'tv_iqamah_board.dart';
import 'tv_multi_city_board.dart';
import 'tv_ramadan_display.dart';
import 'tv_post_adhan_bar.dart';
import 'tv_stream_library.dart';
import 'tv_stream_player.dart';

// ─── Prayer metadata (shared with home_screen pattern) ─────────────────────

class _PrayerMeta {
  final String label;
  final IconData icon;
  final double Function(PrayerTimes) getValue;

  const _PrayerMeta(this.label, this.icon, this.getValue);
}

const _prayers = [
  _PrayerMeta('Fajr', Icons.nightlight_round, _fajr),
  _PrayerMeta('Sunrise', Icons.wb_twilight, _sunrise),
  _PrayerMeta('Dhuhr', Icons.wb_sunny, _dhuhr),
  _PrayerMeta('Asr', Icons.wb_cloudy, _asr),
  _PrayerMeta('Maghrib', Icons.wb_twilight, _maghrib),
  _PrayerMeta('Isha', Icons.brightness_3, _isha),
];

double _fajr(PrayerTimes t) => t.fajr;
double _sunrise(PrayerTimes t) => t.sunrise;
double _dhuhr(PrayerTimes t) => t.dhuhr;
double _asr(PrayerTimes t) => t.asr;
double _maghrib(PrayerTimes t) => t.maghrib;
double _isha(PrayerTimes t) => t.isha;

// ─── TV Home Screen ────────────────────────────────────────────────────────

class TvHomeScreen extends ConsumerStatefulWidget {
  const TvHomeScreen({super.key});

  @override
  ConsumerState<TvHomeScreen> createState() => _TvHomeScreenState();
}

class _TvHomeScreenState extends ConsumerState<TvHomeScreen> {
  late Timer _ticker;
  final _focusNode = FocusNode();
  DateTime _now = DateTime.now();

  // ── Adhan alert state ──────────────────────────────────────────────────────
  /// Prayer currently firing an alert (null = none active).
  String? _alertPrayer;
  /// Alert mode for the active prayer (controls overlay vs bubble).
  TvAlertMode _alertMode = TvAlertMode.none;
  /// Which prayers have been alerted today (prevents re-firing).
  final Set<String> _alertedToday = {};
  DateTime _lastAlertDate = DateTime.now();

  // ── Post-adhan dua state (P-12) ────────────────────────────────────────────
  bool _showDua = false;

  // ── Pre-prayer signal state (P-4) ─────────────────────────────────────────
  /// Prayer name for which the pre-signal is currently showing (null = none).
  String? _signalPrayer;
  /// Prayers for which a pre-signal has already fired today.
  final Set<String> _signalledToday = {};

  // ── Snooze state ───────────────────────────────────────────────────────────
  Timer? _snoozeTimer;

  // ── Post-adhan iqamah bar state ────────────────────────────────────────────
  String? _iqamahPrayer;
  int _iqamahSecondsRemaining = 0;
  Timer? _iqamahTimer;

  // ── Stream mute state (TV2-3.6) ────────────────────────────────────────────
  bool _streamMuted = false;
  bool _muteButtonVisible = false;
  Timer? _muteButtonHideTimer;

  // ── Triple back-press escape (TV2-5.3) ────────────────────────────────────
  final List<DateTime> _backPresses = [];
  OverlayEntry? _exitHintOverlay;

  // ── Idle / ambient timer (TV2-7.9) ────────────────────────────────────────
  DateTime _lastKeyEvent = DateTime.now();

  // ── Guest mode (L-4): shows "Pair with phone" CTA when no JWT stored ──────
  bool _isGuestMode = false;

  // ── Good Night mode (P-14): dimming overlay after Isha ────────────────────
  /// True when user explicitly dismissed the overlay (resets at midnight).
  bool _goodNightDismissed = false;
  DateTime _goodNightDismissedDate = DateTime(2000);

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
    _checkGuestMode();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _now = DateTime.now());
      _checkPrayerAlerts();
      _checkIdleAmbient();
    });
  }

  @override
  void dispose() {
    _ticker.cancel();
    _focusNode.dispose();
    _snoozeTimer?.cancel();
    _iqamahTimer?.cancel();
    _muteButtonHideTimer?.cancel();
    _exitHintOverlay?.remove();
    WakelockPlus.disable();
    super.dispose();
  }

  // ─── Triple back-press escape (TV2-5.3) ───────────────────────────────────

  Future<void> _onBackInvoked() async {
    final now = DateTime.now();
    _backPresses.removeWhere(
      (t) => now.difference(t) > const Duration(seconds: 2),
    );
    _backPresses.add(now);
    if (_backPresses.length >= 3) {
      _backPresses.clear();
      _hideExitHint();
      try {
        await TvLauncherService.launchStockLauncher();
      } catch (_) {
        // Channel not available on non-TV builds — safe to ignore.
      }
    } else {
      _showExitHint();
    }
  }

  void _showExitHint() {
    _hideExitHint();
    final overlay = Overlay.of(context);
    _exitHintOverlay = OverlayEntry(
      builder: (_) => Positioned(
        bottom: 48,
        left: 0,
        right: 0,
        child: Center(
          child: Material(
            color: Colors.transparent,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
              decoration: BoxDecoration(
                color: PrayCalcColors.deep.withAlpha(230),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: PrayCalcColors.mid, width: 1),
              ),
              child: const Text(
                'Press back 3\u00d7 to exit',
                style: TextStyle(color: Colors.white, fontSize: 22),
              ),
            ),
          ),
        ),
      ),
    );
    overlay.insert(_exitHintOverlay!);
    Future.delayed(const Duration(seconds: 2), _hideExitHint);
  }

  void _hideExitHint() {
    _exitHintOverlay?.remove();
    _exitHintOverlay = null;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  double get _nowH =>
      _now.hour + _now.minute / 60.0 + _now.second / 3600.0;

  int _activePrayerIndex(PrayerTimes times) {
    int last = 0;
    for (int i = 0; i < _prayers.length; i++) {
      final h = _prayers[i].getValue(times);
      if (!h.isFinite) continue;
      if (h <= _nowH) last = i;
    }
    return last;
  }

  int _nextPrayerIndex(PrayerTimes times) {
    for (int i = 0; i < _prayers.length; i++) {
      final h = _prayers[i].getValue(times);
      if (!h.isFinite) continue;
      if (h > _nowH) return i;
    }
    return 0;
  }

  String _countdownString(PrayerTimes times, int nextIdx) {
    final h = _prayers[nextIdx].getValue(times);
    if (!h.isFinite) return '--:--:--';
    double diff = h - _nowH;
    if (diff < 0) diff += 24;
    final totalSec = (diff * 3600).round();
    final hh = totalSec ~/ 3600;
    final mm = (totalSec % 3600) ~/ 60;
    final ss = totalSec % 60;
    return '${hh.toString().padLeft(2, '0')}:'
        '${mm.toString().padLeft(2, '0')}:'
        '${ss.toString().padLeft(2, '0')}';
  }

  String _formatH(double h, bool use24h) {
    final totalMin = (h * 60).round();
    final hh = (totalMin ~/ 60) % 24;
    final mm = totalMin % 60;
    if (use24h) {
      return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    }
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:${mm.toString().padLeft(2, '0')} $period';
  }

  // ─── Guest mode detection (L-4) ────────────────────────────────────────────

  Future<void> _checkGuestMode() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    final jwt = prefs.getString('tv_session_jwt');
    if (mounted) setState(() => _isGuestMode = jwt == null || jwt.isEmpty);
  }

  // ─── Adhan alert controller (TV2-8.1, TV2-8.4, TV2-8.5, TV2-8.7) ─────────

  void _checkPrayerAlerts() {
    // Reset alerted sets at midnight.
    if (_now.day != _lastAlertDate.day) {
      _alertedToday.clear();
      _signalledToday.clear();
      _lastAlertDate = _now;
    }

    final timesAsync = ref.read(prayerTimesProvider);
    final tvSettings = ref.read(tvSettingsProvider);

    timesAsync.whenData((times) {
      final prayerMap = <String, double>{
        'Fajr': times.fajr,
        'Dhuhr': times.dhuhr,
        'Asr': times.asr,
        'Maghrib': times.maghrib,
        'Isha': times.isha,
      };

      for (final entry in prayerMap.entries) {
        final prayer = entry.key;
        final timeH = entry.value;
        if (!timeH.isFinite) continue;

        final diffSeconds = ((_nowH - timeH) * 3600).round();

        // Pre-prayer signal (P-4): fire in the window 5 min before prayer.
        if (!_signalledToday.contains(prayer)) {
          // Window: -300s to -270s before prayer (30-second trigger).
          if (diffSeconds >= -300 && diffSeconds < -270) {
            _signalledToday.add(prayer);
            _firePrePrayerSignal(prayer);
          }
        }

        // Adhan alert: fire within a 30-second window of prayer time.
        if (_alertedToday.contains(prayer)) continue;
        if (diffSeconds >= 0 && diffSeconds < 30) {
          _alertedToday.add(prayer);
          _fireAlert(prayer, timeH, tvSettings);
        }
      }
    });
  }

  void _firePrePrayerSignal(String prayer) {
    if (!mounted) return;
    setState(() => _signalPrayer = prayer);
    // Auto-dismiss after 6 seconds.
    Future.delayed(const Duration(seconds: 6), () {
      if (mounted && _signalPrayer == prayer) {
        setState(() => _signalPrayer = null);
      }
    });
  }

  void _fireAlert(String prayer, double timeH, TvSettings tvSettings) {
    final config = tvSettings.prayerAlertConfigs[prayer] ??
        const TvPrayerAlertConfig();

    if (config.alertMode == TvAlertMode.none) return;

    // Handle media action.
    _applyMediaAction(config.mediaAction);

    setState(() {
      _alertPrayer = prayer;
      _alertMode = config.alertMode;
    });

    // Auto-dismiss after configured duration.
    if (config.autoDismissSeconds > 0) {
      Future.delayed(Duration(seconds: config.autoDismissSeconds), () {
        if (mounted && _alertPrayer == prayer) {
          _dismissAlert(prayer, tvSettings);
        }
      });
    }
  }

  void _applyMediaAction(TvMediaAction action) {
    switch (action) {
      case TvMediaAction.pause:
        MediaPauseService.instance.requestAudioFocus();
      case TvMediaAction.duck:
        MediaPauseService.instance.duckMedia();
      case TvMediaAction.nothing:
        break;
    }
  }

  void _dismissAlert(String prayer, TvSettings tvSettings) {
    MediaPauseService.instance.releaseAudioFocus();
    _startIqamahCountdown(prayer, tvSettings);
    setState(() {
      _alertPrayer = null;
      _alertMode = TvAlertMode.none;
      _showDua = true; // P-12: show post-adhan dua
    });
  }

  void _snooze(String prayer, int minutes, TvSettings tvSettings) {
    // Dismiss current alert.
    setState(() {
      _alertPrayer = null;
      _alertMode = TvAlertMode.none;
    });
    // Re-show bubble after snooze duration.
    _snoozeTimer?.cancel();
    _snoozeTimer = Timer(Duration(minutes: minutes), () {
      if (mounted) {
        setState(() {
          _alertPrayer = prayer;
          _alertMode = TvAlertMode.bubble;
        });
      }
    });
  }

  // ─── Iqamah countdown (TV2-8.7, TV2-8.9) ──────────────────────────────────

  void _startIqamahCountdown(String prayer, TvSettings tvSettings) {
    final iqamahTimes = ref.read(iqamahTimesProvider);
    final iqamahH = iqamahTimes[prayer];
    if (iqamahH == null) return;

    final diffSeconds = ((iqamahH - _nowH) * 3600).round();
    if (diffSeconds <= 0) return;

    _iqamahTimer?.cancel();
    setState(() {
      _iqamahPrayer = prayer;
      _iqamahSecondsRemaining = diffSeconds;
    });

    _iqamahTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      setState(() => _iqamahSecondsRemaining--);
      if (_iqamahSecondsRemaining <= 0) {
        t.cancel();
        setState(() => _iqamahPrayer = null);
      }
    });
  }

  // ─── Idle / ambient detection (TV2-7.9) ────────────────────────────────────

  void _checkIdleAmbient() {
    final tvSettings = ref.read(tvSettingsProvider);
    final idleMin = tvSettings.ambientIdleMinutes;
    if (idleMin <= 0) return;

    final idle = _now.difference(_lastKeyEvent);
    if (idle.inMinutes >= idleMin) {
      if (mounted) context.push(Routes.tvAmbient);
      // Reset so we don't navigate every second.
      _lastKeyEvent = _now;
    }
  }

  void _resetIdleTimer() {
    _lastKeyEvent = DateTime.now();
  }

  // ─── Stream mute toggle (TV2-3.6) ─────────────────────────────────────────

  void _toggleMute() {
    setState(() => _streamMuted = !_streamMuted);
    _showMuteButton();
  }

  void _showMuteButton() {
    setState(() => _muteButtonVisible = true);
    _muteButtonHideTimer?.cancel();
    _muteButtonHideTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) setState(() => _muteButtonVisible = false);
    });
  }

  // ─── Key handler ──────────────────────────────────────────────────────────

  void _onKey(KeyEvent event) {
    if (event is! KeyDownEvent) return;
    _resetIdleTimer();

    final key = event.logicalKey;
    if (key == LogicalKeyboardKey.select || key == LogicalKeyboardKey.enter) {
      context.push(Routes.tvSettings);
    }
    if (key == LogicalKeyboardKey.audioVolumeMute) {
      _toggleMute();
    }
    // Show mute overlay on any D-pad movement when stream is active.
    if (key == LogicalKeyboardKey.arrowUp ||
        key == LogicalKeyboardKey.arrowDown ||
        key == LogicalKeyboardKey.arrowLeft ||
        key == LogicalKeyboardKey.arrowRight) {
      final tvSettings = ref.read(tvSettingsProvider);
      if (tvSettings.tvAudioMode == 'stream') _showMuteButton();
    }
  }

  // ─── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final city = ref.watch(cityProvider);
    final settings = ref.watch(settingsProvider);
    final timesAsync = ref.watch(prayerTimesProvider);
    final ramadan = ref.watch(ramadanProvider);
    final tvSettings = ref.watch(tvSettingsProvider);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) => _onBackInvoked(),
      child: Scaffold(
      backgroundColor: tvSettings.skyBackgroundEnabled
          ? Colors.transparent
          : PrayCalcColors.deep,
      body: tvSettings.skyBackgroundEnabled
          ? TvSkyBackground(
              hour: _nowH,
              child: _buildBody(tvSettings, timesAsync, city, settings, ramadan),
            )
          : _buildBody(tvSettings, timesAsync, city, settings, ramadan),
    ),  // end Scaffold
  );  // end PopScope
  }  // end build

  Widget _buildBody(TvSettings tvSettings, dynamic timesAsync, dynamic city,
      dynamic settings, dynamic ramadan) {
    final inner = FocusTraversalGroup(
        policy: OrderedTraversalPolicy(),
        child: KeyboardListener(
          focusNode: _focusNode,
          autofocus: true,
          onKeyEvent: _onKey,
          child: timesAsync.when(
            loading: () => const Center(
              child: CircularProgressIndicator(color: PrayCalcColors.mid),
            ),
            error: (e, _) => Center(
              child: Text(
                'Error: $e',
                style: const TextStyle(color: Colors.white, fontSize: 28),
              ),
            ),
            data: (times) {
              final activeIdx = _activePrayerIndex(times);
              final nextIdx = _nextPrayerIndex(times);

              // Determine Eid state.
              final eidType = detectEid(_now);

              // Build the base body.
              Widget body = Column(
                children: [
                  // Jumu'ah banner (Friday 11:00–14:00).
                  if (TvJumuahOverlay.shouldShow(_now))
                    TvJumuahOverlay(
                      now: _now,
                      khutbahHour: tvSettings.jumuahKhutbahHour,
                      khutbahMinute: tvSettings.jumuahKhutbahMinute,
                    ),

                  // Main content.
                  Expanded(
                    child: _TvHomeBody(
                      times: times,
                      now: _now,
                      nowH: _nowH,
                      city: city,
                      settings: settings,
                      tvSettings: tvSettings,
                      ramadan: ramadan,
                      activeIdx: activeIdx,
                      nextIdx: nextIdx,
                      countdown: _countdownString(times, nextIdx),
                      streamMuted: _streamMuted,
                      muteButtonVisible: _muteButtonVisible,
                      onToggleMute: _toggleMute,
                      formatH: _formatH,
                    ),
                  ),

                  // Post-adhan iqamah bar.
                  if (_iqamahPrayer != null)
                    TvPostAdhanBar(
                      prayerName: _iqamahPrayer!,
                      iqamahCountdownSeconds: _iqamahSecondsRemaining,
                    ),
                ],
              );

              // Night mode warm color filter (TV2-6.5): currentBrightness < 30.
              if (tvSettings.nightModeEnabled &&
                  tvSettings.currentBrightness < 30) {
                body = ColorFiltered(
                  colorFilter: const ColorFilter.matrix([
                    1, 0,    0, 0, 0,
                    0, 0.92, 0, 0, 0,
                    0, 0,    0.5, 0, 0,
                    0, 0,    0, 1, 0,
                  ]),
                  child: body,
                );
              }

              // Eid overlay (full-screen, below alert overlay).
              if (eidType != null) {
                body = Stack(
                  children: [
                    body,
                    TvEidOverlay(eidType: eidType),
                  ],
                );
              }

              // Announcement ticker (masjid kiosk mode — TV2-11.5).
              if (tvSettings.announcements.isNotEmpty) {
                body = Stack(
                  children: [
                    body,
                    Positioned(
                      left: 16,
                      right: 16,
                      bottom: 16,
                      child: TvAnnouncementOverlay(
                        announcements: tvSettings.announcements,
                      ),
                    ),
                  ],
                );
              }

              // Adhan alert layer.
              if (_alertPrayer != null) {
                final config =
                    tvSettings.prayerAlertConfigs[_alertPrayer!] ??
                        const TvPrayerAlertConfig();
                final prayerH = _getPrayerH(times, _alertPrayer!);
                final timeStr = prayerH != null
                    ? _formatH(prayerH, settings.use24h)
                    : '';

                if (_alertMode == TvAlertMode.full) {
                  body = Stack(
                    children: [
                      body,
                      _TvFullAlertOverlay(
                        prayerName: _alertPrayer!,
                        prayerTimeFormatted: timeStr,
                        config: config,
                        onDismiss: () => _dismissAlert(
                            _alertPrayer!, tvSettings),
                        onSnooze: (minutes) =>
                            _snooze(_alertPrayer!, minutes, tvSettings),
                      ),
                    ],
                  );
                } else if (_alertMode == TvAlertMode.bubble) {
                  body = TvAdhanBubbleOverlay(
                    prayerName: _alertPrayer,
                    position: tvSettings.defaultBubblePosition,
                    iqamahCountdown: _iqamahSecondsRemaining > 0
                        ? _iqamahSecondsRemaining
                        : null,
                    onDismiss: () =>
                        _dismissAlert(_alertPrayer!, tvSettings),
                    onExpand: () => setState(
                        () => _alertMode = TvAlertMode.full),
                    child: body,
                  );
                }
              }

              // ── Guest mode: persistent "Pair with phone" CTA (L-4) ──
              if (_isGuestMode) {
                body = Stack(
                  children: [
                    body,
                    Positioned(
                      bottom: 16,
                      right: 16,
                      child: GestureDetector(
                        onTap: () => context.push(Routes.tvPairing),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: PrayCalcColors.dark.withAlpha(230),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                                color: PrayCalcColors.mid.withAlpha(100),
                                width: 1),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.phone_android,
                                  color: PrayCalcColors.mid, size: 18),
                              SizedBox(width: 8),
                              Text(
                                'Pair with phone',
                                style: TextStyle(
                                    color: Colors.white54, fontSize: 14),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              }

              // ── Iqamah board (P-10) — full-screen when ≤ 120 s ──────
              if (_iqamahPrayer != null) {
                body = Stack(
                  fit: StackFit.expand,
                  children: [
                    body,
                    TvIqamahBoard(
                      prayerName: _iqamahPrayer!,
                      secondsRemaining: _iqamahSecondsRemaining,
                    ),
                  ],
                );
              }

              // ── Post-adhan dua overlay (P-12) ────────────────────────
              if (_showDua) {
                body = Stack(
                  fit: StackFit.expand,
                  children: [
                    body,
                    TvAdhanDuaOverlay(
                      onDone: () => setState(() => _showDua = false),
                    ),
                  ],
                );
              }

              // ── Pre-prayer signal overlay (P-4) ──────────────────────
              if (_signalPrayer != null) {
                body = Stack(
                  fit: StackFit.expand,
                  children: [
                    body,
                    TvPrePrayerSignal(prayerName: _signalPrayer!),
                  ],
                );
              }

              // ── Good Night overlay (P-14) ────────────────────────────
              if (tvSettings.goodNightEnabled &&
                  _isGoodNightTime(times, tvSettings)) {
                body = Stack(
                  children: [
                    body,
                    TvGoodNightOverlay(
                      fajrTime: _formatH(times.fajr, settings.use24h),
                      onDismiss: () => setState(() {
                        _goodNightDismissed = true;
                        _goodNightDismissedDate = DateTime.now();
                      }),
                    ),
                  ],
                );
              }

              return body;
            },
          ),
        ),
    );
    if (!tvSettings.geometricPatternEnabled) return inner;
    final style = tvSettings.geometricPatternStyle == 'girih'
        ? TvGeometricStyle.girih
        : TvGeometricStyle.moroccanStar;
    return TvGeometricPattern(style: style, opacity: 0.08, child: inner);
  }

  /// True when current time is in the Good Night window:
  /// [isha + delayMinutes, fajr + 30 min] (handles midnight crossing).
  bool _isGoodNightTime(PrayerTimes times, TvSettings tvSettings) {
    // Reset dismissal at midnight (new calendar day).
    if (_goodNightDismissed) {
      final now = DateTime.now();
      if (now.day != _goodNightDismissedDate.day ||
          now.month != _goodNightDismissedDate.month) {
        _goodNightDismissed = false;
      } else {
        return false;
      }
    }
    final delayH = tvSettings.goodNightDelayMinutes / 60.0;
    final activationH = times.isha + delayH;
    final fajrEndH = times.fajr + 0.5; // auto-dismiss 30 min after Fajr
    // After midnight: _nowH is small (0..6), isha was large (20..23).
    if (activationH >= 24) {
      return _nowH >= (activationH - 24) || _nowH < fajrEndH;
    }
    return _nowH >= activationH &&
        (_nowH < fajrEndH || fajrEndH < activationH);
  }

  double? _getPrayerH(PrayerTimes times, String prayer) {
    switch (prayer) {
      case 'Fajr':
        return times.fajr;
      case 'Dhuhr':
        return times.dhuhr;
      case 'Asr':
        return times.asr;
      case 'Maghrib':
        return times.maghrib;
      case 'Isha':
        return times.isha;
      default:
        return null;
    }
  }
}

// ─── Full-screen adhan alert overlay (wired to TV2-8.8 snooze) ────────────

class _TvFullAlertOverlay extends StatefulWidget {
  const _TvFullAlertOverlay({
    required this.prayerName,
    required this.prayerTimeFormatted,
    required this.config,
    required this.onDismiss,
    required this.onSnooze,
  });

  final String prayerName;
  final String prayerTimeFormatted;
  final TvPrayerAlertConfig config;
  final VoidCallback onDismiss;
  final void Function(int minutes) onSnooze;

  @override
  State<_TvFullAlertOverlay> createState() => _TvFullAlertOverlayState();
}

class _TvFullAlertOverlayState extends State<_TvFullAlertOverlay>
    with SingleTickerProviderStateMixin {
  final _focusNode = FocusNode();
  late final AnimationController _fadeCtrl;
  late final Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..forward();
    _fadeAnim =
        CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeIn);
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _dismiss() {
    _fadeCtrl.reverse().then((_) {
      if (mounted) widget.onDismiss();
    });
  }

  @override
  Widget build(BuildContext context) {
    final hijri = _hijriString();

    return KeyboardListener(
      focusNode: _focusNode,
      autofocus: true,
      onKeyEvent: (event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter ||
                event.logicalKey == LogicalKeyboardKey.escape)) {
          _dismiss();
        }
      },
      child: FadeTransition(
        opacity: _fadeAnim,
        child: GestureDetector(
          onTap: _dismiss,
          child: Container(
            color: Colors.black.withAlpha(220),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.mosque,
                      color: PrayCalcColors.light, size: 80),
                  const SizedBox(height: 24),
                  Text(
                    widget.prayerName,
                    style: const TextStyle(
                      color: PrayCalcColors.light,
                      fontSize: 72,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    widget.prayerTimeFormatted,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 56,
                      fontWeight: FontWeight.w300,
                      fontFeatures: [FontFeature.tabularFigures()],
                    ),
                  ),
                  if (hijri.isNotEmpty) ...[
                    const SizedBox(height: 24),
                    Text(
                      hijri,
                      style: const TextStyle(
                          color: Colors.white54, fontSize: 28),
                    ),
                  ],
                  const SizedBox(height: 48),
                  // Snooze buttons (TV2-8.8).
                  TvSnoozeBar(
                    onSnooze: widget.onSnooze,
                    onDismiss: _dismiss,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Press OK to dismiss',
                    style: TextStyle(
                      color: Colors.white.withAlpha(80),
                      fontSize: 20,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _hijriString() {
    try {
      final hj = HijriCalendar.fromDate(DateTime.now());
      const months = [
        'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
        'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
      ];
      return '${hj.hDay} ${months[hj.hMonth - 1]} ${hj.hYear} AH';
    } catch (_) {
      return '';
    }
  }
}

// ─── Body ──────────────────────────────────────────────────────────────────

class _TvHomeBody extends StatelessWidget {
  const _TvHomeBody({
    required this.times,
    required this.now,
    required this.nowH,
    required this.city,
    required this.settings,
    required this.tvSettings,
    required this.ramadan,
    required this.activeIdx,
    required this.nextIdx,
    required this.countdown,
    required this.streamMuted,
    required this.muteButtonVisible,
    required this.onToggleMute,
    required this.formatH,
  });

  final PrayerTimes times;
  final DateTime now;
  final double nowH;
  final City? city;
  final AppSettings settings;
  final TvSettings tvSettings;
  final RamadanState ramadan;
  final int activeIdx;
  final int nextIdx;
  final String countdown;
  final bool streamMuted;
  final bool muteButtonVisible;
  final VoidCallback onToggleMute;
  final String Function(double h, bool use24h) formatH;

  @override
  Widget build(BuildContext context) {
    final moonResult = MoonPhase.calculate(now);
    final hijri = _hijriDateString(now);

    // Second timezone display (TV2-9.7).
    final secondTz = tvSettings.secondCityTimeZone ?? 'Asia/Riyadh';
    final secondLabel = tvSettings.secondCitySlug ?? 'Mecca';

    // Live stream panel (TV2-3.6, TV2-3.7).
    final showStream = tvSettings.tvAudioMode == 'stream' &&
        tvSettings.layoutSettings.leftPanel == TvPanelType.liveStream;
    TvStream? activeStream;
    if (showStream) {
      try {
        activeStream = kBuiltInStreams.firstWhere(
          (s) => s.id == tvSettings.selectedStreamId,
        );
      } catch (_) {
        activeStream = kBuiltInStreams.first;
      }
    }

    return SafeArea(
      child: Stack(
        children: [
          // ── Main layout ──
          Padding(
            padding: const EdgeInsets.symmetric(
                horizontal: 48, vertical: 32),
            child: Row(
              children: [
                // Left panel: stream or main content.
                if (showStream && activeStream != null)
                  Expanded(
                    child: TvStreamPlayer(
                      stream: activeStream,
                      muted: streamMuted,
                    ),
                  )
                else
                  const SizedBox.shrink(),

                // Right: prayer times column.
                Expanded(
                  child: Column(
                    children: [
                      // Top bar: city + date.
                      _TvTopBar(
                        cityName: city?.displayName ?? 'No city',
                        hijri: hijri,
                        gregorian: _gregorianLabel(now),
                        secondLabel: secondLabel,
                        secondTz: secondTz,
                        now: now,
                      ),
                      const SizedBox(height: 24),

                      // Current time.
                      _TvCurrentTime(now: now, use24h: settings.use24h),
                      const SizedBox(height: 8),

                      // Ramadan primary display (P-13) / standard countdown.
                      if (ramadan.isRamadan)
                        TvRamadanDisplay(
                          ramadan: ramadan,
                          suhoorTime: formatH(times.fajr, settings.use24h),
                          iftarTime: formatH(times.maghrib, settings.use24h),
                          countdown: countdown,
                          countdownLabel: nowH < times.fajr
                              ? 'Until Suhoor ends'
                              : nowH < times.maghrib
                                  ? 'Until Iftar'
                                  : 'Until Fajr',
                        )
                      else
                        _TvCountdownBanner(
                          label: _prayerLabel(
                            _prayers[nextIdx].label,
                            false,
                          ),
                          countdown: countdown,
                        ),
                      const SizedBox(height: 16),

                      // Ayah of the hour (P-7).
                      TvAyahOfHour(hour: now.hour),
                      const SizedBox(height: 16),

                      // Prayer times grid: 2 columns x 3 rows.
                      Expanded(
                        child: _TvPrayerGrid(
                          times: times,
                          use24h: settings.use24h,
                          activeIdx: activeIdx,
                          nextIdx: nextIdx,
                          isRamadan: ramadan.isRamadan,
                        ),
                      ),

                      // Multi-city prayer board (P-9).
                      if (tvSettings.secondCitySlug != null &&
                          tvSettings.secondCitySlug!.isNotEmpty &&
                          tvSettings.secondCityLat != null &&
                          tvSettings.secondCityLng != null) ...[
                        const SizedBox(height: 12),
                        TvMultiCityBoard(
                          primaryLabel:
                              city?.name ?? 'Primary',
                          primaryTimes: times,
                          secondaryLabel: tvSettings.secondCitySlug!,
                          secondaryLat: tvSettings.secondCityLat!,
                          secondaryLng: tvSettings.secondCityLng!,
                          secondaryTimeZone:
                              tvSettings.secondCityTimeZone ?? 'Asia/Riyadh',
                          use24h: settings.use24h,
                          activeIdx: activeIdx < 5 ? activeIdx : -1,
                          isRamadan: ramadan.isRamadan,
                        ),
                      ],

                      // Hadith / Asma al-Husna ambient ticker (L-3).
                      if (tvSettings.infoBarConfig.showHadithTicker) ...[
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 44,
                          child: TvHadithTicker(
                            includeAsmaAlHusna:
                                tvSettings.infoBarConfig.showAsmaAlHusna,
                          ),
                        ),
                      ],

                      // Bottom: moon phase + weather.
                      const SizedBox(height: 16),
                      _TvBottomBar(moonResult: moonResult),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Mute overlay button (TV2-3.6) ──
          if (muteButtonVisible && showStream)
            Positioned(
              top: 24,
              right: 24,
              child: AnimatedOpacity(
                opacity: muteButtonVisible ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 300),
                child: GestureDetector(
                  onTap: onToggleMute,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      color: PrayCalcColors.deep.withAlpha(220),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                          color: PrayCalcColors.mid, width: 1),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          streamMuted
                              ? Icons.volume_off
                              : Icons.volume_up,
                          color: PrayCalcColors.light,
                          size: 24,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          streamMuted ? 'Muted' : 'Audio on',
                          style: const TextStyle(
                              color: Colors.white, fontSize: 18),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

        ],
      ),
    );
  }

  String _prayerLabel(String name, bool isRamadan) {
    if (isRamadan && name == 'Fajr') return 'Suhoor';
    if (isRamadan && name == 'Maghrib') return 'Iftar';
    return name;
  }

  String _gregorianLabel(DateTime dt) {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${dayNames[dt.weekday - 1]}, ${dt.day} ${monthNames[dt.month - 1]} ${dt.year}';
  }

  String _hijriDateString(DateTime dt) {
    try {
      final hj = HijriCalendar.fromDate(dt);
      const months = [
        'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
        'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
      ];
      return '${hj.hDay} ${months[hj.hMonth - 1]} ${hj.hYear} AH';
    } catch (_) {
      return '';
    }
  }
}

// ─── Sub-widgets ───────────────────────────────────────────────────────────

class _TvTopBar extends StatelessWidget {
  const _TvTopBar({
    required this.cityName,
    required this.hijri,
    required this.gregorian,
    required this.secondLabel,
    required this.secondTz,
    required this.now,
  });

  final String cityName;
  final String hijri;
  final String gregorian;
  final String secondLabel;
  final String secondTz;
  final DateTime now;

  /// Returns the current time in [tzName] as a simple HH:MM string.
  /// Uses DateTime offset approximation via named timezone offsets.
  /// For full accuracy, add the `timezone` package; for now we use a static
  /// offset table for the most common Islamic city timezones.
  String _secondCityTime() {
    // Static UTC offsets for supported zones (covers common Islamic cities).
    const offsets = <String, int>{
      'Asia/Riyadh': 3,      // Mecca, Medina, Riyadh
      'Asia/Dubai': 4,       // Dubai, Abu Dhabi
      'Africa/Cairo': 2,     // Cairo (ignores DST)
      'Asia/Istanbul': 3,    // Istanbul (ignores DST)
      'Asia/Karachi': 5,     // Karachi
      'Asia/Dhaka': 6,       // Dhaka
      'Asia/Jakarta': 7,     // Jakarta
      'Asia/Kuala_Lumpur': 8, // Kuala Lumpur
      'Asia/Tehran': 3,      // Tehran (ignores 0.5h offset)
      'Africa/Casablanca': 1, // Casablanca
      'America/New_York': -4, // New York (EDT approx)
      'America/Chicago': -5,  // Chicago (CDT approx)
      'America/Los_Angeles': -7, // LA (PDT approx)
      'Europe/London': 1,    // London (BST approx)
      'Europe/Paris': 2,     // Paris (CEST approx)
    };
    final offsetH = offsets[secondTz] ?? 0;
    final utc = now.toUtc();
    final shifted = utc.add(Duration(hours: offsetH));
    final hh = shifted.hour.toString().padLeft(2, '0');
    final mm = shifted.minute.toString().padLeft(2, '0');
    return '$hh:$mm';
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // City name (left).
        Expanded(
          child: Row(
            children: [
              const Icon(Icons.location_on,
                  color: PrayCalcColors.mid, size: 28),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  cityName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              // Second city time (TV2-9.7).
              const SizedBox(width: 24),
              Text(
                '$secondLabel  ${_secondCityTime()}',
                style: const TextStyle(
                  color: Colors.white54,
                  fontSize: 20,
                ),
              ),
            ],
          ),
        ),
        // Date (right).
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              gregorian,
              style: const TextStyle(color: Colors.white70, fontSize: 24),
            ),
            if (hijri.isNotEmpty)
              Text(
                hijri,
                style:
                    const TextStyle(color: Colors.white54, fontSize: 20),
              ),
          ],
        ),
      ],
    );
  }
}

class _TvCurrentTime extends StatelessWidget {
  const _TvCurrentTime({required this.now, required this.use24h});

  final DateTime now;
  final bool use24h;

  @override
  Widget build(BuildContext context) {
    final timeStr = _formatCurrentTime();
    return Semantics(
      label: 'Current time: $timeStr',
      child: Text(
        timeStr,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 72,
          fontWeight: FontWeight.bold,
          fontFeatures: [FontFeature.tabularFigures()],
        ),
      ),
    );
  }

  String _formatCurrentTime() {
    final hh = now.hour;
    final mm = now.minute.toString().padLeft(2, '0');
    final ss = now.second.toString().padLeft(2, '0');
    if (use24h) {
      return '${hh.toString().padLeft(2, '0')}:$mm:$ss';
    }
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:$mm:$ss $period';
  }
}

class _TvCountdownBanner extends StatelessWidget {
  const _TvCountdownBanner({
    required this.label,
    required this.countdown,
  });

  final String label;
  final String countdown;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$label in $countdown',
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
        decoration: BoxDecoration(
          color: PrayCalcColors.dark,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$label in  ',
              style: const TextStyle(
                color: PrayCalcColors.light,
                fontSize: 32,
                fontWeight: FontWeight.w500,
              ),
            ),
            TvCountdownFlip(time: countdown, digitFontSize: 36),
          ],
        ),
      ),
    );
  }
}

// P-2: Redesigned prayer card grid.
// Four card states:
//   past     — prayer already passed today (muted, checkmark badge)
//   active   — currently active window (green glow border)
//   next     — next upcoming prayer (bright accent, pulsing dot)
//   upcoming — future prayer (neutral glass card)

enum _CardState { past, active, next, upcoming }

class _TvPrayerGrid extends StatelessWidget {
  const _TvPrayerGrid({
    required this.times,
    required this.use24h,
    required this.activeIdx,
    required this.nextIdx,
    required this.isRamadan,
  });

  final PrayerTimes times;
  final bool use24h;
  final int activeIdx;
  final int nextIdx;
  final bool isRamadan;

  @override
  Widget build(BuildContext context) {
    const leftIndices = [0, 2, 4]; // Fajr, Dhuhr, Maghrib
    const rightIndices = [1, 3, 5]; // Sunrise, Asr, Isha

    return Row(
      children: [
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: leftIndices
                .map((i) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: _buildCard(i),
                    ))
                .toList(),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: rightIndices
                .map((i) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: _buildCard(i),
                    ))
                .toList(),
          ),
        ),
      ],
    );
  }

  _CardState _stateFor(int idx) {
    if (idx == activeIdx) return _CardState.active;
    if (idx == nextIdx) return _CardState.next;
    // Past: index comes before activeIdx in the circular prayer cycle.
    // Simple heuristic: all indices strictly less than nextIdx and not active.
    if (nextIdx > 0 && idx < nextIdx && idx != activeIdx) {
      return _CardState.past;
    }
    return _CardState.upcoming;
  }

  Widget _buildCard(int idx) {
    final meta = _prayers[idx];
    final h = meta.getValue(times);
    final timeStr = h.isFinite ? _formatH(h) : '--:--';
    final state = _stateFor(idx);

    String label = meta.label;
    if (isRamadan && label == 'Fajr') label = 'Suhoor';
    if (isRamadan && label == 'Maghrib') label = 'Iftar';

    final semanticLabel = switch (state) {
      _CardState.active => '$label at $timeStr, current prayer',
      _CardState.next => '$label at $timeStr, next prayer',
      _CardState.past => '$label at $timeStr, completed',
      _CardState.upcoming => '$label at $timeStr',
    };

    // Colors per state.
    final Color bgColor = switch (state) {
      _CardState.active =>
        PrayCalcColors.dark.withValues(alpha: 0.75),
      _CardState.next =>
        PrayCalcColors.deep.withValues(alpha: 0.85),
      _CardState.past =>
        Colors.black.withValues(alpha: 0.25),
      _CardState.upcoming =>
        Colors.white.withValues(alpha: 0.06),
    };
    final Color borderColor = switch (state) {
      _CardState.active => PrayCalcColors.mid,
      _CardState.next => PrayCalcColors.light,
      _CardState.past => Colors.white.withValues(alpha: 0.10),
      _CardState.upcoming => Colors.white.withValues(alpha: 0.15),
    };
    final double borderWidth = switch (state) {
      _CardState.active => 2.0,
      _CardState.next => 2.5,
      _ => 1.0,
    };
    final List<BoxShadow> shadows = switch (state) {
      _CardState.next => [
          BoxShadow(
            color: PrayCalcColors.light.withValues(alpha: 0.25),
            blurRadius: 16,
            spreadRadius: 2,
          ),
        ],
      _CardState.active => [
          BoxShadow(
            color: PrayCalcColors.mid.withValues(alpha: 0.18),
            blurRadius: 12,
          ),
        ],
      _ => const [],
    };
    final Color iconColor = switch (state) {
      _CardState.next => PrayCalcColors.light,
      _CardState.active => PrayCalcColors.mid,
      _CardState.past => Colors.white30,
      _CardState.upcoming => Colors.white54,
    };
    final Color labelColor = switch (state) {
      _CardState.past => Colors.white38,
      _ => Colors.white,
    };
    final Color timeColor = switch (state) {
      _CardState.next => PrayCalcColors.light,
      _CardState.active => Colors.white,
      _CardState.past => Colors.white30,
      _CardState.upcoming => Colors.white70,
    };

    return Semantics(
      label: semanticLabel,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: borderColor, width: borderWidth),
          boxShadow: shadows,
        ),
        child: Row(
          children: [
            // State indicator column.
            Stack(
              alignment: Alignment.topRight,
              children: [
                Icon(meta.icon, color: iconColor, size: 32),
                if (state == _CardState.past)
                  Positioned(
                    top: -2,
                    right: -2,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check, size: 10,
                          color: Colors.white54),
                    ),
                  ),
                if (state == _CardState.next)
                  Positioned(
                    top: -2,
                    right: -2,
                    child: _PulsingDot(color: PrayCalcColors.light),
                  ),
              ],
            ),
            const SizedBox(width: 14),
            // Label.
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  color: labelColor,
                  fontSize: 28,
                  fontWeight: state == _CardState.past
                      ? FontWeight.normal
                      : FontWeight.w600,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            // Time.
            Text(
              timeStr,
              style: TextStyle(
                color: timeColor,
                fontSize: 38,
                fontWeight: state == _CardState.upcoming ||
                        state == _CardState.past
                    ? FontWeight.normal
                    : FontWeight.bold,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatH(double h) {
    final totalMin = (h * 60).round();
    final hh = (totalMin ~/ 60) % 24;
    final mm = totalMin % 60;
    if (use24h) {
      return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    }
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:${mm.toString().padLeft(2, '0')} $period';
  }
}

// Pulsing dot for the "next prayer" card indicator.
class _PulsingDot extends StatefulWidget {
  const _PulsingDot({required this.color});
  final Color color;

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (ctx, _) => Container(
        width: 12,
        height: 12,
        decoration: BoxDecoration(
          color: widget.color.withValues(alpha: 0.5 + _ctrl.value * 0.5),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: widget.color.withValues(alpha: _ctrl.value * 0.6),
              blurRadius: 6,
              spreadRadius: 1,
            ),
          ],
        ),
      ),
    );
  }
}

class _TvBottomBar extends ConsumerWidget {
  const _TvBottomBar({required this.moonResult});

  final MoonPhaseResult moonResult;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final phaseName = MoonPhase.phaseName(moonResult.phase);
    final pct = moonResult.illuminationPct.round();
    final weather = ref.watch(weatherProvider);

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Semantics(
          label: 'Moon phase: $phaseName, $pct% illumination',
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                MoonPhase.phaseEmoji(moonResult.phase),
                style: const TextStyle(fontSize: 32),
              ),
              const SizedBox(width: 12),
              Text(
                phaseName,
                style: const TextStyle(
                    color: Colors.white54, fontSize: 24),
              ),
              const SizedBox(width: 8),
              Text(
                '$pct%',
                style: const TextStyle(
                    color: Colors.white38, fontSize: 20),
              ),
            ],
          ),
        ),
        if (weather != null) ...[
          const SizedBox(width: 32),
          Container(width: 1, height: 28, color: Colors.white24),
          const SizedBox(width: 32),
          Semantics(
            label:
                'Weather: ${weather.description}, ${weather.tempCelsius.round()}°C',
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  weather.emoji,
                  style: const TextStyle(fontSize: 32),
                ),
                const SizedBox(width: 12),
                Text(
                  '${weather.tempCelsius.round()}°C',
                  style: const TextStyle(
                      color: Colors.white54, fontSize: 24),
                ),
                const SizedBox(width: 8),
                Text(
                  weather.description,
                  style: const TextStyle(
                      color: Colors.white38, fontSize: 20),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

// ─── P-4: Pre-prayer signal overlay ─────────────────────────────────────────
//
// A subtle full-screen border pulse shown 5 minutes before each prayer.
// Three pulses of a green glow ring fade in and out over 6 seconds, then
// the overlay self-removes (controlled by parent via _signalPrayer state).

class TvPrePrayerSignal extends StatefulWidget {
  const TvPrePrayerSignal({super.key, required this.prayerName});
  final String prayerName;

  @override
  State<TvPrePrayerSignal> createState() => _TvPrePrayerSignalState();
}

class _TvPrePrayerSignalState extends State<TvPrePrayerSignal>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _pulse;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
    _pulse = CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulse,
      builder: (ctx, _) {
        final glow = _pulse.value;
        return Stack(
          fit: StackFit.expand,
          children: [
            // Outer glow ring.
            DecoratedBox(
              decoration: BoxDecoration(
                border: Border.all(
                  color: PrayCalcColors.mid
                      .withValues(alpha: 0.15 + glow * 0.40),
                  width: 3 + glow * 5,
                ),
                borderRadius: BorderRadius.circular(0),
                boxShadow: [
                  BoxShadow(
                    color: PrayCalcColors.light
                        .withValues(alpha: glow * 0.25),
                    blurRadius: 32,
                    spreadRadius: 8,
                  ),
                ],
              ),
            ),
            // Label at top-center.
            Positioned(
              top: 24,
              left: 0,
              right: 0,
              child: Center(
                child: AnimatedOpacity(
                  opacity: 0.6 + glow * 0.4,
                  duration: const Duration(milliseconds: 200),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 8),
                    decoration: BoxDecoration(
                      color:
                          PrayCalcColors.dark.withValues(alpha: 0.75),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: PrayCalcColors.mid
                            .withValues(alpha: 0.5 + glow * 0.5),
                      ),
                    ),
                    child: Text(
                      '${widget.prayerName} in 5 minutes',
                      style: TextStyle(
                        color: PrayCalcColors.light,
                        fontSize: 22,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
