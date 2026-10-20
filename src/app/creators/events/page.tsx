'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import EventCard, { EventCardData } from '@/components/EventCard';

// UI-only placeholder data until the events API exists.
const SAMPLE_EVENTS: EventCardData[] = Array.from({ length: 9 }, (_, i) => ({
  id: String(i + 1),
  title: 'Creator Growth',
  description: 'Grow your audience and brand.',
  date: '5 July 2026',
  time: '2PM - 6PM',
  location: 'Nishat Hotel, Gulberg, Lahore',
  visible: true,
}));

export default function CreatorEventsPage() {
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [events, setEvents] = useState<EventCardData[]>(SAMPLE_EVENTS);

  useEffect(() => {
    // Reuse the nav's cached profile first so the header doesn't flash.
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

  const toggleVisibility = (id: string) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e)));

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      <main className="mx-auto max-w-[1536px] px-4 py-8 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-gray-400 font-medium mb-1 text-sm sm:text-base">Hello {displayName ? displayName : 'Sophia Reed'}!</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight font-sans">
              Manage Your <span className="text-[#0012FF]">Events</span> <span className="text-gray-400 font-normal text-base sm:text-lg">with ease</span>
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

        {/* Events grid: each card is a fixed 440 x 220 tile */}
        <div className="grid justify-center gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,440px),440px))] sm:justify-start">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onToggleVisibility={toggleVisibility} />
          ))}
        </div>
      </main>
    </div>
  );
}
