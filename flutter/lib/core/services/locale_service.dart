// praycalc/flutter/lib/core/services/locale_service.dart
// LocaleService — 12h/24h auto-detect from device locale (v1.1 new)
//
// TRAP: time format comes from device locale, NOT app preference.
// See traps.md PRAYCALC section — this is a verified SIEGE-03 M-01 finding.
// No user override in v1.1 (locale-driven only per spec §10.1).

import 'dart:ui' as ui;

import 'package:intl/intl.dart';

/// 12h vs 24h format source — locale-driven ONLY.
enum TimeFormat { h12, h24 }

/// Formats prayer times and countdowns consistently across all surfaces.
///
/// Singleton — initialise once at app startup via [LocaleService.instance].
class LocaleService {
  LocaleService._();
  static final LocaleService instance = LocaleService._();

  /// Detected time format from device locale.
  /// Auto-detects on first access. Read-only in v1.1.
  TimeFormat get timeFormat => _timeFormat;
  TimeFormat _timeFormat = TimeFormat.h12;

  /// Call at app startup (or when locale changes) to refresh detection.
  void refresh() {
    _timeFormat = _detectFromLocale();
  }

  TimeFormat _detectFromLocale() {
    // Detect from system locale using Intl
    final locale = ui.PlatformDispatcher.instance.locale.toString();
    // 24h locales: most of Europe, Asia, Africa, Middle East
    // 12h locales: US, UK, Australia, Canada, Philippines, Egypt...
    //
    // Use DateFormat to probe the locale — if pattern contains 'a' (AM/PM), it's 12h
    try {
      final pattern = DateFormat.jm(locale).pattern ?? '';
      if (pattern.contains('a') || pattern.contains('h')) {
        return TimeFormat.h12;
      }
      return TimeFormat.h24;
    } catch (_) {
      // Default to 12h for locales not supported by Intl
      return TimeFormat.h12;
    }
  }

  // ── Formatters ────────────────────────────────────────────────────────────

  /// Format a prayer time as "03:45 PM" (12h) or "15:45" (24h).
  String formatPrayerTime(DateTime time) {
    if (_timeFormat == TimeFormat.h12) {
      // e.g. "03:45 PM"
      return DateFormat('hh:mm a').format(time);
    } else {
      // e.g. "15:45"
      return DateFormat('HH:mm').format(time);
    }
  }

  /// Format a countdown duration as "2h 17m" or "12m".
  String formatCountdown(Duration d) {
    if (d.isNegative) return '0m';
    final hours = d.inHours;
    final minutes = d.inMinutes % 60;
    if (hours > 0) {
      return '${hours}h ${minutes}m';
    }
    return '${minutes}m';
  }

  /// Format a Hijri date e.g. "15 Sha'ban 1447"
  String formatHijriDate(int day, String monthName, int year) {
    return '$day $monthName $year';
  }
}
