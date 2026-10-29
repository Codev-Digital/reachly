'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Check, Clock3, ShieldCheck, Upload } from 'lucide-react';
import UserNavbar from '@/components/UserNavbar';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import type { CreatorInfo } from '@/app/creators/[username]/book-session/layout';

type EventPaymentDetails = {
  eventTitle: string;
  tierTitle: string;
  tierPrice: number;
  quantity: number;
  eventDate: string;
  eventStartTime?: string;
};

type EventDetails = {
  title: string;
  bannerUrl: string;
  creator: CreatorInfo | null;
};

export default function EventPaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<'easypaisa' | 'jazzcash'>('easypaisa');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [purchase, setPurchase] = useState<EventPaymentDetails | null>(null);
  const [event, setEvent] = useState<EventDetails | null>(null);

  useEffect(() => {
    const purchaseId = searchParams.get('purchaseId');
    if (!purchaseId) return;
    Promise.all([
      fetch(`/api/events/${params.id}/payment-proof?purchaseId=${encodeURIComponent(purchaseId)}`, { cache: 'no-store' }),
      fetch(`/api/events/${params.id}`, { cache: 'no-store' }),
    ])
      .then(async ([purchaseResponse, eventResponse]) => {
        const purchaseData = await purchaseResponse.json();
        const eventData = await eventResponse.json();
        if (!purchaseResponse.ok) throw new Error(purchaseData.error || 'Unable to load purchase.');
        if (!eventResponse.ok) throw new Error(eventData.error || 'Unable to load event.');
        const creatorUsername = eventData.event?.creator?.username;
        const creatorResponse = creatorUsername
          ? await fetch(`/api/creators/${encodeURIComponent(creatorUsername)}`, { cache: 'no-store' })
          : null;
        const creatorData = creatorResponse?.ok ? await creatorResponse.json() : null;
        setPurchase(purchaseData.purchase);
        setEvent({
          ...eventData.event,
          creator: creatorData?.creator || eventData.event.creator,
        });
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load purchase.'));
  }, [params.id, searchParams]);

  const submit = async () => {
    if (!file) return setError('Upload your payment screenshot to continue.');
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.set('purchaseId', searchParams.get('purchaseId') || '');
      formData.set('paymentMethod', method);
      formData.set('screenshot', file);
      const response = await fetch(`/api/events/${params.id}/payment-proof`, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to submit payment proof.');
      router.replace('/user/dashboard?eventPayment=pending');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8FA] pb-12">
      <UserNavbar displayName="" profilePhoto={null} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* <button type="button" onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#0012FF]">
          <ArrowLeft className="h-4 w-4" /> Back to event
        </button> */}
        <div className="mb-8">
          {/* <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0012FF]">Event booking</p> */}
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Complete your payment</h1>
          {/* <p className="mt-2 max-w-2xl text-sm text-gray-500">Transfer the ticket amount using one of the available wallets, then upload your payment screenshot for admin verification.</p> */}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[370px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-6">
            <CreatorProfileCard
              creator={event?.creator ?? null}
              mobileMode="full"
            />
          </div>

          <section className="rounded-[16px] border border-[#e2e2e2] bg-white p-4  sm:p-6">
            <div className="overflow-hidden rounded-[20px] bg-gray-100">
              {event?.bannerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.bannerUrl} alt={purchase?.eventTitle || 'Event'} className="h-56 w-full object-cover sm:h-72" />
              ) : <div className="h-56 bg-gradient-to-br from-[#0012FF] to-indigo-500 sm:h-72" />}
            </div>
            <div className="border-b border-gray-100 py-5">
              <h2 className="text-2xl font-black text-gray-950">{purchase?.eventTitle || 'Event ticket'}</h2>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#0012FF]" /> {purchase?.eventDate || 'Selected date'}</span>
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#0012FF]" /> {purchase?.eventStartTime || 'Event time'}</span>
                <span className="font-bold text-gray-900">{purchase ? `${purchase.tierTitle} · PKR ${(purchase.tierPrice * purchase.quantity).toLocaleString()}` : 'Loading ticket...'}</span>
              </div>
            </div>
            <div className="pt-5">
              <h3 className="text-lg font-black text-gray-950">Choose payment method</h3>
              <p className="mt-1 text-sm text-gray-500">Only EasyPaisa and JazzCash payments are accepted for this event.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {(['easypaisa', 'jazzcash'] as const).map((value) => (
                  <button key={value} type="button" onClick={() => setMethod(value)} className={`relative flex h-20 items-center justify-center rounded-2xl border-2 bg-white p-4 transition ${method === value ? 'border-[#0012FF] bg-[#EEF2FF]' : 'border-gray-100 hover:border-gray-300'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value === 'easypaisa' ? '/assets/easypaisa-horizontal.png' : '/assets/jazzcash.png'} alt={value === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} className="max-h-10 max-w-[150px] object-contain" />
                    {method === value && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0012FF] text-white"><Check className="h-3 w-3" /></span>}
                  </button>
                ))}
              </div>
              <label className="mt-5 block cursor-pointer">
                <span className="mb-2 block text-sm font-bold text-gray-800">Payment screenshot</span>
                <span className="flex min-h-28 items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-6 text-center transition hover:border-[#0012FF]">
                  <Upload className="h-6 w-6 shrink-0 text-[#0012FF]" />
                  <span><strong className="block text-sm text-gray-800">{file ? file.name : 'Upload your payment screenshot'}</strong><small className="mt-1 block text-xs text-gray-400">JPEG, PNG, or WebP up to 5 MB</small></span>
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              </label>
              {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
              <button type="button" onClick={() => void submit()} disabled={submitting || !purchase} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#0012FF] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0010d0] disabled:opacity-50">
                <ShieldCheck className="h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit payment for verification'}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
