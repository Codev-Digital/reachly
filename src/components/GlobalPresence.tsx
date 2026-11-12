'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function GlobalPresence() {
  const { status } = useSession();
  const isLoggedInRef = useRef(false);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/user/heartbeat', { method: 'POST' });
        if (!active) return;
        if (res.ok) {
          isLoggedInRef.current = true;
        } else if (res.status === 401) {
          isLoggedInRef.current = false;
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } catch (err) {
        console.error('Failed to send heartbeat', err);
      }
    };

    void sendHeartbeat();

    intervalId = setInterval(() => {
      void sendHeartbeat();
    }, 45000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void sendHeartbeat();
      }
    };

    const handleUnload = () => {
      if (isLoggedInRef.current) {
        navigator.sendBeacon('/api/user/offline');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [status]);

  return null;
}
