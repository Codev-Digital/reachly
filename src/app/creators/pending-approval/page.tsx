'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreatorPendingApproval() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        
        // If user is not pending, redirect appropriately
        if (data.user.approvalStatus !== 'pending') {
          if (data.user.approvalStatus === 'approved') {
            router.push('/creators/dashboard');
          } else {
            router.push('/');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center">
        <div className="text-[#0012FF] text-lg animate-pulse font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FA] flex flex-col justify-between">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <img src="/assets/logo1.png" alt="Reachly Logo" className="h-10 w-auto" />
            <div className="hidden md:flex items-center gap-10">
              <button className="text-gray-400 font-sans text-xs font-bold">Explore Creators</button>
              <button className="text-gray-400 font-sans text-xs font-bold">Events</button>
              <button className="text-gray-400 font-sans text-xs font-bold">For Creators</button>
              <button className="text-gray-400 font-sans text-xs font-bold">About</button>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-[#0012FF] font-sans font-bold text-xs">Login</button>
              <button className="bg-[#0012FF] text-white px-5 py-2 rounded-full font-sans font-bold text-xs">Sign up</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white border border-gray-200/80 rounded-3xl p-8 sm:p-12 text-center max-w-2xl w-full shadow-sm">
          {/* Circular Success Badge */}
          <div className="mx-auto w-20 h-20 rounded-full bg-[#EEF2FF] flex items-center justify-center mb-8 shadow-xs">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="font-anton text-2xl sm:text-3xl font-normal text-gray-950 mb-4 tracking-wide uppercase">
            Your Request Is Sent!
          </h1>

          {/* Description */}
          <p className="font-sans text-gray-500 text-sm sm:text-base font-medium mb-8 leading-relaxed max-w-lg mx-auto">
            Thank you for submitting your application to Reachly. Our team is currently reviewing your profile and will get back to you shortly. You will receive an email notification once your account is approved.
          </p>

          {/* Steps Timeline Info Card */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  What Happens Next?
                </h3>
                <ul className="space-y-2 text-xs font-bold text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-[#0012FF]">•</span>
                    Our admin team will review your profile details within 24-48 hours.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0012FF]">•</span>
                    You will receive an approval email notification with onboarding guidelines.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0012FF]">•</span>
                    Once approved, you can log in to your creator dashboard and start accepting bookings immediately.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Button to Refresh Status */}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#0012FF] text-white hover:bg-[#0010d0] font-bold py-2.5 px-8 rounded-full text-xs transition-colors shadow-sm"
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* Footer bar */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs font-bold text-gray-400 select-none">
        &copy; {new Date().getFullYear()} Reachly. All rights reserved.
      </footer>
    </div>
  );
}