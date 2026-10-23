/** Client-only flag: review modal should open only after a real meeting ended. */

export type PendingSessionReview = {
  bookingId: string;
  peerName: string;
  durationMins: number;
};

const keyFor = (bookingId: string) => `reachly_pending_session_review:${bookingId}`;

export function storePendingSessionReview(target: PendingSessionReview) {
  try {
    sessionStorage.setItem(keyFor(target.bookingId), JSON.stringify(target));
  } catch {
    /* ignore */
  }
}

export function clearPendingSessionReview(bookingId: string) {
  try {
    sessionStorage.removeItem(keyFor(bookingId));
  } catch {
    /* ignore */
  }
}

/** Returns the first pending review flag still in sessionStorage (if any). */
export function readAnyPendingSessionReview(): PendingSessionReview | null {
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key?.startsWith('reachly_pending_session_review:')) continue;
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as PendingSessionReview;
      if (parsed?.bookingId) return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}
