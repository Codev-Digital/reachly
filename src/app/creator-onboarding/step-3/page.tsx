'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateSessionTypes } from '@/lib/auth-client';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useOnboardingCleanup } from '@/hooks/useOnboardingCleanup';
import SessionFields from '@/components/SessionFields';
import PriceTag from '@/components/PriceTag';
import { richTextPreview, toEditorHtml } from '@/lib/richText';
import {
  emptySessionValues,
  formatDuration,
  scrollToFirstError,
  sessionToValues,
  validateSessionValues,
  valuesToPayload,
  type SessionErrorKey,
  type SessionErrors,
  type SessionFormValues,
} from '@/lib/sessionForm';

/* ─── types ─────────────────────────────────────────────────────────────── */
interface SessionData {
  _id?: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  discountedPrice?: number;
  bufferTime?: number;
  minAdvanceDays?: number;
  maxBookings?: number;
  features?: string[];
  questions?: unknown[];
  isDraft?: boolean;
}

// Simple unique id generator for local items
function generateLocalId() {
  return 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/* ─── component ─────────────────────────────────────────────────────────── */
export default function CreatorOnboardingStep3() {
  const router = useRouter();
  useOnboardingCleanup();

  const [fetchingData, setFetchingData] = useState(true);
  const [saving, setSaving]             = useState(false);
  const [pageError, setPageError]       = useState('');

  const [isDraftSaved, setIsDraftSaved] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const isLoadedRef = useRef(false);

  // List of persisted sessions shown on screen
  const [sessions, setSessions]         = useState<SessionData[]>([]);

  // The inline add/edit form (same fields as the Add New Session page)
  const [showForm, setShowForm]         = useState(false);
  const [editingIdx, setEditingIdx]     = useState<number | null>(null);
  const [values, setValues]             = useState<SessionFormValues>(emptySessionValues);
  const [errors, setErrors]             = useState<SessionErrors>({});

  const updateValues = (patch: Partial<SessionFormValues>) =>
    setValues(prev => ({ ...prev, ...patch }));
  const clearError = (key: SessionErrorKey) =>
    setErrors(prev => (prev[key] ? { ...prev, [key]: '' } : prev));

  /* ── Load saved sessions on mount ───────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/creator-onboarding/step-3', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sessionTypes)) {
            // keep every stored field (questions, buffer, discounted price...) so saving doesn't drop them
            setSessions(data.sessionTypes.map((s: any) => ({ ...s, _id: s._id, isDraft: true })));
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
  const openNewForm = () => {
    setEditingIdx(null);
    setValues(emptySessionValues());
    setErrors({});
    setShowForm(true);
  };

  const openEditForm = (idx: number) => {
    const s = sessions[idx];
    setEditingIdx(idx);
    setValues(sessionToValues(s, toEditorHtml(s.description)));
    setErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingIdx(null);
    setValues(emptySessionValues());
    setErrors({});
  };

  /* ── Save session (auto-persists to draft in backend) ───────────────── */
  const handleSaveToList = async () => {
    const next = validateSessionValues(values);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      scrollToFirstError();
      return;
    }

    const payload = valuesToPayload(values);

    let updatedList: SessionData[] = [];
    if (editingIdx !== null) {
      updatedList = sessions.map((s, i) => (i === editingIdx ? { ...s, ...payload, isDraft: true } : s));
    } else {
      updatedList = [...sessions, { ...payload, features: [], isDraft: true, _id: generateLocalId() }];
    }

    setSessions(updatedList);
    closeForm();
    setPageError('');

    // Auto-save draft to backend immediately so navigating away never loses progress
    setSavingDraft(true);
    try {
      const result = await updateSessionTypes(updatedList);
      if (result.success) {
        setIsDraftSaved(true);
        if (Array.isArray(result.sessionTypes)) {
          setSessions(result.sessionTypes.map((s: any) => ({ ...s, _id: s._id, isDraft: true })));
        }
      } else {
        setPageError(result.error || 'Failed to auto-save draft.');
      }
    } catch {
      // Keep local session if network error occurs
    } finally {
      setSavingDraft(false);
    }
  };

  const deleteSession = async (idx: number) => {
    const updated = sessions.filter((_, i) => i !== idx);
    setSessions(updated);
    if (updated.length > 0) {
      setSavingDraft(true);
      try {
        const result = await updateSessionTypes(updated);
        if (result.success) {
          setIsDraftSaved(true);
          if (Array.isArray(result.sessionTypes)) {
            setSessions(result.sessionTypes.map((s: any) => ({ ...s, _id: s._id, isDraft: true })));
          }
        }
      } catch {
      } finally {
        setSavingDraft(false);
      }
    } else {
      setIsDraftSaved(false);
    }
  };

  /* ── Continue — persist to DB and advance ───────────────────────────── */
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
        if (Array.isArray(result.sessionTypes)) {
          setSessions(result.sessionTypes.map((s: any) => ({ ...s, _id: s._id, isDraft: true })));
        }
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

  /* ── Back button logic ──────────────────────────────────────────────── */
  const handleBack = () => {
    if (showForm) {
      // If user was creating or editing a session, cancel and show the session list
      closeForm();
    } else {
      router.push('/creator-onboarding/step-2');
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
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3">
                  <h2 className="min-w-0 break-words font-sans text-sm font-semibold leading-5 text-black">
                    {session.title}
                  </h2>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditForm(idx)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-[#0012FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0012FF]"
                      title="Edit Session"
                      aria-label={`Edit ${session.title}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSession(idx)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      title="Delete Session"
                      aria-label={`Delete ${session.title}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  <div className="col-span-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      Draft
                    </span>
                    <span className="rounded-full border border-[#C8A97E]/30 bg-[#FFF7ED] px-3 py-1 text-xs text-[#C8A97E]">
                      {formatDuration(session.duration)}
                    </span>
                    <PriceTag price={session.price} discountedPrice={session.discountedPrice} />
                    {!!session.bufferTime && (
                      <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        {session.bufferTime} min buffer
                      </span>
                    )}
                  </div>
                  <p className="col-span-2 font-sans text-xs text-gray-500">
                    {richTextPreview(session.description, 300)}
                  </p>
                </div>
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

            <SessionFields
              values={values}
              onChange={updateValues}
              errors={errors}
              clearError={clearError}
            />

            {/* Form actions */}
            <div className="flex gap-3 pt-6">
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
                disabled={savingDraft}
                className="bg-[#0012FF] text-white px-6 py-2.5 rounded-full font-sans font-semibold text-sm hover:bg-[#0012FF]/90 transition-all disabled:opacity-50"
              >
                {savingDraft ? 'Saving...' : editingIdx !== null ? 'Save Changes' : 'Add Session'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
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
