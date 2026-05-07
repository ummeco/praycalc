// Components
export { CookieBanner } from './CookieBanner.js'
export type { CookieBannerProps } from './CookieBanner.js'

export { ConsentGatedScript } from './ConsentGatedScript.js'
export type { ConsentGatedScriptProps } from './ConsentGatedScript.js'

export { PreferencesModal } from './PreferencesModal.js'
export type { PreferencesModalProps } from './PreferencesModal.js'

// Hooks + Provider
export { useConsent, ConsentProvider } from './useConsent.js'
export type { ConsentProviderProps } from './useConsent.js'

// Types
export type {
  CookieCategory,
  ConsentRecord,
  ConsentVersion,
  ConsentCategories,
  ConsentRegion,
  CookieEntry,
  CookieBannerStrings,
  PreferencesModalStrings,
} from './types.js'

// Cookie inventory
export { COOKIES } from './cookie-inventory.js'

// Storage utilities
export {
  STORAGE_KEY,
  CURRENT_CONSENT_VERSION,
  readConsent,
  writeConsent,
  clearConsent,
  buildConsentRecord,
  buildAcceptAllRecord,
  buildRejectNonEssentialRecord,
  shouldRePrompt,
} from './storage.js'

// Audit utilities
export { auditCookies, formatAuditReport } from './audit-cookies.js'
export type { AuditResult } from './audit-cookies.js'
