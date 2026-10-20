import ComingSoon from '@/components/ComingSoon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Guidelines | Reachly',
  description: 'Reachly community guidelines, safety rules, and platform conduct.',
};

export default function GuidelinesPage() {
  return (
    <ComingSoon
      title="Community Guidelines"
      subtitle="We are crafting comprehensive safety, conduct, and ethics guidelines to ensure Reachly remains a respectful and trusted space for everyone."
      badge="Safety & Trust"
    />
  );
}
