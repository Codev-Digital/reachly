'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingSummary from '@/components/booking/BookingSummary';
import BookingCalendar from '@/components/booking/BookingCalendar';
import { useBooking } from '../layout';

const formatDateLong = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const toISO = (date: Date) => {
  // Get YYYY-MM-DD in local timezone, not UTC!
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BookSessionStep2() {
  const params = useParams();
  const router = useRouter();
  const { booking, setBooking, nextStep } = useBooking();

  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [fetchedDate, setFetchedDate] = useState<string | null>(null);

  const fetchSlots = useCallback(async (date: Date) => {
    const iso = toISO(date);
    if (iso === fetchedDate) return; // don't re-fetch same date
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/creators/${params.username}/availability?date=${iso}`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots || []);
        setFetchedDate(iso);
        // Auto-select first slot if none selected
        if (!booking.selectedTime && data.slots?.length > 0) {
          setBooking(b => ({ ...b, selectedTime: data.slots[0] }));
        } else if (data.slots?.length > 0 && !data.slots.includes(booking.selectedTime ?? '')) {
          // Selected time no longer valid for this date
          setBooking(b => ({ ...b, selectedTime: data.slots[0] }));
        }
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [params.username, fetchedDate, booking.selectedTime]);

  // Fetch slots when date changes
  useEffect(() => {
    if (booking.selectedDate) {
      fetchSlots(booking.selectedDate);
    }
  }, [booking.selectedDate]);

  // If no date selected yet, default to today
  useEffect(() => {
    if (!booking.selectedDate) {
      const today = new Date();
      setBooking(b => ({ ...b, selectedDate: today }));
    }
  }, []);

  const handleTimeSelect = (time: string) => {
    setBooking(b => ({ ...b, selectedTime: time }));
  };

  const handleDateSelect = (date: Date) => {
    setBooking(b => ({ ...b, selectedDate: date, selectedTime: null }));
    setSlots([]);
    setFetchedDate(null);
  };

  const handleContinue = () => {
    if (booking.selectedDate && booking.selectedTime) {
      nextStep();
      router.push(`/creators/${params.username}/book-session/step-3`);
    }
  };

  const creator = booking.creator;

  return (
    <div>
      <BookingProgress currentStep={2} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Creator Info */}
            <div className="flex items-center gap-3">
              <img
                src={creator?.profilePhoto || '/merium.png'}
                alt={creator?.displayName || ''}
                className="w-16 h-16 rounded-full border border-[rgba(200,169,126,0.3)] object-cover"
              />
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F9F6F2]">
                  {creator?.displayName || <span className="animate-pulse block h-6 w-36 bg-white/10 rounded" />}
                </h2>
                <p className="text-xs font-sans text-[#F9F6F2] opacity-70">@{creator?.username}</p>
              </div>
            </div>

            <h3 className="font-serif text-xl font-bold text-[#F9F6F2]">Pick a Date &amp; Time</h3>

            <BookingCalendar
              selectedDate={booking.selectedDate || new Date()}
              onDateSelect={handleDateSelect}
            />

            {/* Time Slots */}
            {booking.selectedDate && (
              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-4 sm:p-5">
                <h4 className="font-serif text-sm font-semibold text-[#C8A97E] mb-4">
                  Available times for {formatDateLong(booking.selectedDate)}
                </h4>

                {loadingSlots ? (
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-11 w-28 bg-white/10 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-6">
                    <svg className="mx-auto mb-3 opacity-40" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                    <p className="font-sans text-sm text-[#F9F6F2] opacity-50">No available slots on this day. Please pick another date.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {slots.map((time, i) => (
                      <button
                        key={i}
                        onClick={() => handleTimeSelect(time)}
                        className={`px-6 py-3 rounded-lg text-sm font-sans transition-all ${booking.selectedTime === time
                          ? 'bg-[#C8A97E] text-[#0C0C0C] font-semibold'
                          : 'bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] hover:border-[#C8A97E]'
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selection Preview */}
            {booking.selectedDate && booking.selectedTime && (
              <div className="bg-[rgba(200,169,126,0.05)] border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                <p className="font-sans text-lg">
                  <span className="text-[#C8A97E]">You&apos;re booking</span>
                  <span className="text-[#F9F6F2] font-semibold"> {formatDateLong(booking.selectedDate)} </span>
                  <span className="text-[#C8A97E]">at</span>
                  <span className="text-[#F9F6F2] font-semibold"> {booking.selectedTime} </span>
                  <span className="text-[#C8A97E]">for a session</span>
                </p>
              </div>
            )}

            {/* Security badges */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6 flex items-center justify-center gap-6">
              {[
                { icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>, label: 'Secure payment' },
                { icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>, label: 'Money-back guarantee' },
                { icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>, label: '256-bit encryption' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 ${i > 0 ? 'pl-6 border-l border-[rgba(200,169,126,0.3)]' : ''}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">{item.icon}</svg>
                  <span className="font-serif text-sm text-[#F9F6F2]">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                onClick={() => router.push(`/creators/${params.username}/book-session/step-1`)}
                className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 px-6 rounded-full text-sm hover:border-[#C8A97E] transition-all flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back
              </button>
              <button
                onClick={handleContinue}
                disabled={!booking.selectedDate || !booking.selectedTime}
                className={`flex-1 font-serif font-semibold py-3 px-6 rounded-full text-sm transition-all flex items-center justify-center gap-2 ${booking.selectedDate && booking.selectedTime
                  ? 'bg-[#C8A97E] text-[#0C0C0C] hover:opacity-90'
                  : 'bg-[rgba(200,169,126,0.2)] text-[rgba(0,0,0,0.4)] cursor-not-allowed'
                  }`}
              >
                Continue to Your Details
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
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