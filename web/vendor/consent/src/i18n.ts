/**
 * S-C-S05-T03 — Locale resolver for @ummat/consent strings.
 *
 * Messages inlined as TypeScript constants so the package ships as a single
 * compiled .js entry per file with no JSON-asset bundling concerns. EN + AR
 * are committed translations; ID / UR / BN fall back to EN with a dev-only
 * console warning until translated (mark them up in CI as "missing locale").
 *
 * Source-of-truth for the message TEXT remains the en.json / ar.json files
 * under src/messages/ for translator workflow; this module mirrors them.
 * When translations land, sync both places (CI gate planned).
 */

export type ConsentLocale = 'en' | 'ar' | 'id' | 'ur' | 'bn'

export interface ConsentMessages {
  banner: {
    title: string
    body: string
    acceptAll: string
    rejectNonEssential: string
    customize: string
    privacyLink: string
    cookieLink: string
    eeaNote: string
  }
  preferences: {
    title: string
    save: string
    cancel: string
    withdrawAll: string
    alwaysOn: string
    strictlyNecessary: string
    strictlyNecessaryDesc: string
    functional: string
    functionalDesc: string
    analytics: string
    analyticsDesc: string
    marketing: string
    marketingDesc: string
  }
}

const en: ConsentMessages = {
  banner: {
    title: 'We use cookies',
    body: 'We use cookies to improve your experience. Non-essential cookies are only set with your consent.',
    acceptAll: 'Accept all',
    rejectNonEssential: 'Reject non-essential',
    customize: 'Manage preferences',
    privacyLink: 'Privacy Policy',
    cookieLink: 'Cookie Policy',
    eeaNote: '(EEA — GDPR applies)',
  },
  preferences: {
    title: 'Cookie Preferences',
    save: 'Save preferences',
    cancel: 'Cancel',
    withdrawAll: 'Withdraw all consent',
    alwaysOn: 'Always on',
    strictlyNecessary: 'Strictly Necessary',
    strictlyNecessaryDesc: 'Required for the site to function. These cannot be disabled.',
    functional: 'Functional',
    functionalDesc: 'Remember your preferences (language, location, settings) so you do not have to re-enter them.',
    analytics: 'Analytics',
    analyticsDesc: 'Help us understand how visitors use the site so we can improve it. All data is anonymised.',
    marketing: 'Marketing',
    marketingDesc: 'Allow third-party content (such as YouTube videos) and relevant advertising. Disabled by default.',
  },
}

const ar: ConsentMessages = {
  banner: {
    title: 'نحن نستخدم ملفات تعريف الارتباط',
    body: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك. لا يتم تفعيل ملفات تعريف الارتباط غير الأساسية إلا بموافقتك.',
    acceptAll: 'قبول الكل',
    rejectNonEssential: 'رفض غير الأساسية',
    customize: 'إدارة التفضيلات',
    privacyLink: 'سياسة الخصوصية',
    cookieLink: 'سياسة ملفات تعريف الارتباط',
    eeaNote: '(المنطقة الاقتصادية الأوروبية — تنطبق اللائحة العامة لحماية البيانات)',
  },
  preferences: {
    title: 'تفضيلات ملفات تعريف الارتباط',
    save: 'حفظ التفضيلات',
    cancel: 'إلغاء',
    withdrawAll: 'سحب جميع الموافقات',
    alwaysOn: 'مفعّل دائماً',
    strictlyNecessary: 'الضرورية تماماً',
    strictlyNecessaryDesc: 'مطلوبة لتشغيل الموقع. لا يمكن تعطيلها.',
    functional: 'وظيفية',
    functionalDesc: 'تتذكر تفضيلاتك (اللغة، الموقع، الإعدادات) حتى لا تضطر لإعادة إدخالها.',
    analytics: 'تحليلات',
    analyticsDesc: 'تساعدنا على فهم كيفية استخدام الزوار للموقع حتى نتمكن من تحسينه. جميع البيانات مجهولة الهوية.',
    marketing: 'تسويق',
    marketingDesc:
      'السماح بالمحتوى من جهات خارجية (مثل مقاطع فيديو يوتيوب) والإعلانات ذات الصلة. معطّلة افتراضياً.',
  },
}

const MESSAGES: Record<ConsentLocale, ConsentMessages> = {
  en,
  ar,
  // Scaffolds — fall back to EN until translated
  id: en,
  ur: en,
  bn: en,
}

const SCAFFOLD_LOCALES: ConsentLocale[] = ['id', 'ur', 'bn']

export function getMessages(locale: string | undefined): ConsentMessages {
  const l = ((locale ?? 'en').toLowerCase().split('-')[0]) as ConsentLocale
  if (
    SCAFFOLD_LOCALES.includes(l) &&
    typeof process !== 'undefined' &&
    process.env?.NODE_ENV !== 'production'
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      `[@ummat/consent i18n-missing] locale="${l}" — falling back to en. Translate src/messages/${l}.json.`
    )
  }
  return MESSAGES[l] ?? MESSAGES.en
}

export function isRtlLocale(locale: string | undefined): boolean {
  const l = (locale ?? 'en').toLowerCase().split('-')[0]
  return l === 'ar' || l === 'ur' || l === 'fa' || l === 'he'
}
