import InfoPage from '@/components/InfoPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press | Reachly',
  description: 'Press and media kit.',
};

export default function Page() {
  return (
    <InfoPage
      title="Press"
      intro="News, brand information and media contact for Reachly."
      sections={[
        { title: "About Reachly", text: "Reachly is a Pakistan-based platform that lets people book paid one-on-one video sessions with creators they follow." },
        { title: "Media enquiries", text: "For interviews, statements, logos and brand assets, email support@reachly.pk with “Press” in the subject and your deadline." }
      ]}
    />
  );
}
