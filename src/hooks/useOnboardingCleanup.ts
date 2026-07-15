'use client';

import { useEffect } from 'react';

export function useOnboardingCleanup() {
  useEffect(() => {
    const clearOnboardingState = () => {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      localStorage.clear();
      sessionStorage.clear();
    };

    const handleBeforeUnload = () => {
      clearOnboardingState();
    };

    const handlePopState = () => {
      if (!window.location.pathname.startsWith('/creator-onboarding')) {
        clearOnboardingState();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
}
