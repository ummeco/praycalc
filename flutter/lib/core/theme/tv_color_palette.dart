import 'package:flutter/material.dart';

import '../../shared/models/tv_settings_model.dart';

// ---------------------------------------------------------------------------
// U-1: TV color palette resolution
// ---------------------------------------------------------------------------

/// Resolved colors for a named TV color palette.
///
/// Consumed by TvPrayerRail, TvPrayerGrid, TvAdhanOverlay, TvCanvasLayout,
/// and any widget that needs palette-aware theming.
@immutable
class TvColorPalette {
  final Color primary;   // main accent (buttons, borders, active highlights)
  final Color accent;    // brighter accent (text, icons on dark)
  final Color deepBg;    // darkest background
  final Color cardBg;    // card/tile background

  const TvColorPalette({
    required this.primary,
    required this.accent,
    required this.deepBg,
    required this.cardBg,
  });

  /// Returns the [TvColorPalette] for the given [TvColorPaletteName].
  static TvColorPalette forName(TvColorPaletteName name) {
    switch (name) {
      case TvColorPaletteName.emerald:
        return const TvColorPalette(
          primary: Color(0xFF79C24C),
          accent:  Color(0xFFC9F27A),
          deepBg:  Color(0xFF0D2F17),
          cardBg:  Color(0xFF1E5E2F),
        );
      case TvColorPaletteName.midnightBlue:
        return const TvColorPalette(
          primary: Color(0xFF3B7DD8),
          accent:  Color(0xFF8BBFF5),
          deepBg:  Color(0xFF0A1628),
          cardBg:  Color(0xFF1A3460),
        );
      case TvColorPaletteName.warmGold:
        return const TvColorPalette(
          primary: Color(0xFFB8860B),
          accent:  Color(0xFFFFD700),
          deepBg:  Color(0xFF1A0F00),
          cardBg:  Color(0xFF3D2800),
        );
      case TvColorPaletteName.slate:
        return const TvColorPalette(
          primary: Color(0xFF708090),
          accent:  Color(0xFFB0C4DE),
          deepBg:  Color(0xFF0D0F12),
          cardBg:  Color(0xFF1E2530),
        );
      case TvColorPaletteName.desertRose:
        return const TvColorPalette(
          primary: Color(0xFF8B4563),
          accent:  Color(0xFFD4A0B5),
          deepBg:  Color(0xFF1A0A10),
          cardBg:  Color(0xFF3D1A28),
        );
    }
  }

  /// Convenience: resolve directly from [TvSettings].
  static TvColorPalette fromSettings(dynamic settings) {
    // Accept TvSettings or anything with a .colorPalette field.
    try {
      return forName((settings as dynamic).colorPalette as TvColorPaletteName);
    } catch (_) {
      return forName(TvColorPaletteName.emerald);
    }
  }
}
