'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import LoadingAnimation from '@/components/LoadingAnimation';
import WelcomeModal from '@/components/WelcomeModal';
import Home from '../page';

export default function WelcomePage() {
  const router = useRouter();
  const { status } = useSession();
  const [redirected, setRedirected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [selected, setSelected] = useState<'user' | 'creator' | null>(null);
  const searchParams = useSearchParams();
   const ref = searchParams.get("ref")
   console.log("Referral Code in Welcome Page:", ref); // Log the referral code to the console
  const hasSelected = useRef(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && !redirected) {
      const redirectUser = async () => {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setUserData(data);

          if (data.user.email === 'admin@reachly.com' || data.user.email === 'abdullahgotaccess@gmail.com') {
            setRedirected(true);
            hasSelected.current = true;
            router.replace('/admin/requests');
            return;
          }

          if (data.user.approvalStatus === 'pending' && data.user.hasCreatorProfile) {
            setRedirected(true);
            hasSelected.current = true;
            router.replace('/creators/pending-approval');
            return;
          }

          if (data.user.approvalStatus === 'pending') {
            setRedirected(true);
            hasSelected.current = true;
            router.replace('/user/pending-approval');
            return;
          }

          if (data.creatorProfile) {
            setRedirected(true);
            hasSelected.current = true;
            if (data.user.approvalStatus === 'approved' && data.creatorProfile.isProfileComplete) {
              router.replace('/creators/dashboard');
            } else if (!data.creatorProfile.isProfileComplete) {
              router.replace('/creator-onboarding/step-1');
            } else {
              router.replace('/creators/pending-approval');
            }
            return;
          }

          if (data.user.onboardingStep > 0) {
            setRedirected(true);
            hasSelected.current = true;
            router.replace(`/creator-onboarding/step-${data.user.onboardingStep}`);
            return;
          }

          if (data.user.hasSeenWelcome) {
            setRedirected(true);
            hasSelected.current = true;
            router.replace('/user/dashboard');
            return;
          }
        }
        setIsLoading(false);
      };
      redirectUser();
    } else if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, redirected, router]);

  const handleNext = async () => {
    if (!selected || hasSelected.current) return;
    hasSelected.current = true;
    setIsLoadingButton(true);

    try {
      await fetch('/api/user/update-onboarding-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: selected === 'creator' ? 1 : 0 , ref}),
      });
      router.push(selected === 'creator' ? '/creator-onboarding/step-1' : '/user/pending-approval');
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      router.push(selected === 'creator' ? '/creator-onboarding/step-1' : '/user/pending-approval');
    } finally {
      setIsLoadingButton(false);
    }
  };

  if (isLoading || status === 'loading') return <LoadingAnimation />;

  const firstName = (userData?.user?.name || '').trim().split(' ')[0] || 'there';

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none select-none" aria-hidden="true">
        <Home />
        <div className="fixed top-[88px] inset-x-0 z-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-2 rounded-md bg-[#e6f4ea] text-[#137333] text-sm font-medium px-4 py-2.5 shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#137333" />
              <path d="M8 12.5l2.5 2.5L16 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Your account has been created.
          </div>
        </div>
      </div>

      <WelcomeModal
        firstName={firstName}
        selected={selected}
        onSelect={setSelected}
        onNext={handleNext}
        loading={isLoadingButton}
      />
    </div>
  );
}
