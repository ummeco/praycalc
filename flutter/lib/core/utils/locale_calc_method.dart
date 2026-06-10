/// Default calculation method per locale.
///
/// When no method is explicitly selected, the app picks a sensible regional
/// default based on the user's UI language. The mapping follows the dominant
/// prayer-time authority in each language's primary region.
///
/// Method keys match the i18n `calcMethod.*` keys used in localization.
library;

/// Calculation method identifiers.
enum CalcMethod {
  isna,
  mwl,
  egypt,
  ummAlQura,
  tehran,
  karachi,
  kuwait,
  qatar,
  singapore,
  turkey,
  dubai,
  morocco,
  moonsighting,
}

/// Map of locale code to default calculation method.
const localeCalcMethod = <String, CalcMethod>{
  'en': CalcMethod.isna,        // North America (ISNA)
  'ar': CalcMethod.ummAlQura,   // Arabic — Saudi Arabia / Gulf
  'tr': CalcMethod.turkey,      // Turkey — Diyanet
  'ur': CalcMethod.karachi,     // Urdu — Pakistan
  'id': CalcMethod.singapore,   // Indonesia — MUIS
  'fr': CalcMethod.mwl,         // French — Europe / North Africa
  'bn': CalcMethod.karachi,     // Bengali — Bangladesh / South Asia
  'so': CalcMethod.egypt,       // Somali — East Africa
  'de': CalcMethod.mwl,         // German — Europe
  'es': CalcMethod.mwl,         // Spanish — Europe / Americas
  'hi': CalcMethod.karachi,     // Hindi — India / South Asia
  'ms': CalcMethod.singapore,   // Malay — Malaysia / Singapore
  'fa': CalcMethod.tehran,      // Persian — Iran
  'ps': CalcMethod.karachi,     // Pashto — Afghanistan / Pakistan
  'sw': CalcMethod.egypt,       // Swahili — East Africa
  'ha': CalcMethod.egypt,       // Hausa — West Africa
  'uz': CalcMethod.mwl,         // Uzbek — Central Asia
  'ku': CalcMethod.turkey,      // Kurdish — Kurdistan / Turkey
  'th': CalcMethod.mwl,         // Thai — Thailand
  'zh': CalcMethod.mwl,         // Chinese — China / Southeast Asia
  'ru': CalcMethod.mwl,         // Russian — Russia / Central Asia
  'pt': CalcMethod.mwl,         // Portuguese — Brazil / Portugal
};

/// Returns the default calculation method for the given locale code.
/// Falls back to MWL (Muslim World League) for unknown locales.
CalcMethod getDefaultCalcMethod(String locale) {
  return localeCalcMethod[locale] ?? CalcMethod.mwl;
}
