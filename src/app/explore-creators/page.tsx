'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';

const ITEMS_PER_PAGE = 8;

export default function ExploreCreatorsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Filter state
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCreators() {
      try {
        const res = await fetch('/api/creators');
        const data = await res.json();
        if (data.success) {
          setCreators(data.creators);
        } else {
          setCreators([]);
        }
      } catch (err) {
        console.error('Failed to fetch creators:', err);
        setCreators([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCreators();
  }, []);

  const toggleFavorite = (id: string) =>
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );

  // Filter creators
  const filteredCreators = creators.filter(c => {
    if (selectedCategory !== 'all') {
      const niches: string[] = c.niches || [];
      if (!niches.some((n: string) => n.toLowerCase() === selectedCategory)) return false;
    }
    if (verifiedOnly && !c.isVerified) return false;
    if (minRating !== null && (c.rating ?? 0) < minRating) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCreators.length / ITEMS_PER_PAGE));
  const paginated = filteredCreators.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'tech', label: 'Tech' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'business', label: 'Business' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7FA] text-[#1a1a1a]">

      {/* ─── Navbar (exact creator-onboarding style) ─── */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <img src="/assets/logo1.png" alt="Reachly Logo" className="h-10 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-10">
              <Link href="/explore-creators" className="text-[#0012FF] font-sans font-semibold text-sm">
                Explore Creators
              </Link>
              <Link href="/events" className="text-gray-400 font-sans text-sm hover:text-gray-600 transition-colors">
                Events
              </Link>
              <Link href="/for-creators" className="text-gray-400 font-sans text-sm hover:text-gray-600 transition-colors">
                For Creators
              </Link>
              <Link href="/about" className="text-gray-400 font-sans text-sm hover:text-gray-600 transition-colors">
                About
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="text-[#0012FF] font-sans font-semibold text-sm"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="bg-[#0012FF] text-white px-5 py-2.5 rounded-full font-sans font-semibold text-sm hover:bg-[#0010cc] transition-colors"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Hero Banner ─── */}
    {/* ─── Hero Banner ─── */}
<div
  className="relative w-full flex flex-col items-center justify-center py-14 px-4 text-center bg-cover bg-center bg-no-repeat overflow-hidden"
  style={{ backgroundImage: "url('/assets/new-bg-image1.png')" }}
>
  {/* Dark overlay */}
  <div className="absolute inset-0 bg-[#050d2e]/30" />

  <h1
    className="relative z-10 text-white font-bold text-3xl sm:text-4xl tracking-tight"
    style={{ fontFamily: "serif" }}
  >
    Explore Creators
  </h1>

  <nav className="relative z-10 flex items-center gap-2 mt-3 text-sm text-white/70">
    <Link href="/" className="hover:text-white transition-colors">
      Home
    </Link>

    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="opacity-60"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>

    <span className="text-white">Explore Creators</span>
  </nav>
</div>

      {/* ─── Main Content ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ─── Category Filter Bar ─── */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-[#0033A0] text-white border-[#0033A0]'
                  : 'bg-white text-[#444] border-[#ddd] hover:border-[#0033A0]/40 hover:text-[#0033A0]'
              }`}
            >
              {cat.id === 'all' && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              )}
              {cat.label}
            </button>
          ))}

          {/* More */}
          <button className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-[#ddd] text-[#444] hover:border-[#0033A0]/40 hover:text-[#0033A0] transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="6" cy="12" r="1" fill="currentColor" />
              <circle cx="18" cy="12" r="1" fill="currentColor" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Filter */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              showFilterPanel
                ? 'bg-[#0033A0] text-white border-[#0033A0]'
                : 'bg-white text-[#444] border-[#ddd] hover:border-[#0033A0]/40 hover:text-[#0033A0]'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filter
          </button>
        </div>

        {/* ─── Filter Panel ─── */}
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-semibold text-[#333] mb-3">Minimum Rating</label>
              <div className="flex gap-2 flex-wrap">
                {[null, 3.5, 4, 4.5].map(r => (
                  <button
                    key={String(r)}
                    onClick={() => setMinRating(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      minRating === r
                        ? 'bg-[#0033A0] text-white border-[#0033A0]'
                        : 'bg-white text-[#555] border-[#ddd] hover:border-[#0033A0]/50'
                    }`}
                  >
                    {r === null ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Only */}
            <div>
              <label className="block text-sm font-semibold text-[#333] mb-3">Verified Only</label>
              <button
                onClick={() => setVerifiedOnly(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  verifiedOnly
                    ? 'bg-[#0033A0] text-white border-[#0033A0]'
                    : 'bg-white text-[#555] border-[#ddd] hover:border-[#0033A0]/50'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {verifiedOnly ? 'Verified Only ✓' : 'Show All'}
              </button>
              {(verifiedOnly || minRating !== null) && (
                <button
                  onClick={() => { setVerifiedOnly(false); setMinRating(null); }}
                  className="mt-3 text-xs text-[#0033A0] underline hover:opacity-70"
                >
                  Reset filters
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── Creator Grid ─── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full h-[280px] bg-gray-200 rounded-xl" />
                <div className="pt-4 space-y-2 px-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-semibold text-gray-500">No creators found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginated.map((creator, index) => {
              const clipId = `creatorClip-${index}`;
              return (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex flex-col w-full max-w-[320px] mx-auto group"
                >
                  {/* Image with SVG clip notch */}
                  <div className="relative w-full h-[280px]">
                    <svg width="0" height="0" className="absolute">
                      <defs>
                        <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                          <path d="M0 0 H0.87 C0.885 0 .895 .01 .895 .03 V.09 C.895 .12 .905 .14 .93 .14 H.96 C.99 .14 1 .15 1 .175 V.94 C1 .975 .975 1 .94 1 H.06 C.025 1 0 .975 0 .94 V0 Z" />
                        </clipPath>
                      </defs>
                    </svg>

                    <img
                      src={creator.profilePhoto || '/avatar.png'}
                      alt={creator.displayName}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      style={{ clipPath: `url(#${clipId})` }}
                    />

                    {/* Sponsored / Verified badge */}
                    <span
                      className={`absolute top-3 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                        creator.isVerified
                          ? 'bg-white text-emerald-600'
                          : 'bg-white/80 text-blue-600'
                      }`}
                    >
                      {creator.isVerified ? 'Verified' : 'Sponsored'}
                    </span>

                    {/* Heart — sits in the notch area */}
                    <button
                      onClick={() => toggleFavorite(creator.id)}
                      className="absolute top-3 right-1 flex items-center justify-center"
                      aria-label="Add to favorites"
                    >
                      <svg
                        className={`w-6 h-6 transition-colors duration-200 ${
                          favorites.includes(creator.id) ? 'text-red-500' : 'text-gray-200'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="pt-4 pb-2 px-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-sans font-bold text-lg text-[#1a1a1a] flex items-center gap-1.5">
                        {creator.displayName}
                        {creator.isVerified && (
                          <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(4 4) scale(0.83)">
                              <path fill="#34C759" d="M24 2.5c2.8 0 5 2.4 7.5 3.2 2.6.8 5.8.1 8 1.8 2.2 1.7 2.9 4.9 4.6 7.1 1.7 2.2 4.8 3.8 5.6 6.4.8 2.6-.8 5.6-.8 8.3s1.6 5.7.8 8.3c-.8 2.6-3.9 4.2-5.6 6.4-1.7 2.2-2.4 5.4-4.6 7.1-2.2 1.7-5.4 1-8 1.8-2.5.8-4.7 3.2-7.5 3.2s-5-2.4-7.5-3.2c-2.6-.8-5.8-.1-8-1.8-2.2-1.7-2.9-4.9-4.6-7.1-1.7-2.2-4.8-3.8-5.6-6.4-.8-2.6.8-5.6.8-8.3s-1.6-5.7-.8-8.3c.8-2.6 3.9-4.2 5.6-6.4 1.7-2.2 2.4-5.4 4.6-7.1 2.2-1.7 5.4-1 8-1.8C19 4.9 21.2 2.5 24 2.5z" />
                            </g>
                            <path d="M17 24L22.5 29.5L32 19" fill="none" stroke="white" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </h3>
                      <span className="flex items-center gap-1 text-sm font-bold text-[#1a1a1a] shrink-0">
                        <svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {creator.rating ?? '—'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">@{creator.username}</p>
                    <p className="text-xs text-gray-500 font-sans mt-2.5 line-clamp-2 leading-relaxed">
                      {creator.shortBio || 'Creator on Reachly'}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs font-sans text-gray-500">
                        Starting from{' '}
                        <strong className="text-[#1a1a1a] font-black">
                          {creator.startingPrice ? `${creator.startingPrice} PKR` : 'Free'}
                        </strong>
                      </span>
                      <Link
                        href={`/creators/${creator.username}`}
                        className="text-xs font-sans font-bold text-[#0033A0] underline underline-offset-2 hover:text-[#0033A0]/70 transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ─── Pagination ─── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#ddd] bg-white text-[#555] hover:border-[#0033A0] hover:text-[#0033A0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold border transition-all ${
                  p === currentPage
                    ? 'bg-[#0033A0] text-white border-[#0033A0]'
                    : 'bg-white text-[#555] border-[#ddd] hover:border-[#0033A0] hover:text-[#0033A0]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#ddd] bg-white text-[#555] hover:border-[#0033A0] hover:text-[#0033A0] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
