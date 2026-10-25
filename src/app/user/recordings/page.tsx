'use client';

import { useEffect, useState } from 'react';
import UserNavbar from '@/components/UserNavbar';
import RecordingsPage from '@/components/recordings/RecordingsPage';

export default function UserRecordingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.user) return;
        setDisplayName(data.user.name || '');
        setProfilePhoto(data.user.profilePhoto || null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />
      <RecordingsPage role="user" backHref="/user/dashboard" />
    </div>
  );
}
