'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserNavbar from '@/components/UserNavbar';
import EventCard, { EventCardData } from '@/components/EventCard';
import { richTextPreview } from '@/lib/richText';
import { formatEventCardDate, formatEventCardTime, formatEventLocation } from '@/lib/eventDisplay';

export default function UserEventsPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('reachly_user_settings_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.name) setDisplayName(parsed.name);
        if (parsed.profilePhoto) setProfilePhoto(parsed.profilePhoto);
      }
    } catch {
      /* ignore */
    }

    (async () => {
      try {
        const [meRes, eventsRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch('/api/events'),
        ]);

        if (meRes.ok) {
          const data = await meRes.json();
          setDisplayName(data.user?.name || '');
          setProfilePhoto(data.user?.profilePhoto || null);
        }

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          const mapped: EventCardData[] = (data.events || []).map((e: any) => {
            const first = e.dates?.[0];
            return {
              id: e.id,
              title: e.title,
              description: richTextPreview(e.description, 140) || 'No description yet.',
              date: formatEventCardDate(first?.date),
              time: formatEventCardTime(first),
              location: formatEventLocation(e),
              image: e.bannerUrl || undefined,
              visible: true,
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

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />

      <main className="mx-auto max-w-[1536px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-8">
          <p className="mb-1 text-sm font-medium text-gray-400 sm:text-base">
            Hello {displayName ? displayName.split(' ')[0] : 'there'}!
          </p>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-black sm:text-3xl lg:text-4xl">
            Discover <span className="text-[#0012FF]">Events</span>{' '}
            <span className="text-base font-normal text-gray-400 sm:text-lg">from creators</span>
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[270px] w-full animate-pulse rounded-[8px] bg-gray-200" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-[8px] border border-dashed border-[#e2e2e2] bg-white px-6 py-16 text-center">
            <p className="text-base font-semibold text-gray-700">No events yet</p>
            <p className="mt-1 text-sm text-gray-400">Published creator events will show up here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={(eventId) => router.push(`/user/events/${eventId}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
