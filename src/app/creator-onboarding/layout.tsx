'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import CreatorNavbar from '@/components/CreatorNavbar';

export default function CreatorOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <p className="text-[#C8A97E] font-serif text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <CreatorNavbar />
      {children}
    </>
  );
}