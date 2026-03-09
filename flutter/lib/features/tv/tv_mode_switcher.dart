// P-5: Home screen mode switcher
//
// An overlay that appears when the user presses the Menu/Guide button on the
// TV remote. Shows a horizontal pill row of layout preset options navigable
// via D-pad left/right. Selecting a preset applies it immediately and hides
// the switcher.
//
// The overlay auto-dismisses after 8 seconds of inactivity.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/tv_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/tv_settings_model.dart';

// ─── Mode entries ─────────────────────────────────────────────────────────────

class _ModeEntry {
  final TvLayoutPreset preset;
  final String label;
  final IconData icon;

  const _ModeEntry(this.preset, this.label, this.icon);
}

const _kModes = [
  _ModeEntry(TvLayoutPreset.prayerOnly, 'Prayer Times', Icons.access_time),
  _ModeEntry(TvLayoutPreset.splitStream, 'Live Stream', Icons.live_tv),
  _ModeEntry(TvLayoutPreset.splitArt, 'Art + Prayer', Icons.photo),
  _ModeEntry(TvLayoutPreset.infoRich, 'Info Rich', Icons.dashboard),
  _ModeEntry(TvLayoutPreset.masjid, 'Masjid', Icons.mosque),
];

// ─── Widget ──────────────────────────────────────────────────────────────────

/// Horizontal mode switcher overlay.
///
/// Mount on top of the home screen content. Dismisses via [onDismiss].
class TvModeSwitcher extends ConsumerStatefulWidget {
  const TvModeSwitcher({
    super.key,
    required this.currentPreset,
    required this.onDismiss,
  });

  final TvLayoutPreset currentPreset;
  final VoidCallback onDismiss;

  @override
  ConsumerState<TvModeSwitcher> createState() => _TvModeSwitcherState();
}

class _TvModeSwitcherState extends ConsumerState<TvModeSwitcher>
    with SingleTickerProviderStateMixin {
  late AnimationController _fade;
  late int _selectedIdx;
  Timer? _idleTimer;
  final _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _fade = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    )..forward();

    _selectedIdx = _kModes.indexWhere(
      (m) => m.preset == widget.currentPreset,
    );
    if (_selectedIdx < 0) _selectedIdx = 0;
    _resetIdle();
  }

  @override
  void dispose() {
    _fade.dispose();
    _idleTimer?.cancel();
    _focusNode.dispose();
    super.dispose();
  }

  void _resetIdle() {
    _idleTimer?.cancel();
    _idleTimer = Timer(const Duration(seconds: 8), _dismiss);
  }

  void _dismiss() {
    _fade.reverse().then((_) {
      if (mounted) widget.onDismiss();
    });
  }

  void _select(int idx) {
    setState(() => _selectedIdx = idx);
    _resetIdle();
    final notifier = ref.read(tvSettingsProvider.notifier);
    final preset = _kModes[idx].preset;
    notifier.setLayoutSettings(
      ref.read(tvSettingsProvider).layoutSettings.copyWith(preset: preset),
    );
  }

  void _applyAndDismiss() {
    _dismiss();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fade,
      child: Focus(
        focusNode: _focusNode,
        autofocus: true,
        onKeyEvent: (_, event) {
          if (event is! KeyDownEvent) return KeyEventResult.ignored;
          _resetIdle();
          switch (event.logicalKey) {
            case LogicalKeyboardKey.arrowLeft:
              if (_selectedIdx > 0) _select(_selectedIdx - 1);
              return KeyEventResult.handled;
            case LogicalKeyboardKey.arrowRight:
              if (_selectedIdx < _kModes.length - 1) {
                _select(_selectedIdx + 1);
              }
              return KeyEventResult.handled;
            case LogicalKeyboardKey.select:
            case LogicalKeyboardKey.enter:
              _applyAndDismiss();
              return KeyEventResult.handled;
            case LogicalKeyboardKey.escape:
            case LogicalKeyboardKey.goBack:
              _dismiss();
              return KeyEventResult.handled;
            default:
              return KeyEventResult.ignored;
          }
        },
        child: Align(
          alignment: Alignment.topCenter,
          child: Padding(
            padding: const EdgeInsets.only(top: 24),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.80),
                borderRadius: BorderRadius.circular(40),
                border: Border.all(
                  color: PrayCalcColors.mid.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: List.generate(_kModes.length, (i) {
                  final mode = _kModes[i];
                  final isSelected = i == _selectedIdx;
                  return GestureDetector(
                    onTap: () {
                      _select(i);
                      _applyAndDismiss();
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.symmetric(horizontal: 6),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 18, vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? PrayCalcColors.dark
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(28),
                        border: Border.all(
                          color: isSelected
                              ? PrayCalcColors.mid
                              : Colors.white.withValues(alpha: 0.15),
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            mode.icon,
                            size: 20,
                            color: isSelected
                                ? PrayCalcColors.light
                                : Colors.white54,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            mode.label,
                            style: TextStyle(
                              color: isSelected
                                  ? Colors.white
                                  : Colors.white54,
                              fontSize: 16,
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
