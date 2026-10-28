import InfoPage from '@/components/InfoPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | Reachly',
  description: 'Reachly pricing and session rates.',
};

export default function Page() {
  return (
    <InfoPage
      title="Pricing"
      intro="Free to join. Creators set their own prices; Reachly only earns when a session is booked."
      sections={[
        { title: "For fans", items: ["Creating an account and browsing creators is free.", "Each creator sets their own session types, durations and prices, shown in PKR before you book.", "You pay securely at checkout and the booking is confirmed once payment is verified.", "Cancellations and refunds follow our Cancellation and Refund Policies."] },
        { title: "For creators", items: ["No sign-up or monthly fees.", "Set your own session prices, packages and events.", "Reachly charges a platform fee on each successful booking. See the Terms and Conditions for the current rate.", "Earnings are paid out to your bank account on your chosen payout frequency."] }
      ]}
    />
  );
}
