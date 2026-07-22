'use client';

import { useParams, useRouter } from 'next/navigation';
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
  const { booking, setBooking, nextStep, prevStep, saveDraft, isDraftSaved } = useBooking();

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

  // Fetch full schedule once on mount
  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch(`/api/creators/${params.username}/availability`);
        const data = await res.json();
        if (data.success && data.schedule) {
          setSchedule(data.schedule);
        }
      } catch { /* silent */ }
    }
    fetchSchedule();
  }, [params.username]);

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

  const fetchSlots = useCallback(async (date: Date) => {
    const iso = toISO(date);
    if (iso === fetchedDate) return;
    setLoadingSlots(true);
    setSlots([]); // clear while loading
    try {
      const res = await fetch(`/api/creators/${params.username}/availability?date=${iso}`);
      const data = await res.json();
      setSlots(data.success && data.slots ? data.slots : []);
      setFetchedDate(iso);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [params.username, fetchedDate]);

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

  const handleSelectSession = (session: SessionType) => {
    setBooking(b => ({ ...b, selectedSession: session }));
  };

  const handleContinue = () => {
    if (booking.selectedDate && booking.selectedTime) {
      setIsLoadingContinue(true);
      nextStep();
      router.push(`/creators/${params.username}/book-session/step-3`);
    }
  };

  const handleBack = () => {
    setIsLoadingBack(true);
    prevStep();
    router.push(`/creators/${params.username}/book-session/step-1`);
  };

  const handleSaveDraft = () => {
    saveDraft();
  };

  const creator = booking.creator;

  // Svg cards templates rotated
  const cardColors = ['#B7C0FF', '#FFEDB5', '#FFB3B3'];
  const cardThemes = [
    { text: 'text-[#0012FF]', stroke: 'stroke-[#0012FF]', bg: 'bg-[#BAC5FF]', title: 'text-white', desc: 'text-white/90', feature: 'text-white/95', divider: 'bg-white/35' }, // Card 1: Blue
    { text: 'text-[#B86B00]', stroke: 'stroke-[#B86B00]', bg: 'bg-[#FFEDB5]', title: 'text-[#4A3B18]', desc: 'text-[#5C4D26]', feature: 'text-[#4A3B18]', divider: 'bg-[#4A3B18]/20' }, // Card 2: Yellow (Clear dark grayish text)
    { text: 'text-[#E32A2A]', stroke: 'stroke-[#E32A2A]', bg: 'bg-[#FFB3B3]', title: 'text-white', desc: 'text-white/90', feature: 'text-white/95', divider: 'bg-white/35' }, // Card 3: Pink
  ];

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

  const [sessions, setSessions] = useState<SessionType[]>([]);
  useEffect(() => {
    async function fetchCreatorSessions() {
      try {
        const res = await fetch(`/api/creators/${params.username}`);
        const data = await res.json();
        if (data.success) {
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchCreatorSessions();
  }, [params.username]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-2">
      {/* Step Progress Indicator */}
      <BookingProgress currentStep={2} />

      <div className="grid grid-cols-1 lg:grid-cols-[410px_1fr] gap-8 items-start justify-items-center">
        <CreatorProfileCard creator={creator} />

        {/* ============ RIGHT COLUMN: SELECT SESSIONS AND PICK DATE/TIME ============ */}
        <div className="flex flex-col w-full">
          {/* Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center mb-6">
            {sessions.map((session, index) => {
              const themeIdx = index % 3;
              const theme = cardThemes[themeIdx];
              const isSelected = booking.selectedSession?.id === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full max-w-[285px] min-h-[380px] sm:min-h-[400px] h-[400px] ${theme.bg} rounded-[13px] p-6 flex flex-col justify-between select-none cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-1 ${isSelected ? 'border-4 border-[#0012FF] scale-[1.03] shadow-lg' : 'border-4 border-transparent'
                    }`}
                >
                  <div>
                    {/* Top row: Briefcase Icon + Duration */}
                    <div className="flex items-center justify-between mb-5">
                      {/* Icon Badge */}
                      <div className="w-9 h-9 rounded-xl bg-white/90 shadow-2xs flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={theme.text}>
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                      </div>

                      {/* Duration */}
                      <span className={`text-xs font-bold font-sans flex items-center gap-1.5 ${theme.text}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={theme.stroke}>
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 16 14" />
                        </svg>
                        {session.duration}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className={`text-lg font-bold font-sans leading-tight mb-2 line-clamp-1 ${theme.title}`}>
                      {session.title}
                    </h4>

                    {/* Description */}
                    <p className={`text-xs font-medium font-sans leading-relaxed line-clamp-3 ${theme.desc}`}>
                      {session.description}
                    </p>

                    {/* Divider */}
                    <div className={`w-full h-px my-4 ${theme.divider}`} />

                    {/* Features List */}
                    <ul className="space-y-2">
                      {session.features.slice(0, 4).map((feature: string, idx: number) => (
                        <li key={idx} className={`flex items-center gap-2 text-xs font-semibold font-sans leading-tight ${theme.feature}`}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${theme.text} shrink-0`}>
                            <circle cx="12" cy="12" r="9" />
                            <path d="M8 12l3 3 5-5" />
                          </svg>
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price */}
                  <div className={`text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight mt-6 leading-none ${theme.text}`}>
                    {session.price.toLocaleString()} PKR
                  </div>
                </div>
              );
            })}
          </div>

          {/* ============ DATE SELECTOR STRIP ============ */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-3 flex items-center justify-between shadow-sm w-full max-w-[790px] mx-auto select-none">
            {/* Left Scroll Button */}
            <button
              onClick={() => scrollDays('left')}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-[#0012FF] hover:bg-gray-50 transition-colors shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Days Scroll Area */}
            <div
              ref={scrollRef}
              className="flex items-center gap-2 overflow-x-auto mx-1 flex-grow scroll-smooth no-scrollbar"
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
                    className={`flex-shrink-0 w-11 py-1.5 flex flex-col items-center justify-center rounded-xl transition-all border ${isSelected
                      ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF]'
                      : enabled
                        ? 'bg-white border-transparent text-gray-500 hover:border-gray-100 hover:bg-gray-50'
                        : 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'
                      }`}
                  >
                    <span className="text-[8px] uppercase tracking-wider font-bold block leading-none mb-0.5">
                      {dayName}
                    </span>
                    <span className="text-xs font-black block leading-none">
                      {dayNum}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Button */}
            <button
              onClick={() => scrollDays('right')}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-[#0012FF] hover:bg-gray-50 transition-colors shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* ============ TIME SLOTS GRID ============ */}
          <div className="w-full max-w-[790px] mx-auto mt-6">
            {loadingSlots ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                <svg className="mx-auto mb-3 text-gray-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p className="text-gray-500 text-sm font-semibold">No sessions available</p>
                <p className="text-gray-400 text-xs mt-1">The creator isn't available on this day. Please select another date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map((time, i) => {
                  const isSelected = booking.selectedTime === time;

                  return (
                    <button
                      key={i}
                      onClick={() => handleTimeSelect(time)}
                      className={`py-3 px-4 rounded-xl text-[11px] font-bold transition-all text-center border shadow-xs ${isSelected
                        ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF]'
                        : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
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
          <div className="flex flex-wrap gap-2 mt-8 justify-end w-full px-1">
            <button
              onClick={handleSaveDraft}
              disabled={isDraftSaved}
              className={`font-bold py-2.5 px-4 sm:px-6 rounded-full text-xs transition-colors shadow-sm mr-auto flex items-center justify-center gap-1.5 border ${isDraftSaved
                  ? 'bg-green-50 border-green-200 text-green-600 cursor-default'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              {isDraftSaved ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
              className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-4 sm:px-6 rounded-full text-xs hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
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
              className={`py-2.5 px-5 sm:px-8 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center ${booking.selectedDate && booking.selectedTime
                ? 'bg-[#0012FF] text-white hover:bg-[#0010d0]'
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