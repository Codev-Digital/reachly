'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingAnimation from '@/components/LoadingAnimation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CreatorProfile {
  displayName: string;
  username: string;
  profilePhoto?: string;
  coverPhoto?: string;
  shortBio: string;
  longBio: string;
  city: string;
  country: string;
  languages: string[];
  niches: string[];
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
}

interface Session {
  title: string;
  description: string;
  duration: number;
  price: number;
  features: string[];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreatorOnboardingStep5() {
  const router = useRouter();

  const [fetchingData, setFetchingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [availability, setAvailability] = useState<any>(null);

  // ── Load saved data on mount ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        // Load profile data from step 2
        const profileRes = await fetch('/api/creator-onboarding/step-2', { cache: 'no-store' });
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data.profile);
        }

        // Load sessions data from step 3
        const sessionsRes = await fetch('/api/creator-onboarding/step-3', { cache: 'no-store' });
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.sessionTypes || []);
        }

        // Load availability data from step 5 (which is the schedule API)
        const availabilityRes = await fetch('/api/creator-onboarding/step-5', { cache: 'no-store' });
        if (availabilityRes.ok) {
          const data = await availabilityRes.json();
          setAvailability(data.availability);
        }
      } finally {
        setFetchingData(false);
      }
    })();
  }, []);

  // ── Handle go live ─────────────────────────────────────────────────────────
  const handleGoLive = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/creator-onboarding/step-6', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      const data = await res.json();
      if (data.success) router.push('/creators/pending-approval');
      else { setError(data.error || 'Failed to go live. Try again.'); }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (fetchingData) return <LoadingAnimation />;

  return (
    <div className="min-h-screen bg-[#F7F7FA]">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Image src="/assets/logo1.png" alt="Reachly Logo" width={120} height={40} className="h-10 w-auto" />
            <div className="hidden md:flex items-center gap-10">
              <button className="text-gray-400 font-sans text-sm">Explore Creators</button>
              <button className="text-gray-400 font-sans text-sm">Events</button>
              <button className="text-gray-400 font-sans text-sm">For Creators</button>
              <button className="text-gray-400 font-sans text-sm">About</button>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-[#0012FF] font-sans font-semibold text-sm">Login</button>
              <button className="bg-[#0012FF] text-white px-5 py-2.5 rounded-full font-sans font-semibold text-sm">Sign up</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
    {/* Progress Steps */}
<div className="bg-[#F7F7FA] border-b border-gray-100">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <div className="flex items-center justify-center">

      <StepItem num={1} status="completed" />
      <div className="w-24 h-[2px] bg-[#0012FF]" />

      <StepItem num={2} status="completed" />
      <div className="w-24 h-[2px] bg-[#0012FF]" />

      <StepItem num={3} status="completed" />
      <div className="w-24 h-[2px] bg-[#8B95FF]" />

      <StepItem num={4} status="active" />

    </div>
  </div>
</div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Heading + Preview Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="font-anton text-3xl font-bold text-black mb-2">
              You're Ready To Go <span className="text-[#0012FF]">Live</span>
            </h1>
            <p className="text-xs text-gray-400">
              Review you profile then activate to start accepting bookings
            </p>
          </div>
          <button className="bg-[#0012FF] text-white px-5 py-2.5 rounded-full font-sans font-semibold text-xs hover:bg-[#0012FF]/90 transition-all">
            Preview
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Preview Card */}
        <div className="bg-white border border-gray-200 rounded-xl mb-8 overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-64 bg-gradient-to-br from-blue-900 via-blue-700 to-black">
            {profile?.coverPhoto ? (
              <Image src={profile.coverPhoto} alt="Cover" fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <h2 className="text-4xl font-bold mb-2">{profile?.displayName || 'Your Name'}</h2>
                  <p className="text-white/80 border border-white/50 rounded-full px-6 py-1 text-sm inline-block">
                    {profile?.niches?.[0] || 'Your Category'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-8 relative">
            {/* Avatar */}
            <div className="relative -mt-24 mb-4">
              <div className="w-48 h-48 rounded-full border-4 border-white bg-gray-100 overflow-hidden relative">
                {profile?.profilePhoto ? (
                  <Image src={profile.profilePhoto} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                      <circle cx="12" cy="8" r="5" />
                      <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Name + Edit + Book Button */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-anton text-2xl font-bold text-black">
                    {profile?.displayName || 'Your Name'}
                  </h3>
                  <button 
                    onClick={() => router.push('/creator-onboarding/step-2')}
                    className="text-[#0012FF] font-sans text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
                  >
                    Edit
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-4 mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-sans">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <path d="M10 4a4 4 0 0 0-4 4v2c0 5-1 7-1 7h10s-1-2-1-7V8a4 4 0 0 0-4-4z" />
                      <circle cx="12" cy="13" r="2" />
                    </svg>
                    @{profile?.username || 'username'}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-sans">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {profile?.city || 'Your Location'}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-sans">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {profile?.languages?.[0] || 'English'}
                  </div>
                </div>
                <div className="bg-[#E0E7FF] text-[#0012FF] text-xs px-3 py-1 rounded-full border border-[#0012FF]/30 inline-block font-semibold">
                  {profile?.niches?.[0] || 'Influencer'}
                </div>
              </div>
              <button className="bg-[#0012FF] text-white px-5 py-2.5 rounded-full font-sans font-semibold text-xs hover:bg-[#0012FF]/90 transition-all h-fit">
                Book a Session
              </button>
            </div>

            {/* Sessions List */}
            {sessions.length > 0 && (
              <div className="mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#E0E7FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="1.5">
                        <path d="M4 4h16v16H4z" />
                        <path d="M9 12h6" />
                        <path d="M12 9v6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-sans text-sm font-semibold text-black mb-0.5">
                        {sessions[0].title}
                      </h4>
                      <p className="font-sans text-xs text-gray-500">
                        {sessions[0].duration} minute session
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#0012FF] font-sans font-semibold text-sm">
                      Rs {sessions[0].price}
                    </span>
                    <button 
                      onClick={() => router.push('/creator-onboarding/step-3')}
                      className="text-gray-400 hover:text-gray-600 transition-opacity"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Next 7 Days */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <h4 className="font-sans text-sm font-semibold text-black">
                  Next 7 Days Available
                </h4>
                <button 
                  onClick={() => router.push('/creator-onboarding/step-4')}
                  className="text-gray-400 hover:text-gray-600 transition-opacity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                  const dayKey = day.toLowerCase();
                  const isEnabled = availability?.schedule?.[dayKey]?.enabled ?? false;
                  return (
                    <div
                      key={day}
                      className={`px-3 py-2 rounded-lg text-xs font-sans font-semibold transition-all ${
                        isEnabled
                          ? 'bg-[#E0E7FF] text-[#0012FF]'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/creator-onboarding/step-4')}
            className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-full font-sans font-semibold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="border border-[#0012FF] text-[#0012FF] px-5 py-2.5 rounded-full font-sans font-semibold text-sm hover:bg-[#0012FF]/5 transition-all"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleGoLive}
              disabled={saving}
              className={`px-5 py-2.5 rounded-full font-sans font-semibold text-sm transition-all ${
                !saving
                  ? 'bg-[#0012FF] text-white hover:bg-[#0012FF]/90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
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

// ─── StepItem ──────────────────────────────────────────────────────────────────
function StepItem({ num, status }: { num: number; status: 'completed' | 'active' | 'upcoming' }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
        status === 'completed'
          ? 'bg-[#0012FF] text-white border border-[#0012FF]'
          : status === 'active'
            ? 'bg-[#E0E7FF] text-[#0012FF] border-2 border-[#0012FF]'
            : 'bg-white text-gray-400 border border-gray-200'
      }`}>
        {status === 'completed' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : num}
      </div>
    </div>
  );
}
