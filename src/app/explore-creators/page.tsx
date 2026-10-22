'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from '@/components/UserNavbar';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import AdminNavbar from '@/components/AdminNavbar';
import CreatorNavbar from '@/components/CreatorNavbar';
import {
  getStoredFavourites,
  setStoredFavourites,
  toggleFavouriteApi,
  subscribeFavourites,
} from '@/lib/favouritesSync';

const ITEMS_PER_PAGE = 12;

function getCategoryIcon(name: string) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('all')) {
    return (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    );
  }
  if (lower.includes('lifestyle')) {
    return (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  }
  if (lower.includes('tech') || lower.includes('software') || lower.includes('developer') || lower.includes('code')) {
    return (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (lower.includes('fitness') || lower.includes('health') || lower.includes('gym')) {
    return (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (lower.includes('fashion') || lower.includes('style')) {
    return (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    );
  }
  if (lower.includes('business') || lower.includes('marketing') || lower.includes('finance')) {
    return (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (lower.includes('education')) {
    return (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.168.477-4.5 1.253" />
      </svg>
    );
  }
  if (lower.includes('beauty')) {
    return (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    );
  }
  if (lower.includes('food') || lower.includes('travel')) {
    return (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

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
  const [categoryPage, setCategoryPage] = useState(0);
  const CATEGORIES_PER_PAGE = 6;

  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (categoriesScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoriesScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 330;
      categoriesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'booking' | 'favourite'>('booking');
  const [loginCallbackUrl, setLoginCallbackUrl] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCreatorBooking = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (isAdmin) return;
    const destination = `/creators/${username}/book-session`;
    if (!isAuthenticated) {
      setLoginCallbackUrl(destination);
      setLoginModalMode('booking');
      setShowLoginModal(true);
      return;
    }
    router.push(destination);
  };
  const [favLoading, setFavLoading] = useState<string | null>(null); // username being toggled

  // Hydrate from cache and subscribe to global favourites sync immediately on mount
  useEffect(() => {
    const storedFavs = getStoredFavourites();
    if (storedFavs.length > 0) setFavourites(storedFavs);

    const unsubscribe = subscribeFavourites((newFavs) => {
      setFavourites(newFavs);
    });

    try {
      const cached = sessionStorage.getItem('reachly_explore_creators_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.creators && parsed.creators.length > 0) setCreators(parsed.creators);
        if (parsed.saved) setSaved(parsed.saved);
        if (parsed.displayName) setDisplayName(parsed.displayName);
        if (parsed.profilePhoto) setProfilePhoto(parsed.profilePhoto);
        if (parsed.isAuthenticated !== undefined) setIsAuthenticated(parsed.isAuthenticated);
        if (parsed.isCreator !== undefined) setIsCreator(parsed.isCreator);
        if (parsed.isAdmin !== undefined) setIsAdmin(parsed.isAdmin);
        setLoading(false);
      }
    } catch (e) {}

    return () => unsubscribe();
  }, []);

  // Fetch creators + auth + saved + favourite lists in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creatorsRes, authRes, savedRes, favRes, catRes] = await Promise.all([
          fetch('/api/creators'),
          fetch('/api/user/me'),
          fetch('/api/user/saved-creators'),
          fetch('/api/user/favourite-creators'),
          fetch('/api/categories'),
        ]);

        let freshCreators: any[] = [];
        let freshFavourites: string[] = [];
        let freshSaved: string[] = [];
        let freshAuth = false;
        let freshIsCreator = false;
        let freshIsAdmin = false;
        let freshDisplayName = '';
        let freshProfilePhoto: string | null = null;

        if (creatorsRes.ok) {
          const data = await creatorsRes.json();
          freshCreators = data.creators || [];
          setCreators(freshCreators);
        }

        if (authRes.ok) {
          const userData = await authRes.json();
          freshAuth = true;
          setIsAuthenticated(true);
          
          const email = userData.user?.email?.toLowerCase() || '';
          if (email === 'abdullahgotaccess@gmail.com' || email === 'admin@reachly.com') {
            freshIsAdmin = true;
            setIsAdmin(true);
          }

          if (userData.creatorProfile) {
            freshIsCreator = true;
            freshDisplayName = userData.creatorProfile.displayName || userData.user?.name || '';
            freshProfilePhoto = userData.creatorProfile.profilePhoto || null;
            setIsCreator(true);
            setDisplayName(freshDisplayName);
            setProfilePhoto(freshProfilePhoto);
          } else if (userData.user) {
            freshIsCreator = false;
            freshDisplayName = userData.user.name || '';
            freshProfilePhoto = userData.user.profilePhoto || null;
            setIsCreator(false);
            setDisplayName(freshDisplayName);
            setProfilePhoto(freshProfilePhoto);
          }

          if (savedRes.ok) {
            const d = await savedRes.json();
            freshSaved = d.savedCreators || [];
            setSaved(freshSaved);
          }
          if (favRes.ok) {
            const d = await favRes.json();
            freshFavourites = d.favouriteCreators || [];
            setFavourites(freshFavourites);
            setStoredFavourites(freshFavourites, true);
          }
        } else {
          setIsAuthenticated(false);
        }

        if (catRes && catRes.ok) {
          const catData = await catRes.json();
          if (catData.categories && Array.isArray(catData.categories)) {
            setCategories([
              { id: 'all', label: 'All Categories' },
              ...catData.categories.map((c: any) => ({
                id: (c.slug || c.name).toLowerCase(),
                label: c.name,
              })),
            ]);
          }
        }

        // Cache for next instant mount
        try {
          sessionStorage.setItem('reachly_explore_creators_cache', JSON.stringify({
            creators: freshCreators,
            favourites: freshFavourites,
            saved: freshSaved,
            isAuthenticated: freshAuth,
            isCreator: freshIsCreator,
            isAdmin: freshIsAdmin,
            displayName: freshDisplayName,
            profilePhoto: freshProfilePhoto
          }));
        } catch (e) {}
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
    if (!isAuthenticated) {
      setLoginCallbackUrl('');
      setLoginModalMode('favourite');
      setShowLoginModal(true);
      return;
    }
    if (favLoading === creatorUsername) return;
    setFavLoading(creatorUsername);
    try {
      const res = await toggleFavouriteApi(creatorUsername);
      if (res.requiresAuth) {
        setLoginCallbackUrl('');
        setLoginModalMode('favourite');
        setShowLoginModal(true);
      }
    } finally {
      setFavLoading(null);
    }
  }, [isAuthenticated, favLoading]);

  const toggleSaved = useCallback(async (creatorUsername: string) => {
    if (!isAuthenticated) {
      setLoginCallbackUrl('');
      setLoginModalMode('favourite');
      setShowLoginModal(true);
      return;
    }
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

  // Filter creators (memoized)
  const filteredCreators = useMemo(() => {
    return creators.filter(c => {
      if (showFavouritesOnly && !favourites.includes(c.username)) return false;
      if (showSavedOnly && !saved.includes(c.username)) return false;
      if (selectedCategory !== 'all') {
        const niches: string[] = c.niches || [];
        const matchesNiche = niches.some((n: string) => n.toLowerCase() === selectedCategory);
        const matchesCat = (c.category || '').toLowerCase() === selectedCategory;
        if (!matchesNiche && !matchesCat) return false;
      }
      if (verifiedOnly && !c.isVerified) return false;
      if (minRating !== null && (parseFloat(c.rating) || 0) < minRating) return false;
      return true;
    });
  }, [creators, showFavouritesOnly, favourites, showSavedOnly, saved, selectedCategory, verifiedOnly, minRating]);

  const totalPages = Math.max(1, Math.ceil(filteredCreators.length / ITEMS_PER_PAGE));
  const paginated = filteredCreators.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [categories, setCategories] = useState<{ id: string; label: string }[]>([
    { id: 'all', label: 'All Categories' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'tech', label: 'Tech' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'business', label: 'Business' },
  ]);

  const allFilterItems = useMemo(() => {
    const items: Array<{ id: string; label: string; isFav?: boolean; isSaved?: boolean }> = [
      ...categories,
      { id: 'favourites', label: 'Favourites', isFav: true },
      { id: 'saved', label: 'Saved', isSaved: true },
    ];
    return items;
  }, [categories]);

  const totalCategoryPages = Math.max(1, Math.ceil(allFilterItems.length / CATEGORIES_PER_PAGE));
  const visibleCategories = useMemo(() => {
    return allFilterItems.slice(
      categoryPage * CATEGORIES_PER_PAGE,
      (categoryPage + 1) * CATEGORIES_PER_PAGE
    );
  }, [allFilterItems, categoryPage]);

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
          <nav className="bg-white shadow-sm border border-gray-100 max-w-[1536px] mx-auto rounded-3xl px-6 sm:px-8 py-3.5 sm:py-4 relative flex flex-col">
            <div className="relative flex justify-between items-center w-full">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 z-10 flex-shrink-0">
                <img src="/assets/logo1.png" alt="Reachly" className="h-10 w-auto object-contain" />
              </Link>

              {/* Desktop Nav - Central */}
              <div className="hidden lg:flex items-center gap-7 xl:gap-9 absolute left-1/2 -translate-x-1/2">
                <Link
                  href="/"
                  className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/explore-creators"
                  className="font-sans text-sm font-bold text-[#0012FF] transition-colors"
                >
                  Explore Creators
                </Link>
                <Link
                  href="/events"
                  className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/for-creators"
                  className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  For Creators
                </Link>
                <Link
                  href="/about"
                  className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  About
                </Link>
              </div>

              {/* Right Auth Buttons */}
              <div className="hidden lg:flex items-center gap-4 z-10">
                <button
                  onClick={() => router.push('/login')}
                  className="text-gray-700 font-sans font-medium text-sm hover:text-black transition-all cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="border border-gray-300 text-gray-700 px-5 py-2 rounded-full font-sans font-medium text-sm hover:border-black hover:text-black transition-all cursor-pointer"
                >
                  Sign up
                </button>
              </div>

              {/* Mobile Hamburger */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center focus:outline-none z-10"
                aria-label="Toggle menu"
              >
                <div className="relative w-6 h-6">
                  <motion.span
                    animate={
                      isMobileMenuOpen
                        ? { rotate: 45, top: 12 }
                        : { rotate: 0, top: 4 }
                    }
                    transition={{ duration: 0.3 }}
                    className="absolute left-0 w-6 h-[2px] bg-black rounded-full"
                  />
                  <motion.span
                    animate={{
                      opacity: isMobileMenuOpen ? 0 : 1,
                      x: isMobileMenuOpen ? -10 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-3 w-6 h-[2px] bg-black rounded-full"
                  />
                  <motion.span
                    animate={
                      isMobileMenuOpen
                        ? { rotate: -45, top: 12 }
                        : { rotate: 0, top: 20 }
                    }
                    transition={{ duration: 0.3 }}
                    className="absolute left-0 w-6 h-[2px] bg-black rounded-full"
                  />
                </div>
              </motion.button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="lg:hidden overflow-hidden mt-4 pt-4 border-t border-gray-100"
                >
                  <div className="flex flex-col gap-4 pb-4">
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-sans text-base font-medium text-gray-700 hover:text-black"
                    >
                      Home
                    </Link>
                    <Link
                      href="/explore-creators"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-sans text-base font-bold text-[#0012FF]"
                    >
                      Explore Creators
                    </Link>
                    <Link
                      href="/events"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-sans text-base font-medium text-gray-700 hover:text-black"
                    >
                      Events
                    </Link>
                    <Link
                      href="/for-creators"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-sans text-base font-medium text-gray-700 hover:text-black"
                    >
                      For Creators
                    </Link>
                    <Link
                      href="/about"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block font-sans text-base font-medium text-gray-700 hover:text-black"
                    >
                      About
                    </Link>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/login');
                      }}
                      className="w-full py-2.5 rounded-full text-center text-sm font-semibold text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push('/signup');
                      }}
                      className="w-full py-2.5 rounded-full text-center text-sm font-semibold text-white bg-[#0012FF] hover:bg-[#0010d0] transition-all cursor-pointer shadow-sm"
                    >
                      Sign up
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>
      )}

      {/* Guest Login / Favourites Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[150] p-4 cursor-pointer"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer z-10"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Illustration */}
              <div className="w-40 sm:w-52 h-auto my-2">
                <img
                  src={loginModalMode === 'booking' ? '/assets/login.png' : '/assets/favourites.png'}
                  alt={loginModalMode === 'booking' ? 'Login Required' : 'Save to Favourites'}
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
                {loginModalMode === 'booking' ? 'Login Required' : 'Save to Favourites'}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
                {loginModalMode === 'booking'
                  ? 'Please log in or sign up to continue booking this session with the creator.'
                  : 'Create a free account or log in to save your favourite creators and get personalised recommendations.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                <button
                  onClick={() => {
                    const loginUrl = loginCallbackUrl
                      ? `/login?callbackUrl=${encodeURIComponent(loginCallbackUrl)}`
                      : '/login';
                    router.push(loginUrl);
                  }}
                  className="w-full py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    const signupUrl = loginCallbackUrl
                      ? `/signup?callbackUrl=${encodeURIComponent(loginCallbackUrl)}`
                      : '/signup';
                    router.push(signupUrl);
                  }}
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
      <main className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-0 py-8">
        {/* Hero text */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm font-sans mb-1">Find the perfect match</p>
          <h1 className="text-4xl font-black text-black font-anton tracking-tight">
            Connect with Talented Creators <span className="text-[#0012FF] font-black italic font-anton">near you</span>
          </h1>
        </div>

        {/* Category Filter Bar + Navigation Arrows + Action Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8 w-full max-w-[1160px] mx-auto">
          {/* Categories Section (Shows 6 at a time, arrow right next to Business) */}
          <div className="flex items-center gap-2">
            {/* Previous Arrow on Left (Shown ONLY when not on first page of 6) */}
            {categoryPage > 0 && (
              <button
                type="button"
                onClick={() => setCategoryPage((p) => Math.max(0, p - 1))}
                className="w-10 h-10 rounded-full border border-[#0012FF] flex items-center justify-center text-[#0012FF] hover:bg-[#0012FF]/5 shrink-0 transition-all cursor-pointer shadow-xs"
                aria-label="Previous categories"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Categories Display (Exactly 6 items per page, hugging contents) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {visibleCategories.map((item) => {
                if (item.isFav) {
                  return (
                    <button
                      key="fav"
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          setLoginCallbackUrl('');
                          setLoginModalMode('favourite');
                          setShowLoginModal(true);
                          return;
                        }
                        const next = !showFavouritesOnly;
                        setShowFavouritesOnly(next);
                        if (next) setShowSavedOnly(false);
                        setSelectedCategory('all');
                        setCurrentPage(1);
                      }}
                      className={`h-[40px] px-3.5 sm:px-4 shrink-0 rounded-[8px] flex items-center justify-center gap-2 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer select-none ${
                        showFavouritesOnly
                          ? '!bg-red-500 !text-white !border-red-500 shadow-xs'
                          : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-red-400 hover:text-red-500'
                      }`}
                    >
                      <svg className={`w-4 h-4 shrink-0 ${showFavouritesOnly ? '!text-white' : ''}`} fill={showFavouritesOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className={showFavouritesOnly ? '!text-white' : ''}>Favourites</span>
                      {isAuthenticated && favourites.length > 0 && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${showFavouritesOnly ? 'bg-white/25 !text-white' : 'bg-red-100 text-red-500'}`}>
                          {favourites.length}
                        </span>
                      )}
                    </button>
                  );
                }

                if (item.isSaved) {
                  return (
                    <button
                      key="saved"
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          setLoginCallbackUrl('');
                          setLoginModalMode('favourite');
                          setShowLoginModal(true);
                          return;
                        }
                        const next = !showSavedOnly;
                        setShowSavedOnly(next);
                        if (next) setShowFavouritesOnly(false);
                        setSelectedCategory('all');
                        setCurrentPage(1);
                      }}
                      className={`h-[40px] px-3.5 sm:px-4 shrink-0 rounded-[8px] flex items-center justify-center gap-2 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer select-none ${
                        showSavedOnly
                          ? '!bg-[#0012FF] !text-white !border-[#0012FF] shadow-xs'
                          : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0012FF]/40 hover:text-[#0012FF]'
                      }`}
                    >
                      <svg className={`w-4 h-4 shrink-0 ${showSavedOnly ? '!text-white' : ''}`} fill={showSavedOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span className={showSavedOnly ? '!text-white' : ''}>Saved</span>
                      {isAuthenticated && saved.length > 0 && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${showSavedOnly ? 'bg-white/25 text-white' : 'bg-[#EEF2FF] text-[#0012FF]'}`}>
                          {saved.length}
                        </span>
                      )}
                    </button>
                  );
                }

                const isActive = selectedCategory === item.id && !showFavouritesOnly && !showSavedOnly;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedCategory(item.id);
                      setShowFavouritesOnly(false);
                      setShowSavedOnly(false);
                      setCurrentPage(1);
                    }}
                    className={`h-[40px] px-3.5 sm:px-4 shrink-0 rounded-[8px] flex items-center justify-center gap-2 text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer select-none ${
                      isActive
                        ? '!bg-[#0012FF] !text-white !border-[#0012FF] shadow-xs'
                        : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0012FF]/40 hover:text-[#0012FF]'
                    }`}
                  >
                    <span className={isActive ? '!text-white' : ''}>{getCategoryIcon(item.label || item.id)}</span>
                    <span className={isActive ? '!text-white' : ''}>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Forward Arrow on Right (Exactly right next to Business / categories) */}
            {categoryPage < totalCategoryPages - 1 && (
              <button
                type="button"
                onClick={() => setCategoryPage((p) => Math.min(totalCategoryPages - 1, p + 1))}
                className="w-10 h-10 rounded-full bg-[#0012FF] flex items-center justify-center text-white shadow-md shadow-[#0012FF]/20 hover:bg-[#0010d0] shrink-0 transition-all cursor-pointer"
                aria-label="Next categories"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Right Action Buttons: Filter only */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Filter */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`h-[40px] px-3.5 sm:px-4 rounded-[8px] flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                showFilterPanel
                  ? 'bg-[#0012FF] text-white border-[#0012FF]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0012FF]/40 hover:text-[#0012FF]'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-6 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            <div>
              <label className="block text-sm font-semibold text-[#333] mb-3">Minimum Rating</label>
              <div className="flex gap-2 flex-wrap">
                {[null, 3.5, 4, 4.5].map((r) => (
                  <button
                    key={String(r)}
                    onClick={() => setMinRating(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      minRating === r ? 'bg-[#0012FF] text-white border-[#0012FF]' : 'bg-white text-[#555] border-[#ddd] hover:border-[#0012FF]/50'
                    }`}
                  >
                    {r === null ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#333] mb-3">Verified Only</label>
              <button
                onClick={() => setVerifiedOnly((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                  verifiedOnly ? 'bg-[#0012FF] text-white border-[#0012FF]' : 'bg-white text-[#555] border-[#ddd] hover:border-[#0012FF]/50'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {verifiedOnly ? 'Verified Only ✓' : 'Show All'}
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#333] mb-3">Saved & Favourites</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      setLoginCallbackUrl('');
                      setLoginModalMode('favourite');
                      setShowLoginModal(true);
                      return;
                    }
                    const next = !showFavouritesOnly;
                    setShowFavouritesOnly(next);
                    if (next) setShowSavedOnly(false);
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    showFavouritesOnly
                      ? 'bg-red-500 text-white border-red-500 shadow-xs'
                      : 'bg-white text-gray-700 border-[#ddd] hover:border-red-400 hover:text-red-500'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill={showFavouritesOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Favourites Only</span>
                  {isAuthenticated && favourites.length > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${showFavouritesOnly ? 'bg-white/25 text-white' : 'bg-red-100 text-red-500'}`}>
                      {favourites.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      setLoginCallbackUrl('');
                      setLoginModalMode('favourite');
                      setShowLoginModal(true);
                      return;
                    }
                    const next = !showSavedOnly;
                    setShowSavedOnly(next);
                    if (next) setShowFavouritesOnly(false);
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    showSavedOnly
                      ? 'bg-[#0012FF] text-white border-[#0012FF] shadow-xs'
                      : 'bg-white text-gray-700 border-[#ddd] hover:border-[#0012FF]/40 hover:text-[#0012FF]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill={showSavedOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>Saved Only</span>
                  {isAuthenticated && saved.length > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${showSavedOnly ? 'bg-white/25 text-white' : 'bg-[#EEF2FF] text-[#0012FF]'}`}>
                      {saved.length}
                    </span>
                  )}
                </button>
              </div>
              {(verifiedOnly || minRating !== null || showFavouritesOnly || showSavedOnly) && (
                <button
                  onClick={() => {
                    setVerifiedOnly(false);
                    setMinRating(null);
                    setShowFavouritesOnly(false);
                    setShowSavedOnly(false);
                  }}
                  className="mt-3 text-xs text-[#0012FF] underline hover:opacity-70 cursor-pointer block"
                >
                  Reset all filters
                </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center w-full max-w-[1160px] mx-auto">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col w-[275px] h-[465px] justify-between">
                <div className="w-[275px] h-[300px] bg-gray-200 rounded-[20px]" />
                <div className="space-y-2 pt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded mt-2" />
                    <div className="h-3 w-full bg-gray-200 rounded mt-2" />
                  </div>
                  <div>
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    <div className="h-4 w-1/4 bg-gray-200 rounded mt-2" />
                  </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center w-full max-w-[1160px] mx-auto">
            {paginated.map((creator, index) => {
              const isFav = favourites.includes(creator.username);
              return (
                <motion.div
                  key={creator.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  className="flex flex-col w-[275px] h-[465px] justify-between group"
                >
                  {/* Top Image Container */}
                  <div className="relative w-[275px] h-[300px] rounded-[20px] overflow-hidden bg-gray-100 shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-[1.01]">
                    <img
                      src={creator.profilePhoto || '/avatar.png'}
                      alt={creator.displayName || creator.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Top Left Badge: Sponsored / Verified */}
                    <span
                      className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
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
                  <div className="flex flex-col flex-1 justify-between pt-3 pb-1">
                    <div>
                      {/* Title & Star Rating */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-base text-black font-sans flex items-center gap-1.5 leading-tight truncate">
                          <span className="truncate">{creator.displayName || creator.name}</span>
                          {creator.isVerified && (
                            <svg className="w-4 h-4 text-[#12B76A] fill-current shrink-0" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          )}
                        </h3>
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                          ★ {creator.rating || '4.9'}
                        </span>
                      </div>

                      {/* Handle */}
                      <p className="text-xs text-gray-400 font-medium font-sans mt-0.5">@{creator.username}</p>

                      {/* Short Bio */}
                      <p className="text-xs text-gray-500 font-sans leading-relaxed line-clamp-2 mt-1.5">
                        {creator.shortBio || 'Ayesha Khan is one of Pakistan’s leading fashion and lifestyle content creators...'}
                      </p>
                    </div>

                    <div>
                      {/* Price Row */}
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-sans">
                        <span>Starting from</span>
                        <strong className="text-black font-black text-sm ml-1">
                          {creator.startingPrice ? `${creator.startingPrice} PKR` : '1200 PKR'}
                        </strong>
                      </div>

                      {/* Book Now Link */}
                      {!isAdmin && (
                        <div className="pt-1">
                          <span
                            onClick={(e) => handleCreatorBooking(e, creator.username)}
                            className="text-xs sm:text-sm font-bold text-[#0012FF] underline hover:text-[#0010d0] font-sans inline-block cursor-pointer"
                          >
                            Book Now
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : null}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="w-full pt-8 mt-12 border-t border-gray-200 flex items-center justify-center gap-2 max-w-[1160px] mx-auto">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#0012FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous Page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all ${
                  p === currentPage
                    ? 'bg-[#0012FF] text-white shadow-xs'
                    : 'bg-transparent text-gray-600 hover:text-[#0012FF]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#0012FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next Page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
