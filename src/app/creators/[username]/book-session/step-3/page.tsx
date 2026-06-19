'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingSummary from '@/components/booking/BookingSummary';
import CustomSelect from '@/components/CustomSelect';
import { useBooking } from '../layout';

const heardFromOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'friends', label: 'Family or Friends' },
  { value: 'other', label: 'Other' },
];

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
    const proceedAs = booking.userDetails.proceedAs;

    // The step-4 URL we want to return to after auth
    const step4Url = `/creators/${params.username}/book-session/step-4`;

    if (proceedAs === 'guest') {
      nextStep();
      router.push(step4Url);
      return;
    }

    // Save booking state to sessionStorage before navigating away
    saveToStorage();

    if (proceedAs === 'login') {
      router.push(`/login?callbackUrl=${encodeURIComponent(step4Url)}`);
      return;
    }

    // signup: pre-fill email on signup page and trigger OTP
    if (proceedAs === 'signup') {
      // Save email for the existing signup flow (it reads from localStorage)
      try { localStorage.setItem('signupEmail', booking.userDetails.email); } catch { }
      // Send OTP first, then redirect to verify-email
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
          // Redirect to verify-email with callbackUrl pointing to set-password which then goes to step-4
          const verifyUrl = `/verify-email?callbackUrl=${encodeURIComponent(`/set-password?callbackUrl=${encodeURIComponent(step4Url)}`)}`;
          router.push(verifyUrl);
        } else {
          // If it's an existing user, offer to log in instead
          if (data.error?.toLowerCase().includes('already')) {
            setAuthError('An account with this email already exists. Please use the Log in option.');
          } else {
            // Fallback: go to signup page
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

  const proceedAs = booking.userDetails.proceedAs;
  const creator = booking.creator;

  return (
    <div>
      <BookingProgress currentStep={3} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Creator Info */}
            {creator && (
              <div className="flex items-center gap-3">
                <img
                  src={creator.profilePhoto}
                  alt={creator.displayName}
                  className="w-16 h-16 rounded-full border border-[rgba(200,169,126,0.3)] object-cover"
                />
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F9F6F2]">{creator.displayName}</h2>
                  <p className="text-xs font-sans text-[#F9F6F2] opacity-70">@{creator.username}</p>
                </div>
              </div>
            )}

            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F9F6F2]">Your Booking Details</h3>
                  <p className="text-xs font-sans text-[#F9F6F2] opacity-60">
                    {proceedAs === 'guest'
                      ? 'We will create an account for you automatically after booking'
                      : proceedAs === 'login'
                        ? 'Log in to continue your booking'
                        : 'Sign up to complete your booking'}
                  </p>
                </div>
              </div>

              {/* How would you like to proceed? */}
              <p className="font-sans text-xs font-semibold text-[#F9F6F2] opacity-70 mb-3">How would you like to proceed?</p>
              <div className="flex gap-2 mb-6">
                {(['guest', 'login', 'signup'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => { updateUserDetails('proceedAs', option); setAuthError(''); }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-sans font-semibold border transition-all ${proceedAs === option
                        ? 'bg-[#C8A97E] text-[#0C0C0C] border-[#C8A97E]'
                        : 'bg-transparent text-[#F9F6F2] border-[rgba(200,169,126,0.3)] hover:border-[#C8A97E]'
                      }`}
                  >
                    {option === 'guest' && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
                      </svg>
                    )}
                    {option === 'login' && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" />
                      </svg>
                    )}
                    {option === 'signup' && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="8" r="4" /><path d="M3 20c0-4 3-7 6-7s6 3 6 7" /><path d="M19 8v6" /><path d="M16 11h6" />
                      </svg>
                    )}
                    {option === 'guest' ? 'Continue as Guest' : option === 'login' ? 'Log in' : 'Sign in'}
                  </button>
                ))}
              </div>

              <p className="text-xs font-sans text-[#F9F6F2] opacity-50 mb-6">
                {proceedAs === 'guest'
                  ? 'We will create an account for you automatically after booking'
                  : proceedAs === 'login'
                    ? 'You will be redirected to log in, then brought back to complete your booking'
                    : 'You will verify your email, then be brought back to complete your booking'}
              </p>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ali Hassan"
                    value={booking.userDetails.fullName}
                    onChange={e => updateUserDetails('fullName', e.target.value)}
                    className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E] transition-all"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={booking.userDetails.email}
                    onChange={e => updateUserDetails('email', e.target.value)}
                    className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E] transition-all"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">WhatsApp Number</label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] opacity-70 whitespace-nowrap">
                      PK +92
                    </div>
                    <input
                      type="tel"
                      placeholder="300 123 4567"
                      value={booking.userDetails.whatsapp}
                      onChange={e => updateUserDetails('whatsapp', e.target.value)}
                      className="flex-1 bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">
                    What would you like to discuss? <span className="opacity-50 font-normal">(optional)</span>
                  </label>
                  <textarea
                    placeholder="Share a brief overview so the creator can prepare for a session..."
                    value={booking.userDetails.whatToDiscuss}
                    onChange={e => updateUserDetails('whatToDiscuss', e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E] resize-none transition-all"
                  />
                  <div className="text-right text-xs font-sans text-[#F9F6F2] opacity-40 mt-1">
                    {booking.userDetails.whatToDiscuss.length}/500
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">
                    How did you hear about Reachly? <span className="opacity-50 font-normal">(optional)</span>
                  </label>
                  <CustomSelect
                    value={booking.userDetails.heardFrom}
                    options={heardFromOptions}
                    onChange={val => updateUserDetails('heardFrom', val)}
                    buttonBg="#0C0C0C"
                    textSize="text-sm"
                    buttonClassName="rounded-lg"
                    placeholder="Select an option"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">
                    What would you like to discuss? <span className="opacity-50 font-normal">(optional)</span>
                  </label>
                  <textarea
                    placeholder="e.g. Please review my portfolio before our..."
                    value={booking.userDetails.notes}
                    onChange={e => updateUserDetails('notes', e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E] resize-none transition-all"
                  />
                  <div className="text-right text-xs font-sans text-[#F9F6F2] opacity-40 mt-1">
                    {booking.userDetails.notes.length}/500
                  </div>
                </div>
              </div>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-xs">{authError}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                onClick={() => router.push(`/creators/${params.username}/book-session/step-2`)}
                className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 px-6 rounded-full text-sm hover:border-[#C8A97E] transition-all flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <button
                onClick={handleContinue}
                disabled={!canProceed || authLoading}
                className={`flex-1 font-serif font-semibold py-3 px-6 rounded-full text-sm transition-all flex items-center justify-center gap-2 ${canProceed && !authLoading
                    ? 'bg-[#C8A97E] text-[#0C0C0C] hover:opacity-90'
                    : 'bg-[rgba(200,169,126,0.2)] text-[rgba(0,0,0,0.4)] cursor-not-allowed'
                  }`}
              >
                {authLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummary />
          </div>
        </div>
      </div>
    </div>
  );
}