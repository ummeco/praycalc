import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const _kTvSessionJwt = 'tv_session_jwt';
const _kTvSessionExpiry = 'tv_session_expiry';

String _smartBase() {
  if (kIsWeb) {
    final host = Uri.base.host;
    if (host == 'localhost' || host.startsWith('127.')) {
      return 'http://localhost:4010/api/v1/tv';
    }
  }
  return 'https://smart.praycalc.com/api/v1/tv';
}

String _devLoginUrl() => 'http://localhost:3041/api/dev/login';

// ---------------------------------------------------------------------------
// TV Pairing Screen
//
// New reversed flow:
//   1. User opens PrayCalc app → Settings → My TVs → Add TV → app shows code
//   2. User enters that 4-digit code here on TV
//   3. TV calls POST /activate → receives JWT → navigates to prayer times
//
// Alternative: Sign in with Google directly on the TV.
// ---------------------------------------------------------------------------

class TvPairingScreen extends StatefulWidget {
  const TvPairingScreen({super.key});

  @override
  State<TvPairingScreen> createState() => _TvPairingScreenState();
}

class _TvPairingScreenState extends State<TvPairingScreen>
    with SingleTickerProviderStateMixin {
  static const _storage = FlutterSecureStorage();

  // Auth state
  bool _isLoading = false;
  String? _authError;

  // Code entry state
  final _codeController = TextEditingController();
  final _codeFocus = FocusNode();
  bool _activating = false;
  String? _codeError;

  // Entrance animation
  late final AnimationController _enterCtrl;
  late final Animation<double> _enterFade;
  late final Animation<Offset> _enterSlide;

  static final _googleSignIn = GoogleSignIn(scopes: ['email', 'openid']);

  @override
  void initState() {
    super.initState();

    _enterCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _enterFade = CurvedAnimation(parent: _enterCtrl, curve: Curves.easeOut);
    _enterSlide = Tween<Offset>(
      begin: const Offset(0, 0.04),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _enterCtrl, curve: Curves.easeOut));

    _checkExistingSession();
  }

  Future<void> _checkExistingSession() async {
    final jwt = await _storage.read(key: _kTvSessionJwt);
    final prefs = await SharedPreferences.getInstance();
    final expiryStr = prefs.getString(_kTvSessionExpiry);
    if (jwt != null && jwt.isNotEmpty) {
      final expiry = expiryStr != null ? DateTime.tryParse(expiryStr) : null;
      if (expiry == null || expiry.isAfter(DateTime.now())) {
        if (mounted) context.go('/tv');
        return;
      }
    }
    _enterCtrl.forward();
  }

  @override
  void dispose() {
    _enterCtrl.dispose();
    _codeController.dispose();
    _codeFocus.dispose();
    super.dispose();
  }

  Future<void> _saveSession(String jwt, DateTime expiry) async {
    await _storage.write(key: _kTvSessionJwt, value: jwt);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kTvSessionExpiry, expiry.toIso8601String());
  }

  // ---------------------------------------------------------------------------
  // Activate with 4-digit code (reversed flow: app generated, TV enters)
  // ---------------------------------------------------------------------------

  Future<void> _activateCode() async {
    final code = _codeController.text.trim().replaceAll(RegExp(r'\D'), '');
    if (code.length != 4) {
      setState(() => _codeError = 'Enter all 4 digits');
      return;
    }
    if (_activating) return;

    setState(() { _activating = true; _codeError = null; });

    try {
      final res = await http.post(
        Uri.parse('${_smartBase()}/activate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'code': code}),
      ).timeout(const Duration(seconds: 10));

      final body = jsonDecode(res.body) as Map<String, dynamic>;

      if (res.statusCode == 200) {
        final jwt = body['jwt'] as String? ?? '';
        if (jwt.isNotEmpty) {
          await _saveSession(jwt, DateTime.now().add(const Duration(days: 30)));
        }
        if (mounted) {
          setState(() => _activating = false);
          context.go('/tv');
        }
      } else {
        if (mounted) {
          setState(() {
            _activating = false;
            _codeError = (body['error'] as String?)
                ?? 'Invalid code. Check the code in your app.';
          });
          _codeController.clear();
          _codeFocus.requestFocus();
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _activating = false;
          _codeError = 'Could not reach the server. Check your connection.';
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Google sign-in
  // ---------------------------------------------------------------------------

  Future<void> _signInWithGoogle() async {
    if (_isLoading) return;
    setState(() { _isLoading = true; _authError = null; });
    try {
      final account = await _googleSignIn.signIn();
      if (account == null) { setState(() => _isLoading = false); return; }
      final auth = await account.authentication;
      final idToken = auth.idToken;
      if (idToken == null) throw Exception('No ID token');

      final resp = await http.post(
        Uri.parse('https://auth.ummat.dev/signin/provider/google'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'id_token': idToken}),
      ).timeout(const Duration(seconds: 10));

      if (resp.statusCode != 200) throw Exception('Auth failed (${resp.statusCode})');
      final b = jsonDecode(resp.body) as Map<String, dynamic>;
      final session = b['session'] as Map<String, dynamic>? ?? {};
      final jwt = session['accessToken'] as String? ?? '';
      final expiresIn = (session['accessTokenExpiresIn'] as num?)?.toInt() ?? 86400;
      await _saveSession(jwt, DateTime.now().add(Duration(seconds: expiresIn)));
      if (mounted) {
        setState(() => _isLoading = false);
        context.go('/tv');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _authError = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Dev login bypass (debug web only)
  // ---------------------------------------------------------------------------

  Future<void> _devLogin() async {
    if (_isLoading) return;
    setState(() { _isLoading = true; _authError = null; });
    try {
      final resp = await http.post(
        Uri.parse(_devLoginUrl()),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));
      if (resp.statusCode != 200) throw Exception('Dev login failed (${resp.statusCode})');
      final body = jsonDecode(resp.body) as Map<String, dynamic>;
      final session = body['session'] as Map<String, dynamic>? ?? {};
      final jwt = session['accessToken'] as String? ?? '';
      final expiresIn = (session['accessTokenExpiresIn'] as num?)?.toInt() ?? 900;
      await _saveSession(jwt, DateTime.now().add(Duration(seconds: expiresIn)));
      if (mounted) {
        setState(() => _isLoading = false);
        context.go('/tv');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _authError = 'Dev login: ${e.toString().replaceFirst('Exception: ', '')}';
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF060806),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Radial green glow at bottom — matches globals.css
          CustomPaint(painter: _GlowPainter()),
          FadeTransition(
            opacity: _enterFade,
            child: SlideTransition(
              position: _enterSlide,
              child: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 64, vertical: 48),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 960),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildHeader(),
                      const SizedBox(height: 56),
                      _buildTwoPanel(),
                      const SizedBox(height: 40),
                      TextButton(
                        onPressed: () => context.go('/tv'),
                        child: const Text(
                          'Skip — continue without signing in',
                          style: TextStyle(color: Colors.white24, fontSize: 15),
                        ),
                      ),
                      if (kDebugMode && kIsWeb) ...[
                        const SizedBox(height: 20),
                        const Divider(color: Colors.white12),
                        const SizedBox(height: 12),
                        FilledButton.icon(
                          onPressed: _isLoading ? null : _devLogin,
                          icon: const Icon(Icons.developer_mode, size: 20),
                          label: const Text(
                            '⚡ Dev Login (alisalaah@gmail.com)',
                            style: TextStyle(fontSize: 16),
                          ),
                          style: FilledButton.styleFrom(
                            backgroundColor: Colors.amber.withAlpha(40),
                            foregroundColor: Colors.amber,
                            minimumSize: const Size(300, 48),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),         // closes SlideTransition
          ),       // closes FadeTransition
        ],         // closes Stack children
      ),           // closes Stack
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Image.asset(
          'assets/brand/logo.png',
          height: 72,
          fit: BoxFit.contain,
        ),
        const SizedBox(height: 20),
        const Text(
          'Connect this TV to your account',
          style: TextStyle(color: Colors.white54, fontSize: 18),
        ),
      ],
    );
  }

  Widget _buildTwoPanel() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Left: Sign in with Google ──────────────────────────────────
        Expanded(
          child: _PairingCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.account_circle_outlined,
                    color: PrayCalcColors.mid, size: 36),
                const SizedBox(height: 12),
                const Text(
                  'Sign in with Google',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                const Text(
                  'Sign in directly on this TV using your Google account.',
                  style: TextStyle(color: Colors.white38, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),
                if (_authError != null) ...[
                  Text(
                    _authError!,
                    style: const TextStyle(
                        color: Colors.redAccent, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                ],
                SizedBox(
                  height: 52,
                  child: _isLoading
                      ? const Center(
                          child: CircularProgressIndicator(
                              color: PrayCalcColors.mid))
                      : FilledButton.icon(
                          onPressed: _signInWithGoogle,
                          icon: const Icon(Icons.account_circle, size: 22),
                          label: const Text(
                            'Sign in with Google',
                            style: TextStyle(
                                fontSize: 17, fontWeight: FontWeight.w600),
                          ),
                          style: FilledButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: Colors.black87,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                ),
              ],
            ),
          ),
        ),

        // ── Divider ─────────────────────────────────────────────────────
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            children: [
              const SizedBox(
                height: 100,
                child: VerticalDivider(color: Colors.white12, width: 1),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: PrayCalcColors.dark,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('or',
                    style: TextStyle(
                        color: Colors.white38, fontSize: 14)),
              ),
              const SizedBox(
                height: 100,
                child: VerticalDivider(color: Colors.white12, width: 1),
              ),
            ],
          ),
        ),

        // ── Right: Enter code from app ───────────────────────────────────
        Expanded(child: _buildCodeEntryPanel()),
      ],
    );
  }

  Widget _buildCodeEntryPanel() {
    return _PairingCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Icon(Icons.dialpad_outlined,
              color: PrayCalcColors.mid, size: 36),
          const SizedBox(height: 12),
          const Text(
            'Use the PrayCalc App',
            style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          const Text(
            'Open PrayCalc on your phone:\nSettings → My TVs → Add TV',
            style: TextStyle(color: Colors.white38, fontSize: 14),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          const Text(
            'Enter the 4-digit code from the app:',
            style: TextStyle(
                color: Colors.white60,
                fontSize: 14,
                fontWeight: FontWeight.w500),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),

          // 4-digit input
          TextField(
            controller: _codeController,
            focusNode: _codeFocus,
            autofocus: false,
            keyboardType: TextInputType.number,
            maxLength: 4,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            textAlign: TextAlign.center,
            style: TextStyle(
              color: _codeError != null
                  ? Colors.redAccent
                  : PrayCalcColors.light,
              fontSize: 56,
              fontWeight: FontWeight.bold,
              letterSpacing: 20,
              fontFamily: 'monospace',
            ),
            decoration: InputDecoration(
              counterText: '',
              hintText: '••••',
              hintStyle: const TextStyle(
                color: Colors.white12,
                fontSize: 48,
                letterSpacing: 14,
              ),
              filled: true,
              fillColor: PrayCalcColors.dark,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide:
                    const BorderSide(color: PrayCalcColors.mid, width: 2),
              ),
              contentPadding: const EdgeInsets.symmetric(
                  vertical: 20, horizontal: 16),
            ),
            onChanged: (v) {
              if (_codeError != null) setState(() => _codeError = null);
              if (v.length == 4) _activateCode();
            },
            onSubmitted: (_) => _activateCode(),
          ),

          if (_codeError != null) ...[
            const SizedBox(height: 8),
            Text(
              _codeError!,
              style: const TextStyle(
                  color: Colors.redAccent, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          ],

          const SizedBox(height: 20),

          SizedBox(
            height: 52,
            child: _activating
                ? const Center(
                    child: CircularProgressIndicator(
                        color: PrayCalcColors.mid))
                : FilledButton(
                    onPressed: _activateCode,
                    style: FilledButton.styleFrom(
                      backgroundColor: PrayCalcColors.dark,
                      foregroundColor: PrayCalcColors.light,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Connect TV',
                        style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w600)),
                  ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Reusable card widget
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Bottom radial glow — rgba(121,194,76,0.22) ellipse at 50% 100%
// ---------------------------------------------------------------------------

class _GlowPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height;
    final rx = size.width * 0.80;
    final ry = size.height * 0.80;

    final paint = Paint()
      ..shader = RadialGradient(
        colors: [
          const Color(0xFF79C24C).withAlpha(56), // 0.22 * 255 ≈ 56
          Colors.transparent,
        ],
        stops: const [0.0, 0.70],
      ).createShader(Rect.fromCenter(
        center: Offset(cx, cy),
        width: rx * 2,
        height: ry * 2,
      ));

    canvas.save();
    canvas.translate(cx, cy);
    canvas.scale(1.0, ry / rx);
    canvas.drawCircle(Offset.zero, rx, paint);
    canvas.restore();
  }

  @override
  bool shouldRepaint(_GlowPainter old) => false;
}

// ---------------------------------------------------------------------------

class _PairingCard extends StatelessWidget {
  const _PairingCard({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: const Color(0xFF1A3A22),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white10),
      ),
      child: child,
    );
  }
}
