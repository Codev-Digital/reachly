'use client';

import { useState } from 'react';
import ActionDialog from '@/components/ActionDialog';

type Action = 'approve' | 'reject' | 'suspend' | 'activate';
type Status = 'Active' | 'Pending' | 'Inactive' | 'Suspended' | 'Rejected' | 'Deleted';

const COPY: Record<Action, { button: string; title: string; ok: string; ask: string; variant: 'success' | 'destructive'; img: string; style: string; solid: string }> = {
  approve: {
    button: 'Accept', title: 'Accept Creator', ok: 'Creator approved successfully.',
    ask: 'Are you sure you want to accept this creator?', variant: 'success',
    img: '/assets/booking-confirm-sm.webp',
    style: 'border-[#12B76A]/30 bg-[#12B76A]/5 text-[#12B76A] hover:bg-[#12B76A]/10',
    solid: 'bg-emerald-600 hover:bg-emerald-700',
  },
  reject: {
    button: 'Reject', title: 'Reject Creator', ok: 'Creator rejected successfully.',
    ask: 'Are you sure you want to reject this creator?', variant: 'destructive',
    img: '/assets/cancel-appointment-sm.webp',
    style: 'border-[#EF4444]/30 bg-[#EF4444]/5 text-[#EF4444] hover:bg-[#EF4444]/10',
    solid: 'bg-rose-600 hover:bg-rose-700',
  },
  suspend: {
    button: 'Suspend', title: 'Suspend Creator', ok: 'Creator suspended successfully.',
    ask: 'Are you sure you want to suspend this creator? They will lose dashboard access.', variant: 'destructive',
    img: '/assets/cancel-appointment-sm.webp',
    style: 'border-[#F59E0B]/30 bg-[#F59E0B]/5 text-[#F59E0B] hover:bg-[#F59E0B]/10',
    solid: 'bg-amber-600 hover:bg-amber-700',
  },
  activate: {
    button: 'Re-activate', title: 'Re-activate Creator', ok: 'Creator re-activated successfully.',
    ask: 'Are you sure you want to re-activate this creator?', variant: 'success',
    img: '/assets/booking-confirm-sm.webp',
    style: 'border-[#12B76A]/30 bg-[#12B76A]/5 text-[#12B76A] hover:bg-[#12B76A]/10',
    solid: 'bg-emerald-600 hover:bg-emerald-700',
  },
};

// Which buttons each status offers
const BY_STATUS: Record<Status, Action[]> = {
  Pending: ['approve', 'reject'],
  Active: ['suspend'],
  Suspended: ['activate'],
  Rejected: ['activate'],
  Inactive: [],
  Deleted: ['activate'],
};

export default function CreatorStatusActions({
  userId,
  status,
  onChanged,
  className = '',
  solid = false,
}: {
  userId: string;
  status: Status;
  onChanged: () => void;
  className?: string;
  /** Full-size filled buttons (details page) instead of the compact outlined ones (table rows). */
  solid?: boolean;
}) {
  const [action, setAction] = useState<Action | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const start = (a: Action) => {
    setAction(a);
    setDone(false);
    setError('');
    setOpen(true);
  };

  const confirm = async () => {
    if (!action) return;
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) {
        setDone(true);
        onChanged();
      } else {
        setError((await res.json()).error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  const copy = action ? COPY[action] : null;

  return (
    <>
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        {BY_STATUS[status].map((a) => (
          <button
            key={a}
            onClick={() => start(a)}
            className={
              solid
                ? `px-6 py-2.5 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer active:scale-95 ${COPY[a].solid}`
                : `px-3.5 py-1.5 border rounded-full text-[10px] font-bold transition-colors ${COPY[a].style}`
            }
          >
            {status === 'Deleted' && a === 'activate' ? 'Restore' : COPY[a].button}
          </button>
        ))}
      </div>

      {copy && (
        <ActionDialog
          open={open}
          onOpenChange={setOpen}
          image={{ src: copy.img, alt: copy.title }}
          title={done ? 'Success!' : error ? 'Error' : copy.title}
          description={done ? copy.ok : error ? error : copy.ask}
          actions={
            done || error
              ? [{ label: 'OK', variant: copy.variant, onClick: () => setOpen(false) }]
              : [
                  { label: 'Cancel', variant: 'outline', onClick: () => setOpen(false) },
                  { label: copy.button, variant: copy.variant, onClick: confirm },
                ]
          }
        />
      )}
    </>
  );
}
