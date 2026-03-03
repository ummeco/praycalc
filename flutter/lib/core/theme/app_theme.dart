import 'package:flutter/material.dart';

/// PrayCalc brand palette.
/// Source: Ummat PPI — #C9F27A (light) · #79C24C (mid) · #1E5E2F (dark) · #0D2F17 (deep)
class PrayCalcColors {
  static const light = Color(0xFFC9F27A);
  static const mid   = Color(0xFF79C24C);
  static const dark  = Color(0xFF1E5E2F);
  static const deep  = Color(0xFF0D2F17);

  // OLED-friendly true black for dark mode
  static const black = Color(0xFF000000);
  static const surface = Color(0xFF0A1A0F);
}

class AppTheme {
  static ThemeData light() {
    final cs = ColorScheme.fromSeed(
      seedColor: PrayCalcColors.dark,
      brightness: Brightness.light,
      primary: PrayCalcColors.dark,
      secondary: PrayCalcColors.mid,
      tertiary: PrayCalcColors.light,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: cs,
      scaffoldBackgroundColor: const Color(0xFFF5FAF0),
      appBarTheme: AppBarTheme(
        backgroundColor: PrayCalcColors.dark,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        indicatorColor: PrayCalcColors.light.withAlpha(180),
        labelTextStyle: WidgetStateProperty.all(
          const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      textTheme: _textTheme(dark: false),
    );
  }

  static ThemeData dark() {
    final cs = ColorScheme.fromSeed(
      seedColor: PrayCalcColors.mid,
      brightness: Brightness.dark,
      primary: PrayCalcColors.mid,
      secondary: PrayCalcColors.light,
      surface: PrayCalcColors.surface,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: cs,
      scaffoldBackgroundColor: PrayCalcColors.black,
      appBarTheme: AppBarTheme(
        backgroundColor: PrayCalcColors.black,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: PrayCalcColors.surface,
        indicatorColor: PrayCalcColors.dark.withAlpha(200),
        labelTextStyle: WidgetStateProperty.all(
          const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: PrayCalcColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      textTheme: _textTheme(dark: true),
    );
  }

  static TextTheme _textTheme({required bool dark}) {
    final base = dark ? Colors.white : const Color(0xFF1A2E1A);
    return TextTheme(
      displayLarge: TextStyle(color: base, fontWeight: FontWeight.bold),
      displayMedium: TextStyle(color: base, fontWeight: FontWeight.bold),
      titleLarge: TextStyle(color: base, fontWeight: FontWeight.w600),
      titleMedium: TextStyle(color: base, fontWeight: FontWeight.w500),
      bodyLarge: TextStyle(color: base),
      bodyMedium: TextStyle(color: base.withAlpha(200)),
    );
  }
}
