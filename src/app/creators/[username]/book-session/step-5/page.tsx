'use client';
import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import BookingProgress from '@/components/booking/BookingProgress';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import { useBooking } from '../layout';

const formatDateLong = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

export default function BookSessionStep5() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fallbackUrl = searchParams.get('fallbackUrl');
  const { booking, userData } = useBooking();
  const creator = booking.creator;

  // Booking confirmed — clear any saved draft so next visit starts fresh
  useEffect(() => {
    try { localStorage.removeItem('reachly_booking_draft'); } catch { }
  }, []);

  const handleGoToBookings = () => {
    const isLoggedIn = !!userData?.user?.id;
    const isCreator = !!(userData?.creatorProfile);
    if (isLoggedIn) {
      if (isCreator) {
        // Creator booking another creator → go to their calendar
        router.push('/creators/calendar');
      } else if (fallbackUrl) {
        window.location.href = fallbackUrl;
      } else {
        router.push('/user/bookings');
      }
    } else {
      // Guest — pass their email so the bookings page can fetch without login
      const guestEmail = booking.userDetails.email;
      if (fallbackUrl) {
        window.location.href = fallbackUrl;
      } else {
        if (guestEmail) {
          router.push(`/user/bookings?guestEmail=${encodeURIComponent(guestEmail)}`);
        } else {
          router.push('/user/bookings');
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-2">
      {/* Step Progress Indicator */}
      <BookingProgress currentStep={5} />

      <div className="grid grid-cols-1 lg:grid-cols-[410px_1fr] gap-8 items-start justify-items-center">
        <div className="hidden lg:block w-full">
          <CreatorProfileCard creator={creator} />
        </div>

        {/* ============ RIGHT COLUMN: BOOKING CONFIRMATION ============ */}
        <div className="w-full">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-10 shadow-sm flex flex-col items-center text-center w-full max-w-[790px] mx-auto">
            {/* Booking Confirm Illustration */}
            <img
              src="/assets/booking-confirm.png"
              className="w-[160px] h-[160px] object-contain mb-6 select-none"
              alt=""
            />

            {/* Success Heading */}
            <h3 className="text-[20px] font-black text-gray-950 mb-1 leading-tight">
              Your Booking Is Confirmed
            </h3>
            <p className="text-[12px] text-gray-400 font-semibold leading-relaxed">
              We&apos;ve sent the details to your email and WhatsApp
            </p>

            {/* Quick Details strip */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 py-2.5 px-6 bg-gray-50/50 rounded-2xl border border-gray-100 text-xs text-gray-500 font-bold select-none">
              {/* Date */}
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {booking.selectedDate ? formatDateLong(booking.selectedDate) : 'Tuesday, 2 July'}
              </div>

              {/* Divider dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>

              {/* Time */}
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {booking.selectedTime ? booking.selectedTime : '03:00 PM to 04:00 PM'}
              </div>

              {/* Divider dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>

              {/* Duration */}
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {booking.selectedSession?.duration || '1 hour'}
              </div>
            </div>

            {/* Dashboard Redirect Action Button */}
            <button
              onClick={handleGoToBookings}
              className="bg-[#0012FF] text-white hover:bg-[#0010d0] font-bold py-2.5 px-8 rounded-full text-xs transition-colors shadow-sm mt-8"
            >
              Go to Dashboard Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
