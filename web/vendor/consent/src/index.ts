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

// Policy version (S-C-S05-T04)
export { CURRENT_POLICY_VERSION } from './version.js'
export type { PolicyVersion } from './version.js'

// Pre-consent gating (S-C-S05-T08)
export { ConsentGated, useConsentGate } from './gating.js'
export type { ConsentGatedProps, GatedCategory } from './gating.js'

// i18n (S-C-S05-T03)
export { getMessages, isRtlLocale } from './i18n.js'
export type { ConsentLocale, ConsentMessages } from './i18n.js'

// Server handler (S-C-S05-T05) — Node only; do NOT import from client bundles.
// Re-exported as `@ummat/consent/server` would be cleaner but the package
// only ships one entry today; consumers should `import { handleConsentRequest }
// from '@ummat/consent'` only inside Route Handlers.
export {
  handleConsentRequest,
  parseConsentBody,
  isSameOrigin,
  makeFingerprintHash,
  clientIpFromHeaders,
  resolveLatestCookiePolicyVersion,
  insertConsentRecords,
  fetchLatestConsent,
  ConsentValidationError,
} from './server-handler.js'
export type {
  ConsentPostPayload,
  ConsentWriteContext,
  HasuraAdminConfig,
  ConsentHandlerInput,
  ConsentHandlerResult,
} from './server-handler.js'
