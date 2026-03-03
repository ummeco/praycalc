import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - /api, /_next/static, /_next/image, /favicon.ico, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
