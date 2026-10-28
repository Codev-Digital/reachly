import { redirect } from 'next/navigation';

export default async function LegacyAdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/events/${id}`);
}
