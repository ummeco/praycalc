import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// TV splash screen — logo sunrise animation → fade to pairing screen.
///
/// Mirrors the web home page LogoSunrise component exactly:
/// - Near-black background #060806 with radial green glow at bottom
/// - Full logo (logo.png wordmark) rises from below-horizon to center over 6s
/// - Easing: Cubic(0.25, 0.1, 0.25, 1.0) with 100ms delay
/// - Hold 1s → fade to black → navigate to /tv/pairing
class TvSplashScreen extends StatefulWidget {
  const TvSplashScreen({super.key});

  @override
  State<TvSplashScreen> createState() => _TvSplashScreenState();
}

class _TvSplashScreenState extends State<TvSplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  // Logo rise: Interval(0.012, 0.750) = 100ms..6000ms of 8000ms total
  // Mimics framer-motion: initial y:logoClipH → animate y:0, duration:6, delay:0.1
  late final Animation<double> _rise;

  // Glow opacity: fades in with the rise, fades out during screen-fade
  late final Animation<double> _glowIn;
  late final Animation<double> _glowOut;

  // Screen fade-to-black overlay: Interval(0.875, 1.0) = 7000ms..8000ms
  late final Animation<double> _screenFade;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 8000),
    );

    // Rise: 100ms → 6000ms with cubic-bezier(0.25, 0.1, 0.25, 1)
    _rise = CurvedAnimation(
      parent: _ctrl,
      curve: const Interval(
        0.0125, 0.75,
        curve: Cubic(0.25, 0.1, 0.25, 1.0),
      ),
    );

    _glowIn = CurvedAnimation(
      parent: _ctrl,
      curve: const Interval(0.0, 0.75, curve: Curves.easeIn),
    );

    _glowOut = CurvedAnimation(
      parent: _ctrl,
      curve: const Interval(0.875, 1.0, curve: Curves.easeIn),
    );

    _screenFade = CurvedAnimation(
      parent: _ctrl,
      curve: const Interval(0.875, 1.0, curve: Curves.easeIn),
    );

    _ctrl.forward().then((_) async {
      if (!mounted) return;
      final prefs = await SharedPreferences.getInstance();
      final isPaired = (prefs.getString('tv_session_jwt') ?? '').isNotEmpty;
      // Navigate via /tv (not /) so the route builder sets _kTvIsPaired = true
      // before the global redirect fires. Going to '/' directly would be
      // intercepted by the global redirect (which checks _kTvIsPaired) and
      // loop back to splash on every page reload.
      if (mounted) context.go(isPaired ? '/tv' : '/onboarding');
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF060806),
      body: AnimatedBuilder(
        animation: _ctrl,
        builder: (context, _) {
          final glowOpacity = (_glowIn.value * (1 - _glowOut.value)).clamp(0.0, 1.0);
          return Stack(
            fit: StackFit.expand,
            children: [
              // ── Radial green glow at bottom ───────────────────────────────
              Opacity(
                opacity: glowOpacity,
                child: const _BottomGlow(),
              ),

              // ── Logo rising from below the horizon ───────────────────────
              _LogoHorizon(riseProgress: _rise.value),

              // ── Fade-to-black overlay ─────────────────────────────────────
              if (_screenFade.value > 0)
                Opacity(
                  opacity: _screenFade.value,
                  child: const ColoredBox(color: Color(0xFF060806)),
                ),
            ],
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Radial green glow — mirrors globals.css radial-gradient at 50% 100%
// ---------------------------------------------------------------------------

class _BottomGlow extends StatelessWidget {
  const _BottomGlow();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(painter: _GlowPainter());
  }
}

class _GlowPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // radial-gradient(ellipse 80% 80% at 50% 100%, rgba(121,194,76,0.22), transparent 70%)
    final cx = size.width / 2;
    final cy = size.height;
    final rx = size.width * 0.80;
    final ry = size.height * 0.80;

    final paint = Paint()
      ..shader = RadialGradient(
        colors: [
          const Color(0xFF79C24C).withAlpha(56),  // 0.22 * 255 ≈ 56
          Colors.transparent,
        ],
        stops: const [0.0, 0.70],
      ).createShader(Rect.fromCenter(
        center: Offset(cx, cy),
        width: rx * 2,
        height: ry * 2,
      ));

    // Draw an ellipse — scale the canvas to squash the circle into an ellipse
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
// Logo horizon — logo rises from below a clipped viewport, matching
// framer-motion: initial={{ y: clipH }} animate={{ y: 0 }} duration:6
// ---------------------------------------------------------------------------

class _LogoHorizon extends StatelessWidget {
  const _LogoHorizon({required this.riseProgress});
  final double riseProgress;

  @override
  Widget build(BuildContext context) {
    final screen = MediaQuery.sizeOf(context);

    // Logo dimensions — web component: 420×191, aspect ratio ≈ 2.197:1
    const aspectRatio = 2752.0 / 1252.0;
    final logoWidth = (screen.width * 0.30).clamp(240.0, 460.0);
    final logoHeight = logoWidth / aspectRatio;

    // Clip container height: logo height + small pad above (matches web: 215px for 191px logo)
    final clipHeight = logoHeight + 24.0;

    // Horizon: logo's clip sits centered vertically at ~45% down screen
    final horizonTop = screen.height * 0.45 - clipHeight / 2;

    // Rise: logo translates from clipHeight (fully below horizon) → 0 (natural pos)
    final yOffset = clipHeight * (1.0 - riseProgress);

    return Positioned(
      left: (screen.width - logoWidth) / 2,
      top: horizonTop,
      width: logoWidth,
      height: clipHeight,
      child: ClipRect(
        child: Transform.translate(
          offset: Offset(0, yOffset),
          child: SizedBox(
            width: logoWidth,
            height: logoHeight,
            child: Image.asset(
              'assets/brand/logo.png',
              width: logoWidth,
              height: logoHeight,
              fit: BoxFit.contain,
            ),
          ),
        ),
      ),
    );
  }
}
