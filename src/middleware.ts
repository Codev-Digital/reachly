import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ─── Admin whitelist (must match what admin API routes check) ─────────────────
const ADMIN_EMAILS = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];

// ─── Route groups ─────────────────────────────────────────────────────────────

/** Only unauthenticated users should see these. Logged-in → redirect by role */
const AUTH_ONLY_PAGES = ['/login', '/signup', '/forgot-password'];

/** Signup-flow — allowed for everyone (page itself finishes the guard) */
const SIGNUP_FLOW_PAGES = ['/verify-email', '/set-password'];

/** Public pages — no auth required ever */
const PUBLIC_PREFIXES = [
  '/',
  '/welcome',
  '/about',
  '/for-creators',
  '/how-it-works',
  '/explore-creators',
];

/** Admin-only prefix */
const ADMIN_PREFIX = '/admin';

/** Creator dashboard/settings prefix — requires approved creator role */
const CREATOR_PROTECTED_PREFIXES = [
  '/creators/dashboard',
  '/creators/bookings',
  '/creators/calendar',
  '/creators/availability',
  '/creators/session-types',
  '/creators/earnings',
  '/creators/profile',
  '/creators/reviews',
  '/creators/analytics',
  '/creators/booking-links',
  '/creators/notifications',
  '/creators/settings',
  '/creators/wallet',
  '/creators/pending-approval',
];

/** Creator onboarding prefix — requires login but not necessarily approved */
const ONBOARDING_PREFIX = '/creator-onboarding';

/** User-only prefix — requires login */
const USER_PREFIX = '/user';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const startsWith = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'));

const isAdminEmail = (email?: string | null) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase());

const isApprovedCreator = (approvalStatus?: string) =>
  approvalStatus === 'approved' || approvalStatus === 'active';

// ─── Middleware ───────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through Next.js internals, static files, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|webp|css|js|woff|woff2|map|txt)$/)
  ) {
    return NextResponse.next();
  }

  // Read the JWT session token
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  const secureCookie =
    process.env.NEXTAUTH_URL?.startsWith('https://') ||
    process.env.VERCEL_URL != null ||
    request.url.startsWith('https://');

  const token = await getToken({ req: request, secret, secureCookie });

  const isLoggedIn = !!token;
  const isComplete = !!(token as any)?.isRegistrationComplete;
  const approvalStatus = (token as any)?.approvalStatus || 'none';
  const onboardingStep = (token as any)?.onboardingStep || 0;
  const hasSeenWelcome = !!(token as any)?.hasSeenWelcome;
  const email = (token as any)?.email as string | undefined;

  const isAdmin = isAdminEmail(email);
  const isCreator = isApprovedCreator(approvalStatus);
  const isPendingCreator = approvalStatus === 'pending';
  const isInOnboarding = onboardingStep > 0 && !isCreator && approvalStatus !== 'pending' && approvalStatus !== 'rejected';

  // ── 1. ADMIN ROUTES — only admin emails allowed ───────────────────────────
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
    if (!isAdmin) {
      // Logged in but not admin → send to their correct home
      return NextResponse.redirect(new URL(getHomeForRole({ isAdmin, isCreator, isPendingCreator, isInOnboarding, hasSeenWelcome }), request.url));
    }
    return NextResponse.next();
  }

  // ── 2. CREATOR PROTECTED ROUTES — must be approved creator ───────────────
  if (startsWith(pathname, CREATOR_PROTECTED_PREFIXES)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
    if (isAdmin) {
      // Admins should not access creator dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (pathname === '/creators/pending-approval') {
      return NextResponse.next();
    }
    if (isPendingCreator && pathname !== '/creators/pending-approval') {
      return NextResponse.redirect(new URL('/creators/pending-approval', request.url));
    }
    if (!isCreator && !isPendingCreator) {
      // Regular user or unapproved trying to access creator dashboard
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── 3. CREATOR ONBOARDING — must be logged in ────────────────────────────
  if (pathname.startsWith(ONBOARDING_PREFIX)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (isCreator) {
      // Already approved, no need to onboard again
      return NextResponse.redirect(new URL('/creators/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── 4. USER ROUTES — must be logged in (guest bookings exception handled in page) ──
  if (pathname.startsWith(USER_PREFIX)) {
    // Special case: /user/bookings with guestEmail param is allowed without login
    if (pathname === '/user/bookings' && request.nextUrl.searchParams.has('guestEmail')) {
      return NextResponse.next();
    }
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (isCreator) {
      // Approved creators shouldn't be on user pages
      return NextResponse.redirect(new URL('/creators/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // ── 5. AUTH-ONLY PAGES (login, signup) — redirect logged-in users ─────────
  if (AUTH_ONLY_PAGES.includes(pathname)) {
    if (isLoggedIn && isComplete) {
      return NextResponse.redirect(new URL(getHomeForRole({ isAdmin, isCreator, isPendingCreator, isInOnboarding, hasSeenWelcome }), request.url));
    }
    return NextResponse.next();
  }

  // ── 6. Logged-in but registration NOT complete → finish registration ───────
  if (isLoggedIn && !isComplete) {
    const isAllowedIncomplete =
      AUTH_ONLY_PAGES.includes(pathname) ||
      SIGNUP_FLOW_PAGES.includes(pathname) ||
      pathname === '/welcome' ||
      pathname.startsWith(ONBOARDING_PREFIX);

    if (!isAllowedIncomplete) {
      return NextResponse.redirect(new URL('/set-password', request.url));
    }
    return NextResponse.next();
  }

  // ── 7. Everything else is public — allow through ──────────────────────────
  return NextResponse.next();
}

/** Returns the correct home URL based on the user's role */
function getHomeForRole({
  isAdmin,
  isCreator,
  isPendingCreator,
  isInOnboarding,
  hasSeenWelcome,
}: {
  isAdmin: boolean;
  isCreator: boolean;
  isPendingCreator: boolean;
  isInOnboarding: boolean;
  hasSeenWelcome: boolean;
}) {
  if (isAdmin) return '/admin/dashboard';
  if (isCreator) return '/creators/dashboard';
  if (isPendingCreator) return '/creators/pending-approval';
  if (isInOnboarding) return '/creator-onboarding/step-1';
  if (!hasSeenWelcome) return '/welcome';
  return '/user/dashboard';
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|woff|woff2)$).*)',
  ],
};
