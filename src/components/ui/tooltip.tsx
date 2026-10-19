'use client';

import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

/**
 * Small "i" icon that reveals a tooltip on hover or keyboard focus.
 * The bubble is positioned against the nearest `relative` ancestor (e.g. the label row),
 * so it stays inside the page on narrow screens.
 */
export function InfoTooltip({
  title,
  children,
  className,
  bubbleClassName,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  bubbleClassName?: string;
}) {
  return (
    <span className={twMerge('group inline-flex', className)}>
      <button
        type="button"
        aria-label={title ?? 'More information'}
        className="inline-flex items-center justify-center rounded-full text-gray-400 hover:text-[#0012FF] focus-visible:text-[#0012FF] focus:outline-none transition-colors cursor-help"
      >
        <Info className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        className={twMerge(
          'pointer-events-none invisible absolute left-0 bottom-full z-50 mb-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg bg-gray-900 px-3 py-2.5 text-left font-sans text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150',
          'group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100',
          bubbleClassName
        )}
      >
        {title && <span className="mb-0.5 block font-semibold">{title}</span>}
        {children}
      </span>
    </span>
  );
}
