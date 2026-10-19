'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useOnboardingCleanup } from '@/hooks/useOnboardingCleanup';
import FormInput from '@/components/FormInput';

// ─── Types ────────────────────────────────────────────────────────────────────
type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface TimeSlot { start: string; end: string; }
interface DaySchedule { enabled: boolean; slots: TimeSlot[]; }
type Schedule = Record<DayKey, DaySchedule>;

interface Duration {
  value: number;
  unit: 'min' | 'hr';
}

interface Location {
  type: 'in-person' | 'online';
  address?: string;
}

interface MeetingLimits {
  count: number;
  period: 'day' | 'week' | 'month';
}

const DAYS: DayKey[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS: Record<DayKey, string> = {
  monday:'Monday', tuesday:'Tuesday', wednesday:'Wednesday',
  thursday:'Thursday', friday:'Friday', saturday:'Saturday', sunday:'Sunday',
};

// Time options every 30 min from 00:00 → 23:30
const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${m.toString().padStart(2,'0')} ${period}`;
}

// Default blank schedule
function defaultSchedule(): Schedule {
  return DAYS.reduce((acc, d) => {
    acc[d] = { enabled: false, slots: [{ start: '09:00', end: '17:00' }] };
    return acc;
  }, {} as Schedule);
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];
const BUFFER_OPTIONS = [5, 10, 15, 30, 45, 60];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreatorOnboardingStep4() {
  const router = useRouter();
  useOnboardingCleanup();

  const [fetchingData, setFetchingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [isDraftSaved, setIsDraftSaved] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const isLoadedRef = useRef(false);

  // Schedule state
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule());
  const [bufferMinutes, setBuffer] = useState(15);
  const [bookingWindowDays, setWindow] = useState(30);
  const [minNoticeHours, setNotice] = useState(4);
  const [duration, setDuration] = useState<Duration>({ value: 45, unit: 'min' });
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [meetingLimits, setMeetingLimits] = useState<MeetingLimits>({ count: 4, period: 'day' });

  // Dropdown state
  const [openDuration, setOpenDuration] = useState(false);
  const [openDurationUnit, setOpenDurationUnit] = useState(false);
  const [openBuffer, setOpenBuffer] = useState(false);
  const [openWindow, setOpenWindow] = useState(false);
  const [openNotice, setOpenNotice] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [openMeetingPeriod, setOpenMeetingPeriod] = useState(false);
  const [openTimeStart, setOpenTimeStart] = useState<{ day: DayKey; idx: number } | null>(null);
  const [openTimeEnd, setOpenTimeEnd] = useState<{ day: DayKey; idx: number } | null>(null);

  // ─── Load saved data on mount ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/creator-onboarding/step-5', { cache: 'no-store' });
        if (res.ok) {
          const { availability } = await res.json();
          if (availability) {
            // Merge saved schedule with defaults
            const saved = availability.schedule || {};
            const merged = defaultSchedule();
            DAYS.forEach(d => {
              if (saved[d]) merged[d] = {
                enabled: saved[d].enabled ?? false,
                slots: saved[d].slots?.length ? saved[d].slots : [{ start: '09:00', end: '17:00' }],
              };
            });
            setSchedule(merged);
            setBuffer(availability.bufferMinutes ?? 15);
            setWindow(availability.bookingWindowDays ?? 30);
            setNotice(availability.minNoticeHours ?? 4);
            setDuration(availability.duration ?? { value: 45, unit: 'min' });
            setLocation(availability.location ?? null);
            setMeetingLimits(availability.meetingLimits ?? { count: 4, period: 'day' });
          }
        }
      } finally {
        setFetchingData(false);
        setTimeout(() => {
          isLoadedRef.current = true;
          setIsDraftSaved(true);
        }, 100);
      }
    })();
  }, []);

  // Watch for changes to reset draft saved status
  useEffect(() => {
    if (isLoadedRef.current) {
      setIsDraftSaved(false);
    }
  }, [schedule, bufferMinutes, bookingWindowDays, minNoticeHours, duration, location, meetingLimits]);

  // ─── Schedule helpers ─────────────────────────────────────────────────────
  const toggleDay = (day: DayKey) =>
    setSchedule(s => ({ ...s, [day]: { ...s[day], enabled: !s[day].enabled } }));

  const updateSlot = (day: DayKey, idx: number, field: 'start' | 'end', val: string) =>
    setSchedule(s => {
      const slots = [...s[day].slots];
      slots[idx] = { ...slots[idx], [field]: val };
      return { ...s, [day]: { ...s[day], slots } };
    });

  const addSlot = (day: DayKey) =>
    setSchedule(s => ({
      ...s,
      [day]: { ...s[day], slots: [...s[day].slots, { start: '09:00', end: '17:00' }] },
    }));

  const enabledDays = DAYS.filter(d => schedule[d].enabled).length;

  // ─── Handle Duration Selection ────────────────────────────────────────────
  const handleDurationSelect = (value: number) => {
    if (value === -1) {
      setShowCustomDuration(true);
      setDuration({ ...duration, value: 45 });
    } else {
      setShowCustomDuration(false);
      setDuration({ value, unit: 'min' });
    }
    setOpenDuration(false);
  };

  const handleContinue = async () => {
    if (enabledDays === 0) {
      setError('Enable at least one day in your weekly schedule before continuing.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/creator-onboarding/step-5', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          schedule, 
          bufferMinutes, 
          timezone: 'Asia/Karachi', 
          bookingWindowDays, 
          minNoticeHours, 
          blockedDates: [],
          duration,
          location,
          meetingLimits
        }),
      });
      const data = await res.json();
      if (data.success) router.push('/creator-onboarding/step-5');
      else { setError(data.error || 'Failed to save. Try again.'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true); setError('');
    try {
      const res = await fetch('/api/creator-onboarding/step-5', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          schedule, 
          bufferMinutes, 
          timezone: 'Asia/Karachi', 
          bookingWindowDays, 
          minNoticeHours, 
          blockedDates: [],
          duration,
          location,
          meetingLimits
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsDraftSaved(true);
      } else {
        setError(data.error || 'Failed to save draft.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch { setError('Network error saving draft.'); }
    finally { setSavingDraft(false); }
  };

  if (fetchingData) return <LoadingAnimation />;

  return (
    <div className="min-h-screen bg-[#F7F7FA]">




      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-anton text-3xl font-bold text-black mb-2">
            When Are You <span className="text-[#0012FF]">Available</span>?
          </h1>
          <p className="text-xs text-gray-400">
            Set your weekly schedule. You can change this anytime.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

          {/* ─── Left: Weekly schedule ───────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="font-sans text-sm font-semibold text-black">Weekly Schedule</h3>
            </div>

            <div className="space-y-4">
              {DAYS.map(day => {
                const ds = schedule[day];
                return (
                  <div key={day} className="bg-[#F7F7FA] border border-gray-200 rounded-xl p-4">
                    {/* Day header row */}
                    <div className={`flex items-center justify-between ${ds.enabled ? 'mb-3' : ''}`}>
                      <div className="flex items-center gap-4">
                        {/* Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 flex items-center p-1 ${ds.enabled ? 'bg-[#0012FF]' : 'bg-gray-300'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-all duration-200 transform ${ds.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <span className={`font-sans text-sm font-semibold leading-none ${ds.enabled ? 'text-black' : 'text-gray-400'}`}>
                          {DAY_LABELS[day]}
                        </span>
                      </div>
                    </div>

                    {/* Time slots (only if enabled) */}
                    {ds.enabled && (
                      <div className="space-y-3">
                        {ds.slots.map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-3 w-full">
                          {/* Start time */}
                          <div className="relative flex-1">
                            <button
                              type="button"
                              onClick={() => setOpenTimeStart(openTimeStart?.day === day && openTimeStart?.idx === idx ? null : { day, idx })}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-left text-gray-900 focus:outline-none focus:border-[#0012FF] flex items-center justify-between"
                            >
                              <span>{formatTime(slot.start)}</span>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                            {openTimeStart?.day === day && openTimeStart?.idx === idx && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                                {TIME_OPTIONS.map(t => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => {
                                      updateSlot(day, idx, 'start', t);
                                      setOpenTimeStart(null);
                                    }}
                                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                                      slot.start === t
                                        ? 'bg-[#0012FF] text-white'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                  >
                                    {formatTime(t)}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <span className="font-sans text-sm text-gray-500 flex-shrink-0">to</span>

                          {/* End time */}
                          <div className="relative flex-1">
                            <button
                              type="button"
                              onClick={() => setOpenTimeEnd(openTimeEnd?.day === day && openTimeEnd?.idx === idx ? null : { day, idx })}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-left text-gray-900 focus:outline-none focus:border-[#0012FF] flex items-center justify-between"
                            >
                              <span>{formatTime(slot.end)}</span>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>
                            {openTimeEnd?.day === day && openTimeEnd?.idx === idx && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                                {TIME_OPTIONS.filter(t => t > slot.start).map(t => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => {
                                      updateSlot(day, idx, 'end', t);
                                      setOpenTimeEnd(null);
                                    }}
                                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                                      slot.end === t
                                        ? 'bg-[#0012FF] text-white'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                  >
                                    {formatTime(t)}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        ))}
                        {/* Add time block button */}
                        <button
                          onClick={() => addSlot(day)}
                          className="w-full flex items-center gap-2 text-[#0012FF] text-sm font-semibold font-sans hover:opacity-80 transition-opacity"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          Add Another Time Block
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Right: Booking Settings ──────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="font-sans text-sm font-semibold text-black">Booking Settings</h3>
            </div>

            <div className="space-y-6">
              {/* Duration */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700">Duration</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDuration(!openDuration)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-left text-gray-900 focus:outline-none focus:border-[#0012FF] flex items-center justify-between"
                  >
                    <span className={!showCustomDuration ? 'text-gray-900' : 'text-gray-400'}>
                      {showCustomDuration ? 'Custom' : `${duration.value} ${duration.unit}`}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {openDuration && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                      {DURATION_PRESETS.map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => handleDurationSelect(v)}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                            !showCustomDuration && duration.value === v
                              ? 'bg-[#0012FF] text-white'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {v} mins
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleDurationSelect(-1)}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                          showCustomDuration
                            ? 'bg-[#0012FF] text-white'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  )}
                </div>

                {/* Custom duration inputs */}
                {showCustomDuration && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Time</label>
                      <FormInput
                        type="number"
                        value={duration.value}
                        onChange={(e) => setDuration({ ...duration, value: Number(e.target.value) })}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Unit</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenDurationUnit(!openDurationUnit)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-left text-gray-900 focus:outline-none focus:border-[#0012FF] flex items-center justify-between"
                        >
                          <span>{duration.unit}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                        {openDurationUnit && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                            {(['min', 'hr'] as const).map(u => (
                              <button
                                key={u}
                                type="button"
                                onClick={() => {
                                  setDuration({ ...duration, unit: u });
                                  setOpenDurationUnit(false);
                                }}
                                className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                                  duration.unit === u
                                    ? 'bg-[#0012FF] text-white'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {u}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Buffer between bookings */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Buffer Between Bookings
                </label>
                <button
                  type="button"
                  onClick={() => setOpenBuffer(!openBuffer)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-left text-gray-900 focus:outline-none focus:border-[#0012FF] flex items-center justify-between"
                >
                  <span className={bufferMinutes ? 'text-gray-900' : 'text-gray-400'}>
                    {bufferMinutes} mins
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {openBuffer && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    {BUFFER_OPTIONS.map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => { setBuffer(v); setOpenBuffer(false); }}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                          bufferMinutes === v
                            ? 'bg-[#0012FF] text-white'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {v} mins
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700">Location</label>
                {location ? (
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                        <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
                        <circle cx="12" cy="9" r="2" />
                      </svg>
                      <span className="font-sans text-sm text-gray-900">
                        {location.type === 'in-person' ? 'In-person' : 'Online'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocation(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenLocation(!openLocation)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-left text-gray-400 focus:outline-none focus:border-[#0012FF] flex items-center justify-between"
                    >
                      Select location
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {openLocation && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                        <button
                          type="button"
                          onClick={() => {
                            setLocation({ type: 'in-person' });
                            setOpenLocation(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          In-person
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLocation({ type: 'online' });
                            setOpenLocation(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          Online
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Address field for in-person */}
                {location && location.type === 'in-person' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Location name/address
                    </label>
                    <textarea
                      value={location.address || ''}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] resize-none h-24 placeholder-gray-400"
                      placeholder="Enter your address"
                    />
                  </div>
                )}
              </div>

              {/* Followers can book up to */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Followers Can Book Up To
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <FormInput
                      type="number"
                      value={bookingWindowDays}
                      onChange={(e) => setWindow(Number(e.target.value))}
                      className="text-center"
                      min="1"
                    />
                  </div>
                  <span className="font-sans text-sm text-gray-500">days ahead</span>
                </div>
              </div>

              {/* Minimum notice required */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Minimum Notice Required
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <FormInput
                      type="number"
                      value={minNoticeHours}
                      onChange={(e) => setNotice(Number(e.target.value))}
                      className="text-center"
                      min="0"
                    />
                  </div>
                  <span className="font-sans text-sm text-gray-500">hours</span>
                </div>
              </div>

              {/* Meeting Limits */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Meeting Limits
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <FormInput
                      type="number"
                      value={meetingLimits.count}
                      onChange={(e) => setMeetingLimits({ ...meetingLimits, count: Number(e.target.value) })}
                      className="text-center"
                      min="1"
                    />
                  </div>
                  <span className="font-sans text-sm text-gray-500">meetings per</span>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setOpenMeetingPeriod(!openMeetingPeriod)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-left text-gray-900 focus:outline-none focus:border-[#0012FF] flex items-center justify-between"
                    >
                      <span>{meetingLimits.period}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {openMeetingPeriod && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                        {(['day', 'week', 'month'] as const).map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              setMeetingLimits({ ...meetingLimits, period: p });
                              setOpenMeetingPeriod(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                              meetingLimits.period === p
                                ? 'bg-[#0012FF] text-white'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/creator-onboarding/step-3')}
            className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-sans font-semibold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft || isDraftSaved}
              className={`px-6 py-2.5 rounded-full font-sans font-semibold text-sm transition-all border ${
                isDraftSaved
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'border-[#0012FF] text-[#0012FF] hover:bg-[#0012FF]/5 cursor-pointer'
              }`}
            >
              {savingDraft ? 'Saving...' : isDraftSaved ? 'Saved' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={saving || enabledDays === 0}
              className={`px-6 py-2.5 rounded-full font-sans font-semibold text-sm transition-all ${
                enabledDays > 0 && !saving
                  ? 'bg-[#0012FF] text-white hover:bg-[#0012FF]/90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Saving…
                </>
              ) : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


