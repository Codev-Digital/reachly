'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import { useBooking } from '../layout';

export default function BookSessionStep3() {
  const params = useParams();
  const router = useRouter();
  const { booking, setBooking, nextStep, saveToStorage } = useBooking();
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [saved, setSaved] = useState(true);
  const updateUserDetails = (field: string, value: string) => {
    setBooking(b => ({
      ...b,
      userDetails: { ...b.userDetails, [field]: value },
    }));
  };

  const canProceed =
    booking.userDetails.fullName &&
    booking.userDetails.email &&
    booking.userDetails.whatsapp;

  const handleContinue = async () => {
    if (!canProceed) return;
    const proceedAs = booking.userDetails.proceedAs || 'guest';
    const step4Url = `/creators/${params.username}/book-session/step-4`;

    if (proceedAs === 'guest') {
      nextStep();
      router.push(step4Url);
      return;
    }

    saveToStorage();

    if (proceedAs === 'login') {
      router.push(`/login?callbackUrl=${encodeURIComponent(step4Url)}`);
      return;
    }

    if (proceedAs === 'signup') {
      try { localStorage.setItem('signupEmail', booking.userDetails.email); } catch { }
      setAuthLoading(true);
      setAuthError('');
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: booking.userDetails.email,
            name: booking.userDetails.fullName,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          const verifyUrl = `/verify-email?callbackUrl=${encodeURIComponent(`/set-password?callbackUrl=${encodeURIComponent(step4Url)}`)}`;
          router.push(verifyUrl);
        } else {
          if (data.error?.toLowerCase().includes('already')) {
            setAuthError('An account with this email already exists. Please use the Log in option.');
          } else {
            router.push(`/signup?callbackUrl=${encodeURIComponent(step4Url)}`);
          }
        }
      } catch {
        router.push(`/signup?callbackUrl=${encodeURIComponent(step4Url)}`);
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const creator = booking.creator;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-2">
      {/* Step Progress Indicator */}
      <BookingProgress currentStep={3} />

      <div className="grid grid-cols-1 lg:grid-cols-[370px_1fr] gap-8 items-start justify-items-center">
        <CreatorProfileCard creator={creator} />


        {/* ============ RIGHT COLUMN: YOUR BOOKING DETAILS FORM ============ */}
        <div className="w-full">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm w-full max-w-[790px] mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-gray-100 pb-5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-950">Your Booking Details</h3>
                <p className="text-xs text-gray-400">
                  We&apos;ll create an account for you automatically after booking
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={booking.userDetails.fullName}
                  onChange={e => updateUserDetails('fullName', e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-gray-300 focus:outline-none rounded-xl px-4 py-3 text-xs font-bold text-gray-800 placeholder-gray-400 transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={booking.userDetails.email}
                  onChange={e => updateUserDetails('email', e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-gray-300 focus:outline-none rounded-xl px-4 py-3 text-xs font-bold text-gray-800 placeholder-gray-400 transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center bg-white border border-gray-200 rounded-xl px-4 text-xs font-bold text-gray-500 shadow-xs select-none">
                    +92
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={booking.userDetails.whatsapp}
                    onChange={e => updateUserDetails('whatsapp', e.target.value)}
                    className="flex-grow bg-white border border-gray-200 focus:border-gray-300 focus:outline-none rounded-xl px-4 py-3 text-xs font-bold text-gray-800 placeholder-gray-400 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2">
                  What would you like to discuss
                </label>
                <textarea
                  placeholder="Share a brief overview so the creator can prepare for a session"
                  value={booking.userDetails.whatToDiscuss}
                  onChange={e => updateUserDetails('whatToDiscuss', e.target.value)}
                  rows={4}
                  maxLength={140}
                  className="w-full bg-white border border-gray-200 focus:border-gray-300 focus:outline-none rounded-xl px-4 py-3 text-xs font-bold text-gray-800 placeholder-gray-400 resize-none transition-all shadow-xs"
                />
                <div className="text-right text-[10px] font-bold text-gray-400 mt-1 select-none">
                  {booking.userDetails.whatToDiscuss.length}/140
                </div>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
                <p className="text-red-500 text-xs font-semibold">{authError}</p>
              </div>
            )}

            {/* Navigation Buttons Row inside form panel */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              {/* Back */}
              <button
                onClick={() => router.push(`/creators/${params.username}/book-session/step-2`)}
                className="bg-white border border-gray-200 text-gray-600 font-bold py-2 px-5 rounded-full text-xs hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert("Progress saved successfully!")}
                  className="bg-white border border-gray-200 text-gray-600 font-bold py-2 px-5 rounded-full text-xs hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
                >
                  Save as Draft
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!canProceed || authLoading}
                  className={`py-2 px-6 rounded-full text-xs font-bold transition-all shadow-sm ${canProceed && !authLoading
                    ? 'bg-[#0012FF] text-white hover:bg-[#0010d0]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {authLoading ? 'Processing...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}