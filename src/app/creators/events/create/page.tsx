'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import EventFormSection from '@/components/events/EventFormSection';
import TicketingFields from '@/components/events/TicketingFields';
import ScheduleSlotsFields from '@/components/events/ScheduleSlotsFields';
import PolicyFields, {
  emptyPolicy,
  type PolicyErrors,
  type PolicyValues,
} from '@/components/events/PolicyFields';
import { emptyTicketing, newTierId, type EventDayData, type TicketingValues } from '@/lib/eventTicketing';
import {
  emptyScheduleSlots,
  emptySlot,
  newSlotId,
  syncSlotsWithDates,
  type ScheduleSlotsValues,
} from '@/lib/eventSlots';
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
    description: 'Start by adding your event’s title, category, date, and key information.',
  },
  {
    id: 'ticketing',
    title: 'Ticketing & Pricing',
    description: 'Set up your ticket types, pricing, and sales window for attendees.',
  },
  {
    id: 'slots',
    title: 'Schedule Slots',
    description: 'Organize your event with flexible dates and time slots.',
  },
  {
    id: 'policy',
    title: 'Policy',
    description: 'Set the rules and policies attendees should know before booking.',
  },
];

const SECTION_ORDER: SectionId[] = ['basic', 'ticketing', 'slots', 'policy'];

function buildPayloadDates(
  ticketing: TicketingValues,
  scheduleSlots: ScheduleSlotsValues
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
      slots: (scheduleSlots[date] ?? []).map((slot) => ({ description: slot.description })),
    };
  });
}

function hydrateFromEvent(event: any): {
  basicInfo: BasicInfoValues;
  bannerUrl: string;
  ticketing: TicketingValues;
  scheduleSlots: ScheduleSlotsValues;
  policy: PolicyValues;
} {
  const dates: string[] = [];
  const days: Record<string, EventDayData> = {};
  const scheduleSlots: ScheduleSlotsValues = {};

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
    const rawSlots = d.slots || [];
    scheduleSlots[iso] = rawSlots.length
      ? rawSlots.map((s: any) => ({
          id: newSlotId(),
          description: s.description || '',
          showDescription: Boolean(s.description),
        }))
      : [emptySlot()];
  }

  return {
    basicInfo: {
      title: event.title || '',
      description: event.description || '',
      banner: null,
    },
    bannerUrl: event.bannerUrl || '',
    ticketing: {
      category: event.category || '',
      dates,
      activeDate: dates[0] || null,
      days,
    },
    scheduleSlots,
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
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlotsValues>(emptyScheduleSlots());
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
        setScheduleSlots(hydrated.scheduleSlots);
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

  // Keep schedule rows in sync when dates are added or removed in Ticketing
  const handleTicketingChange = (next: TicketingValues) => {
    setTicketing(next);
    setScheduleSlots((prev) => syncSlotsWithDates(next.dates, prev));
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

  const saveEvent = async (status: 'draft' | 'published') => {
    if (saving || loadingEvent) return;
    if (!basicInfo.title.trim()) {
      setBasicErrors({ title: 'Event title is required.' });
      setOpenSection('basic');
      toast.error('Add an event title first.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: basicInfo.title,
        description: basicInfo.description,
        bannerUrl,
        category: ticketing.category,
        dates: buildPayloadDates(ticketing, scheduleSlots),
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
        } else if (data.field === 'title' || data.field === 'description' || data.field === 'banner') {
          setBasicErrors((prev) => ({ ...prev, [data.field]: data.error }));
          setOpenSection('basic');
        } else if (data.field === 'category' || data.field === 'dates') {
          setOpenSection('ticketing');
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
              {SECTIONS.map((section) => (
                <EventFormSection
                  key={section.id}
                  title={section.title}
                  description={section.description}
                  open={openSection === section.id}
                  onToggle={() => toggle(section.id)}
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
                    <TicketingFields values={ticketing} onChange={handleTicketingChange} />
                  ) : section.id === 'slots' ? (
                    <ScheduleSlotsFields
                      dates={ticketing.dates}
                      category={ticketing.category}
                      days={ticketing.days}
                      values={scheduleSlots}
                      onChange={setScheduleSlots}
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
              ))}
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
