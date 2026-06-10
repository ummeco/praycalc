/// locale_utils.dart — Locale resolution with fallback chain
/// S07-I18N-EXT: WearOS locale fallback chain (S29)
///
/// Implements BCP 47 locale tag → supported app locale resolution.
/// Supported app locales: ['en', 'ar', 'id', 'ur', 'bn']
/// Fallback: strip region subtag → check again → 'en'

const List<String> _supportedLocales = ['en', 'ar', 'id', 'ur', 'bn'];

/// Resolves a system locale string (BCP 47, e.g. 'ar-SA', 'id-ID', 'bn-BD')
/// to the nearest supported app locale.
///
/// Fallback chain:
///   1. Exact match (e.g. 'ar' → 'ar')
///   2. Language subtag match (e.g. 'ar-SA' → 'ar')
///   3. Default to 'en'
///
/// Examples:
///   resolveLocale('ar-SA')    → 'ar'
///   resolveLocale('id-ID')    → 'id'
///   resolveLocale('bn-BD')    → 'bn'
///   resolveLocale('xx-UNKNOWN') → 'en'
///   resolveLocale('ur')       → 'ur'
///   resolveLocale('')         → 'en'
String resolveLocale(String systemLocale) {
  if (systemLocale.isEmpty) return 'en';

  final normalised = systemLocale.replaceAll('_', '-').trim();

  // Step 1: exact match
  if (_supportedLocales.contains(normalised)) return normalised;

  // Step 2: language subtag (first segment before '-')
  final languageTag = normalised.split('-').first.toLowerCase();
  if (_supportedLocales.contains(languageTag)) return languageTag;

  // Step 3: default fallback
  return 'en';
}
