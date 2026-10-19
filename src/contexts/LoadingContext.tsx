'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import LoadingAnimation from '@/components/LoadingAnimation';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  navigateWithLoading: (path: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Instant client-side navigation: no artificial delay, no spinner, no full page reload.
  const navigateWithLoading = (path: string) => {
    router.push(path);
  };

  // If the browser restores this page from its back/forward cache, make sure a
  // stale spinner state is never shown.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setIsLoading(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading: setIsLoading, navigateWithLoading }}>
      {isLoading && <LoadingAnimation />}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
