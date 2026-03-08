import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../core/providers/smart_home_provider.dart';
import '../../core/services/smart_home_api_service.dart';
import '../../core/theme/app_theme.dart';

/// TV pairing screen (PC-F1-10).
///
/// Generates a 6-character alphanumeric pairing code displayed as large text
/// and a QR code. The code expires after 5 minutes. Users scan the QR code
/// or enter the code on their phone to pair the TV with their account.
///
/// On code generation, the code is registered with the backend via
/// POST /api/v1/devices with type "tv". The screen polls for pairing
/// confirmation.
class TvPairingScreen extends ConsumerStatefulWidget {
  const TvPairingScreen({super.key});

  @override
  ConsumerState<TvPairingScreen> createState() => _TvPairingScreenState();
}

class _TvPairingScreenState extends ConsumerState<TvPairingScreen> {
  static const _codeDuration = Duration(minutes: 5);
  static const _codeLength = 6;
  static const _codeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  String _pairingCode = '';
  late DateTime _expiresAt;
  Timer? _countdownTimer;
  Timer? _pollTimer;
  int _remainingSeconds = 0;
  bool _isPaired = false;
  bool _isRegistering = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _generateCode();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _generateCode() async {
    final random = Random.secure();
    final code = List.generate(
      _codeLength,
      (_) => _codeChars[random.nextInt(_codeChars.length)],
    ).join();

    setState(() {
      _pairingCode = code;
      _expiresAt = DateTime.now().add(_codeDuration);
      _remainingSeconds = _codeDuration.inSeconds;
      _isPaired = false;
      _isRegistering = true;
      _error = null;
    });

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      final remaining = _expiresAt.difference(DateTime.now()).inSeconds;
      if (remaining <= 0) {
        _countdownTimer?.cancel();
        _pollTimer?.cancel();
        setState(() => _remainingSeconds = 0);
      } else {
        setState(() => _remainingSeconds = remaining);
      }
    });

    // Register the pairing code with the backend as a TV device.
    try {
      await SmartHomeApiService.instance.addDevice(
        name: 'TV (${_formatCode(code)})',
        type: 'tv',
        pairingCode: code,
      );
      setState(() {
        _isRegistering = false;
      });
      // Start polling for pairing confirmation.
      _startPolling();
    } on SmartHomeApiException catch (e) {
      setState(() {
        _isRegistering = false;
        _error = e.message;
      });
    } catch (_) {
      setState(() {
        _isRegistering = false;
        // Non-blocking: pairing code is still shown for manual entry.
      });
    }
  }

  /// Poll the devices endpoint to check if this TV has been paired.
  void _startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) async {
      if (_isPaired || _remainingSeconds <= 0) {
        _pollTimer?.cancel();
        return;
      }
      try {
        final devices = await SmartHomeApiService.instance.getDevices();
        final tvDevice = devices.where(
          (d) => d.type == 'tv' && d.name.contains(_formatCode(_pairingCode)),
        );
        if (tvDevice.isNotEmpty && tvDevice.first.online) {
          _pollTimer?.cancel();
          // Refresh device list in the provider.
          ref.read(devicesProvider.notifier).load();
          setState(() => _isPaired = true);
        }
      } catch (_) {
        // Silently continue polling.
      }
    });
  }

  String get _formattedTime {
    final minutes = _remainingSeconds ~/ 60;
    final seconds = _remainingSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:'
        '${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final isExpired = _remainingSeconds <= 0;

    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      appBar: AppBar(
        backgroundColor: PrayCalcColors.deep,
        foregroundColor: Colors.white,
        title: const Text(
          'Pair with Phone',
          style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, size: 32),
          onPressed: () => context.pop(),
        ),
      ),
      body: Center(
        child: FocusTraversalGroup(
          policy: OrderedTraversalPolicy(),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (_isPaired) ...[
                  _buildPairedState(),
                ] else ...[
                  _buildPairingState(isExpired),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPairedState() {
    final l = AppLocalizations.of(context)!;
    return Column(
      children: [
        const Icon(
          Icons.check_circle,
          color: PrayCalcColors.mid,
          size: 80,
        ),
        const SizedBox(height: 24),
        Text(
          l.smartHomePairTvSuccess,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 32,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'Your TV is now connected to your account.',
          style: TextStyle(color: Colors.white54, fontSize: 20),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        Focus(
          onKeyEvent: (node, event) {
            if (event is KeyDownEvent &&
                (event.logicalKey == LogicalKeyboardKey.select ||
                    event.logicalKey == LogicalKeyboardKey.enter)) {
              context.pop();
              return KeyEventResult.handled;
            }
            return KeyEventResult.ignored;
          },
          child: FilledButton.icon(
            onPressed: () => context.pop(),
            icon: const Icon(Icons.check),
            label: const Text('Done', style: TextStyle(fontSize: 22)),
            style: FilledButton.styleFrom(
              backgroundColor: PrayCalcColors.dark,
              foregroundColor: Colors.white,
              minimumSize: const Size(200, 56),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPairingState(bool isExpired) {
    return Column(
      children: [
        // Instructions
        const Text(
          'To pair this TV with your phone:',
          style: TextStyle(color: Colors.white70, fontSize: 22),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        const Text(
          '1. Open PrayCalc on your phone\n'
          '2. Go to Settings > TV Display\n'
          '3. Tap "Pair a TV" and enter the code below',
          style: TextStyle(color: Colors.white54, fontSize: 18),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 40),

        // QR code area
        Container(
          width: 220,
          height: 220,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.all(16),
          child: QrImageView(
            data: 'praycalc://pair?code=$_pairingCode',
            version: QrVersions.auto,
            size: 188,
            backgroundColor: Colors.white,
            eyeStyle: const QrEyeStyle(
              eyeShape: QrEyeShape.square,
              color: Color(0xFF0D2F17),
            ),
            dataModuleStyle: const QrDataModuleStyle(
              dataModuleShape: QrDataModuleShape.square,
              color: Color(0xFF0D2F17),
            ),
          ),
        ),
        const SizedBox(height: 32),

        // Pairing code
        Text(
          'Or enter this code:',
          style: TextStyle(
            color: Colors.white54,
            fontSize: 18,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          decoration: BoxDecoration(
            color: PrayCalcColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isExpired ? Colors.red.withAlpha(100) : PrayCalcColors.mid,
              width: 2,
            ),
          ),
          child: Text(
            isExpired ? 'EXPIRED' : _formatCode(_pairingCode),
            style: TextStyle(
              color: isExpired ? Colors.red[300] : PrayCalcColors.light,
              fontSize: 48,
              fontWeight: FontWeight.bold,
              letterSpacing: 8,
              fontFamily: 'monospace',
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Registration status
        if (_isRegistering)
          const Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white54,
                  ),
                ),
                SizedBox(width: 8),
                Text(
                  'Registering with server...',
                  style: TextStyle(color: Colors.white54, fontSize: 14),
                ),
              ],
            ),
          ),
        if (_error != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              _error!,
              style: TextStyle(color: Colors.red[300], fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ),

        // Timer
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isExpired ? Icons.timer_off : Icons.timer,
              color: isExpired ? Colors.red[300] : Colors.white54,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              isExpired ? 'Code expired' : 'Expires in $_formattedTime',
              style: TextStyle(
                color: isExpired ? Colors.red[300] : Colors.white54,
                fontSize: 18,
              ),
            ),
          ],
        ),
        const SizedBox(height: 32),

        // Regenerate button
        Focus(
          onKeyEvent: (node, event) {
            if (event is KeyDownEvent &&
                (event.logicalKey == LogicalKeyboardKey.select ||
                    event.logicalKey == LogicalKeyboardKey.enter)) {
              _generateCode();
              return KeyEventResult.handled;
            }
            return KeyEventResult.ignored;
          },
          child: Builder(
            builder: (ctx) {
              final hasFocus = Focus.of(ctx).hasFocus;
              return OutlinedButton.icon(
                onPressed: _generateCode,
                icon: const Icon(Icons.refresh, size: 24),
                label: Text(
                  isExpired ? 'Generate new code' : 'New code',
                  style: const TextStyle(fontSize: 20),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor:
                      hasFocus ? PrayCalcColors.light : Colors.white70,
                  side: BorderSide(
                    color:
                        hasFocus ? PrayCalcColors.mid : Colors.white24,
                    width: hasFocus ? 2 : 1,
                  ),
                  minimumSize: const Size(200, 52),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  /// Format code with a dash in the middle for readability: ABC-DEF.
  String _formatCode(String code) {
    if (code.length != _codeLength) return code;
    return '${code.substring(0, 3)}-${code.substring(3)}';
  }
}

