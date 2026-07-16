'use client';

import { useEffect } from 'react';

export function useOnboardingCleanup() {
  useEffect(() => {
    // Removed aggressive cookie clearing that was causing users to be logged out unexpectedly.
    // NextAuth and Next.js middleware already handle session validation securely.
  }, []);
}
