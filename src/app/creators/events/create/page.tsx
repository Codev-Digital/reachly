'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import EventFormSection from '@/components/events/EventFormSection';
import TicketingFields from '@/components/events/TicketingFields';
import { emptyTicketing, type TicketingValues } from '@/lib/eventTicketing';
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
    title: 'Available Slots',
    description: 'Organize your event with flexible dates and time slots.',
  },
  {
    id: 'policy',
    title: 'Policy',
    description: 'Set the rules and policies attendees should know before booking.',
  },
];

export default function CreateEventPage() {
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<SectionId | null>('basic');

  const [basicInfo, setBasicInfo] = useState<BasicInfoValues>(emptyBasicInfo());
  const [basicErrors, setBasicErrors] = useState<BasicInfoErrors>({});
  const [ticketing, setTicketing] = useState<TicketingValues>(emptyTicketing());

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

  const toggle = (id: SectionId) => setOpenSection((cur) => (cur === id ? null : id));

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
            Create Your Next <span className="text-[#0012FF]">Event</span>{' '}
            <span className="text-gray-400 font-normal text-base sm:text-lg">in simple steps</span>
          </h1>
        </div>

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
                  onChange={(patch) => setBasicInfo((prev) => ({ ...prev, ...patch }))}
                  clearError={(key) =>
                    setBasicErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
                  }
                />
              ) : section.id === 'ticketing' ? (
                <TicketingFields values={ticketing} onChange={setTicketing} />
              ) : (
                <p className="py-6 text-center text-sm text-gray-400">This section is coming soon.</p>
              )}
            </EventFormSection>
          ))}
        </div>
      </main>
    </div>
  );
}
