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
  const { booking, setBooking, nextStep, prevStep } = useBooking();

  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [fetchedDate, setFetchedDate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Record<string, { enabled: boolean }> | null>(null);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [isLoadingBack, setIsLoadingBack] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [saved, setSaved] = useState(true);

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
    setIsLoadingDraft(true);
    setTimeout(() => {
      setIsLoadingDraft(false);
      alert("Progress saved successfully!");
    }, 800);
  };

  const creator = booking.creator;

  // Svg cards templates rotated
  const cardColors = ['#B7C0FF', '#FFEDB5', '#FFB3B3'];
  const cardThemes = [
    { text: 'text-[#0012FF]', stroke: 'stroke-[#0012FF]', bg: 'bg-[#EEF2FF]' },
    { text: 'text-[#D97706]', stroke: 'stroke-[#D97706]', bg: 'bg-[#FFFBEB]' },
    { text: 'text-[#DC2626]', stroke: 'stroke-[#DC2626]', bg: 'bg-[#FFF5F5]' },
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

      <div className="grid grid-cols-1 lg:grid-cols-[370px_1fr] gap-8 items-start justify-items-center">
        <CreatorProfileCard creator={creator} />

        {/* ============ RIGHT COLUMN: SELECT SESSIONS AND PICK DATE/TIME ============ */}
        <div className="flex flex-col w-full">
          {/* Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center mb-6">
            {sessions.map((session, index) => {
              const themeIdx = index % 3;
              const cardColor = cardColors[themeIdx];
              const theme = cardThemes[themeIdx];
              const isSelected = booking.selectedSession?.id === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`relative w-full max-w-[246px] h-[340px] bg-transparent overflow-visible isolate select-none cursor-pointer transition-all duration-200 hover:-translate-y-1 ${isSelected ? 'scale-105 filter drop-shadow-md' : ''
                    }`}
                >
                  {/* Card Background SVG containing the exact notch outline stroke */}
                  <svg width="246" height="340" viewBox="0 0 246 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <path
                      d="M1 332C1 336.418 4.58172 340 9 340H237C241.418 340 245 336.418 245 332V35.1559C245 30.7376 241.418 27.1559 237 27.1559H201C196.582 27.1559 193 23.5742 193 19.1559V9C193 4.58173 189.418 1 185 1H9C4.58172 1 1 4.58173 1 9L1 332Z"
                      fill={cardColor}
                      stroke={isSelected ? '#0012FF' : 'transparent'}
                      strokeWidth={isSelected ? '2.2' : '0'}
                    />
                  </svg>

                  {/* Card Content */}
                  <div className="relative z-10 p-5 pt-6 pb-6 flex flex-col h-full justify-between">
                    <div>
                      {/* Top row: Icon + Duration in Notch */}
                      <div className="flex items-start justify-between">
                        {/* Left Icon Container */}
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={theme.text}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                          </svg>
                        </div>

                        {/* Duration label in notch */}
                        <span className={`absolute top-[4px] right-[1px] text-[10px] font-bold flex items-center gap-0.5 ${theme.text}`}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={theme.stroke}>
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {session.duration}
                        </span>
                      </div>

                      {/* Session Title */}
                      <h4 className="text-base font-bold text-gray-900 mt-4 font-sans line-clamp-1 leading-tight">
                        {session.title}
                      </h4>

                      {/* Session Description */}
                      <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed line-clamp-3">
                        {session.description}
                      </p>

                      {/* Divider */}
                      <div className="border-t border-black/5 my-3" />

                      {/* Features Checklist */}
                      <ul className="space-y-1.5">
                        {session.features.slice(0, 4).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-1.5 text-[10px] text-gray-600 font-semibold leading-none">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className={theme.stroke}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price in Anton font at bottom */}
                    <div className={`text-2xl font-bold font-anton uppercase tracking-tight mt-auto text-left leading-none ${theme.text}`}>
                      {session.price.toLocaleString()} PKR
                    </div>
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
          <div className="flex gap-4 mt-8 justify-between lg:justify-end w-full px-1">
            <button
              onClick={handleSaveDraft}
              disabled={isLoadingDraft}
              className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-full text-xs hover:bg-gray-50 transition-colors shadow-sm lg:mr-auto flex items-center justify-center min-w-[120px]"
            >
              {isLoadingDraft ? (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin"></div>
              ) : (
                "Save as Draft"
              )}
            </button>

            <div className="flex gap-4">
              <button
                onClick={handleBack}
                disabled={isLoadingBack}
                className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-full text-xs hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center min-w-[100px]"
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
                className={`py-2.5 px-8 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center min-w-[120px] ${booking.selectedDate && booking.selectedTime
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
    </div>
  );
}