'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import EventFormSection from '@/components/events/EventFormSection';
import TicketingFields from '@/components/events/TicketingFields';
import ScheduleSlotsFields, { type ScheduleSlotsErrors } from '@/components/events/ScheduleSlotsFields';
import PolicyFields, {
  emptyPolicy,
  type PolicyErrors,
  type PolicyValues,
} from '@/components/events/PolicyFields';
import { emptyTicketing, newTierId, type EventDayData, type TicketingValues } from '@/lib/eventTicketing';
import BasicInfoFields, {
  emptyBasicInfo,
  type BasicInfoErrors,
  type BasicInfoValues,
} from '@/components/events/BasicInfoFields';

type SectionId = 'basic' | 'ticketing' | 'slots' | 'policy';

const SECTIONS: { id: SectionId; title: string; description: string }[] = [
  {
    id: 'basic',
    title: 'Basic Info',
    description: 'Start by adding your event’s title, category, and key information.',
  },
  {
    id: 'slots',
    title: 'Schedule Slots',
    description: 'Organize your event with flexible dates and time slots.',
  },
  {
    id: 'ticketing',
    title: 'Ticketing & Pricing',
    description: 'Set up your ticket types, pricing, and sales window for attendees.',
  },
  {
    id: 'policy',
    title: 'Policies',
    description: 'Set the rules and policies attendees should know before booking.',
  },
];

const SECTION_ORDER: SectionId[] = ['basic', 'slots', 'ticketing', 'policy'];

function buildPayloadDates(
  ticketing: TicketingValues
) {
  return ticketing.dates.map((date) => {
    const day = ticketing.days[date];
    return {
      date,
      startHour: day?.startHour ?? '',
      startMinute: day?.startMinute ?? '',
      startPeriod: day?.startPeriod ?? 'AM',
      endHour: day?.endHour ?? '',
      endMinute: day?.endMinute ?? '',
      endPeriod: day?.endPeriod ?? 'PM',
      tiers: (day?.tiers ?? []).map((t) => ({
        title: t.title,
        price: t.price,
        persons: t.persons,
        quantity: t.quantity,
      })),
      slots: [],
    };
  });
}

function hydrateFromEvent(event: any): {
  basicInfo: BasicInfoValues;
  bannerUrl: string;
  ticketing: TicketingValues;
  policy: PolicyValues;
} {
  const dates: string[] = [];
  const days: Record<string, EventDayData> = {};

  for (const d of event.dates || []) {
    const iso = typeof d?.date === 'string' ? d.date : '';
    if (!iso) continue;
    dates.push(iso);
    days[iso] = {
      startHour: d.startHour || '',
      startMinute: d.startMinute || '',
      startPeriod: d.startPeriod === 'PM' ? 'PM' : 'AM',
      endHour: d.endHour || '',
      endMinute: d.endMinute || '',
      endPeriod: d.endPeriod === 'AM' ? 'AM' : 'PM',
      tiers: (d.tiers || []).map((t: any) => ({
        id: newTierId(),
        title: t.title || '',
        price: t.price == null ? '' : String(t.price),
        persons: t.persons == null ? '' : String(t.persons),
        quantity: t.quantity == null ? '' : String(t.quantity),
      })),
      selectedTierId: null,
    };
  }

  return {
    basicInfo: {
      title: event.title || '',
      category: event.category || '',
      description: event.description || '',
      banner: null,
      eventMode: event.eventMode || '',
      location: event.location || '',
    },
    bannerUrl: event.bannerUrl || '',
    ticketing: {
      category: event.category || '',
      dates,
      activeDate: dates[0] || null,
      days,
      startDate: event.startDate || (dates[0] ?? ''),
      endDate: event.endDate || (dates[dates.length - 1] ?? ''),
      startHour: event.startHour || '',
      startMinute: event.startMinute || '',
      startPeriod: event.startPeriod === 'PM' ? 'PM' : 'AM',
      endHour: event.endHour || '',
      endMinute: event.endMinute || '',
      endPeriod: event.endPeriod === 'AM' ? 'AM' : 'PM',
    },
    policy: {
      refundPolicy: event.refundPolicy || '',
      termsAndConditions: event.termsAndConditions || '',
    },
  };
}

export function EventEditor({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(eventId);
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<SectionId | null>('basic');

  const [basicInfo, setBasicInfo] = useState<BasicInfoValues>(emptyBasicInfo());
  const [basicErrors, setBasicErrors] = useState<BasicInfoErrors>({});
  const [ticketing, setTicketing] = useState<TicketingValues>(emptyTicketing());
  const [slotsErrors, setSlotsErrors] = useState<ScheduleSlotsErrors>({});
  const [ticketingErrors, setTicketingErrors] = useState<{ tiers?: string }>({});
  const [policy, setPolicy] = useState<PolicyValues>(emptyPolicy());
  const [policyErrors, setPolicyErrors] = useState<PolicyErrors>({});
  const [savedEventId, setSavedEventId] = useState<string | null>(eventId || null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(isEdit);

  useEffect(() => {
    const cachedName = localStorage.getItem('creator_display_name');
    const cachedPhoto = localStorage.getItem('creator_profile_photo');
    if (cachedName) setDisplayName(cachedName);
    if (cachedPhoto) setProfilePhoto(cachedPhoto);

    (async () => {
      try {
        const res = await fetch('/api/user/me');
        if (!res.ok) return;
        const data = await res.json();
        setDisplayName(data.creatorProfile?.displayName || data.user?.name || '');
        setProfilePhoto(data.creatorProfile?.profilePhoto || null);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;

    (async () => {
      setLoadingEvent(true);
      try {
        const res = await fetch(`/api/creators/events/${eventId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error || 'Could not load this event.');
          router.replace('/creators/events');
          return;
        }
        if (cancelled) return;
        const hydrated = hydrateFromEvent(data.event);
        setSavedEventId(data.event.id);
        setBasicInfo(hydrated.basicInfo);
        setBannerUrl(hydrated.bannerUrl);
        setTicketing(hydrated.ticketing);
        setPolicy(hydrated.policy);
        setOpenSection('basic');
      } catch (err) {
        console.error(err);
        toast.error('Could not load this event.');
        router.replace('/creators/events');
      } finally {
        if (!cancelled) setLoadingEvent(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId, router]);

  // Keep ticketing in sync when slots section modifies dates/times
  const handleTicketingChange = (next: TicketingValues) => {
    setTicketing(next);
  };

  const toggle = (id: SectionId) => setOpenSection((cur) => (cur === id ? null : id));

  const goBack = () => {
    const current = openSection ?? 'policy';
    const index = SECTION_ORDER.indexOf(current);
    if (index <= 0) {
      router.push('/creators/events');
      return;
    }
    setOpenSection(SECTION_ORDER[index - 1]);
  };

  const validateAll = (status: 'draft' | 'published') => {
    const newBasicErrors: BasicInfoErrors = {};
    const newSlotsErrors: ScheduleSlotsErrors = {};
    const newTicketingErrors: { tiers?: string } = {};
    const newPolicyErrors: PolicyErrors = {};

    const strict = status === 'published';

    // 1. Basic Info
    if (!basicInfo.title.trim()) {
      newBasicErrors.title = 'Event title is required.';
    }
    if (!basicInfo.category) {
      newBasicErrors.category = 'Category is required.';
    }
    if (!basicInfo.eventMode) {
      newBasicErrors.eventMode = 'Event mode is required.';
    } else if (basicInfo.eventMode === 'Physical' && !basicInfo.location.trim()) {
      newBasicErrors.location = 'Location is required for physical events.';
    }

    const descText = basicInfo.description.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    if (!descText) {
      newBasicErrors.description = 'Event description is required.';
    }

    if (strict && !bannerUrl && !basicInfo.banner) {
      newBasicErrors.banner = 'Banner image is required.';
    }

    // 2. Schedule Slots — Events Date(s) is required!
    if (ticketing.dates.length === 0) {
      newSlotsErrors.dates = 'Event date(s) are required. Please pick at least one date.';
    } else {
      const hasMissingTime = ticketing.dates.some((iso) => {
        const d = ticketing.days[iso];
        return !d || !d.startHour || !d.endHour;
      });
      if (hasMissingTime) {
        newSlotsErrors.times = 'Please select both start time and end time for your event.';
      }
    }

    // 3. Ticketing & Pricing
    if (strict) {
      const dayKey = ticketing.dates[0] ?? '__global__';
      const tiers = ticketing.days[dayKey]?.tiers ?? [];
      if (tiers.length === 0) {
        newTicketingErrors.tiers = 'Add at least one ticket tier before publishing.';
      } else if (tiers.every((t) => !t.quantity || Number(t.quantity) < 1)) {
        newTicketingErrors.tiers = 'Set a quantity greater than 0 for at least one tier.';
      }
    }

    // 4. Policy (for publishing)
    if (strict) {
      if (!policy.refundPolicy.trim()) {
        newPolicyErrors.refundPolicy = 'Refund policy is required.';
      }
      if (!policy.termsAndConditions.trim()) {
        newPolicyErrors.termsAndConditions = 'Terms & conditions are required.';
      }
    }

    const hasErrors =
      Object.keys(newBasicErrors).length > 0 ||
      Object.keys(newSlotsErrors).length > 0 ||
      Object.keys(newTicketingErrors).length > 0 ||
      Object.keys(newPolicyErrors).length > 0;

    return {
      basic: newBasicErrors,
      slots: newSlotsErrors,
      ticketing: newTicketingErrors,
      policy: newPolicyErrors,
      hasErrors,
    };
  };

  const saveEvent = async (status: 'draft' | 'published') => {
    if (saving || loadingEvent) return;

    // Scan all fields at once
    const validation = validateAll(status);
    setBasicErrors(validation.basic);
    setSlotsErrors(validation.slots);
    setTicketingErrors(validation.ticketing);
    setPolicyErrors(validation.policy);

    if (validation.hasErrors) {
      const count =
        Object.keys(validation.basic).length +
        Object.keys(validation.slots).length +
        Object.keys(validation.ticketing).length +
        Object.keys(validation.policy).length;

      toast.error(`Please complete all required fields (${count} ${count === 1 ? 'issue' : 'issues'}).`);

      const currentHasError =
        (openSection === 'basic' && Object.keys(validation.basic).length > 0) ||
        (openSection === 'slots' && Object.keys(validation.slots).length > 0) ||
        (openSection === 'ticketing' && Object.keys(validation.ticketing).length > 0) ||
        (openSection === 'policy' && Object.keys(validation.policy).length > 0);

      if (!currentHasError) {
        if (Object.keys(validation.basic).length > 0) setOpenSection('basic');
        else if (Object.keys(validation.slots).length > 0) setOpenSection('slots');
        else if (Object.keys(validation.ticketing).length > 0) setOpenSection('ticketing');
        else if (Object.keys(validation.policy).length > 0) setOpenSection('policy');
      }
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: basicInfo.title,
        description: basicInfo.description,
        bannerUrl,
        category: basicInfo.category,
        eventMode: basicInfo.eventMode,
        location: basicInfo.location,
        startDate: ticketing.startDate,
        endDate: ticketing.endDate,
        startHour: ticketing.startHour,
        startMinute: ticketing.startMinute,
        startPeriod: ticketing.startPeriod,
        endHour: ticketing.endHour,
        endMinute: ticketing.endMinute,
        endPeriod: ticketing.endPeriod,
        dates: buildPayloadDates(ticketing),
        refundPolicy: policy.refundPolicy,
        termsAndConditions: policy.termsAndConditions,
        status,
      };

      const form = new FormData();
      form.set('status', status);
      form.set('data', JSON.stringify(payload));
      if (basicInfo.banner) form.set('banner', basicInfo.banner);

      const url = savedEventId ? `/api/creators/events/${savedEventId}` : '/api/creators/events';
      const res = await fetch(url, { method: savedEventId ? 'PUT' : 'POST', body: form });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.field === 'refundPolicy' || data.field === 'termsAndConditions') {
          setPolicyErrors((prev) => ({ ...prev, [data.field]: data.error }));
          setOpenSection('policy');
        } else if (
          data.field === 'title' ||
          data.field === 'description' ||
          data.field === 'banner' ||
          data.field === 'category' ||
          data.field === 'eventMode' ||
          data.field === 'location'
        ) {
          setBasicErrors((prev) => ({ ...prev, [data.field]: data.error }));
          setOpenSection('basic');
        } else if (data.field === 'dates') {
          setSlotsErrors((prev) => ({ ...prev, dates: data.error }));
          setOpenSection('slots');
        }
        toast.error(data.error || 'Could not save the event.');
        return;
      }

      setSavedEventId(data.event.id);
      if (data.event.bannerUrl) {
        setBannerUrl(data.event.bannerUrl);
        setBasicInfo((prev) => ({ ...prev, banner: null }));
      }

      if (status === 'draft') {
        toast.success(isEdit ? 'Changes saved as draft' : 'Draft saved');
      } else {
        toast.success(isEdit ? 'Event updated' : 'Event published');
        router.push('/creators/events');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not save the event.');
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = () => void saveEvent('draft');
  const publishEvent = () => void saveEvent('published');

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      <main className="mx-auto max-w-[1536px] px-4 py-8 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/creators/events"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-[#0012FF]"
          >
            <ArrowLeft size={14} />
            Back to Events
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight font-sans">
            {isEdit ? (
              <>
                Edit Your <span className="text-[#0012FF]">Event</span>{' '}
                <span className="text-gray-400 font-normal text-base sm:text-lg">in simple steps</span>
              </>
            ) : (
              <>
                Create Your Next <span className="text-[#0012FF]">Event</span>{' '}
                <span className="text-gray-400 font-normal text-base sm:text-lg">in simple steps</span>
              </>
            )}
          </h1>
        </div>

        {loadingEvent ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 w-full animate-pulse rounded-[12px] bg-gray-200" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {SECTIONS.map((section) => {
                const errorCount =
                  section.id === 'basic'
                    ? Object.keys(basicErrors).length
                    : section.id === 'slots'
                      ? Object.keys(slotsErrors).length
                      : section.id === 'ticketing'
                        ? Object.keys(ticketingErrors).length
                        : Object.keys(policyErrors).length;

                return (
                  <EventFormSection
                    key={section.id}
                    title={section.title}
                    description={section.description}
                    open={openSection === section.id}
                    onToggle={() => toggle(section.id)}
                    errorCount={errorCount}
                  >
                    {section.id === 'basic' ? (
                      <BasicInfoFields
                        values={basicInfo}
                        errors={basicErrors}
                        bannerUrl={bannerUrl}
                        onClearBannerUrl={() => setBannerUrl('')}
                        onChange={(patch) => setBasicInfo((prev) => ({ ...prev, ...patch }))}
                        clearError={(key) =>
                          setBasicErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
                        }
                      />
                    ) : section.id === 'ticketing' ? (
                      <TicketingFields
                        values={ticketing}
                        onChange={handleTicketingChange}
                        error={ticketingErrors.tiers}
                        clearError={() => setTicketingErrors({})}
                      />
                    ) : section.id === 'slots' ? (
                      <ScheduleSlotsFields
                        values={ticketing}
                        onChange={handleTicketingChange}
                        errors={slotsErrors}
                        clearError={(key) =>
                          setSlotsErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
                        }
                      />
                    ) : (
                      <PolicyFields
                        values={policy}
                        errors={policyErrors}
                        onChange={(patch) => setPolicy((prev) => ({ ...prev, ...patch }))}
                        clearError={(key) =>
                          setPolicyErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
                        }
                      />
                    )}
                  </EventFormSection>
                );
              })}
            </div>

            {/* Footer actions from the Policy design */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e2e2e2] bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={saving}
                  className="cursor-pointer rounded-full border border-[#0012FF] disabled:cursor-not-allowed disabled:opacity-60 bg-white px-6 py-3 text-sm font-semibold text-[#0012FF] transition-colors hover:bg-[#0012FF]/5"
                >
                  {saving ? 'Saving…' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  onClick={publishEvent}
                  disabled={saving}
                  className="cursor-pointer rounded-full bg-[#0012FF] disabled:cursor-not-allowed disabled:opacity-60 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#0010d0]"
                >
                  {saving ? (isEdit ? 'Updating…' : 'Publishing…') : isEdit ? 'Update Event' : 'Publish Event'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function CreateEventPage() {
  return <EventEditor />;
}
