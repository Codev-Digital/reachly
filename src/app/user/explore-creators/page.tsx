'use client';

import { useState, useEffect } from 'react';
import LoadingAnimation from '@/components/LoadingAnimation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';
import UserTopBar from '@/components/UserTopBar';
import LoginToExplore from '@/components/LoginToExplore';

export default function UserExploreCreatorsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openSections, setOpenSections] = useState({
    categories: true,
    priceRange: true,
    rating: true,
    verified: true
  });

  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // No hardcoded creators - we'll use only the API data
  const hardcodedCreators: any[] = [];

  useEffect(() => {
    async function checkAuthAndFetch() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          setIsAuthenticated(true);
          await fetchCreators();
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuthAndFetch();
  }, []);

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
    }
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (loading) return <LoadingAnimation />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] pb-12">
        <CreatorNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-8">
            <UserSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            <main className="flex-1">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden mb-4 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg p-2 text-[#C8A97E]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <LoginToExplore />
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
      <CreatorNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <UserSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
          />

          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden mb-4 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg p-2 text-[#C8A97E]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <UserTopBar searchPlaceholder="Search creators, topics, niches..." />

            <div className="mb-8">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
                Discover <span className="text-[#C8A97E]">Creators</span>
              </h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className="lg:w-72 shrink-0">
                <div className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-xl p-5 sticky top-6">
                  {/* Categories Section */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleSection('categories')}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h3 className="font-serif text-xl font-bold text-[#C8A97E] flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                        </svg>
                        Categories
                      </h3>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C8A97E"
                        strokeWidth="2"
                        className={`transition-transform ${openSections.categories ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {openSections.categories && (
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'fashion', name: 'Fashion', icon: 'hanger' },
                          { id: 'fitness', name: 'Fitness', icon: 'dumbbell' },
                          { id: 'beauty', name: 'Beauty', icon: 'sparkles' },
                          { id: 'food', name: 'Food', icon: 'utensils' },
                          { id: 'lifestyle', name: 'Lifestyle', icon: 'heart' },
                          { id: 'education', name: 'Education', icon: 'book' },
                          { id: 'business', name: 'Business', icon: 'briefcase' },
                          { id: 'tech', name: 'Tech', icon: 'monitor' },
                        ].map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            className={`text-xs px-3 py-2 rounded-xl border transition-all flex items-center gap-2 ${selectedCategories.includes(cat.id)
                              ? 'bg-[rgba(200,169,126,0.1)] border-[#C8A97E] text-white'
                              : 'bg-transparent border-[rgba(255,255,255,0.1)] text-white/70 hover:border-[#C8A97E]/30'
                              }`}
                          >
                            {cat.icon === 'hanger' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.7 7C20.1 4.5 18 3 15.5 3c-1.8 0-3.3.9-4.3 2.3C10.2 3.9 8.7 3 6.9 3 4.4 3 2.3 4.5 1.7 7c-.2.7 0 1.4.5 2l7.2 6.1c.3.3.8.4 1.3.4s1-.1 1.3-.4l7.2-6.1c.5-.6.7-1.3.5-2z" /><path d="M2 15h20" /><path d="M2 19h20" /></svg>}
                            {cat.icon === 'dumbbell' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="10" width="4" height="4" rx="1" /><rect x="16" y="10" width="4" height="4" rx="1" /><line x1="8" y1="12" x2="16" y2="12" /></svg>}
                            {cat.icon === 'sparkles' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><path d="M5 19l.8 2.5L8.3 22l-2.5.8L5 25.3l-.8-2.5L1.7 22l2.5-.8L5 19z" /><path d="M19 19l.8 2.5 2.5.8-2.5.8-.8 2.5-.8-2.5-2.5-.8 2.5-.8.8-2.5z" /></svg>}
                            {cat.icon === 'utensils' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2c-2.8 0-5 2.2-5 5s2.2 5 5 5v8" /><path d="M16 7c0 2.8 2.2 5 5 5" /></svg>}
                            {cat.icon === 'heart' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>}
                            {cat.icon === 'book' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>}
                            {cat.icon === 'briefcase' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" /></svg>}
                            {cat.icon === 'monitor' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>}
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price Range Section */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleSection('priceRange')}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h4 className="font-serif text-xl font-bold text-[#C8A97E] flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        Price Range
                      </h4>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C8A97E"
                        strokeWidth="2"
                        className={`transition-transform ${openSections.priceRange ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {openSections.priceRange && (
                      <div>
                        <div className="px-2">
                          <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full mb-3 relative">
                            <div className="absolute left-[0%] right-[0%] h-full bg-[#C8A97E] rounded-full" />
                            <div className="absolute -top-1 left-[0%] w-5 h-5 bg-white border-2 border-[#C8A97E] rounded-full transform -translate-x-1/2" />
                            <div className="absolute -top-1 left-[100%] w-5 h-5 bg-white border-2 border-[#C8A97E] rounded-full transform -translate-x-1/2" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span className="bg-[rgba(255,255,255,0.05)] px-3 py-1 rounded-full">PKR 0</span>
                          <span className="text-[10px] text-white/40">Drag to adjust your budget</span>
                          <span className="bg-[rgba(255,255,255,0.05)] px-3 py-1 rounded-full">PKR 5000</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rating Section */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleSection('rating')}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h4 className="font-serif text-xl font-bold text-[#C8A97E] flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#C8A97E">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Minimum Rating
                      </h4>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C8A97E"
                        strokeWidth="2"
                        className={`transition-transform ${openSections.rating ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {openSections.rating && (
                      <div className="grid grid-cols-2 gap-2">
                        {['4.5 stars', '4+ stars', '3.5 stars', 'Anything Else'].map((rating, index) => (
                          <button
                            key={rating}
                            onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                            className={`text-sm px-4 py-3 rounded-full border transition-all ${selectedRating === rating
                              ? 'bg-[rgba(200,169,126,0.1)] border-[#C8A97E] text-[#C8A97E]'
                              : 'bg-transparent border-[rgba(255,255,255,0.1)] text-white/70 hover:border-[#C8A97E]/30'
                              }`}
                          >
                            {rating}
                            {selectedRating === rating && (
                              <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-[#C8A97E]">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="#0c0c0c"><polyline points="20 6 9 17 4 12" /></svg>
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Verified Only Section */}
                  <div className="mb-6">
                    <button
                      onClick={() => toggleSection('verified')}
                      className="w-full flex items-center justify-between mb-4"
                    >
                      <h4 className="font-serif text-xl font-bold text-[#C8A97E] flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Verified only
                      </h4>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C8A97E"
                        strokeWidth="2"
                        className={`transition-transform ${openSections.verified ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {openSections.verified && (
                      <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.05)] p-4 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-[rgba(200,169,126,0.1)] flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white/80">Verified only</p>
                          <p className="text-xs text-white/40">Show creators with verified badge</p>
                        </div>
                        <button
                          onClick={() => setVerifiedOnly(!verifiedOnly)}
                          className="relative w-12 h-6 rounded-full bg-[rgba(255,255,255,0.1)] transition-all"
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${verifiedOnly ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reset Button */}
                  <button className="w-full text-[#C8A97E] font-sans text-base flex items-center justify-between py-3 border-t border-b border-[rgba(255,255,255,0.1)] hover:opacity-80 transition-opacity">
                    <span className="flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                      Reset all filters
                    </span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </aside>

              {/* Creator Cards */}
              <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.1)] rounded-xl overflow-hidden animate-pulse">
                        <div className="w-full aspect-[3/4] bg-white/5" />
                        <div className="p-4 space-y-3">
                          <div className="h-5 w-3/4 bg-white/10 rounded" />
                          <div className="h-3 w-1/2 bg-white/10 rounded" />
                          <div className="h-3 w-full bg-white/10 rounded" />
                          <div className="h-10 w-full bg-white/10 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : creators.length === 0 ? (
                  <div className="text-center text-white/50 py-10">No creators found.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creators.map((creator) => (
              <div key={creator.id} className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl overflow-hidden hover:border-[#C8A97E] transition-all">
                <div className="relative">
                  <img src={creator.profilePhoto} alt={creator.displayName} className="w-full aspect-[3/4] object-cover" />
                  {creator.niches && creator.niches[0] && (
                    <div className="absolute top-3 left-3 bg-[rgba(20,20,20,0.8)] text-[#F9F6F2] px-3 py-1 rounded-full text-[10px] font-semibold font-sans capitalize">
                      {creator.niches[0]}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] line-clamp-1">{creator.displayName}</h3>
                      {creator.isVerified && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.5L14.8 7.5L21 8L16.5 12.5L17.5 18.5L12 15.5L6.5 18.5L7.5 12.5L3 8L9.2 7.5L12 1.5Z" fill="#22C55E"/><path d="M10 13L7 10L8.5 8.5L10 10L15.5 5L17 6.5L10 13Z" fill="white"/></svg>}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8A97E">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="font-sans text-xs text-[#F9F6F2] opacity-70">{creator.rating}</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-2">@{creator.username}</p>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-4 h-8 line-clamp-2">{creator.shortBio}</p>
                  <p className="font-sans text-sm text-[#F9F6F2] mb-3">Starting from <span className="font-semibold text-[#C8A97E]">{creator.startingPrice}</span></p>
                  <Link href={`/creators/${creator.username}/book-session`} className="w-full block text-center bg-[#C8A97E] text-[#0C0C0C] font-sans font-semibold py-3 rounded-full hover:opacity-90 transition-all">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
                  </div>
                )}
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
