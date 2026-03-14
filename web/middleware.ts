import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

type Locale = (typeof routing.locales)[number];

// SEC-A10: Allowed origins for /api/dashboard/* mutating requests.
const ALLOWED_ORIGINS = [
  'https://www.praycalc.com',
  'https://praycalc.com',
  // Local dev origins
  'http://localhost:3041',
  'https://www.praycalc.local.nself.org:8543',
];

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** SEC-A10: Origin check for /api/dashboard/* mutating requests. */
function checkDashboardCsrf(req: NextRequest): NextResponse | null {
  if (!MUTATING_METHODS.has(req.method)) return null; // GET/HEAD/OPTIONS are safe

  const origin = req.headers.get('origin');
  if (!origin) {
    // No Origin header — allow only in development (server-side calls, Postman).
    if (process.env.NODE_ENV === 'development') return null;
    return NextResponse.json({ error: 'Missing Origin header' }, { status: 403 });
  }

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Cross-origin request blocked' }, { status: 403 });
  }

  return null;
}

/** SEC-B2: Redirect unauthenticated users away from dashboard routes.
 *  The `pc-auth=1` cookie is set by lib/session.ts on login and cleared on logout.
 *  It carries no sensitive data — the real JWT lives in localStorage. This
 *  check is a UX guard only; actual security is enforced by the smart server's
 *  `requireAuth` middleware and Hasura token validation. */
function checkDashboardAuth(req: NextRequest): NextResponse | null {
  const hasAuth = req.cookies.get('pc-auth')?.value === '1';
  if (hasAuth) return null;

  // API routes: return 401 rather than an HTML redirect (better for fetch() callers).
  if (req.nextUrl.pathname.startsWith('/api/dashboard/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Page routes: redirect to account/login page preserving destination.
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/account';
  loginUrl.searchParams.set('next', req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// Minimal locale middleware — no path rewrites.
// i18n/request.ts reads locale from NEXT_LOCALE cookie or Accept-Language header.
// This middleware only persists the detected locale as a cookie for subsequent requests.
export function middleware(req: NextRequest) {
  // SEC-B2: Auth guard for all /dashboard/* and /api/dashboard/* routes.
  if (
    req.nextUrl.pathname.startsWith('/dashboard/') ||
    req.nextUrl.pathname === '/dashboard' ||
    req.nextUrl.pathname.startsWith('/api/dashboard/')
  ) {
    const authError = checkDashboardAuth(req);
    if (authError) return authError;
  }

  // SEC-A10: CSRF check for dashboard API mutations.
  if (req.nextUrl.pathname.startsWith('/api/dashboard/')) {
    const csrfError = checkDashboardCsrf(req);
    if (csrfError) return csrfError;
  }

  const res = NextResponse.next();

  // Skip locale detection if the user already has a locale cookie set
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
  matcher: [
    // All page routes (locale detection + dashboard auth)
    '/((?!_next|_vercel|.*\\..*).*)',
    // Dashboard API routes (CSRF check + auth check)
    '/api/dashboard/:path*',
  ],
};
