'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';
import UserTopBar from '@/components/UserTopBar';

export default function UserExploreCreatorsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownCategories = [
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'tech', name: 'Tech' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'business', name: 'Business' },
    { id: 'education', name: 'Education' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'food', name: 'Food' },
  ];

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'tech', name: 'Tech' },
    { id: 'business', name: 'Business' },
    { id: 'education', name: 'Education' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'food', name: 'Food' },
  ];

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

            <UserTopBar searchPlaceholder="Search Creators" />

            <div className="mb-6">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-6">
                Discover <span className="text-[#C8A97E]">Creators</span>
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-sans transition-all border ${
                      selectedCategory === category.id
                        ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border-[rgba(200,169,126,0.3)]'
                        : 'bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] opacity-70 border-transparent hover:opacity-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-6 flex-wrap relative">
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] border border-[rgba(200,169,126,0.3)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    Help & Support
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl overflow-hidden z-50">
                      {dropdownCategories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-sans transition-all ${
                            selectedCategory === cat.id
                              ? 'bg-[#C8A97E] text-[#0C0C0C]'
                              : 'text-[#F9F6F2] opacity-70 hover:bg-[rgba(255,255,255,0.05)] hover:opacity-100'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] border border-transparent">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  Minimum Rating
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] border border-transparent">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Reset all filters
                </button>

                <button 
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] border border-transparent"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Verified
                  <div className="relative w-8 h-4 rounded-full bg-[rgba(255,255,255,0.1)] transition-all">
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${verifiedOnly ? 'right-0.5 bg-[#C8A97E]' : 'left-0.5'}`} />
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
                  <div key={index} className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl overflow-hidden hover:border-[#C8A97E] transition-all">
                    <div className="relative">
                      <img src="/merium in creators section.png" alt="Kainat Aslam" className="w-full aspect-[4/5] object-cover" />
                      <div className="absolute top-3 left-3 bg-[rgba(20,20,20,0.8)] text-[#F9F6F2] px-3 py-1 rounded-full text-[10px] font-semibold font-sans">
                        Influencer
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-serif text-base font-semibold text-[#F9F6F2]">Kainat Aslam</h3>
                        <div className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8A97E">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span className="font-sans text-xs text-[#F9F6F2] opacity-70">4.9</span>
                        </div>
                      </div>
                      <p className="font-sans text-[10px] text-[#F9F6F2] opacity-50 mb-1">@kainataslam.ka</p>
                      <p className="font-sans text-[10px] text-[#F9F6F2] opacity-60 mb-2 line-clamp-2">Ayesha Khan is one of Pakistan's leading fashion and lifestyle content creators...</p>
                      <p className="font-sans text-xs text-[#F9F6F2] mb-2">Starting from <span className="font-semibold text-[#C8A97E]">1200</span></p>
                      <Link href="/creators/kainataslam.ka" className="w-full block text-center bg-[#C8A97E] text-[#0C0C0C] font-sans font-semibold py-2 rounded-full hover:opacity-90 transition-all text-sm">
                        Book Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
