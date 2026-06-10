import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// PIN screen for kiosk mode (TV2-11.2)
// ---------------------------------------------------------------------------

/// SEC-A4: Salt the PIN hash with the device ID prefix.
/// Format: sha256("praycalc_kiosk_${deviceId}_$pin")
String _hashPin(String pin, {String deviceId = ''}) =>
    sha256.convert(utf8.encode('praycalc_kiosk_${deviceId}_$pin')).toString();

/// Full-screen D-pad-navigable 4-digit PIN entry.
///
/// Push this screen and await the result — it returns `true` when the correct
/// PIN is entered, or pops with `false` after the view is dismissed.
///
/// Usage:
/// ```dart
/// final unlocked = await Navigator.of(context).push<bool>(
///   MaterialPageRoute(builder: (_) => TvKioskPinScreen(pinHash: hash)),
/// );
/// ```
class TvKioskPinScreen extends StatefulWidget {
  const TvKioskPinScreen({super.key, required this.pinHash});

  /// SHA-256 hex hash of the correct 4-digit PIN.
  final String pinHash;

  @override
  State<TvKioskPinScreen> createState() => _TvKioskPinScreenState();
}

class _TvKioskPinScreenState extends State<TvKioskPinScreen> {
  String _entered = '';
  int _attempts = 0;
  DateTime? _lockoutUntil;
  String? _error;

  static const _maxAttempts = 3;
  static const _lockoutDuration = Duration(minutes: 5);

  bool get _isLockedOut =>
      _lockoutUntil != null && DateTime.now().isBefore(_lockoutUntil!);

  void _onDigit(String digit) {
    if (_isLockedOut || _entered.length >= 4) return;
    setState(() => _entered += digit);
    if (_entered.length == 4) _checkPin();
  }

  void _onBackspace() {
    if (_entered.isEmpty) return;
    setState(() => _entered = _entered.substring(0, _entered.length - 1));
  }

  void _checkPin() {
    if (_hashPin(_entered) == widget.pinHash) {
      // Correct — pop with success.
      if (mounted) Navigator.of(context).pop(true);
      return;
    }

    _attempts++;
    if (_attempts >= _maxAttempts) {
      setState(() {
        _lockoutUntil = DateTime.now().add(_lockoutDuration);
        _error = 'Locked for 5 minutes.';
        _entered = '';
      });
    } else {
      setState(() {
        _error = 'Incorrect PIN. ${_maxAttempts - _attempts} attempt${_maxAttempts - _attempts == 1 ? '' : 's'} remaining.';
        _entered = '';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_outline, color: Colors.white54, size: 64),
              const SizedBox(height: 24),
              const Text(
                'Enter Admin PIN',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 32),

              // 4-dot indicator
              _PinDots(filled: _entered.length),

              // Error / lockout message
              if (_error != null) ...[
                const SizedBox(height: 20),
                Text(
                  _error!,
                  style: TextStyle(color: Colors.red[300], fontSize: 16),
                  textAlign: TextAlign.center,
                ),
              ],

              if (_isLockedOut) ...[
                const SizedBox(height: 12),
                const Text(
                  'Try again in 5 minutes.',
                  style: TextStyle(color: Colors.white38, fontSize: 14),
                ),
              ] else ...[
                const SizedBox(height: 36),
                _Numpad(
                  onDigit: _onDigit,
                  onBackspace: _onBackspace,
                  onConfirm: _entered.length == 4 ? _checkPin : null,
                ),
              ],

              const SizedBox(height: 32),
              const Text(
                'Reset via remote dashboard',
                style: TextStyle(color: Colors.white24, fontSize: 13),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// PIN dot row
// ---------------------------------------------------------------------------

class _PinDots extends StatelessWidget {
  const _PinDots({required this.filled});
  final int filled;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(4, (i) {
        return Container(
          width: 20,
          height: 20,
          margin: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: i < filled ? PrayCalcColors.mid : Colors.white24,
          ),
        );
      }),
    );
  }
}

// ---------------------------------------------------------------------------
// Numpad
// ---------------------------------------------------------------------------

class _Numpad extends StatelessWidget {
  const _Numpad({
    required this.onDigit,
    required this.onBackspace,
    this.onConfirm,
  });

  final ValueChanged<String> onDigit;
  final VoidCallback onBackspace;
  final VoidCallback? onConfirm;

  static const _rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['←', '0', '✓'],
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: _rows.map((row) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: row.map((key) {
            VoidCallback? action;
            if (key == '←') {
              action = onBackspace;
            } else if (key == '✓') {
              action = onConfirm;
            } else {
              action = () => onDigit(key);
            }
            return _NumKey(label: key, onPressed: action);
          }).toList(),
        );
      }).toList(),
    );
  }
}

// ---------------------------------------------------------------------------
// Individual numpad key (D-pad focusable)
// ---------------------------------------------------------------------------

class _NumKey extends StatelessWidget {
  const _NumKey({required this.label, required this.onPressed});
  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final isDisabled = onPressed == null;
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onPressed?.call();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(
        builder: (ctx) {
          final focused = Focus.of(ctx).hasFocus;
          return GestureDetector(
            onTap: onPressed,
            child: Container(
              width: 80,
              height: 64,
              margin: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: isDisabled
                    ? Colors.white10
                    : focused
                        ? PrayCalcColors.dark
                        : PrayCalcColors.surface,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: focused && !isDisabled
                      ? PrayCalcColors.mid
                      : Colors.white12,
                ),
              ),
              child: Center(
                child: Text(
                  label,
                  style: TextStyle(
                    color: isDisabled ? Colors.white24 : Colors.white,
                    fontSize: 24,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
