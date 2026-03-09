import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../core/theme/app_theme.dart';

const _kActivationUrl = 'https://praycalc.com/tv/activate';

/// TV first-launch welcome screen (TV2-P21).
///
/// Shown when no TV JWT is stored — i.e., the TV has not been paired yet.
/// Provides three paths:
///   1. Scan QR / visit praycalc.com/tv/activate to pair from phone.
///   2. Tap "Use 6-Character Code" → [TvPairingScreen].
///   3. "Skip for now" (top-right) → [TvHomeScreen] for a quick look
///      without pairing.
///
/// Route: /tv/onboarding
class TvOnboardingScreen extends StatelessWidget {
  const TvOnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      body: Stack(
        children: [
          // ── Skip button (top-right) ────────────────────────────────────
          Positioned(
            top: 24,
            right: 24,
            child: TextButton(
              onPressed: () => context.go('/'),
              style: TextButton.styleFrom(
                foregroundColor: Colors.white54,
              ),
              child: const Text(
                'Skip for now',
                style: TextStyle(fontSize: 14),
              ),
            ),
          ),

          // ── Main content ───────────────────────────────────────────────
          Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: size.width > 960 ? 640 : size.width * 0.85,
              ),
              child: const _OnboardingBody(),
            ),
          ),
        ],
      ),
    );
  }
}

class _OnboardingBody extends StatelessWidget {
  const _OnboardingBody();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // ── Logo ──────────────────────────────────────────────────────────
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: Colors.white.withAlpha(20),
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Center(
            child: Text(
              '🕌',
              style: TextStyle(fontSize: 44),
            ),
          ),
        ),

        const SizedBox(height: 32),

        // ── Title ─────────────────────────────────────────────────────────
        const Text(
          'Prayer Times\nfor the Living Room',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white,
            fontSize: 48,
            fontWeight: FontWeight.w700,
            height: 1.15,
            fontFamily: 'Amiri',
          ),
        ),

        const SizedBox(height: 16),

        // ── Subtitle ──────────────────────────────────────────────────────
        Text(
          'Pair with your phone to get started',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white.withAlpha(178),
            fontSize: 18,
          ),
        ),

        const SizedBox(height: 48),

        // ── QR Code ───────────────────────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: QrImageView(
            data: _kActivationUrl,
            version: QrVersions.auto,
            size: 200,
            backgroundColor: Colors.white,
            errorCorrectionLevel: QrErrorCorrectLevel.M,
          ),
        ),

        const SizedBox(height: 16),

        Text(
          'Or visit praycalc.com/tv/activate on your phone',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white.withAlpha(140),
            fontSize: 14,
          ),
        ),

        const SizedBox(height: 48),

        // ── Code button ───────────────────────────────────────────────────
        SizedBox(
          width: 280,
          height: 52,
          child: ElevatedButton(
            onPressed: () => context.push('/pairing'),
            style: ElevatedButton.styleFrom(
              backgroundColor: PrayCalcColors.mid,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            child: const Text(
              'Use 6-Character Code',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),

        const SizedBox(height: 20),

        // ── Google sign-in text ───────────────────────────────────────────
        GestureDetector(
          onTap: () => _launchGoogleSignIn(context),
          child: Text(
            'Already paired? Sign in with your Google account',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withAlpha(140),
              fontSize: 14,
              decoration: TextDecoration.underline,
              decorationColor: Colors.white38,
            ),
          ),
        ),
      ],
    );
  }

  void _launchGoogleSignIn(BuildContext context) {
    // Navigate to the pairing screen which handles OAuth device-flow,
    // including the Google sign-in tab.
    context.push('/pairing');
  }
}
