'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BookSessionRedirect() {
  const params = useParams();
  const router = useRouter();
  
  useEffect(() => {
    router.push(`/creators/${params.username}/book-session/step-1`);
  }, [router, params.username]);

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
      <p className="text-[#C8A97E] font-serif text-lg animate-pulse">Redirecting...</p>
    </div>
  );
}
