'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useBooking } from '../layout';

export default function RemovedBookingStepTwo() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setBooking } = useBooking();
  const query = searchParams.toString();

  useEffect(() => {
    setBooking((booking) => ({ ...booking, step: 1 }));
    router.replace(
      `/creators/${params.username}/book-session/step-1${query ? `?${query}` : ''}`
    );
  }, [params.username, query, router, setBooking]);

  return null;
}
