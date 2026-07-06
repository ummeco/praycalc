/**
 * Purpose: i18n initializer for praycalc/mobile — 21 locale scaffold with RTL support.
 * Inputs:  expo-localization device locale, MMKV persisted user override.
 * Outputs: configured i18next instance; exports t(), useTranslation(), RTL locale list.
 * Constraints:
 *   - RTL locales (ar, ur, ps, fa) must call I18nManager.forceRTL before React renders.
 *   - MMKV key 'i18n.locale' persists user override across restarts.
 *   - Fallback: 'en'. No network calls — all catalogs are bundled.
 *   - expo-updates reload needed for RTL direction change to take effect.
 * SPORT: praycalc/mobile — i18n 21 locales, RTL
 */

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import { MMKV } from 'react-native-mmkv';

// --- locale catalog imports ---
import en from './en.json';
import ar from './ar.json';
import fr from './fr.json';
import ur from './ur.json';
import tr from './tr.json';
import id from './id.json';
import ms from './ms.json';
import bn from './bn.json';
import sw from './sw.json';
import es from './es.json';
import de from './de.json';
import nl from './nl.json';
import pt from './pt.json';
import it from './it.json';
import ru from './ru.json';
import hi from './hi.json';
import ps from './ps.json';
import fa from './fa.json';
import so from './so.json';
import ha from './ha.json';
import yo from './yo.json';

/** All supported locale codes */
export const SUPPORTED_LOCALES = [
  'en', 'ar', 'fr', 'ur', 'tr', 'id', 'ms', 'bn', 'sw',
  'es', 'de', 'nl', 'pt', 'it', 'ru', 'hi', 'ps', 'fa', 'so', 'ha', 'yo',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Locales that require RTL layout direction */
export const RTL_LOCALES: ReadonlySet<SupportedLocale> = new Set(['ar', 'ur', 'ps', 'fa']);

/** Native display name per locale — for the Settings language picker. */
export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  ur: 'اردو',
  tr: 'Türkçe',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  bn: 'বাংলা',
  sw: 'Kiswahili',
  es: 'Español',
  de: 'Deutsch',
  nl: 'Nederlands',
  pt: 'Português',
  it: 'Italiano',
  ru: 'Русский',
  hi: 'हिन्दी',
  ps: 'پښتو',
  fa: 'فارسی',
  so: 'Soomaali',
  ha: 'Hausa',
  yo: 'Yorùbá',
};

const I18N_LOCALE_KEY = 'i18n.locale';

/** MMKV store for locale persistence (separate instance; shared storage ID) */
const storage = new MMKV({ id: 'praycalc-i18n' });

/**
 * Resolve the active locale:
 *   1. MMKV persisted user override
 *   2. expo-localization device locale (language tag prefix match)
 *   3. 'en' fallback
 */
function resolveLocale(): SupportedLocale {
  const persisted = storage.getString(I18N_LOCALE_KEY) as SupportedLocale | undefined;
  if (persisted && SUPPORTED_LOCALES.includes(persisted)) return persisted;

  // expo-localization returns BCP-47 tags e.g. 'ar-SA', 'en-US'
  const deviceLocales = Localization.getLocales();
  for (const loc of deviceLocales) {
    const prefix = loc.languageCode as SupportedLocale;
    if (SUPPORTED_LOCALES.includes(prefix)) return prefix;
  }
  return 'en';
}

/**
 * Persist a locale code to MMKV.
 * Does NOT trigger RTL change or app reload — callers must handle that.
 */
export function persistLocale(locale: SupportedLocale): void {
  storage.set(I18N_LOCALE_KEY, locale);
}

/**
 * Apply RTL manager state for the given locale.
 * Must be called before the React root renders (i.e., at module init time or in index.ts).
 * RTL direction changes require a full app reload — use expo-updates reloadAsync() after.
 */
export function applyRTL(locale: SupportedLocale): void {
  const shouldBeRTL = RTL_LOCALES.has(locale);
  // allowRTL MUST be true for forceRTL to work on Android
  I18nManager.allowRTL(shouldBeRTL);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
  }
}

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  fr: { translation: fr },
  ur: { translation: ur },
  tr: { translation: tr },
  id: { translation: id },
  ms: { translation: ms },
  bn: { translation: bn },
  sw: { translation: sw },
  es: { translation: es },
  de: { translation: de },
  nl: { translation: nl },
  pt: { translation: pt },
  it: { translation: it },
  ru: { translation: ru },
  hi: { translation: hi },
  ps: { translation: ps },
  fa: { translation: fa },
  so: { translation: so },
  ha: { translation: ha },
  yo: { translation: yo },
};

const initialLocale = resolveLocale();

// Apply RTL at module init time — before React renders
applyRTL(initialLocale);

i18next.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: 'en',
  interpolation: {
    // React already escapes values
    escapeValue: false,
  },
  // Disable backend loading — all catalogs are statically bundled
  initImmediate: true,
});

export default i18next;

// Re-export for convenience
export { useTranslation } from 'react-i18next';
export const t = i18next.t.bind(i18next);
