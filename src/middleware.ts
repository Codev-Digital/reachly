import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ─── Route groups ────────────────────────────────────────────────────────────

/**
 * Pages that do NOT require any session.
 * Logged-in users who try to visit these are redirected to /dashboard.
 */
const AUTH_PAGES = ['/login', '/signup', '/welcome', '/forgot-password'];

/**
 * Pages that belong to the signup flow.
 * These are public but only make sense when coming from signup,
 * so we let the individual page handle the redirect (via localStorage check).
 */
const SIGNUP_FLOW_PAGES = ['/verify-email', '/set-password'];

/**
 * Pages that require a fully authenticated AND fully registered session.
 */
const PROTECTED_PAGES = ['/dashboard'];

/**
 * Prefix for pages that require auth (dynamic segments included).
 */
const PROTECTED_PREFIXES = ['/creator-onboarding'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const startsWith = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname.startsWith(p));

const exactMatch = (pathname: string, routes: string[]) =>
  routes.includes(pathname);

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow Next.js internals and all /api/auth/* routes through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|webp|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Retrieve JWT token (works for both NextAuth credential & Google sessions)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const isComplete = !!(token as any)?.isRegistrationComplete;

  // ── 1. Logged-in + complete user tries to visit an auth page ──────────────
  //    Redirect them straight to the dashboard.
  if (isLoggedIn && isComplete && exactMatch(pathname, AUTH_PAGES)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ── 2. Logged-in but INCOMPLETE user ──────────────────────────────────────
  //    They finished Google OAuth but haven't set a password yet,
  //    OR they came via credentials but registration was somehow partial.
  //    Allow them only on signup-flow pages; send elsewhere → /set-password.
  if (isLoggedIn && !isComplete) {
    const allowed =
      exactMatch(pathname, [...AUTH_PAGES, ...SIGNUP_FLOW_PAGES]) ||
      pathname.startsWith('/api');

    if (!allowed) {
      return NextResponse.redirect(new URL('/set-password', request.url));
    }
    return NextResponse.next();
  }

  // ── 3. NOT logged in tries to visit a protected page ──────────────────────
  //    Send them to /login and remember where they wanted to go.
  const needsAuth =
    exactMatch(pathname, PROTECTED_PAGES) ||
    startsWith(pathname, PROTECTED_PREFIXES);

  if (!isLoggedIn && needsAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Everything else — allow through ────────────────────────────────────
  return NextResponse.next();
}

// ─── Matcher ─────────────────────────────────────────────────────────────────
// Run middleware on every route EXCEPT static files and Next.js internals.
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public folder files (images, svgs, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp)$).*)',
  ],
};
