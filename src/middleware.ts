import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ─── Route groups ────────────────────────────────────────────────────────────

/** Pages only unauthenticated users should see. Logged-in → /dashboard */
const AUTH_PAGES = ['/login', '/signup', '/forgot-password'];

/** Signup-flow pages — allowed for everyone (page itself handles guards) */
const SIGNUP_FLOW_PAGES = ['/verify-email', '/set-password'];

/** Routes that need a valid session (logged in, registration complete) */
const PROTECTED_PAGES = ['/dashboard'];

/** Route prefixes that need a valid session */
const PROTECTED_PREFIXES = ['/creator-onboarding', '/creators/dashboard', '/creators/bookings', '/creators/calendar', '/creators/availability', '/creators/session-types', '/creators/earnings', '/creators/profile', '/creators/reviews', '/creators/analytics', '/creators/booking-links', '/creators/notifications', '/creators/settings'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const startsWith = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname.startsWith(p));

const exactMatch = (pathname: string, routes: string[]) =>
  routes.includes(pathname);

// ─── Middleware ───────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through Next.js internals and auth API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|webp|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Read JWT — try both possible secret env var names
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

  // On production HTTPS, NextAuth uses __Secure-next-auth.session-token.
  // We must tell getToken() to look for the secure cookie, otherwise it
  // returns null on Vercel and treats every user as unauthenticated.
  const secureCookie =
    process.env.NEXTAUTH_URL?.startsWith('https://') ||
    process.env.VERCEL_URL != null ||
    request.url.startsWith('https://');

  const token = await getToken({ req: request, secret, secureCookie });
  const isLoggedIn = !!token;
  const isComplete = !!(token as any)?.isRegistrationComplete;

  // ── 1. Logged-in + complete user on an auth-only page → redirect accordingly ─────────
  if (isLoggedIn && isComplete && exactMatch(pathname, AUTH_PAGES)) {
    const onboardingStep = (token as any)?.onboardingStep || 0;
    const approvalStatus = (token as any)?.approvalStatus || 'none';
    const hasSeenWelcome = !!(token as any)?.hasSeenWelcome;

    const isFullyApproved = approvalStatus === 'approved' || approvalStatus === 'active';
    const isInOnboarding = onboardingStep > 0 && !isFullyApproved && approvalStatus !== 'pending';

    if (approvalStatus === 'pending') {
      return NextResponse.redirect(new URL('/creators/pending-approval', request.url));
    } else if (isFullyApproved) {
      return NextResponse.redirect(new URL('/creators/dashboard', request.url));
    } else if (isInOnboarding) {
      const resumeStep = Math.max(1, Math.min(onboardingStep, 7));
      return NextResponse.redirect(new URL(`/creator-onboarding/step-${resumeStep}`, request.url));
    } else if (!hasSeenWelcome) {
      return NextResponse.redirect(new URL('/welcome', request.url));
    } else {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
  }

  // ── 2. Logged-in but registration NOT complete ────────────────────────────
  //    Allow: auth pages, signup-flow pages, /welcome, /creator-onboarding/*
  //    Everything else → /set-password so they finish registration first.
  if (isLoggedIn && !isComplete) {
    const allowed =
      exactMatch(pathname, [...AUTH_PAGES, ...SIGNUP_FLOW_PAGES, '/welcome']) ||
      startsWith(pathname, PROTECTED_PREFIXES) || // allow onboarding
      pathname.startsWith('/api');

    if (!allowed) {
      return NextResponse.redirect(new URL('/set-password', request.url));
    }
    return NextResponse.next();
  }

  // ── 3. Creator pending approval check ─────────────────────────────────────
  const approvalStatus = (token as any)?.approvalStatus;
  if (isLoggedIn && approvalStatus === 'pending') {
    if (startsWith(pathname, ['/creators/']) && pathname !== '/creators/pending-approval') {
      return NextResponse.redirect(new URL('/creators/pending-approval', request.url));
    }
  }

  // ── 4. Logged-in and complete → creator-onboarding is allowed ─────────────
  //    (falls through to rule 5 — NextResponse.next())

  // ── 4. Not logged in trying to access a protected route → login ───────────
  const needsAuth =
    exactMatch(pathname, PROTECTED_PAGES) ||
    startsWith(pathname, PROTECTED_PREFIXES);

  if (!isLoggedIn && needsAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 5. Allow everything else through ──────────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp)$).*)',
  ],
};
