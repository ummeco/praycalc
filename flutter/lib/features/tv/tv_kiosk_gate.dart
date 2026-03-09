import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/providers/tv_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/tv_settings_model.dart';

String _hashPin(String pin) =>
    sha256.convert(utf8.encode(pin)).toString();

/// Returns true when kiosk mode is active and the layout preset is locked
/// to 'masjid'. Used by TvSettingsScreen to grey out layout selection (TV2-11.3).
bool isLayoutLocked(TvSettings s) => s.kioskMode;

/// Gate widget: if kiosk mode is on, wraps child behind PIN entry.
/// Place around TvSettingsScreen.
class TvKioskGate extends ConsumerStatefulWidget {
  const TvKioskGate({super.key, required this.child});
  final Widget child;

  @override
  ConsumerState<TvKioskGate> createState() => _TvKioskGateState();
}

class _TvKioskGateState extends ConsumerState<TvKioskGate> {
  bool _unlocked = false;
  String _entered = '';
  int _attempts = 0;
  DateTime? _lockoutUntil;
  String? _error;

  bool get _isLockedOut =>
      _lockoutUntil != null && DateTime.now().isBefore(_lockoutUntil!);

  void _onDigit(String digit) {
    if (_isLockedOut || _entered.length >= 4) return;
    setState(() => _entered += digit);
    if (_entered.length == 4) _checkPin();
  }

  void _checkPin() {
    final settings = ref.read(tvSettingsProvider);
    if (_hashPin(_entered) == settings.kioskPinHash) {
      setState(() {
        _unlocked = true;
        _error = null;
        _attempts = 0;
      });
    } else {
      _attempts++;
      if (_attempts >= 3) {
        _lockoutUntil = DateTime.now().add(const Duration(minutes: 5));
        setState(() {
          _error = 'Too many attempts. Locked for 5 minutes.';
          _entered = '';
        });
      } else {
        setState(() {
          _error = 'Incorrect PIN. ${3 - _attempts} attempts remaining.';
          _entered = '';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(tvSettingsProvider);

    // In kiosk mode, enforce masjid layout regardless of stored preset (TV2-11.3).
    if (settings.kioskMode && settings.layoutSettings.preset != TvLayoutPreset.masjid) {
      Future.microtask(() {
        ref.read(tvSettingsProvider.notifier).setLayoutSettings(
              TvLayoutSettings.forPreset(TvLayoutPreset.masjid),
            );
      });
    }

    // If kiosk mode off, or PIN hash empty (no PIN set), pass through without gate.
    if (!settings.kioskMode || _unlocked) return widget.child;

    // Kiosk mode on but no PIN configured — still pass through (no hash = no lock).
    if (settings.kioskPinHash.isEmpty) return widget.child;

    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.lock, color: Colors.white54, size: 64),
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
            // PIN dots
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                4,
                (i) => Container(
                  width: 20,
                  height: 20,
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: i < _entered.length
                        ? PrayCalcColors.mid
                        : Colors.white24,
                  ),
                ),
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(
                _error!,
                style: TextStyle(color: Colors.red[300], fontSize: 16),
              ),
            ],
            if (_isLockedOut) ...[
              const SizedBox(height: 16),
              const Text(
                'Try again in 5 minutes',
                style: TextStyle(color: Colors.white54),
              ),
            ] else ...[
              const SizedBox(height: 32),
              ..._buildNumpad(),
            ],
          ],
        ),
      ),
    );
  }

  List<Widget> _buildNumpad() {
    final rows = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['←', '0', '✓'],
    ];
    return rows
        .map(
          (row) => Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: row
                .map(
                  (key) => _NumKey(
                    label: key,
                    onPressed: () {
                      if (key == '←') {
                        if (_entered.isNotEmpty) {
                          setState(() => _entered =
                              _entered.substring(0, _entered.length - 1));
                        }
                      } else if (key == '✓') {
                        if (_entered.length == 4) _checkPin();
                      } else {
                        _onDigit(key);
                      }
                    },
                  ),
                )
                .toList(),
          ),
        )
        .toList();
  }
}

class _NumKey extends StatelessWidget {
  const _NumKey({required this.label, required this.onPressed});
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onPressed();
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
                color: focused ? PrayCalcColors.dark : PrayCalcColors.surface,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: focused ? PrayCalcColors.mid : Colors.white12,
                ),
              ),
              child: Center(
                child: Text(
                  label,
                  style: const TextStyle(color: Colors.white, fontSize: 24),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
