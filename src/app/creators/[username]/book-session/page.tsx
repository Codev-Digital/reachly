'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
export default function BookSessionRedirect() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const fallbackUrl = searchParams.get('fallbackUrl');
    const returnTo = searchParams.get('returnTo');
    const query = new URLSearchParams();
    if (fallbackUrl) query.set('fallbackUrl', fallbackUrl);
    if (returnTo) query.set('returnTo', returnTo);
    const queryString = query.toString();
    const queryStr = queryString ? `?${queryString}` : '';
    router.replace(`/creators/${params.username}/book-session/step-1${queryStr}`);
  }, [router, params.username, searchParams]);

  return null;
}
