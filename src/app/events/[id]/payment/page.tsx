'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Upload } from 'lucide-react';

export default function EventPaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<'easypaisa' | 'jazzcash'>('easypaisa');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [purchase, setPurchase] = useState<{ eventTitle: string; tierTitle: string; tierPrice: number; quantity: number; eventDate: string } | null>(null);

  useEffect(() => {
    const purchaseId = searchParams.get('purchaseId');
    if (!purchaseId) return;
    fetch(`/api/events/${params.id}/payment-proof?purchaseId=${encodeURIComponent(purchaseId)}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load purchase.');
        setPurchase(data.purchase);
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
    <main className="min-h-screen bg-[#F8F8FA] px-4 py-10">
      <div className="mx-auto max-w-xl rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <button type="button" onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black">
          <ArrowLeft className="h-4 w-4" /> Back to event
        </button>
        <h1 className="text-2xl font-black text-gray-950">Complete event payment</h1>
        <p className="mt-2 text-sm text-gray-500">Choose EasyPaisa or JazzCash, transfer the amount shown by the organizer, and upload your screenshot.</p>
        {purchase && (
          <div className="mt-5 rounded-2xl border border-[#e2e2e2] bg-[#F8F8FA] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{purchase.eventTitle}</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{purchase.tierTitle}</p>
            <p className="mt-2 text-lg font-black text-[#0012FF]">PKR {(purchase.tierPrice * purchase.quantity).toLocaleString()}</p>
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {(['easypaisa', 'jazzcash'] as const).map((value) => (
            <button key={value} type="button" onClick={() => setMethod(value)} className={`rounded-2xl border px-4 py-4 text-sm font-bold capitalize ${method === value ? 'border-[#0012FF] bg-[#EEF2FF] text-[#0012FF]' : 'border-gray-200 text-gray-600'}`}>
              {value}
            </button>
          ))}
        </div>
        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-5 py-10 text-center hover:border-[#0012FF]">
          <Upload className="mb-3 h-7 w-7 text-[#0012FF]" />
          <span className="text-sm font-bold text-gray-800">{file ? file.name : 'Upload payment screenshot'}</span>
          <span className="mt-1 text-xs text-gray-400">JPEG, PNG, or WebP up to 5 MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        </label>
        {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <button type="button" onClick={() => void submit()} disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0012FF] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
          <ShieldCheck className="h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit payment proof'}
        </button>
      </div>
    </main>
  );
}
