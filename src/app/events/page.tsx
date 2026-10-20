import ComingSoon from '@/components/ComingSoon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | Reachly',
  description: 'Upcoming creator events, live webinars, and interactive masterclasses.',
};

export default function EventsPage() {
  return (
    <ComingSoon
      title="Upcoming Events"
      subtitle="Exclusive live webinars, creator masterclasses, and Q&A sessions are in the works. Stay tuned for exciting announcements!"
      badge="Workshops & Masterclasses"
    />
  );
}
