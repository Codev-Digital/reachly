export type NormalizedReferralStatus = 'rewarded' | 'pending' | 'rejected';

export interface ReferralActivityLike {
  _id?: string;
  type?: string;
  activityTime?: string | Date;
  totalAmount?: number;
  status?: string;
  sessionId?: unknown;
  bookingId?: unknown;
  paymentMethod?: string;
}

export interface ReferralBookingLike {
  _id?: unknown;
  userId?: unknown;
  sessionTypeId?: unknown;
  paymentMethod?: string | null;
  paymentStatus?: string;
  status?: string;
  createdAt?: string | Date;
}

export interface ReferralItemLike {
  _id: string;
  joinnee?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  buyActivity?: ReferralActivityLike | null;
  paymentMethod?: string;
}

export function getReferralShortId(id: string): string {
  return `REF-${String(id || '').slice(-5).toUpperCase()}`;
}

export function normalizeReferralStatus(
  rawStatus?: string | null
): NormalizedReferralStatus {
  const clean = String(rawStatus || '').trim().toLowerCase();
  if (clean === 'completed' || clean === 'rewarded') return 'rewarded';
  if (clean === 'rejected' || clean === 'cancelled' || clean === 'refunded') {
    return 'rejected';
  }
  return 'pending';
}

export function normalizeReferralPaymentMethod(
  rawMethod?: string | null
): string {
  const compact = String(rawMethod || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
  if (!compact || compact === '—' || compact === '-' || compact === 'free') {
    return '—';
  }
  if (compact === 'jazzcash') return 'Jazzcash';
  if (compact === 'easypaisa') return 'Easy Paisa';
  if (compact === 'stripe' || compact === 'bankcard' || compact === 'card') {
    return 'Bank Card';
  }
  if (compact === 'wallet') return 'Wallet';
  return String(rawMethod).trim();
}

export function resolveActivityPaymentMethod(
  activity: ReferralActivityLike | null | undefined,
  joinneeBookings: ReferralBookingLike[] = []
): string {
  if (!activity) return '—';

  if (activity.paymentMethod) {
    const direct = normalizeReferralPaymentMethod(activity.paymentMethod);
    if (direct !== '—') return direct;
  }

  // Signup-only activity has no payment method yet unless explicitly recorded
  if (activity.type === 'newly_joinned') {
    return '—';
  }

  if (!Array.isArray(joinneeBookings) || joinneeBookings.length === 0) {
    return '—';
  }

  const bookingIdStr = activity.bookingId ? String(activity.bookingId) : null;
  const sessionIdStr = activity.sessionId ? String(activity.sessionId) : null;

  let matched: ReferralBookingLike | undefined;

  if (bookingIdStr) {
    matched = joinneeBookings.find((b) => String(b._id) === bookingIdStr);
  }

  if (!matched && sessionIdStr) {
    const sessionMatches = joinneeBookings.filter(
      (b) => String(b.sessionTypeId) === sessionIdStr || String(b._id) === sessionIdStr
    );
    matched =
      sessionMatches.find((b) => b.paymentStatus === 'paid' || b.status === 'confirmed') ||
      sessionMatches[0];
  }

  if (!matched) {
    matched =
      joinneeBookings.find((b) => b.paymentStatus === 'paid' || b.status === 'confirmed') ||
      joinneeBookings[0];
  }

  return normalizeReferralPaymentMethod(matched?.paymentMethod);
}

const STATUS_LABELS: Record<NormalizedReferralStatus, string> = {
  rewarded: 'Rewarded',
  pending: 'Pending',
  rejected: 'Rejected',
};

export function filterAndSearchReferrals<T extends ReferralItemLike>(
  items: T[],
  filters: { search?: string; method?: string; status?: string }
): T[] {
  const search = String(filters.search || '').trim().toLowerCase();
  const compactMethodFilter = String(filters.method || 'All')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
  const statusFilter = String(filters.status || 'All').trim().toLowerCase();

  return items.filter((item) => {
    const normalizedStatus = normalizeReferralStatus(item.buyActivity?.status);
    const statusLabel = STATUS_LABELS[normalizedStatus].toLowerCase();
    const resolvedMethod = normalizeReferralPaymentMethod(
      item.paymentMethod || item.buyActivity?.paymentMethod
    );
    const compactMethod = resolvedMethod.toLowerCase().replace(/\s+/g, '');

    if (compactMethodFilter && compactMethodFilter !== 'all') {
      if (compactMethod !== compactMethodFilter) return false;
    }

    if (statusFilter && statusFilter !== 'all') {
      if (normalizedStatus !== statusFilter && statusLabel !== statusFilter) {
        return false;
      }
    }

    if (!search) return true;

    const shortId = getReferralShortId(item._id).toLowerCase();
    const fullId = String(item._id || '').toLowerCase();
    const name = String(item.joinnee?.name || '').toLowerCase();
    const email = String(item.joinnee?.email || '').toLowerCase();
    const reward = String(item.buyActivity?.totalAmount ?? '').toLowerCase();
    const methodLower = resolvedMethod.toLowerCase();

    return (
      shortId.includes(search) ||
      fullId.includes(search) ||
      name.includes(search) ||
      email.includes(search) ||
      methodLower.includes(search) ||
      statusLabel.includes(search) ||
      reward.includes(search)
    );
  });
}
