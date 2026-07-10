'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingAnimation from '@/components/LoadingAnimation';

export default function CreatorOnboardingStep1() {
  const router = useRouter();

  useEffect(() => {
    router.push('/creator-onboarding/step-2');
  }, [router]);

  return <LoadingAnimation />;
}
