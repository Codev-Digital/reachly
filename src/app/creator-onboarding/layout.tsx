'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApproval = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          // If user has approval status pending, redirect
          if (data.user.approvalStatus === 'pending') {
            router.push('/creators/pending-approval');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkApproval();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center">
        <p className="text-[#0012FF] text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}