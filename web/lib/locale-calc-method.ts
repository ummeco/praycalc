/**
 * Default calculation method per locale.
 *
 * When no method is explicitly selected, the app picks a sensible regional
 * default based on the user's UI language.  The mapping follows the dominant
 * prayer-time authority in each language's primary region.
 *
 * Method keys match the i18n `calcMethod.*` keys in messages/*.json.
 */

export type CalcMethodKey =
  | "isna"
  | "mwl"
  | "egypt"
  | "ummAlQura"
  | "tehran"
  | "karachi"
  | "kuwait"
  | "qatar"
  | "singapore"
  | "turkey"
  | "dubai"
  | "morocco"
  | "moonsighting";

/** Map of locale code to default calculation method. */
export const localeCalcMethod: Record<string, CalcMethodKey> = {
  en: "isna",        // North America (ISNA is the most common for English speakers)
  ar: "ummAlQura",   // Arabic — Saudi Arabia / Gulf
  tr: "turkey",      // Turkey — Diyanet
  ur: "karachi",     // Urdu — Pakistan / University of Islamic Sciences Karachi
  id: "singapore",   // Indonesia — uses Singapore (MUIS) method
  fr: "mwl",         // French — North/West Africa, Europe (MWL is most common)
  bn: "karachi",     // Bengali — Bangladesh / South Asia
  so: "egypt",       // Somali — East Africa (Egyptian General Authority)
  de: "mwl",         // German — Europe (Muslim World League)
  es: "mwl",         // Spanish — Europe / Americas (Muslim World League)
  hi: "karachi",     // Hindi — India / South Asia
  ms: "singapore",   // Malay — Malaysia / Singapore (MUIS)
  fa: "tehran",      // Persian — Iran (Institute of Geophysics, U. of Tehran)
  ps: "karachi",     // Pashto — Afghanistan / Pakistan (Karachi method)
  sw: "egypt",       // Swahili — East Africa (Egyptian General Authority)
  ha: "egypt",       // Hausa — West Africa (Egyptian General Authority)
  uz: "mwl",         // Uzbek — Central Asia (Muslim World League)
  ku: "turkey",      // Kurdish — Kurdistan region / Turkey (Diyanet)
  th: "mwl",         // Thai — Thailand (Muslim World League)
  zh: "mwl",         // Chinese — China / Southeast Asia (Muslim World League)
  ru: "mwl",         // Russian — Russia / Central Asia (Muslim World League)
  pt: "mwl",         // Portuguese — Brazil / Portugal (Muslim World League)
};

/**
 * Returns the default calculation method for the given locale code.
 * Falls back to MWL (Muslim World League) for unknown locales.
 */
export function getDefaultCalcMethod(locale: string): CalcMethodKey {
  return localeCalcMethod[locale] ?? "mwl";
}
