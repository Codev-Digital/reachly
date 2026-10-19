'use client';

import { useEffect } from 'react';

/**
 * Warms the browser cache for images that only appear inside modals, so the
 * modal opens with its artwork already painted instead of popping in late.
 * Pair with `unoptimized` on the matching <Image> so the URLs are identical.
 */
export function usePreloadImages(sources: string[]) {
  const key = sources.join('|');
  useEffect(() => {
    key.split('|').forEach((src) => {
      if (!src) return;
      const img = new window.Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, [key]);
}
