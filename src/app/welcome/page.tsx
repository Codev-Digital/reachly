'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Logo from '../components/Logo';
import HeroImage from '../components/HeroImage';
import LoadingAnimation from '@/components/LoadingAnimation';

export default function WelcomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [redirected, setRedirected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (status === 'authenticated' && !redirected) {
      const redirectUser = async () => {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
          
          // Case Admin: Admin user should go straight to admin pending requests page
          if (data.user.email === 'admin@reachly.com' || data.user.email === 'abdullahgotaccess@gmail.com') {
            setRedirected(true);
            router.push('/admin/requests');
            return;
          }

          // Case 0: Pending approval should always take priority
          if (data.user.approvalStatus === 'pending') {
            setRedirected(true);
            router.push('/creators/pending-approval');
            return;
          }

          // Case 1: Has Creator Profile
          if (data.creatorProfile) {
            setRedirected(true);
            if (data.user.approvalStatus === 'approved' && data.creatorProfile.isProfileComplete) {
              router.push('/creators/dashboard');
            } else if (!data.creatorProfile.isProfileComplete) {
              router.push('/creator-onboarding/step-1');
            } else {
              router.push('/creators/pending-approval');
            }
            return;
          }
          
          // Case 2: Onboarding step >0 → creator (even without CreatorProfile yet)
          if (data.user.onboardingStep > 0) {
            setRedirected(true);
            router.push(`/creator-onboarding/step-${data.user.onboardingStep}`);
            return;
          }
          
          // Case 3: Has seen welcome → user dashboard
          if (data.user.hasSeenWelcome) {
            setRedirected(true);
            router.push('/user/dashboard');
            return;
          }
        }
        setIsLoading(false);
      };
      redirectUser();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, redirected, router]);

  if (isLoading || status === 'loading') return <LoadingAnimation />;

  const handleBookSessions = async () => {
    setIsLoadingButton(true);
    try {
      await fetch('/api/user/update-onboarding-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 0 }), // We can use 0 to indicate user
      });
      router.push('/user/dashboard');
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      router.push('/user/dashboard');
    } finally {
      setIsLoadingButton(false);
    }
  };

  const handleBecomeCreator = async () => {
    setIsLoadingButton(true);
    try {
      await fetch('/api/user/update-onboarding-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 1 }), // Step 1 for creator onboarding
      });
      router.push('/creator-onboarding/step-1');
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      router.push('/creator-onboarding/step-1');
    } finally {
      setIsLoadingButton(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
          {/* Left Content */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-16 flex flex-col justify-center">
            <div className="mb-8 sm:mb-12 lg:mb-16">
              <Logo />
            </div>

            <p className="font-sans text-[#C8A97E] text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              Step 1 of 2
            </p>

            <div className="mb-8 sm:mb-10 lg:mb-12">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#C8A97E] mb-3 sm:mb-4">
                Welcome to Reach<span className="text-white">ly</span>
              </h1>
              <p className="font-sans text-[#F9F6F2] text-sm sm:text-base">
                What brings you here today? Choose your path below.
              </p>
            </div>

            {/* Path Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10 lg:mb-12">
              {/* Book sessions card */}
              <div
                className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-5 sm:p-6 md:p-8 cursor-pointer hover:border-[rgba(200,169,126,0.5)] transition-all"
                onClick={handleBookSessions}
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
                    <Image
                      src="/Frame 2085668077.svg"
                      alt="User"
                      width={28}
                      height={28}
                      className="sm:w-8 sm:h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                      I want to book sessions
                    </h3>
                    <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm leading-5 sm:leading-6 opacity-80">
                      Find creators you admire and book personalized video calls
                      to learn, grow, and connect.
                    </p>
                  </div>
                  {isLoadingButton ? (
                    <svg className="animate-spin h-6 w-6 text-[#C8A97E]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-6 sm:h-6">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#C8A97E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Become a creator card */}
              <div
                className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-5 sm:p-6 md:p-8 cursor-pointer hover:border-[rgba(200,169,126,0.5)] transition-all"
                onClick={handleBecomeCreator}
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
                    <Image
                      src="/Frame 2085668077.svg"
                      alt="Creator"
                      width={28}
                      height={28}
                      className="sm:w-8 sm:h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                      I want to be a creator
                    </h3>
                    <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm leading-5 sm:leading-6 opacity-80">
                      Share your knowledge, connect with your audience, and
                      monetize your expertise through 1-on-1 sessions.
                    </p>
                  </div>
                  {isLoadingButton ? (
                    <svg className="animate-spin h-6 w-6 text-[#C8A97E]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-6 sm:h-6">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#C8A97E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-[rgba(200,169,126,0.15)]" />
              <p className="font-sans text-[#F9F6F2] text-sm sm:text-base pt-4 sm:pt-6 text-center">
                Already have an account?{' '}
                <span
                  className="font-semibold text-[#C8A97E] cursor-pointer hover:underline"
                  onClick={() => router.push('/login')}
                >
                  Log In
                </span>
              </p>
            </div>
          </div>

          {/* Right Side — tablets and larger */}
          <div className="hidden md:block lg:block">
            <div className="h-full min-h-[400px] md:min-h-[600px] lg:min-h-[800px]">
              <HeroImage />
            </div>
          </div>

          {/* Mobile hero */}
          <div className="block md:hidden mt-6">
            <div className="h-[350px] rounded-[20px] overflow-hidden">
              <HeroImage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
