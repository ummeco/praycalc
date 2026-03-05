import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// PrayCalc brand palette.
/// Source: Ummat PPI — #C9F27A (light) · #79C24C (mid) · #1E5E2F (dark) · #0D2F17 (deep)
class PrayCalcColors {
  static const light = Color(0xFFC9F27A);
  static const mid   = Color(0xFF79C24C);
  static const dark  = Color(0xFF1E5E2F);
  static const deep  = Color(0xFF0D2F17);

  // App backgrounds — match web palette
  static const surface = Color(0xFF0A1A0F);   // card surface (dark mode)
  static const canvas  = Color(0xFF060E08);   // scaffold (dark mode) — deepest
  static const black   = Color(0xFF000000);   // OLED fallback

  // Tile highlight tints
  static const activeTile = Color(0xFF1A3D20); // active prayer row bg (dark mode)
  static const nextTile   = Color(0xFF0F2414); // next prayer row bg (dark mode)
}

class AppTheme {
  static ThemeData light() {
    final cs = ColorScheme.fromSeed(
      seedColor: PrayCalcColors.dark,
      brightness: Brightness.light,
      primary: PrayCalcColors.dark,
      onPrimary: Colors.white,
      secondary: PrayCalcColors.mid,
      tertiary: PrayCalcColors.light,
      surface: const Color(0xFFF6FAF4),
      onSurface: const Color(0xFF0D1F0D),
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: cs,
      scaffoldBackgroundColor: const Color(0xFFF2F7F0),
      appBarTheme: AppBarTheme(
        backgroundColor: const Color(0xFFF2F7F0),
        foregroundColor: const Color(0xFF0D1F0D),
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: Colors.black12,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 8,
        shadowColor: Colors.black12,
        indicatorColor: PrayCalcColors.mid.withAlpha(50),
        labelTextStyle: WidgetStateProperty.all(
          const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFFE4EDE2),
        thickness: 1,
        space: 0,
      ),
      textTheme: _textTheme(dark: false),
    );
  }

  static ThemeData dark() {
    final cs = ColorScheme.fromSeed(
      seedColor: PrayCalcColors.mid,
      brightness: Brightness.dark,
      primary: PrayCalcColors.mid,
      onPrimary: const Color(0xFF071208),
      secondary: PrayCalcColors.light,
      onSecondary: const Color(0xFF071208),
      surface: PrayCalcColors.surface,
      onSurface: const Color(0xFFE8F5E1),
      tertiary: const Color(0xFFD4A017),
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: cs,
      scaffoldBackgroundColor: PrayCalcColors.canvas,
      appBarTheme: AppBarTheme(
        backgroundColor: PrayCalcColors.canvas,
        foregroundColor: const Color(0xFFE8F5E1),
        elevation: 0,
        scrolledUnderElevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.light,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: PrayCalcColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        indicatorColor: PrayCalcColors.dark.withAlpha(180),
        labelTextStyle: WidgetStateProperty.all(
          const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: Color(0xFFE8F5E1),
          ),
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: PrayCalcColors.surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFF1A2D1A),
        thickness: 1,
        space: 0,
      ),
      textTheme: _textTheme(dark: true),
    );
  }

  static TextTheme _textTheme({required bool dark}) {
    final base = dark ? const Color(0xFFE8F5E1) : const Color(0xFF0D1F0D);
    final muted = dark ? const Color(0xFF8AAF8A) : const Color(0xFF4A6B4A);
    return TextTheme(
      displayLarge:  TextStyle(color: base, fontWeight: FontWeight.bold,   letterSpacing: -0.5),
      displayMedium: TextStyle(color: base, fontWeight: FontWeight.bold,   letterSpacing: -0.5),
      displaySmall:  TextStyle(color: base, fontWeight: FontWeight.w600),
      headlineLarge: TextStyle(color: base, fontWeight: FontWeight.bold),
      headlineMedium:TextStyle(color: base, fontWeight: FontWeight.w600),
      headlineSmall: TextStyle(color: base, fontWeight: FontWeight.w600),
      titleLarge:    TextStyle(color: base, fontWeight: FontWeight.w600),
      titleMedium:   TextStyle(color: base, fontWeight: FontWeight.w500),
      titleSmall:    TextStyle(color: base, fontWeight: FontWeight.w500),
      bodyLarge:     TextStyle(color: base, height: 1.5),
      bodyMedium:    TextStyle(color: muted, height: 1.4),
      bodySmall:     TextStyle(color: muted, fontSize: 12, height: 1.3),
      labelLarge:    TextStyle(color: base, fontWeight: FontWeight.w600, letterSpacing: 0.3),
      labelMedium:   TextStyle(color: muted, fontWeight: FontWeight.w500),
      labelSmall:    TextStyle(color: muted, fontSize: 10, letterSpacing: 0.4),
    );
  }
}
