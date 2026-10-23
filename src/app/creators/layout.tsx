'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import CreatorNavbar from '@/components/CreatorNavbar';
import LoadingAnimation from '@/components/LoadingAnimation';

/** Session-scoped approval check — avoids /api/user/me on every creator route change */
let approvalPromise: Promise<string | null> | null = null;
let approvalCachedAt = 0;
const APPROVAL_TTL_MS = 60_000;

function fetchApprovalStatus(): Promise<string | null> {
  const now = Date.now();
  if (approvalPromise && now - approvalCachedAt < APPROVAL_TTL_MS) {
    return approvalPromise;
  }
  approvalCachedAt = now;
  approvalPromise = (async () => {
    try {
      const res = await fetch('/api/user/me');
      if (!res.ok) return null;
      const data = await res.json();
      return (data.user?.approvalStatus as string) || null;
    } catch {
      return null;
    }
  })();
  return approvalPromise;
}

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkApproval = async () => {
      if (pathname === '/creators/pending-approval') {
        if (!cancelled) setLoading(false);
        return;
      }

      const status = await fetchApprovalStatus();
      if (cancelled) return;

      if (status === 'pending') {
        router.push('/creators/pending-approval');
        return;
      }
      setLoading(false);
    };

    void checkApproval();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const isDashboardRoute =
    pathname.startsWith('/creators/dashboard') ||
    pathname.startsWith('/creators/chats') ||
    pathname.startsWith('/creators/packages') ||
    pathname.startsWith('/creators/calendar') ||
    pathname.startsWith('/creators/events') ||
    pathname.startsWith('/creators/wallet') ||
    pathname.startsWith('/creators/settings');

  if (loading) return <LoadingAnimation />;

  return (
    <>
      {pathname !== '/creators/pending-approval' &&
        !pathname.includes('/book-session') &&
        !isDashboardRoute && <CreatorNavbar />}
      {children}
    </>
  );
}
