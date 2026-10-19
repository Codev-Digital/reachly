'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateSessionTypes } from '@/lib/auth-client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useOnboardingCleanup } from '@/hooks/useOnboardingCleanup';
import FormInput from '@/components/FormInput';

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

const DURATION_OPTIONS = [
  { value: 15, label: '15 mins' },
  { value: 30, label: '30 mins' },
  { value: 45, label: '45 mins' },
  { value: 60, label: '1 hr' },
  { value: 75, label: '1 hr 15 mins' },
  { value: 90, label: '1 hr 30 mins' },
  { value: 105, label: '1 hr 45 mins' },
  { value: 120, label: '2 hrs' },
];

// Simple unique id generator for local items
function generateLocalId() {
  return 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/* ─── helpers ────────────────────────────────────────────────────────────── */
function validateSession(s: SessionData): string | null {
  if (!s.title.trim())       return 'Title is required.';
  if (!s.description.trim()) return 'Description is required.';
  if (!s.duration) return 'Select a valid duration.';
  if (!s.price || Number(s.price) < 1) return 'Price must be at least PKR 1.';
  return null;
}

/* ─── component ─────────────────────────────────────────────────────────── */
export default function CreatorOnboardingStep3() {
  const router = useRouter();
  useOnboardingCleanup();

  const [fetchingData, setFetchingData] = useState(true);
  const [saving, setSaving]             = useState(false);
  const [pageError, setPageError]       = useState('');
  const [formError, setFormError]       = useState('');

  const [isDraftSaved, setIsDraftSaved] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const isLoadedRef = useRef(false);

  // List of persisted sessions shown on screen
  const [sessions, setSessions]         = useState<SessionData[]>([]);

  // The inline add/edit form
  const [showForm, setShowForm]         = useState(false);
  const [editingIdx, setEditingIdx]     = useState<number | null>(null);
  const [formData, setFormData]         = useState<SessionData>(BLANK);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);

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
        setTimeout(() => {
          isLoadedRef.current = true;
          setIsDraftSaved(true);
        }, 100);
      }
    })();
  }, []);

  // Watch sessions change to reset saved status
  useEffect(() => {
    if (isLoadedRef.current) {
      setIsDraftSaved(false);
    }
  }, [sessions]);

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
    setShowDurationDropdown(false);
  };

  const addFeature    = () => setFormData(f => ({ ...f, features: [...f.features, ''] }));
  const removeFeature = (i: number) =>
    setFormData(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  const changeFeature = (i: number, v: string) =>
    setFormData(f => { const fs = [...f.features]; fs[i] = v; return { ...f, features: fs }; });

  const selectDuration = (value: number) => {
    setFormData(f => ({ ...f, duration: value }));
    setShowDurationDropdown(false);
  };

  const getDurationLabel = (value: number) => {
    const option = DURATION_OPTIONS.find(o => o.value === value);
    return option ? option.label : 'Select duration';
  };

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

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setPageError('');
    try {
      const result = await updateSessionTypes(sessions);
      if (result.success) {
        setIsDraftSaved(true);
      } else {
        setPageError(result.error || 'Failed to save draft.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setPageError('Network error saving draft.');
    } finally {
      setSavingDraft(false);
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  if (fetchingData) return <LoadingAnimation />;

  return (
    <div className="min-h-screen bg-[#F7F7FA]">




      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-anton text-3xl font-bold text-black mb-2">
            What <span className="text-[#0012FF]">Sessions</span> Will You Offer?
          </h1>
          <p className="text-xs text-gray-400">
            Define the session types followers can book with you. You need at least 1 to continue.
          </p>
        </div>

        {/* Page-level error */}
        {pageError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{pageError}</p>
          </div>
        )}

        {/* Session list */}
        {sessions.length > 0 && (
          <div className="mb-6 space-y-4">
            {sessions.map((session, idx) => (
              <div
                key={session._id || idx}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-sans text-sm font-semibold text-black">{session.title}</span>
                  <span className="bg-[#FFF7ED] text-[#C8A97E] text-xs px-3 py-1 rounded-full border border-[#C8A97E]/30">
                    {getDurationLabel(session.duration)}
                  </span>
                  <span className="bg-[#E0E7FF] text-[#0012FF] text-xs px-3 py-1 rounded-full border border-[#0012FF]/30">
                    {session.price} PKR
                  </span>
                </div>
                <p className="font-sans text-gray-500 text-xs">{session.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Session Button (dashed border) */}
        {!showForm && (
          <button
            onClick={() => openNewForm()}
            className="w-full border-2 border-dashed border-gray-300 text-gray-500 py-4 px-6 rounded-xl font-sans font-semibold text-xs hover:border-[#0012FF] hover:text-[#0012FF] transition-all flex items-center justify-center gap-2 mb-6"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            Add Session Type
          </button>
        )}

        {/* ── Inline form ───────────────────────────────────────────────────── */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 relative">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
              <h3 className="font-sans text-sm font-semibold text-black">
                {editingIdx !== null ? 'Edit Session' : 'New Session Type'}
              </h3>
              <button onClick={closeForm} className="text-gray-500 hover:text-gray-700 transition-opacity">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18l12-12" />
                </svg>
              </button>
            </div>

            {/* Form-level error */}
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-600">{formError}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <FormInput
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Career, Strategy, Call"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] placeholder-gray-400 h-28 resize-none"
                  placeholder="What will followers get from this session?"
                />
              </div>

              {/* Duration + Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-left text-gray-900 focus:outline-none focus:border-[#0012FF] flex items-center justify-between"
                  >
                    <span className={formData.duration ? 'text-gray-900' : 'text-gray-400'}>
                      {getDurationLabel(formData.duration)}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  
                  {showDurationDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      {DURATION_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => selectDuration(option.value)}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                            formData.duration === option.value
                              ? 'bg-[#0012FF] text-white'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Price (PKR) <span className="text-red-500">*</span>
                  </label>
                  <FormInput
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                    placeholder="e.g. 1200"
                  />
                </div>
              </div>

              {/* What's included */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  What's Included <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.features.map((feat, i) => (
                    <div key={i} className="flex gap-2">
                      <FormInput
                        type="text"
                        value={feat}
                        onChange={e => changeFeature(i, e.target.value)}
                        wrapperClassName="flex-1"
                        placeholder="Feature 1"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(i)}
                          className="text-gray-400 hover:text-gray-600 transition-opacity flex-shrink-0 px-2"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  className="mt-2 text-gray-500 text-xs font-sans flex items-center gap-1 hover:text-[#0012FF] transition-opacity"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                  Add feature
                </button>
              </div>

              {/* Max bookings */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Max Bookings Per Day
                </label>
                <FormInput
                  type="number"
                  min="1"
                  value={formData.maxBookings}
                  onChange={e => setFormData(f => ({ ...f, maxBookings: e.target.value }))}
                  placeholder="e.g. 5"
                />
              </div>

              {/* Form actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-sans font-semibold text-sm hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveToList}
                  className="bg-[#0012FF] text-white px-6 py-2.5 rounded-full font-sans font-semibold text-sm hover:bg-[#0012FF]/90 transition-all"
                >
                  {editingIdx !== null ? 'Save Changes' : 'Add Session'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/creator-onboarding/step-2')}
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
              disabled={sessions.length === 0 || saving}
              className={`px-6 py-2.5 rounded-full font-sans font-semibold text-sm transition-all ${
                sessions.length > 0 && !saving
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

