import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';
import '../../core/router/app_router.dart';

/// TV2-10.15 — Add TV from mobile.
///
/// Flow:
///   1. User enters the 8-character user_code displayed on the TV pairing screen.
///   2. App calls POST /api/v1/tv/auth/authorize with the code.
///   3. User names the TV (optional).
///   4. Success → navigate back to Paired TVs list.
///
/// The TV will see it is authorized on its next poll of GET /api/v1/tv/auth/poll.
class TvAddFromMobileScreen extends StatefulWidget {
  const TvAddFromMobileScreen({super.key});

  @override
  State<TvAddFromMobileScreen> createState() => _TvAddFromMobileScreenState();
}

class _TvAddFromMobileScreenState extends State<TvAddFromMobileScreen> {
  static const _smartBase = 'https://smart.praycalc.com/api/v1/tv';

  final _codeController = TextEditingController();
  final _nameController = TextEditingController();
  final _codeFocus = FocusNode();

  bool _loading = false;
  bool _authorized = false;
  String? _error;

  @override
  void dispose() {
    _codeController.dispose();
    _nameController.dispose();
    _codeFocus.dispose();
    super.dispose();
  }

  Future<String?> _getJwt() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('tv_jwt');
  }

  Future<void> _authorize() async {
    final raw = _codeController.text.trim().replaceAll('-', '').toUpperCase();
    if (raw.length < 6) {
      setState(() => _error = 'Enter the full code shown on your TV.');
      return;
    }

    setState(() { _loading = true; _error = null; });

    try {
      final jwt = await _getJwt();
      final res = await http.post(
        Uri.parse('$_smartBase/auth/authorize'),
        headers: {
          'Content-Type': 'application/json',
          if (jwt != null) 'Authorization': 'Bearer $jwt',
        },
        body: jsonEncode({'user_code': raw}),
      );

      final body = jsonDecode(res.body) as Map<String, dynamic>;

      if (res.statusCode == 200 && body['authorized'] == true) {
        setState(() { _authorized = true; _loading = false; });
      } else {
        setState(() {
          _error = (body['error'] as String?) ?? 'Invalid or expired code.';
          _loading = false;
        });
      }
    } catch (_) {
      setState(() {
        _error = 'Could not reach the server. Check your connection.';
        _loading = false;
      });
    }
  }

  Future<void> _finish() async {
    // The TV was already authorized in step 1.
    // If user entered a name, call PATCH /api/v1/tv/:id — but we don't have
    // the device_id here (the TV gets it from the poll response). The name can
    // be set later from the Paired TVs → Remote Settings screen.
    // For now: just navigate back so the user sees their updated list.
    if (mounted) context.go(Routes.pairedTvs);
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
        child: _authorized ? _buildSuccess() : _buildCodeEntry(),
      ),
    );
  }

  Widget _buildCodeEntry() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),

        // Instruction card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: PrayCalcColors.dark.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: PrayCalcColors.mid.withValues(alpha: 0.2)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.tv, color: PrayCalcColors.mid, size: 32),
              const SizedBox(height: 12),
              const Text(
                'On your TV, open PrayCalc and go to the pairing screen.',
                style: TextStyle(color: Colors.white, fontSize: 16),
              ),
              const SizedBox(height: 8),
              const Text(
                'Enter the code shown on screen below.',
                style: TextStyle(color: Colors.white70, fontSize: 14),
              ),
            ],
          ),
        ),

        const SizedBox(height: 32),

        const Text(
          'TV pairing code',
          style: TextStyle(
            color: Colors.white70,
            fontSize: 13,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),

        // Code input — uppercase, auto-formats as XXXX-XXXX
        TextField(
          controller: _codeController,
          focusNode: _codeFocus,
          autofocus: true,
          textCapitalization: TextCapitalization.characters,
          keyboardType: TextInputType.text,
          maxLength: 9, // 8 chars + optional dash
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'[A-Za-z0-9\-]')),
            _CodeFormatter(),
          ],
          style: const TextStyle(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.bold,
            letterSpacing: 6,
          ),
          textAlign: TextAlign.center,
          decoration: InputDecoration(
            counterText: '',
            hintText: 'WXYZ-1234',
            hintStyle: TextStyle(
              color: Colors.white.withValues(alpha: 0.2),
              fontSize: 28,
              fontWeight: FontWeight.bold,
              letterSpacing: 6,
            ),
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.06),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: PrayCalcColors.mid, width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          ),
          onSubmitted: (_) => _authorize(),
        ),

        if (_error != null) ...[
          const SizedBox(height: 12),
          Text(
            _error!,
            style: const TextStyle(color: Colors.redAccent, fontSize: 14),
          ),
        ],

        const SizedBox(height: 32),

        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: _loading ? null : _authorize,
            style: FilledButton.styleFrom(
              backgroundColor: PrayCalcColors.dark,
              foregroundColor: PrayCalcColors.light,
              padding: const EdgeInsets.symmetric(vertical: 18),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: _loading
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: PrayCalcColors.light,
                    ),
                  )
                : const Text(
                    'Pair TV',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
          ),
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
            color: PrayCalcColors.dark,
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.check_rounded,
            color: PrayCalcColors.light,
            size: 40,
          ),
        ),
        const SizedBox(height: 24),
        const Text(
          'TV paired!',
          style: TextStyle(
            color: Colors.white,
            fontSize: 26,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Your TV will update automatically\nwithin a few seconds.',
          style: TextStyle(color: Colors.white54, fontSize: 16),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 40),

        const Align(
          alignment: Alignment.centerLeft,
          child: Text(
            'Name your TV (optional)',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 13,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _nameController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Living Room TV',
            hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.06),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide.none,
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: PrayCalcColors.mid, width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
          ),
        ),

        const SizedBox(height: 24),

        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: _finish,
            style: FilledButton.styleFrom(
              backgroundColor: PrayCalcColors.dark,
              foregroundColor: PrayCalcColors.light,
              padding: const EdgeInsets.symmetric(vertical: 18),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: const Text(
              'Done',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }
}

/// Formats the entered code as XXXX-XXXX automatically.
class _CodeFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final raw = newValue.text.replaceAll('-', '').toUpperCase();
    final limited = raw.length > 8 ? raw.substring(0, 8) : raw;

    String formatted;
    if (limited.length <= 4) {
      formatted = limited;
    } else {
      formatted = '${limited.substring(0, 4)}-${limited.substring(4)}';
    }

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
