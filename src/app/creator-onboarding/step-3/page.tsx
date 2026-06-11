'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreatorNavbar from '@/components/CreatorNavbar';
import { updateSessionTypes } from '@/lib/auth-client';

/* ─── types ─────────────────────────────────────────────────────────────── */
interface SessionData {
  _id?: string;
  title: string;
  description: string;
  duration: number;
  price: string;
  features: string[];
  maxBookings: string;
}

const BLANK: SessionData = {
  title: '', description: '', duration: 30,
  price: '', features: [''], maxBookings: '',
};

const DURATIONS = [15, 30, 45, 60, 90];

// Simple unique id generator for local items
function generateLocalId() {
  return 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/* ─── helpers ────────────────────────────────────────────────────────────── */
function validateSession(s: SessionData): string | null {
  if (!s.title.trim())       return 'Title is required.';
  if (!s.description.trim()) return 'Description is required.';
  if (!DURATIONS.includes(s.duration)) return 'Select a valid duration.';
  if (!s.price || Number(s.price) < 1) return 'Price must be at least PKR 1.';
  return null;
}

/* ─── component ─────────────────────────────────────────────────────────── */
export default function CreatorOnboardingStep3() {
  const router = useRouter();

  const [fetchingData, setFetchingData] = useState(true);
  const [saving, setSaving]             = useState(false);
  const [pageError, setPageError]       = useState('');
  const [formError, setFormError]       = useState('');

  // List of persisted sessions shown on screen
  const [sessions, setSessions]         = useState<SessionData[]>([]);

  // The inline add/edit form
  const [showForm, setShowForm]         = useState(false);
  const [editingIdx, setEditingIdx]     = useState<number | null>(null);
  const [formData, setFormData]         = useState<SessionData>(BLANK);

  /* ── Load saved sessions on mount ───────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/creator-onboarding/step-3', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sessionTypes)) {
            setSessions(data.sessionTypes.map((s: any) => ({
              _id:         s._id,
              title:       s.title,
              description: s.description,
              duration:    s.duration,
              price:       String(s.price),
              features:    s.features?.length ? s.features : [''],
              maxBookings: s.maxBookings ? String(s.maxBookings) : '',
            })));
          }
        }
      } catch {
        /* network error — silently proceed with empty list */
      } finally {
        setFetchingData(false);
      }
    })();
  }, []);

  /* ── Form helpers ────────────────────────────────────────────────────── */
  const openNewForm = (prefill?: Partial<SessionData>) => {
    setEditingIdx(null);
    setFormData({ ...BLANK, ...prefill });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (idx: number) => {
    setEditingIdx(idx);
    setFormData({ ...sessions[idx] });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingIdx(null);
    setFormData(BLANK);
    setFormError('');
  };

  const addFeature    = () => setFormData(f => ({ ...f, features: [...f.features, ''] }));
  const removeFeature = (i: number) =>
    setFormData(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  const changeFeature = (i: number, v: string) =>
    setFormData(f => { const fs = [...f.features]; fs[i] = v; return { ...f, features: fs }; });

  /* ── Save session (local only — persisted on "Continue") ────────────── */
  const handleSaveToList = () => {
    const err = validateSession(formData);
    if (err) { setFormError(err); return; }

    const clean: SessionData = {
      ...formData,
      title:       formData.title.trim(),
      description: formData.description.trim(),
      features:    formData.features.filter(f => f.trim()),
    };

    setSessions(prev => {
      if (editingIdx !== null) {
        const next = [...prev];
        next[editingIdx] = clean;
        return next;
      }
      return [...prev, { ...clean, _id: generateLocalId() }];
    });
    closeForm();
    setPageError('');
  };

  const deleteSession = (idx: number) => setSessions(prev => prev.filter((_, i) => i !== idx));

  /* ── Continue — persist to DB ────────────────────────────────────────── */
  const handleContinue = async () => {
    if (sessions.length === 0) {
      setPageError('Add at least one session type before continuing.');
      return;
    }
    setSaving(true);
    setPageError('');
    try {
      const result = await updateSessionTypes(sessions);
      if (result.success) {
        router.push('/creator-onboarding/step-4');
      } else {
        setPageError(result.error || 'Failed to save. Please try again.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setPageError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  if (fetchingData) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <p className="text-[#C8A97E] font-serif text-lg animate-pulse">Loading your sessions…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <CreatorNavbar />

      {/* Progress bar */}
      <div className="border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            <StepItem num={1} label="Welcome"      status="completed" />
            <div className="flex-1 h-px bg-[#C8A97E] mx-1 sm:mx-2" />
            <StepItem num={2} label="Profile"      status="completed" />
            <div className="flex-1 h-px bg-[#C8A97E] mx-1 sm:mx-2" />
            <StepItem num={3} label="Sessions"     status="active" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={4} label="Pricing"      status="upcoming" />
            <div className="flex-1 h-px bg-[rgba(200,169,126,0.2)] mx-1 sm:mx-2" />
            <StepItem num={5} label="Availability" status="upcoming" />
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
            What sessions will you offer?
          </h1>
          <p className="font-sans text-[#F9F6F2] text-xs sm:text-sm opacity-70">
            Define the session types followers can book with you. You need at least 1 to continue.
          </p>
        </div>

        {/* Page-level error */}
        {pageError && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="font-sans text-sm text-red-300">{pageError}</p>
          </div>
        )}

        {/* Quick start suggestions */}
        <div className="mb-6">
          <p className="font-sans text-[#F9F6F2] text-xs font-semibold mb-3">Quick start suggestions</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { title: '15 min Quick Question',    desc: 'Ask anything, get quick answers', duration: 15 },
              { title: '30 min Career Advice',     desc: 'Map your next career move',       duration: 30 },
              { title: '60 min Deep Dive Strategy',desc: 'Comprehensive planning session',  duration: 60 },
            ].map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => openNewForm({ title: item.title, description: item.desc, duration: item.duration })}
                className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg p-4 sm:p-5 flex items-start gap-3 sm:gap-4 text-left hover:border-[#C8A97E] transition-all"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="sm:w-5 sm:h-5">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-serif text-xs sm:text-sm font-semibold text-[#F9F6F2]">{item.title}</p>
                  <p className="font-sans text-[#F9F6F2] text-xs opacity-60 mt-1">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Empty-state add button */}
        {!showForm && sessions.length === 0 && (
          <button
            onClick={() => openNewForm()}
            className="w-full border border-dashed border-[rgba(200,169,126,0.3)] text-[#C8A97E] py-3 sm:py-4 px-6 rounded-lg font-serif font-semibold text-sm hover:border-[#C8A97E] transition-all flex items-center justify-center gap-2 mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            Add Session Type
          </button>
        )}

        {/* Session list */}
        {sessions.length > 0 && (
          <div className="mb-6 space-y-4">
            {sessions.map((session, idx) => (
              <div
                key={session._id || idx}
                className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="sm:w-5 sm:h-5">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-serif text-xs sm:text-sm font-semibold text-[#C8A97E]">{session.title}</span>
                      <span className="bg-[#0C0C0C] text-[#F9F6F2] text-xs px-2 py-0.5 rounded-full border border-[rgba(200,169,126,0.3)]">{session.duration} min</span>
                      <span className="bg-[#0C0C0C] text-[#F9F6F2] text-xs px-2 py-0.5 rounded-full border border-[rgba(200,169,126,0.3)]">PKR {session.price}</span>
                    </div>
                    <p className="font-sans text-[#F9F6F2] text-xs opacity-60 line-clamp-1">{session.description}</p>
                    {session.features.filter(Boolean).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {session.features.filter(Boolean).map((f, fi) => (
                          <span key={fi} className="text-[#C8A97E] text-xs opacity-70">• {f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  <button
                    onClick={() => deleteSession(idx)}
                    className="w-9 h-9 sm:w-10 sm:h-10 border border-[rgba(200,169,126,0.3)] rounded-lg flex items-center justify-center hover:border-red-400 hover:text-red-400 transition-all"
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openEditForm(idx)}
                    className="w-9 h-9 sm:w-10 sm:h-10 border border-[rgba(200,169,126,0.3)] rounded-lg flex items-center justify-center hover:border-[#C8A97E] transition-all"
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Add another */}
            {!showForm && (
              <button
                onClick={() => openNewForm()}
                className="w-full border border-dashed border-[rgba(200,169,126,0.3)] text-[#C8A97E] py-3 px-6 rounded-lg font-serif font-semibold text-sm hover:border-[#C8A97E] transition-all flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                Add Another Session Type
              </button>
            )}
          </div>
        )}

        {/* ── Inline form ───────────────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#F9F6F2]">
                {editingIdx !== null ? 'Edit Session' : 'New Session Type'}
              </h3>
              <button onClick={closeForm} className="text-[#F9F6F2] opacity-50 hover:opacity-100 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18l12-12" />
                </svg>
              </button>
            </div>

            {/* Form-level error */}
            {formError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                <p className="font-sans text-xs text-red-300">{formError}</p>
              </div>
            )}

            <div className="space-y-4 sm:space-y-5">
              {/* Title */}
              <div>
                <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none focus:border-[#C8A97E]"
                  placeholder="e.g. Career Strategy Call"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none focus:border-[#C8A97E] h-16 sm:h-20 resize-none"
                  placeholder="What will followers get from this session?"
                />
              </div>

              {/* Duration + Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                    Duration <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DURATIONS.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setFormData(f => {
                            // Update title to include the new duration if it's a duration-based title
                            let newTitle = f.title;
                            const durationMatch = f.title.match(/^\d+ min /i);
                            if (durationMatch) {
                              newTitle = f.title.replace(/^\d+ min /i, `${d} min `);
                            } else if (f.title.includes('min')) {
                              newTitle = f.title.replace(/\d+ min/i, `${d} min`);
                            }
                            return { ...f, duration: d, title: newTitle };
                          });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all border ${
                          formData.duration === d
                            ? 'bg-[#C8A97E] text-[#0C0C0C] border-[#C8A97E]'
                            : 'bg-[#0C0C0C] text-[#F9F6F2] border-[rgba(200,169,126,0.3)]'
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                    Price (PKR) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                    className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none focus:border-[#C8A97E]"
                    placeholder="e.g. 1500"
                  />
                </div>
              </div>

              {/* What's included */}
              <div>
                <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                  What's included <span className="font-normal opacity-50">(optional)</span>
                </label>
                <div className="space-y-2">
                  {formData.features.map((feat, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={e => changeFeature(i, e.target.value)}
                        className="flex-1 bg-[#0C0C0C] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2 font-sans text-white text-xs sm:text-sm focus:outline-none focus:border-[#C8A97E]"
                        placeholder={`Included item ${i + 1}`}
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(i)}
                          className="text-[#F9F6F2] opacity-40 hover:opacity-80 transition-opacity flex-shrink-0"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addFeature}
                  className="mt-2 text-[#C8A97E] text-xs font-sans flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                  Add item
                </button>
              </div>

              {/* Max bookings */}
              <div>
                <label className="block font-sans text-[#F9F6F2] text-xs font-semibold mb-2">
                  Max bookings per day <span className="font-normal opacity-50">(optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxBookings}
                  onChange={e => setFormData(f => ({ ...f, maxBookings: e.target.value }))}
                  className="w-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.15)] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-sans text-white text-xs sm:text-sm focus:outline-none focus:border-[#C8A97E]"
                  placeholder="e.g. 5"
                />
              </div>

              {/* Form actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="border border-[rgba(200,169,126,0.3)] text-[#C8A97E] px-5 py-2.5 rounded-full font-serif font-semibold text-sm hover:border-[#C8A97E] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveToList}
                  className="bg-[#C8A97E] text-[#0C0C0C] px-6 py-2.5 rounded-full font-serif font-semibold text-sm hover:opacity-90 transition-all"
                >
                  {editingIdx !== null ? 'Save Changes' : 'Add Session'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status info box */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-lg p-4 sm:p-5 flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[rgba(200,169,126,0.3)] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5" className="sm:w-5 sm:h-5">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className={`font-serif text-xs sm:text-sm font-semibold ${sessions.length > 0 ? 'text-[#C8A97E]' : 'text-[#F9F6F2] opacity-80'}`}>
              {sessions.length > 0
                ? `${sessions.length} session type${sessions.length > 1 ? 's' : ''} added — you're good to continue!`
                : 'At least 1 session type required'}
            </h3>
            <p className="font-sans text-[#F9F6F2] text-xs opacity-60 mt-1">
              {sessions.length > 0
                ? 'Add more session types if you want, then click Continue.'
                : 'Add a session type above so followers know what they can book with you.'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push('/creator-onboarding/step-2')}
            className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm hover:border-[#C8A97E] transition-all flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={sessions.length === 0 || saving}
            className={`flex-1 font-serif font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm transition-all flex items-center justify-center gap-2 ${
              sessions.length > 0 && !saving
                ? 'bg-[#C8A97E] text-[#0C0C0C] hover:opacity-90'
                : 'bg-[rgba(200,169,126,0.2)] text-[rgba(0,0,0,0.4)] cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
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
  );
}

/* ─── StepItem ───────────────────────────────────────────────────────────── */
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
