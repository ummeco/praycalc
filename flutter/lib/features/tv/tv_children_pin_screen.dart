// Y-2: TV Children's Mode — PIN entry screen
//
// D-pad navigable PIN entry for parents to exit children's mode.
// The PIN is stored encrypted via flutter_secure_storage and defaults to '1234'
// on first use. Four digit bubbles fill as the parent enters digits using the
// remote directional keys (0–9 mapped to number keys or on-screen numpad).
//
// Correct PIN → calls [onSuccess].
// Cancel / BACK → calls [onCancel].

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../core/theme/app_theme.dart';

// ─── Storage key ─────────────────────────────────────────────────────────────

const _kPinStorageKey = 'tv_children_mode_pin';
const _kDefaultPin = '1234';

// ─── Widget ──────────────────────────────────────────────────────────────────

/// Fullscreen PIN entry for exiting children's mode.
///
/// Uses [FlutterSecureStorage] to persist the PIN across sessions.
class TvChildrenPinScreen extends StatefulWidget {
  const TvChildrenPinScreen({
    super.key,
    required this.onSuccess,
    required this.onCancel,
  });

  final VoidCallback onSuccess;
  final VoidCallback onCancel;

  @override
  State<TvChildrenPinScreen> createState() => _TvChildrenPinScreenState();
}

class _TvChildrenPinScreenState extends State<TvChildrenPinScreen>
    with SingleTickerProviderStateMixin {
  final _storage = const FlutterSecureStorage();
  final _focusNode = FocusNode();

  String _entered = '';
  bool _error = false;
  int _attempts = 0;

  // Shake animation on wrong PIN
  late AnimationController _shakeCtrl;
  late Animation<double> _shakeAnim;

  // Selected numpad key (row, col) for D-pad navigation
  int _selectedRow = 0;
  int _selectedCol = 0;

  // Numpad layout: rows of digit labels
  static const _numpad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['←', '0', '✓'],
  ];

  @override
  void initState() {
    super.initState();
    _shakeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _shakeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _shakeCtrl, curve: Curves.elasticIn),
    );
    _shakeCtrl.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        setState(() {
          _error = false;
          _entered = '';
        });
        _shakeCtrl.reset();
      }
    });
  }

  @override
  void dispose() {
    _shakeCtrl.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<String> _storedPin() async {
    return await _storage.read(key: _kPinStorageKey) ?? _kDefaultPin;
  }

  void _onKey(String label) async {
    if (_error) return;
    if (label == '←') {
      if (_entered.isNotEmpty) {
        setState(() => _entered = _entered.substring(0, _entered.length - 1));
      }
      return;
    }
    if (label == '✓') {
      await _submit();
      return;
    }
    if (_entered.length >= 4) return;
    setState(() => _entered += label);
    if (_entered.length == 4) {
      await Future.delayed(const Duration(milliseconds: 100));
      await _submit();
    }
  }

  Future<void> _submit() async {
    final correct = await _storedPin();
    if (_entered == correct) {
      widget.onSuccess();
    } else {
      _attempts++;
      setState(() => _error = true);
      _shakeCtrl.forward(from: 0);
    }
  }

  void _handleKeyEvent(KeyEvent event) {
    if (event is! KeyDownEvent) return;

    final key = event.logicalKey;

    // Number keys 0–9
    if (key.keyId >= LogicalKeyboardKey.digit0.keyId &&
        key.keyId <= LogicalKeyboardKey.digit9.keyId) {
      _onKey((key.keyId - LogicalKeyboardKey.digit0.keyId).toString());
      return;
    }
    if (key.keyId >= LogicalKeyboardKey.numpad0.keyId &&
        key.keyId <= LogicalKeyboardKey.numpad9.keyId) {
      _onKey((key.keyId - LogicalKeyboardKey.numpad0.keyId).toString());
      return;
    }

    switch (key) {
      case LogicalKeyboardKey.arrowUp:
        setState(() => _selectedRow = (_selectedRow - 1).clamp(0, 3));
      case LogicalKeyboardKey.arrowDown:
        setState(() => _selectedRow = (_selectedRow + 1).clamp(0, 3));
      case LogicalKeyboardKey.arrowLeft:
        setState(() => _selectedCol = (_selectedCol - 1).clamp(0, 2));
      case LogicalKeyboardKey.arrowRight:
        setState(() => _selectedCol = (_selectedCol + 1).clamp(0, 2));
      case LogicalKeyboardKey.select:
      case LogicalKeyboardKey.enter:
        _onKey(_numpad[_selectedRow][_selectedCol]);
      case LogicalKeyboardKey.backspace:
        _onKey('←');
      case LogicalKeyboardKey.goBack:
      case LogicalKeyboardKey.escape:
        widget.onCancel();
      default:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: KeyboardListener(
        focusNode: _focusNode,
        autofocus: true,
        onKeyEvent: _handleKeyEvent,
        child: Center(
          child: SizedBox(
            width: 480,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Title
                const Text(
                  'Parent PIN',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.w300,
                    letterSpacing: 4,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Enter your 4-digit PIN to exit',
                  style: TextStyle(
                    color: Colors.white.withAlpha(120),
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 40),

                // PIN dots with shake on error
                AnimatedBuilder(
                  animation: _shakeAnim,
                  builder: (_, child) => Transform.translate(
                    offset: Offset(
                      _error
                          ? math.sin(_shakeAnim.value * math.pi * 8) * 12
                          : 0,
                      0,
                    ),
                    child: child,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(4, (i) {
                      final filled = i < _entered.length;
                      return Container(
                        width: 20,
                        height: 20,
                        margin: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _error
                              ? Colors.red.withAlpha(200)
                              : filled
                                  ? PrayCalcColors.mid
                                  : Colors.white.withAlpha(40),
                          border: Border.all(
                            color: filled
                                ? PrayCalcColors.light
                                : Colors.white.withAlpha(60),
                            width: 1.5,
                          ),
                        ),
                      );
                    }),
                  ),
                ),

                if (_error && _attempts >= 1)
                  const Padding(
                    padding: EdgeInsets.only(top: 12),
                    child: Text(
                      'Incorrect PIN',
                      style: TextStyle(color: Colors.redAccent, fontSize: 14),
                    ),
                  ),

                const SizedBox(height: 40),

                // On-screen numpad
                ..._numpad.asMap().entries.map((rowEntry) {
                  final row = rowEntry.key;
                  final keys = rowEntry.value;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: keys.asMap().entries.map((colEntry) {
                        final col = colEntry.key;
                        final label = colEntry.value;
                        final selected =
                            row == _selectedRow && col == _selectedCol;
                        final isAction = label == '←' || label == '✓';
                        return GestureDetector(
                          onTap: () => _onKey(label),
                          child: Container(
                            width: 80,
                            height: 70,
                            margin: const EdgeInsets.symmetric(horizontal: 8),
                            decoration: BoxDecoration(
                              color: selected
                                  ? PrayCalcColors.dark
                                  : Colors.white.withAlpha(10),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: selected
                                    ? PrayCalcColors.mid
                                    : Colors.white.withAlpha(30),
                                width: selected ? 2 : 1,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                label,
                                style: TextStyle(
                                  color: isAction
                                      ? PrayCalcColors.light
                                      : Colors.white,
                                  fontSize: isAction ? 22 : 28,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  );
                }),

                const SizedBox(height: 24),

                // Cancel
                TextButton(
                  onPressed: widget.onCancel,
                  child: Text(
                    'Cancel',
                    style: TextStyle(
                      color: Colors.white.withAlpha(100),
                      fontSize: 16,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
