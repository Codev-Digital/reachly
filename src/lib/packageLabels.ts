import PackagePurchase from '@/models/PackagePurchase';

/**
 * For package bookings, the label shown instead of a price ("Package · Session 2 of 5"),
 * because a booking's own price is only a share of the package total.
 * Keyed by booking id; bookings that aren't part of a package get no entry.
 */
export async function packageLabels(bookings: any[]): Promise<Map<string, string>> {
  const ids = [...new Set(bookings.map((b) => b.packagePurchaseId?.toString()).filter(Boolean))];
  const labels = new Map<string, string>();
  if (ids.length === 0) return labels;

  const purchases = (await PackagePurchase.find({ _id: { $in: ids } }).select('sessionsTotal').lean()) as any[];
  const totalById = new Map(purchases.map((p) => [String(p._id), p.sessionsTotal]));
  for (const b of bookings) {
    const pid = b.packagePurchaseId?.toString();
    if (pid) labels.set(String(b._id), `Package · Session ${b.sessionNumber} of ${totalById.get(pid) ?? '?'}`);
  }
  return labels;
}
