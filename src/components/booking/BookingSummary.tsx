'use client';

import { useBooking } from '@/app/creators/[username]/book-session/layout';

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function BookingSummary() {
  const { booking } = useBooking();

  return (
    <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6">
      <h3 className="font-serif text-lg font-bold text-[#F9F6F2] mb-4">Booking Summary</h3>
      
      <div className="flex items-start gap-3 mb-4">
        <img
          src="/merium.png"
          alt="Kainat Aslam"
          className="w-12 h-12 rounded-full border border-[rgba(200,169,126,0.3)]"
        />
        <div>
          <p className="font-serif text-base font-semibold text-[#F9F6F2]">Kainat Aslam</p>
          <p className="text-xs text-[#F9F6F2] opacity-70">@kainataslam.ka</p>
        </div>
      </div>

      {booking.selectedSession && (
        <>
          <div className="border-t border-[rgba(255,255,255,0.1)] pt-4 mb-4">
            <p className="text-xs font-sans text-[#F9F6F2] opacity-70 mb-1">{booking.selectedSession.title}</p>
            <p className="text-xs font-sans text-[#C8A97E] opacity-70">{booking.selectedSession.duration}</p>
            
            {booking.selectedDate && booking.selectedTime && (
              <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.1)]">
                <p className="text-xs font-sans text-[#F9F6F2] opacity-70 mb-1">Date & Time</p>
                <p className="text-xs font-sans text-[#F9F6F2] opacity-90">
                  {formatDate(booking.selectedDate)} at {booking.selectedTime}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.1)] pt-3">
            <span className="font-sans text-sm text-[#F9F6F2] opacity-80">Total</span>
            <span className="font-serif text-lg font-bold text-[#C8A97E]">PKR {booking.selectedSession.price}</span>
          </div>
        </>
      )}
    </div>
  );
}
