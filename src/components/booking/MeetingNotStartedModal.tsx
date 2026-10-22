'use client';

import Image from 'next/image';

interface MeetingNotStartedModalProps {
  open: boolean;
  onClose: () => void;
  creatorName: string;
}

/**
 * Shown when a user tries to join before the creator has pressed Start Meeting.
 */
export default function MeetingNotStartedModal({
  open,
  onClose,
  creatorName,
}: MeetingNotStartedModalProps) {
  if (!open) return null;

  const name = creatorName?.trim() || 'Your creator';

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
        aria-labelledby="meeting-wait-title"
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

        <div className="mb-6 mt-2 h-auto w-40 sm:w-52">
          <Image
            src="/assets/meeting.png"
            alt=""
            width={220}
            height={160}
            className="h-auto w-full object-contain"
            unoptimized
          />
        </div>

        <h3
          id="meeting-wait-title"
          className="mb-2 text-xl font-extrabold tracking-tight text-black sm:text-2xl"
        >
          Meeting not started yet
        </h3>

        <p className="mb-3 max-w-[300px] text-xs font-medium leading-relaxed text-gray-500 sm:text-sm">
          <span className="font-bold text-gray-800">{name}</span> {" "} hasn&apos;t started the meeting yet.
        </p>
        <p className="mb-6 max-w-[300px] text-xs font-medium leading-relaxed text-gray-400 sm:text-sm">
          We&apos;ll notify you via WhatsApp or email when{' '}
          <span className="font-semibold text-gray-600">{name}</span> starts the meeting.
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
