import InfoPage from '@/components/InfoPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guidelines | Reachly',
  description: 'Reachly community guidelines.',
};

export default function Page() {
  return (
    <InfoPage
      title="Guidelines"
      intro="The rules that keep Reachly safe, respectful and useful for everyone."
      sections={[
        { title: "For everyone", items: ["Be respectful. Harassment, hate speech, threats and discrimination are not tolerated.", "Use your real identity and keep your account details accurate.", "Keep all bookings, payments and conversations on Reachly.", "Do not share explicit, illegal or misleading content in sessions, chats or profiles.", "Never record or share a session without the other person’s consent."] },
        { title: "For creators", items: ["Describe your sessions honestly and deliver what you promise.", "Keep your availability current and join sessions on time.", "Do not ask fans to pay outside the platform.", "Give guidance only on topics you are qualified to speak about; do not give guaranteed medical, legal or financial outcomes.", "Cancel or reschedule early if you cannot make it. Repeated no-shows can lead to suspension."] },
        { title: "For fans", items: ["Join on time. A missed session without cancelling is treated as completed.", "Cancel or reschedule within the window set in our Cancellation Policy.", "Leave honest, constructive reviews."] },
        { title: "Reporting and enforcement", text: "If something feels wrong, contact support with the details. Violations can lead to a warning, suspension or removal from Reachly, and refunds are handled under our Refund Policy." }
      ]}
    />
  );
}
