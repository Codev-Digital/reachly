import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { postAuthRoute } from "@/lib/postAuthRoute";

// ─── Simple In-Memory Rate Limiter ──────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 200; // 200 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limitInfo = rateLimitMap.get(ip);
  if (!limitInfo) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (now > limitInfo.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  limitInfo.count++;
  if (limitInfo.count > MAX_REQUESTS) {
    return true;
  }
  return false;
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── Admin whitelist (must match what admin API routes check) ─────────────────
const ADMIN_EMAILS = ["abdullahgotaccess@gmail.com", "admin@reachly.com"];

// ─── Route groups ─────────────────────────────────────────────────────────────

/** Only unauthenticated users should see these. Logged-in → redirect by role */
const AUTH_ONLY_PAGES = ["/login", "/signup", "/forgot-password"];

/** Signup-flow — allowed for everyone (page itself finishes the guard) */
const SIGNUP_FLOW_PAGES = ["/verify-email", "/set-password"];

/** Public pages — no auth required ever */
const PUBLIC_PREFIXES = [
  "/",
  "/welcome",
  "/about",
  "/for-creators",
  "/how-it-works",
  "/explore-creators",
  "/contact-support",
];

/** Admin-only prefix */
const ADMIN_PREFIX = "/admin";

/** Creator dashboard/settings prefix — requires approved creator role */
const CREATOR_PROTECTED_PREFIXES = [
  "/creators/dashboard",
  "/creators/bookings",
  "/creators/calendar",
  "/creators/availability",
  "/creators/session-types",
  "/creators/earnings",
  "/creators/profile",
  "/creators/reviews",
  "/creators/analytics",
  "/creators/booking-links",
  "/creators/notifications",
  "/creators/settings",
  "/creators/wallet",
  "/creators/pending-approval",
];

/** Creator onboarding prefix — requires login but not necessarily approved */
const ONBOARDING_PREFIX = "/creator-onboarding";

/** User-only prefix — requires login */
const USER_PREFIX = "/user";
const USER_PENDING_PAGE = "/user/pending-approval";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const startsWith = (pathname: string, prefixes: string[]) =>
  prefixes.some(
    (p) =>
      pathname === p ||
      pathname.startsWith(p + "/") ||
      pathname.startsWith(p + "?"),
  );

const isAdminEmail = (email?: string | null) =>
  !!email && ADMIN_EMAILS.includes(email.toLowerCase());

const isApprovedCreator = (
  approvalStatus?: string,
  hasCreatorProfile?: boolean,
): boolean =>
  !!hasCreatorProfile &&
  (approvalStatus === "approved" || approvalStatus === "active");

// ─── Middleware ───────────────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through Next.js internals and static files without rate limiting
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(
      /\.(svg|png|jpg|jpeg|gif|ico|webp|css|js|woff|woff2|map|txt)$/,
    )
  ) {
    return NextResponse.next();
  }

  // Apply Rate Limiting to API and page routes (skip in development and loopback)
  const isDev = process.env.NODE_ENV === 'development';
  const ip =
    request.headers.get("x-forwarded-for") || (request as any).ip || "unknown";
  if (!isDev && ip !== "unknown" && ip !== "127.0.0.1" && ip !== "::1" && isRateLimited(ip)) {
    return new NextResponse("Too Many Requests. Please try again later.", {
      status: 429,
    });
  }

  // Allow API routes to pass through auth checks
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Redirect /creators/bookings to /creators/calendar
  if (pathname === "/creators/bookings" || pathname.startsWith("/creators/bookings/")) {
    return NextResponse.redirect(new URL("/creators/calendar", request.url));
  }

  // Read the JWT session token with resilient fallback across HTTP/HTTPS proxies
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  let token = await getToken({ req: request, secret });
  if (!token) {
    token = await getToken({ req: request, secret, secureCookie: true });
  }

  const isLoggedIn = !!token;
  const isComplete = !!(token as any)?.isRegistrationComplete;
  const approvalStatus = (token as any)?.approvalStatus || "none";
  const hasCreatorProfile = !!(token as any)?.hasCreatorProfile;
  const onboardingStep = (token as any)?.onboardingStep || 0;
  const hasSeenWelcome = !!(token as any)?.hasSeenWelcome;
  const email = (token as any)?.email as string | undefined;

  const isAdmin = isAdminEmail(email);
  const isCreator = isApprovedCreator(approvalStatus, hasCreatorProfile);
  const isPendingCreator = approvalStatus === "pending";
  const isPendingUser = approvalStatus === "pending" && !hasCreatorProfile;

  const isRejected = approvalStatus === "rejected";
  const home = {
    isAdmin,
    approvalStatus,
    onboardingStep,
    hasSeenWelcome,
    hasCreatorProfile,
  };

  // ── 1. ADMIN ROUTES — only admin emails allowed ───────────────────────────
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(
          `/login?callbackUrl=${encodeURIComponent(pathname)}`,
          request.url,
        ),
      );
    }
    if (!isAdmin) {
      // Logged in but not admin → send to their correct home
      return NextResponse.redirect(
        new URL(
          postAuthRoute(home),
          request.url,
        ),
      );
    }
    return NextResponse.next();
  }

  // ── 2. CREATOR PROTECTED ROUTES — must be approved creator ───────────────
  if (startsWith(pathname, CREATOR_PROTECTED_PREFIXES)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(
          `/login?callbackUrl=${encodeURIComponent(pathname)}`,
          request.url,
        ),
      );
    }
    if (isAdmin) {
      // Admins should not access creator dashboard
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (isRejected) {
      return NextResponse.redirect(new URL("/rejected", request.url));
    }
    if (pathname === "/creators/pending-approval") {
      return NextResponse.next();
    }
    if (isPendingCreator && pathname !== "/creators/pending-approval") {
      return NextResponse.redirect(
        new URL("/creators/pending-approval", request.url),
      );
    }
    if (isPendingUser) {
      return NextResponse.redirect(new URL(USER_PENDING_PAGE, request.url));
    }
    if (!isCreator && !isPendingCreator) {
      // Regular user or unapproved trying to access creator dashboard
      return NextResponse.redirect(new URL(postAuthRoute(home), request.url));
    }
    return NextResponse.next();
  }

  // ── 3. CREATOR ONBOARDING — must be logged in ────────────────────────────
  if (pathname.startsWith(ONBOARDING_PREFIX)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(
          `/login?callbackUrl=${encodeURIComponent(pathname)}`,
          request.url,
        ),
      );
    }
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (isRejected) {
      return NextResponse.redirect(new URL("/rejected", request.url));
    }
    if (isCreator) {
      // Already approved, no need to onboard again
      return NextResponse.redirect(new URL("/creators/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // ── 4. USER ROUTES — must be logged in (guest bookings exception handled in page) ──
  if (pathname.startsWith(USER_PREFIX)) {
    // Special case: /user/bookings with guestEmail param is allowed without login
    if (
      pathname === "/user/bookings" &&
      request.nextUrl.searchParams.has("guestEmail")
    ) {
      return NextResponse.next();
    }
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(
          `/login?callbackUrl=${encodeURIComponent(pathname)}`,
          request.url,
        ),
      );
    }
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (isCreator) {
      // Approved creators shouldn't be on user pages
      return NextResponse.redirect(new URL("/creators/dashboard", request.url));
    }
    if (isPendingUser && pathname !== USER_PENDING_PAGE) {
      return NextResponse.redirect(new URL(USER_PENDING_PAGE, request.url));
    }
    // Not approved yet (none/rejected): send to the right onboarding step
    if (!isPendingUser && approvalStatus !== "approved" && approvalStatus !== "active") {
      return NextResponse.redirect(new URL(postAuthRoute(home), request.url));
    }
    return NextResponse.next();
  }

  // ── 4b. USER ONBOARDING / REJECTED SCREEN — login required ────────────────
  if (pathname === "/user-onboarding" || pathname === "/rejected") {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url),
      );
    }
    const target = postAuthRoute(home);
    // /user-onboarding: allow none, and pending users without a creator profile
    // (the page sends them back to pending-approval if their info is complete).
    const allowed =
      pathname === "/rejected"
        ? isRejected
        : !isAdmin && !isRejected && !hasCreatorProfile && onboardingStep === 0 &&
          (approvalStatus === "none" || isPendingUser);
    if (!allowed) return NextResponse.redirect(new URL(target, request.url));
    return NextResponse.next();
  }

  // ── 5. AUTH-ONLY PAGES (login, signup) — redirect logged-in users ─────────
  if (AUTH_ONLY_PAGES.includes(pathname)) {
    if (isLoggedIn && isComplete) {
      return NextResponse.redirect(
        new URL(
          postAuthRoute(home),
          request.url,
        ),
      );
    }
    return NextResponse.next();
  }

  // ── 6. Logged-in but registration NOT complete → finish registration ───────
  if (isLoggedIn && !isComplete) {
    const isAllowedIncomplete =
      AUTH_ONLY_PAGES.includes(pathname) ||
      SIGNUP_FLOW_PAGES.includes(pathname) ||
      pathname === "/welcome" ||
      pathname.startsWith(ONBOARDING_PREFIX);

    if (!isAllowedIncomplete) {
      return NextResponse.redirect(new URL("/set-password", request.url));
    }
    return NextResponse.next();
  }

  // ── 7. Everything else is public — allow through ──────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|woff|woff2)$).*)",
  ],
};
