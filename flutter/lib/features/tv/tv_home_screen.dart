import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hijri/hijri_calendar.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../core/platform/device_tier.dart';
import '../../core/providers/geo_provider.dart';
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
import 'tv_good_night_overlay.dart';
import 'tv_geometric_pattern.dart';
import 'tv_jumuah_overlay.dart';
import 'tv_sky_background.dart';
import 'tv_adhan_dua_overlay.dart';
import 'tv_ayah_of_hour.dart';
import 'tv_iqamah_board.dart';
import 'tv_mode_switcher.dart';
import 'tv_ramadan_display.dart';
import 'tv_post_adhan_bar.dart';
import '../../core/services/tv_platform_config_service.dart';
import 'tv_children_mode.dart';
import 'tv_children_pin_screen.dart';
import 'tv_stream_library.dart';
import 'tv_stream_overlays.dart';
import 'tv_stream_player.dart';
import 'tv_quran_verse_display.dart';
import '../../core/services/tv_sse_service.dart';
import 'tv_quran_service.dart';

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
  static const _storage = FlutterSecureStorage();

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

  // ── Mode switcher (P-5) ────────────────────────────────────────────────────
  bool _modeSwitcherVisible = false;

  // ── Good Night mode (P-14): dimming overlay after Isha ────────────────────
  /// True when user explicitly dismissed the overlay (resets at midnight).
  bool _goodNightDismissed = false;
  DateTime _goodNightDismissedDate = DateTime(2000);

  // ── Children's mode (Y-1/Y-2) ─────────────────────────────────────────────
  bool _showChildrenPinScreen = false;

  // ── SSE service (L-5) — prayer_complete tracking ──────────────────────────
  TvSseService? _sseService;
  StreamSubscription<TvSseEvent>? _sseSub;
  final Set<String> _completedPrayers = {};

  // ── UX-A9: SSE connection indicator (debug mode only) ─────────────────────
  bool _sseConnected = false;

  // ── Settings polling — picks up location + commands pushed from web dashboard
  Timer? _settingsPollTimer;
  /// Hash of the last executed quranCommand — prevents re-executing on each poll.
  String? _lastQuranCommandHash;

  // ── UX-A8: Location-required state — shown after 60s of null city polls ────
  DateTime? _firstNullCityPoll;
  bool _showLocationRequired = false;

  // ── BUG-A6: Heartbeat consecutive failure tracking ─────────────────────────
  int _heartbeatFailures = 0;
  bool get _showConnectionBadge => _heartbeatFailures >= 3;

  // ── UX-A7: JWT near-expiry banner ──────────────────────────────────────────
  bool _jwtNearExpiry = false;

  // ── Quran background mode — set by remote play command ────────────────────
  /// 'keep-video': play Quran audio over existing video background.
  /// 'quran-display': replace left panel with per-ayat verse display.
  String _quranBackgroundMode = 'keep-video';

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
    _checkGuestMode();
    _startSseService();
    _startSettingsPoll();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _now = DateTime.now());
      _checkPrayerAlerts();
      _checkIdleAmbient();
    });
  }

  @override
  void dispose() {
    _ticker.cancel();
    _settingsPollTimer?.cancel();
    _focusNode.dispose();
    _snoozeTimer?.cancel();
    _iqamahTimer?.cancel();
    _muteButtonHideTimer?.cancel();
    _sseSub?.cancel();
    _sseService?.dispose();
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
      } catch (e, st) {
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

  // ─── SSE service startup (L-5) ────────────────────────────────────────────

  Future<void> _startSseService() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    final jwt = prefs.getString('tv_session_jwt');
    if (jwt == null || jwt.isEmpty) return;

    // Decode device_id from JWT payload (second base64url segment).
    String? deviceId;
    try {
      final parts = jwt.split('.');
      if (parts.length == 3) {
        final padded = parts[1].padRight((parts[1].length + 3) & ~3, '=');
        final payload =
            jsonDecode(utf8.decode(base64Url.decode(padded))) as Map<String, dynamic>;
        deviceId = payload['device_id'] as String?;
      }
    } catch (e, st) {
      // Malformed JWT — skip SSE.
    }
    if (deviceId == null || deviceId.isEmpty) return;

    final isLocal = kIsWeb &&
        (Uri.base.host == 'localhost' || Uri.base.host.startsWith('127.'));
    final smartBase =
        isLocal ? 'http://localhost:4010' : 'https://smart.praycalc.com';

    final svc = TvSseService(
      baseUrl: smartBase,
      deviceId: deviceId,
      token: jwt,
    );
    _sseService = svc;
    _sseSub = svc.events.listen((event) {
      if (event is TvSseConnectedEvent && mounted) {
        setState(() => _sseConnected = true);
      } else if (event is TvSseDisconnectedEvent && mounted) {
        setState(() => _sseConnected = false);
      } else if (event is TvSseSettingsEvent && mounted) {
        // Merge incoming settings patch into current state — never replace entirely,
        // because the SSE payload may be a partial push missing layoutSettings etc.
        try {
          final current = ref.read(tvSettingsProvider);
          final merged = Map<String, dynamic>.from(current.toJson())
            ..addAll(event.settingsJson
              ..remove('quranCommand')
              ..remove('location_lat')
              ..remove('location_lng')
              ..remove('location_city')
              ..remove('location_country')
              ..remove('location_state')
              ..remove('location_timezone'));
          ref.read(tvSettingsProvider.notifier).update(TvSettings.fromJson(merged));
        } catch (e, st) {
          // Malformed — keep existing settings.
        }
        // Apply city display name override without changing prayer time coordinates.
        final cityDisplayOverride = event.settingsJson['cityOverride'] as String?;
        if (cityDisplayOverride != null && cityDisplayOverride.isNotEmpty && mounted) {
          final currentCity = ref.read(cityProvider);
          if (currentCity != null && currentCity.name != cityDisplayOverride) {
            ref.read(cityProvider.notifier).state = City(
              name: cityDisplayOverride,
              country: '',
              state: null,
              lat: currentCity.lat,
              lng: currentCity.lng,
              timezone: currentCity.timezone,
            );
          }
        }
      } else if (event is TvSsePrayerCompleteEvent && mounted) {
        setState(() => _completedPrayers.add(event.prayerName));
      } else if (event is TvSseQuranCommandEvent && mounted) {
        final quranSvc = ref.read(tvQuranServiceProvider);
        switch (event.action) {
          case 'play':
            if (event.surah != null) {
              setState(() => _quranBackgroundMode = event.backgroundMode ?? 'keep-video');
              quranSvc.playSurah(event.surah!, startVerse: event.ayah ?? 1);
            }
          case 'pause':
            quranSvc.pause();
          case 'resume':
            quranSvc.resume();
          case 'stop':
            setState(() => _quranBackgroundMode = 'keep-video');
            quranSvc.pause();
          case 'next':
            quranSvc.nextVerse();
          case 'prev':
            quranSvc.prevVerse();
        }
      }
    });
    await svc.connect();
  }

  // ─── Settings polling — picks up location pushed from web dashboard ────────

  Future<void> _startSettingsPoll() async {
    // BUG-A7: Always cancel existing timer before creating a new one to prevent
    // accumulation if _startSettingsPoll() is ever called more than once.
    _settingsPollTimer?.cancel();
    // Initial poll immediately.
    await _pollSettings();
    // 5s when no city (setup screen visible), 30s when city is set.
    _settingsPollTimer = Timer.periodic(const Duration(seconds: 5), (_) async {
      await _pollSettings();
      // Once city is set, slow down to 30s intervals.
      if (ref.read(cityProvider) != null) {
        _settingsPollTimer?.cancel();
        _settingsPollTimer =
            Timer.periodic(const Duration(seconds: 10), (_) => _pollSettings());
      }
    });
  }

  Future<void> _pollSettings() async {
    final prefs = await ref.read(sharedPrefsProvider.future);
    final jwt = prefs.getString('tv_session_jwt');
    if (jwt == null || jwt.isEmpty) return;

    // UX-A7: Check if the JWT is within 24h of expiry and show a banner.
    final expiryStr = prefs.getString('tv_session_expiry');
    if (expiryStr != null) {
      final expiry = DateTime.tryParse(expiryStr);
      if (expiry != null && mounted) {
        final hoursLeft = expiry.difference(DateTime.now()).inHours;
        final nearExpiry = hoursLeft <= 24 && hoursLeft >= 0;
        if (nearExpiry != _jwtNearExpiry) {
          setState(() => _jwtNearExpiry = nearExpiry);
        }
      }
    }

    String? deviceId;
    try {
      final parts = jwt.split('.');
      if (parts.length == 3) {
        final padded = parts[1].padRight((parts[1].length + 3) & ~3, '=');
        final payload =
            jsonDecode(utf8.decode(base64Url.decode(padded))) as Map<String, dynamic>;
        deviceId = payload['device_id'] as String?;
      }
    } catch (e, st) {
      debugPrint('[TvHome] JWT decode error: $e\n$st');
      return;
    }
    if (deviceId == null || deviceId.isEmpty) return;

    final isLocal = kIsWeb &&
        (Uri.base.host == 'localhost' || Uri.base.host.startsWith('127.'));
    final smartBase =
        isLocal ? 'http://localhost:4010' : 'https://smart.praycalc.com';

    // Heartbeat — tells the dashboard this TV is online.
    // Include current location so the web dashboard can display it.
    final city = ref.read(cityProvider);
    final heartbeatBody = <String, dynamic>{
      'device_id': deviceId,
      'screen_state': 'home',
      if (city != null) ...{
        'location_city': city.name,
        'location_country': city.country,
        'location_lat': city.lat,
        'location_lng': city.lng,
        'location_timezone': city.timezone,
      },
    };
    // BUG-A6: Track heartbeat failures so UI can show a connection badge.
    try {
      final hbResp = await http.post(
        Uri.parse('$smartBase/api/v1/tv/heartbeat'),
        headers: {'Authorization': 'Bearer $jwt', 'Content-Type': 'application/json'},
        body: jsonEncode(heartbeatBody),
      ).timeout(const Duration(seconds: 8));
      if (mounted && hbResp.statusCode == 200 && _heartbeatFailures > 0) {
        setState(() => _heartbeatFailures = 0);
      } else if (hbResp.statusCode != 200 && mounted) {
        setState(() => _heartbeatFailures++);
      }
    } catch (e, st) {
      if (mounted) setState(() => _heartbeatFailures++);
    }

    try {
      final resp = await http.get(
        Uri.parse('$smartBase/api/v1/tv/$deviceId/settings'),
        headers: {'Authorization': 'Bearer $jwt'},
      );
      if (resp.statusCode != 200) return;
      final body = jsonDecode(resp.body) as Map<String, dynamic>;
      final settings = body['settings'] as Map<String, dynamic>?;
      if (settings == null) return;

      final lat = (settings['location_lat'] as num?)?.toDouble();
      final lng = (settings['location_lng'] as num?)?.toDouble();
      final cityName = settings['location_city'] as String?;
      final country = settings['location_country'] as String?;
      final state = settings['location_state'] as String?;
      final tz = settings['location_timezone'] as String? ?? 'UTC';

      if (lat != null && lng != null && cityName != null && mounted) {
        final city = City(
          name: cityName,
          country: country ?? '',
          state: state,
          lat: lat,
          lng: lng,
          timezone: tz,
        );
        // Persist so the city survives page refreshes (loadLastCity in main).
        await persistCity(city, ref);
        ref.read(cityProvider.notifier).state = city;
        // UX-A8: City resolved — clear location-required state.
        if (_showLocationRequired || _firstNullCityPoll != null) {
          setState(() {
            _showLocationRequired = false;
            _firstNullCityPoll = null;
          });
        }
      } else if (ref.read(cityProvider) == null && mounted) {
        // UX-A8: No city from server and none cached — track how long we've waited.
        _firstNullCityPoll ??= DateTime.now();
        final waited = DateTime.now().difference(_firstNullCityPoll!);
        if (waited.inSeconds >= 60 && !_showLocationRequired) {
          setState(() => _showLocationRequired = true);
        }
      }

      // City display name override — changes only what's shown on screen without
      // altering prayer time coordinates. Applied last so it wins over location_city.
      final cityDisplayOverride = settings['cityOverride'] as String?;
      if (cityDisplayOverride != null && cityDisplayOverride.isNotEmpty && mounted) {
        final currentCity = ref.read(cityProvider);
        if (currentCity != null && currentCity.name != cityDisplayOverride) {
          ref.read(cityProvider.notifier).state = City(
            name: cityDisplayOverride,
            // Clear state/country so the display shows just the override name
            // without ", OH" or ", United States" suffix.
            country: '',
            state: null,
            lat: currentCity.lat,
            lng: currentCity.lng,
            timezone: currentCity.timezone,
          );
        }
      }

      // Apply TV display settings pushed from web dashboard.
      // Only update if server has meaningful settings (not just location data).
      final hasDisplaySettings = settings.containsKey('tvAudioMode') ||
          settings.containsKey('videoAreaSource') ||
          settings.containsKey('selectedStreamId') ||
          settings.containsKey('layoutSettings') ||
          settings.containsKey('layout');
      if (hasDisplaySettings && mounted) {
        try {
          final current = ref.read(tvSettingsProvider);

          // ARCH-A5: Conflict resolution — local wins if it was modified more
          // recently than the server copy. This prevents a stale server
          // snapshot from overwriting in-flight local edits.
          final remoteTs = settings['last_modified'] as String?;
          final remoteModified = remoteTs != null
              ? DateTime.tryParse(remoteTs)?.toUtc()
              : null;
          final localModified = current.lastModified?.toUtc();
          final localIsNewer = localModified != null &&
              remoteModified != null &&
              localModified.isAfter(remoteModified);
          if (localIsNewer) {
            // Local settings are fresher — skip this server snapshot.
            // The next push from the web dashboard will carry the updated
            // last_modified and will win once the user's edit is committed.
          } else {
            // Merge: start from current TV settings, overlay what server sent.
            final merged = Map<String, dynamic>.from(current.toJson())
              ..addAll(settings..remove('quranCommand')..remove('location_lat')
                ..remove('location_lng')..remove('location_city')
                ..remove('location_country')..remove('location_state')
                ..remove('location_timezone'));
            ref.read(tvSettingsProvider.notifier).update(TvSettings.fromJson(merged));
          }
        } catch (e, st) {
          // Malformed — keep existing settings.
        }
      }

      // Handle quranCommand pushed from web dashboard.
      final rawCmd = settings['quranCommand'];
      if (rawCmd is Map<String, dynamic> && mounted) {
        final cmdHash = jsonEncode(rawCmd);
        if (cmdHash != _lastQuranCommandHash) {
          _lastQuranCommandHash = cmdHash;
          final action = rawCmd['action'] as String?;
          final surahNum = (rawCmd['surah'] as num?)?.toInt();
          final ayahNum = (rawCmd['ayah'] as num?)?.toInt() ?? 1;
          final reciterId = rawCmd['reciterId'] as String?;
          final bgMode = rawCmd['backgroundMode'] as String? ?? 'keep-video';
          final quranSvc = ref.read(tvQuranServiceProvider);
          if (action == 'play' && surahNum != null) {
            if (reciterId != null) {
              final reciter = kTvReciters.firstWhere(
                (r) => r.id == reciterId,
                orElse: () => kTvReciters.firstWhere(
                  (r) => r.id == 'Sudais_192kbps',
                  orElse: () => kTvReciters.first,
                ),
              );
              quranSvc.setReciter(reciter);
            }
            if (mounted) setState(() => _quranBackgroundMode = bgMode);
            unawaited(quranSvc.playSurah(surahNum, startVerse: ayahNum));
          } else if (action == 'pause') {
            unawaited(quranSvc.pause());
          } else if (action == 'resume') {
            unawaited(quranSvc.resume());
          } else if (action == 'stop') {
            if (mounted) setState(() => _quranBackgroundMode = 'keep-video');
            unawaited(quranSvc.pause());
          }
        }
      }
    } catch (e, st) {
      debugPrint('[TvHome] settings poll error (will retry): $e\n$st');
    }
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
    // Menu/Guide key toggles the mode switcher (P-5).
    if (key == LogicalKeyboardKey.contextMenu ||
        key == LogicalKeyboardKey.f10) {
      setState(() => _modeSwitcherVisible = !_modeSwitcherVisible);
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
    final rawTvSettings = ref.watch(tvSettingsProvider);
    // Always watch these providers unconditionally so Riverpod tracks them
    // consistently across builds — avoids assertion when city first becomes non-null.
    final quranSvc = ref.watch(tvQuranServiceProvider);

    // PERF-C1: Disable expensive effects on low-end devices (Fire TV Stick Lite etc.)
    final isLowEnd = ref.watch(isLowEndDeviceProvider).valueOrNull ?? false;
    final tvSettings = isLowEnd
        ? rawTvSettings.copyWith(
            skyBackgroundEnabled: false,
            geometricPatternEnabled: false,
            slideshowTransition: 'crossfade',
          )
        : rawTvSettings;

    // Keep a single consistent widget tree regardless of city being null or not.
    // _buildBody handles the null case via timesAsync.when(loading:) which
    // returns AsyncLoading when city==null — avoiding a Scaffold-level swap
    // that crashes on Flutter web profile/release builds.
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) => _onBackInvoked(),
      child: Scaffold(
      backgroundColor: tvSettings.skyBackgroundEnabled && city != null
          ? Colors.transparent
          : PrayCalcColors.deep,
      body: Stack(
        fit: StackFit.expand,
        children: [
          tvSettings.skyBackgroundEnabled && city != null
              ? TvSkyBackground(
                  hour: _nowH,
                  child: _buildBody(
                      tvSettings, timesAsync, city, settings, ramadan, quranSvc),
                )
              : _buildBody(tvSettings, timesAsync, city, settings, ramadan, quranSvc),
          // Mode switcher overlay (P-5).
          if (_modeSwitcherVisible)
            TvModeSwitcher(
              currentPreset: tvSettings.layoutSettings.preset,
              onDismiss: () => setState(() => _modeSwitcherVisible = false),
            ),
          // BUG-A6: Connection issue badge — shown after 3 consecutive heartbeat failures.
          if (_showConnectionBadge)
            Positioned(
              top: 16,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withAlpha(180),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.orange.withAlpha(200), width: 1),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.wifi_off_rounded, color: Colors.orange, size: 14),
                    SizedBox(width: 6),
                    Text(
                      'Connection issue',
                      style: TextStyle(color: Colors.orange, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
          // UX-A7: JWT near-expiry banner — shown 24h before expiry.
          if (_jwtNearExpiry)
            Positioned(
              top: _showConnectionBadge ? 56 : 16,
              left: 16,
              right: 16,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.black.withAlpha(200),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                        color: Colors.amber.withAlpha(200), width: 1),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.warning_amber_rounded,
                          color: Colors.amber, size: 14),
                      SizedBox(width: 8),
                      Text(
                        'Connection expiring soon — open PrayCalc to renew',
                        style: TextStyle(color: Colors.amber, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          // UX-A8: Location required overlay — shown after 60s of continuous null city polls.
          if (_showLocationRequired)
            Positioned.fill(
              child: Container(
                color: Colors.black.withValues(alpha: 0.75),
                child: Center(
                  child: Container(
                    width: 420,
                    padding: const EdgeInsets.all(36),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A1A2E),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.12), width: 1),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.location_off_rounded,
                            color: Colors.white54, size: 48),
                        const SizedBox(height: 20),
                        const Text(
                          'No location set',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Visit your dashboard to set a location\nfor accurate prayer times.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white60,
                            fontSize: 15,
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 24),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'praycalc.com/dashboard',
                            style: TextStyle(
                              color: Colors.black87,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          // UX-A9: SSE connection indicator dot — debug builds only.
          if (kDebugMode)
            Positioned(
              left: 12,
              bottom: 12,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _sseConnected ? Colors.greenAccent : Colors.redAccent,
                    ),
                  ),
                  const SizedBox(width: 5),
                  Text(
                    _sseConnected ? 'SSE' : 'SSE off',
                    style: const TextStyle(
                      color: Colors.white38,
                      fontSize: 10,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
          // S-3: Attribution text from platform config (bottom-right corner).
          Positioned(
            right: 16,
            bottom: 8,
            child: ListenableBuilder(
              listenable: TvPlatformConfigService.instance,
              builder: (context, _) {
                final text =
                    TvPlatformConfigService.instance.config.attributionText;
                if (text.isEmpty) return const SizedBox.shrink();
                return Text(
                  text,
                  style: const TextStyle(
                    color: Color(0x40FFFFFF),
                    fontSize: 11,
                    letterSpacing: 0.3,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    ),  // end Scaffold
  );  // end PopScope
  }  // end build

  Widget _buildBody(TvSettings tvSettings, AsyncValue<PrayerTimes> timesAsync,
      City? city, AppSettings settings, RamadanState ramadan,
      TvQuranService quranSvc) {
    final inner = FocusTraversalGroup(
        policy: OrderedTraversalPolicy(),
        child: KeyboardListener(
          focusNode: _focusNode,
          autofocus: true,
          onKeyEvent: _onKey,
          child: timesAsync.when(
            // AsyncLoading fires when city==null. Fall back to Mecca prayer
            // times so the TV always shows a useful display right after pairing.
            // The "Set location" banner inside _TvHomeBody prompts the user.
            loading: () {
              try {
                final now = DateTime.now();
                final date = DateTime.utc(now.year, now.month, now.day, 12);
                final meccaTimes = getTimes(date, 21.4225, 39.8262, 3.0);
                final activeIdx = _activePrayerIndex(meccaTimes);
                final nextIdx = _nextPrayerIndex(meccaTimes);
                return _TvHomeBody(
                  times: meccaTimes,
                  now: now,
                  nowH: now.hour + now.minute / 60.0,
                  city: null, // null → shows "Set location" in top bar
                  settings: ref.read(settingsProvider),
                  tvSettings: tvSettings,
                  ramadan: ref.read(ramadanProvider),
                  activeIdx: activeIdx,
                  nextIdx: nextIdx,
                  countdown: _countdownString(meccaTimes, nextIdx),
                  streamMuted: _streamMuted,
                  muteButtonVisible: _muteButtonVisible,
                  onToggleMute: _toggleMute,
                  formatH: _formatH,
                  quranSvc: quranSvc,
                  quranBackgroundMode: _quranBackgroundMode,
                );
              } catch (e) {
                return _TvNoLocationLayout(
                  tvSettings: tvSettings,
                  streamMuted: _streamMuted,
                  muteButtonVisible: _muteButtonVisible,
                  onToggleMute: _toggleMute,
                );
              }
            },
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
                      quranSvc: quranSvc,
                      quranBackgroundMode: _quranBackgroundMode,
                      completedPrayers: Set<String>.unmodifiable(_completedPrayers),
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

              // ── Children's mode (Y-1/Y-2/Y-3) ──────────────────────
              if (tvSettings.childrenModeEnabled) {
                if (_showChildrenPinScreen) {
                  body = Stack(
                    fit: StackFit.expand,
                    children: [
                      body,
                      TvChildrenPinScreen(
                        onSuccess: () =>
                            setState(() => _showChildrenPinScreen = false),
                        onCancel: () =>
                            setState(() => _showChildrenPinScreen = false),
                      ),
                    ],
                  );
                } else {
                  final currentPrayerName = activeIdx >= 0 && activeIdx < _prayers.length
                      ? _prayers[activeIdx].label
                      : '';
                  final nextPrayerName = nextIdx >= 0 && nextIdx < _prayers.length
                      ? _prayers[nextIdx].label
                      : '';
                  body = Stack(
                    fit: StackFit.expand,
                    children: [
                      body,
                      TvChildrenMode(
                        currentPrayer: currentPrayerName,
                        nextPrayer: nextPrayerName,
                        nextPrayerCountdown: _countdownString(times, nextIdx),
                        onExitRequested: () =>
                            setState(() => _showChildrenPinScreen = true),
                      ),
                    ],
                  );
                }
              }

              // ── Quran verse display (Z-TV-4) ─────────────────────────
              // In 'keep-video' mode: overlay verse display on top of video.
              // In 'quran-display' mode: left panel already shows verse display,
              //   so no overlay needed here.
              if (quranSvc.isPlaying && _quranBackgroundMode == 'keep-video') {
                body = Stack(
                  fit: StackFit.expand,
                  children: [
                    body,
                    TvQuranVerseDisplay(service: quranSvc),
                  ],
                );
              }

              return body;
            },
          ),
        ),
    );
    if (!tvSettings.geometricPatternEnabled) return inner;
    final style = switch (tvSettings.geometricPatternStyle) {
      'girih' => TvGeometricStyle.girih,
      'muqarnas' => TvGeometricStyle.muqarnas,
      'kufic' => TvGeometricStyle.kufic,
      'isometric' => TvGeometricStyle.isometric,
      _ => TvGeometricStyle.moroccanStar,
    };
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
    } catch (e) {
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
    required this.quranSvc,
    required this.quranBackgroundMode,
    this.completedPrayers = const {},
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
  final TvQuranService quranSvc;
  final String quranBackgroundMode;
  final Set<String> completedPrayers;

  @override
  Widget build(BuildContext context) {
    final moonResult = MoonPhase.calculate(now);
    final hijri = _hijriDateString(now);
    final size = MediaQuery.sizeOf(context);
    final fs = tvSettings.tvFontScale;

    // Layout preset — drives which panels are visible.
    final preset = tvSettings.layoutSettings.preset;
    final leftPanel = tvSettings.layoutSettings.leftPanel;

    // Prayer-only and Masjid: no left panel — right panel fills full width.
    final isPrayerOnly = preset == TvLayoutPreset.prayerOnly ||
        preset == TvLayoutPreset.masjid;

    // Right panel width: clamped column normally, full screen for prayer-only.
    final rightW = isPrayerOnly
        ? size.width
        : (size.width * 0.25).clamp(280.0, 480.0);

    // Live stream panel config.
    // Show stream when leftPanel == liveStream AND videoAreaSource or legacy mode.
    final showStream = !isPrayerOnly &&
        leftPanel == TvPanelType.liveStream &&
        (tvSettings.videoAreaSource == 'live-stream' ||
            tvSettings.tvAudioMode == 'stream');
    TvStream? activeStream;
    if (showStream) {
      try {
        activeStream = kBuiltInStreams.firstWhere(
            (s) => s.id == tvSettings.selectedStreamId);
      } catch (e) {
        activeStream = kBuiltInStreams.first;
      }
    }

    // ── Right panel: city + dates + weather + clock + prayer rows ───────────
    final rightPanel = _TvRightPanel(
      width: rightW,
      city: city,
      hijri: hijri,
      gregorian: _gregorianLabel(now),
      now: now,
      times: times,
      activeIdx: activeIdx,
      nextIdx: nextIdx,
      formatH: formatH,
      use24h: settings.use24h,
      isRamadan: ramadan.isRamadan,
      completedPrayers: completedPrayers,
      fontScale: fs,
      moonResult: moonResult,
      tvSettings: tvSettings,
      countdown: countdown,
    );

    // ── Left panel: ambient area ─────────────────────────────────────────────
    Widget leftContent;
    final nextPrayerName = nextIdx >= 0 && nextIdx < _prayers.length
        ? _prayers[nextIdx].label
        : 'Next';

    if (showStream && activeStream != null) {
      // Vertical layout: 16:9 video at top → ayah bar → context bar.
      // Using AspectRatio so the video fills its container with no letterbox.
      final nextPrayerH = nextIdx >= 0 && nextIdx < _prayers.length
          ? _prayers[nextIdx].getValue(times)
          : times.maghrib;
      leftContent = Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 16:9 video — natural height = left_width × 9/16.
          AspectRatio(
            aspectRatio: 16 / 9,
            child: TvStreamPlayer(stream: activeStream, muted: streamMuted),
          ),
          // Middle: ayah bar (Expanded fills all remaining space).
          Expanded(
            child: tvSettings.showStreamAyahBar
                ? const Padding(
                    padding: EdgeInsets.fromLTRB(16, 12, 16, 8),
                    child: TvStreamAyahBar(),
                  )
                : const SizedBox.shrink(),
          ),
          // Bottom: always-present context bar (next prayer or Ramadan info).
          TvStreamContextBar(
            isRamadan: ramadan.isRamadan,
            ramadan: ramadan,
            nextPrayerName: nextPrayerName,
            nextPrayerH: nextPrayerH,
            suhoorTime: formatH(times.fajr, settings.use24h),
            iftarTime: formatH(times.maghrib, settings.use24h),
            fajrH: times.fajr,
            maghribH: times.maghrib,
            now: now,
          ),
        ],
      );
    } else if (quranSvc.isPlaying && quranBackgroundMode == 'quran-display') {
      // Quran playing in quran-display mode: replace left panel with verse display.
      leftContent = TvQuranVerseDisplay(service: quranSvc);
    } else {
      // Default ambient: large Quranic verse (ayah of the hour) centered.
      leftContent = _TvAmbientArea(
        hour: now.hour,
        ramadan: ramadan,
        times: times,
        settings: settings,
        countdown: countdown,
        nowH: nowH,
        nextPrayerName: nextPrayerName,
        tvSettings: tvSettings,
        city: city,
        formatH: formatH,
      );
    }

    return SafeArea(
      child: Stack(
        children: [
          // ── Main layout ──────────────────────────────────────────────────
          // Prayer-only / Masjid: single full-width panel. All other presets:
          // two-column Row with left content + fixed-width right panel.
          if (isPrayerOnly)
            rightPanel
          else
            Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(child: leftContent),
                rightPanel,
              ],
            ),

          // ── Mute overlay button (stream mode) ───────────────────────────
          if (muteButtonVisible && showStream)
            Positioned(
              top: 24,
              right: rightW + 16,
              child: AnimatedOpacity(
                opacity: 1.0,
                duration: const Duration(milliseconds: 300),
                child: GestureDetector(
                  onTap: onToggleMute,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 10),
                    decoration: BoxDecoration(
                      color: PrayCalcColors.deep.withAlpha(220),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: PrayCalcColors.mid, width: 1),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          streamMuted ? Icons.volume_off : Icons.volume_up,
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
    } catch (e) {
      return '';
    }
  }
}

// ─── Right panel ───────────────────────────────────────────────────────────
// City · Hijri/Greg dates · weather · big clock · prayer rows

class _TvRightPanel extends ConsumerWidget {
  const _TvRightPanel({
    required this.width,
    required this.city,
    required this.hijri,
    required this.gregorian,
    required this.now,
    required this.times,
    required this.activeIdx,
    required this.nextIdx,
    required this.formatH,
    required this.use24h,
    required this.isRamadan,
    required this.completedPrayers,
    required this.fontScale,
    required this.moonResult,
    required this.tvSettings,
    required this.countdown,
  });

  final double width;
  final City? city;
  final String hijri;
  final String gregorian;
  final DateTime now;
  final PrayerTimes times;
  final int activeIdx;
  final int nextIdx;
  final String Function(double h, bool use24h) formatH;
  final bool use24h;
  final bool isRamadan;
  final Set<String> completedPrayers;
  final double fontScale;
  final MoonPhaseResult moonResult;
  final TvSettings tvSettings;
  final String countdown;

  static String _cityDisplayName(City? city) {
    if (city == null) return 'Set location';
    final state = city.state?.toUpperCase();
    if (state != null && state.isNotEmpty) return '${city.name}, $state';
    if (city.country.isNotEmpty) return '${city.name}, ${city.country}';
    return city.name;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final weather = ref.watch(weatherProvider);
    final fs = fontScale;

    return Container(
      width: width,
      decoration: const BoxDecoration(
        border: Border(
          left: BorderSide(color: Color(0xFF1E5E2F), width: 1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Header: city + dates ────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0xFF1E5E2F), width: 1),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // City name
                Text(
                  _cityDisplayName(city),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: city != null ? Colors.white : Colors.white38,
                    fontSize: 22 * fs,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.3,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                // Hijri date
                Text(
                  hijri,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: PrayCalcColors.light,
                    fontSize: 14 * fs,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                // Gregorian date
                Text(
                  gregorian,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white54,
                    fontSize: 13 * fs,
                  ),
                ),
                // Weather row
                if (weather != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        weather.icon,
                        style: TextStyle(fontSize: 16 * fs),
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          '${weather.tempCelsius.round()}°C  ${weather.description}',
                          style: TextStyle(
                            color: Colors.white60,
                            fontSize: 13 * fs,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          // ── Clock ───────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
            child: Center(
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF080808),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFF1A1A1A),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(120),
                      blurRadius: 16,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: _TvCurrentTime(now: now, use24h: use24h),
              ),
            ),
          ),

          // ── Prayer rows ─────────────────────────────────────────────
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 8),
              child: _TvPrayerRows(
                times: times,
                activeIdx: activeIdx,
                nextIdx: nextIdx,
                formatH: formatH,
                use24h: use24h,
                isRamadan: isRamadan,
                completedPrayers: completedPrayers,
                fontScale: fs,
                countdown: countdown,
                showPrayerCountdown:
                    tvSettings.infoBarConfig.showPrayerCountdown,
              ),
            ),
          ),

          // ── Moon phase ──────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 16),
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: Color(0xFF1E5E2F), width: 1),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    '${MoonPhase.phaseName(moonResult.phase)}  '
                    '${moonResult.illuminationPct.round()}%',
                    style: TextStyle(color: Colors.white38, fontSize: 12 * fs),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  MoonPhase.phaseEmoji(moonResult.phase),
                  style: TextStyle(fontSize: 18 * fs),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Prayer rows ───────────────────────────────────────────────────────────
// Vertical list of prayers matching the web app's prayer-row style.

class _TvPrayerRows extends StatelessWidget {
  const _TvPrayerRows({
    required this.times,
    required this.activeIdx,
    required this.nextIdx,
    required this.formatH,
    required this.use24h,
    required this.isRamadan,
    required this.completedPrayers,
    required this.fontScale,
    required this.countdown,
    required this.showPrayerCountdown,
  });

  final PrayerTimes times;
  final int activeIdx;
  final int nextIdx;
  final String Function(double h, bool use24h) formatH;
  final bool use24h;
  final bool isRamadan;
  final Set<String> completedPrayers;
  final double fontScale;
  final String countdown;
  final bool showPrayerCountdown;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (int i = 0; i < _prayers.length; i++) _buildRow(i),
      ],
    );
  }

  Widget _buildRow(int i) {
    final meta = _prayers[i];
    final h = meta.getValue(times);
    final timeStr = h.isFinite ? formatH(h, use24h) : '--:--';
    final isCurrent = i == activeIdx;
    final isPast = !isCurrent && nextIdx > 0 && i < nextIdx;
    final isDone = completedPrayers.contains(meta.label);
    final fs = fontScale;

    // Ramadan subtitle (Suhoor under Fajr, Iftar under Maghrib)
    String? ramadanSub;
    if (isRamadan) {
      if (meta.label == 'Fajr') ramadanSub = 'Suhoor';
      if (meta.label == 'Maghrib') ramadanSub = 'Iftar';
    }

    final nameColor = isCurrent
        ? Colors.white
        : isPast
            ? Colors.white30
            : Colors.white70;
    final timeColor = isCurrent
        ? PrayCalcColors.light
        : isPast
            ? Colors.white24
            : Colors.white60;

    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          color: isCurrent
              ? PrayCalcColors.dark.withAlpha(120)
              : Colors.transparent,
          border: isCurrent
              ? const Border(
                  left: BorderSide(color: PrayCalcColors.mid, width: 3),
                )
              : null,
        ),
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4 * fs),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Prayer name + optional Ramadan subtitle
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    meta.label,
                    style: TextStyle(
                      color: nameColor,
                      fontSize: 17 * fs,
                      fontWeight: isCurrent
                          ? FontWeight.w600
                          : FontWeight.normal,
                    ),
                  ),
                  if (ramadanSub != null)
                    Text(
                      ramadanSub,
                      style: TextStyle(
                        color: PrayCalcColors.light.withAlpha(180),
                        fontSize: 11 * fs,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                ],
              ),
            ),
            // Time / check / countdown
            if (isDone)
              Icon(Icons.check_circle,
                  color: PrayCalcColors.mid, size: 14 * fs)
            else if (i == nextIdx && showPrayerCountdown)
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    timeStr,
                    style: TextStyle(
                      color: timeColor,
                      fontSize: 18 * fs,
                      fontWeight: FontWeight.normal,
                    ),
                  ),
                  Text(
                    countdown,
                    style: TextStyle(
                      color: PrayCalcColors.light,
                      fontSize: 11 * fs,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              )
            else
              Text(
                timeStr,
                style: TextStyle(
                  color: timeColor,
                  fontSize: 18 * fs,
                  fontWeight:
                      isCurrent ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ─── Ambient left area ─────────────────────────────────────────────────────
// Default: large Quranic verse (ayah of the hour) + optional Ramadan card.

class _TvAmbientArea extends StatelessWidget {
  const _TvAmbientArea({
    required this.hour,
    required this.ramadan,
    required this.times,
    required this.settings,
    required this.countdown,
    required this.nowH,
    required this.nextPrayerName,
    required this.tvSettings,
    required this.city,
    required this.formatH,
  });

  final int hour;
  final RamadanState ramadan;
  final PrayerTimes times;
  final AppSettings settings;
  final String countdown;
  final double nowH;
  final String nextPrayerName;
  final TvSettings tvSettings;
  final City? city;
  final String Function(double h, bool use24h) formatH;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Centered ayah
        Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 32),
            child: TvAyahOfHour(hour: hour),
          ),
        ),

        // Ramadan card — bottom-left overlay
        if (ramadan.isRamadan)
          Positioned(
            left: 32,
            bottom: 32,
            child: TvRamadanDisplay(
              ramadan: ramadan,
              suhoorTime: formatH(times.fajr, settings.use24h),
              iftarTime: formatH(times.maghrib, settings.use24h),
              countdown: countdown,
              countdownLabel: ramadan.isRamadan && nextPrayerName == 'Fajr'
                  ? 'Until Suhoor ends'
                  : ramadan.isRamadan && nextPrayerName == 'Maghrib'
                      ? 'Until Iftar'
                      : 'Until $nextPrayerName',
            ),
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
    final periodStr = _periodStr();
    return Semantics(
      label: 'Current time: $timeStr',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.baseline,
        textBaseline: TextBaseline.alphabetic,
        children: [
          Text(
            timeStr,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 42,
              fontWeight: FontWeight.w300,
              letterSpacing: -1,
              fontFeatures: [FontFeature.tabularFigures()],
            ),
          ),
          if (periodStr != null) ...[
            const SizedBox(width: 4),
            Text(
              periodStr,
              style: const TextStyle(
                color: Colors.white54,
                fontSize: 16,
                fontWeight: FontWeight.w400,
              ),
            ),
          ],
        ],
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
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:$mm:$ss';
  }

  String? _periodStr() {
    if (use24h) return null;
    return now.hour >= 12 ? 'PM' : 'AM';
  }
}

// ─── No-location split layout ────────────────────────────────────────────────
//
// Shown when city==null. Shows Mecca Live stream on the left and a set-location
// prompt on the right, matching the normal TV home layout so the screen looks
// polished immediately after pairing.

class _TvNoLocationLayout extends StatelessWidget {
  const _TvNoLocationLayout({
    required this.tvSettings,
    required this.streamMuted,
    required this.muteButtonVisible,
    required this.onToggleMute,
  });

  final TvSettings tvSettings;
  final bool streamMuted;
  final bool muteButtonVisible;
  final VoidCallback onToggleMute;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 32),
        child: Row(
          children: [
            // Left: Islamic geometric pattern + Quran verse — works immediately
            // without a live stream or network dependency.
            Expanded(
              child: TvGeometricPattern(
                style: TvGeometricStyle.moroccanStar,
                opacity: 0.35,
                child: Center(
                  child: TvAyahOfHour(hour: DateTime.now().hour),
                ),
              ),
            ),
            // Right: set-location prompt.
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset('assets/brand/logo.png', height: 56),
                  const SizedBox(height: 40),
                  const Icon(Icons.location_on_outlined,
                      color: PrayCalcColors.mid, size: 56),
                  const SizedBox(height: 20),
                  const Text(
                    'No location set',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Open PrayCalc on your phone or at',
                    style: TextStyle(color: Colors.white54, fontSize: 18),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'praycalc.com/dashboard/tvs',
                    style: TextStyle(
                      color: Color(0xFFC9F27A),
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Sign in and tap "Set location" for this TV.',
                    style: TextStyle(color: Colors.white54, fontSize: 18),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── No-location setup screen ────────────────────────────────────────────────
//
// Kept as fallback. Shown on TvHomeScreen when cityProvider is null (no
// location configured). Instructs the user to open the web dashboard.

class _TvNoLocationScreen extends StatefulWidget {
  @override
  State<_TvNoLocationScreen> createState() => _TvNoLocationScreenState();
}

class _TvNoLocationScreenState extends State<_TvNoLocationScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulse;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Green radial glow (same as pairing screen)
        CustomPaint(painter: _GlowPainterNL()),
        Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.asset('assets/brand/logo.png', height: 64),
              const SizedBox(height: 48),
              const Icon(Icons.location_on_outlined,
                  color: PrayCalcColors.mid, size: 64),
              const SizedBox(height: 24),
              const Text(
                'No location configured',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'To get started, open PrayCalc on your phone or at',
                style: TextStyle(color: Colors.white54, fontSize: 20),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              const Text(
                'praycalc.com/dashboard/tvs',
                style: TextStyle(
                  color: Color(0xFFC9F27A),
                  fontSize: 22,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.3,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              const Text(
                'Sign in with the same account, find this TV, and tap "Set location".',
                style: TextStyle(color: Colors.white54, fontSize: 20),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              AnimatedBuilder(
                animation: _pulse,
                builder: (context2, child2) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                  decoration: BoxDecoration(
                    color: PrayCalcColors.dark.withAlpha(200),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(
                      color: PrayCalcColors.mid.withValues(alpha: 0.3 + _pulse.value * 0.4),
                      width: 1.5,
                    ),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.sync, color: PrayCalcColors.mid, size: 18),
                      SizedBox(width: 8),
                      Text(
                        'Checking for location…',
                        style: TextStyle(color: Colors.white60, fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _GlowPainterNL extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..shader = RadialGradient(
        center: Alignment.bottomCenter,
        radius: 0.8,
        colors: [
          const Color(0xFF1E5E2F).withAlpha(180),
          const Color(0xFF0D2F17).withAlpha(60),
          Colors.transparent,
        ],
        stops: const [0.0, 0.5, 1.0],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
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
