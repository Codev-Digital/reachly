'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import EventCard, { EventCardData } from '@/components/EventCard';
import { richTextPreview } from '@/lib/richText';
import { fromISODate } from '@/lib/eventTicketing';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatCardDate(iso?: string) {
  if (!iso) return 'Date TBA';
  const d = fromISODate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatCardTime(day?: {
  startHour?: string;
  startMinute?: string;
  startPeriod?: string;
  endHour?: string;
  endMinute?: string;
  endPeriod?: string;
}) {
  if (!day?.startHour) return 'Time TBA';
  const start = `${day.startHour}:${day.startMinute || '00'} ${day.startPeriod || 'AM'}`;
  if (!day.endHour) return start;
  return `${start} - ${day.endHour}:${day.endMinute || '00'} ${day.endPeriod || 'PM'}`;
}

export default function CreatorEventsPage() {
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);

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
                date: formatCardDate(first?.date),
                time: formatCardTime(first),
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

  const toggleVisibility = (id: string) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e)));

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
              <div key={i} className="h-[220px] w-full animate-pulse rounded-[8px] bg-gray-200" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-[8px] border border-dashed border-[#e2e2e2] bg-white px-6 py-16 text-center">
            <p className="text-base font-semibold text-gray-700">No events yet</p>
            <p className="mt-1 text-sm text-gray-400">Create your first event to see it here.</p>
            <Link
              href="/creators/events/create"
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0012FF] px-5 py-2.5 text-sm font-bold text-white"
            >
              <Plus size={14} strokeWidth={2.5} />
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onToggleVisibility={toggleVisibility} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
