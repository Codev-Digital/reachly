import AccountStatusPage from "@/components/AccountStatusPage";

export default function SuspendedPage() {
  return (
    <AccountStatusPage
      title="Account Suspended"
      message="Your account has been suspended by the admin team, so you can't access your dashboard right now. Contact our support team if you'd like to know why or to appeal."
      subject="Account suspended"
    />
  );
}
