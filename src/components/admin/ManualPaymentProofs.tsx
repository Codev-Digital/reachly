'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ExternalLink, X } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ActionDialog from '@/components/ActionDialog';

type PaymentProof = {
  _id: string;
  isEventPayment?: boolean;
  bookingId?: string;
  bookingRef: string;
  payerName: string;
  payerEmail: string;
  creatorName: string;
  creatorUsername: string;
  sessionTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  tierTitle?: string;
  quantity?: number;
  paymentMethod: 'easypaisa' | 'jazzcash';
  amount: number;
  screenshotUrl: string;
  createdAt: string;
};

export default function ManualPaymentProofs() {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [proofToApprove, setProofToApprove] = useState<PaymentProof | null>(null);
  const [proofToReject, setProofToReject] = useState<PaymentProof | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
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

  const reviewProof = async (proofId: string, decision: 'approved' | 'rejected', remarks?: string, bookingId?: string, bookingRef?: string) => {
    setReviewingId(proofId);
    setError('');
    try {
      const response = await fetch('/api/admin/payment-proofs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId, decision, remarks, bookingId, bookingRef }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to review payment proof.');
      setProofs((current) => current.filter((proof) => proof._id !== proofId));
      setSelectedProof((current) => current?._id === proofId ? null : current);
      setProofToApprove(null);
      setProofToReject(null);
      setRejectRemarks('');
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Unable to review payment proof.');
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <>
      {/* <button
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
      </button> */}

      {/* ─── Main Proof List Dialog ─── */}
      <Dialog open={isOpen} onOpenChange={(o) => { if (!o) setIsOpen(false); }}>
        <DialogContent
          className="font-poppins max-w-5xl max-h-[92vh] overflow-hidden rounded-[32px] p-0 flex flex-col"
          showCloseButton={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
            <div>
              <DialogTitle className="text-left text-2xl sm:text-3xl font-bold text-black">
                <span className="text-[#0012FF] font-black">Manual</span> Payment Proofs
              </DialogTitle>
              <DialogDescription className="text-left text-gray-400 mt-1">
                {!loading && proofs.length > 0 ? (
                  <>
                    Check the transfer screenshot, then approve or reject each payment.{' '}
                    <span className="inline-flex ml-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                      {proofs.length} awaiting review
                    </span>
                  </>
                ) : (
                  'Check the transfer screenshot, then approve or reject each payment.'
                )}
              </DialogDescription>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => void loadProofs()}
                disabled={loading}
                className="rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                aria-label="Close manual payment proofs"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {loading ? (
              <p className="text-sm text-gray-500">Loading submitted proofs…</p>
            ) : proofs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-28 sm:w-36 aspect-[3/2] mb-3">
                  <Image
                    src="/assets/no-appointment.webp"
                    alt="No proofs awaiting review"
                    width={200}
                    height={140}
                    unoptimized
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-base font-bold text-gray-900">All Caught Up!</h3>
                <p className="mt-1 text-xs text-gray-500 max-w-sm">
                  No payment proofs are currently awaiting review.
                </p>
              </div>
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
                        {proof.isEventPayment
                          ? `${proof.sessionTitle} · ${proof.tierTitle || 'Ticket'} · ${proof.quantity || 1} ticket(s)`
                          : `${proof.sessionTitle} with ${proof.creatorName} (@${proof.creatorUsername})`}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(proof.scheduledDate).toLocaleDateString()} at {proof.scheduledTime} · {proof.bookingRef}
                      </p>
                      <Link
                        href={`/admin/payments/${proof.bookingId || proof.bookingRef}`}
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-[#0012FF] hover:underline"
                      >
                        View full details <ExternalLink className="h-3 w-3" />
                      </Link>
                      <div className="mt-auto flex flex-wrap gap-2 pt-4">
                        <button
                          type="button"
                          onClick={() => setProofToApprove(proof)}
                          disabled={reviewingId !== null}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                          Approve payment
                        </button>
                        <button
                          type="button"
                          onClick={() => { setProofToReject(proof); setRejectRemarks(''); }}
                          disabled={reviewingId !== null}
                          className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Screenshot Preview Dialog ─── */}
      <Dialog open={!!selectedProof} onOpenChange={(o) => { if (!o) setSelectedProof(null); }}>
        <DialogContent
          className="font-poppins max-w-6xl max-h-[96vh] overflow-hidden rounded-[32px] p-0 flex flex-col z-[115]"
          showCloseButton={false}
          overlayClassName="z-[110]"
          closeClassName=""
        >
          {selectedProof && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3.5 sm:px-6">
                <div className="min-w-0">
                  <DialogTitle className="text-left truncate text-lg sm:text-xl font-bold text-black">
                    <span className="text-[#0012FF] font-black">Payment</span> Screenshot · {selectedProof.bookingRef}
                  </DialogTitle>
                  <DialogDescription className="text-left text-gray-400 mt-0.5 capitalize">
                    {selectedProof.paymentMethod} · PKR {selectedProof.amount.toLocaleString()}
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProof(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                  aria-label="Close screenshot preview"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>

              {/* Image */}
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-gray-100 p-2 sm:p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProof.screenshotUrl}
                  alt={`Full-size transfer screenshot for booking ${selectedProof.bookingRef}`}
                  className="max-h-[calc(96vh-190px)] max-w-full object-contain"
                />
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3.5 sm:px-6">
                <p className="text-xs text-gray-500">{selectedProof.payerName} · {selectedProof.payerEmail}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setProofToReject(selectedProof); setRejectRemarks(''); }}
                    disabled={reviewingId !== null}
                    className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setProofToApprove(selectedProof)}
                    disabled={reviewingId !== null}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    Approve payment
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Approve Confirmation ActionDialog ─── */}
      <ActionDialog
        open={!!proofToApprove}
        onOpenChange={(o) => { if (!o) setProofToApprove(null); }}
        image={{ src: '/assets/booking-confirm-sm.webp', alt: 'Approve Payment' }}
        title="Approve This Payment?"
        description={[
          `You are about to approve the payment of PKR ${proofToApprove?.amount.toLocaleString()} from ${proofToApprove?.payerName || 'the client'}.`,
          `This will instantly confirm booking ${proofToApprove?.bookingRef} for session "${proofToApprove?.sessionTitle}".`,
        ]}
        actions={[
          {
            label: 'Cancel',
            variant: 'outline',
            onClick: () => setProofToApprove(null),
            disabled: reviewingId !== null,
          },
          {
            label: reviewingId === proofToApprove?._id ? 'Approving…' : 'Confirm Approval',
            variant: 'success',
            className: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold',
            disabled: reviewingId !== null,
            onClick: () => {
              if (proofToApprove) void reviewProof(proofToApprove._id, 'approved', undefined, proofToApprove.bookingId, proofToApprove.bookingRef);
            },
          },
        ]}
        classNames={{
          content: 'font-poppins max-w-md rounded-[32px] p-6 sm:p-8 z-[125]',
          overlay: 'z-[120]',
        }}
      />

      {/* ─── Reject Confirmation ActionDialog ─── */}
      <ActionDialog
        open={!!proofToReject}
        onOpenChange={(o) => {
          if (!o) {
            setProofToReject(null);
            setRejectRemarks('');
          }
        }}
        image={{ src: '/assets/cancel-appointment-sm.webp', alt: 'Reject Payment' }}
        title="Reject Payment"
        description={[
          `Are you sure you want to reject the payment of PKR ${proofToReject?.amount.toLocaleString()} from ${proofToReject?.payerName || 'the client'}?`,
          'Please provide a reason for rejecting this payment. This remark will be visible to the user.',
        ]}
        actions={[
          {
            label: 'Cancel',
            variant: 'outline',
            onClick: () => {
              setProofToReject(null);
              setRejectRemarks('');
            },
            disabled: reviewingId !== null,
          },
          {
            label: reviewingId === proofToReject?._id ? 'Processing…' : 'Reject Payment',
            variant: 'destructive',
            className: 'bg-rose-600 hover:bg-rose-700 text-white font-bold',
            disabled: reviewingId !== null || !rejectRemarks.trim(),
            onClick: () => {
              if (proofToReject) void reviewProof(proofToReject._id, 'rejected', rejectRemarks.trim(), proofToReject.bookingId, proofToReject.bookingRef);
            },
          },
        ]}
        classNames={{
          content: 'font-poppins max-w-md rounded-[32px] p-6 sm:p-8 z-[125]',
          overlay: 'z-[120]',
        }}
      >
        <div className="w-full mb-2 text-left">
          <label htmlFor="manual-reject-remarks" className="text-xs font-bold text-gray-700 mb-1.5 block">
            Admin Remarks <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="manual-reject-remarks"
            rows={3}
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            placeholder="e.g. Screenshot is blurry, amount doesn't match, wrong account number..."
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all resize-none"
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            This message will appear in the user&apos;s account under their booking.
          </p>
        </div>
      </ActionDialog>
    </>
  );
}
