'use client';

import { logout } from '@/lib/logout';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function OnboardingNavbar({ showAuthButtons = false }: { showAuthButtons?: boolean }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const [onboardingStep, setOnboardingStep] = useState<number>(2);

  // Determine current active step index (1-based)
  let activeStep = 0;
  if (pathname.includes('/step-2')) activeStep = 1;
  else if (pathname.includes('/step-3')) activeStep = 2;
  else if (pathname.includes('/step-4')) activeStep = 3;
  else if (pathname.includes('/step-5')) activeStep = 4;

  const showStepper = activeStep > 0 && pathname.includes('/creator-onboarding');

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
    const rememberedEmail = localStorage.getItem('reachly_remember_email');
    localStorage.clear();
    if (rememberedEmail) {
      localStorage.setItem('reachly_remember_email', rememberedEmail);
    }
    sessionStorage.clear();
    await logout('/login');
  };

  const handleNavClick = async (url: string) => {
    if (pathname.includes('/creator-onboarding') || pathname === '/welcome') {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      localStorage.clear();
      sessionStorage.clear();
      await logout(url);
    } else {
      router.push(url);
    }
  };

  const handleDashboardRedirect = () => {
    router.push(`/creator-onboarding/step-${onboardingStep}`);
  };

  const isBookSession = pathname.includes('/book-session');

  return (
    <div className={`mx-auto pt-3 sm:pt-4 w-full ${isBookSession ? 'max-w-7xl px-4 sm:px-6' : 'max-w-[1536px] px-4 sm:px-6 lg:px-10'}`}>
      {/* Top Navbar */}
      <nav className="bg-white border border-[#e2e2e2] rounded-2xl sm:rounded-3xl mb-4">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <img
                src="/assets/Blue logo svg 1.svg"
                alt="Reachly"
                className="object-contain w-auto h-8 sm:h-9"
              />
            </div>

            {/* Middle Nav Links */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10">
              <span
                onClick={() => handleNavClick('/explore-creators')}
                className="font-sans text-sm font-semibold text-gray-500 hover:text-[#0012FF] transition-all whitespace-nowrap cursor-pointer"
              >
                Explore Creators
              </span>
              <span
                onClick={() => handleNavClick('/events')}
                className="font-sans text-sm font-semibold text-gray-500 hover:text-[#0012FF] transition-all whitespace-nowrap cursor-pointer"
              >
                Events
              </span>
              <span
                onClick={() => handleNavClick('/for-creators')}
                className="font-sans text-sm font-semibold text-gray-500 hover:text-[#0012FF] transition-all whitespace-nowrap cursor-pointer"
              >
                For Creators
              </span>
              <span
                onClick={() => handleNavClick('/about')}
                className="font-sans text-sm font-semibold text-gray-500 hover:text-[#0012FF] transition-all whitespace-nowrap cursor-pointer"
              >
                About
              </span>
            </div>

            {/* Navigation items on the right */}
            <div className="flex items-center gap-3">
              {showAuthButtons ? (
                <>
                  <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-[#0012FF] transition-colors px-3 py-2">Login</Link>
                  <Link href="/signup" className="bg-[#0012FF] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#0010d0] transition-all shadow-sm">Sign up</Link>
                </>
              ) : (
                <>

                  <button
                    onClick={handleLogout}
                    className="bg-[#0012FF] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#0012FF]/95 transition-all cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Unified Progress Stepper */}
      {showStepper && (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl sm:rounded-3xl px-4 py-3 max-w-2xl mx-auto mb-6">
          <div className="flex items-center w-full select-none">
            {[1, 2, 3, 4].map((num, idx) => {
              const isCompleted = activeStep > num;
              const isActive = activeStep === num;

              return (
                <div key={num} className="flex items-center flex-1 last:flex-none">
                  <div
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`Step ${num}${isCompleted ? ', completed' : isActive ? ', current' : ''}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all border shrink-0 ${isCompleted
                      ? 'bg-[#0012FF] border-[#0012FF] text-white'
                      : isActive
                        ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF]'
                        : 'bg-white border-[#e2e2e2] text-gray-400'
                      }`}
                  >
                    {isCompleted ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      num
                    )}
                  </div>

                  {idx < 3 && (
                    <div
                      aria-hidden="true"
                      className={`flex-grow h-px ${isCompleted ? 'bg-[#0012FF]' : 'bg-[#e2e2e2]'}`}
                    />
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
