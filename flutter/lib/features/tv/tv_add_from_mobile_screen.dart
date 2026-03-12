import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';

/// Smart backend base URL — same pattern as tv_pairing_screen.dart
String _smartBase() => (kDebugMode && kIsWeb)
    ? 'http://localhost:4010/api/v1/tv'
    : 'https://smart.praycalc.com/api/v1/tv';

/// Add TV from the mobile/web companion app.
///
/// REVERSED flow (app generates code, TV enters it):
///   1. This screen calls POST /app-code (authenticated) → gets a 4-digit code
///   2. Shows "Enter XXXX on your TV" with a countdown
///   3. Polls GET /app-code/:code/status every 3s
///   4. When status == 'activated' → TV is paired, show success screen
class TvAddFromMobileScreen extends StatefulWidget {
  const TvAddFromMobileScreen({super.key});

  @override
  State<TvAddFromMobileScreen> createState() => _TvAddFromMobileScreenState();
}

class _TvAddFromMobileScreenState extends State<TvAddFromMobileScreen> {
  _ScreenState _state = _ScreenState.loading;
  String _code = '';
  int _remaining = 300;
  String? _error;
  bool _activated = false;

  Timer? _pollTimer;
  Timer? _countdown;

  @override
  void initState() {
    super.initState();
    _fetchCode();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _countdown?.cancel();
    super.dispose();
  }

  /// Try multiple storage keys to find the user's auth JWT.
  Future<String?> _getAuthJwt() async {
    final prefs = await SharedPreferences.getInstance();
    // Try user JWT keys first, then fall back to TV session JWT
    return prefs.getString('user_jwt')
        ?? prefs.getString('access_token')
        ?? prefs.getString('nhost_access_token')
        ?? prefs.getString('tv_session_jwt');
  }

  Future<void> _fetchCode() async {
    setState(() { _state = _ScreenState.loading; _error = null; });

    final jwt = await _getAuthJwt();
    if (jwt == null || jwt.isEmpty) {
      setState(() {
        _state = _ScreenState.error;
        _error = 'You must be signed in to add a TV.';
      });
      return;
    }

    try {
      final res = await http.post(
        Uri.parse('${_smartBase()}/app-code'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $jwt',
        },
      ).timeout(const Duration(seconds: 10));

      if (res.statusCode != 200) {
        final body = jsonDecode(res.body) as Map<String, dynamic>;
        throw Exception((body['error'] as String?) ?? 'HTTP ${res.statusCode}');
      }

      final body = jsonDecode(res.body) as Map<String, dynamic>;
      final code = body['code'] as String? ?? '';
      if (code.isEmpty) throw Exception('No code returned');

      if (!mounted) return;
      setState(() {
        _code = code;
        _remaining = 300;
        _state = _ScreenState.showing;
        _activated = false;
      });

      _startCountdown();
      _startPoll(code, jwt);
    } catch (e) {
      if (mounted) {
        setState(() {
          _state = _ScreenState.error;
          _error = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  void _startCountdown() {
    _countdown?.cancel();
    _countdown = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        _remaining = (_remaining - 1).clamp(0, 300);
        if (_remaining <= 0) {
          _countdown?.cancel();
          _pollTimer?.cancel();
          if (!_activated) {
            _state = _ScreenState.error;
            _error = 'Code expired. Tap below to generate a new one.';
          }
        }
      });
    });
  }

  void _startPoll(String code, String jwt) {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) async {
      if (_activated || _remaining <= 0 || !mounted) {
        _pollTimer?.cancel();
        return;
      }
      try {
        final res = await http.get(
          Uri.parse('${_smartBase()}/app-code/$code/status'),
          headers: {'Authorization': 'Bearer $jwt'},
        ).timeout(const Duration(seconds: 5));

        if (res.statusCode != 200) return;
        final body = jsonDecode(res.body) as Map<String, dynamic>;
        final status = body['status'] as String?;

        if (status == 'activated' && mounted) {
          _pollTimer?.cancel();
          _countdown?.cancel();
          setState(() { _activated = true; _state = _ScreenState.success; });
        } else if (status == 'expired' && mounted) {
          _pollTimer?.cancel();
          _countdown?.cancel();
          setState(() {
            _state = _ScreenState.error;
            _error = 'Code expired. Tap below to try again.';
          });
        }
      } catch (_) {
        // network hiccup — keep polling
      }
    });
  }

  String get _timeLeft {
    final m = _remaining ~/ 60;
    final s = _remaining % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      appBar: AppBar(
        backgroundColor: PrayCalcColors.deep,
        foregroundColor: Colors.white,
        title: const Text(
          'Add TV',
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    return switch (_state) {
      _ScreenState.loading => _buildLoading(),
      _ScreenState.showing => _buildCodeDisplay(),
      _ScreenState.success => _buildSuccess(),
      _ScreenState.error   => _buildError(),
    };
  }

  Widget _buildLoading() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.only(top: 80),
        child: Column(
          children: [
            CircularProgressIndicator(color: PrayCalcColors.mid),
            SizedBox(height: 20),
            Text(
              'Generating code…',
              style: TextStyle(color: Colors.white54, fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCodeDisplay() {
    final isExpiringSoon = _remaining < 60;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 16),

        // Instruction card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: PrayCalcColors.dark.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
                color: PrayCalcColors.mid.withValues(alpha: 0.2)),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.tv, color: PrayCalcColors.mid, size: 28),
              SizedBox(height: 10),
              Text(
                'Open PrayCalc on your TV',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600),
              ),
              SizedBox(height: 4),
              Text(
                'On the TV pairing screen, select "Use the PrayCalc App" and enter the code below.',
                style: TextStyle(color: Colors.white60, fontSize: 14),
              ),
            ],
          ),
        ),

        const SizedBox(height: 36),

        const Text(
          'Enter this code on your TV:',
          style: TextStyle(color: Colors.white60, fontSize: 15),
        ),
        const SizedBox(height: 16),

        // Big code display
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
          decoration: BoxDecoration(
            color: PrayCalcColors.dark,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isExpiringSoon
                  ? Colors.orange.withAlpha(200)
                  : PrayCalcColors.mid,
              width: 2.5,
            ),
          ),
          child: Text(
            _code,
            style: TextStyle(
              color: isExpiringSoon ? Colors.orange : PrayCalcColors.light,
              fontSize: 72,
              fontWeight: FontWeight.bold,
              letterSpacing: 18,
              fontFamily: 'monospace',
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Countdown
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.timer_outlined,
              size: 16,
              color: isExpiringSoon ? Colors.orange : Colors.white38,
            ),
            const SizedBox(width: 6),
            Text(
              'Expires in $_timeLeft',
              style: TextStyle(
                color: isExpiringSoon ? Colors.orange : Colors.white38,
                fontSize: 14,
              ),
            ),
          ],
        ),

        const SizedBox(height: 32),

        // Waiting indicator
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: PrayCalcColors.mid,
                boxShadow: [
                  BoxShadow(
                      color: PrayCalcColors.mid.withAlpha(120),
                      blurRadius: 8),
                ],
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'Waiting for TV to connect…',
              style: TextStyle(color: Colors.white54, fontSize: 15),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSuccess() {
    return Column(
      children: [
        const SizedBox(height: 48),
        Container(
          width: 80,
          height: 80,
          decoration: const BoxDecoration(
              color: PrayCalcColors.dark, shape: BoxShape.circle),
          child: const Icon(Icons.check_rounded,
              color: PrayCalcColors.light, size: 44),
        ),
        const SizedBox(height: 24),
        const Text(
          'TV Connected!',
          style: TextStyle(
              color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          'Your TV is now paired to this account.\nPrayer times will appear shortly.',
          style: TextStyle(color: Colors.white54, fontSize: 16),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 40),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: () => context.go(Routes.pairedTvs),
            style: FilledButton.styleFrom(
              backgroundColor: PrayCalcColors.dark,
              foregroundColor: PrayCalcColors.light,
              padding: const EdgeInsets.symmetric(vertical: 18),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
            ),
            child: const Text('View My TVs',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }

  Widget _buildError() {
    return Column(
      children: [
        const SizedBox(height: 48),
        const Icon(Icons.error_outline, color: Colors.white24, size: 56),
        const SizedBox(height: 16),
        Text(
          _error ?? 'Something went wrong.',
          style: const TextStyle(color: Colors.white54, fontSize: 16),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: _fetchCode,
            style: FilledButton.styleFrom(
              backgroundColor: PrayCalcColors.dark,
              foregroundColor: PrayCalcColors.light,
              padding: const EdgeInsets.symmetric(vertical: 18),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
            ),
            child: const Text('Try Again',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }
}

enum _ScreenState { loading, showing, success, error }
