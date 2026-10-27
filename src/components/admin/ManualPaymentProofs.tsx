'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, ExternalLink, X } from 'lucide-react';

type PaymentProof = {
  _id: string;
  bookingRef: string;
  payerName: string;
  payerEmail: string;
  creatorName: string;
  creatorUsername: string;
  sessionTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  paymentMethod: 'easypaisa' | 'jazzcash';
  amount: number;
  screenshotUrl: string;
  createdAt: string;
};

export default function ManualPaymentProofs() {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [error, setError] = useState('');

  const loadProofs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/payment-proofs');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load payment proofs.');
      setProofs(data.proofs || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load payment proofs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchProofs = async () => {
      try {
        const response = await fetch('/api/admin/payment-proofs');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load payment proofs.');
        if (!cancelled) setProofs(data.proofs || []);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load payment proofs.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchProofs();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isOpen && !selectedProof) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (selectedProof) setSelectedProof(null);
      else setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, selectedProof]);

  const reviewProof = async (proofId: string, decision: 'approved' | 'rejected') => {
    setReviewingId(proofId);
    setError('');
    try {
      const response = await fetch('/api/admin/payment-proofs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId, decision }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to review payment proof.');
      setProofs((current) => current.filter((proof) => proof._id !== proofId));
      setSelectedProof((current) => current?._id === proofId ? null : current);
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Unable to review payment proof.');
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mb-8 inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#0012FF]/40 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0012FF] focus-visible:ring-offset-2"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] text-sm font-bold text-[#0012FF]">₨</span>
        <span>
          <span className="block text-sm font-bold text-gray-900">Manual payment proofs</span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {loading ? 'Loading review queue…' : `${proofs.length} awaiting review`}
          </span>
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-payment-proofs-title"
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-2xl"
          >
            <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 id="manual-payment-proofs-title" className="text-lg font-bold text-gray-950">Manual payment proofs</h2>
                  {!loading && proofs.length > 0 && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                      {proofs.length} awaiting review
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">Check the transfer screenshot, then approve or reject each payment.</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadProofs()}
                  disabled={loading}
                  className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Close manual payment proofs"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {loading ? (
          <p className="text-sm text-gray-500">Loading submitted proofs…</p>
        ) : proofs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
            No payment proofs are awaiting review.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {proofs.map((proof) => (
              <article key={proof._id} className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-[160px_1fr]">
                <button
                  type="button"
                  onClick={() => setSelectedProof(proof)}
                  className="group block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0012FF] focus-visible:ring-offset-2"
                  aria-label={`Open large payment screenshot for booking ${proof.bookingRef}`}
                >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proof.screenshotUrl}
                  alt={`Transfer screenshot for booking ${proof.bookingRef}`}
                  className="h-40 w-full rounded-lg border border-gray-200 bg-gray-50 object-contain transition group-hover:border-[#0012FF]/40"
                />
                  <span className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#0012FF]">
                    <ExternalLink className="h-3.5 w-3.5" /> Open screenshot
                  </span>
                </button>
                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold capitalize text-gray-900">{proof.paymentMethod}</p>
                    <span className="text-sm font-semibold text-gray-300">·</span>
                    <p className="text-sm font-bold tabular-nums text-gray-900">PKR {proof.amount.toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{proof.payerName} · {proof.payerEmail}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {proof.sessionTitle} with {proof.creatorName} (@{proof.creatorUsername})
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(proof.scheduledDate).toLocaleDateString()} at {proof.scheduledTime} · {proof.bookingRef}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => void reviewProof(proof._id, 'approved')}
                      disabled={reviewingId !== null}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {reviewingId === proof._id ? 'Approving…' : 'Approve payment'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void reviewProof(proof._id, 'rejected')}
                      disabled={reviewingId !== null}
                      className="rounded-lg border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {reviewingId === proof._id ? 'Processing…' : 'Reject'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
            </div>
          </section>
        </div>
      )}

      {selectedProof && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/85 p-3 backdrop-blur-sm sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedProof(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-proof-title"
            className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3.5 sm:px-6">
              <div className="min-w-0">
                <h3 id="payment-proof-title" className="truncate text-sm font-bold text-gray-950">
                  Payment screenshot · {selectedProof.bookingRef}
                </h3>
                <p className="mt-0.5 text-xs capitalize text-gray-500">
                  {selectedProof.paymentMethod} · PKR {selectedProof.amount.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close screenshot preview"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-gray-100 p-2 sm:p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProof.screenshotUrl}
                alt={`Full-size transfer screenshot for booking ${selectedProof.bookingRef}`}
                className="max-h-[calc(96vh-190px)] max-w-full object-contain"
              />
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3.5 sm:px-6">
              <p className="text-xs text-gray-500">{selectedProof.payerName} · {selectedProof.payerEmail}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void reviewProof(selectedProof._id, 'rejected')}
                  disabled={reviewingId !== null}
                  className="rounded-lg border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => void reviewProof(selectedProof._id, 'approved')}
                  disabled={reviewingId !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {reviewingId === selectedProof._id ? 'Approving…' : 'Approve payment'}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
