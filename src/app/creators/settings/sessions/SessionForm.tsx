'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ActionDialog from '@/components/ActionDialog';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import { FormError } from '@/components/FormInput';
import SessionFields from '@/components/SessionFields';
import { toEditorHtml } from '@/lib/richText';
import {
  emptySessionValues,
  scrollToFirstError,
  sessionToValues,
  validateSessionValues,
  valuesToPayload,
  type SessionErrorKey,
  type SessionErrors,
  type SessionFormValues,
} from '@/lib/sessionForm';

const SETTINGS_SESSIONS_URL = '/creators/settings?tab=Sessions';
const SETTINGS_CACHE_KEY = 'reachly_creator_settings_cache';

interface DBTypeSession {
  _id?: string;
  id?: string;
  title: string;
  duration: number | string;
  price: number | string;
  discountedPrice?: number | string | null;
  bufferTime?: number;
  minAdvanceDays?: number;
  description: string;
  features?: string[];
  maxBookings?: number;
  isPackage?: boolean;
  packageSessions?: number;
  packagePeriod?: 'week' | 'month';
  isDraft?: boolean;
  isActive?: boolean;
}

/**
 * Full-page form to create (no `sessionId`) or edit (with `sessionId`) a session type.
 * Replaces the old "Add / Edit session" popup on the Settings → Sessions tab.
 */
export default function SessionForm({ sessionId }: { sessionId?: string }) {
  const router = useRouter();
  const isEdit = !!sessionId;

  const [navProfilePhoto, setNavProfilePhoto] = useState<string | null>(null);
  const [navDisplayName, setNavDisplayName] = useState('');

  const [sessions, setSessions] = useState<DBTypeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<SessionErrors>({});
  const [values, setValues] = useState<SessionFormValues>(emptySessionValues);
  const [isActive, setIsActive] = useState(true);
  const [isDraft, setIsDraft] = useState(false);
  const [confirmVisibility, setConfirmVisibility] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  const isLive = isActive !== false && isDraft !== true;
  const visibilityLabel = isLive ? 'Offline' : 'Live';

  const updateValues = (patch: Partial<SessionFormValues>) =>
    setValues((prev) => ({ ...prev, ...patch }));
  const clearError = (key: SessionErrorKey) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));

  // Header (photo / name) comes from the settings cache, falling back to the API
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(SETTINGS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setNavProfilePhoto(parsed.profilePhoto || null);
        setNavDisplayName(parsed.displayName || '');
        return;
      }
    } catch {}
    fetch('/api/user/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.success) return;
        setNavDisplayName(data.profile?.displayName || data.user?.name || '');
        setNavProfilePhoto(data.profile?.profilePhoto || data.user?.profilePhoto || null);
      })
      .catch(() => {});
  }, []);

  // Load the creator's sessions (needed to save, and to prefill when editing)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/creator-onboarding/step-3');
        if (!res.ok) throw new Error('load failed');
        const data = await res.json();
        const list: DBTypeSession[] = (data.sessionTypes || []).map((s: DBTypeSession) => ({
          ...s,
          id: s._id || s.id,
        }));
        if (cancelled) return;
        setSessions(list);

        if (sessionId) {
          const current = list.find((s) => (s.id || s._id) === sessionId);
          if (!current) {
            setNotFound(true);
          } else {
            setValues(sessionToValues(current, toEditorHtml(current.description)));
            setIsActive(current.isActive !== false);
            setIsDraft(current.isDraft === true);
          }
        }
      } catch (err) {
        console.error('Failed to load sessions:', err);
        if (cancelled) return;
        if (isEdit) setNotFound(true);
        else setFormError('Could not load your sessions. Please refresh and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, isEdit]);

  const handleSave = async () => {
    setFormError('');
    const next = validateSessionValues(values);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      scrollToFirstError();
      return;
    }

    setSaving(true);
    try {
      const payload = valuesToPayload(values);

      // Editing keeps whatever else is stored on the session (questions, older "included" bullets...)
      // Normalize minAdvanceDays so older sessions without the field don't fail API validation
      const withNotice = (s: DBTypeSession): DBTypeSession => ({
        ...s,
        minAdvanceDays:
          s.minAdvanceDays === undefined || s.minAdvanceDays === null || Number.isNaN(Number(s.minAdvanceDays))
            ? 1
            : Number(s.minAdvanceDays),
      });
      const updatedList: DBTypeSession[] = (isEdit
        ? sessions.map((s) => ((s.id || s._id) === sessionId ? { ...s, ...payload } : s))
        : [...sessions, { ...payload, features: [], id: Date.now().toString() }]
      ).map(withNotice);

      const res = await fetch('/api/creator-onboarding/step-3', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionTypes: updatedList }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Keep the settings page cache in sync so the list is right on arrival
        try {
          const cached = sessionStorage.getItem(SETTINGS_CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            parsed.sessions = (data.sessionTypes || updatedList).map((s: DBTypeSession) => ({
              ...s,
              id: s._id || s.id,
            }));
            sessionStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(parsed));
          }
        } catch {}
        router.push(`${SETTINGS_SESSIONS_URL}&saved=${isEdit ? 'updated' : 'created'}`);
        return;
      }
      setFormError(data.error || 'Failed to save session. Please try again.');
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmToggleVisibility = async () => {
    if (!sessionId) return;
    const makeLive = !isLive;
    setTogglingVisibility(true);
    try {
      const res = await fetch(`/api/creators/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: makeLive, isDraft: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || 'Could not update session visibility.');
        return;
      }
      setIsActive(makeLive);
      setIsDraft(false);
      setSessions((prev) =>
        prev.map((s) =>
          (s.id || s._id) === sessionId ? { ...s, isActive: makeLive, isDraft: false } : s
        )
      );
      try {
        const cached = sessionStorage.getItem(SETTINGS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.sessions)) {
            parsed.sessions = parsed.sessions.map((s: DBTypeSession) =>
              (s.id || s._id) === sessionId ? { ...s, isActive: makeLive, isDraft: false } : s
            );
            sessionStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(parsed));
          }
        }
      } catch {}
      setConfirmVisibility(false);
      toast.success(makeLive ? 'Session is now live for booking.' : 'Session is now offline.');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setTogglingVisibility(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <CreatorDashboardNav profilePhoto={navProfilePhoto} displayName={navDisplayName} />

      {/* Same container + padding as the header */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <Link
          href={SETTINGS_SESSIONS_URL}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-sans tracking-tight">
            {isEdit ? (
              <>
                Edit <span className="text-[#0012FF]">Session</span>
              </>
            ) : (
              <>
                Add New <span className="text-[#0012FF]">Session</span>
              </>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            {isEdit
              ? 'Update your session details and preferences.'
              : 'Create a 1-on-1 session that appears on your public profile.'}
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-5">
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ) : notFound ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-black mb-2">Session not found</h2>
            <p className="text-sm text-gray-500 mb-5">
              This session may have been deleted, or the link is incorrect.
            </p>
            <Link
              href={SETTINGS_SESSIONS_URL}
              className="inline-block bg-[#0012FF] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#0010d0] transition-all"
            >
              Back to Sessions
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            {formError && <FormError className="mb-5">{formError}</FormError>}

            <SessionFields
              values={values}
              onChange={updateValues}
              errors={errors}
              clearError={clearError}
            />

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-8">
              <Link
                href={SETTINGS_SESSIONS_URL}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold text-sm text-center transition-all"
              >
                Cancel
              </Link>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => setConfirmVisibility(true)}
                  disabled={saving || togglingVisibility}
                  className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer border ${
                    isLive
                      ? 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      : 'border-[#0012FF]/30 bg-[#EEF2FF] text-[#0012FF] hover:bg-[#E0E7FF]'
                  } disabled:opacity-50`}
                >
                  {visibilityLabel}
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-2xl font-bold text-sm transition-all shadow-md active:scale-98 disabled:bg-gray-300 disabled:text-gray-500 cursor-pointer"
              >
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Session'}
              </button>
            </div>
          </div>
        )}
      </main>

      {isEdit && (
        <ActionDialog
          open={confirmVisibility}
          onOpenChange={(open) => {
            if (!open && !togglingVisibility) setConfirmVisibility(false);
          }}
          image={{
            src: isLive ? '/assets/cancel-appointment-sm.webp' : '/assets/booking-confirm-sm.webp',
            alt: 'Session visibility',
          }}
          title={isLive ? 'Take this session offline?' : 'Make this session live?'}
          description={
            isLive
              ? 'Clients will no longer see or book this session. You can go live again anytime.'
              : 'Clients will be able to book this session on your profile again.'
          }
          actions={[
            {
              label: 'Cancel',
              variant: 'outline',
              onClick: () => setConfirmVisibility(false),
              disabled: togglingVisibility,
            },
            {
              label: togglingVisibility ? 'Updating...' : visibilityLabel,
              onClick: () => void confirmToggleVisibility(),
              disabled: togglingVisibility,
            },
          ]}
        />
      )}
    </div>
  );
}
