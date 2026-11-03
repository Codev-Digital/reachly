'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ActionDialog from '@/components/ActionDialog';
import FormInput from '@/components/FormInput';
import { ArrowLeft, LoaderCircle, Pencil, X } from 'lucide-react';

type WalletSummary = {
  availableBalance: number;
  lifetimeEarning: number;
  actualAvailableBalance: number;
  actualLifetimeEarning: number;
  totalPaidOut: number;
};

type PaymentRecord = {
  id: string;
  type: 'session' | 'event';
  reference: string;
  description: string;
  buyer: string;
  date: string;
  status: string;
  originalTotalAmount: number;
  originalPlatformAmount: number;
  totalAmount: number;
  platformAmount: number;
  proof: {
    screenshotUrl: string;
    sessionTitle: string;
    creatorName: string;
    creatorUsername: string;
    creatorAvatar: string;
    buyerName: string;
    buyerEmail: string;
    buyerAvatar: string;
  } | null;
};

type BalanceField = 'availableBalance' | 'lifetimeEarning';
type PaymentDisplayStatus = 'Pending' | 'Approved' | 'Rejected';
type EditState =
  | { type: 'balance'; field: BalanceField }
  | { type: 'payment'; payment: PaymentRecord }
  | null;

const formatPKR = (amount: number) => `PKR ${Number(amount || 0).toLocaleString('en-PK')}`;

const getPaymentDisplayStatus = (status: string): PaymentDisplayStatus => {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === 'paid' || normalizedStatus === 'confirmed' || normalizedStatus === 'completed') {
    return 'Approved';
  }
  if (normalizedStatus === 'failed' || normalizedStatus === 'refunded' || normalizedStatus === 'cancelled') {
    return 'Rejected';
  }
  return 'Pending';
};

const paymentStatusClasses: Record<PaymentDisplayStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-red-50 text-red-700',
};

export default function AdminCreatorWalletPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [creatorName, setCreatorName] = useState('Creator');
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState<EditState>(null);
  const [firstAmount, setFirstAmount] = useState('');
  const [secondAmount, setSecondAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [proofImageLoaded, setProofImageLoaded] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      setError('');
      const response = await fetch(`/api/admin/creators/${id}/wallet`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load creator wallet.');
      setCreatorName(data.creatorName);
      setWallet(data.wallet);
      setPayments(data.payments);
    } catch (loadError) {
      console.error('Failed to load creator wallet:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Unable to load creator wallet.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWallet();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadWallet]);

  const openBalanceEditor = (field: BalanceField) => {
    if (!wallet) return;
    setFirstAmount('');
    setSecondAmount('');
    setEdit({ type: 'balance', field });
  };

  const openPaymentEditor = (payment: PaymentRecord) => {
    setFirstAmount(String(payment.totalAmount));
    setSecondAmount(String(payment.platformAmount));
    setProofImageLoaded(false);
    setEdit({ type: 'payment', payment });
  };

  const submitEdit = async () => {
    if (!edit) return;
    const firstValue = Number(firstAmount);
    const secondValue = Number(secondAmount);
    if (!firstAmount.trim() || !Number.isFinite(firstValue) || firstValue < 0) {
      setError('Enter a valid non-negative amount.');
      return;
    }
    if (edit.type === 'payment' && (
      !Number.isFinite(secondValue) ||
      secondValue < 0 ||
      secondValue > edit.payment.totalAmount
    )) {
      setError('Platform amount must be between zero and the total payment amount.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const body = edit.type === 'balance'
        ? {
            type: 'balance',
            field: edit.field,
            value: firstValue,
          }
        : {
            type: 'payment',
            paymentType: edit.payment.type,
            paymentId: edit.payment.id,
            totalAmount: edit.payment.totalAmount,
            platformAmount: secondValue,
          };
      const response = await fetch(`/api/admin/creators/${id}/wallet`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save changes.');
      setEdit(null);
      await loadWallet();
    } catch (saveError) {
      console.error('Failed to update creator wallet:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Unable to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitEdit();
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-[#0012FF]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <Link
        href={`/admin/creators/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to creator profile
      </Link>

      <header className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0012FF]">Creator finances</p>
        <h1 className="mt-2 text-2xl font-black text-gray-950 sm:text-3xl">{creatorName}&apos;s wallet</h1>
        <p className="mt-2 text-sm text-gray-500">
          Review and adjust wallet balances and session or event payment records. Changes are saved separately from original amounts.
        </p>
      </header>

      {error && (
        <div role="alert" className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" aria-label="Dismiss error" onClick={() => setError('')}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {wallet && (
        <section className="grid gap-4 md:grid-cols-3">
          {([
            {
              field: 'availableBalance' as const,
              title: 'Available balance',
              value: wallet.availableBalance,
              actual: wallet.actualAvailableBalance,
              accent: 'text-[#0012FF]',
            },
            {
              field: 'lifetimeEarning' as const,
              title: 'Lifetime earnings',
              value: wallet.lifetimeEarning,
              actual: wallet.actualLifetimeEarning,
              accent: 'text-emerald-700',
            },
          ]).map((metric) => (
            <div key={metric.field} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{metric.title}</p>
                <button
                  type="button"
                  onClick={() => openBalanceEditor(metric.field)}
                  aria-label={`Edit ${metric.title.toLowerCase()}`}
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-[#0012FF]"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <p className={`mt-5 text-2xl font-black tabular-nums ${metric.accent}`}>{formatPKR(metric.value)}</p>
              <p className="mt-2 text-xs text-gray-400">Calculated balance: {formatPKR(metric.actual)}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total payouts</p>
            <p className="mt-5 text-2xl font-black tabular-nums text-amber-700">{formatPKR(wallet.totalPaidOut)}</p>
            <p className="mt-2 text-xs text-gray-400">Funded creator payouts and outgoing bookings</p>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold text-gray-950">Payment history</h2>
          <p className="mt-1 text-sm text-gray-500">Session bookings and event ticket purchases</p>
        </div>
        {payments.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">No payment records found for this creator.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  {['Payment', 'Buyer', 'Status', 'Total amount', 'Platform amount', 'Creator amount', ''].map((heading) => (
                    <th key={heading || 'action'} className={`px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 ${heading.includes('amount') || heading === 'Creator amount' ? 'text-right' : 'text-left'}`}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => {
                  const displayStatus = getPaymentDisplayStatus(payment.status);
                  const isPending = displayStatus === 'Pending';
                  return (
                  <tr key={`${payment.type}-${payment.id}`} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gray-900">{payment.type === 'event' ? 'Event payment' : 'Session booking'}</p>
                      <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">{payment.description}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-700">{payment.buyer}                    </td>
                    <td className="px-5 py-4">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => openPaymentEditor(payment)}
                          className={`inline-flex cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-bold transition-opacity hover:opacity-80 ${paymentStatusClasses[displayStatus]}`}
                          aria-label={`Review pending payment for ${payment.description}`}
                        >
                          {displayStatus}
                        </button>
                      ) : (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${paymentStatusClasses[displayStatus]}`}>{displayStatus}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-bold tabular-nums text-gray-900">{formatPKR(payment.totalAmount)}</p>
                      {payment.totalAmount !== payment.originalTotalAmount && (
                        <p className="mt-1 text-[10px] text-gray-400">Original: {formatPKR(payment.originalTotalAmount)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-semibold tabular-nums text-gray-600">{isPending ? '—' : formatPKR(payment.platformAmount)}</p>
                      {!isPending && payment.platformAmount !== payment.originalPlatformAmount && (
                        <p className="mt-1 text-[10px] text-gray-400">Original: {formatPKR(payment.originalPlatformAmount)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-bold tabular-nums text-emerald-700">{isPending ? '—' : formatPKR(payment.totalAmount - payment.platformAmount)}</td>
                    <td className="px-5 py-4 text-right">
                      {displayStatus !== 'Rejected' && (
                        <button
                          type="button"
                          onClick={() => openPaymentEditor(payment)}
                          aria-label={`Edit payment ${payment.reference}`}
                          className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-[#0012FF]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {edit?.type === 'balance' && wallet && (
        <ActionDialog
          open
          onOpenChange={(open) => {
            if (!open && !saving) setEdit(null);
          }}
          image={{ src: '/assets/booking-confirm-sm.webp', alt: '' }}
          title={<>Update <span className="text-[#0012FF]">{edit.field === 'availableBalance' ? 'Available Balance' : 'Lifetime Balance'}</span></>}
          description="Update the creator wallet balance without changing the calculated original."
          actions={[
            {
              label: 'Cancel',
              variant: 'outline',
              onClick: () => setEdit(null),
              disabled: saving,
              className: 'rounded-full border-gray-200 text-gray-700 hover:bg-gray-50',
            },
            {
              label: saving ? 'Saving...' : 'Save update',
              onClick: () => void submitEdit(),
              disabled: saving,
              className: 'rounded-full font-bold',
            },
          ]}
          classNames={{
            content: 'sm:max-w-[480px]',
            description: 'mb-2',
            imageWrapper: 'w-32 h-24 mt-0 mb-2',
          }}
        >
          <form
            className="mb-2 w-full space-y-4 text-left"
            onSubmit={saveEdit}
          >
            <div>
              <p className="mb-2 block font-[family-name:var(--font-inter-ui)] text-[12px] font-medium leading-[12px] text-black">
                Actual balance
              </p>
              <div className="w-full rounded-[8px] border border-[#e2e2e2] bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-500">
                {formatPKR(edit.field === 'availableBalance' ? wallet.actualAvailableBalance : wallet.actualLifetimeEarning)}
              </div>
            </div>
            <FormInput
              id="updated-creator-balance"
              label={edit.field === 'availableBalance' ? 'Update current balance' : 'Update lifetime balance'}
              type="number"
              min="0"
              step="1"
              required
              placeholder={edit.field === 'availableBalance' ? 'Update creator current balance' : 'Update creator lifetime balance'}
              value={firstAmount}
              onChange={(event) => {
                setFirstAmount(event.target.value);
                setError('');
              }}
              disabled={saving}
            />
            {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </form>
        </ActionDialog>
      )}

      {edit?.type === 'payment' && (
        getPaymentDisplayStatus(edit.payment.status) === 'Pending' ? (
          <ActionDialog
            open
            onOpenChange={(open) => {
              if (!open) setEdit(null);
            }}
            title={<>Review <span className="text-[#0012FF]">Payment Proof</span></>}
            description="Review the submitted payment proof before approving this pending payment."
            actions={[
              {
                label: 'Close',
                variant: 'outline',
                onClick: () => setEdit(null),
                className: 'rounded-full border-gray-200 text-gray-700 hover:bg-gray-50',
              },
              {
                label: 'Open full detail',
                onClick: () => {
                  const detailId = edit.payment.type === 'event'
                    ? `EVENT-${edit.payment.id}`
                    : edit.payment.id;
                  const returnTo = encodeURIComponent(`/admin/creators/${id}/wallet`);
                  router.push(`/admin/payments/${detailId}?returnTo=${returnTo}`);
                },
                className: 'rounded-full font-bold',
              },
            ]}
            classNames={{
              content: 'sm:max-w-[540px]',
              description: 'mb-2',
            }}
          >
            <div className="w-full space-y-4 text-left">
              {edit.payment.proof?.screenshotUrl ? (
                <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:h-52">
                  {!proofImageLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-gray-200" aria-label="Loading payment proof" />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={edit.payment.proof.screenshotUrl}
                    alt="Payment proof screenshot"
                    onLoad={() => setProofImageLoaded(true)}
                    onError={() => setProofImageLoaded(true)}
                    className={`max-h-40 w-full object-contain transition-opacity sm:max-h-48 ${proofImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
              ) : (
                <div className="flex h-44 w-full items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 text-center text-sm text-amber-700 sm:h-52">
                  Payment proof screenshot is unavailable.
                </div>
              )}
              <p className="truncate text-base font-bold text-gray-950" title={edit.payment.proof?.sessionTitle || edit.payment.description}>
                {edit.payment.proof?.sessionTitle || edit.payment.description}
              </p>
              <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={edit.payment.proof?.creatorAvatar || '/avatar.png'} alt="" className="h-11 w-11 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Creator</p>
                    <p className="truncate text-sm font-bold text-gray-900">{edit.payment.proof?.creatorName || creatorName}</p>
                    <p className="truncate text-xs text-gray-500">{edit.payment.proof?.creatorUsername || '—'}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={edit.payment.proof?.buyerAvatar || '/avatar.png'} alt="" className="h-11 w-11 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500">Buyer</p>
                      <p className="truncate text-sm font-bold text-gray-900">{edit.payment.proof?.buyerName || edit.payment.buyer}</p>
                      <p className="truncate text-xs text-gray-500">{edit.payment.proof?.buyerEmail || 'Email unavailable'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ActionDialog>
        ) : (
        <ActionDialog
          open
          onOpenChange={(open) => {
            if (!open && !saving) setEdit(null);
          }}
          image={{ src: '/assets/booking-confirm-sm.webp', alt: '' }}
          title={<>Update <span className="text-[#0012FF]">Payment Amount</span></>}
          description="Update the platform amount for this payment. The total payment amount cannot be changed."
          actions={[
            {
              label: 'Cancel',
              variant: 'outline',
              onClick: () => setEdit(null),
              disabled: saving,
              className: 'rounded-full border-gray-200 text-gray-700 hover:bg-gray-50',
            },
            {
              label: saving ? 'Saving...' : 'Save update',
              onClick: () => void submitEdit(),
              disabled: saving,
              className: 'rounded-full font-bold',
            },
          ]}
          classNames={{
            content: 'sm:max-w-[480px]',
            description: 'mb-2',
            imageWrapper: 'w-32 h-24 mt-0 mb-2',
          }}
        >
          <form className="mb-2 w-full space-y-4 text-left" onSubmit={saveEdit}>
            <div>
              <p className="mb-2 block font-[family-name:var(--font-inter-ui)] text-[12px] font-medium leading-[12px] text-black">
                Actual payment amount
              </p>
              <div className="w-full rounded-[8px] border border-[#e2e2e2] bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-500">
                {formatPKR(edit.payment.totalAmount)}
              </div>
            </div>
            <FormInput
              id="payment-platform-amount"
              label="Update platform amount"
              type="number"
              min="0"
              max={edit.payment.totalAmount}
              step="1"
              required
              suffix="PKR"
              placeholder="Update platform amount"
              value={secondAmount}
              onChange={(event) => {
                setSecondAmount(event.target.value);
                setError('');
              }}
              disabled={saving}
            />
            <p className="text-xs text-gray-500">
              Creator amount after the platform fee: {formatPKR(edit.payment.totalAmount - Number(secondAmount || 0))}
            </p>
            {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </form>
        </ActionDialog>
        )
      )}
    </div>
  );
}