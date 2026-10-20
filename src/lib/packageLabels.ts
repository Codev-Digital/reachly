import PackagePurchase from '@/models/PackagePurchase';

/**
 * Package bookings only carry a share of the package price, but the user pays the WHOLE
 * package once, when the first session is booked. This returns, keyed by booking id:
 *  - labels: text shown instead of a price ("Package · Session 2 of 5")
 *  - paid:   what was actually paid at that booking (the full package price for session 1, 0 after)
 * Bookings that aren't part of a package get no entry.
 */
export async function packageInfo(bookings: any[]) {
  const labels = new Map<string, string>();
  const paid = new Map<string, number>();
  const ids = [...new Set(bookings.map((b) => b.packagePurchaseId?.toString()).filter(Boolean))];
  if (ids.length === 0) return { labels, paid };

  const purchases = (await PackagePurchase.find({ _id: { $in: ids } }).select('sessionsTotal price').lean()) as any[];
  const byId = new Map(purchases.map((p) => [String(p._id), p]));
  for (const b of bookings) {
    const p = byId.get(b.packagePurchaseId?.toString());
    if (!p) continue;
    const key = String(b._id);
    labels.set(key, `Package · Session ${b.sessionNumber} of ${p.sessionsTotal}`);
    paid.set(key, b.sessionNumber === 1 ? p.price : 0);
  }
  return { labels, paid };
}

export async function packageLabels(bookings: any[]): Promise<Map<string, string>> {
  return (await packageInfo(bookings)).labels;
}
