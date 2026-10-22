'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ActionDialog from '@/components/ActionDialog';

const COMMA_SVGS = ['/assets/comma-1.svg', '/assets/comma-2.svg', '/assets/comma3.svg'];

export type AdminReviewReportItem = {
  id: string;
  status: 'pending' | 'verified' | 'dismissed' | 'deleted';
  reason: string;
  createdAt: string;
  reporterName: string;
  reporterEmail?: string;
  clientName: string;
  clientAvatar?: string | null;
  creatorName: string;
  creatorAvatar?: string | null;
  review: {
    id: string;
    rating: number;
    comment: string;
    isHidden: boolean;
    bookingRef: string;
    createdAt: string;
  } | null;
};

type ConfirmAction = 'deleted' | 'dismissed';

const ACTION_COPY: Record<
  ConfirmAction,
  {
    title: string;
    description: string[];
    confirmLabel: string;
    success: string;
    variant: 'destructive' | 'outline' | 'default' | 'success';
    img: string;
  }
> = {
  deleted: {
    title: 'Delete this review?',
    description: [
      'This permanently removes the client review from the platform.',
      'The report will be closed as resolved.',
    ],
    confirmLabel: 'Delete',
    success: 'Review deleted and report closed.',
    variant: 'destructive',
    img: '/assets/cancel-appointment-sm.webp',
  },
  dismissed: {
    title: 'Mark as valid?',
    description: [
      'The report will be dismissed and the review stays visible.',
      'Use this when the review does not violate guidelines.',
    ],
    confirmLabel: 'Valid',
    success: 'Report dismissed — review remains visible.',
    variant: 'success',
    img: '/assets/booking-confirm-sm.webp',
  },
};

function formatDate(value?: string | null) {
  if (!value) return 'Recent';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recent';
  }
}

type Props = {
  report: AdminReviewReportItem;
  commaIdx?: number;
  onResolved?: (reportId: string) => void;
  /** When false, hide action buttons (already resolved) */
  showActions?: boolean;
};

export default function AdminReviewReportCard({
  report,
  commaIdx = 0,
  onResolved,
  showActions,
}: Props) {
  const [pendingAction, setPendingAction] = useState<ConfirmAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const canAct =
    showActions !== false && (report.status === 'pending' || showActions === true);

  const runAction = async () => {
    if (!pendingAction || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id, action: pendingAction }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not update report.');
        return;
      }
      toast.success(ACTION_COPY[pendingAction].success);
      setDone(true);
      onResolved?.(report.id);
    } catch (err) {
      console.error(err);
      toast.error('Could not update report.');
    } finally {
      setBusy(false);
    }
  };

  const copy = pendingAction ? ACTION_COPY[pendingAction] : null;
  const rating = report.review?.rating || 0;

  return (
    <>
      <div className="relative flex min-h-[260px] flex-col justify-between rounded-[8px] border border-[#e2e2e2] bg-[#F8F8FA] p-6 transition-all hover:scale-[1.01] hover:shadow-sm">
        <img
          src={COMMA_SVGS[commaIdx % 3]}
          alt=""
          className="pointer-events-none absolute top-4 right-4 h-14 w-14 object-contain"
        />

        <div>
          <div className="mb-4 flex items-center gap-3 pr-12">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-200">
              <Image
                src={report.clientAvatar || '/avatar.png'}
                alt={report.clientName}
                width={44}
                height={44}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="text-sm font-extrabold leading-tight text-black sm:text-base">
                {report.clientName}
              </p>
              <p className="mt-0.5 text-xs font-medium text-gray-400">
                {formatDate(report.review?.createdAt || report.createdAt)}
              </p>
            </div>
          </div>

          <div className="mb-4 h-px w-full bg-gray-200/80" />

          <p className="mb-4 font-sans text-xs font-medium leading-relaxed text-gray-500 sm:text-sm">
            &ldquo;{report.review?.comment || 'No written feedback.'}&rdquo;
          </p>

          <div className="mb-4 rounded-xl border border-gray-200/80 bg-white p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-7 w-7 overflow-hidden rounded-full border border-gray-100 bg-gray-100">
                <Image
                  src={report.creatorAvatar || '/avatar.png'}
                  alt={report.creatorName}
                  width={28}
                  height={28}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
              
                <p className="truncate text-xs font-semibold text-gray-700">
                  {report.creatorName}
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 sm:text-sm">
              {report.reason || 'No reason provided.'}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, si) => (
                <Star
                  key={si}
                  className={`h-3.5 w-3.5 ${
                    si < rating
                      ? 'fill-[#F5C542] text-[#F5C542]'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                report.status === 'pending'
                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                  : report.status === 'verified' || report.status === 'deleted'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}
            >
              {report.status === 'deleted' ? 'deleted' : report.status}
            </span>
          </div>

          {canAct && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  setPendingAction('deleted');
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 py-2 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  setPendingAction('dismissed');
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                Valid
              </button>
            </div>
          )}
        </div>
      </div>

      {copy && (
        <ActionDialog
          open={!!pendingAction}
          onOpenChange={(open) => {
            if (!open) {
              setPendingAction(null);
              setDone(false);
            }
          }}
          image={{ src: copy.img, alt: copy.title }}
          title={done ? 'Done' : copy.title}
          description={done ? copy.success : copy.description}
          actions={
            done
              ? [
                  {
                    label: 'Close',
                    variant: 'default',
                    onClick: () => {
                      setPendingAction(null);
                      setDone(false);
                    },
                  },
                ]
              : [
                  {
                    label: 'Cancel',
                    variant: 'outline',
                    onClick: () => setPendingAction(null),
                  },
                  {
                    label: busy ? 'Saving…' : copy.confirmLabel,
                    variant: copy.variant,
                    disabled: busy,
                    onClick: () => void runAction(),
                  },
                ]
          }
        />
      )}
    </>
  );
}
