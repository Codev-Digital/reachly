import ComingSoon from '@/components/ComingSoon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | Reachly',
  description: 'Join the Reachly team. Careers and opportunities coming soon.',
};

export default function CareersPage() {
  return (
    <ComingSoon
      title="Careers at Reachly"
      subtitle="We are building the future of creator monetization in Pakistan. Job openings and internship programs will be announced soon!"
      badge="Join Our Team"
    />
  );
}
