'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AdminDetailSkeleton } from '@/components/admin/AdminSkeletons';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ActionDialog from '@/components/ActionDialog';
import {
  ArrowLeft,
  Check,
  X,
  ExternalLink,
  Clock,
  CreditCard,
  User as UserIcon,
  Phone,
  Mail,
  Calendar,
  Video,
  ShieldCheck,
  AlertCircle,
  Copy,
  CheckCircle2,
  Sparkles,
  MapPin,
  FileText,
  DollarSign,
  Maximize2,
  Pencil
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentDetail {
  id: string;
  dbId: string;
  bookingRef: string;
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  date: string;
  time: string;
  amount: string;
  rawAmount: number;
  platformFee: string;
  creatorEarnings: string;
  status: 'Completed' | 'Pending' | 'Refunded' | 'Rejected';
  isCreatorPayout?: boolean;
  payout?: {
    id: string;
    bankName: string;
    accountNumber: string;
    requestedAt: string;
    fundedAt?: string | null;
    nextWithdrawDate: string;
    status: 'pending' | 'funded' | 'rejected';
    adminRemarks?: string;
  };
  adminRemarks?: string;
  session: {
    title: string;
    duration: string;
    durationMins: number;
    description?: string;
    features?: string[];
    scheduledDate: string;
    scheduledTime: string;
    meetingUrl?: string | null;
    meetingStartedAt?: string | null;
    meetingEndedAt?: string | null;
  };
  creator: {
    id?: string;
    name: string;
    username: string;
    avatar: string;
    email?: string;
    phone?: string;
    category?: string;
    bio?: string;
    city?: string;
    country?: string;
    earningsShare: string;
  };
  client: {
    id?: string | null;
    name: string;
    username: string;
    avatar: string;
    email: string;
    phone: string;
    isGuest: boolean;
    whatToDiscuss?: string;
    heardFrom?: string;
    answers?: Array<{
      question: string;
      answer: string | string[];
      type?: string;
    }>;
  };
  proof?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    screenshotUrl: string;
    payerName: string;
    payerEmail: string;
    amount: number;
    paymentMethod: string;
    reviewedAt?: string | null;
    reviewedBy?: string | null;
    submittedAt?: string | null;
    adminRemarks?: string;
  } | null;
}

export default function AdminPaymentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/payments?id=${id}`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setPayment(data.payment);
          if (data.payment?.adminRemarks || data.payment?.proof?.adminRemarks) {
            setRejectRemarks(data.payment.adminRemarks || data.payment.proof.adminRemarks);
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load payment:', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAccept = async () => {
    const proofId = payment?.proof?.id;
    const bookingId = payment?.dbId || payment?.id;
    const bookingRef = payment?.bookingRef;
    if (!proofId && !bookingId && !bookingRef) return;
    setReviewing(true);
    try {
      const res = await fetch('/api/admin/payment-proofs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofId,
          bookingId,
          bookingRef,
          decision: 'approved'
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to approve payment');
        return;
      }
      toast.success('Payment approved! Booking confirmed.');
      setPayment((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'Completed',
          paymentStatus: 'paid',
          bookingStatus: 'confirmed',
          proof: prev.proof
            ? {
                ...prev.proof,
                status: 'approved',
                reviewedAt: new Date().toLocaleString(),
                reviewedBy: 'Administrator',
              }
            : null,
        };
      });
      setShowAcceptModal(false);
    } catch (err) {
      toast.error('Failed to approve payment');
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    const proofId = payment?.proof?.id;
    const bookingId = payment?.dbId || payment?.id;
    const bookingRef = payment?.bookingRef;
    if (!proofId && !bookingId && !bookingRef) {
      toast.error('Payment identification missing.');
      return;
    }
    if (!rejectRemarks.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    setReviewing(true);
    try {
      const res = await fetch('/api/admin/payment-proofs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofId,
          bookingId,
          bookingRef,
          decision: 'rejected',
          remarks: rejectRemarks.trim()
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to reject payment');
        return;
      }
      toast.success('Payment rejected. Booking marked cancelled.');
      const savedRemarks = rejectRemarks.trim();
      setPayment((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'Rejected',
          paymentStatus: 'failed',
          bookingStatus: 'cancelled',
          adminRemarks: savedRemarks,
          proof: prev.proof
            ? {
                ...prev.proof,
                status: 'rejected',
                reviewedAt: new Date().toLocaleString(),
                reviewedBy: 'Administrator',
                adminRemarks: savedRemarks,
              }
            : {
                id: '',
                status: 'rejected',
                screenshotUrl: '',
                payerName: prev.client?.name || '',
                payerEmail: prev.client?.email || '',
                amount: prev.rawAmount,
                paymentMethod: prev.paymentMethod,
                reviewedAt: new Date().toLocaleString(),
                reviewedBy: 'Administrator',
                adminRemarks: savedRemarks,
              },
        };

      });
      setShowRejectModal(false);
      setRejectRemarks(savedRemarks);
    } catch (err) {
      toast.error('Failed to reject payment');
    } finally {
      setReviewing(false);
    }
  };

  const handleFundPayout = async () => {
    if (!payment?.payout?.id) return;
    setReviewing(true);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId: payment.payout.id, status: 'funded' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to mark payout as funded');
        return;
      }
      const fundedAt = data.payout?.fundedAt || new Date().toISOString();
      setPayment((prev) => prev ? {
        ...prev,
        status: 'Completed',
        payout: prev.payout ? { ...prev.payout, status: 'funded', fundedAt } : prev.payout,
      } : prev);
      setShowFundModal(false);
      toast.success('Payout marked as funded.');
    } catch (error) {
      toast.error('Failed to mark payout as funded');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) return <AdminDetailSkeleton />;

  if (notFound || !payment) {
    return (
      <div className="pb-12">
        <Link
          href="/admin/payments"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </Link>
        <div className="bg-white rounded-[32px] p-12 border border-gray-100 shadow-sm text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Payment Not Found</h1>
          <p className="text-sm text-gray-500 mb-6">
            This transaction could not be located. It might have been deleted or the identifier is invalid.
          </p>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0012FF] text-white rounded-full text-xs font-bold hover:bg-[#0012FF]/90 transition"
          >
            Return to All Payments
          </Link>
        </div>
      </div>
    );
  }

  if (payment.isCreatorPayout && payment.payout) {
    const payout = payment.payout;
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-16"
      >
        <Link href="/admin/payments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
            <span className="text-[#0012FF] font-black">Payout</span> Request Details
          </h1>
          <p className="text-gray-400 text-sm mt-1">Review the creator&apos;s withdrawal request and transfer details.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[20px] border border-gray-100 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Request ID</p>
                <p className="mt-1 text-sm font-bold text-gray-900">{payment.id}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
                payout.status === 'funded'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : payout.status === 'rejected'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}>
                {payout.status === 'funded' ? 'Funded' : payout.status === 'rejected' ? 'Rejected' : 'Pending'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div><p className="text-xs text-gray-400">Creator</p><p className="mt-1 font-bold text-gray-900">{payment.creator.name}</p><p className="text-xs text-gray-500">{payment.creator.email}</p></div>
              <div><p className="text-xs text-gray-400">Withdrawal amount</p><p className="mt-1 text-lg font-extrabold text-[#0012FF]">{payment.amount}</p></div>
              <div><p className="text-xs text-gray-400">Bank / wallet</p><p className="mt-1 font-bold text-gray-900">{payout.bankName}</p></div>
              <div><p className="text-xs text-gray-400">Account number</p><p className="mt-1 font-bold text-gray-900">{payout.accountNumber}</p></div>
              <div><p className="text-xs text-gray-400">Requested at</p><p className="mt-1 font-semibold text-gray-900">{new Date(payout.requestedAt).toLocaleString()}</p></div>
              <div><p className="text-xs text-gray-400">Next eligible payout</p><p className="mt-1 font-semibold text-gray-900">{new Date(payout.nextWithdrawDate).toLocaleString()}</p></div>
              {payout.fundedAt && <div><p className="text-xs text-gray-400">Funds sent at</p><p className="mt-1 font-semibold text-emerald-700">{new Date(payout.fundedAt).toLocaleString()}</p></div>}
            </div>
          </div>
          <div className="bg-white rounded-[20px] border border-gray-100 p-6 h-fit">
            <h2 className="text-base font-bold text-gray-900 mb-4">Admin action</h2>
            {payout.status === 'pending' ? (
              <button
                type="button"
                onClick={() => setShowFundModal(true)}
                disabled={reviewing}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {reviewing ? 'Saving...' : 'Mark funds sent'}
              </button>
            ) : (
              <p className="rounded-xl bg-gray-50 p-4 text-xs font-semibold text-gray-600">
                This payout has already been {payout.status === 'funded' ? 'marked as funded.' : 'rejected.'}
              </p>
            )}
          </div>
        </div>
        <ActionDialog
          open={showFundModal}
          onOpenChange={setShowFundModal}
          image={{
            src: '/assets/payout.svg',
            alt: 'Confirm payout transfer',
            width: 182,
            height: 60,
          }}
          title="Mark funds as sent?"
          description={[
            `Confirm that ${payment.amount} has been transferred to ${payout.bankName}.`,
            'This will record the transfer date and time and mark this payout as completed.',
          ]}
          actions={[
            {
              label: 'Cancel',
              variant: 'outline',
              onClick: () => setShowFundModal(false),
              className: 'rounded-full border-gray-200 text-gray-700 hover:bg-gray-50',
            },
            {
              label: reviewing ? 'Saving...' : 'Confirm transfer',
              variant: 'success',
              onClick: handleFundPayout,
              disabled: reviewing,
              className: 'rounded-full font-bold',
            },
          ]}
        />
      </motion.div>
    );
  }

  const isPendingProof = payment.proof && payment.proof.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="pb-16"
    >
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </Link>

        {/* Quick status chips */}
        {/* <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
            {payment.id}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0012FF] border border-blue-100">
            Ref: {payment.bookingRef}
          </span>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              payment.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : payment.status === 'Pending'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {payment.status === 'Completed' ? 'Payment Verified' : payment.status === 'Pending' ? 'Payment Pending' : payment.status === 'Rejected' ? 'Payment Rejected' : 'Refunded'}
          </span>
        </div> */}
      </div>

      {/* Page Title & Main Overview */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
          <span className="text-[#0012FF] font-black">Transaction</span> Details
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Review manual payment proof, client booking answers, and creator earnings.
        </p>
      </div>

      {/* Main Grid: 2 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Payment Proof Screenshot & Actions (lg: 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Proof Card */}
          <div className="bg-white rounded-[12px] p-6 border border-[#e2e2e2] relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Payment Screenshot</h3>
                  <p className="text-xs text-gray-400 capitalize">{payment.paymentMethod} transfer</p>
                </div>
              </div>

              {payment.proof && (
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    payment.proof.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : payment.proof.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {payment.proof.status === 'approved'
                    ? 'Proof Approved'
                    : payment.proof.status === 'rejected'
                    ? 'Proof Rejected'
                    : 'Awaiting Admin Review'}
                </span>
              )}
            </div>

            {/* Screenshot Preview */}
            {payment.proof?.screenshotUrl ? (
              <div className="relative group">
                <div
                  onClick={() => setIsScreenshotModalOpen(true)}
                  className="w-full h-80 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer relative hover:border-[#0012FF]/60 transition-all shadow-inner"
                >
                  <img
                    src={payment.proof.screenshotUrl}
                    alt={`Payment proof for ${payment.bookingRef}`}
                    className="w-full h-full object-contain transition group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs backdrop-blur-xs">
                    <Maximize2 className="w-4 h-4" />
                    <span>Click to view full size</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setIsScreenshotModalOpen(true)}
                    className="text-[#0012FF] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open in full size
                  </button>
                  <span className="text-gray-400">
                    {payment.proof.submittedAt ? `Submitted: ${payment.proof.submittedAt}` : ''}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <CreditCard className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-xs font-semibold text-gray-600">No manual screenshot required</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  This transaction was processed automatically through Stripe Card Checkout.
                </p>
              </div>
            )}

            {/* Proof Details List */}
            {payment.proof && (
              <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3.5 text-xs">
                <div>
                  <span className="text-gray-400 font-medium block">Payer Name</span>
                  <span className="font-bold text-gray-900 mt-0.5 block truncate">
                    {payment.proof.payerName || payment.client.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Payer Email</span>
                  <span className="font-bold text-gray-900 mt-0.5 block truncate">
                    {payment.proof.payerEmail || payment.client.email}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Claimed Amount</span>
                  <span className="font-bold text-[#0012FF] mt-0.5 block">
                    PKR {payment.proof.amount?.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-medium block">Wallet / Channel</span>
                  <span className="font-bold text-gray-900 capitalize mt-0.5 block">
                    {payment.proof.paymentMethod}
                  </span>
                </div>
              </div>
            )}

            {/* Review Decision Buttons if Pending */}
            {isPendingProof && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-700 mb-3">Admin Decision</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAcceptModal(true)}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                    <span>Accept</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="py-3 px-4 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" strokeWidth={3} />
                    <span>Rejected</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  Approving will instantly confirm the booking and notify the creator & client.
                </p>
              </div>
            )}

            {/* If Already Reviewed or Rejected */}
            {((payment.proof && payment.proof.status !== 'pending') || payment.paymentStatus === 'failed' || payment.bookingStatus === 'cancelled') && (
              <div
                className={`mt-6 p-4 rounded-2xl flex flex-col gap-2.5 border ${
                  payment.proof?.status === 'approved'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50/80 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {payment.proof?.status === 'approved' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs flex-1 min-w-0">
                    <p className="font-bold">
                      {payment.proof?.status === 'approved' ? 'Payment Approved' : 'Payment Rejected'}
                    </p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Reviewed by {payment.proof?.reviewedBy || 'Administrator'}{' '}
                      {payment.proof?.reviewedAt ? `on ${payment.proof.reviewedAt}` : ''}
                    </p>
                  </div>
                </div>

                {/* Show Admin Remarks / Reason Box */}
                {(payment.proof?.status === 'rejected' || payment.paymentStatus === 'failed' || payment.bookingStatus === 'cancelled') && (
                  <div className="mt-1 pt-2.5 border-t border-rose-200">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Remarks / Reason</p>
                    <p className="text-xs font-bold text-rose-950 mt-1 whitespace-pre-line break-words">
                      {payment.proof?.adminRemarks || payment.adminRemarks || 'The submitted payment proof could not be verified by the admin team.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectRemarks(payment.proof?.adminRemarks || payment.adminRemarks || '');
                        setShowRejectModal(true);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition cursor-pointer shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Remarks / Reason</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-[12px] p-6 border border-[#e2e2e2]">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#0012FF]" /> Financial Breakdown
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Session Fee Paid</span>
                <span className="font-extrabold text-sm text-gray-900">{payment.amount}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Platform Fee (20%)</span>
                <span className="font-bold text-gray-700">{payment.platformFee}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Creator Payout (80%)</span>
                <span className="font-bold text-emerald-600">{payment.creatorEarnings}</span>
              </div>
              <div className="flex items-center justify-between py-2 pt-3">
                <span className="text-gray-500 font-medium">Payment Method</span>
                <span className="font-bold text-gray-900 capitalize">{payment.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Creator Details, Client Details, and Session Info (lg: 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Creator Profile Card */}
          <div className="bg-white rounded-[12px] p-6 border border-[#e2e2e2]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0012FF]/20 shrink-0 shadow-sm">
                  <img
                    src={payment.creator.avatar || '/avatar.png'}
                    alt={payment.creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-950">{payment.creator.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0012FF] border border-blue-100">
                      Creator
                    </span>
                    {payment.creator.category && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                        {payment.creator.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{payment.creator.username}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Net Earnings
                </span>
                <span className="text-base font-extrabold text-emerald-600 block mt-0.5">
                  {payment.creator.earningsShare}
                </span>
              </div>
            </div>

            {/* Creator Contact & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 bg-gray-50/70 border border-[#e2e2e2] rounded-[8px]">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-gray-400 font-medium block">Creator Email</span>
                  <p className="font-semibold text-gray-900 truncate">
                    {payment.creator.email || 'Not available'}
                  </p>
                </div>
                {payment.creator.email && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(payment.creator.email!, 'Creator Email')}
                    className="text-gray-400 hover:text-gray-700 p-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-gray-50/70 border border-[#e2e2e2] rounded-[8px]">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-gray-400 font-medium block">Phone / WhatsApp</span>
                  <p className="font-semibold text-gray-900 truncate">
                    {payment.creator.phone || 'Not available'}
                  </p>
                </div>
              </div>
            </div>

            {payment.creator.bio && (
              <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50 leading-relaxed line-clamp-2">
                <span className="font-semibold text-gray-700">Bio:</span> {payment.creator.bio}
              </p>
            )}
          </div>

          {/* Client Details Card */}
          <div className="bg-white rounded-[12px] p-6 border border-[#e2e2e2]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                  <img
                    src={payment.client.avatar || '/avatar.png'}
                    alt={payment.client.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-950">{payment.client.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100">
                      {payment.client.isGuest ? 'Guest Booker' : 'Registered Client'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{payment.client.username}</p>
                </div>
              </div>
            </div>

            {/* Client Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 bg-gray-50/70 border border-[#e2e2e2] rounded-[8px]">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-gray-400 font-medium block">Client Email</span>
                  <p className="font-semibold text-gray-900 truncate">{payment.client.email}</p>
                </div>
                {payment.client.email && payment.client.email !== 'Not provided' && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(payment.client.email, 'Client Email')}
                    className="text-gray-400 hover:text-gray-700 p-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-gray-50/70 border border-[#e2e2e2] rounded-[8px]">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-gray-400 font-medium block">Phone / WhatsApp</span>
                  <p className="font-semibold text-gray-900 truncate">{payment.client.phone}</p>
                </div>
              </div>
            </div>

            {/* Client Pre-session note / discussion goals */}
            {/* {payment.client.whatToDiscuss && (
              <div className="mt-4 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs">
                <span className="font-bold text-[#0012FF] block mb-1">What the client wants to discuss:</span>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {payment.client.whatToDiscuss}
                </p>
              </div>
            )} */}

            {/* Pre-session custom answers if any */}
            {payment.client.answers && payment.client.answers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs">
                <span className="font-bold text-gray-800 block">Pre-session Question Answers:</span>
                {payment.client.answers.map((ans, idx) => (
                  <div key={idx} className="p-2.5 bg-gray-50 rounded-xl">
                    <p className="font-semibold text-gray-700">{ans.question}</p>
                    <p className="text-gray-900 font-medium mt-0.5">
                      {Array.isArray(ans.answer) ? ans.answer.join(', ') : ans.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session & Booking Details Card */}
          <div className="bg-white rounded-[12px] p-6 border border-[#e2e2e2]">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0012FF]" /> Session & Schedule Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50/80 border border-[#e2e2e2] rounded-[8px]">
                <span className="text-gray-400 font-medium block">Session Package</span>
                <span className="font-bold text-sm text-gray-900 mt-0.5 block">{payment.session.title}</span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">{payment.session.duration}</span>
              </div>

              <div className="p-3 bg-gray-50/80 border border-[#e2e2e2] rounded-[8px]">
                <span className="text-gray-400 font-medium block">Scheduled Date & Time</span>
                <span className="font-bold text-sm text-gray-900 mt-0.5 block">
                  {payment.session.scheduledDate}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  at {payment.session.scheduledTime} (PKT)
                </span>
              </div>
            </div>

            {/* Daily.co Meeting Link if generated */}
            {payment.session.meetingUrl && (
              <div className="mt-4 p-3 bg-[#EEF2FF] rounded-[12px] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Video className="w-4 h-4 text-[#0012FF] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#0012FF] block uppercase tracking-wider">
                      Daily.co Video Room
                    </span>
                    <a
                      href={payment.session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-800 hover:text-[#0012FF] truncate block hover:underline"
                    >
                      {payment.session.meetingUrl}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payment.session.meetingUrl!, 'Meeting Room URL')}
                  className="px-3 py-1.5 bg-white text-[#0012FF] rounded-lg font-bold text-[11px] hover:bg-blue-50 transition shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── FULL-SIZE SCREENSHOT DIALOG ─── */}
      <Dialog open={isScreenshotModalOpen && !!payment.proof?.screenshotUrl} onOpenChange={(o) => { if (!o) setIsScreenshotModalOpen(false); }}>
        <DialogContent
          className="font-poppins max-w-5xl max-h-[92vh] overflow-hidden rounded-[32px] p-0 flex flex-col"
          showCloseButton={false}
        >
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-left text-2xl sm:text-3xl font-bold text-black">
                <span className="text-[#0012FF] font-black">Payment</span> Proof Screenshot
              </DialogTitle>
              <DialogDescription className="text-left text-gray-400 mt-1">
                {payment.proof?.payerName} · {payment.amount} via {payment.paymentMethod} · {payment.bookingRef}
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => setIsScreenshotModalOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-8 flex items-center justify-center min-h-[300px]">
            {payment.proof?.screenshotUrl && (
              <img
                src={payment.proof.screenshotUrl}
                alt={`Full size proof for ${payment.bookingRef}`}
                className="max-w-full max-h-[68vh] object-contain rounded-xl shadow-lg"
              />
            )}
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white">
            <a
              href={payment.proof?.screenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#0012FF] flex items-center gap-1.5 hover:underline"
            >
              <ExternalLink className="w-4 h-4" /> Open original image in new tab
            </a>

            {isPendingProof ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setIsScreenshotModalOpen(false); setShowRejectModal(true); }}
                  className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
                >
                  Reject Payment
                </button>
                <button
                  type="button"
                  onClick={() => { setIsScreenshotModalOpen(false); setShowAcceptModal(true); }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" strokeWidth={3} />
                  Accept Payment
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsScreenshotModalOpen(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close Preview
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Accept Confirmation Dialog ─── */}
      <ActionDialog
        open={showAcceptModal}
        onOpenChange={(o) => { if (!o) setShowAcceptModal(false); }}
        image={{ src: '/assets/booking-confirm-sm.webp', alt: 'Approve Payment' }}
        title="Approve This Payment?"
        description={[
          // `You are about to approve the payment from ${payment?.client?.name || 'the client'} for ${payment?.amount || ''}.`,
          // 'This will instantly confirm the booking and unlock the meeting for the client.',
          ""
        ]}
        actions={[
          {
            label: 'Cancel',
            variant: 'outline',
            onClick: () => setShowAcceptModal(false),
            disabled: reviewing,
          },
          {
            label: reviewing ? 'Processing…' : 'Confirm Approval',
            variant: 'success',
            className: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold',
            onClick: handleAccept,
            disabled: reviewing,
          },
        ]}
        classNames={{
          content: 'font-poppins max-w-md rounded-[32px] p-6 sm:p-8',
        }}
      >
        <div className="w-full bg-gray-50 rounded-2xl p-4 text-xs space-y-2 mb-2 text-left border border-gray-100">
          <div className="flex justify-between">
            <span className="text-gray-500">Booking Ref</span>
            <span className="font-bold text-gray-900">{payment?.bookingRef}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Creator</span>
            <span className="font-bold text-gray-900">{payment?.creator?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Session</span>
            <span className="font-bold text-gray-900">{payment?.session?.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-bold text-gray-900 capitalize">{payment?.paymentMethod}</span>
          </div>
        </div>
      </ActionDialog>

      {/* ─── Reject Dialog with Remarks ─── */}
      <ActionDialog
        open={showRejectModal}
        onOpenChange={(o) => { if (!o) setShowRejectModal(false); }}
        image={{ src: '/assets/cancel-appointment-sm.webp', alt: 'Reject Payment' }}
        title="Reject Payment"
        description={[
          ""
        ]}
        actions={[
          {
            label: 'Cancel',
            variant: 'outline',
            onClick: () => setShowRejectModal(false),
            disabled: reviewing,
          },
          {
            label: reviewing ? 'Processing…' : 'Reject Payment',
            variant: 'destructive',
            className: 'bg-rose-600 hover:bg-rose-700 text-white font-bold',
            onClick: handleReject,
            disabled: reviewing || !rejectRemarks.trim(),
          },
        ]}
        classNames={{
          content: 'font-poppins max-w-md rounded-[32px] p-6 sm:p-8',
        }}
      >
        <div className="w-full mb-2 text-left">
          <label htmlFor="admin-remarks" className="text-xs font-bold text-gray-700 mb-1.5 block">
            Admin Remarks <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="admin-remarks"
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
    </motion.div>
  );
}
