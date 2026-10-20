'use client';

import { useBooking, sessionPrice } from '@/app/creators/[username]/book-session/layout';

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function BookingSummary() {
  const { booking } = useBooking();
  const creator = booking.creator;

  return (
    <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6 sticky top-8 mt-25">
      <h3 className="font-serif text-lg font-bold text-[#F9F6F2] mb-4">Booking Summary</h3>

      {/* Creator Info */}
      <div className="flex items-start gap-3 mb-4">
        {creator ? (
          <img
            src={creator.profilePhoto}
            alt={creator.displayName}
            className="w-12 h-12 rounded-full border border-[rgba(200,169,126,0.3)] object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full border border-[rgba(200,169,126,0.3)] bg-[rgba(200,169,126,0.1)] animate-pulse" />
        )}
        <div>
          {creator ? (
            <>
              <p className="font-serif text-base font-semibold text-[#F9F6F2]">{creator.displayName}</p>
              <p className="text-xs text-[#F9F6F2] opacity-70">@{creator.username}</p>
            </>
          ) : (
            <>
              <div className="h-4 w-28 bg-white/10 rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
            </>
          )}
        </div>
      </div>

      {booking.selectedSession && (
        <>
          <div className="border-t border-[rgba(255,255,255,0.1)] pt-4 mb-4">
            <p className="text-xs font-sans text-[#F9F6F2] opacity-70 mb-1">{booking.selectedSession.title}</p>
            <p className="text-xs font-sans text-[#C8A97E]">{booking.selectedSession.duration}</p>

            {booking.selectedDate && booking.selectedTime && (
              <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.1)]">
                <p className="text-xs font-sans text-[#F9F6F2] opacity-70 mb-1">Date &amp; Time</p>
                <p className="text-xs font-sans text-[#F9F6F2] opacity-90 font-semibold">
                  {formatDate(booking.selectedDate)} at {booking.selectedTime}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.1)] pt-3">
            <span className="font-sans text-sm text-[#F9F6F2] opacity-80">Total</span>
            <span className="font-serif text-lg font-bold text-[#C8A97E]">PKR {sessionPrice(booking.selectedSession).toLocaleString()}</span>
          </div>
        </>
      )}

      {!booking.selectedSession && (
        <div className="border-t border-[rgba(255,255,255,0.1)] pt-4">
          <p className="text-xs font-sans text-[#F9F6F2] opacity-40 italic">Select a session to see summary</p>
        </div>
      )}
    </div>
  );
}
