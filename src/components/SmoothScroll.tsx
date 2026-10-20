'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Lenis smooth scrolling — landing page ("/") only.
 * The pathname guard matters because /welcome renders the landing page behind a
 * modal; smooth scrolling must not run there.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Handle hash scrolling on page load
    if (window.location.hash) {
      setTimeout(() => {
        lenis.scrollTo(window.location.hash, { offset: -30 });
      }, 300);
    }

    // Handle hash change while on the page
    const handleHashChange = () => {
      if (window.location.hash) {
        lenis.scrollTo(window.location.hash, { offset: -30 });
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
