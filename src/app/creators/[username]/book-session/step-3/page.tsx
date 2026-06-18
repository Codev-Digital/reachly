'use client';

import { useParams, useRouter } from 'next/navigation';
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
  { value: 'other', label: 'Other' }
];

export default function BookSessionStep3() {
  const params = useParams();
  const router = useRouter();
  const { booking, setBooking, nextStep } = useBooking();

  const updateUserDetails = (field: string, value: string) => {
    setBooking(b => ({
      ...b,
      userDetails: { ...b.userDetails, [field]: value }
    }));
  };

  const handleContinue = () => {
    if (
      booking.userDetails.fullName &&
      booking.userDetails.email &&
      booking.userDetails.whatsapp
    ) {
      nextStep();
      router.push(`/creators/${params.username}/book-session/step-4`);
    }
  };

  return (
    <div>
      <BookingProgress currentStep={3} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Your Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Creator Info */}
            <div className="flex items-center gap-3">
              <img
                src="/merium.png"
                alt="Kainat Aslam"
                className="w-16 h-16 rounded-full border border-[rgba(200,169,126,0.3)]"
              />
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F9F6F2]">Kainat Aslam</h2>
                <p className="text-xs font-sans text-[#F9F6F2] opacity-70">@kainataslam.ka</p>
              </div>
            </div>

            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6">
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
                  <p className="text-xs font-sans text-[#F9F6F2] opacity-70">We'll create an account for you automatically after booking</p>
                </div>
              </div>

              {/* Proceed As Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-[#0C0C0C] rounded-lg border border-[rgba(200,169,126,0.3)]">
                {['guest', 'login', 'signup'].map((option) => (
                  <button
                    key={option}
                    onClick={() => updateUserDetails('proceedAs', option)}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-sans font-semibold transition-all ${
                      booking.userDetails.proceedAs === option
                        ? 'bg-[#C8A97E] text-[#0C0C0C]'
                        : 'text-[#F9F6F2] opacity-70 hover:opacity-100'
                    }`}
                  >
                    {option === 'guest' && (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1">
                          <circle cx="12" cy="11" r="4" />
                          <path d="M4 21a8 8 0 0 1 16 0" />
                        </svg>
                        Continue as Guest
                      </>
                    )}
                    {option === 'login' && (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1">
                          <rect x="3" y="11" width="13" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Log in
                      </>
                    )}
                    {option === 'signup' && (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="8.5" cy="7" r="4" />
                          <path d="M20 8v6M23 11h-6" />
                        </svg>
                        Sign in
                      </>
                    )}
                  </button>
                ))}
              </div>

              <p className="text-xs font-sans text-[#F9F6F2] opacity-70 mb-6">
                We will create an account for you automatically after booking
              </p>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ali Hassan"
                    value={booking.userDetails.fullName}
                    onChange={(e) => updateUserDetails('fullName', e.target.value)}
                    className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E]"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={booking.userDetails.email}
                    onChange={(e) => updateUserDetails('email', e.target.value)}
                    className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E]"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">
                    WhatsApp Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] opacity-70">
                      PK +92
                    </div>
                    <input
                      type="tel"
                      placeholder="300 123 4567"
                      value={booking.userDetails.whatsapp}
                      onChange={(e) => updateUserDetails('whatsapp', e.target.value)}
                      className="flex-1 bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">
                    What would you like to discuss? (optional)
                  </label>
                  <textarea
                    placeholder="Share a brief overview of the topic you can prepare for a session..."
                    value={booking.userDetails.notes}
                    onChange={(e) => updateUserDetails('notes', e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E] resize-none"
                  />
                  <div className="text-right text-xs font-sans text-[#F9F6F2] opacity-50 mt-1">
                    {booking.userDetails.notes.length}/500
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">
                    How did you hear about Reachly? (optional)
                  </label>
                  <CustomSelect
                    value={booking.userDetails.heardFrom}
                    options={heardFromOptions}
                    onChange={(val) => updateUserDetails('heardFrom', val)}
                    buttonBg="#0C0C0C"
                    textSize="text-sm"
                    buttonClassName="rounded-lg"
                    placeholder="Select an option"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-[#F9F6F2] mb-2">
                    What would you like to discuss? (optional)
                  </label>
                  <textarea
                    placeholder="e.g. Please review my portfolio before our..."
                    value={booking.userDetails.whatToDiscuss}
                    onChange={(e) => updateUserDetails('whatToDiscuss', e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E] resize-none"
                  />
                  <div className="text-right text-xs font-sans text-[#F9F6F2] opacity-50 mt-1">
                    {booking.userDetails.whatToDiscuss.length}/500
                  </div>
                </div>
              </div>
            </div>

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
                disabled={!booking.userDetails.fullName || !booking.userDetails.email || !booking.userDetails.whatsapp}
                className={`flex-1 font-serif font-semibold py-3 px-6 rounded-full text-sm transition-all flex items-center justify-center gap-2 ${
                  booking.userDetails.fullName && booking.userDetails.email && booking.userDetails.whatsapp
                    ? 'bg-[#C8A97E] text-[#0C0C0C] hover:opacity-90'
                    : 'bg-[rgba(200,169,126,0.2)] text-[rgba(0,0,0,0.4)] cursor-not-allowed'
                }`}
              >
                Continue to Payment
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
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