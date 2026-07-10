'use client';

import { useState } from 'react';
import { CreatorInfo } from '@/app/creators/[username]/book-session/layout';

export default function CreatorProfileCard({ creator }: { creator: CreatorInfo | null }) {
  const [saved, setSaved] = useState(true);

  return (
    <>
      {/* ── MOBILE: compact horizontal strip ─────────────────────────────── */}
      <div className="lg:hidden w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm mb-2">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow flex-shrink-0 bg-gray-100">
          <img
            src={creator?.profilePhoto || '/merium.png'}
            alt={creator?.displayName}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Name + handle */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-900 leading-tight truncate">
            {creator?.displayName || 'Sophia Reed'}
          </h3>
          <p className="text-xs text-gray-400 truncate">@{creator?.username || 'sophiareed'}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {(creator?.niches?.slice(0, 2) || ['Fashion', 'Lifestyle']).map(tag => (
              <span key={tag} className="bg-red-50 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        </div>
        {/* Save button */}
        <button
          onClick={() => setSaved(!saved)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 flex-shrink-0"
        >
          <svg width="14" height="16" viewBox="0 0 24 28" fill={saved ? '#0012FF' : 'none'} stroke="#0012FF" strokeWidth="2">
            <path d="M19 25L12 19L5 25V4C5 2.9 5.9 2 7 2H17C18.1 2 19 2.9 19 4V25Z" />
          </svg>
        </button>
      </div>

      {/* ── DESKTOP: full profile card ────────────────────────────────────── */}
      <div className="hidden lg:block relative w-full max-w-[370px] h-[619px] bg-transparent overflow-visible isolate select-none flex-shrink-0">
        {/* Background SVG template */}
        <img
          src="/assets/creator-data.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
        />

        {/* Content */}
        <div className="relative z-10 p-6 pt-7 pb-6 flex flex-col h-full justify-between">
          <div>
            {/* Cover banner */}
            <div className="w-full h-24 relative overflow-visible mb-12">
              <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                  <clipPath id="cover-clip-desktop" clipPathUnits="objectBoundingBox">
                    <path d="M0 .94 C0 .975 .025 1 .06 1 H.82 C.88 1 .90 .97 .90 .93 V.76 C.90 .68 .94 .64 .98 .62 C.995 .61 1 .59 1 .56 V.06 C1 .025 .975 0 .94 0 H.06 C.025 0 0 .025 0 .06 Z" />
                  </clipPath>
                </defs>
              </svg>
              {creator?.coverPhoto ? (
                <img src={creator.coverPhoto} alt="cover" className="absolute inset-0 w-full h-full object-cover" style={{ clipPath: 'url(#cover-clip-desktop)' }} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-900" style={{ clipPath: 'url(#cover-clip-desktop)' }} />
              )}
              <span className="absolute right-3 top-3 bg-white text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm z-10">
                {creator?.niches?.[0] || 'Influencer'}
              </span>
              <button onClick={() => setSaved(!saved)} className="absolute bottom-0 right-0 w-8 h-10 flex items-center justify-center z-10 cursor-pointer">
                <svg width="16" height="20" viewBox="0 0 24 28" fill={saved ? '#0012FF' : 'gray'}>
                  <path d="M19 25L12 19L5 25V4C5 2.9 5.9 2 7 2H17C18.1 2 19 2.9 19 4V25Z" />
                </svg>
              </button>
            </div>

            {/* Avatar */}
            <div className="absolute top-14 left-[24px] w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
              <img src={creator?.profilePhoto || '/merium.png'} alt={creator?.displayName} className="w-full h-full object-cover" />
            </div>

            {/* Name & Handle */}
            <div className="pl-[116px] min-h-[72px] flex flex-col justify-center">
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{creator?.displayName || 'Sophia Reed'}</h3>
              <p className="text-xs text-gray-400 mt-0.5">@{creator?.username || 'sophiareed'}</p>
            </div>

            {/* Location & Languages */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium pl-2">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF]">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" /><circle cx="12" cy="10" r="3" />
                </svg>
                Lahore
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF]">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Urdu, English
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 w-full border-t border-b border-gray-100 py-3 mt-4 text-center">
              <div>
                <span className="block font-anton font-black text-[24px] leading-[24px] text-gray-900">12k+</span>
                <span className="text-[9px] text-gray-400 font-semibold block leading-tight">Sessions completed</span>
              </div>
              <div className="border-l border-r border-gray-100">
                <span className="block font-anton font-black text-[24px] leading-[24px] text-gray-900">50k+</span>
                <span className="text-[9px] text-gray-400 font-semibold block leading-tight">Happy Users</span>
              </div>
              <div>
                <span className="block font-anton font-black text-[24px] leading-[24px] text-gray-900">8</span>
                <span className="text-[9px] text-gray-400 font-semibold block leading-tight">Total Categories</span>
              </div>
            </div>

            <button className="bg-[#0012FF] hover:bg-[#0010d0] text-white w-full py-2.5 rounded-xl font-bold text-xs transition-colors mt-4 shadow-sm">
              Book a Session
            </button>

            <div className="w-full text-left mt-4">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wide">About</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-3">
                {creator?.shortBio || "Ayesha Khan is one of Pakistan's leading fashion and lifestyle content creators. With over 500K followers across Instagram and TikTok..."}
              </p>
              <button className="text-[#0012FF] text-[10px] font-bold mt-0.5 hover:underline">Read more</button>
            </div>

            <div className="flex flex-wrap gap-1.5 w-full mt-3">
              {(creator?.niches && creator.niches.length > 0 ? creator.niches : ['Fashion Tips', 'Style Guide', 'Shopping']).map(tag => (
                <span key={tag} className="bg-red-50 text-red-500 text-[9px] font-bold px-2 py-0.5 rounded-md">{tag}</span>
              ))}
            </div>
          </div>

          {/* Social Icons */}
          <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 translate-y-4 flex items-center justify-center gap-2.5 w-[130px] h-[24px] z-20">
            <a href="#" className="w-5 h-5 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
            </a>
            <a href="#" className="w-5 h-5 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="#" className="w-5 h-5 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
              </svg>
            </a>
            <a href="#" className="w-5 h-5 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.15 1.25 1.32 2.98 2.04 4.79 2.07v3.83a8.88 8.88 0 0 1-5.18-1.74c-.05 2.82.01 5.63-.04 8.44-.09 2.53-1.12 5.04-3.13 6.64-2.28 1.83-5.46 2.37-8.19 1.4A8.72 8.72 0 0 1 .47 16.92c-.67-2.61-.17-5.5 1.4-7.65 1.76-2.4 4.73-3.66 7.68-3.15V9.92a4.91 4.91 0 0 0-4.63 4.22c-.37 2.45.92 4.98 3.2 5.68 2.22.68 4.77-.37 5.48-2.52.26-.81.23-1.67.24-2.52l.02-14.76z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
