import StatusNotice from "@/components/StatusNotice";

export default async function AccountDeletedPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const params = new URLSearchParams({ subject: "Account deleted", ...(email ? { email } : {}) });
  return (
    <StatusNotice
      showNavbar={false}
      title="Account Deleted"
      message="This account has been deleted, so you can no longer log in with it. If you believe this was a mistake or want it restored, contact our support team."
      supportHref={`/contact-support?${params.toString()}`}
    />
  );
}
