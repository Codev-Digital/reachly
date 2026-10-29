'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarPlus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import EventCard, { EventCardData } from '@/components/EventCard';
import ActionDialog from '@/components/ActionDialog';
import { richTextPreview } from '@/lib/richText';
import { formatEventCardDate, formatEventCardTime } from '@/lib/eventDisplay';

export default function CreatorEventsPage() {
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibilityTarget, setVisibilityTarget] = useState<EventCardData | null>(null);
  const [visibilitySaving, setVisibilitySaving] = useState(false);

  useEffect(() => {
    const cachedName = localStorage.getItem('creator_display_name');
    const cachedPhoto = localStorage.getItem('creator_profile_photo');
    if (cachedName) setDisplayName(cachedName);
    if (cachedPhoto) setProfilePhoto(cachedPhoto);

    (async () => {
      try {
        const [meRes, eventsRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch('/api/creators/events'),
        ]);

        if (meRes.ok) {
          const data = await meRes.json();
          setDisplayName(data.creatorProfile?.displayName || data.user?.name || '');
          setProfilePhoto(data.creatorProfile?.profilePhoto || null);
        }

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          const mapped: EventCardData[] = (data.events || [])
            .filter((e: any) => e.status !== 'cancelled')
            .map((e: any) => {
              const first = e.dates?.[0];
              return {
                id: e.id,
                title: e.title,
                description: richTextPreview(e.description, 140) || 'No description yet.',
                date: formatEventCardDate(first?.date),
                time: formatEventCardTime(first),
                location: e.category || 'Category TBA',
                image: e.bannerUrl || undefined,
                visible: e.status === 'published',
              };
            });
          setEvents(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const requestVisibilityToggle = (id: string) => {
    const target = events.find((e) => e.id === id) || null;
    if (target) setVisibilityTarget(target);
  };

  const confirmVisibilityToggle = async () => {
    if (!visibilityTarget || visibilitySaving) return;
    const nextVisible = !visibilityTarget.visible;
    setVisibilitySaving(true);
    try {
      const res = await fetch(`/api/creators/events/${visibilityTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: nextVisible }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not update event visibility.');
        return;
      }
      setEvents((prev) =>
        prev.map((e) => (e.id === visibilityTarget.id ? { ...e, visible: nextVisible } : e))
      );
      toast.success(nextVisible ? 'Event is now visible' : 'Event is now hidden');
      setVisibilityTarget(null);
    } catch (err) {
      console.error(err);
      toast.error('Could not update event visibility.');
    } finally {
      setVisibilitySaving(false);
    }
  };

  const hiding = visibilityTarget?.visible === true;

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      <main className="mx-auto max-w-[1536px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-gray-400 font-medium mb-1 text-sm sm:text-base">
              Hello {displayName ? displayName : 'Sophia Reed'}!
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight font-sans">
              Manage Your <span className="text-[#0012FF]">Events</span>{' '}
              <span className="text-gray-400 font-normal text-base sm:text-lg">with ease</span>
            </h1>
          </div>

          <Link
            href="/creators/events/create"
            className="flex w-fit cursor-pointer items-center gap-2 rounded-full bg-[#0012FF] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#0012FF]/90 active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            Create Event
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[270px] w-full animate-pulse rounded-[8px] bg-gray-200" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="relative isolate overflow-hidden rounded-2xl border border-[#e7e9f2] bg-white px-6 py-14 sm:py-20">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full bg-[#EEF2FF] blur-3xl" />
              <div className="absolute -bottom-36 -left-20 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />
            </div>
            <div className="mx-auto flex max-w-lg flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e5e9ff] bg-[#F5F6FF] text-[#0012FF] shadow-sm">
                <CalendarPlus size={29} strokeWidth={1.7} />
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                Bring your next idea to life
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                You haven’t created an event yet. Set up your first one to share what you do and give your community something to look forward to.
              </p>
              <Link
                href="/creators/events/create"
                className="mt-7 inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-[#0012FF] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0010d0] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0012FF] focus-visible:ring-offset-2"
              >
                Create your first event
                <ArrowRight size={16} />
              </Link>
              <p className="mt-4 text-xs text-gray-400">You can edit or publish your event when it’s ready.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showEdit
                showPreview
                onToggleVisibility={requestVisibilityToggle}
              />
            ))}
          </div>
        )}
      </main>

      <ActionDialog
        open={!!visibilityTarget}
        onOpenChange={(open) => {
          if (!open && !visibilitySaving) setVisibilityTarget(null);
        }}
        image={{
          src: hiding ? '/assets/cancel-appointment-sm.webp' : '/assets/booking-confirm-sm.webp',
          alt: hiding ? 'Hide event' : 'Unhide event',
        }}
        title={hiding ? 'Hide this event?' : 'Unhide this event?'}
        description={
          hiding
            ? [
                `"${visibilityTarget?.title || 'This event'}" will be hidden from your public profile and followers.`,
                'You can unhide it again anytime from this page.',
              ]
            : [
                `"${visibilityTarget?.title || 'This event'}" will appear on your public profile for followers to discover and book.`,
                'Make sure all details are ready before unhiding it.',
              ]
        }
        actions={[
          {
            label: 'Cancel',
            variant: 'outline',
            onClick: () => setVisibilityTarget(null),
            disabled: visibilitySaving,
          },
          {
            label: visibilitySaving
              ? hiding
                ? 'Hiding…'
                : 'Unhiding…'
              : hiding
                ? 'Hide Event'
                : 'Unhide Event',
            variant: hiding ? 'destructive' : 'default',
            onClick: () => void confirmVisibilityToggle(),
            disabled: visibilitySaving,
            className: hiding
              ? undefined
              : 'bg-[#0012FF] hover:bg-[#0010d0] text-white',
          },
        ]}
      />
    </div>
  );
}
