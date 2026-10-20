import ComingSoon from '@/components/ComingSoon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press & Media | Reachly',
  description: 'Reachly press releases, brand assets, and media kit.',
};

export default function PressPage() {
  return (
    <ComingSoon
      title="Press & Media"
      subtitle="Our press releases, official media kits, brand guidelines, and news coverage will be available here soon."
      badge="Media Center"
    />
  );
}
