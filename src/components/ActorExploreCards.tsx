'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

export const ACTOR_IMAGES = [
  '/actors/ahsan_khan.jpg',
  '/actors/ali_khan.jpg',
  '/actors/bilal_abbas.png',
  '/actors/dananeer_mobeen.png',
  '/actors/danish_taimoor.png',
  '/actors/dur_e_fishan.png',
  '/actors/feroz_khan.jpg',
  '/actors/hania_amir.png',
  '/actors/maira_khan.png',
  '/actors/mira_khan.jpg',
  '/actors/sajal_aly.jpg',
  '/actors/sara_ali_khan.jpg',
] as const;

function pickRandomFour(prev: string[] = []): string[] {
  const pool = [...ACTOR_IMAGES];
  // Prefer a different set when possible
  for (let attempt = 0; attempt < 8; attempt++) {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const next = pool.slice(0, 4);
    const same =
      prev.length === 4 && next.every((src, i) => src === prev[i]);
    if (!same) return next;
  }
  return pool.slice(0, 4);
}

function ActorCard({
  src,
  index,
  href = '/explore-creators',
}: {
  src: string;
  index: number;
  href?: string;
}) {
  const restTilt = index % 2 === 0 ? -5 : 5;

  return (
    <Link
      href={href}
      className="group relative block w-36 h-48 sm:w-44 sm:h-60 md:w-48 md:h-64 shrink-0"
      aria-label="Explore creators"
    >
      {/* Stacked duplicate behind (slight curve) — visible on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[22px] overflow-hidden border-2 border-white/80 shadow-xl opacity-0 scale-[0.96] -rotate-6 -translate-x-2 translate-y-1 transition-all duration-300 ease-out group-hover:opacity-90 group-hover:scale-100 group-hover:-rotate-[8deg] group-hover:-translate-x-3 group-hover:translate-y-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>

      {/* Front card */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: restTilt }}
        animate={{ opacity: 1, y: 0, rotate: restTilt }}
        whileHover={{ y: -8, rotate: 0, scale: 1.02 }}
        transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
        className="relative z-10 h-full w-full overflow-hidden rounded-[22px] border-[3px] border-white shadow-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Explore pill — center, thin glass ring ~70% transparent */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span
            className="flex size-14 sm:size-16 items-center justify-center rounded-full bg-[#0012FF] text-[11px] sm:text-xs font-semibold text-white"
            style={{
              boxShadow:
                '0 0 0 4px rgba(255,255,255,0.3), 0 8px 18px rgba(0,18,255,0.3)',
            }}
          >
            Explore
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

/**
 * Four random actor portraits that swap every 60s, with stacked hover + Explore CTA.
 */
export default function ActorExploreCards({
  href = '/explore-creators',
  className = '',
}: {
  href?: string;
  className?: string;
}) {
  const [images, setImages] = useState<string[]>(() => pickRandomFour());
  const [batch, setBatch] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setImages((prev) => pickRandomFour(prev));
      setBatch((b) => b + 1);
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={`flex items-center justify-center gap-6 sm:gap-8 md:gap-10 flex-wrap ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={batch}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex items-center justify-center gap-6 sm:gap-8 md:gap-10 flex-wrap"
        >
          {images.map((src, i) => (
            <ActorCard key={`${batch}-${src}`} src={src} index={i} href={href} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
