'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreatorNavbar from '@/components/CreatorNavbar';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Checklist {
  profile:      boolean;
  sessions:     boolean;
  pricing:      boolean;
  availability: boolean;
  payment:      boolean;
}

interface SessionType {
  _id:         string;
  title:       string;
  duration:    number;
  price:       number;
  description: string;
}

interface AvailabilityDay {
  enabled: boolean;
  slots:   { start: string; end: string }[];
}

interface PageData {
  profile: {
    displayName:  string;
    username:     string;
    profilePhoto: string;
    coverPhoto:   string;
    shortBio:     string;
    city:         string;
    country:      string;
    languages:    string[];
    niches:       string[];
  } | null;
  sessionTypes:   SessionType[];
  availability: {
    schedule: Record<string, AvailabilityDay>;
  } | null;
  checklist:  Checklist;
  allComplete: boolean;
}

const CHECKLIST_LABELS: { key: keyof Checklist; label: string; step: string }[] = [
  { key: 'profile',      label: 'Profile Setup',    step: '/creator-onboarding/step-2' },
  { key: 'sessions',     label: 'Session Types',    step: '/creator-onboarding/step-3' },
  { key: 'pricing',      label: 'Pricing',          step: '/creator-onboarding/step-4' },
  { key: 'availability', label: 'Availability',     step: '/creator-onboarding/step-5' },
  { key: 'payment',      label: 'Payout Setup',     step: '/creator-onboarding/step-6' },
];

const DAY_ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getNext7Days(schedule: Record<string, AvailabilityDay> | undefined) {
  const result: { label: string; date: string; enabled: boolean }[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][d.getDay()];
    const enabled = schedule?.[dayKey]?.enabled ?? false;
    result.push({
      label: dayKey.charAt(0).toUpperCase() + dayKey.slice(1, 3),
      date:  `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
      enabled,
    });
  }
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreatorOnboardingStep7() {
  const router = useRouter();

  const [fetchingData, setFetchingData] = useState(true);
  const [data, setData]                 = useState<PageData | null>(null);
  const [isActive, setIsActive]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState('');
  const [copied, setCopied]             = useState(false);

  // ── Load all data on mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/creator-onboarding/step-7', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } finally {
        setFetchingData(false);
      }
    })();
  }, []);

  // ── Booking link ──────────────────────────────────────────────────────────
  const username = data?.profile?.username || '';
  const bookingLink = `https://reachly.pk/${username}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const el = document.createElement('input');
      el.value = bookingLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Go Live / Save Draft ──────────────────────────────────────────────────
  const handleGoLive = async (activate: boolean) => {
    setSaving(true); setSaveError('');
    try {
      const res = await fetch('/api/creator-onboarding/step-7', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate }),
      });
      const json = await res.json();
      if (json.success) {
        router.push('/welcome');
      } else {
        setSaveError(json.error || 'Something went wrong. Please try again.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const next7Days  = getNext7Days(data?.availability?.schedule);
  const checklist  = data?.checklist;
  const allDone    = data?.allComplete ?? false;
  const profile    = data?.profile;
  const sessions   = data?.sessionTypes ?? [];

  const profileImgSrc = profile?.profilePhoto || '/Group 2085668106.png';
  const displayName   = profile?.displayName  || 'Your Name';
  const handle        = profile?.username ? `@${profile.username}` : '@yourhandle';
  const location      = [profile?.city, profile?.country].filter(Boolean).join(', ') || 'Pakistan';
  const languages     = profile?.languages?.join(', ') || '—';
  const niche         = profile?.niches?.[0] || '';

  if (fetchingData) return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
      <p className="text-[#C8A97E] font-serif text-lg animate-pulse">Preparing your profile…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <CreatorNavbar />

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
            <StepItem num={5} label="Availability" status="completed" />
            <div className="flex-1 h-px bg-[#C8A97E] mx-1 sm:mx-2" />
            <StepItem num={6} label="Verification" status="completed" />
            <div className="flex-1 h-px bg-[#C8A97E] mx-1 sm:mx-2" />
            <StepItem num={7} label="Go Live"      status="active" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#C8A97E] mb-2 sm:mb-3">
            You're ready to go live
          </h1>
          <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm opacity-70">
            Review your profile below, then activate to start accepting bookings.
          </p>
        </div>

        {/* Save error */}
        {saveError && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
            <p className="font-sans text-sm text-red-300">{saveError}</p>
          </div>
        )}

        {/* ── Profile Preview Card ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-5 mb-5">
          <div className="flex items-start justify-between gap-4">
            {/* Left: photo + info */}
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              {/* Profile photo — square rounded, same style as reference */}
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#0C0C0C] border border-[rgba(200,169,126,0.1)] flex-shrink-0">
                <img
                  src={profileImgSrc}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = '/Group 2085668106.png'; }}
                />
              </div>

              {/* Info */}
              <div className="min-w-0 pt-1">
                <h2 className="font-serif text-lg sm:text-2xl font-semibold text-[#F9F6F2] mb-0.5 leading-tight">
                  {displayName}
                </h2>
                <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm opacity-50 mb-2">{handle}</p>

                {/* Location + languages */}
                <div className="flex flex-wrap items-center gap-3 mb-2 sm:mb-3">
                  {location && (
                    <div className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="1.5" className="opacity-50 flex-shrink-0">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="font-sans text-[#F9F6F2] text-xs opacity-60">{location}</span>
                    </div>
                  )}
                  {languages && languages !== '—' && (
                    <div className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="1.5" className="opacity-50 flex-shrink-0">
                        <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <span className="font-sans text-[#F9F6F2] text-xs opacity-60">{languages}</span>
                    </div>
                  )}
                </div>

                {/* Niches as pills */}
                {profile?.niches && profile.niches.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.niches.map(n => (
                      <span key={n} className="bg-[rgba(200,169,126,0.12)] text-[#C8A97E] px-2.5 py-1 rounded-full font-sans text-xs">
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Book a Session button */}
            <button className="flex-shrink-0 bg-[#C8A97E] text-[#0C0C0C] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-sans text-xs font-semibold hover:opacity-90 transition-all whitespace-nowrap">
              Book a Session
            </button>
          </div>
        </div>

        {/* ── Session Types Preview ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-sm sm:text-base font-semibold text-[#F9F6F2]">
              Session Types ({sessions.length})
            </h3>
            <button
              onClick={() => router.push('/creator-onboarding/step-3')}
              className="text-[#C8A97E] text-xs font-sans opacity-70 hover:opacity-100 transition-opacity"
            >
              Edit →
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="flex items-center gap-3 p-3 bg-[#0C0C0C] rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              <p className="font-sans text-[#F9F6F2] text-xs opacity-60">No session types added yet.</p>
              <button onClick={() => router.push('/creator-onboarding/step-3')} className="ml-auto text-xs text-[#C8A97E] font-semibold">Add now</button>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s._id} className="flex items-center justify-between bg-[#0C0C0C] border border-[rgba(200,169,126,0.1)] rounded-lg px-3 sm:px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-serif text-xs sm:text-sm font-semibold text-[#C8A97E]">{s.title}</p>
                      <p className="font-sans text-[#F9F6F2] text-xs opacity-50 line-clamp-1">{s.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="font-sans text-[#F9F6F2] text-xs opacity-50">{s.duration} min</span>
                    <span className="font-serif text-[#C8A97E] text-xs sm:text-sm font-semibold">PKR {Number(s.price).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Next 7 Days Availability ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans text-[#F9F6F2] text-xs sm:text-sm font-semibold opacity-70">
              Next 7 days
            </h3>
            <button
              onClick={() => router.push('/creator-onboarding/step-5')}
              className="text-[#C8A97E] text-xs font-sans opacity-70 hover:opacity-100 transition-opacity"
            >
              Edit →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {next7Days.map((day, i) => (
              <div
                key={i}
                className={`rounded-lg p-2 sm:p-3 text-center border transition-all ${
                  day.enabled
                    ? 'bg-[#0C0C0C] border-[#C8A97E]'
                    : 'bg-[#0C0C0C] border-[rgba(200,169,126,0.1)] opacity-40'
                }`}
              >
                <p className={`font-serif text-xs font-semibold ${day.enabled ? 'text-[#C8A97E]' : 'text-[#F9F6F2]'}`}>
                  {day.label}
                </p>
                <p className={`font-sans text-[10px] mt-0.5 ${day.enabled ? 'text-[#C8A97E] opacity-70' : 'text-[#F9F6F2] opacity-40'}`}>
                  {day.date}
                </p>
                {day.enabled && (
                  <div className="w-1.5 h-1.5 bg-[#C8A97E] rounded-full mx-auto mt-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Completion Checklist ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm font-semibold opacity-70">
              Completion Checklist
            </p>
           <span className={`text-xs font-sans px-2.5 py-1 rounded-full bg-[rgba(200,169,126,0.12)] text-[#C8A97E]`}>
  {CHECKLIST_LABELS.filter(c => checklist?.[c.key]).length} / {CHECKLIST_LABELS.length} complete
</span>
          </div>
          <div className="space-y-2.5">
            {CHECKLIST_LABELS.map(item => {
              const done = checklist?.[item.key] ?? false;
              return (
                <div key={item.key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-[rgba(200,169,126,0.15)] border border-[#C8A97E]' : 'border border-[rgba(255,255,255,0.15)]'}`}>
                      {done
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="2" opacity="0.3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      }
                    </div>
                    <span className={`font-sans text-xs sm:text-sm ${done ? 'text-[#F9F6F2]' : 'text-[#F9F6F2] opacity-40'}`}>
                      {item.label}
                    </span>
                  </div>
                  {!done && (
                    <button
                      onClick={() => router.push(item.step)}
                      className="text-[#C8A97E] text-xs font-sans flex-shrink-0 hover:underline"
                    >
                      Complete →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Activate Toggle ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-5 mb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </div>
              <div>
                <p className="font-serif text-sm font-semibold text-[#F9F6F2]">Activate my profile</p>
                <p className="font-sans text-[#F9F6F2] text-xs opacity-60">
                  {isActive ? 'Your profile will go live immediately.' : 'Save as draft — activate later from dashboard.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              disabled={!allDone}
              title={!allDone ? 'Complete all steps first' : ''}
              className={`relative flex-shrink-0 w-14 h-7 rounded-full transition-all duration-300 ${isActive ? 'bg-[#C8A97E]' : 'bg-[#2a2a2a] border border-[rgba(200,169,126,0.3)]'} ${!allDone ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${isActive ? 'left-8' : 'left-1'}`} />
            </button>
          </div>
          {!allDone && (
            <p className="font-sans text-[#C8A97E] text-xs opacity-60 mt-3 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              Complete all checklist items to activate your profile.
            </p>
          )}
        </div>

        {/* ── Booking Link ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-5 mb-5">
          <h3 className="font-serif text-base sm:text-xl font-semibold text-[#C8A97E] mb-3">Your Booking Link</h3>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-[#0C0C0C] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 font-sans text-xs sm:text-sm text-[#F9F6F2] opacity-70 flex items-center gap-2 min-w-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="flex-shrink-0">
                <path d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.1-1.101m-.757-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="truncate">{bookingLink}</span>
            </div>
            <button
  onClick={handleCopyLink}
  className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-sans text-xs font-semibold flex items-center gap-1.5 transition-all ${
    copied
      ? 'bg-[rgba(200,169,126,0.22)] border border-[rgba(200,169,126,0.6)] text-[#C8A97E]'
      : 'bg-[rgba(200,169,126,0.12)] border border-[rgba(200,169,126,0.3)] text-[#C8A97E] hover:bg-[rgba(200,169,126,0.2)]'
  }`}
>
  {copied ? (
    <>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Copied!
    </>
  ) : (
    <>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      Copy
    </>
  )}
</button>
          </div>
          {/* Share icons */}
          <div className="flex items-center gap-3">
            <span className="font-sans text-[#F9F6F2] text-xs opacity-60">Share on:</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bookingLink)}`}
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-[#0C0C0C] border border-[rgba(200,169,126,0.1)] flex items-center justify-center hover:border-[#C8A97E] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#F9F6F2">
                <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
              </svg>
            </a>
            <a
              href={`https://www.instagram.com/`}
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-[#0C0C0C] border border-[rgba(200,169,126,0.1)] flex items-center justify-center hover:border-[#C8A97E] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#F9F6F2" stroke="none" />
              </svg>
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Book a session with me on Reachly: ${bookingLink}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-[#0C0C0C] border border-[rgba(200,169,126,0.1)] flex items-center justify-center hover:border-[#C8A97E] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#F9F6F2">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ── Pro Tip ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-4 sm:p-5 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 18h6M10 21h4" stroke="#C8A97E" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M8.5 14.5C7.2 13.4 6.5 11.8 6.5 10a5.5 5.5 0 0 1 11 0c0 1.8-.7 3.4-2 4.5-.7.6-1 1.3-1.2 2H9.7c-.2-.7-.6-1.4-1.2-2z" stroke="#C8A97E" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M12 2v2" stroke="#C8A97E" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-serif text-base sm:text-lg font-semibold text-[#C8A97E] mb-1">Pro tip</h4>
              <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm opacity-60 leading-5">
                Add your booking link to your Instagram bio right after going live. Creators who post on Day 1 see <strong className="text-[#C8A97E]">5× more bookings</strong> in their first week.
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA Buttons ── */}
        <div className="space-y-3">
          <button
            onClick={() => handleGoLive(isActive)}
            disabled={saving}
            className={`w-full font-serif font-semibold py-3 sm:py-4 px-8 rounded-full text-sm transition-all flex items-center justify-center gap-2 ${
              isActive && allDone
                ? 'bg-[#C8A97E] text-[#0C0C0C] hover:opacity-90'
                : 'bg-[rgba(200,169,126,0.08)] border border-[rgba(200,169,126,0.3)] text-[#C8A97E] hover:border-[#C8A97E]'
            } disabled:opacity-50`}
          >
            {saving ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving…</>
            ) : isActive && allDone ? (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>Go Live Now</>
            ) : (
              'Save as Draft & Go to Dashboard'
            )}
          </button>

          {isActive && allDone && (
            <button
              onClick={() => handleGoLive(false)}
              disabled={saving}
              className="w-full bg-transparent border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] font-serif font-semibold py-3 sm:py-4 px-8 rounded-full text-sm opacity-60 hover:opacity-80 transition-all disabled:opacity-30"
            >
              Save as Draft Instead
            </button>
          )}
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
      }`}>{label}</span>
    </div>
  );
}
