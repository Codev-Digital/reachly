'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingAnimation from '@/components/LoadingAnimation';

export default function CreatorOnboardingStep1() {
  const router = useRouter();

  useEffect(() => {
    const incrementStep = async () => {
      try {
        await fetch('/api/creator-onboarding/step-1', { method: 'GET' });
      } catch (err) {
        console.error('Error incrementing step:', err);
      } finally {
        router.push('/creator-onboarding/step-2');
      }
    };
    
    incrementStep();
  }, [router]);

  return <LoadingAnimation />;
}
