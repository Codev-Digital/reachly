'use client';

import { useParams, useRouter } from 'next/navigation';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingSummary from '@/components/booking/BookingSummary';
import BookingCalendar from '@/components/booking/BookingCalendar';
import { useBooking } from '../layout';

const timeOptions = [
  '05:00 PM', '09:00 AM'
];

const formatDateLong = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function BookSessionStep2() {
  const params = useParams();
  const router = useRouter();
  const { booking, setBooking, nextStep } = useBooking();

  const handleTimeSelect = (time: string) => {
    setBooking(b => ({ ...b, selectedTime: time }));
  };

  const handleContinue = () => {
    if (booking.selectedDate && booking.selectedTime) {
      nextStep();
      router.push(`/creators/${params.username}/book-session/step-3`);
    }
  };

  // Set default date for demo purposes
  const defaultDate = new Date();
  defaultDate.setMonth(4); // May
  defaultDate.setDate(23);

  return (
    <div>
      <BookingProgress currentStep={2} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Date & Time */}
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

            <h3 className="font-serif text-xl font-bold text-[#F9F6F2]">Pick a Date & Time</h3>

            <BookingCalendar
              selectedDate={booking.selectedDate || defaultDate}
              onDateSelect={(date) => setBooking(b => ({ ...b, selectedDate: date }))}
            />

            {booking.selectedDate && (
              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-4 sm:p-5">
                <h4 className="font-serif text-sm font-semibold text-[#C8A97E] mb-4">
                  Available times for {formatDateLong(booking.selectedDate)}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {timeOptions.map((time, i) => (
                    <button
                      key={i}
                      onClick={() => handleTimeSelect(time)}
                      className={`px-6 py-3 rounded-lg text-sm font-sans transition-all ${
                        (booking.selectedTime === time || (i === 0 && !booking.selectedTime))
                          ? 'bg-[#C8A97E] text-[#0C0C0C]'
                          : 'bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] hover:border-[#C8A97E]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(booking.selectedDate || defaultDate) && (
              <div className="bg-[rgba(200,169,126,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                <p className="font-sans text-lg">
                  <span className="text-[#C8A97E]">You're booking</span>
                  <span className="text-[#F9F6F2] font-semibold"> {formatDateLong(booking.selectedDate || defaultDate)} </span>
                  <span className="text-[#C8A97E]">at</span>
                  <span className="text-[#F9F6F2] font-semibold"> {booking.selectedTime || '05:00 PM'} </span>
                  <span className="text-[#C8A97E]">for a session</span>
                </p>
              </div>
            )}

            {/* Payment Security Icons */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6 flex items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span className="font-serif text-base text-[#F9F6F2]">Secure payment</span>
              </div>
              <div className="h-8 w-px bg-[rgba(200,169,126,0.3)]"></div>
              <div className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span className="font-serif text-base text-[#F9F6F2]">Money-back guarantee</span>
              </div>
              <div className="h-8 w-px bg-[rgba(200,169,126,0.3)]"></div>
              <div className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="font-serif text-base text-[#F9F6F2]">256-bit encryption</span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                onClick={() => router.push(`/creators/${params.username}/book-session/step-1`)}
                className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 px-6 rounded-full text-sm hover:border-[#C8A97E] transition-all flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <button
                onClick={handleContinue}
                disabled={!booking.selectedDate || !booking.selectedTime}
                className={`flex-1 font-serif font-semibold py-3 px-6 rounded-full text-sm transition-all flex items-center justify-center gap-2 ${
                  booking.selectedDate && booking.selectedTime
                    ? 'bg-[#C8A97E] text-[#0C0C0C] hover:opacity-90'
                    : 'bg-[rgba(200,169,126,0.2)] text-[rgba(0,0,0,0.4)] cursor-not-allowed'
                }`}
              >
                Continue to Your Details
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