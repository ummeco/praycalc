import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { routing } from './routing';

type Locale = (typeof routing.locales)[number];

export default getRequestConfig(async () => {
  // Prefer the NEXT_LOCALE cookie (set when user switches language).
  // Fall back to the Accept-Language header, then default to English.
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const acceptLang = headerStore.get('accept-language')?.split(',')[0]?.split('-')[0];

  let locale: Locale = routing.defaultLocale;

  if (cookieLocale && routing.locales.includes(cookieLocale as Locale)) {
    locale = cookieLocale as Locale;
  } else if (acceptLang && routing.locales.includes(acceptLang as Locale)) {
    locale = acceptLang as Locale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
