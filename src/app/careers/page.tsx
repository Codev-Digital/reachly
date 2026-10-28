import InfoPage from '@/components/InfoPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | Reachly',
  description: 'Careers at Reachly.',
};

export default function Page() {
  return (
    <InfoPage
      title="Careers"
      intro="Help us build the place where creators and their audiences meet."
      sections={[
        { title: "Open roles", text: "We do not have any open roles listed right now, but we are always glad to hear from talented people in engineering, design, operations and community." },
        { title: "How to reach us", text: "Send a short note about yourself and your work, with links to anything you are proud of, through the contact form. Put “Careers” in the subject." }
      ]}
    />
  );
}
