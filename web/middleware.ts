import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

type Locale = (typeof routing.locales)[number];

// Minimal locale middleware — no path rewrites.
// i18n/request.ts reads locale from NEXT_LOCALE cookie or Accept-Language header.
// This middleware only persists the detected locale as a cookie for subsequent requests.
export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Skip if the user already has a locale cookie set
  if (req.cookies.get('NEXT_LOCALE')?.value) {
    return res;
  }

  // Detect locale from Accept-Language header and persist as a cookie
  const acceptLang = req.headers.get('accept-language')?.split(',')[0]?.split('-')[0];
  if (acceptLang && routing.locales.includes(acceptLang as Locale) && acceptLang !== routing.defaultLocale) {
    res.cookies.set('NEXT_LOCALE', acceptLang, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  }

  return res;
}

export const config = {
  // Match all pathnames except for
  // - /api, /_next/static, /_next/image, /favicon.ico, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
