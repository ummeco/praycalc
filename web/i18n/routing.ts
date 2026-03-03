import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // All supported locales
  locales: ['en', 'ar', 'tr', 'ur', 'id', 'fr', 'bn', 'so'],
  // Default locale — English
  defaultLocale: 'en',
  // Never prefix URLs with locale — prayer time URLs remain clean
  // e.g., /us/alabama/birmingham stays as-is for all locales
  localePrefix: 'never',
  // Detect locale from cookie and Accept-Language header
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
