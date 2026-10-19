import AccountStatusPage from "@/components/AccountStatusPage";

export default function RejectedPage() {
  return (
    <AccountStatusPage
      title="Request Rejected"
      message="Unfortunately your account request was not approved. If you think this is a mistake, contact our support team and they will get in touch with the admin."
      subject="Account rejected"
    />
  );
}
