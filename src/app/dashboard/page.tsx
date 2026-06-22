'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function DashboardRedirect() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      const redirectUser = async () => {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const userData = await res.json();

          if (userData.user.approvalStatus === 'pending') {
            router.push('/creators/pending-approval');
            return;
          }
          
          // Case 1: Has Creator Profile
          if (userData.creatorProfile) {
            if (userData.creatorProfile.isProfileComplete) {
              router.push('/creators/dashboard');
            } else {
              router.push('/creator-onboarding/step-1');
            }
            return;
          }
          
          // Case 2: Onboarding step >0 → creator (even without CreatorProfile yet)
          if (userData.user.onboardingStep > 0) {
            router.push(`/creator-onboarding/step-${userData.user.onboardingStep}`);
            return;
          }
          
          // Case 3: Has seen welcome → user dashboard
          if (userData.user.hasSeenWelcome) {
            router.push('/user/dashboard');
            return;
          }
          
          // Else, go to welcome
          router.push('/welcome');
        } else {
          // Fallback to welcome
          router.push('/welcome');
        }
      };
      redirectUser();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
    <div className="text-[#F9F6F2]">Loading...</div>
  </div>;
}