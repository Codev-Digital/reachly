'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import { useBooking } from '../layout';

export default function BookSessionStep3() {
  const params = useParams();
  const router = useRouter();
  const { booking, setBooking, nextStep, saveToStorage, userData, saveDraft, isDraftSaved } = useBooking();
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoadingBack, setIsLoadingBack] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [guestCheckLoading, setGuestCheckLoading] = useState(false);

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

    // Prevent logged-in creator from booking themselves
    const isOwnSessionLoggedIn = 
      (userData?.user?.id && booking.creator?.id && userData.user.id === booking.creator.id) ||
      (userData?.creatorProfile?.username && params.username && userData.creatorProfile.username.toLowerCase() === decodeURIComponent(params.username as string).toLowerCase());

    if (isOwnSessionLoggedIn) {
      setShowWarningModal(true);
      return;
    }

    const proceedAs = booking.userDetails.proceedAs || 'guest';
    const step4Url = `/creators/${params.username}/book-session/step-4`;

    if (proceedAs === 'guest') {
      // Check if guest email matches the creator's own email (self-booking as guest)
      setGuestCheckLoading(true);
      try {
        const res = await fetch(`/api/creators/${params.username}`);
        const data = await res.json();
        if (data.success && data.creator?.email &&
          data.creator.email.toLowerCase() === booking.userDetails.email.toLowerCase()) {
          setShowWarningModal(true);
          setGuestCheckLoading(false);
          return;
        }
      } catch { /* silent — allow booking to proceed if check fails */ }
      setGuestCheckLoading(false);

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

      <div className="grid grid-cols-1 lg:grid-cols-[410px_1fr] gap-8 items-start justify-items-center">
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
            <div className="flex flex-wrap justify-between items-center mt-8 pt-6 border-t border-gray-100 gap-2">
              <button
                onClick={() => saveDraft()}
                disabled={isDraftSaved}
                className={`font-bold py-2.5 px-4 sm:px-5 rounded-full text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 border ${
                  isDraftSaved
                    ? 'bg-green-50 border-green-200 text-green-600 cursor-default'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isDraftSaved ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Saved
                  </>
                ) : (
                  "Save as Draft"
                )}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsLoadingBack(true);
                    router.push(`/creators/${params.username}/book-session/step-2`);
                  }}
                  disabled={isLoadingBack}
                  className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-4 sm:px-5 rounded-full text-xs hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
                >
                  {isLoadingBack ? (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin"></div>
                  ) : (
                    "Back"
                  )}
                </button>

                <button
                  onClick={handleContinue}
                  disabled={!canProceed || authLoading || guestCheckLoading}
                  className={`py-2.5 px-5 sm:px-6 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center ${canProceed && !authLoading && !guestCheckLoading
                    ? 'bg-[#0012FF] text-white hover:bg-[#0010d0]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {(authLoading || guestCheckLoading) ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#808BFF] border-t-white animate-spin"></div>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="relative overflow-visible w-full max-w-lg flex flex-col items-center px-5 sm:px-7 lg:px-8 pt-10 sm:pt-12 pb-6 sm:pb-8 z-10">
            {/* SVG Background */}
            <img
              src="/assets/cancel-card.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
            />

            {/* Close Button */}
            <button
              onClick={() => setShowWarningModal(false)}
              className="absolute -top-6 sm:-top-4 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-55 transition-all z-20 cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Illustration */}
            <div className="w-24 sm:w-36 md:w-44 lg:w-56 mt-2 sm:mt-3 mb-3 sm:mb-4">
              <img
                src="/assets/cancel-appointment.png"
                alt="Cancel Appointment"
                width={240}
                height={170}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black text-center mb-2">
              Cannot Book Own Session
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-500 text-center mb-5 sm:mb-6 leading-relaxed">
              You cannot book a session with yourself. Please book a session with another creator.
            </p>

            {/* Actions */}
            <div className="flex justify-center w-full">
              <button
                onClick={() => setShowWarningModal(false)}
                className="px-6 sm:px-8 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}