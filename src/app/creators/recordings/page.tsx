'use client';

import { useEffect, useState } from 'react';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import RecordingsPage from '@/components/recordings/RecordingsPage';

export default function CreatorRecordingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setDisplayName(data.creatorProfile?.displayName || data.user?.name || '');
        setProfilePhoto(
          data.creatorProfile?.profilePhoto || data.user?.profilePhoto || null
        );
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <CreatorDashboardNav displayName={displayName} profilePhoto={profilePhoto} />
      <RecordingsPage role="creator" backHref="/creators/dashboard" />
    </div>
  );
}
