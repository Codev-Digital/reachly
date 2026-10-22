'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatRemainingDuration, type SessionModificationAction } from '@/lib/time';

export interface ModificationWindowBlockedModalProps {
  open: boolean;
  onClose: () => void;
  /** Absolute start time in ms (UTC). Used to live-update remaining time. */
  startMs: number | null;
  action: SessionModificationAction;
  /** "session" | "event" — copy only. */
  kind?: 'session' | 'event';
}

const TITLE: Record<SessionModificationAction, string> = {
  cancel: 'Cancellation unavailable',
  reschedule: 'Reschedule unavailable',
  refund: 'Refund unavailable',
};

/**
 * Shown when the user tries to cancel / reschedule / refund inside the 24-hour window.
 * Highlights remaining time (e.g. "7 hours 32 mins remaining").
 */
export default function ModificationWindowBlockedModal({
  open,
  onClose,
  startMs,
  action,
  kind = 'session',
}: ModificationWindowBlockedModalProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!open) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [open, startMs]);

  if (!open) return null;

  const diffMs = startMs != null ? startMs - now : 0;
  const remainingLabel =
    diffMs > 0 ? formatRemainingDuration(diffMs) : kind === 'event' ? 'Event started' : 'Session started';
  const subject = kind === 'event' ? 'event' : 'session';

  return (
    <div
      className="fixed inset-0 z-[110] flex cursor-pointer items-center justify-center bg-black/45 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex w-full max-w-md cursor-default flex-col items-center overflow-hidden rounded-[28px] border border-gray-100 bg-white p-6 text-center shadow-2xl sm:rounded-[36px] sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mod-window-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="my-2 h-auto w-40 sm:w-52">
          <Image
            src="/assets/cancel-appointment.webp"
            alt=""
            width={220}
            height={160}
            className="h-auto w-full object-contain"
          />
        </div>

        <h3
          id="mod-window-title"
          className="mb-2 text-xl font-extrabold tracking-tight text-black sm:text-2xl"
        >
          {TITLE[action]}
        </h3>

        <div className="mb-4 w-full max-w-[300px] rounded-2xl border border-[#E8ECFF] bg-[#F4F6FF] px-4 py-3">
          
          <p className="mt-1 text-lg font-extrabold text-[#0012FF] sm:text-xl">
            {diffMs > 0 ? `${remainingLabel} remaining` : remainingLabel}
          </p>
        </div>

        <p className="mb-6 max-w-[300px] text-xs font-medium leading-relaxed text-gray-400 sm:text-sm">
          {diffMs <= 0
            ? `This ${subject} has already started, so it can no longer be ${
                action === 'refund' ? 'refunded' : action === 'cancel' ? 'cancelled' : 'rescheduled'
              }.`
            : `Changes and refunds are only available at least 24 hours before the ${subject} starts. With less than a day left, no refund can be issued.`}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full max-w-[260px] cursor-pointer rounded-full bg-[#0012FF] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#0010d0] active:scale-[0.98] sm:text-base"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
