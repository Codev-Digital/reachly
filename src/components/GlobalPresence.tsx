'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function GlobalPresence() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;

    // Send an immediate heartbeat on mount
    const sendHeartbeat = () => {
      fetch('/api/user/heartbeat', { method: 'POST' }).catch((err) => {
        console.error('Failed to send heartbeat', err);
      });
    };

    sendHeartbeat();

    // Send heartbeat every 1 minute
    const intervalId = setInterval(sendHeartbeat, 60000);

    // Send offline beacon when window closes
    const handleUnload = () => {
      navigator.sendBeacon('/api/user/offline');
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [status]);

  return null;
}
