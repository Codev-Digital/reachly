'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function OnboardingNavbar() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [onboardingStep, setOnboardingStep] = useState<number>(2);

  // Determine current active step index (1-based)
  let activeStep = 0;
  if (pathname.includes('/step-2')) activeStep = 1;
  else if (pathname.includes('/step-3')) activeStep = 2;
  else if (pathname.includes('/step-4')) activeStep = 3;
  else if (pathname.includes('/step-5')) activeStep = 4;

  const showStepper = activeStep > 0;

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setOnboardingStep(data.user.onboardingStep || 2);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    // Clear cookies, localStorage, and sessionStorage
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    localStorage.clear();
    sessionStorage.clear();
    await signOut({ callbackUrl: '/login' });
  };

  const handleDashboardRedirect = () => {
    router.push(`/creator-onboarding/step-${onboardingStep}`);
  };

  return (
    <div className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 bg-[#F7F7FA] w-full">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border border-gray-100 rounded-2xl sm:rounded-3xl mb-4 max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/assets/Blue logo svg 1.svg"
                alt="Reachly"
                className="object-contain w-auto h-8 sm:h-9 cursor-pointer"
              />
            </Link>

            {/* Middle Nav Links */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10">
              <Link
                href="/explore-creators"
                className="font-sans text-sm font-semibold text-gray-500 hover:text-[#0012FF] transition-all whitespace-nowrap"
              >
                Explore Creators
              </Link>
              <Link
                href="/events"
                className="font-sans text-sm font-semibold text-gray-500 hover:text-[#0012FF] transition-all whitespace-nowrap"
              >
                Events
              </Link>
              <Link
                href="/for-creators"
                className="font-sans text-sm font-semibold text-gray-500 hover:text-[#0012FF] transition-all whitespace-nowrap"
              >
                For Creators
              </Link>
              <Link
                href="/about"
                className="font-sans text-sm font-semibold text-gray-500 hover:text-[#0012FF] transition-all whitespace-nowrap"
              >
                About
              </Link>
            </div>

            {/* Navigation items on the right */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDashboardRedirect}
                className="px-4 py-2 border border-[#0012FF] text-[#0012FF] rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#0012FF]/5 transition-all cursor-pointer bg-white"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-[#0012FF] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#0012FF]/95 transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Unified Progress Stepper */}
      {showStepper && (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl sm:rounded-3xl p-3 max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between py-1 px-4">
            {[1, 2, 3, 4].map((num, idx) => {
              const isCompleted = activeStep > num;
              const isActive = activeStep === num;

              return (
                <div key={num} className="flex items-center flex-1 last:flex-none">
                  {/* Step Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all shadow-sm flex-shrink-0 ${
                      isCompleted
                        ? 'bg-[#0012FF] text-white border border-[#0012FF]'
                        : isActive
                        ? 'bg-[#EEF2FF] text-[#0012FF] border border-[#0012FF] ring-4 ring-blue-50'
                        : 'bg-white text-gray-400 border border-gray-200'
                    }`}
                  >
                    {isCompleted ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3.5 h-3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      num
                    )}
                  </div>

                  {/* Connecting Line */}
                  {idx < 3 && (
                    <div className="flex-1 mx-2 sm:mx-4 h-0.5 relative bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-[#0012FF] transition-all duration-500"
                        style={{ width: isCompleted ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
