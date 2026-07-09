'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import UserNavbar from '@/components/UserNavbar';

const ITEMS_PER_PAGE = 8;

// Mock creators data (similar to explore-creators but with the same structure as homepage)
const creatorsData = [
  { 
    id: '1',
    name: 'Sarah Khan', 
    username: '@sarahkhan', 
    tag: 'Sponsored', 
    profilePhoto: '/Avatars/12.jpg', 
    rating: '4.9', 
    shortBio: 'Pakistan\'s leading fashion and lifestyle content creator.', 
    startingPrice: '1200 PKR', 
    isVerified: false,
    niches: ['Fashion', 'Lifestyle']
  },
  { 
    id: '2',
    name: 'Dananeer Mobeen', 
    username: '@dananeermobeen', 
    tag: 'Verified', 
    profilePhoto: '/Avatars/5.jpg', 
    rating: '4.9', 
    shortBio: 'Viral sensation & lifestyle creator with millions of fans.', 
    startingPrice: '1200 PKR', 
    isVerified: true,
    niches: ['Lifestyle']
  },
  { 
    id: '3',
    name: 'Bilal Abbas', 
    username: '@bilalabbas', 
    tag: 'Sponsored', 
    profilePhoto: '/Avatars/10.jpg', 
    rating: '4.9', 
    shortBio: 'Award-winning actor and digital creator from Pakistan.', 
    startingPrice: '1200 PKR', 
    isVerified: false,
    niches: ['Tech']
  },
  { 
    id: '4',
    name: 'Dure Fishan', 
    username: '@durefishan', 
    tag: 'Verified', 
    profilePhoto: '/Avatars/6.jpg', 
    rating: '4.9', 
    shortBio: 'Beauty, fashion & lifestyle creator beloved across Pakistan.', 
    startingPrice: '1200 PKR', 
    isVerified: true,
    niches: ['Beauty']
  },
  { 
    id: '5',
    name: 'Sarah Khan', 
    username: '@sarahkhan', 
    tag: 'Sponsored', 
    profilePhoto: '/Avatars/12.jpg', 
    rating: '4.9', 
    shortBio: 'Pakistan\'s leading fashion and lifestyle content creator.', 
    startingPrice: '1200 PKR', 
    isVerified: false,
    niches: ['Fashion']
  },
  { 
    id: '6',
    name: 'Dananeer Mobeen', 
    username: '@dananeermobeen', 
    tag: 'Verified', 
    profilePhoto: '/Avatars/5.jpg', 
    rating: '4.9', 
    shortBio: 'Viral sensation & lifestyle creator with millions of fans.', 
    startingPrice: '1200 PKR', 
    isVerified: true,
    niches: ['Lifestyle']
  },
  { 
    id: '7',
    name: 'Bilal Abbas', 
    username: '@bilalabbas', 
    tag: 'Sponsored', 
    profilePhoto: '/Avatars/10.jpg', 
    rating: '4.9', 
    shortBio: 'Award-winning actor and digital creator from Pakistan.', 
    startingPrice: '1200 PKR', 
    isVerified: false,
    niches: ['Tech']
  },
  { 
    id: '8',
    name: 'Dure Fishan', 
    username: '@durefishan', 
    tag: 'Verified', 
    profilePhoto: '/Avatars/6.jpg', 
    rating: '4.9', 
    shortBio: 'Beauty, fashion & lifestyle creator beloved across Pakistan.', 
    startingPrice: '1200 PKR', 
    isVerified: true,
    niches: ['Beauty']
  },
  { 
    id: '9',
    name: 'Sarah Khan', 
    username: '@sarahkhan', 
    tag: 'Sponsored', 
    profilePhoto: '/Avatars/12.jpg', 
    rating: '4.9', 
    shortBio: 'Pakistan\'s leading fashion and lifestyle content creator.', 
    startingPrice: '1200 PKR', 
    isVerified: false,
    niches: ['Fashion']
  },
  { 
    id: '10',
    name: 'Dananeer Mobeen', 
    username: '@dananeermobeen', 
    tag: 'Verified', 
    profilePhoto: '/Avatars/5.jpg', 
    rating: '4.9', 
    shortBio: 'Viral sensation & lifestyle creator with millions of fans.', 
    startingPrice: '1200 PKR', 
    isVerified: true,
    niches: ['Lifestyle']
  }
];

export default function ExploreCreatorsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [displayName, setDisplayName] = useState<string>('James Richard');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch creators from API
        const creatorsRes = await fetch('/api/creators');
        if (creatorsRes.ok) {
          const data = await creatorsRes.json();
          setCreators(data.creators || []);
        }

        // Check if authenticated
        const authRes = await fetch('/api/user/me');
        if (authRes.ok) {
          const userData = await authRes.json();
          setIsAuthenticated(true);
          if (userData.user) {
            setDisplayName(userData.user.name || 'James Richard');
            setProfilePhoto(userData.user.image || null);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter state
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          if (data.user) {
            setDisplayName(data.user.name || 'James Richard');
            setProfilePhoto(data.user.image || null);
          }
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
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
    if (minRating !== null && (parseFloat(c.rating) || 0) < minRating) return false;
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
      {/* Navbar */}
      {isAuthenticated ? (
        <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />
      ) : (
        <div className="px-4 sm:px-6 pt-4">
          <nav className="bg-white shadow-sm border border-gray-100 max-w-7xl mx-auto rounded-3xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/assets/logo1.png" alt="Reachly" className="h-10 w-auto object-contain" />
            </Link>
            <div className="flex gap-3">
              <button onClick={() => router.push('/login')} className="text-gray-600 font-semibold text-sm hover:text-black transition-all">Login</button>
              <button onClick={() => router.push('/signup')} className="bg-[#0012FF] text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-[#0012FF]/90 transition-all">Sign up</button>
            </div>
          </nav>
        </div>
      )}

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero text (as per user's screenshot) */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm font-sans mb-1">Find the perfect match</p>
          <h1 className="text-4xl font-black text-black font-anton tracking-tight">
            Connect with Talented Creators <span className="text-[#0012FF] font-black italic font-anton">near you</span>
          </h1>
        </div>

        {/* Category Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-[#0012FF] text-white border-[#0012FF]'
                  : 'bg-white text-[#444] border-[#ddd] hover:border-[#0012FF]/40 hover:text-[#0012FF]'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <div className="flex-1" />

          {/* Filter */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              showFilterPanel
                ? 'bg-[#0012FF] text-white border-[#0012FF]'
                : 'bg-white text-[#444] border-[#ddd] hover:border-[#0012FF]/40 hover:text-[#0012FF]'
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

        {/* Filter Panel */}
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
                        ? 'bg-[#0012FF] text-white border-[#0012FF]'
                        : 'bg-white text-[#555] border-[#ddd] hover:border-[#0012FF]/50'
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
                    ? 'bg-[#0012FF] text-white border-[#0012FF]'
                    : 'bg-white text-[#555] border-[#ddd] hover:border-[#0012FF]/50'
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
                  className="mt-3 text-xs text-[#0012FF] underline hover:opacity-70"
                >
                  Reset filters
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Creator Grid (using the exact card design from homepage) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full h-[280px] bg-gray-200 rounded-3xl" />
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
                  className="flex flex-col w-full shrink-0 transition-all duration-300 hover:-translate-y-3 hover:scale-[1.04] p-3 rounded-[24px] border border-gray-100/80 group"
                >
                  {/* Image with SVG clip notch */}
                  <div className="relative w-full h-[280px]">
                    <svg width="0" height="0" className="absolute">
                      <defs>
                        <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                          <path
                            d="
 M0 .06
 C0 .025 .025 0 .06 0
 H0.80
 C0.855 0 .865 .01 .865 .03
 V.10
 C.865 .12 .885 .14 .91 .14
 H.95
 C.985 .14 1 .15 1 .175
 V.91
 C1 .975 .975 1 .94 1
 H.06
 C.025 1 0 .975 0 .94
 V.06
 C0 .025 0 .025 0 .06
 Z
 "
                          />
                        </clipPath>
                      </defs>
                    </svg>

                    <img
                      src={creator.profilePhoto || '/Avatars/1.jpg'}
                      alt={creator.name}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                      style={{ clipPath: `url(#${clipId})` }}
                    />

                    {/* Sponsored / Verified badge */}
                    <span
                      className={`absolute top-3 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                        creator.isVerified
                          ? 'bg-white text-emerald-600'
                          : 'bg-white text-blue-600'
                      }`}
                    >
                      {creator.isVerified ? 'Verified' : 'Sponsored'}
                    </span>

                    {/* Heart — sits in the notch area */}
                    <button
                      onClick={() => toggleFavorite(creator.id)}
                      className="absolute top-2 right-0 z-20 flex items-center justify-center hover:scale-110 transition-transform"
                      aria-label="Add to favorites"
                    >
                      <svg
                        className={`w-6 h-6 transition-colors duration-200 ${
                          favorites.includes(creator.id) ? 'text-red-500' : 'text-gray-300'
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <defs>
                          <filter id="heartGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="0.6" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Heart */}
                        <path
                          fill="currentColor"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />

                        {/* Glow */}
                        <path
                          d="M15.2 6.2c1.5 0 2.7 1.2 2.7 2.7 0 1-.4 1.9-1 2.8"
                          stroke="white"
                          strokeWidth="2.4"
                          strokeOpacity="0.35"
                          strokeLinecap="round"
                          fill="none"
                          filter="url(#heartGlow)"
                        />

                        {/* Main shine */}
                        <path
                          d="M15.2 6.2c1.5 0 2.7 1.2 2.7 2.7 0 1-.4 1.9-1 2.8"
                          stroke="white"
                          strokeWidth="1.3"
                          strokeOpacity="0.95"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="pt-4 pb-2 px-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-sans font-bold text-lg text-black flex items-center gap-1.5">
                        {creator.displayName}
                        {creator.isVerified && (
                          <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <g transform="translate(4 4) scale(0.83)">
                              <path fill="#34C759" d="M24 2.5c2.8 0 5 2.4 7.5 3.2 2.6.8 5.8.1 8 1.8 2.2 1.7 2.9 4.9 4.6 7.1 1.7 2.2 4.8 3.8 5.6 6.4.8 2.6-.8 5.6-.8 8.3s1.6 5.7.8 8.3c-.8 2.6-3.9 4.2-5.6 6.4-1.7 2.2-2.4 5.4-4.6 7.1-2.2 1.7-5.4 1-8 1.8-2.5.8-4.7 3.2-7.5 3.2s-5-2.4-7.5-3.2c-2.6-.8-5.8-.1-8-1.8-2.2-1.7-2.9-4.9-4.6-7.1-1.7-2.2-4.8-3.8-5.6-6.4-.8-2.6.8-5.6.8-8.3s-1.6-5.7-.8-8.3c.8-2.6 3.9-4.2 5.6-6.4 1.7-2.2 2.4-5.4 4.6-7.1 2.2-1.7 5.4-1 8-1.8C19 4.9 21.2 2.5 24 2.5z" />
                            </g>
                            <path d="M17 24L22.5 29.5L32 19" fill="none" stroke="white" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </h3>
                      <span className="flex items-center gap-1 text-sm font-bold text-black">
                        <svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8 2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        {creator.rating || '—'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">{creator.username}</p>
                    <p className="text-xs text-gray-500 font-sans mt-2.5 line-clamp-2">
                      {creator.shortBio || 'Creator on Reachly'}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs font-sans text-gray-500">
                        Starting from{' '}
                        <strong className="text-black font-black">
                          {creator.startingPrice ? `${creator.startingPrice} PKR` : 'Free'}
                        </strong>
                      </span>
                      <Link
                        href={`/creators/${creator.username}`}
                        className="text-xs font-sans font-bold text-blue-600 underline hover:text-blue-800 transition-colors"
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

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#ddd] bg-white text-[#555] hover:border-[#0012FF] hover:text-[#0012FF] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                    ? 'bg-[#0012FF] text-white border-[#0012FF]'
                    : 'bg-white text-[#555] border-[#ddd] hover:border-[#0012FF] hover:text-[#0012FF]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#ddd] bg-white text-[#555] hover:border-[#0012FF] hover:text-[#0012FF] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
