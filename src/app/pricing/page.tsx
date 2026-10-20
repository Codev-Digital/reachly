import ComingSoon from '@/components/ComingSoon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | Reachly',
  description: 'Reachly pricing and session rates.',
};

export default function PricingPage() {
  return <ComingSoon title="Pricing" />;
}
