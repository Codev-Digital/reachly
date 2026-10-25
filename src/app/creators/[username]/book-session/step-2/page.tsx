'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import AvailabilityDateTimePicker from '@/components/booking/AvailabilityDateTimePicker';
import { useBooking } from '../layout';

export default function BookSessionStep2() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fallbackUrl = searchParams.get('fallbackUrl');
  const queryStr = fallbackUrl ? `?fallbackUrl=${encodeURIComponent(fallbackUrl)}` : '';
  const { booking, setBooking, nextStep, prevStep, saveDraft, isDraftSaved } = useBooking();

  const sessionId = booking.selectedSession?.id;
  const username = String(params.username || '');
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [isLoadingBack, setIsLoadingBack] = useState(false);

  useEffect(() => {
    if (username) {
      router.prefetch(`/creators/${username}/book-session/step-3${queryStr}`);
    }
  }, [username, queryStr, router]);

  const handleContinue = () => {
    if (booking.selectedDate && booking.selectedTime) {
      setIsLoadingContinue(true);
      nextStep();
      router.push(`/creators/${username}/book-session/step-3${queryStr}`);
    }
  };

  const handleBack = () => {
    setIsLoadingBack(true);
    prevStep();
    router.push(`/creators/${username}/book-session/step-1${queryStr}`);
  };

  const creator = booking.creator;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-2">
      <BookingProgress currentStep={2} />

      <div className="grid grid-cols-1 lg:grid-cols-[410px_1fr] gap-8 items-start justify-items-center">
        <div className="hidden lg:block w-full">
          <CreatorProfileCard creator={creator} />
        </div>

        <div className="flex flex-col w-full max-w-[790px]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Select Date & Time</h2>
            {booking.selectedSession && (
              <p className="text-gray-500 font-medium text-sm">
                Booking: <span className="text-gray-900 font-bold">{booking.selectedSession.title}</span> (
                {booking.selectedSession.duration})
              </p>
            )}
          </div>

          {username && (
            <AvailabilityDateTimePicker
              username={username}
              sessionId={sessionId}
              selectedDate={booking.selectedDate}
              selectedTime={booking.selectedTime}
              onDateChange={(date) =>
                setBooking((b) => ({ ...b, selectedDate: date, selectedTime: null }))
              }
              onTimeChange={(time) => setBooking((b) => ({ ...b, selectedTime: time || null }))}
            />
          )}

          <div className="flex flex-wrap gap-2 mt-10 justify-end w-full border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => saveDraft()}
              disabled={isDraftSaved}
              className={`font-bold py-2.5 px-6 rounded-full text-xs transition-all shadow-sm mr-auto flex items-center justify-center gap-1.5 border ${
                isDraftSaved
                  ? 'bg-green-50 border-green-200 text-green-600 cursor-default'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-md active:scale-95'
              }`}
            >
              {isDraftSaved ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Saved
                </>
              ) : (
                'Save as Draft'
              )}
            </button>

            <button
              type="button"
              onClick={handleBack}
              disabled={isLoadingBack}
              className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-full text-xs hover:bg-gray-50 hover:shadow-md active:scale-95 transition-all shadow-sm flex items-center justify-center"
            >
              {isLoadingBack ? (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
              ) : (
                'Back'
              )}
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!booking.selectedDate || !booking.selectedTime || isLoadingContinue}
              className={`py-2.5 px-8 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center active:scale-95 ${
                booking.selectedDate && booking.selectedTime
                  ? 'bg-[#0012FF] text-white hover:bg-[#0010d0] hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoadingContinue ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#808BFF] border-t-white animate-spin" />
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
