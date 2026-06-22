'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomSelect from '@/components/CustomSelect';

// ─── Types ────────────────────────────────────────────────────────────────────
type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface TimeSlot { start: string; end: string; }
interface DaySchedule { enabled: boolean; slots: TimeSlot[]; }
type Schedule = Record<DayKey, DaySchedule>;

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

function calcHours(slots: TimeSlot[]): number {
  return slots.reduce((acc, s) => {
    const [sh, sm] = s.start.split(':').map(Number);
    const [eh, em] = s.end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return acc + (diff > 0 ? diff / 60 : 0);
  }, 0);
}

// Default blank schedule
function defaultSchedule(): Schedule {
  return DAYS.reduce((acc, d) => {
    acc[d] = { enabled: false, slots: [{ start: '09:00', end: '17:00' }] };
    return acc;
  }, {} as Schedule);
}

// Build a calendar grid for a given year/month
function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const BUFFER_OPTIONS = [0,5,10,15,20,30,45,60];
const WINDOW_OPTIONS = [7,14,21,30,60,90];
const NOTICE_OPTIONS = [1,2,4,6,8,12,24,48];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreatorOnboardingStep5() {
  const router = useRouter();

  const [fetchingData, setFetchingData] = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');

  // Schedule state
  const [schedule, setSchedule]         = useState<Schedule>(defaultSchedule());
  const [bufferMinutes, setBuffer]      = useState(15);
  const [timezone, setTimezone]         = useState('Asia/Karachi');
  const [bookingWindowDays, setWindow]  = useState(30);
  const [minNoticeHours, setNotice]     = useState(4);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // Calendar UI state
  const today = new Date();
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // ── Load saved data on mount ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/creator-onboarding/step-5', { cache: 'no-store' });
        if (res.ok) {
          const { availability } = await res.json();
          if (availability) {
            // Merge saved schedule with defaults (guards against missing days)
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
            setTimezone(availability.timezone ?? 'Asia/Karachi');
            setWindow(availability.bookingWindowDays ?? 30);
            setNotice(availability.minNoticeHours ?? 4);
            setBlockedDates(availability.blockedDates ?? []);
          }
        }
      } finally { setFetchingData(false); }
    })();
  }, []);

  // ── Schedule helpers ──────────────────────────────────────────────────────
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

  const removeSlot = (day: DayKey, idx: number) =>
    setSchedule(s => {
      const slots = s[day].slots.filter((_, i) => i !== idx);
      return { ...s, [day]: { ...s[day], slots: slots.length ? slots : [{ start: '09:00', end: '17:00' }] } };
    });

  // Copy first enabled day's slots to all weekdays
  const copyToWeekdays = () => {
    const source = DAYS.find(d => schedule[d].enabled);
    if (!source) return;
    const slots = schedule[source].slots;
    setSchedule(s => {
      const next = { ...s };
      (['monday','tuesday','wednesday','thursday','friday'] as DayKey[]).forEach(d => {
        next[d] = { enabled: true, slots: slots.map(sl => ({ ...sl })) };
      });
      return next;
    });
  };

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const toggleBlockedDate = (dateStr: string) =>
    setBlockedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  // ── Summary calculations ──────────────────────────────────────────────────
  const totalHours = DAYS.reduce((acc, d) =>
    acc + (schedule[d].enabled ? calcHours(schedule[d].slots) : 0), 0
  );
  const enabledDays = DAYS.filter(d => schedule[d].enabled).length;

  // ── Continue ──────────────────────────────────────────────────────────────
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
        body: JSON.stringify({ schedule, bufferMinutes, timezone, bookingWindowDays, minNoticeHours, blockedDates }),
      });
      const data = await res.json();
      if (data.success) router.push('/creator-onboarding/step-6');
      else { setError(data.error || 'Failed to save. Try again.'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const { firstDay, daysInMonth } = buildCalendar(calYear, calMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  if (fetchingData) return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
      <p className="text-[#C8A97E] font-serif text-lg animate-pulse">Loading availability…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0C0C0C]">

      {/* Progress */}
      <div className="border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            <StepItem num={1} label="Welcome"      status="completed" />
            <div className="flex-1 h-px bg-[#C8A97E] mx-1 sm:mx-2" />
            <StepItem num={2} label="Profile"      status="completed" />
            <div className="flex-1 h-px bg-[#C8A97E] mx-1 sm:mx-2" />
            <StepItem num={3} label="Sessions"     status="completed" />
            <div className="flex-1 h-px bg-[#C8A97E] mx-1 sm:mx-2" />
            <StepItem num={4} label="Pricing"      status="completed" />
            <div className="flex-1 h-px bg-[#C8A97E] mx-1 sm:mx-2" />
            <StepItem num={5} label="Availability" status="active" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={6} label="Verification" status="upcoming" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={7} label="Go Live"      status="upcoming" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">

        {/* Heading */}
        <div className="mb-8 sm:mb-10">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#C8A97E] mb-2">
            When are you available?
          </h1>
          <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm opacity-70">
            Set your weekly schedule. You can change this anytime.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="font-sans text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">

          {/* ── Left: Weekly schedule + blocked dates ── */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">

            {/* Weekly Schedule card */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h3 className="font-serif text-sm sm:text-base font-semibold text-[#F9F6F2]">
                  Weekly Schedule <span className="text-red-400 text-xs">*</span>
                </h3>
                <button
                  onClick={copyToWeekdays}
                  className="text-[#C8A97E] text-xs font-sans flex items-center gap-1.5 hover:opacity-80 transition-opacity border border-[rgba(200,169,126,0.3)] px-3 py-1.5 rounded-full"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M16 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2"/>
                  </svg>
                  Copy to weekdays
                </button>
              </div>

              <div className="space-y-2">
                {DAYS.map(day => {
                  const ds = schedule[day];
                  const hours = ds.enabled ? calcHours(ds.slots) : 0;
                  return (
                    <div key={day} className={`rounded-lg border transition-all ${ds.enabled ? 'border-[rgba(200,169,126,0.3)] bg-[#1a1a1a]' : 'border-[rgba(200,169,126,0.08)] bg-[#141414]'}`}>
                      {/* Day header row */}
                      <div className="px-3 sm:px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Toggle */}
                          <button
                            onClick={() => toggleDay(day)}
                            className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${ds.enabled ? 'bg-[#C8A97E]' : 'bg-[#2a2a2a] border border-[rgba(255,255,255,0.1)]'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${ds.enabled ? 'left-6' : 'left-1'}`} />
                          </button>
                          <span className={`font-serif text-sm sm:text-base font-medium ${ds.enabled ? 'text-[#F9F6F2]' : 'text-[#F9F6F2] opacity-40'}`}>
                            {DAY_LABELS[day]}
                          </span>
                        </div>
                        {ds.enabled && (
                          <span className="font-sans text-xs text-[#C8A97E] opacity-70">
                            {hours.toFixed(1)}h
                          </span>
                        )}
                      </div>

                      {/* Time slots (only if enabled) */}
                      {ds.enabled && (
                        <div className="px-3 sm:px-4 pb-3 space-y-3">
                          {ds.slots.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-3 w-full">
                              {/* Start time */}
                              <CustomSelect
                                value={slot.start}
                                options={TIME_OPTIONS.map(t => ({ value: t, label: formatTime(t) }))}
                                onChange={(val) => updateSlot(day, idx, 'start', val)}
                                buttonBg="#0C0C0C"
                                textSize="text-sm"
                                iconColor="#C8A97E"
                                buttonClassName="rounded-lg px-4 py-3"
                              />
                              <span className="font-sans text-[#F9F6F2] text-sm opacity-70 flex-shrink-0">to</span>
                              {/* End time */}
                              <CustomSelect
                                value={slot.end}
                                options={TIME_OPTIONS.filter(t => t > slot.start).map(t => ({ value: t, label: formatTime(t) }))}
                                onChange={(val) => updateSlot(day, idx, 'end', val)}
                                buttonBg="#0C0C0C"
                                textSize="text-sm"
                                iconColor="#C8A97E"
                                buttonClassName="rounded-lg px-4 py-3"
                              />
                              {/* Remove slot (only if more than 1) */}
                              {ds.slots.length > 1 && (
                                <button
                                  onClick={() => removeSlot(day, idx)}
                                  className="flex-shrink-0 text-[#F9F6F2] opacity-40 hover:opacity-80 hover:text-red-400 transition-all ml-2"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                          {/* Add time block button */}
                          <button
                            onClick={() => addSlot(day)}
                            className="w-full flex items-center justify-center gap-2 text-[#C8A97E] text-sm font-sans py-3 hover:opacity-80 transition-opacity border border-dashed border-[rgba(200,169,126,0.3)] rounded-xl mt-2"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                             Add time block
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blocked Dates Calendar */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-6">
              <h3 className="font-serif text-sm sm:text-base font-semibold text-[#C8A97E] mb-1">Blocked Dates</h3>
              <p className="font-sans text-[#F9F6F2] text-xs opacity-60 mb-4">Click a date to block it. Blocked dates will not be bookable.</p>

              {/* Calendar */}
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.1)] rounded-xl p-4 sm:p-5">
                {/* Month nav */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevMonth} className="w-9 h-9 rounded-lg border border-[rgba(200,169,126,0.3)] text-[#C8A97E] flex items-center justify-center hover:bg-[rgba(200,169,126,0.1)] transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <span className="font-serif text-sm sm:text-base font-semibold text-[#F9F6F2]">
                    {MONTH_NAMES[calMonth]} {calYear}
                  </span>
                  <button onClick={nextMonth} className="w-9 h-9 rounded-lg border border-[rgba(200,169,126,0.3)] text-[#C8A97E] flex items-center justify-center hover:bg-[rgba(200,169,126,0.1)] transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
                  </button>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <span key={d} className="font-sans text-[#F9F6F2] text-xs opacity-50 text-center py-1">{d}</span>
                  ))}
                </div>

                {/* Date grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Leading empty cells */}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                  {/* Dates */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const date = i + 1;
                    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(date).padStart(2,'0')}`;
                    const isBlocked = blockedDates.includes(dateStr);
                    const isPast    = dateStr < todayStr;
                    const isToday   = dateStr === todayStr;
                    return (
                      <button
                        key={date}
                        onClick={() => !isPast && toggleBlockedDate(dateStr)}
                        disabled={isPast}
                        className={`aspect-square flex items-center justify-center font-sans text-xs sm:text-sm rounded-lg transition-all
                          ${isPast    ? 'text-[#F9F6F2] opacity-20 cursor-not-allowed' :
                            isBlocked ? 'bg-red-500/20 border border-red-500/60 text-red-400 font-semibold' :
                            isToday   ? 'bg-[rgba(200,169,126,0.2)] border border-[#C8A97E] text-[#C8A97E] font-semibold' :
                                        'bg-[#141414] text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)] hover:text-[#C8A97E]'}`}
                      >
                        {date}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[rgba(200,169,126,0.2)] border border-[#C8A97E]" />
                    <span className="text-[#F9F6F2] text-xs opacity-60">Today</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/60" />
                    <span className="text-[#F9F6F2] text-xs opacity-60">Blocked</span>
                  </div>
                  {blockedDates.length > 0 && (
                    <button onClick={() => setBlockedDates([])} className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors">
                      Clear all blocks
                    </button>
                  )}
                </div>
              </div>

              {blockedDates.length > 0 && (
                <p className="font-sans text-xs text-[#C8A97E] mt-3 opacity-70">
                  {blockedDates.length} date{blockedDates.length > 1 ? 's' : ''} blocked
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="space-y-4 sm:space-y-5">

            {/* Booking Settings */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-5">
              <h3 className="font-serif text-sm font-semibold text-[#F9F6F2] mb-4">Booking Settings</h3>
              <div className="space-y-4">
                <CustomSelect
                  label="Buffer between bookings"
                  value={String(bufferMinutes)}
                  options={BUFFER_OPTIONS.map(v => ({ 
                    value: String(v), 
                    label: v === 0 ? 'No buffer' : `${v} minutes` 
                  }))}
                  onChange={(val) => setBuffer(Number(val))}
                  buttonBg="#0C0C0C"
                  textSize="text-xs"
                  iconColor="#F9F6F2"
                  buttonClassName="rounded-lg"
                />
                <CustomSelect
                  label="Time zone"
                  value={timezone}
                  options={[
                    { value: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT)' },
                    { value: 'UTC', label: 'UTC' },
                    { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
                    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
                    { value: 'America/New_York', label: 'Eastern Time (ET)' }
                  ]}
                  onChange={setTimezone}
                  buttonBg="#0C0C0C"
                  textSize="text-xs"
                  iconColor="#F9F6F2"
                  buttonClassName="rounded-lg"
                />
              </div>
            </div>

            {/* Booking Window */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-5">
              <h3 className="font-serif text-sm font-semibold text-[#F9F6F2] mb-4">Booking Window</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">Followers can book up to</label>
                  <div className="flex items-center gap-2">
                    <CustomSelect
                      value={String(bookingWindowDays)}
                      options={WINDOW_OPTIONS.map(v => ({ value: String(v), label: String(v) }))}
                      onChange={(val) => setWindow(Number(val))}
                      buttonBg="#0C0C0C"
                      textSize="text-xs"
                      iconColor="#F9F6F2"
                      buttonClassName="rounded-lg"
                    />
                    <span className="font-sans text-[#F9F6F2] text-xs opacity-60">days ahead</span>
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">Minimum notice required</label>
                  <div className="flex items-center gap-2">
                    <CustomSelect
                      value={String(minNoticeHours)}
                      options={NOTICE_OPTIONS.map(v => ({ value: String(v), label: String(v) }))}
                      onChange={(val) => setNotice(Number(val))}
                      buttonBg="#0C0C0C"
                      textSize="text-xs"
                      iconColor="#F9F6F2"
                      buttonClassName="rounded-lg"
                    />
                    <span className="font-sans text-[#F9F6F2] text-xs opacity-60">hours before</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Summary */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-4 sm:p-5 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center mx-auto mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="sm:w-5 sm:h-5">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              {enabledDays > 0 ? (
                <>
                  <h4 className="font-serif text-base sm:text-lg font-semibold text-[#F9F6F2] mb-1">You're available</h4>
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-[#C8A97E] mb-0.5">
                    {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}h
                  </p>
                  <p className="font-sans text-[#F9F6F2] text-xs opacity-60">per week</p>
                  <p className="font-sans text-[#F9F6F2] text-xs opacity-50 mt-2">
                    {enabledDays} day{enabledDays > 1 ? 's' : ''} enabled
                  </p>
                </>
              ) : (
                <>
                  <h4 className="font-serif text-base font-semibold text-[#F9F6F2] opacity-60 mb-1">No days enabled</h4>
                  <p className="font-sans text-[#F9F6F2] text-xs opacity-50">Toggle at least one day to continue</p>
                </>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-5">
              <h3 className="font-serif text-xs font-semibold text-[#F9F6F2] mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const next = defaultSchedule();
                    (['monday','tuesday','wednesday','thursday','friday'] as DayKey[]).forEach(d => {
                      next[d] = { enabled: true, slots: [{ start: '09:00', end: '17:00' }] };
                    });
                    setSchedule(next);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-[#0C0C0C] text-[#C8A97E] text-xs font-sans hover:bg-[rgba(200,169,126,0.1)] transition-all"
                >
                  ✦ Set Mon–Fri 9AM–5PM
                </button>
                <button
                  onClick={() => {
                    const next = defaultSchedule();
                    DAYS.forEach(d => { next[d] = { enabled: true, slots: [{ start: '10:00', end: '18:00' }] }; });
                    setSchedule(next);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-[#0C0C0C] text-[#C8A97E] text-xs font-sans hover:bg-[rgba(200,169,126,0.1)] transition-all"
                >
                  ✦ Set all days 10AM–6PM
                </button>
                <button
                  onClick={() => setSchedule(defaultSchedule())}
                  className="w-full text-left px-3 py-2 rounded-lg bg-[#0C0C0C] text-[#F9F6F2] text-xs font-sans opacity-50 hover:opacity-80 transition-all"
                >
                  ✕ Clear all
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/creator-onboarding/step-4')}
            className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm hover:border-[#C8A97E] transition-all flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={saving || enabledDays === 0}
            className={`flex-1 font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm transition-all flex items-center justify-center gap-2 ${
              enabledDays > 0 && !saving
                ? 'bg-[#C8A97E] text-[#0C0C0C] hover:opacity-90'
                : 'bg-[rgba(200,169,126,0.2)] text-[rgba(0,0,0,0.4)] cursor-not-allowed'
            }`}
          >
            {saving ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving…</>
            ) : 'Continue'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── StepItem ──────────────────────────────────────────────────────────────────
function StepItem({ num, label, status }: { num: number; label: string; status: 'completed' | 'active' | 'upcoming' }) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2 min-w-[60px] sm:min-w-[80px]">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-serif text-sm sm:text-base font-semibold transition-all ${
        status === 'completed' ? 'bg-[#141414] text-[#C8A97E] border border-[#C8A97E]'
        : status === 'active'  ? 'bg-[#C8A97E] text-[#0C0C0C]'
        :                        'bg-[#141414] text-[#F9F6F2] border border-[rgba(200,169,126,0.3)] opacity-60'
      }`}>
        {status === 'completed'
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          : num}
      </div>
      <span className={`text-[10px] sm:text-xs font-sans font-medium text-center ${
        status === 'completed' || status === 'active' ? 'text-[#C8A97E]' : 'text-[#F9F6F2] opacity-60'
      }`}>
        {label}
      </span>
    </div>
  );
}
