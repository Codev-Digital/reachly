'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import LoadingAnimation from '@/components/LoadingAnimation';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  navigateWithLoading: (path: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const navigateWithLoading = async (path: string) => {
    setIsLoading(true);
    // Small delay to ensure the loading animation is visible
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.href = path;
  };

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
