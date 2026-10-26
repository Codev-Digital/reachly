'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutStatus message="Verifying payment…" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'checking' | 'paid' | 'error'>('checking');
  const [amountPkr, setAmountPkr] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let active = true;
    let attempts = 0;
    const verify = async () => {
      try {
        const response = await fetch(`/api/stripe/checkout-session?session_id=${encodeURIComponent(sessionId)}`);
        const data = await response.json();
        if (!active) return;
        if (response.ok && data.paid) {
          try {
            sessionStorage.removeItem('reachly_user_bookings_page_cache');
            sessionStorage.removeItem('reachly_user_dashboard_cache');
          } catch (error) {
            console.error('Unable to clear cached booking data after payment:', error);
          }
          if (data.currency === 'PKR' && typeof data.amount === 'number') setAmountPkr(data.amount);
          setStatus('paid');
          return;
        }
        attempts += 1;
        if (attempts < 6) window.setTimeout(verify, 1500);
        else setStatus('error');
      } catch {
        if (active) setStatus('error');
      }
    };

    void verify();
    return () => {
      active = false;
    };
  }, [sessionId]);

  if (!sessionId) return <CheckoutStatus message="We could not verify this payment." />;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F8FA] px-4">
      <section className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-950">
          {status === 'paid' ? 'Payment complete' : status === 'checking' ? 'Verifying payment…' : 'Payment status unavailable'}
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          {status === 'paid'
            ? 'Your purchase is confirmed. You can now view it in your dashboard.'
            : status === 'checking'
              ? 'Please wait while we confirm your payment securely.'
              : 'We could not confirm this payment yet. If your card was charged, please contact support before trying again.'}
        </p>
        {status === 'paid' && amountPkr !== null && (
          <p className="mt-4 text-lg font-bold text-[#0012FF]">
            PKR {amountPkr.toLocaleString('en-PK', { maximumFractionDigits: 2 })}
          </p>
        )}
        {status === 'paid' && (
          <Link href="/user/dashboard" className="mt-6 inline-flex rounded-full bg-[#0012FF] px-6 py-3 text-sm font-bold text-white">
            Go to dashboard
          </Link>
        )}
      </section>
    </main>
  );
}

function CheckoutStatus({ message }: { message: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F8FA] px-4">
      <section className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-950">Payment status</h1>
        <p className="mt-3 text-sm text-gray-600">{message}</p>
      </section>
    </main>
  );
}
