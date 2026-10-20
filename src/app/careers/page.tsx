import ComingSoon from '@/components/ComingSoon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | Reachly',
  description: 'Careers at Reachly.',
};

export default function CareersPage() {
  return <ComingSoon title="Careers" />;
}
