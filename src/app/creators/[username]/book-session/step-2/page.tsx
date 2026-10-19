'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import { useBooking, SessionType } from '../layout';

const toISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BookSessionStep2() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fallbackUrl = searchParams.get('fallbackUrl');
  const queryStr = fallbackUrl ? `?fallbackUrl=${encodeURIComponent(fallbackUrl)}` : '';
  const { booking, setBooking, nextStep, prevStep, saveDraft, isDraftSaved } = useBooking();

  const sessionId = booking.selectedSession?.id;
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [fetchedDate, setFetchedDate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Record<string, { enabled: boolean }> | null>(null);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [isLoadingBack, setIsLoadingBack] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Returns true if this calendar date is enabled in the creator's schedule
  const isDayEnabled = (d: Date) => {
    if (!schedule) return true; // still loading → show all
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return schedule[dayName]?.enabled ?? false;
  };

  // Generate 60 days starting from today
  const getDatesList = () => {
    const dates = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 60; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const datesList = getDatesList();

  const slotsCache = useRef<Record<string, string[]>>({});

  // Fetch slots (and schedule from same response) with in-memory caching
  const fetchSlots = useCallback(async (date: Date) => {
    const iso = toISO(date);
    // Slots depend on the session (duration + buffer), so cache per session and date
    const cacheKey = `${sessionId || 'default'}_${iso}`;
    if (cacheKey === fetchedDate && slots.length > 0) return;

    if (slotsCache.current[cacheKey]) {
      setSlots(slotsCache.current[cacheKey]);
      setFetchedDate(cacheKey);
      setLoadingSlots(false);
      return;
    }

    setLoadingSlots(true);
    try {
      const sessionQuery = sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : '';
      const res = await fetch(`/api/creators/${params.username}/availability?date=${iso}${sessionQuery}`);
      const data = await res.json();
      if (data.success) {
        const availableSlots = data.slots || [];
        slotsCache.current[cacheKey] = availableSlots;
        setSlots(availableSlots);
        setFetchedDate(cacheKey);
        if (data.schedule) {
          setSchedule(data.schedule);
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
  }, [params.username, sessionId, fetchedDate, slots.length]);

  useEffect(() => {
    if (params.username) {
      router.prefetch(`/creators/${params.username}/book-session/step-3${queryStr}`);
    }
  }, [params.username, queryStr, router]);

  // Default selected date to the first enabled day
  useEffect(() => {
    if (!booking.selectedDate && schedule) {
      const firstEnabled = datesList.find(isDayEnabled);
      if (firstEnabled) setBooking(b => ({ ...b, selectedDate: firstEnabled }));
    } else if (!booking.selectedDate && !schedule) {
      setBooking(b => ({ ...b, selectedDate: new Date() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.selectedDate, schedule]);

  useEffect(() => {
    if (booking.selectedDate) {
      fetchSlots(booking.selectedDate);
    }
  }, [booking.selectedDate, fetchSlots]);

  const handleTimeSelect = (time: string) => {
    setBooking(b => ({ ...b, selectedTime: time }));
  };

  const handleDateSelect = (date: Date) => {
    setBooking(b => ({ ...b, selectedDate: date, selectedTime: null }));
    setFetchedDate(null);
  };

  const handleContinue = () => {
    if (booking.selectedDate && booking.selectedTime) {
      setIsLoadingContinue(true);
      nextStep();
      router.push(`/creators/${params.username}/book-session/step-3${queryStr}`);
    }
  };

  const handleBack = () => {
    setIsLoadingBack(true);
    prevStep();
    router.push(`/creators/${params.username}/book-session/step-1${queryStr}`);
  };

  const handleSaveDraft = () => {
    saveDraft();
  };

  const creator = booking.creator;


  const scrollDays = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const offset = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  const isSameDay = (d1: Date, d2: Date | null) => {
    if (!d2) return false;
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-2">
      {/* Step Progress Indicator */}
      <BookingProgress currentStep={2} />

      <div className="grid grid-cols-1 lg:grid-cols-[410px_1fr] gap-8 items-start justify-items-center">
        <div className="hidden lg:block w-full">
          <CreatorProfileCard creator={creator} />
        </div>

        {/* ============ RIGHT COLUMN: SELECT DATE/TIME ============ */}
        <div className="flex flex-col w-full max-w-[790px]">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Select Date & Time</h2>
            {booking.selectedSession && (
              <p className="text-gray-500 font-medium text-sm">
                Booking: <span className="text-gray-900 font-bold">{booking.selectedSession.title}</span> ({booking.selectedSession.duration})
              </p>
            )}
          </div>

          {/* ============ DATE SELECTOR STRIP ============ */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-3 flex items-center justify-between shadow-sm w-full select-none">
            {/* Left Scroll Button */}
            <button
              onClick={() => scrollDays('left')}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-[#0012FF] hover:bg-[#EEF2FF] transition-all shrink-0 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Days Scroll Area */}
            <div
              ref={scrollRef}
              className="flex items-center gap-2 overflow-x-auto mx-1 flex-grow scroll-smooth no-scrollbar px-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {datesList.map((d, i) => {
                const isSelected = isSameDay(d, booking.selectedDate);
                const enabled = isDayEnabled(d);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = String(d.getDate()).padStart(2, '0');

                return (
                  <button
                    key={i}
                    onClick={() => enabled && handleDateSelect(d)}
                    disabled={!enabled}
                    className={`flex-shrink-0 w-12 py-2 flex flex-col items-center justify-center rounded-xl transition-all border-2 ${isSelected
                      ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF] shadow-sm'
                      : enabled
                        ? 'bg-white border-transparent text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                        : 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'
                      }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-bold block leading-none mb-1">
                      {dayName}
                    </span>
                    <span className="text-lg font-black block leading-none">
                      {dayNum}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Button */}
            <button
              onClick={() => scrollDays('right')}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-[#0012FF] hover:bg-[#EEF2FF] transition-all shrink-0 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* ============ TIME SLOTS GRID ============ */}
          <div className="w-full mt-8">
            {loadingSlots ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="bg-white border border-gray-200/80 rounded-2xl p-8 text-center shadow-sm">
                <img src="/assets/no-appointment.webp" alt="No appointments" className="w-40 h-40 mx-auto object-contain mb-4" />
                <p className="text-gray-900 text-lg font-bold mb-1">No sessions available</p>
                <p className="text-gray-500 text-sm font-medium">The creator isn't available on this day. Please select another date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map((time, i) => {
                  const isSelected = booking.selectedTime === time;

                  return (
                    <button
                      key={i}
                      onClick={() => handleTimeSelect(time)}
                      className={`py-3 px-4 rounded-xl text-[13px] font-bold transition-all text-center border-2 shadow-sm hover:shadow-md active:scale-95 ${isSelected
                        ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF]'
                        : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ============ NAVIGATION & ACTIONS ROW ============ */}
          <div className="flex flex-wrap gap-2 mt-10 justify-end w-full border-t border-gray-100 pt-6">
            <button
              onClick={handleSaveDraft}
              disabled={isDraftSaved}
              className={`font-bold py-2.5 px-6 rounded-full text-xs transition-all shadow-sm mr-auto flex items-center justify-center gap-1.5 border ${isDraftSaved
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
                "Save as Draft"
              )}
            </button>

            <button
              onClick={handleBack}
              disabled={isLoadingBack}
              className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-full text-xs hover:bg-gray-50 hover:shadow-md active:scale-95 transition-all shadow-sm flex items-center justify-center"
            >
              {isLoadingBack ? (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin"></div>
              ) : (
                "Back"
              )}
            </button>

            <button
              onClick={handleContinue}
              disabled={!booking.selectedDate || !booking.selectedTime || isLoadingContinue}
              className={`py-2.5 px-8 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center active:scale-95 ${booking.selectedDate && booking.selectedTime
                ? 'bg-[#0012FF] text-white hover:bg-[#0010d0] hover:shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isLoadingContinue ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#808BFF] border-t-white animate-spin"></div>
              ) : (
                "Continue"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}