'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
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
    <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1280px] bg-white rounded-[32px] shadow-sm overflow-hidden min-h-[680px] sm:min-h-[780px] flex flex-col lg:flex-row items-stretch">
        {/* Left Content Column */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
          {/* Logo */}
          <div
            onClick={() => router.push('/')}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">

              {/* I want to book sessions */}
              <div
                onClick={handleBookSessions}
                className="relative overflow-hidden group rounded-3xl p-6 sm:p-8 cursor-pointer transition-all hover:scale-[1.02] active:scale-98 min-h-[240px] flex flex-col justify-between"
              >
                {/* SVG Background */}
                <img
                  src="/assets/welcome-card-1.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />

                {/* Arrow up-right */}
                <div
                  className="
    absolute
    top-1 right-6
    sm:top-7 sm:right-5
    md:top-4 md:right-3
    text-[#0012FF]
    group-hover:translate-x-0.5
    group-hover:-translate-y-0.5
    transition-transform
    z-10
  "
                >
                  <ArrowUpRight className="w-5 h-5 sm:w-5 sm:h-6" />
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-[#0012FF]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[15px] sm:text-[17px] text-black mb-2 font-sans tracking-tight whitespace-nowrap">
                      I Want to Book Sessions
                    </h3>
                    <p className="text-xs text-gray-500 font-sans leading-relaxed">
                      Find creators you admire and book personalized video calls to learn, grow and connect
                    </p>
                  </div>
                </div>
              </div>

              {/* I want to be a creator */}
              <div
                onClick={handleBecomeCreator}
                className="relative overflow-hidden group rounded-3xl p-6 sm:p-8 cursor-pointer transition-all hover:scale-[1.02] active:scale-98 min-h-[240px] flex flex-col justify-between"
              >
                {/* SVG Background */}
                <img
                  src="/assets/welcome-card-2.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                />

                {/* Arrow up-right */}
                <div
                  className="
    absolute
    top-1 right-6
    sm:top-7 sm:right-5
    md:top-4 md:right-3
    text-[#0012FF]
    group-hover:translate-x-0.5
    group-hover:-translate-y-0.5
    transition-transform
    z-10
  "
                >
                  <ArrowUpRight className="w-5 h-5 sm:w-5 sm:h-6" />
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
                    <User className="h-5 w-5 text-[#0012FF]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[15px] sm:text-[17px] text-black mb-2 font-sans tracking-tight">
                      I Want to be a Creator
                    </h3>
                    <p className="text-xs text-gray-500 font-sans leading-relaxed">
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
                onClick={() => signOut({ callbackUrl: '/login' })}
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
    </div>
  );
}
