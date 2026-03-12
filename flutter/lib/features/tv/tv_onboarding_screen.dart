import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:qr_flutter/qr_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';

const _kActivationUrl = 'https://praycalc.com/tv/activate';
const _kTvSessionJwt = 'tv_session_jwt';

String _smartBase() {
  if (kIsWeb) {
    final host = Uri.base.host;
    if (host == 'localhost' || host.startsWith('127.')) {
      return 'http://localhost:4010/api/v1/tv';
    }
  }
  return 'https://smart.praycalc.com/api/v1/tv';
}

/// TV first-launch welcome screen — all-in-one connect screen.
///
/// Three paths from a single screen:
///   1. Scan QR code (praycalc.com/tv/activate) from phone
///   2. Enter 4-digit code generated in the PrayCalc app
///   3. Sign in with Google directly on this TV
///
/// Route: /onboarding
class TvOnboardingScreen extends StatefulWidget {
  const TvOnboardingScreen({super.key});

  @override
  State<TvOnboardingScreen> createState() => _TvOnboardingScreenState();
}

class _TvOnboardingScreenState extends State<TvOnboardingScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _enterCtrl;
  late final Animation<double> _enterFade;
  late final Animation<Offset> _enterSlide;

  // Code entry
  final _codeController = TextEditingController();
  final _codeFocus = FocusNode();
  bool _activating = false;
  String? _codeError;

  // Google sign-in
  bool _googleLoading = false;
  String? _googleError;

  // Focus nodes for explicit D-pad traversal order
  final _connectFocus = FocusNode();
  final _googleFocus = FocusNode();
  final _skipFocus = FocusNode();

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
    _enterCtrl.forward();
  }

  @override
  void dispose() {
    _enterCtrl.dispose();
    _codeController.dispose();
    _codeFocus.dispose();
    _connectFocus.dispose();
    _googleFocus.dispose();
    _skipFocus.dispose();
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // Session helpers
  // ---------------------------------------------------------------------------

  Future<void> _saveSession(String jwt) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kTvSessionJwt, jwt);
    await prefs.setString(
      'tv_session_expiry',
      DateTime.now().add(const Duration(days: 30)).toIso8601String(),
    );
  }

  void _onPaired() {
    if (mounted) context.go('/tv');
  }

  // ---------------------------------------------------------------------------
  // 4-digit code activation
  // ---------------------------------------------------------------------------

  Future<void> _activateCode() async {
    final code = _codeController.text.trim().replaceAll(RegExp(r'\D'), '');
    if (code.length != 4) {
      setState(() => _codeError = 'Enter all 4 digits');
      return;
    }
    if (_activating) return;
    setState(() {
      _activating = true;
      _codeError = null;
    });

    try {
      final res = await http.post(
        Uri.parse('${_smartBase()}/activate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'code': code}),
      ).timeout(const Duration(seconds: 10));

      final body = jsonDecode(res.body) as Map<String, dynamic>;

      if (res.statusCode == 200) {
        final jwt = body['jwt'] as String? ?? '';
        if (jwt.isNotEmpty) await _saveSession(jwt);
        if (mounted) {
          setState(() => _activating = false);
          _onPaired();
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
    } catch (_) {
      if (mounted) {
        setState(() {
          _activating = false;
          _codeError = 'Could not reach server. Check your connection.';
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Google sign-in
  // ---------------------------------------------------------------------------

  Future<void> _signInWithGoogle() async {
    if (_googleLoading) return;
    setState(() {
      _googleLoading = true;
      _googleError = null;
    });
    try {
      final account = await _googleSignIn.signIn();
      if (account == null) {
        setState(() => _googleLoading = false);
        return;
      }
      final auth = await account.authentication;
      final idToken = auth.idToken;
      if (idToken == null) throw Exception('No ID token');

      final resp = await http.post(
        Uri.parse('https://auth.ummat.dev/signin/provider/google'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'id_token': idToken}),
      ).timeout(const Duration(seconds: 10));

      if (resp.statusCode != 200) {
        throw Exception('Auth failed (${resp.statusCode})');
      }
      final b = jsonDecode(resp.body) as Map<String, dynamic>;
      final session = b['session'] as Map<String, dynamic>? ?? {};
      final jwt = session['accessToken'] as String? ?? '';
      if (jwt.isEmpty) throw Exception('No token returned');
      await _saveSession(jwt);
      if (mounted) {
        setState(() => _googleLoading = false);
        _onPaired();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _googleLoading = false;
          _googleError = 'Google sign-in failed. Try the code instead.';
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Dev login (localhost only — no kDebugMode check so it works in release)
  // ---------------------------------------------------------------------------

  bool get _isLocalhost =>
      kIsWeb && (Uri.base.host == 'localhost' || Uri.base.host.startsWith('127.'));

  bool _devLoading = false;
  String? _devError;

  Future<void> _devLogin() async {
    if (_devLoading) return;
    setState(() { _devLoading = true; _devError = null; });
    try {
      final resp = await http.post(
        Uri.parse('http://localhost:3041/api/dev/login'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));
      if (resp.statusCode != 200) throw Exception('Dev login failed (${resp.statusCode})');
      final body = jsonDecode(resp.body) as Map<String, dynamic>;
      final session = body['session'] as Map<String, dynamic>? ?? {};
      final jwt = session['accessToken'] as String? ?? '';
      if (jwt.isEmpty) throw Exception('No token returned');
      await _saveSession(jwt);
      if (mounted) {
        setState(() => _devLoading = false);
        _onPaired();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _devLoading = false;
          _devError = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    // Traversal order: 1=code field, 2=Connect, 3=Google, 4=Skip
    return FocusTraversalGroup(
      policy: OrderedTraversalPolicy(),
      child: Scaffold(
      backgroundColor: const Color(0xFF060806),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Radial green glow at bottom
          CustomPaint(painter: _GlowPainter()),

          // Skip button — traversal order 4
          Positioned(
            top: 24,
            right: 32,
            child: FocusTraversalOrder(
              order: const NumericFocusOrder(4),
              child: TextButton(
                focusNode: _skipFocus,
                onPressed: () => context.go('/'),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.white24,
                  overlayColor: Colors.white10,
                ),
                child: const Text('Skip for now', style: TextStyle(fontSize: 15)),
              ),
            ),
          ),

          // Main content
          FadeTransition(
            opacity: _enterFade,
            child: SlideTransition(
              position: _enterSlide,
              child: SafeArea(
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 48, vertical: 40),
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 960),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Logo
                          Image.asset(
                            'assets/brand/logo.png',
                            height: 60,
                            fit: BoxFit.contain,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Connect this TV to your account',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.5),
                              fontSize: 17,
                            ),
                          ),
                          const SizedBox(height: 44),

                          // Three-panel row
                          _buildPanels(context),
                          const SizedBox(height: 32),

                          // Dev login — localhost only, works in release builds
                          if (_isLocalhost) ...[
                            const Divider(color: Colors.white12),
                            const SizedBox(height: 12),
                            if (_devError != null)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Text(
                                  _devError!,
                                  style: const TextStyle(
                                      color: Colors.redAccent, fontSize: 14),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            FilledButton.icon(
                              onPressed: _devLoading ? null : _devLogin,
                              icon: _devLoading
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.amber),
                                    )
                                  : const Icon(Icons.developer_mode, size: 20),
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
                            const SizedBox(height: 12),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    )); // Scaffold + FocusTraversalGroup
  }

  Widget _buildPanels(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth > 700;
        if (wide) {
          return IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(child: _buildQrPanel()),
                _buildVerticalDivider('or'),
                Expanded(child: _buildCodePanel()),
                _buildVerticalDivider('or'),
                Expanded(child: _buildGooglePanel()),
              ],
            ),
          );
        }
        return Column(
          children: [
            _buildQrPanel(),
            _buildHorizontalDivider('or'),
            _buildCodePanel(),
            _buildHorizontalDivider('or'),
            _buildGooglePanel(),
          ],
        );
      },
    );
  }

  // ── QR panel ──────────────────────────────────────────────────────────────

  Widget _buildQrPanel() {
    return _Panel(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Scan with phone',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.9),
              fontSize: 19,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Open the PrayCalc app\nand scan this code',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.4),
              fontSize: 13,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
            ),
            child: QrImageView(
              data: _kActivationUrl,
              version: QrVersions.auto,
              size: 160,
              backgroundColor: Colors.white,
              errorCorrectionLevel: QrErrorCorrectLevel.M,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'praycalc.com/tv/activate',
            style: TextStyle(
              color: PrayCalcColors.light.withValues(alpha: 0.6),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  // ── Code entry panel ──────────────────────────────────────────────────────

  Widget _buildCodePanel() {
    return _Panel(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Use app code',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.9),
              fontSize: 19,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Settings → My TVs → Add TV\nEnter the 4-digit code here',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.4),
              fontSize: 13,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 20),

          // 4-digit input — traversal order 1, autofocused on screen entry
          FocusTraversalOrder(
            order: const NumericFocusOrder(1),
            child: TextField(
              controller: _codeController,
              focusNode: _codeFocus,
              autofocus: true,
              keyboardType: TextInputType.number,
              maxLength: 4,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              textAlign: TextAlign.center,
              style: TextStyle(
                color: _codeError != null
                    ? Colors.redAccent
                    : PrayCalcColors.light,
                fontSize: 48,
                fontWeight: FontWeight.bold,
                letterSpacing: 16,
              ),
              decoration: InputDecoration(
                counterText: '',
                hintText: '••••',
                hintStyle: const TextStyle(
                  color: Colors.white12,
                  fontSize: 40,
                  letterSpacing: 12,
                ),
                filled: true,
                fillColor: PrayCalcColors.dark,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(
                      color: PrayCalcColors.mid, width: 2),
                ),
                contentPadding: const EdgeInsets.symmetric(
                    vertical: 18, horizontal: 16),
              ),
              onChanged: (v) {
                if (_codeError != null) setState(() => _codeError = null);
                if (v.length == 4) _activateCode();
              },
              onSubmitted: (_) => _activateCode(),
            ),
          ),

          if (_codeError != null) ...[
            const SizedBox(height: 8),
            Text(
              _codeError!,
              style: const TextStyle(color: Colors.redAccent, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          ],

          const SizedBox(height: 16),

          FocusTraversalOrder(
            order: const NumericFocusOrder(2),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: _activating
                  ? const Center(
                      child: CircularProgressIndicator(
                          color: PrayCalcColors.mid))
                  : FilledButton(
                      focusNode: _connectFocus,
                      onPressed: _activateCode,
                      style: FilledButton.styleFrom(
                        backgroundColor: PrayCalcColors.mid,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text(
                        'Connect',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Google sign-in panel ──────────────────────────────────────────────────

  Widget _buildGooglePanel() {
    return _Panel(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Sign in with Google',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.9),
              fontSize: 19,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Use your Google account\nlinked to PrayCalc',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.4),
              fontSize: 13,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 20),

          // Google icon placeholder
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.06),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.account_circle_outlined,
              color: Colors.white38,
              size: 44,
            ),
          ),

          if (_googleError != null) ...[
            const SizedBox(height: 12),
            Text(
              _googleError!,
              style: const TextStyle(color: Colors.redAccent, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          ],

          const SizedBox(height: 20),

          FocusTraversalOrder(
            order: const NumericFocusOrder(3),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: _googleLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                          color: PrayCalcColors.mid))
                  : FilledButton.icon(
                      focusNode: _googleFocus,
                      onPressed: _signInWithGoogle,
                      icon: const Icon(Icons.account_circle, size: 20),
                      label: const Text(
                        'Sign in with Google',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w600),
                      ),
                      style: FilledButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black87,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Dividers ──────────────────────────────────────────────────────────────

  Widget _buildVerticalDivider(String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Expanded(
            child: Container(
              width: 1,
              color: Colors.white.withValues(alpha: 0.08),
            ),
          ),
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: PrayCalcColors.dark,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              label,
              style: const TextStyle(color: Colors.white38, fontSize: 13),
            ),
          ),
          Expanded(
            child: Container(
              width: 1,
              color: Colors.white.withValues(alpha: 0.08),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHorizontalDivider(String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 1,
              color: Colors.white.withValues(alpha: 0.08),
            ),
          ),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: PrayCalcColors.dark,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              label,
              style: const TextStyle(color: Colors.white38, fontSize: 13),
            ),
          ),
          Expanded(
            child: Container(
              height: 1,
              color: Colors.white.withValues(alpha: 0.08),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Panel container
// ---------------------------------------------------------------------------

class _Panel extends StatelessWidget {
  const _Panel({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.07)),
      ),
      child: child,
    );
  }
}

// ---------------------------------------------------------------------------
// Radial green glow — matches tv_pairing_screen and tv_splash_screen
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
          const Color(0xFF79C24C).withAlpha(56),
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
