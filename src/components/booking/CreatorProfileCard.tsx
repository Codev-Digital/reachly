'use client';

import { useState } from 'react';
import { CreatorInfo } from '@/app/creators/[username]/book-session/layout';

interface CreatorProfileCardProps {
  creator: CreatorInfo | null;
}

export default function CreatorProfileCard({ creator }: CreatorProfileCardProps) {
  const [saved, setSaved] = useState(true);

  // Formatting large numbers, e.g., 12000 -> 12k
  const formatNumber = (num?: number) => {
    if (num === undefined) return '0';
    if (num >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k+';
    return num.toString();
  };

  return (
    <div className="w-full max-w-[370px] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100/50 border border-gray-100/80 bg-white sticky top-[96px] isolate">
      {/* Cover Photo Section — tall for impact */}
      <div className="relative h-56 w-full overflow-hidden">
        {creator?.coverPhoto ? (
          <img
            src={creator.coverPhoto}
            alt="cover"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0012FF] via-indigo-600 to-purple-700" />
        )}
        
        {/* Soft top gradient just for buttons visibility if image is bright */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

        {/* Niche badge — glassmorphism top-right */}
        <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-sm z-10">
          {creator?.niches?.[0] || 'Influencer'}
        </span>

        {/* Bookmark button — glassmorphism top-left */}
        <button
          onClick={() => setSaved(!saved)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-all z-10"
          title="Save creator"
        >
          <svg width="14" height="18" viewBox="0 0 24 28" className="transition-colors duration-200" fill={saved ? 'white' : 'none'} stroke="white" strokeWidth="2.5">
            <path d="M19 25L12 19L5 25V4C5 2.9 5.9 2 7 2H17C18.1 2 19 2.9 19 4V25Z" />
          </svg>
        </button>
      </div>

      {/* Profile Content overlapping the cover */}
      <div className="relative px-6 pb-7">
        
        {/* Avatar overlapping the cover */}
        <div className="absolute -top-14 left-6 w-[100px] h-[100px] rounded-[1.25rem] border-4 border-white shadow-xl overflow-hidden bg-white ring-1 ring-black/5 z-10">
          <img
            src={creator?.profilePhoto || '/merium.png'}
            alt={creator?.displayName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Verified badge aligned right */}
        <div className="flex justify-end pt-3 pb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#0012FF] font-bold bg-[#EEF2FF] px-3 py-1.5 rounded-full shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Verified Creator
          </div>
        </div>

        {/* Name + Handle */}
        <div className="mt-3">
          <h3 className="font-extrabold text-[22px] text-gray-900 leading-tight">
            {creator?.displayName || 'Creator Name'}
          </h3>
          <p className="text-[13px] text-gray-400 mt-0.5 font-medium">
            @{creator?.username || 'username'}
          </p>
        </div>

        {/* Location & Languages pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5">
          {(creator?.city || creator?.country) && (
            <span className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF] shrink-0">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {[creator?.city, creator?.country].filter(Boolean).join(', ')}
            </span>
          )}
          {creator?.languages && creator.languages.length > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF] shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {creator.languages.join(', ')}
            </span>
          )}
        </div>

        {/* Stats Row */}
        {creator?.stats && (
          <div className="grid grid-cols-3 gap-3 w-full bg-gray-50/50 rounded-2xl border border-gray-100 p-4 mt-5 text-center shadow-inner">
            <div className="flex flex-col items-center justify-center">
              <span className="block font-black text-[20px] text-gray-900 tracking-tight">
                {formatNumber(creator.stats.sessionsCompleted)}
              </span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">Sessions</span>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-r border-gray-200/60">
              <span className="block font-black text-[20px] text-gray-900 tracking-tight">
                {formatNumber(creator.stats.happyCustomers)}
              </span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">Customers</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="block font-black text-[20px] text-gray-900 tracking-tight">
                {creator.stats.totalCategories || 0}
              </span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">Categories</span>
            </div>
          </div>
        )}

        {/* Bio */}
        {creator?.shortBio && (
          <p className="text-[12.5px] text-gray-500 mt-5 leading-relaxed line-clamp-4">
            {creator.shortBio}
          </p>
        )}

        {/* Niche tags */}
        {creator?.niches && creator.niches.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {creator.niches.map((tag) => (
              <span key={tag} className="bg-[#EEF2FF] text-[#0012FF] text-[10px] font-bold px-3 py-1 rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 my-6" />

        {/* Social Links */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Follow Me</span>
          <div className="flex items-center gap-2">
            <a
              href={creator?.socialLinks?.facebook || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center text-[#0012FF] hover:bg-[#0012FF] hover:border-[#0012FF] hover:text-white hover:shadow-md hover:shadow-indigo-200 transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a
              href={creator?.socialLinks?.instagram || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center text-[#0012FF] hover:bg-[#0012FF] hover:border-[#0012FF] hover:text-white hover:shadow-md hover:shadow-indigo-200 transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href={creator?.socialLinks?.youtube || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center text-[#0012FF] hover:bg-[#0012FF] hover:border-[#0012FF] hover:text-white hover:shadow-md hover:shadow-indigo-200 transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
              </svg>
            </a>
            <a
              href={creator?.socialLinks?.tiktok || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center text-[#0012FF] hover:bg-[#0012FF] hover:border-[#0012FF] hover:text-white hover:shadow-md hover:shadow-indigo-200 transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.15 1.25 1.32 2.98 2.04 4.79 2.07v3.83a8.88 8.88 0 0 1-5.18-1.74c-.05 2.82.01 5.63-.04 8.44-.09 2.53-1.12 5.04-3.13 6.64-2.28 1.83-5.46 2.37-8.19 1.4A8.72 8.72 0 0 1 .47 16.92c-.67-2.61-.17-5.5 1.4-7.65 1.76-2.4 4.73-3.66 7.68-3.15V9.92a4.91 4.91 0 0 0-4.63 4.22c-.37 2.45.92 4.98 3.2 5.68 2.22.68 4.77-.37 5.48-2.52.26-.81.23-1.67.24-2.52l.02-14.76z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
