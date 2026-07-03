'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorOnboardingStep1() {
  const router = useRouter();

  useEffect(() => {
    router.push('/creator-onboarding/step-2');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#0012FF] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}
