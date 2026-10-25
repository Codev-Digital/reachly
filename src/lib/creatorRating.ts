/** Shared creator rating display helpers. */

export type CreatorRatingSummary = {
  /** Numeric average (or 5 when no reviews). */
  rating: number;
  /** Always one decimal place, e.g. "4.8" or "5.0". */
  ratingLabel: string;
  reviewCount: number;
  /** e.g. "4.8 (44)" or "5.0 (0)". */
  display: string;
};

/**
 * Format average + count for UI.
 * No reviews → 5.0 (0). Otherwise round to 1 decimal.
 */
export function summarizeCreatorRating(
  avg: number | null | undefined,
  count: number | null | undefined
): CreatorRatingSummary {
  const reviewCount = Math.max(0, Math.floor(Number(count) || 0));
  if (reviewCount === 0) {
    return { rating: 5, ratingLabel: '5.0', reviewCount: 0, display: '5.0 (0)' };
  }
  const n = Number(avg);
  const safe = Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 5;
  const rounded = Math.round(safe * 10) / 10;
  const ratingLabel = rounded.toFixed(1);
  return {
    rating: rounded,
    ratingLabel,
    reviewCount,
    display: `${ratingLabel} (${reviewCount})`,
  };
}
