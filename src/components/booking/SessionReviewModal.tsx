'use client';

import { useEffect, useState } from 'react';
import { Rating, ThinStar } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { toast } from 'sonner';

const COMMENT_MAX = 250;

const ratingStyles = {
  itemShapes: ThinStar,
  activeFillColor: '#FACC15',
  inactiveFillColor: '#E5E7EB',
};

export interface SessionReviewTarget {
  bookingId: string;
  peerName: string;
  /** Session length label, e.g. 15 */
  durationMins: number;
}

interface SessionReviewModalProps {
  open: boolean;
  onClose: () => void;
  target: SessionReviewTarget | null;
  /** user = both stars + note required; creator = both optional */
  role: 'user' | 'creator';
  /** Called after a successful submit or skip so UI can switch to Meeting Completed */
  onSubmitted?: (bookingId: string) => void;
}

/**
 * Post-meeting review popup.
 * User: rating + comment required (cannot dismiss without submitting).
 * Creator: optional — can skip.
 */
export default function SessionReviewModal({
  open,
  onClose,
  target,
  role,
  onSubmitted,
}: SessionReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const required = role === 'user';

  useEffect(() => {
    if (open) {
      setRating(0);
      setComment('');
      setSaving(false);
    }
  }, [open, target?.bookingId]);

  if (!open || !target) return null;

  const mins = target.durationMins > 0 ? target.durationMins : 15;
  const peer = target.peerName?.trim() || (role === 'user' ? 'your creator' : 'your client');

  const submit = async (skip = false) => {
    if (saving) return;

    if (!skip && required) {
      if (!rating) {
        toast.error('Please select a star rating.');
        return;
      }
      if (!comment.trim()) {
        toast.error('Please write a short review.');
        return;
      }
    }

    if (!skip && role === 'creator' && !rating && !comment.trim()) {
      onSubmitted?.(target.bookingId);
      onClose();
      return;
    }

    setSaving(true);
    try {
      if (skip && role === 'creator') {
        onSubmitted?.(target.bookingId);
        onClose();
        return;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: target.bookingId,
          rating: skip || !rating ? undefined : rating,
          comment: skip ? '' : comment.trim(),
          sessionDurationMins: mins,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not save your review.');
        return;
      }
      if (!skip) toast.success(required ? 'Thanks for your review!' : 'Feedback saved');
      onSubmitted?.(target.bookingId);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Could not save your review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="presentation"
      onClick={required ? undefined : () => !saving && void submit(true)}
    >
      <div
        className="relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-[28px] border border-gray-100 bg-white p-6 text-center shadow-2xl sm:rounded-[36px] sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-review-title"
      >
        {!required && (
          <button
            type="button"
            onClick={() => void submit(true)}
            disabled={saving}
            className="absolute top-5 right-5 cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#0012FF]/80">
          Session complete
        </p>
        <h3
          id="session-review-title"
          className="mb-5 max-w-[320px] text-xl font-extrabold tracking-tight text-black sm:text-2xl"
        >
          How&apos;s your {mins}min session with{' '}
          <span className="text-[#0012FF]">{peer}</span>?
        </h3>

        <div className="mb-5 flex w-full max-w-[240px] justify-center">
          <Rating
            style={{ maxWidth: 220 }}
            value={rating}
            onChange={setRating}
            itemStyles={ratingStyles}
            transition="zoom"
          />
        </div>

        <div className="mb-2 w-full text-left">
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
            Note {required ? <span className="text-red-500">*</span> : null}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
            rows={4}
            maxLength={COMMENT_MAX}
            placeholder={
              required
                ? 'Share how the session went…'
                : 'Add a private note about this session (optional)'
            }
            className="w-full resize-none rounded-2xl border border-gray-200 bg-[#F8F8FA] px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#0012FF] focus:bg-white"
          />
          <p className="mt-1 text-right text-[11px] text-gray-400">
            {comment.length}/{COMMENT_MAX}
          </p>
        </div>

        <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
          {!required && (
            <button
              type="button"
              onClick={() => void submit(true)}
              disabled={saving}
              className="flex-1 cursor-pointer rounded-full border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={() => void submit(false)}
            disabled={saving || (required && (!rating || !comment.trim()))}
            className="flex-1 cursor-pointer rounded-full bg-[#0012FF] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#0010d0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : required ? 'Submit Review' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
