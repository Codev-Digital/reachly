import ComingSoon from '@/components/ComingSoon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Sessions | Reachly',
  description: 'Transparent pricing for 1:1 creator sessions and mentorship in Pakistan.',
};

export default function PricingPage() {
  return (
    <ComingSoon
      title="Transparent Pricing"
      subtitle="Every creator sets their own transparent session rates in PKR. No hidden fees or surprise charges. Full platform rate breakdowns are coming soon!"
      badge="Pay Per Session"
    />
  );
}
