'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import LoadingAnimation from '@/components/LoadingAnimation';

export default function BookSessionRedirect() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const fallbackUrl = searchParams.get('fallbackUrl');
    const queryStr = fallbackUrl ? `?fallbackUrl=${encodeURIComponent(fallbackUrl)}` : '';
    router.replace(`/creators/${params.username}/book-session/step-1${queryStr}`);
  }, [router, params.username, searchParams]);

  return <LoadingAnimation />;
}
