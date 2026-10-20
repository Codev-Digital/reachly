import ComingSoon from '@/components/ComingSoon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | Reachly',
  description: 'Upcoming events on Reachly.',
};

export default function EventsPage() {
  return <ComingSoon title="Events" />;
}
