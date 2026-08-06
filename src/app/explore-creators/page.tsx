'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from '@/components/UserNavbar';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import AdminNavbar from '@/components/AdminNavbar';
import CreatorNavbar from '@/components/CreatorNavbar';

const ITEMS_PER_PAGE = 8;

export default function ExploreCreatorsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]); // creator usernames
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>([]); // bookmarked creator usernames
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [favLoading, setFavLoading] = useState<string | null>(null); // username being toggled

  // Fetch creators + auth + saved list on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creatorsRes, authRes] = await Promise.all([
          fetch('/api/creators'),
          fetch('/api/user/me'),
        ]);

        if (creatorsRes.ok) {
          const data = await creatorsRes.json();
          setCreators(data.creators || []);
        }

        if (authRes.ok) {
          const userData = await authRes.json();
          setIsAuthenticated(true);
          
          const email = userData.user?.email?.toLowerCase() || '';
          if (email === 'abdullahgotaccess@gmail.com' || email === 'admin@reachly.com') {
            setIsAdmin(true);
          }

          if (userData.creatorProfile) {
            setIsCreator(true);
            setDisplayName(userData.creatorProfile.displayName || userData.user?.name || '');
            setProfilePhoto(userData.creatorProfile.profilePhoto || null);
          } else if (userData.user) {
            setIsCreator(false);
            setDisplayName(userData.user.name || '');
            setProfilePhoto(userData.user.profilePhoto || null);
          }
          // Fetch both saved and favourite creators in parallel
          const [savedRes, favRes] = await Promise.all([
            fetch('/api/user/saved-creators'),
            fetch('/api/user/favourite-creators'),
          ]);
          if (savedRes.ok) {
            const d = await savedRes.json();
            setSaved(d.savedCreators || []);
          }
          if (favRes.ok) {
            const d = await favRes.json();
            setFavourites(d.favouriteCreators || []);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFavourite = useCallback(async (creatorUsername: string) => {
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    if (favLoading === creatorUsername) return;
    setFavLoading(creatorUsername);
    const isFav = favourites.includes(creatorUsername);
    setFavourites(prev => isFav ? prev.filter(u => u !== creatorUsername) : [...prev, creatorUsername]);
    try {
      const res = await fetch('/api/user/favourite-creators', {
        method: isFav ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: creatorUsername }),
      });
      if (res.ok) {
        const data = await res.json();
        setFavourites(data.favouriteCreators || []);
      } else {
        setFavourites(prev => isFav ? [...prev, creatorUsername] : prev.filter(u => u !== creatorUsername));
      }
    } catch {
      setFavourites(prev => isFav ? [...prev, creatorUsername] : prev.filter(u => u !== creatorUsername));
    } finally {
      setFavLoading(null);
    }
  }, [isAuthenticated, favourites, favLoading]);

  const toggleSaved = useCallback(async (creatorUsername: string) => {
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    if (favLoading === creatorUsername) return;
    setFavLoading(creatorUsername);
    const wasSaved = saved.includes(creatorUsername);
    setSaved(prev => wasSaved ? prev.filter(u => u !== creatorUsername) : [...prev, creatorUsername]);
    try {
      const res = await fetch('/api/user/saved-creators', {
        method: wasSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: creatorUsername }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.savedCreators || []);
      } else {
        setSaved(prev => wasSaved ? [...prev, creatorUsername] : prev.filter(u => u !== creatorUsername));
      }
    } catch {
      setSaved(prev => wasSaved ? [...prev, creatorUsername] : prev.filter(u => u !== creatorUsername));
    } finally {
      setFavLoading(null);
    }
  }, [isAuthenticated, saved, favLoading]);

  // Filter creators
  const filteredCreators = creators.filter(c => {
    if (showFavouritesOnly && !favourites.includes(c.username)) return false;
    if (showSavedOnly && !saved.includes(c.username)) return false;
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
        isAdmin ? (
          <AdminNavbar />
        ) : isCreator ? (
          <CreatorDashboardNav displayName={displayName} profilePhoto={profilePhoto} />
        ) : (
          <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />
        )
      ) : (
        <div className="px-4 sm:px-6 pt-4">
          <nav className="bg-white shadow-sm border border-gray-100 max-w-[1536px] mx-auto rounded-3xl px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img src="/assets/logo1.png" alt="Reachly" className="h-10 w-auto object-contain" />
            </Link>

            {/* Right side — all links + buttons grouped together like homepage */}
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center gap-8 font-medium text-sm text-gray-600">
                <Link href="/explore-creators" className="text-[#0012FF] font-bold transition-colors">Explore Creators</Link>
                <Link href="/for-creators" className="hover:text-black transition-colors">For Creators</Link>
                <Link href="/about" className="hover:text-black transition-colors">About</Link>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => router.push('/login')} className="text-gray-700 font-semibold text-sm hover:text-black transition-all cursor-pointer">Login</button>
                <button onClick={() => router.push('/signup')} className="border border-gray-300 text-gray-700 px-5 py-2 rounded-full font-semibold text-sm hover:bg-gray-50 transition-all cursor-pointer">Sign up</button>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Guest Login / Favourites Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[150] p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer z-10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Illustration */}
              <div className="w-40 sm:w-52 h-auto my-2">
                <img
                  src="/assets/favourites.png"
                  alt="Save to Favourites"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
                Save to Favourites
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
                Create a free account or log in to save your favourite creators and get personalised recommendations.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Page content */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Hero text */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm font-sans mb-1">Find the perfect match</p>
          <h1 className="text-4xl font-black text-black font-anton tracking-tight">
            Connect with Talented Creators <span className="text-[#0012FF] font-black italic font-anton">near you</span>
          </h1>
        </div>

        {/* Category Filter Bar + Favourites tab */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setShowFavouritesOnly(false); setShowSavedOnly(false); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${selectedCategory === cat.id && !showFavouritesOnly && !showSavedOnly
                ? 'bg-[#0012FF] text-white border-[#0012FF]'
                : 'bg-white text-[#444] border-[#ddd] hover:border-[#0012FF]/40 hover:text-[#0012FF]'
                }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Favourites tab — heart */}
          <button
            onClick={() => {
              if (!isAuthenticated) { setShowLoginModal(true); return; }
              const next = !showFavouritesOnly;
              setShowFavouritesOnly(next);
              if (next) setShowSavedOnly(false);
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${showFavouritesOnly
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-white text-[#444] border-[#ddd] hover:border-red-400 hover:text-red-500'
              }`}
          >

            Favourites
            {isAuthenticated && favourites.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${showFavouritesOnly ? 'bg-white/25 text-white' : 'bg-red-100 text-red-500'}`}>
                {favourites.length}
              </span>
            )}
          </button>

          {/* Saved tab — bookmark */}
          <button
            onClick={() => {
              if (!isAuthenticated) { setShowLoginModal(true); return; }
              const next = !showSavedOnly;
              setShowSavedOnly(next);
              if (next) setShowFavouritesOnly(false);
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${showSavedOnly
              ? 'bg-[#0012FF] text-white border-[#0012FF]'
              : 'bg-white text-[#444] border-[#ddd] hover:border-[#0012FF]/40 hover:text-[#0012FF]'
              }`}
          >

            Saved
            {isAuthenticated && saved.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${showSavedOnly ? 'bg-white/25 text-white' : 'bg-[#EEF2FF] text-[#0012FF]'}`}>
                {saved.length}
              </span>
            )}
          </button>

          <div className="flex-1" />

          {/* Filter */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${showFilterPanel ? 'bg-[#0012FF] text-white border-[#0012FF]' : 'bg-white text-[#444] border-[#ddd] hover:border-[#0012FF]/40 hover:text-[#0012FF]'
              }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
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
            <div>
              <label className="block text-sm font-semibold text-[#333] mb-3">Minimum Rating</label>
              <div className="flex gap-2 flex-wrap">
                {[null, 3.5, 4, 4.5].map(r => (
                  <button key={String(r)} onClick={() => setMinRating(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${minRating === r ? 'bg-[#0012FF] text-white border-[#0012FF]' : 'bg-white text-[#555] border-[#ddd] hover:border-[#0012FF]/50'}`}>
                    {r === null ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#333] mb-3">Verified Only</label>
              <button onClick={() => setVerifiedOnly(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${verifiedOnly ? 'bg-[#0012FF] text-white border-[#0012FF]' : 'bg-white text-[#555] border-[#ddd] hover:border-[#0012FF]/50'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                {verifiedOnly ? 'Verified Only ✓' : 'Show All'}
              </button>
              {(verifiedOnly || minRating !== null) && (
                <button onClick={() => { setVerifiedOnly(false); setMinRating(null); }} className="mt-3 text-xs text-[#0012FF] underline hover:opacity-70">Reset filters</button>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty state for favourites */}
        {showFavouritesOnly && !loading && filteredCreators.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-500">No favourite creators yet</p>
            <p className="text-sm text-gray-400 mt-1">Tap the heart on any creator card to add them to favourites</p>
          </div>
        )}

        {/* Empty state for saved */}
        {showSavedOnly && !loading && filteredCreators.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
              <svg width="28" height="34" viewBox="0 0 24 28" fill="none" stroke="#0012FF" strokeWidth="1.5">
                <path d="M19 25L12 19L5 25V4C5 2.9 5.9 2 7 2H17C18.1 2 19 2.9 19 4V25Z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-500">No saved creators yet</p>
            <p className="text-sm text-gray-400 mt-1">Tap the bookmark on any creator card to save them here</p>
          </div>
        )}

        {/* Creator Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="w-full aspect-[4/4.2] bg-gray-200 rounded-[20px]" />
                <div className="space-y-2 px-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (!showFavouritesOnly && !showSavedOnly) && paginated.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-semibold text-gray-500">No creators found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : paginated.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            {paginated.map((creator, index) => {
              const isFav = favourites.includes(creator.username);
              return (
                <motion.div
                  key={creator.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  onClick={() => !isAdmin && router.push(`/creators/${creator.username}/book-session`)}
                  className={`flex flex-col w-full group ${isAdmin ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {/* Top Image Container */}
                  <div className="relative w-full aspect-[4/4.2] rounded-[20px] overflow-hidden bg-gray-100 mb-3.5 shadow-xs transition-transform duration-300 group-hover:scale-[1.01]">
                    <img
                      src={creator.profilePhoto || '/avatar.png'}
                      alt={creator.displayName || creator.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Top Left Badge: Sponsored / Verified */}
                    <span
                      className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs tracking-wide ${
                        creator.isVerified
                          ? 'bg-[#E6F9EE] text-[#12B76A]'
                          : 'bg-[#EEF2FF] text-[#0012FF]'
                      }`}
                    >
                      {creator.isVerified ? 'Verified' : 'Sponsored'}
                    </span>

                    {/* Top Right Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavourite(creator.username);
                      }}
                      disabled={favLoading === creator.username}
                      className="absolute top-3.5 right-3.5 z-20 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
                    >
                      <svg
                        className={`w-6 h-6 transition-colors duration-200 ${
                          isFav ? 'text-[#FF3B3B] fill-[#FF3B3B] drop-shadow-md' : 'text-white fill-white drop-shadow-md'
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>

                  {/* Info Box Below Image */}
                  <div className="px-0.5 space-y-1">
                    {/* Title & Star Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-black font-sans flex items-center gap-1.5 leading-tight truncate">
                        <span>{creator.displayName || creator.name}</span>
                        {creator.isVerified && (
                          <svg className="w-4.5 h-4.5 text-[#12B76A] fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        )}
                      </h3>
                      <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-500 shrink-0">
                        ★ {creator.rating || '4.9'}
                      </span>
                    </div>

                    {/* Handle */}
                    <p className="text-xs text-gray-400 font-medium font-sans">@{creator.username}</p>

                    {/* Short Bio */}
                    <p className="text-xs text-gray-400 font-sans leading-relaxed line-clamp-2 pt-1">
                      {creator.shortBio || 'Ayesha Khan is one of Pakistan’s leading fashion and lifestyle content creators...'}
                    </p>

                    {/* Price Row */}
                    <div className="pt-2 flex items-center gap-1 text-xs text-gray-400 font-sans">
                      <span>Starting from</span>
                      <strong className="text-black font-black text-sm sm:text-base ml-1">
                        {creator.startingPrice ? `${creator.startingPrice} PKR` : '1200 PKR'}
                      </strong>
                    </div>

                    {/* Book Now Link */}
                    {!isAdmin && (
                      <div>
                        <Link
                          href={`/creators/${creator.username}/book-session`}
                          className="text-xs sm:text-sm font-bold text-[#0012FF] underline hover:text-[#0010d0] font-sans pt-1 inline-block"
                        >
                          Book Now
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : null}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#ddd] bg-white text-[#555] hover:border-[#0012FF] hover:text-[#0012FF] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => handlePageChange(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold border transition-all ${p === currentPage ? 'bg-[#0012FF] text-white border-[#0012FF]' : 'bg-white text-[#555] border-[#ddd] hover:border-[#0012FF] hover:text-[#0012FF]'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#ddd] bg-white text-[#555] hover:border-[#0012FF] hover:text-[#0012FF] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
