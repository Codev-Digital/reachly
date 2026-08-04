'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatorInfo } from '@/app/creators/[username]/book-session/layout';

interface CreatorProfileCardProps {
  creator: CreatorInfo | null;
  mobileMode?: 'full' | 'compact';
  onMobileBookClick?: () => void;
}

export default function CreatorProfileCard({ creator, mobileMode = 'compact', onMobileBookClick }: CreatorProfileCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  useEffect(() => {
    if (!creator?.username) return;
    const checkSavedStatus = async () => {
      try {
        const res = await fetch('/api/user/saved-creators');
        if (res.ok) {
          setIsAuthenticated(true);
          const data = await res.json();
          const savedList = data.savedCreators || [];
          setIsSaved(savedList.includes(creator.username));
        } else if (res.status === 401) {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error checking saved status:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSavedStatus();
  }, [creator?.username]);

  const toggleSaved = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!creator?.username || saving) return;
    setSaving(true);
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);

    try {
      const res = await fetch('/api/user/saved-creators', {
        method: nextSavedState ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: creator.username }),
      });
      if (res.ok) {
        const data = await res.json();
        const savedList = data.savedCreators || [];
        setIsSaved(savedList.includes(creator.username));
      } else {
        setIsSaved(!nextSavedState);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      setIsSaved(!nextSavedState);
    } finally {
      setSaving(false);
    }
  };

  const formatNumber = (num?: number) => {
    if (num === undefined) return '0';
    if (num >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k+';
    return num.toString();
  };

  const tagColors = [
    'bg-[#FFE6E6] text-[#FF4D4D]',
    'bg-[#E6F9EE] text-[#12B76A]',
    'bg-[#FFF6E6] text-[#FF9500]',
    'bg-[#EEF2FF] text-[#0012FF]',
  ];

  if (!creator) {
    return (
      <div className="w-full max-w-[450px] rounded-[32px] border border-gray-200/80 bg-white p-3 sm:p-3 shadow-sm sticky top-[96px] isolate animate-pulse">
        {/* Cover Photo Skeleton */}
        <div className={`relative w-full rounded-[15px] bg-gray-200 ${mobileMode === 'compact' ? 'h-[90px] lg:h-[140px]' : 'h-[140px]'}`}></div>
        
        {/* Profile Avatar Skeleton */}
        <div className={`relative z-10 rounded-full border-4 border-white bg-gray-200 ml-3 ${mobileMode === 'compact' ? '-mt-10 w-[80px] h-[80px] lg:-mt-14 lg:w-[115px] lg:h-[115px]' : '-mt-14 w-[115px] h-[115px]'}`}></div>
        
        {/* Name & Handle Skeleton */}
        <div className={`px-2 ${mobileMode === 'compact' ? 'mt-1.5 lg:mt-3' : 'mt-3'}`}>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        
        {/* Location & Languages Skeleton */}
        <div className={`flex items-center justify-center gap-5 ${mobileMode === 'compact' ? 'mt-3 lg:mt-5' : 'mt-5'}`}>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        
        {/* Stats Skeleton */}
        <div className={`grid grid-cols-3 gap-2 border-y border-gray-100 ${mobileMode === 'compact' ? 'mt-4 py-2.5 lg:mt-6 lg:py-4' : 'mt-6 py-4'}`}>
          <div className="flex flex-col items-center justify-center">
            <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="flex flex-col items-center justify-center border-x border-gray-100 px-1">
            <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        
        {/* About Section Skeleton */}
        <div className={`mt-5 px-1 ${mobileMode === 'compact' ? 'hidden lg:block' : 'block'}`}>
          <div className="h-5 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Niche Tags Skeleton */}
        <div className={`flex flex-wrap gap-2 px-1 ${mobileMode === 'compact' ? 'mt-2 lg:mt-4' : 'mt-4'}`}>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-[450px] rounded-[32px] border border-gray-200/80 bg-white p-3 sm:p-3 shadow-sm sticky top-[96px] isolate">
        {/* Cover Photo Container (Clean - No Text Overlay) */}
        <div className={`relative w-full rounded-[15px] overflow-hidden bg-gray-100 ${mobileMode === 'compact' ? 'h-[90px] lg:h-[140px]' : 'h-[140px]'}`}>
          {creator?.coverPhoto ? (
            <img src={creator.coverPhoto} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0012FF] via-indigo-600 to-purple-700" />
          )}

          {/* Top-Right Badges: Bookmark + Role Tag */}
          <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
            {/* Bookmark button */}
            {creator && (
              <button
                onClick={toggleSaved}
                disabled={loading || saving}
                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-md disabled:opacity-60 cursor-pointer"
                aria-label={isSaved ? 'Remove from saved' : 'Save creator'}
              >
                <svg width="14" height="17" viewBox="0 0 24 28"
                  fill={isSaved ? '#0012FF' : '#0012FF'}
                  stroke={isSaved ? '#0012FF' : '#0012FF'}
                  strokeWidth="2"
                  className="transition-colors duration-200"
                >
                  <path d="M19 25L12 19L5 25V4C5 2.9 5.9 2 7 2H17C18.1 2 19 2.9 19 4V25Z" />
                </svg>
              </button>
            )}

            {/* Niche Badge */}
            <span className="bg-[#E5E9FF] text-[#0012FF] px-4 py-1.5 rounded-full text-xs font-bold shadow-xs">
              {creator?.niches?.[0] || 'Influencer'}
            </span>
          </div>
        </div>

        {/* Profile Avatar overlapping bottom-left of cover photo */}
        <div className={`relative z-10 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white ml-3 ${mobileMode === 'compact' ? '-mt-10 w-[80px] h-[80px] lg:-mt-14 lg:w-[115px] lg:h-[115px]' : '-mt-14 w-[115px] h-[115px]'}`}>
          <img src={creator?.profilePhoto || '/avatar.png'} alt={creator?.displayName} className="w-full h-full object-cover" />
        </div>

        {/* Name & Handle */}
        <div className={`px-2 ${mobileMode === 'compact' ? 'mt-1.5 lg:mt-3' : 'mt-3'}`}>
          <h3 className="font-extrabold text-2xl text-black font-sans leading-tight">
            {creator?.displayName || 'Sophia Reed'}
          </h3>
          <p className="text-sm text-gray-400 font-medium font-sans mt-0.5">
            @{creator?.username || 'sophiareed'}
          </p>
        </div>

        {/* Location & Languages Row */}
        <div className={`flex items-center justify-center gap-5 text-sm font-medium text-gray-500 font-sans ${mobileMode === 'compact' ? 'mt-3 lg:mt-5' : 'mt-5'}`}>
          <span className="flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {creator?.city || 'Lahore'}
          </span>

          <span className="flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {creator?.languages && creator.languages.length > 0 ? creator.languages.join(', ') : 'Urdu, English'}
          </span>
        </div>

        {/* 3 Stats Columns */}
        <div className={`grid grid-cols-3 gap-2 border-y border-gray-100 text-center ${mobileMode === 'compact' ? 'mt-4 py-2.5 lg:mt-6 lg:py-4' : 'mt-6 py-4'}`}>
          <div className="flex flex-col items-center justify-center">
            <span className={`font-black text-black font-sans leading-tight ${mobileMode === 'compact' ? 'text-xl lg:text-2xl' : 'text-2xl'}`}>
              {formatNumber(creator?.stats?.sessionsCompleted ?? 12000)}
            </span>
            <span className={`text-xs text-gray-400 font-medium font-sans leading-snug ${mobileMode === 'compact' ? 'mt-0.5 lg:mt-1' : 'mt-1'}`}>
              Sessions completed
            </span>
          </div>

          <div className="flex flex-col items-center justify-center border-x border-gray-100 px-1">
            <span className={`font-black text-black font-sans leading-tight ${mobileMode === 'compact' ? 'text-xl lg:text-2xl' : 'text-2xl'}`}>
              {formatNumber(creator?.stats?.happyCustomers ?? 50000)}
            </span>
            <span className={`text-xs text-gray-400 font-medium font-sans leading-snug ${mobileMode === 'compact' ? 'mt-0.5 lg:mt-1' : 'mt-1'}`}>
              Happy Users
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className={`font-black text-black font-sans leading-tight ${mobileMode === 'compact' ? 'text-xl lg:text-2xl' : 'text-2xl'}`}>
              {creator?.stats?.totalCategories ?? 8}
            </span>
            <span className={`text-xs text-gray-400 font-medium font-sans leading-snug ${mobileMode === 'compact' ? 'mt-0.5 lg:mt-1' : 'mt-1'}`}>
              Total Categories
            </span>
          </div>
        </div>

        {/* Book a Session Button (Mobile Only, Full Mode Only) */}
        <div className={`mt-6 px-1 ${mobileMode === 'full' ? 'block lg:hidden' : 'hidden'}`}>
          <button
            onClick={onMobileBookClick}
            className="w-full py-3.5 bg-[#0012FF] text-white rounded-full font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            Book a Session
          </button>
        </div>

        {/* About Section */}
        <div className={`mt-5 px-1 ${mobileMode === 'compact' ? 'hidden lg:block' : 'block'}`}>
          <h4 className="font-bold text-base text-black font-sans mb-1.5">About</h4>
          <p className={`text-xs sm:text-sm text-gray-400 font-sans leading-relaxed ${isBioExpanded ? '' : 'line-clamp-3'}`}>
            {creator?.shortBio || 'Ayesha Khan is one of Pakistan’s leading fashion and lifestyle content creators. With over 500K followers across Instagram and TikTok...'}
          </p>
          <button
            onClick={() => setIsBioExpanded(!isBioExpanded)}
            className="text-xs font-bold text-black font-sans mt-1.5 cursor-pointer hover:underline"
          >
            {isBioExpanded ? 'Read less' : 'Read more'}
          </button>
        </div>

        {/* Niche Tag Badges */}
        {creator?.niches && creator.niches.length > 0 && (
          <div className={`flex flex-wrap gap-2 px-1 ${mobileMode === 'compact' ? 'mt-2 lg:mt-4' : 'mt-4'}`}>
            {creator.niches.map((tag, idx) => (
              <span key={tag} className={`${tagColors[idx % tagColors.length]} text-xs font-semibold px-3.5 py-1.5 rounded-full`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Social Media Icons */}
        <div className={`items-center gap-2.5 mt-6 px-1 ${mobileMode === 'compact' ? 'hidden lg:flex' : 'flex'}`}>
          {[
            { href: creator?.socialLinks?.facebook, icon: <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /> },
            { href: creator?.socialLinks?.instagram, icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2.5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2.5" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2.5" /></> },
            { href: creator?.socialLinks?.youtube, icon: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="none" stroke="currentColor" strokeWidth="2.5" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" /></> },
            { href: creator?.socialLinks?.tiktok, icon: <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.15 1.25 1.32 2.98 2.04 4.79 2.07v3.83a8.88 8.88 0 0 1-5.18-1.74c-.05 2.82.01 5.63-.04 8.44-.09 2.53-1.12 5.04-3.13 6.64-2.28 1.83-5.46 2.37-8.19 1.4A8.72 8.72 0 0 1 .47 16.92c-.67-2.61-.17-5.5 1.4-7.65 1.76-2.4 4.73-3.66 7.68-3.15V9.92a4.91 4.91 0 0 0-4.63 4.22c-.37 2.45.92 4.98 3.2 5.68 2.22.68 4.77-.37 5.48-2.52.26-.81.23-1.67.24-2.52l.02-14.76z" /> },
          ].map((social, i) => (
            <a
              key={i}
              href={social.href || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#0012FF] text-white flex items-center justify-center shadow-xs hover:bg-[#0010d0] transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">{social.icon}</svg>
            </a>
          ))}
        </div>
      </div>

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
                  alt="Save Favourites"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
                Save Creator
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
                Create a free account or log in to save your favourite creators and access them anytime.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => window.location.href = '/signup'}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
