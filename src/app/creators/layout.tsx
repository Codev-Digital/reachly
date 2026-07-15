'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import CreatorNavbar from '@/components/CreatorNavbar';
import LoadingAnimation from '@/components/LoadingAnimation';

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApproval = async () => {
      // Don't check on the pending-approval page itself to avoid infinite loops
      if (pathname === '/creators/pending-approval') {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          // If user is pending approval, redirect to pending page
          if (data.user.approvalStatus && data.user.approvalStatus === 'pending') {
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
  }, [pathname, router]);

  if (loading) return <LoadingAnimation />;

  return (
    <>
      {pathname !== '/creators/pending-approval' && !pathname.includes('/book-session') && <CreatorNavbar />}
      {children}
    </>
  );
}