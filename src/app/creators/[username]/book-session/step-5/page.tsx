'use client';

import { useParams, useRouter } from 'next/navigation';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingSummary from '@/components/booking/BookingSummary';
import { useBooking } from '../layout';

const formatDateLong = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function BookSessionStep5() {
  const params = useParams();
  const router = useRouter();
  const { booking } = useBooking();

  return (
    <div>
      <BookingProgress currentStep={5} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Confirmation */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-[#C8A97E] flex items-center justify-center mx-auto mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0C0C0C" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#F9F6F2] mb-2">Booking Confirmed!</h3>
              <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-6">
                We've sent a confirmation email to {booking.userDetails.email}
              </p>
              <div className="flex items-center justify-center gap-4 text-xs font-sans text-[#F9F6F2] opacity-70">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  Add to Calendar
                </div>
                <div className="h-4 w-px bg-[rgba(255,255,255,0.1)]"></div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  View Creator
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6">
              <h4 className="font-serif text-lg font-bold text-[#C8A97E] mb-4">What's Next?</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#C8A97E] font-bold">1</span>
                  </div>
                  <div>
                    <h5 className="font-serif text-sm font-bold text-[#F9F6F2]">Creator will review your request</h5>
                    <p className="text-xs font-sans text-[#F9F6F2] opacity-70">You'll receive an update within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#C8A97E] font-bold">2</span>
                  </div>
                  <div>
                    <h5 className="font-serif text-sm font-bold text-[#F9F6F2]">Get ready for your session</h5>
                    <p className="text-xs font-sans text-[#F9F6F2] opacity-70">Check your email for meeting link and details</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="flex-1 font-serif font-semibold py-3 px-6 rounded-full text-sm transition-all bg-[#C8A97E] text-[#0C0C0C] hover:opacity-90 flex items-center justify-center gap-2 mx-auto block"
            >
              Back to Home
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
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