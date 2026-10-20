import { cn } from '@/lib/cn';

const formatPkr = (amount: number) => `PKR ${amount.toLocaleString('en-US')}`;

/**
 * Session price. With a discount it shows the new price, the old price struck through,
 * and a "% OFF" badge:  PKR 31,999  PKR 39,999  [20% OFF]
 */
export default function PriceTag({
  price,
  discountedPrice,
  className,
}: {
  price: number | string;
  discountedPrice?: number | string | null;
  className?: string;
}) {
  const original = Number(price);
  const discounted = Number(discountedPrice);
  const hasDiscount = discounted > 0 && discounted < original;
  const percentOff = hasDiscount ? Math.round((1 - discounted / original) * 100) : 0;

  return (
    <span className={cn('inline-flex items-center gap-2 whitespace-nowrap', className)}>
      <span className="inline-flex items-baseline gap-2 rounded-xl bg-blue-50 px-3.5 py-1.5 text-[#0012FF]">
        <span className="text-xs font-bold">{formatPkr(hasDiscount ? discounted : original)}</span>
        {hasDiscount && (
          <span className="text-[11px] font-medium text-gray-400 line-through">{formatPkr(original)}</span>
        )}
      </span>
      {hasDiscount && percentOff > 0 && (
        <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
          {percentOff}% OFF
        </span>
      )}
    </span>
  );
}
