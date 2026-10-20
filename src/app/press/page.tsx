import ComingSoon from '@/components/ComingSoon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press | Reachly',
  description: 'Press and media kit.',
};

export default function PressPage() {
  return <ComingSoon title="Press" />;
}
