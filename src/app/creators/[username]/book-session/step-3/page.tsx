'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import { useBooking } from '../layout';

export default function BookSessionStep3() {
  const params = useParams();
  const router = useRouter();
  const { booking, setBooking, nextStep, saveToStorage } = useBooking();
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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
        {/* ============ LEFT COLUMN: CREATOR PROFILE CARD ============ */}
        <div className="relative w-full max-w-[370px] h-[619px] bg-transparent overflow-visible isolate select-none">
          {/* Background SVG template */}
          <img
            src="/assets/creator-data.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
          />

          {/* Content */}
          <div className="relative z-10 p-6 pt-7 pb-6 flex flex-col h-full justify-between">
            <div>
              {/* Header Banner */}
              <div className="w-full h-24 bg-gradient-to-r from-blue-700 to-indigo-900 rounded-2xl relative overflow-hidden mb-12">
                <span className="absolute right-3 top-3 bg-white text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                  Influencer
                </span>
              </div>

              {/* Avatar Picture */}
              <div className="absolute top-14 left-[24px] w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                <img
                  src={creator?.profilePhoto || '/merium.png'}
                  alt={creator?.displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name & Handle */}
              <div className="pl-[116px] min-h-[72px] flex flex-col justify-center">
                <h3 className="font-bold text-lg text-gray-900 leading-tight">
                  {creator?.displayName || 'Sophia Reed'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  @{creator?.username || 'sophiareed'}
                </p>
              </div>

              {/* Location & Languages */}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium pl-2">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF]">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Lahore
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF]">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Urdu, English
                </span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 w-full border-t border-b border-gray-100 py-3 mt-4 text-center">
                <div>
                  <span className="block font-anton font-black text-[24px] leading-[24px] tracking-[0em] text-gray-900">12k+</span>
                  <span className="text-[9px] text-gray-400 font-semibold block leading-tight">Sessions completed</span>
                </div>
                <div className="border-l border-r border-gray-100">
                  <span className="block font-anton font-black text-[24px] leading-[24px] tracking-[0em] text-gray-900">50k+</span>
                  <span className="text-[9px] text-gray-400 font-semibold block leading-tight">Happy Users</span>
                </div>
                <div>
                  <span className="block font-anton font-black text-[24px] leading-[24px] tracking-[0em] text-gray-900">8</span>
                  <span className="text-[9px] text-gray-400 font-semibold block leading-tight">Total Categories</span>
                </div>
              </div>

              {/* Book a Session button */}
              <button className="bg-[#0012FF] hover:bg-[#0010d0] text-white w-full py-2.5 rounded-xl font-bold text-xs transition-colors mt-4 shadow-sm">
                Book a Session
              </button>

              {/* About section */}
              <div className="w-full text-left mt-4">
                <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wide">About</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-3">
                  {creator?.shortBio || "Ayesha Khan is one of Pakistan's leading fashion and lifestyle content creators. With over 500K followers across Instagram and TikTok..."}
                </p>
                <button className="text-[#0012FF] text-[10px] font-bold mt-0.5 hover:underline">
                  Read more
                </button>
              </div>

              {/* Category Tags */}
              <div className="flex flex-wrap gap-1.5 w-full mt-3">
                {(creator?.niches && creator.niches.length > 0 ? creator.niches : ['Fashion Tips', 'Style Guide', 'Shopping']).map(tag => (
                  <span key={tag} className="bg-red-50 text-red-500 text-[9px] font-bold px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Icons inside bottom notch (Real SVGs) */}
            <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 translate-y-4 flex items-center justify-center gap-2.5 w-[130px] h-[24px] z-20">
              {/* Facebook */}
              <a href="#" className="w-5 h-5 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-5 h-5 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="w-5 h-5 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" className="w-5 h-5 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.15 1.25 1.32 2.98 2.04 4.79 2.07v3.83a8.88 8.88 0 0 1-5.18-1.74c-.05 2.82.01 5.63-.04 8.44-.09 2.53-1.12 5.04-3.13 6.64-2.28 1.83-5.46 2.37-8.19 1.4A8.72 8.72 0 0 1 .47 16.92c-.67-2.61-.17-5.5 1.4-7.65 1.76-2.4 4.73-3.66 7.68-3.15V9.92a4.91 4.91 0 0 0-4.63 4.22c-.37 2.45.92 4.98 3.2 5.68 2.22.68 4.77-.37 5.48-2.52.26-.81.23-1.67.24-2.52l.02-14.76z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

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