'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingAnimation from '@/components/LoadingAnimation';

export default function BookSessionRedirect() {
  const params = useParams();
  const router = useRouter();
  
  useEffect(() => {
    router.push(`/creators/${params.username}/book-session/step-1`);
  }, [router, params.username]);

  return <LoadingAnimation />;
}
