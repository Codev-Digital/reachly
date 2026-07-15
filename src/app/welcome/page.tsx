'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import HeroImage from '../components/HeroImage';
import LoadingAnimation from '@/components/LoadingAnimation';
import { Briefcase, User, ArrowUpRight } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [redirected, setRedirected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const hasSelected = useRef(false);

  useEffect(() => {
    const handleLeave = async () => {
      if (!hasSelected.current) {
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        localStorage.clear();
        sessionStorage.clear();

        // Log out of NextAuth
        const { signOut } = await import('next-auth/react');
        await signOut({ redirect: false });
      }
    };

    const handleBeforeUnload = () => {
      if (!hasSelected.current) {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        localStorage.clear();
        sessionStorage.clear();
      }
    };

    const handlePopState = () => {
      if (!hasSelected.current) {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        localStorage.clear();
        sessionStorage.clear();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      handleLeave();
    };
  }, []);

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
            hasSelected.current = true;
            router.push('/admin/requests');
            return;
          }

          // Case 0: Pending approval should always take priority
          if (data.user.approvalStatus === 'pending') {
            setRedirected(true);
            hasSelected.current = true;
            router.push('/creators/pending-approval');
            return;
          }

          // Case 1: Has Creator Profile
          if (data.creatorProfile) {
            setRedirected(true);
            hasSelected.current = true;
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
            hasSelected.current = true;
            router.push(`/creator-onboarding/step-${data.user.onboardingStep}`);
            return;
          }

          // Case 3: Has seen welcome → user dashboard
          if (data.user.hasSeenWelcome) {
            setRedirected(true);
            hasSelected.current = true;
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
    hasSelected.current = true;
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
    hasSelected.current = true;
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
    <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1280px] bg-white rounded-[32px] shadow-sm overflow-hidden min-h-[680px] sm:min-h-[780px] flex flex-col lg:flex-row items-stretch">
        {/* Left Content Column */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
          {/* Logo */}
          <div
            onClick={async () => {
              hasSelected.current = true;
              document.cookie.split(";").forEach((c) => {
                document.cookie = c
                  .replace(/^ +/, "")
                  .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
              });
              localStorage.clear();
              sessionStorage.clear();
              const { signOut } = await import('next-auth/react');
              await signOut({ callbackUrl: '/' });
            }}
            className="flex justify-start mb-12 lg:mb-0 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img src="/assets/Blue logo svg 1.svg" alt="Reachly Logo" className="h-8 w-auto object-contain" />
          </div>

          {/* Centered Welcome Content */}
          <div className="flex-grow flex flex-col justify-center max-w-xl mx-auto w-full my-8 lg:my-0">
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-black font-sans tracking-tight mb-2">
                Welcome to Reachly
              </h1>
              <p className="text-sm sm:text-base text-gray-500 font-sans">
                What brings you here today? Choose your path below.
              </p>
            </div>

            {/* Path Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">              {/* I want to book sessions */}
              <div
                onClick={handleBookSessions}
                className="relative overflow-hidden group rounded-2xl p-6 sm:p-7 cursor-pointer transition-all hover:scale-[1.02] active:scale-98 min-h-[240px] flex flex-col justify-between"
              >
                {/* SVG Background */}
                <img
                  src="/assets/welcome-card-1.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />

                {/* Arrow up-right */}
                {/* Vector Icon */}
                <div className="relative z-10 flex justify-end">
                  <img
                    src="/assets/vector.svg"
                    alt=""
                    className="
      w-3 h-3 sm:w-3.5 sm:h-3.5
      object-contain
      -mt-4
      -mr-5
      transition-transform duration-200
      group-hover:translate-x-0.5
      group-hover:-translate-y-0.5
      select-none pointer-events-none
    "
                  />
                </div>

                <div className="relative z-10 flex flex-col gap-4 flex-1 pb-3">
                  <div className="w-12 h-12 rounded-[14px] bg-[#EEF2FF] flex items-center justify-center">
                    <img
                      src="/assets/box.svg"
                      alt=""
                      className="w-5.5 h-5.5 object-contain select-none pointer-events-none"
                    />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-[17px] text-black mb-3 tracking-tight">
                      I Want to Book Sessions
                    </h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed font-normal">
                      Find creators you admire and book personalized video calls to learn , grow and connect
                    </p>
                  </div>
                </div>
              </div>

              {/* I want to be a creator */}
              <div
                onClick={handleBecomeCreator}
                className="relative overflow-hidden group rounded-2xl p-6 sm:p-7 cursor-pointer transition-all hover:scale-[1.02] active:scale-98 min-h-[240px] flex flex-col justify-between"
              >
                {/* SVG Background */}
                <img
                  src="/assets/welcome-card-2.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />

                {/* Arrow up-right */}
                {/* Vector Icon */}
                {/* Vector Icon */}
                <div className="relative z-10 flex justify-end">
                  <img
                    src="/assets/vector.svg"
                    alt=""
                    className="
      w-3 h-3 sm:w-3.5 sm:h-3.5
      object-contain
      -mt-4
      -mr-5
      transition-transform duration-200
      group-hover:translate-x-0.5
      group-hover:-translate-y-0.5
      select-none pointer-events-none
    "
                  />
                </div>

                <div className="relative z-10 flex flex-col gap-4 flex-1 pb-3">
                  <div className="w-12 h-12 rounded-[14px] bg-[#EEF2FF] flex items-center justify-center">
                    <img
                      src="/assets/star.svg"
                      alt=""
                      className="w-5.5 h-5.5 object-contain select-none pointer-events-none"
                    />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-[17px] text-black mb-3 tracking-tight">
                      I Want to be a Creator
                    </h3>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed font-normal">
                      Share your knowledge, connect with your audience and monetize your expertise through 1-on-1 sessions.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Login Link */}
            <p className="text-sm text-gray-500 text-center font-sans">
              Already have an account?{' '}
              <span
                onClick={async () => {
                  hasSelected.current = true;
                  document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                      .replace(/^ +/, "")
                      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                  });
                  localStorage.clear();
                  sessionStorage.clear();
                  await signOut({ callbackUrl: '/login' });
                }}
                className="font-bold text-[#0012FF] cursor-pointer hover:underline"
              >
                Log in
              </span>
            </p>
          </div>
        </div>

        {/* Right Hero Column */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 flex items-stretch">
          <div className="w-full min-h-[350px] sm:min-h-[450px] lg:min-h-0 flex-grow">
            <HeroImage />
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoadingButton && (
        <div className="fixed bottom-6 right-6 z-50 bg-white p-3 rounded-full shadow-lg border border-gray-100 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-3 border-gray-200 border-t-[#0012FF] animate-spin"></div>
        </div>
      )}
    </div>
  );
}
