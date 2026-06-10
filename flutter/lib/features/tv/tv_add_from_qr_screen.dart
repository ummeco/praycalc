import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/services/auth_service.dart';
import '../../core/theme/app_theme.dart';
import 'tv_paired_screen.dart';
import 'package:praycalc_app/l10n/app_localizations.dart';

// ---------------------------------------------------------------------------
// TV2-10.15: Add TV from mobile via QR scan
// ---------------------------------------------------------------------------
//
// Scans the QR displayed on TvPairingScreen (format: praycalc://pair?code=XYZ)
// → POSTs to /api/v1/tv/pair with the code
// → Prompts for device name
// → Saves new device to paired list

const _kSmartBase = 'https://smart.praycalc.com/api/v1/tv';

class TvAddFromQrScreen extends StatefulWidget {
  const TvAddFromQrScreen({super.key});

  @override
  State<TvAddFromQrScreen> createState() => _TvAddFromQrScreenState();
}

class _TvAddFromQrScreenState extends State<TvAddFromQrScreen> {
  final _controller = MobileScannerController();
  final _nameController = TextEditingController();

  bool _scanned = false;
  bool _loading = false;
  bool _success = false;
  String? _error;
  // Tracks the scanned code for error-state retry display.
  String? _pairingCode;

  @override
  void dispose() {
    _controller.dispose();
    _nameController.dispose();
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // QR handling
  // ---------------------------------------------------------------------------

  void _onDetect(BarcodeCapture capture) {
    if (_scanned) return;
    final raw = capture.barcodes.firstOrNull?.rawValue;
    if (raw == null) return;

    // Parse praycalc://pair?code=ABC123
    final uri = Uri.tryParse(raw);
    if (uri == null) return;

    String? code;
    if (uri.scheme == 'praycalc' && uri.host == 'pair') {
      code = uri.queryParameters['code'];
    } else if (raw.length == 6 || raw.length == 7) {
      // Bare code or dashes (e.g. "ABC-123")
      code = raw.replaceAll('-', '');
    }

    if (code == null || code.isEmpty) {
      setState(() => _error = 'Not a valid PrayCalc TV QR code. Try again.');
      return;
    }

    setState(() {
      _scanned = true;
      _pairingCode = code;
    });
    _controller.stop();
    _showNameDialog(code);
  }

  // ---------------------------------------------------------------------------
  // Pairing
  // ---------------------------------------------------------------------------

  Future<void> _showNameDialog(String code) async {
    _nameController.text = 'My TV';
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: Text(
          AppLocalizations.of(context)!.tvPairingNameThisTv,
          style: const TextStyle(color: Colors.white),
        ),
        content: TextField(
          controller: _nameController,
          autofocus: true,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: AppLocalizations.of(context)!.tvPairingNameHint,
            hintStyle: TextStyle(color: Colors.white54),
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: PrayCalcColors.mid),
            ),
            focusedBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: PrayCalcColors.light, width: 2),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              setState(() {
                _scanned = false;
                _pairingCode = null;
                _error = null;
              });
              _controller.start();
            },
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _pairDevice(code, _nameController.text.trim().isNotEmpty
                  ? _nameController.text.trim()
                  : 'My TV');
            },
            style: FilledButton.styleFrom(
              backgroundColor: PrayCalcColors.dark,
            ),
            child: const Text('Pair', style: TextStyle(color: PrayCalcColors.light)),
          ),
        ],
      ),
    );
  }

  Future<void> _pairDevice(String code, String name) async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final token = AuthService.instance.accessToken;
    if (token == null) {
        if (mounted) {
        final l = AppLocalizations.of(context)!;
        setState(() {
          _loading = false;
          _error = l.tvPairingSignInRequired;
          _scanned = false;
          _pairingCode = null;
        });
        _controller.start();
      }
      return;
    }

    try {
      final resp = await http
          .post(
            Uri.parse('$_kSmartBase/pair'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: jsonEncode({
              'pairing_code': code,
              'device_name': name,
            }),
          )
          .timeout(const Duration(seconds: 15));

      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body) as Map<String, dynamic>;
        final deviceId = body['device_id'] as String? ?? code;
        final deviceModel = body['device_model'] as String? ?? 'TV';

        await _savePairedDevice(PairedTvDevice(
          id: deviceId,
          name: name,
          model: deviceModel,
          isOnline: true,
          lastSeen: DateTime.now(),
        ));

        if (mounted) setState(() => _success = true);
      } else {
        final body = jsonDecode(resp.body) as Map<String, dynamic>? ?? {};
        setState(() {
          _loading = false;
          _error = body['error'] as String? ?? 'Pairing failed (${resp.statusCode}).';
          _scanned = false;
          _pairingCode = null;
        });
        _controller.start();
      }
    } on TimeoutException {
      if (mounted) {
        final l = AppLocalizations.of(context)!;
        setState(() {
          _loading = false;
          _error = l.tvPairingTimeout;
          _scanned = false;
          _pairingCode = null;
        });
        _controller.start();
      }
    } catch (e) {
      if (mounted) {
        final l = AppLocalizations.of(context)!;
        setState(() {
          _loading = false;
          _error = l.tvPairingServerError;
          _scanned = false;
          _pairingCode = null;
        });
        _controller.start();
      }
    }
  }

  Future<void> _savePairedDevice(PairedTvDevice device) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('paired_tv_devices');
    final list = raw != null
        ? (jsonDecode(raw) as List)
            .whereType<Map<String, dynamic>>()
            .map(PairedTvDevice.fromJson)
            .toList()
        : <PairedTvDevice>[];
    list.removeWhere((d) => d.id == device.id);
    list.add(device);
    await prefs.setString(
      'paired_tv_devices',
      jsonEncode(list.map((d) => d.toJson()).toList()),
    );
  }

  // ---------------------------------------------------------------------------
  // Manual code entry fallback
  // ---------------------------------------------------------------------------

  void _enterCodeManually() {
    _controller.stop();
    final codeController = TextEditingController();
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: PrayCalcColors.surface,
        title: const Text(
          'Enter pairing code',
          style: TextStyle(color: Colors.white),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Enter the 6-character code shown on your TV.',
              style: TextStyle(color: Colors.white54, fontSize: 13),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: codeController,
              autofocus: true,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontFamily: 'monospace',
                letterSpacing: 6,
              ),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9]')),
                LengthLimitingTextInputFormatter(6),
                _UpperCaseFormatter(),
              ],
              textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(
                hintText: 'ABC123',
                hintStyle: TextStyle(color: Colors.white38),
                enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: PrayCalcColors.mid),
                ),
                focusedBorder: UnderlineInputBorder(
                  borderSide:
                      BorderSide(color: PrayCalcColors.light, width: 2),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _controller.start();
            },
            child:
                const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          FilledButton(
            onPressed: () {
              final code = codeController.text.trim().toUpperCase();
              if (code.length == 6) {
                Navigator.of(ctx).pop();
                setState(() {
                  _scanned = true;
                  _pairingCode = code;
                });
                _showNameDialog(code);
              }
            },
            style: FilledButton.styleFrom(backgroundColor: PrayCalcColors.dark),
            child: const Text('Next',
                style: TextStyle(color: PrayCalcColors.light)),
          ),
        ],
      ),
    ).then((_) {
      codeController.dispose();
    });
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      appBar: AppBar(
        backgroundColor: PrayCalcColors.deep,
        foregroundColor: Colors.white,
        title: Text(AppLocalizations.of(context)!.tvPairingScanQr),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          TextButton(
            onPressed: _enterCodeManually,
            child: Text(
              AppLocalizations.of(context)!.tvPairingEnterManually,
              style: const TextStyle(color: PrayCalcColors.light),
            ),
          ),
        ],
      ),
      body: _success
          ? _buildSuccess()
          : _loading
              ? _buildLoading()
              : _buildScanner(),
    );
  }

  Widget _buildScanner() {
    return Stack(
      children: [
        MobileScanner(
          controller: _controller,
          onDetect: _onDetect,
        ),
        // Overlay with scan window
        CustomPaint(
          painter: _ScanOverlayPainter(),
          child: const SizedBox.expand(),
        ),
        // Instructions
        Positioned(
          bottom: 48,
          left: 0,
          right: 0,
          child: Column(
            children: [
              if (_error != null) ...[
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 32),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.red.withAlpha(200),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _error!,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 12),
              ],
              Text(
                AppLocalizations.of(context)!.tvPairingScanInstruction,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  shadows: [Shadow(blurRadius: 6, color: Colors.black)],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: _enterCodeManually,
                icon: const Icon(Icons.keyboard, color: Colors.white),
                label: Text(
                  AppLocalizations.of(context)!.tvPairingEnterManually,
                  style: TextStyle(color: Colors.white),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.white54),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLoading() {
    final code = _pairingCode ?? '';
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: PrayCalcColors.mid),
          const SizedBox(height: 24),
          Text(
            code.isNotEmpty ? 'Pairing TV ($code)...' : 'Pairing TV...',
            style: const TextStyle(color: Colors.white, fontSize: 18),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccess() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle, color: PrayCalcColors.mid, size: 80),
            const SizedBox(height: 24),
            Text(
              '${_nameController.text.trim().isNotEmpty ? _nameController.text.trim() : 'TV'} paired!',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              AppLocalizations.of(context)!.tvPairingSuccessSubtitle,
              style: const TextStyle(color: Colors.white54, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            FilledButton.icon(
              onPressed: () => Navigator.of(context).pop(true),
              icon: const Icon(Icons.arrow_back),
              label: Text(AppLocalizations.of(context)!.tvPairingBackToMyTvs),
              style: FilledButton.styleFrom(
                backgroundColor: PrayCalcColors.dark,
                foregroundColor: PrayCalcColors.light,
                minimumSize: const Size(200, 48),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// QR scan window overlay painter
// ---------------------------------------------------------------------------

class _ScanOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final dim = size.width * 0.65;
    final left = (size.width - dim) / 2;
    final top = (size.height - dim) / 2 - 40;
    final rect = Rect.fromLTWH(left, top, dim, dim);

    final backgroundPaint = Paint()..color = Colors.black54;
    final outerPath = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height));
    final innerPath = Path()
      ..addRRect(RRect.fromRectAndRadius(rect, const Radius.circular(12)));
    canvas.drawPath(
      Path.combine(PathOperation.difference, outerPath, innerPath),
      backgroundPaint,
    );

    final borderPaint = Paint()
      ..color = PrayCalcColors.light
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;
    const cornerLen = 24.0;
    // Top-left
    canvas.drawLine(Offset(left, top + cornerLen), Offset(left, top), borderPaint);
    canvas.drawLine(Offset(left, top), Offset(left + cornerLen, top), borderPaint);
    // Top-right
    canvas.drawLine(
        Offset(left + dim - cornerLen, top), Offset(left + dim, top), borderPaint);
    canvas.drawLine(
        Offset(left + dim, top), Offset(left + dim, top + cornerLen), borderPaint);
    // Bottom-left
    canvas.drawLine(
        Offset(left, top + dim - cornerLen), Offset(left, top + dim), borderPaint);
    canvas.drawLine(
        Offset(left, top + dim), Offset(left + cornerLen, top + dim), borderPaint);
    // Bottom-right
    canvas.drawLine(Offset(left + dim - cornerLen, top + dim),
        Offset(left + dim, top + dim), borderPaint);
    canvas.drawLine(Offset(left + dim, top + dim - cornerLen),
        Offset(left + dim, top + dim), borderPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

class _UpperCaseFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    return newValue.copyWith(text: newValue.text.toUpperCase());
  }
}
