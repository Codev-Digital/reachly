'use client';

import RecordingsPage from '@/components/recordings/RecordingsPage';

export default function AdminRecordingsPage() {
  return (
    <RecordingsPage
      role="admin"
      backHref="/admin/dashboard"
      apiUrl="/api/admin/recordings"
    />
  );
}
