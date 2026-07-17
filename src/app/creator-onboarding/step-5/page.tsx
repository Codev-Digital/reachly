'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useOnboardingCleanup } from '@/hooks/useOnboardingCleanup';

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

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({
  profile,
  sessions,
  availability,
  onClose,
}: {
  profile: CreatorProfile | null;
  sessions: Session[];
  availability: any;
  onClose: () => void;
}) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#F7F7FA] rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col">

        {/* ── Header: Cover + Avatar + Close ── */}
        <div className="relative flex-shrink-0">
          {/* Cover strip */}
          <div className="h-36 w-full rounded-t-3xl overflow-hidden bg-gradient-to-br from-[#0012FF] via-blue-600 to-indigo-800">
            {profile?.coverPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all flex items-center justify-center shadow-md"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Preview badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-black/40 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
              Profile Preview
            </span>
          </div>

          {/* Avatar */}
          <div className="absolute left-5 bottom-0 translate-y-1/2">
            <div className="w-20 h-20 rounded-2xl border-[3px] border-white bg-gray-100 overflow-hidden shadow-xl">
              {profile?.profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#EEF2FF]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B7AFF" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="5" /><path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Name / Meta block ── */}
        <div className="pt-14 px-5 pb-4 bg-white mx-3 mt-3 rounded-2xl shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h2 className="font-anton text-xl text-black leading-tight">
                {profile?.displayName || 'Your Name'}
              </h2>
              <p className="text-gray-400 text-xs font-sans mt-0.5">@{profile?.username || 'username'}</p>
            </div>
            {/* Niche pill */}
            {profile?.niches?.[0] && (
              <span className="bg-[#EEF2FF] text-[#0012FF] text-[11px] font-semibold px-3 py-1 rounded-full border border-[#0012FF]/20 flex-shrink-0 mt-1">
                {profile.niches[0]}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 font-sans">
            {profile?.city && (
              <div className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                {profile.city}{profile.country ? `, ${profile.country}` : ''}
              </div>
            )}
            {(profile?.languages?.length ?? 0) > 0 && (
              <div className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {profile?.languages?.join(' · ')}
              </div>
            )}
          </div>

          {/* Bio */}
          {profile?.shortBio && (
            <p className="text-xs text-gray-600 leading-relaxed font-sans mt-3 pt-3 border-t border-gray-100">
              {profile.shortBio}
            </p>
          )}

          {/* Social Links */}
          {profile?.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
              {profile.socialLinks.instagram && (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-gradient-to-r from-pink-500 to-orange-400 px-2.5 py-1 rounded-lg">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
                  @{profile.socialLinks.instagram}
                </span>
              )}
              {profile.socialLinks.youtube && (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-red-500 px-2.5 py-1 rounded-lg">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                  {profile.socialLinks.youtube}
                </span>
              )}
              {profile.socialLinks.linkedin && (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#0077B5] px-2.5 py-1 rounded-lg">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg>
                  {profile.socialLinks.linkedin}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Sessions ── */}
        {sessions.length > 0 && (
          <div className="px-3 mt-3">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sessions Offered</h3>
              <div className="space-y-2">
                {sessions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 bg-[#F7F7FA] rounded-xl p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-black font-sans truncate">{s.title}</p>
                      <p className="text-[11px] text-gray-400 font-sans mt-0.5">{s.duration} min{s.description ? ` · ${s.description.slice(0, 50)}${s.description.length > 50 ? '…' : ''}` : ''}</p>
                      {s.features?.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {s.features.slice(0, 3).map((f, fi) => (
                            <span key={fi} className="text-[10px] bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5">{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[#0012FF] font-bold text-sm font-sans">Rs {s.price}</p>
                      <p className="text-[10px] text-gray-400">/ session</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Availability ── */}
        <div className="px-3 mt-3 mb-3">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Weekly Availability</h3>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const isEnabled = availability?.schedule?.[day.toLowerCase()]?.enabled ?? false;
                const slots = availability?.schedule?.[day.toLowerCase()]?.slots;
                return (
                  <div
                    key={day}
                    className={`rounded-xl p-2 text-center transition-all ${isEnabled ? 'bg-[#EEF2FF]' : 'bg-gray-50'}`}
                  >
                    <p className={`text-[10px] font-bold font-sans ${isEnabled ? 'text-[#0012FF]' : 'text-gray-300'}`}>
                      {day.slice(0, 3)}
                    </p>
                    {isEnabled && slots?.[0] && (
                      <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{slots[0].start}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-3 pb-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-[#0012FF] text-white text-sm font-semibold py-3 rounded-2xl hover:bg-[#0012FF]/90 transition-all"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}



// ─── Component ────────────────────────────────────────────────────────────────
export default function CreatorOnboardingStep5() {
  const router = useRouter();
  useOnboardingCleanup();

  const [fetchingData, setFetchingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [availability, setAvailability] = useState<any>(null);

  // ── Load saved data on mount ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [profileRes, sessionsRes, availabilityRes] = await Promise.all([
        fetch('/api/creator-onboarding/step-2', { cache: 'no-store' }),
        fetch('/api/creator-onboarding/step-3', { cache: 'no-store' }),
        fetch('/api/creator-onboarding/step-5', { cache: 'no-store' }),
      ]);
      if (profileRes.ok) { const d = await profileRes.json(); setProfile(d.profile); }
      if (sessionsRes.ok) { const d = await sessionsRes.json(); setSessions(d.sessionTypes || []); }
      if (availabilityRes.ok) { const d = await availabilityRes.json(); setAvailability(d.availability); }
    } finally {
      setFetchingData(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save as Draft (no status change, just mark onboardingStep) ─────────────
  const handleSaveAsDraft = async () => {
    setSavingDraft(true);
    setError('');
    try {
      // Call step-6 API with activate: false to save state without sending to admin
      const res = await fetch('/api/creator-onboarding/step-6', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }), // draft only
      });
      const data = await res.json();
      if (data.success) {
        setDraftSaved(true);
        setShowSuccessModal(true);
      } else {
        setError(data.error || 'Failed to save draft. Try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSavingDraft(false);
    }
  };

  // ── Handle go live (submit to admin review) ─────────────────────────────────
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
      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          profile={profile}
          sessions={sessions}
          availability={availability}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Draft Saved Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            {/* Blue header strip */}
            <div className="bg-[#0012FF] px-6 pt-8 pb-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-bold font-sans mb-1">Draft Saved</h3>
              <p className="text-white/70 text-xs font-sans">Your progress has been saved successfully</p>
            </div>
            {/* Body */}
            <div className="px-6 py-6 text-center">
              <p className="text-gray-500 text-sm font-sans leading-relaxed mb-6">
                Come back anytime to continue and submit your profile when you&apos;re ready to go live.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#0012FF] text-white py-3 rounded-2xl text-sm font-semibold font-sans hover:bg-[#0012FF]/90 transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Heading + Preview Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="font-anton text-3xl font-bold text-black mb-2">
              You're Ready To Go <span className="text-[#0012FF]">Live</span>
            </h1>
            <p className="text-xs text-gray-400">
              Review your profile then activate to start accepting bookings
            </p>
          </div>
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 bg-[#0012FF] text-white px-5 py-2.5 rounded-full font-sans font-semibold text-xs hover:bg-[#0012FF]/90 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview Profile
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
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 0 2 2z" />
                    </svg>
                    {profile?.languages?.[0] || 'English'}
                  </div>
                </div>
                <div className="bg-[#E0E7FF] text-[#0012FF] text-xs px-3 py-1 rounded-full border border-[#0012FF]/30 inline-block font-semibold">
                  {profile?.niches?.[0] || 'Influencer'}
                </div>
              </div>
              {/* Book a Session button hidden during onboarding */}
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
                      className={`px-3 py-2 rounded-lg text-xs font-sans font-semibold transition-all ${isEnabled
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
            {/* Save as Draft — saves data only, does NOT submit to admin */}
            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={savingDraft || draftSaved}
              className={`px-5 py-2.5 rounded-full font-sans font-semibold text-sm transition-all flex items-center gap-2 border ${
                draftSaved
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'border-[#0012FF] text-[#0012FF] hover:bg-[#0012FF]/5 cursor-pointer'
              }`}
            >
              {savingDraft ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving…
                </>
              ) : draftSaved ? (
                'Saved'
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save as Draft
                </>
              )}
            </button>

            {/* Go Live — submits to admin */}
            <button
              type="button"
              onClick={handleGoLive}
              disabled={saving}
              className={`px-5 py-2.5 rounded-full font-sans font-semibold text-sm transition-all flex items-center gap-2 ${!saving
                  ? 'bg-[#0012FF] text-white hover:bg-[#0012FF]/90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4 inline" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                  Submit & Go Live
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
