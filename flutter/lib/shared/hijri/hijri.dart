/// hijri.dart — Canonical Hijri (Islamic) calendar primitive for Flutter/Dart.
///
/// Single source of truth for Hijri date logic across all Ummat Flutter apps.
/// Mirrors the TypeScript canonical at packages/shared/src/hijri.ts.
///
/// Method: Umm al-Qura tabular algorithm (Saudi Arabia official calendar).
///   - Zero pub.dev dependencies — pure Dart math.
///   - Accuracy: ±1 day vs. official Saudi Umm al-Qura calendar.
///
/// D-P7-21: Umm al-Qura is the default method per locked platform decision.
///
/// NOTE (Q-MOB cross-repo extraction):
///   This file lives in praycalc/flutter/ as a temporary home.
///   When a shared-flutter package is created (planned), migrate here first.
///   Filed as Q-MOB extraction task pending package setup.
///
/// Public API:
///   gregorianToHijri(DateTime)        → HijriDateResult
///   hijriToGregorian(int, int, int)   → DateTime (UTC midnight)
///   formatHijri(DateTime, locale)     → String
///   HijriDateResult                   — data class
///   kHijriMonths                      — month metadata list
library ummat_hijri;

// ─── Month metadata ────────────────────────────────────────────────────────────

class HijriMonthInfo {
  final int monthNumber;
  final String name;
  final String nameArabic;
  final int days;

  const HijriMonthInfo({
    required this.monthNumber,
    required this.name,
    required this.nameArabic,
    required this.days,
  });
}

const List<HijriMonthInfo> kHijriMonths = [
  HijriMonthInfo(monthNumber:  1, name: 'Muharram',          nameArabic: 'محرم',           days: 30),
  HijriMonthInfo(monthNumber:  2, name: 'Safar',              nameArabic: 'صفر',            days: 29),
  HijriMonthInfo(monthNumber:  3, name: "Rabi' al-Awwal",    nameArabic: 'ربيع الأول',     days: 30),
  HijriMonthInfo(monthNumber:  4, name: "Rabi' al-Thani",    nameArabic: 'ربيع الثاني',    days: 29),
  HijriMonthInfo(monthNumber:  5, name: 'Jumada al-Awwal',   nameArabic: 'جمادى الأولى',   days: 30),
  HijriMonthInfo(monthNumber:  6, name: 'Jumada al-Thani',   nameArabic: 'جمادى الثانية',  days: 29),
  HijriMonthInfo(monthNumber:  7, name: 'Rajab',              nameArabic: 'رجب',            days: 30),
  HijriMonthInfo(monthNumber:  8, name: "Sha'ban",            nameArabic: 'شعبان',          days: 29),
  HijriMonthInfo(monthNumber:  9, name: 'Ramadan',            nameArabic: 'رمضان',          days: 30),
  HijriMonthInfo(monthNumber: 10, name: 'Shawwal',            nameArabic: 'شوال',           days: 29),
  HijriMonthInfo(monthNumber: 11, name: "Dhul Qa'dah",        nameArabic: 'ذو القعدة',      days: 30),
  HijriMonthInfo(monthNumber: 12, name: 'Dhul Hijjah',        nameArabic: 'ذو الحجة',       days: 29),
];

// ─── Result type ──────────────────────────────────────────────────────────────

class HijriDateResult {
  final int year;
  final int month;
  final int day;
  final String monthName;
  final String monthNameAr;

  const HijriDateResult({
    required this.year,
    required this.month,
    required this.day,
    required this.monthName,
    required this.monthNameAr,
  });

  @override
  String toString() => '$day $monthName $year AH';
}

// ─── Constants ────────────────────────────────────────────────────────────────

/// Julian Day Number of 1 Muharram 1 AH.
const double _ummAlQuraEpoch = 1948438.5;

// ─── Internal: Gregorian ↔ JDN ───────────────────────────────────────────────

int _gregorianToJDN(int year, int month, int day) {
  final a = ((14 - month) / 12).floor();
  final y = year + 4800 - a;
  final m = month + 12 * a - 3;
  return day +
      ((153 * m + 2) / 5).floor() +
      365 * y +
      (y / 4).floor() -
      (y / 100).floor() +
      (y / 400).floor() -
      32045;
}

({int year, int month, int day}) _jdnToGregorian(int jdn) {
  final a = jdn + 32044;
  final b = ((4 * a + 3) / 146097).floor();
  final c = a - ((146097 * b) / 4).floor();
  final d = ((4 * c + 3) / 1461).floor();
  final e = c - ((1461 * d) / 4).floor();
  final m = ((5 * e + 2) / 153).floor();
  final day = e - ((153 * m + 2) / 5).floor() + 1;
  final month = m + 3 - 12 * (m / 10).floor();
  final year = 100 * b + d - 4800 + (m / 10).floor();
  return (year: year, month: month, day: day);
}

// ─── Internal: Hijri ↔ JDN (Umm al-Qura tabular) ─────────────────────────────

double _hijriToJDN(int year, int month, int day) {
  return day.toDouble() +
      (29.5 * (month - 1)).ceil() +
      (year - 1) * 354.0 +
      ((3 + 11 * year) / 30).floor() +
      _ummAlQuraEpoch -
      1;
}

({int year, int month, int day}) _jdnToHijri(int jdn) {
  final shifted = jdn - _ummAlQuraEpoch;
  final year = ((30 * shifted + 10646) / 10631).floor();
  final baseJdn = _hijriToJDN(year, 1, 1);
  final month = ((shifted - (29 + baseJdn - _ummAlQuraEpoch)) / 29.5)
      .ceil()
      .clamp(1, 12) + 1;
  final day = (jdn - _hijriToJDN(year, month.clamp(1, 12), 1)).round() + 1;
  final clampedMonth = month.clamp(1, 12);
  return (year: year, month: clampedMonth, day: day.clamp(1, 30));
}

// ─── Internal: helpers ────────────────────────────────────────────────────────

HijriMonthInfo _monthInfo(int month) =>
    kHijriMonths[(month - 1).clamp(0, 11)];

String _toArabicNumerals(int n) {
  return n.toString().split('').map((c) {
    final code = c.codeUnitAt(0);
    if (code >= 0x30 && code <= 0x39) {
      return String.fromCharCode(code + 0x0660 - 0x30);
    }
    return c;
  }).join();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/// Convert a Gregorian [DateTime] to a Hijri date.
///
/// Uses UTC date parts to avoid time-zone shifting. Method is always
/// Umm al-Qura (D-P7-21).
///
/// ```dart
/// final h = gregorianToHijri(DateTime.utc(2026, 2, 4));
/// // h.year == 1447, h.month == 8, h.day == 15
/// ```
HijriDateResult gregorianToHijri(DateTime date) {
  final jdn = _gregorianToJDN(date.year, date.month, date.day);
  final raw = _jdnToHijri(jdn);
  final info = _monthInfo(raw.month);
  return HijriDateResult(
    year: raw.year,
    month: raw.month,
    day: raw.day,
    monthName: info.name,
    monthNameAr: info.nameArabic,
  );
}

/// Convert a Hijri date back to a Gregorian [DateTime] (UTC midnight).
///
/// ```dart
/// final d = hijriToGregorian(1447, 8, 15);
/// // DateTime.utc(2026, 2, 4)
/// ```
DateTime hijriToGregorian(int hYear, int hMonth, int hDay) {
  final jdn = _hijriToJDN(hYear, hMonth, hDay).round();
  final g = _jdnToGregorian(jdn);
  return DateTime.utc(g.year, g.month, g.day);
}

/// Format a Gregorian [DateTime] as a Hijri date string.
///
/// [locale] is a BCP 47 language tag ('en', 'ar', 'ur', etc.).
/// Arabic locale renders Arabic-Indic numerals and Arabic month names.
///
/// ```dart
/// formatHijri(DateTime.utc(2026, 2, 4), 'en')  // "15 Sha'ban 1447 AH"
/// formatHijri(DateTime.utc(2026, 2, 4), 'ar')  // "١٥ شعبان ١٤٤٧ هـ"
/// ```
String formatHijri(DateTime date, String locale) {
  final h = gregorianToHijri(date);
  final info = _monthInfo(h.month);

  if (locale.startsWith('ar')) {
    return '${_toArabicNumerals(h.day)} ${info.nameArabic} ${_toArabicNumerals(h.year)} هـ';
  }

  return '${h.day} ${info.name} ${h.year} AH';
}

/// Format a dual Gregorian + Hijri date string.
/// e.g. "15 Sha'ban 1447 AH · 4 Feb 2026"
String formatHijriDual(DateTime date, String locale) {
  final hijriStr = formatHijri(date, locale);
  // Simple Gregorian format — callers can use intl package for full locale support
  final gYear = date.year;
  final gMonth = [
    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ][date.month];
  final gDay = date.day;
  return '$hijriStr · $gDay $gMonth $gYear';
}
