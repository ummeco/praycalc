/**
 * FILE:        praycalc/org/src/i18n/ui.ts
 * PURPOSE:     UI string translations for praycalc.org docs site.
 *              Covers layout labels, aria strings, nav, and site chrome.
 *              Consumed by Base.astro, Docs.astro, SidebarNav.astro.
 * CONSTRAINTS:
 *   - Required locales: en, ar, ur, fa, id (100% coverage gate — AC-01)
 *   - RTL locales: ar, ur, fa (dir="rtl" applied in Base.astro)
 *   - Islamic/prayer terms sourced from theology-standards.md §4
 * REF:         P2-E6-W01-S01-T01 AC-01
 */

export const LOCALES = ['en', 'ar', 'ur', 'fa', 'id'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const RTL_LOCALES: Locale[] = ['ar', 'ur', 'fa']

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  ur: 'اردو',
  fa: 'فارسی',
  id: 'Bahasa Indonesia',
}

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.includes(locale as Locale)
}

/**
 * UI string translations for all supported locales.
 * Keys mirror the islamwiki pattern for cross-project consistency.
 */
export const ui = {
  en: {
    site: {
      name: 'PrayCalc',
      tagline: 'Prayer Time Documentation',
      description: 'Scientific documentation for PrayCalc — solar physics, twilight optics, orbital mechanics, and npm packages for Islamic prayer time calculation.',
      badge: 'docs',
    },
    nav: {
      skipToContent: 'Skip to main content',
      docsLabel: 'Documentation navigation',
      mobileMenuLabel: 'Open navigation menu',
      mobileMenuClose: 'Close navigation menu',
      backToTop: 'Back to top',
    },
    sections: {
      gettingStarted: 'Getting Started',
      features: 'Features',
      theScience: 'The Science',
      theResearch: 'The Research',
      packages: 'Packages',
      advanced: 'Advanced',
    },
    links: {
      introduction: 'Introduction',
      installation: 'Installation',
      pwa: 'Progressive Web App',
      i18n: 'Internationalization',
      calendarExport: 'PDF Calendar Export',
      solarPosition: 'Solar Position & NREL SPA',
      twilightAngles: 'Twilight & Depression Angles',
      axialTilt: "Earth's Axial Tilt",
      ellipticalOrbit: 'Elliptical Orbit',
      atmosphericRefraction: 'Atmospheric Refraction',
      calculationMethods: 'Calculation Methods',
      qiblaDirection: 'Qibla Direction',
      dynamicVsFixed: 'Dynamic vs. Fixed Angles',
      empiricalStudies: 'Research & Empirical Studies',
      globalAngles: 'Global Angle Tables',
      methodComparison: 'Method Comparison',
      machineLearning: 'Machine Learning',
      hijriCalendar: 'Hijri Calendar Systems',
    },
    footer: {
      openSource: 'Open Source',
      islamicTech: 'Islamic Technology',
      viewOnGitHub: 'View on GitHub',
      copyright: '© PrayCalc. Open-source Islamic technology.',
    },
  },
  ar: {
    site: {
      name: 'PrayCalc',
      tagline: 'توثيق مواقيت الصلاة',
      description: 'وثائق علمية لـ PrayCalc — حساب مواقيت الصلاة الإسلامية بناءً على علم الفلك الدقيق.',
      badge: 'توثيق',
    },
    nav: {
      skipToContent: 'تخطى إلى المحتوى الرئيسي',
      docsLabel: 'قائمة التوثيق',
      mobileMenuLabel: 'فتح قائمة التنقل',
      mobileMenuClose: 'إغلاق قائمة التنقل',
      backToTop: 'العودة إلى الأعلى',
    },
    sections: {
      gettingStarted: 'البدء',
      features: 'الميزات',
      theScience: 'العلوم',
      theResearch: 'البحوث',
      packages: 'الحزم',
      advanced: 'متقدم',
    },
    links: {
      introduction: 'مقدمة',
      installation: 'التثبيت',
      pwa: 'تطبيق الويب التقدمي',
      i18n: 'تعدد اللغات',
      calendarExport: 'تصدير تقويم PDF',
      solarPosition: 'موضع الشمس و NREL SPA',
      twilightAngles: 'الشفق وزوايا الانخفاض',
      axialTilt: 'ميل محور الأرض',
      ellipticalOrbit: 'المدار الإهليجي',
      atmosphericRefraction: 'الانكسار الجوي',
      calculationMethods: 'طرق الحساب',
      qiblaDirection: 'اتجاه القبلة',
      dynamicVsFixed: 'الزوايا الديناميكية مقابل الثابتة',
      empiricalStudies: 'البحوث والدراسات التجريبية',
      globalAngles: 'جداول الزوايا العالمية',
      methodComparison: 'مقارنة الطرق',
      machineLearning: 'التعلم الآلي',
      hijriCalendar: 'أنظمة التقويم الهجري',
    },
    footer: {
      openSource: 'مفتوح المصدر',
      islamicTech: 'تقنية إسلامية',
      viewOnGitHub: 'عرض على GitHub',
      copyright: '© PrayCalc. تقنية إسلامية مفتوحة المصدر.',
    },
  },
  ur: {
    site: {
      name: 'PrayCalc',
      tagline: 'نماز اوقات دستاویزی',
      description: 'PrayCalc کے لیے سائنسی دستاویزات — اسلامی نماز کے اوقات کا حساب فلکیاتی اصولوں پر۔',
      badge: 'دستاویز',
    },
    nav: {
      skipToContent: 'مرکزی مواد پر جائیں',
      docsLabel: 'دستاویز نیویگیشن',
      mobileMenuLabel: 'نیویگیشن مینو کھولیں',
      mobileMenuClose: 'نیویگیشن مینو بند کریں',
      backToTop: 'اوپر واپس جائیں',
    },
    sections: {
      gettingStarted: 'شروع کریں',
      features: 'خصوصیات',
      theScience: 'سائنس',
      theResearch: 'تحقیق',
      packages: 'پیکجز',
      advanced: 'اعلی',
    },
    links: {
      introduction: 'تعارف',
      installation: 'تنصیب',
      pwa: 'پروگریسو ویب ایپ',
      i18n: 'بین الاقوامی کاری',
      calendarExport: 'PDF کیلنڈر برآمد',
      solarPosition: 'شمسی مقام اور NREL SPA',
      twilightAngles: 'شفق اور زوال کے زاویے',
      axialTilt: 'زمین کا محوری جھکاؤ',
      ellipticalOrbit: 'بیضوی مدار',
      atmosphericRefraction: 'ماحولیاتی انکسار',
      calculationMethods: 'حساب کی طریقے',
      qiblaDirection: 'قبلہ سمت',
      dynamicVsFixed: 'متحرک بمقابلہ ثابت زاویے',
      empiricalStudies: 'تحقیق اور تجرباتی مطالعات',
      globalAngles: 'عالمی زوایہ جدول',
      methodComparison: 'طریقہ کار کا موازنہ',
      machineLearning: 'مشین لرننگ',
      hijriCalendar: 'ہجری کیلنڈر نظام',
    },
    footer: {
      openSource: 'اوپن سورس',
      islamicTech: 'اسلامی ٹیکنالوجی',
      viewOnGitHub: 'GitHub پر دیکھیں',
      copyright: '© PrayCalc. اوپن سورس اسلامی ٹیکنالوجی۔',
    },
  },
  fa: {
    site: {
      name: 'PrayCalc',
      tagline: 'مستندات اوقات نماز',
      description: 'مستندات علمی برای PrayCalc — محاسبه اوقات نماز اسلامی بر اساس اصول نجومی دقیق.',
      badge: 'مستندات',
    },
    nav: {
      skipToContent: 'رفتن به محتوای اصلی',
      docsLabel: 'ناوبری مستندات',
      mobileMenuLabel: 'باز کردن منوی ناوبری',
      mobileMenuClose: 'بستن منوی ناوبری',
      backToTop: 'بازگشت به بالا',
    },
    sections: {
      gettingStarted: 'شروع کنید',
      features: 'ویژگی‌ها',
      theScience: 'علم',
      theResearch: 'پژوهش',
      packages: 'بسته‌ها',
      advanced: 'پیشرفته',
    },
    links: {
      introduction: 'مقدمه',
      installation: 'نصب',
      pwa: 'اپلیکیشن وب پیشرونده',
      i18n: 'بین‌المللی‌سازی',
      calendarExport: 'خروجی تقویم PDF',
      solarPosition: 'موقعیت خورشید و NREL SPA',
      twilightAngles: 'گرگ‌ومیش و زوایای افت',
      axialTilt: 'انحراف محوری زمین',
      ellipticalOrbit: 'مدار بیضوی',
      atmosphericRefraction: 'شکست جوی',
      calculationMethods: 'روش‌های محاسبه',
      qiblaDirection: 'جهت قبله',
      dynamicVsFixed: 'زوایای پویا در مقابل ثابت',
      empiricalStudies: 'پژوهش و مطالعات تجربی',
      globalAngles: 'جداول زاویه جهانی',
      methodComparison: 'مقایسه روش‌ها',
      machineLearning: 'یادگیری ماشین',
      hijriCalendar: 'سیستم‌های تقویم هجری',
    },
    footer: {
      openSource: 'متن‌باز',
      islamicTech: 'فناوری اسلامی',
      viewOnGitHub: 'مشاهده در GitHub',
      copyright: '© PrayCalc. فناوری اسلامی متن‌باز.',
    },
  },
  id: {
    site: {
      name: 'PrayCalc',
      tagline: 'Dokumentasi Waktu Sholat',
      description: 'Dokumentasi ilmiah untuk PrayCalc — perhitungan waktu sholat Islam berdasarkan astronomi yang akurat.',
      badge: 'dok',
    },
    nav: {
      skipToContent: 'Langsung ke konten utama',
      docsLabel: 'Navigasi dokumentasi',
      mobileMenuLabel: 'Buka menu navigasi',
      mobileMenuClose: 'Tutup menu navigasi',
      backToTop: 'Kembali ke atas',
    },
    sections: {
      gettingStarted: 'Memulai',
      features: 'Fitur',
      theScience: 'Ilmu Pengetahuan',
      theResearch: 'Penelitian',
      packages: 'Paket',
      advanced: 'Lanjutan',
    },
    links: {
      introduction: 'Pengantar',
      installation: 'Instalasi',
      pwa: 'Progressive Web App',
      i18n: 'Internasionalisasi',
      calendarExport: 'Ekspor Kalender PDF',
      solarPosition: 'Posisi Matahari & NREL SPA',
      twilightAngles: 'Senja & Sudut Depresi',
      axialTilt: 'Kemiringan Sumbu Bumi',
      ellipticalOrbit: 'Orbit Elips',
      atmosphericRefraction: 'Pembiasan Atmosfer',
      calculationMethods: 'Metode Perhitungan',
      qiblaDirection: 'Arah Kiblat',
      dynamicVsFixed: 'Sudut Dinamis vs Tetap',
      empiricalStudies: 'Penelitian & Studi Empiris',
      globalAngles: 'Tabel Sudut Global',
      methodComparison: 'Perbandingan Metode',
      machineLearning: 'Pembelajaran Mesin',
      hijriCalendar: 'Sistem Kalender Hijriah',
    },
    footer: {
      openSource: 'Sumber Terbuka',
      islamicTech: 'Teknologi Islam',
      viewOnGitHub: 'Lihat di GitHub',
      copyright: '© PrayCalc. Teknologi Islam sumber terbuka.',
    },
  },
} as const

/**
 * Get a UI string for a locale by dot-path key.
 * Falls back to English if key is missing.
 */
export function t(locale: string, key: string): string {
  const safeLocale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE
  const parts = key.split('.')
  let value: unknown = ui[safeLocale]
  for (const part of parts) {
    if (value == null || typeof value !== 'object') break
    value = (value as Record<string, unknown>)[part]
  }
  if (typeof value === 'string') return value
  // Fallback to English
  let fallback: unknown = ui.en
  for (const part of parts) {
    if (fallback == null || typeof fallback !== 'object') break
    fallback = (fallback as Record<string, unknown>)[part]
  }
  return typeof fallback === 'string' ? fallback : key
}
