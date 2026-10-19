'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import FormInput, { FormError } from '@/components/FormInput';
import Dropdown from '@/components/Dropdown';
import { InfoTooltip } from '@/components/ui/tooltip';
import RichTextEditor from '@/components/RichTextEditor';
import { SESSION_DESCRIPTION_MAX_LENGTH, isRichTextEmpty, toEditorHtml } from '@/lib/richText';

const SETTINGS_SESSIONS_URL = '/creators/settings?tab=Sessions';
const SETTINGS_CACHE_KEY = 'reachly_creator_settings_cache';

const PRESET_DURATIONS = [
  { label: '15 mins', value: '15' },
  { label: '30 mins', value: '30' },
  { label: '45 mins', value: '45' },
  { label: '1 hour', value: '60' },
  { label: '90 mins', value: '90' },
];
const CUSTOM_DURATION_OPTION = 'Custom Duration';
const DURATION_OPTIONS = [...PRESET_DURATIONS.map((d) => d.label), CUSTOM_DURATION_OPTION];
const MAX_DURATION_MINUTES = 1440;

// Buffer time (rest after a session) can never be longer than the session itself.
// Short sessions: 5-minute steps (5, 10, 15 ...). From 1 hour up: 15-minute steps (15, 30, 45, 60 ...).
const NO_BUFFER_OPTION = 'No buffer';
const MAX_BUFFER_MINUTES = 120;
const bufferChoicesFor = (durationMinutes: number): number[] => {
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1) return [];
  const step = durationMinutes >= 60 ? 15 : 5;
  const max = Math.min(durationMinutes, MAX_BUFFER_MINUTES);
  const choices: number[] = [];
  for (let m = step; m <= max; m += step) choices.push(m);
  return choices;
};
const bufferLabel = (minutes: number) => (minutes === 0 ? NO_BUFFER_OPTION : `${minutes} mins`);

const isPresetDuration = (value: string) => PRESET_DURATIONS.some((d) => d.value === value);
/** Digits only - no decimals, signs or letters. */
const digitsOnly = (value: string) => value.replace(/\D/g, '');

interface DBTypeSession {
  _id?: string;
  id?: string;
  title: string;
  duration: number | string;
  price: number | string;
  discountedPrice?: number | string | null;
  bufferTime?: number;
  description: string;
  features?: string[];
  maxBookings?: number;
}

type ErrorKey = 'title' | 'description' | 'duration' | 'price' | 'discountedPrice' | 'maxBookings';
type Errors = Partial<Record<ErrorKey, string>>;

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
  const [errors, setErrors] = useState<Errors>({});

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60'); // minutes, as typed
  const [customDuration, setCustomDuration] = useState(false);
  const [bufferTime, setBufferTime] = useState(0); // minutes
  const [price, setPrice] = useState('1200');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [maxBookings, setMaxBookings] = useState('4');

  const clearError = (key: ErrorKey) =>
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
            const dur = String(current.duration || '60');
            setTitle(current.title || '');
            setDescription(toEditorHtml(current.description));
            setDuration(dur);
            setCustomDuration(!isPresetDuration(dur));
            setBufferTime(Number(current.bufferTime) || 0);
            setPrice(String(current.price ?? ''));
            setDiscountedPrice(
              current.discountedPrice !== undefined && current.discountedPrice !== null
                ? String(current.discountedPrice)
                : ''
            );
            setMaxBookings(String(current.maxBookings || 4));
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

  const handleDurationSelect = (option: string) => {
    if (option === CUSTOM_DURATION_OPTION) {
      if (!customDuration) {
        setCustomDuration(true);
        setDuration(''); // start empty so the creator can type their own minutes
      }
    } else {
      setCustomDuration(false);
      setDuration(PRESET_DURATIONS.find((d) => d.label === option)?.value ?? '');
    }
    clearError('duration');
  };

  // Buffer options follow the chosen duration; an old choice that no longer fits snaps to the closest valid one
  const bufferChoices = bufferChoicesFor(Number(duration));
  const effectiveBuffer = bufferChoices.filter((m) => m <= bufferTime).pop() ?? 0;
  const bufferOptions = [NO_BUFFER_OPTION, ...bufferChoices.map(bufferLabel)];

  const handleSave = async () => {
    setFormError('');
    const next: Errors = {};

    if (!title.trim()) next.title = 'Session title is required';
    if (isRichTextEmpty(description)) next.description = 'Session description is required';

    const durationNum = Number(duration);
    if (!duration || !Number.isInteger(durationNum) || durationNum < 1 || durationNum > MAX_DURATION_MINUTES) {
      next.duration = customDuration
        ? `Enter a duration between 1 and ${MAX_DURATION_MINUTES} minutes`
        : 'Please choose a duration';
    }

    const priceNum = Number(price);
    if (!price || !(priceNum >= 1)) next.price = 'Enter a price of at least 1 PKR';

    if (discountedPrice) {
      const discountNum = Number(discountedPrice);
      if (!(discountNum >= 1)) next.discountedPrice = 'Enter a discounted price of at least 1 PKR';
      else if (!next.price && discountNum >= priceNum) {
        next.discountedPrice = 'Discounted price must be less than the session price';
      }
    }

    const maxNum = Number(maxBookings);
    if (!maxBookings || !Number.isInteger(maxNum) || maxNum < 1) {
      next.maxBookings = 'Enter at least 1 booking per day';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setTimeout(() => {
        document
          .querySelector('[role="alert"]')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description,
        duration: durationNum,
        price: priceNum,
        discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
        bufferTime: effectiveBuffer,
        maxBookings: maxNum,
      };

      // Editing keeps whatever else is stored on the session (questions, older "included" bullets...)
      const updatedList: DBTypeSession[] = isEdit
        ? sessions.map((s) => ((s.id || s._id) === sessionId ? { ...s, ...payload } : s))
        : [...sessions, { ...payload, features: [], id: Date.now().toString() }];

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

            <div className="space-y-5">
              <FormInput
                label="Title"
                required
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError('title');
                }}
                error={errors.title}
                placeholder="Style Consultation"
              />

              <RichTextEditor
                label="Description"
                required
                value={description}
                onChange={(html) => {
                  setDescription(html);
                  clearError('description');
                }}
                maxLength={SESSION_DESCRIPTION_MAX_LENGTH}
                error={errors.description}
                placeholder="Personal styling session to revamp your wardrobe and discover your signature look."
              />

              {/* Duration: presets, or "Custom Duration" which turns the field into a minutes input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Dropdown
                  label="Duration"
                  required
                  options={DURATION_OPTIONS}
                  value={
                    customDuration
                      ? duration
                      : (PRESET_DURATIONS.find((d) => d.value === duration)?.label ?? '')
                  }
                  selectedOption={
                    customDuration
                      ? CUSTOM_DURATION_OPTION
                      : PRESET_DURATIONS.find((d) => d.value === duration)?.label
                  }
                  onChange={handleDurationSelect}
                  editable={customDuration}
                  onInputChange={(text) => {
                    setDuration(digitsOnly(text));
                    clearError('duration');
                  }}
                  inputMode="numeric"
                  inputMaxLength={4}
                  suffix={customDuration ? 'min' : undefined}
                  placeholder={customDuration ? 'Enter duration' : 'Select duration'}
                  error={errors.duration}
                />

                <Dropdown
                  label="Buffer Time"
                  labelAddon={
                    <InfoTooltip title="Buffer time">
                      A short break kept free after each session, before the next booking can start. It can&apos;t
                      be longer than the session duration, so enter a duration first.
                    </InfoTooltip>
                  }
                  options={bufferOptions}
                  value={bufferLabel(effectiveBuffer)}
                  onChange={(label) =>
                    setBufferTime(
                      label === NO_BUFFER_OPTION ? 0 : Number(label.replace(/\D/g, '')) || 0
                    )
                  }
                  disabled={bufferChoices.length === 0}
                  placeholder={bufferChoices.length === 0 ? 'Choose a duration first' : 'Select buffer time'}
                />
              </div>

              {/* Session price next to the discounted price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormInput
                  label="Session Price"
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  suffix="PKR"
                  value={price}
                  onChange={(e) => {
                    setPrice(digitsOnly(e.target.value));
                    clearError('price');
                    clearError('discountedPrice');
                  }}
                  error={errors.price}
                  placeholder="1200"
                />
                <FormInput
                  label="Discounted Price"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  suffix="PKR"
                  value={discountedPrice}
                  onChange={(e) => {
                    setDiscountedPrice(digitsOnly(e.target.value));
                    clearError('discountedPrice');
                  }}
                  error={errors.discountedPrice}
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormInput
                  label="Max Bookings Per Day"
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  value={maxBookings}
                  onChange={(e) => {
                    setMaxBookings(digitsOnly(e.target.value));
                    clearError('maxBookings');
                  }}
                  error={errors.maxBookings}
                  placeholder="4"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-8">
              <Link
                href={SETTINGS_SESSIONS_URL}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold text-sm text-center transition-all"
              >
                Cancel
              </Link>
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
    </div>
  );
}
