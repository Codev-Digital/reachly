'use client';

import Link from 'next/link';
import CreatorNavbar from '@/components/CreatorNavbar';
import Footer from '@/components/Footer';

interface ComingSoonProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function ComingSoon({
  title,
  subtitle = 'Something amazing is coming soon. Stay tuned!',
  badge = 'Reachly',
}: ComingSoonProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#040924]">
      <CreatorNavbar />

      <section className="relative flex-1 min-h-[75vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
        <img
          src="/assets/new-bg-image.png"
          alt="Reachly Background"
          className="fixed inset-0 w-screen h-screen object-cover object-top -z-10 opacity-90"
        />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="font-sans text-xs sm:text-sm text-white/80 tracking-widest uppercase mb-4 font-semibold">
            {badge}
          </p>
          <h1 className="font-anton text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight uppercase tracking-tight">
            {title}
          </h1>
          <h2 className="font-sans text-lg sm:text-2xl text-white/90 mb-8 font-light max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="bg-white text-[#001F7D] font-sans font-semibold px-8 py-3 rounded-full text-sm hover:bg-white/90 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Back to Home
            </Link>
            <Link
              href="/explore-creators"
              className="bg-[#0012FF] text-white border border-white/20 font-sans font-semibold px-8 py-3 rounded-full text-sm hover:bg-[#0010d0] transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Explore Creators
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
