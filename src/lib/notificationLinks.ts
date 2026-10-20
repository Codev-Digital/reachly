/** Where a notification should take the user when it is clicked. */
export function notificationHref(
  n: { type?: string; title?: string },
  role: 'user' | 'creator',
): string | null {
  const creator = role === 'creator';
  switch (n.type) {
    case 'booking':
    case 'reschedule':
    case 'cancellation':
    case 'reminder':
      return creator ? '/creators/calendar' : '/user/bookings';
    case 'payout':
      return creator ? '/creators/wallet' : '/user/payments';
    case 'review':
      return creator ? '/creators/dashboard' : null;
    default:
      return null; // plain system messages have nowhere to go
  }
}
