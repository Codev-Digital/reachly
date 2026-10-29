'use client';

import { pktToday } from '@/lib/pkt';
import { CalendarX2, LockKeyhole } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const toISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSameDay = (d1: Date, d2: Date | null) => {
  if (!d2) return false;
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

type Props = {
  username: string;
  /** Session type id — required for real slot times (duration + buffer + min notice). */
  sessionId?: string | null;
  reservationToken?: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  onReservationTokenChange?: (token: string | undefined) => void;
  /** How many days to show from today (default 60). */
  dayCount?: number;
  /** Slightly tighter layout for modals. */
  compact?: boolean;
};

/**
 * Date strip + time-slot grid used during booking and in reschedule modals.
 * Days with slots render dark; empty days light. Chevrons jump to the next available day.
 */
export default function AvailabilityDateTimePicker({
  username,
  sessionId,
  reservationToken,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  onReservationTokenChange,
  dayCount = 60,
  compact = false,
}: Props) {
  const [slots, setSlots] = useState<string[]>([]);
  const [lockedSlots, setLockedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [fetchedDate, setFetchedDate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Record<string, { enabled: boolean }> | null>(null);
  const [dayHasSlots, setDayHasSlots] = useState<Record<string, boolean>>({});

  const dayBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const slotsCache = useRef<Record<string, { slots: string[]; lockedSlots: string[] }>>({});
  const inFlightSlots = useRef<
    Record<string, Promise<{ slots: string[]; lockedSlots: string[]; schedule?: Record<string, { enabled: boolean }> }>>
  >({});
  const previewGen = useRef(0);

  const today = useMemo(() => pktToday(), []);

  const datesList = useMemo(() => {
    const dates: Date[] = [];
    const base = pktToday();
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [dayCount]);

  const isDayEnabled = useCallback(
    (d: Date) => {
      if (!schedule) return true;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      return schedule[dayName]?.enabled ?? false;
    },
    [schedule]
  );

  const tokenRef = useRef(reservationToken);
  tokenRef.current = reservationToken;

  const cacheKeyFor = useCallback(
    (iso: string) => `${sessionId || 'default'}_${iso}`,
    [sessionId]
  );

  const markDaySlots = useCallback(
    (iso: string, available: string[], locked: string[] = []) => {
      slotsCache.current[cacheKeyFor(iso)] = { slots: available, lockedSlots: locked };
      const hasSlots = available.length + locked.length > 0;
      setDayHasSlots((prev) =>
        prev[iso] === hasSlots ? prev : { ...prev, [iso]: hasSlots }
      );
    },
    [cacheKeyFor]
  );

  const fetchDaySlots = useCallback(
    async (
      iso: string,
      force = false
    ): Promise<{ slots: string[]; lockedSlots: string[]; schedule?: Record<string, { enabled: boolean }> }> => {
      const cacheKey = cacheKeyFor(iso);
      if (!force && slotsCache.current[cacheKey] !== undefined) {
        return slotsCache.current[cacheKey];
      }
      const existingRequest = inFlightSlots.current[cacheKey];
      if (existingRequest) return existingRequest;

      const request = (async () => {
        const sessionQuery = sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : '';
        const tokenQuery = tokenRef.current ? `&reservationToken=${encodeURIComponent(tokenRef.current)}` : '';
        const res = await fetch(
          `/api/creators/${encodeURIComponent(username)}/availability?date=${iso}${sessionQuery}${tokenQuery}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        if (data.schedule) setSchedule(data.schedule);
        const availableSlots: string[] = data.success ? data.slots || [] : [];
        const currentLockedSlots: string[] = data.success ? data.lockedSlots || [] : [];
        markDaySlots(iso, availableSlots, currentLockedSlots);

        if (data.earliestBookableDate) {
          const earliestDate = data.earliestBookableDate as string;
          const earlierDays = datesList
            .map(toISO)
            .filter((dayIso) => dayIso < earliestDate && slotsCache.current[cacheKeyFor(dayIso)] === undefined);
          for (const dayIso of earlierDays) {
            slotsCache.current[cacheKeyFor(dayIso)] = { slots: [], lockedSlots: [] };
          }
          setDayHasSlots((prev) => {
            const next = { ...prev };
            for (const dayIso of earlierDays) {
              if (next[dayIso] === undefined) next[dayIso] = false;
            }
            return next;
          });
        }
        return { slots: availableSlots, lockedSlots: currentLockedSlots, schedule: data.schedule };
      })();
      inFlightSlots.current[cacheKey] = request;
      try {
        return await request;
      } finally {
        if (inFlightSlots.current[cacheKey] === request) {
          delete inFlightSlots.current[cacheKey];
        }
      }
    },
    [cacheKeyFor, datesList, markDaySlots, sessionId, username]
  );

  // Prefetch availability for the strip
  useEffect(() => {
    if (!username) return;

    const gen = ++previewGen.current;
    slotsCache.current = {};
    inFlightSlots.current = {};
    setDayHasSlots({});
    setFetchedDate(null);
    setSlots([]);
    setLockedSlots([]);

    (async () => {
      let knownSchedule: Record<string, { enabled: boolean }> | null = null;
      try {
        const first = await fetchDaySlots(toISO(today));
        knownSchedule = first.schedule || null;
      } catch {
        /* continue */
      }
      if (previewGen.current !== gen) return;

      const remaining: string[] = [];
      for (const d of datesList) {
        const iso = toISO(d);
        if (slotsCache.current[cacheKeyFor(iso)] !== undefined) continue;
        if (knownSchedule) {
          const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          if (!(knownSchedule[dayName]?.enabled ?? false)) {
            markDaySlots(iso, []);
            continue;
          }
        }
        remaining.push(iso);
      }

      const CONCURRENCY = 6;
      for (let i = 0; i < remaining.length; i += CONCURRENCY) {
        if (previewGen.current !== gen) return;
        await Promise.all(
          remaining.slice(i, i + CONCURRENCY).map(async (iso) => {
            try {
              await fetchDaySlots(iso);
            } catch {
              if (previewGen.current === gen) markDaySlots(iso, []);
            }
          })
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, sessionId, dayCount]);

  // Default selection to today
  useEffect(() => {
    if (!selectedDate) onDateChange(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, today]);

  // Load slots for the selected day
  useEffect(() => {
    if (!selectedDate) return;
    const iso = toISO(selectedDate);
    const cacheKey = cacheKeyFor(iso);
    if (cacheKey === fetchedDate) return;

    if (slotsCache.current[cacheKey]) {
      setSlots(slotsCache.current[cacheKey].slots);
      setLockedSlots(slotsCache.current[cacheKey].lockedSlots);
      setFetchedDate(cacheKey);
      setLoadingSlots(false);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);
    fetchDaySlots(iso)
      .then((result) => {
        if (cancelled) return;
        setSlots(result.slots);
        setLockedSlots(result.lockedSlots);
        setFetchedDate(cacheKey);
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setLockedSlots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, cacheKeyFor, fetchDaySlots, fetchedDate]);

  useEffect(() => {
    if (!selectedDate) return;
    const iso = toISO(selectedDate);
    const cacheKey = cacheKeyFor(iso);
    let active = true;
    const refresh = async () => {
      try {
        const result = await fetchDaySlots(iso, true);
        if (!active) return;
        setSlots(result.slots);
        setLockedSlots(result.lockedSlots);
        setFetchedDate(cacheKey);
      } catch (error) {
        console.error('Unable to refresh reserved session slots:', error);
      }
    };
    const interval = window.setInterval(refresh, 10_000);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [selectedDate, cacheKeyFor, fetchDaySlots]);

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    onTimeChange('');
    onReservationTokenChange?.(undefined);
    setLockedSlots([]);
    delete slotsCache.current[cacheKeyFor(toISO(date))];
    setFetchedDate(null);
  };

  const reserveTime = async (time: string) => {
    const token = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
          const random = Math.random() * 16 | 0;
          const value = character === 'x' ? random : (random & 0x3 | 0x8);
          return value.toString(16);
        });
    const date = selectedDate ? toISO(selectedDate) : '';
    if (!sessionId || !date) {
      toast.error('Please select a date before choosing a time.');
      return;
    }

    // Immediately update selection for snappy UI without waiting for network
    onTimeChange(time);

    try {
      const prevToken = tokenRef.current;
      if (prevToken) {
        await fetch(
          `/api/creators/${encodeURIComponent(username)}/availability/reservations`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: prevToken }),
          }
        ).catch(() => {});
      }
      const response = await fetch(
        `/api/creators/${encodeURIComponent(username)}/availability/reservations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, date, time, token }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        toast.error(data.error || 'Unable to reserve this slot. Please try again.');
        onTimeChange('');
        return;
      }
      onReservationTokenChange?.(token);
    } catch (error) {
      console.error('Unable to reserve session slot:', error);
      toast.error('Unable to reserve this slot. Please try again.');
      onTimeChange('');
    }
  };

  const scrollDayIntoView = (iso: string) => {
    dayBtnRefs.current[iso]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  const jumpToAvailableDay = (direction: 'left' | 'right') => {
    const currentIso = selectedDate ? toISO(selectedDate) : toISO(today);
    const currentIdx = datesList.findIndex((d) => toISO(d) === currentIso);
    const start = currentIdx < 0 ? 0 : currentIdx;

    if (direction === 'right') {
      for (let i = start + 1; i < datesList.length; i++) {
        const d = datesList[i];
        const iso = toISO(d);
        if (dayHasSlots[iso] && isDayEnabled(d)) {
          handleDateSelect(d);
          scrollDayIntoView(iso);
          return;
        }
      }
    } else {
      for (let i = start - 1; i >= 0; i--) {
        const d = datesList[i];
        const iso = toISO(d);
        if (dayHasSlots[iso] && isDayEnabled(d)) {
          handleDateSelect(d);
          scrollDayIntoView(iso);
          return;
        }
      }
    }
  };

  const selectedIso = selectedDate ? toISO(selectedDate) : null;

  const canJumpLeft = useMemo(() => {
    if (!selectedIso) return false;
    const idx = datesList.findIndex((d) => toISO(d) === selectedIso);
    for (let i = idx - 1; i >= 0; i--) {
      const iso = toISO(datesList[i]);
      if (dayHasSlots[iso] && isDayEnabled(datesList[i])) return true;
    }
    return false;
  }, [selectedIso, dayHasSlots, datesList, isDayEnabled]);

  const canJumpRight = useMemo(() => {
    if (!selectedIso) return true;
    const idx = datesList.findIndex((d) => toISO(d) === selectedIso);
    for (let i = idx + 1; i < datesList.length; i++) {
      const iso = toISO(datesList[i]);
      if (dayHasSlots[iso] && isDayEnabled(datesList[i])) return true;
    }
    return false;
  }, [selectedIso, dayHasSlots, datesList, isDayEnabled]);

  return (
    <div className="w-full">
      <div className="bg-white border border-[#e2e2e2] rounded-[20px] p-2.5 sm:p-3 flex items-center justify-between w-full select-none">
        <button
          type="button"
          onClick={() => jumpToAvailableDay('left')}
          disabled={!canJumpLeft}
          aria-label="Previous available day"
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-[#0012FF] hover:bg-[#EEF2FF] transition-all shrink-0 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div
          className="flex items-center gap-2 overflow-x-auto mx-1 flex-grow scroll-smooth no-scrollbar px-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {datesList.map((d, i) => {
            const iso = toISO(d);
            const isSelected = isSameDay(d, selectedDate);
            const isToday = isSameDay(d, today);
            const enabled = isDayEnabled(d);
            const hasSlots = dayHasSlots[iso] === true;
            const knownEmpty = dayHasSlots[iso] === false;
            const dayName = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = String(d.getDate()).padStart(2, '0');

            return (
              <button
                key={i}
                type="button"
                ref={(el) => {
                  dayBtnRefs.current[iso] = el;
                }}
                onClick={() => enabled && handleDateSelect(d)}
                disabled={!enabled}
                className={`flex-shrink-0 ${isToday ? 'w-14' : 'w-12'} py-2 flex flex-col items-center justify-center rounded-xl transition-all border-2 ${
                  isSelected
                    ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF] shadow-sm'
                    : !enabled
                      ? 'bg-gray-50 border-transparent text-gray-300 cursor-not-allowed'
                      : hasSlots
                        ? 'bg-white border-transparent text-gray-900 hover:border-gray-200 hover:bg-gray-50'
                        : knownEmpty
                          ? 'bg-white border-transparent text-gray-300 hover:border-gray-100 hover:bg-gray-50'
                          : 'bg-white border-transparent text-gray-400 hover:border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span className="text-[9px] uppercase tracking-wider font-bold block leading-none mb-1">
                  {dayName}
                </span>
                <span className="text-lg font-black block leading-none">{dayNum}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => jumpToAvailableDay('right')}
          disabled={!canJumpRight}
          aria-label="Next available day"
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-[#0012FF] hover:bg-[#EEF2FF] transition-all shrink-0 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className={`w-full ${compact ? 'mt-5' : 'mt-8'}`}>
        {loadingSlots ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : slots.length === 0 && lockedSlots.length === 0 ? (
          <div className="bg-white border border-[#e2e2e2] rounded-[20px] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF] text-[#0012FF]">
              <CalendarX2 className="h-8 w-8" strokeWidth={2.25} />
            </div>
            {selectedDate && isSameDay(selectedDate, today) ? (
              <>
                <p className="text-gray-900 text-lg font-bold mb-1">Today</p>
                <p className="text-gray-500 text-sm font-medium">No available slots</p>
              </>
            ) : (
              <>
                <p className="text-gray-900 text-lg font-bold mb-1">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'This day'}
                </p>
                <p className="text-gray-500 text-sm font-medium">No slots found</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${
                compact ? 'max-h-56 overflow-y-auto pr-1 no-scrollbar' : ''
              }`}
            >
            {[...slots, ...lockedSlots].sort((a, b) => {
              const toMinutes = (value: string) => {
                const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value);
                if (!match) return 0;
                let hour = Number(match[1]) % 12;
                if (match[3].toUpperCase() === 'PM') hour += 12;
                return hour * 60 + Number(match[2]);
              };
              return toMinutes(a) - toMinutes(b);
            }).map((time) => {
              const isSelected = selectedTime === time;
              const isLocked = lockedSlots.includes(time);
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      toast.info('This slot is reserved by another user. Please choose another slot.');
                      return;
                    }
                    void reserveTime(time);
                  }}
                  aria-label={isLocked ? `${time}, reserved by another user` : time}
                  className={`relative py-3 px-4 rounded-[20px] text-[13px] font-bold transition-all text-center border border-[#e2e2e2] active:scale-95 ${
                    isLocked
                      ? 'bg-gray-50 text-gray-400 border-gray-200'
                      : isSelected
                      ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF]'
                      : 'bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {time}
                  {isLocked && (
                    <LockKeyhole
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
            </div>
            {lockedSlots.length > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-500">

              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { toISO as dateToISO };
