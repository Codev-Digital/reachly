'use client';

import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { postAuthRoute } from '@/lib/postAuthRoute';

/**
 * Re-syncs the session token from the DB (the middleware only reads the cookie,
 * which can be minutes stale) and navigates with a full page load if the
 * approval status changed. Returns true when it navigated.
 */
export function useApprovalRefresh() {
  const { update } = useSession();
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      await update(); // jwt callback re-reads the DB and rewrites the cookie
      const res = await fetch('/api/user/me');
      if (!res.ok) return false;
      const { user } = await res.json();
      if (user.approvalStatus === 'approved' || user.approvalStatus === 'rejected') {
        window.location.href = postAuthRoute(user);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setChecking(false);
    }
  }, [update]);

  return { refresh, checking };
}
