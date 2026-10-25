'use client';

import { twMerge } from 'tailwind-merge';

/**
 * Auth / welcome right panel: tilted portrait columns with seamless CSS marquee.
 * Uses `/public/actors` images — fill parent edge-to-edge.
 */

const ACTORS = [
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
];

const COL_1 = [ACTORS[0], ACTORS[1], ACTORS[2], ACTORS[3]];
const COL_2 = [ACTORS[4], ACTORS[5], ACTORS[6], ACTORS[7]];
const COL_3 = [ACTORS[8], ACTORS[9], ACTORS[10], ACTORS[11]];

function PortraitCard({ src }: { src: string }) {
  return (
    <div className="auth-marquee-card shrink-0 overflow-hidden rounded-xl border-2 border-white bg-[#0a1a8a] shadow-[0_6px_18px_rgba(0,0,0,0.22)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full object-cover select-none"
      />
    </div>
  );
}

function MarqueeColumn({
  images,
  direction,
  durationSec,
}: {
  images: string[];
  direction: 'up' | 'down';
  durationSec: number;
}) {
  const loop = [...images, ...images];

  return (
    <div className="auth-marquee-col relative h-full w-[300px] shrink-0 overflow-hidden">
      <div
        className={
          direction === 'up' ? 'auth-marquee-track-up' : 'auth-marquee-track-down'
        }
        style={{ animationDuration: `${durationSec}s` }}
      >
        {loop.map((src, i) => (
          <PortraitCard key={`${src}-${i}`} src={src} />
        ))}
      </div>
    </div>
  );
}

export default function HeroImage({ className }: { className?: string }) {
  return (
    <div
      className={twMerge(
        'relative flex h-full w-full min-h-full flex-col overflow-hidden bg-[#0012FF]',
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(255,255,255,0.18), transparent 55%)',
        }}
      />

      <div className="absolute inset-0 overflow-hidden pb-44 sm:pb-48">
        <div className="auth-marquee-stage flex h-[140%] w-[140%] origin-center -translate-x-[14%] -translate-y-[12%] rotate-[14deg] justify-center gap-2.5 sm:gap-3">
          <MarqueeColumn images={COL_1} direction="up" durationSec={26} />
          <MarqueeColumn images={COL_2} direction="down" durationSec={32} />
          <MarqueeColumn images={COL_3} direction="up" durationSec={29} />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[48%] bg-gradient-to-t from-[#0012FF] via-[#0012FF]/92 to-transparent" />

      <div className="relative z-20 mt-auto px-6 pb-8 pt-10 text-center sm:px-10 sm:pb-10">
        <h2 className="mb-3 font-sans text-2xl font-black tracking-tight text-white uppercase sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
          Learn from Pakistani Creators
        </h2>
        <p className="mx-auto max-w-md font-sans text-xs leading-relaxed text-white/85 sm:text-sm">
          Learn the skills, strategies, and systems behind successful content, brands, and
          online businesses—directly from the people who built them and achieved lasting
          success.
        </p>
      </div>
    </div>
  );
}
