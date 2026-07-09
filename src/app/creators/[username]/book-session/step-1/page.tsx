'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import BookingProgress from '@/components/booking/BookingProgress';
import { useBooking, SessionType } from '../layout';

export default function BookSessionStep1() {
  const params = useParams();
  const router = useRouter();
  const { booking, setBooking, nextStep } = useBooking();

  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreator() {
      try {
        const res = await fetch(`/api/creators/${params.username}`);
        const data = await res.json();
        if (data.success) {
          setSessions(data.sessions || []);
          setBooking(b => ({
            ...b,
            creator: {
              id: data.creator.id,
              name: data.creator.name,
              username: data.creator.username,
              displayName: data.creator.displayName,
              profilePhoto: data.creator.profilePhoto,
              shortBio: data.creator.shortBio,
              niches: data.creator.niches || [],
            },
            selectedSession: b.selectedSession
              ? (data.sessions.find((s: SessionType) => s.id === b.selectedSession?.id) || null)
              : null,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch creator sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCreator();
  }, [params.username, setBooking]);

  const handleSelectSession = (session: SessionType) => {
    setBooking(b => ({ ...b, selectedSession: session }));
  };

  const handleContinue = () => {
    if (booking.selectedSession) {
      nextStep();
      router.push(`/creators/${params.username}/book-session/step-2`);
    }
  };

  const creator = booking.creator;

  // Svg cards templates rotated
  const cardBgs = ['/assets/booking-card1.svg', '/assets/booking-card2.svg', '/assets/booking-card3.svg'];
  const cardThemes = [
    { text: 'text-[#0012FF]', stroke: 'stroke-[#0012FF]', bg: 'bg-[#EEF2FF]' }, // Card 1: Blue
    { text: 'text-[#D97706]', stroke: 'stroke-[#D97706]', bg: 'bg-[#FFFBEB]' }, // Card 2: Yellow/Gold
    { text: 'text-[#DC2626]', stroke: 'stroke-[#DC2626]', bg: 'bg-[#FFF5F5]' }, // Card 3: Pink/Red
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-2">
      {/* Step Progress Indicator */}
      <BookingProgress currentStep={1} />

      <div className="grid grid-cols-1 lg:grid-cols-[370px_1fr] gap-8 items-start justify-items-center">
        {/* ============ LEFT COLUMN: CREATOR PROFILE CARD ============ */}
        <div className="relative w-full max-w-[370px] h-[619px] bg-transparent overflow-visible isolate select-none">
          {/* Background SVG template */}
          <img
            src="/assets/creator-data.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
          />

          {/* Content */}
          <div className="relative z-10 p-6 pt-7 pb-6 flex flex-col h-full justify-between">
            <div>
              {/* Header Banner */}
              <div className="w-full h-24 bg-gradient-to-r from-blue-700 to-indigo-900 rounded-2xl relative overflow-hidden mb-12">
                <span className="absolute right-3 top-3 bg-white text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                  Influencer
                </span>
              </div>

              {/* Avatar Picture */}
              <div className="absolute top-14 left-[24px] w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                <img
                  src={creator?.profilePhoto || '/merium.png'}
                  alt={creator?.displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name & Handle */}
              <div className="pl-[116px] min-h-[72px] flex flex-col justify-center">
                <h3 className="font-bold text-lg text-gray-900 leading-tight">
                  {creator?.displayName || 'Sophia Reed'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  @{creator?.username || 'sophiareed'}
                </p>
              </div>

              {/* Location & Languages */}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium pl-2">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF]">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Lahore
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#0012FF]">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Urdu, English
                </span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 w-full border-t border-b border-gray-100 py-3 mt-4 text-center">
                <div>
                  <span className="block font-bold text-gray-900 text-sm">12k+</span>
                  <span className="text-[9px] text-gray-400 font-semibold block leading-tight">Sessions completed</span>
                </div>
                <div className="border-l border-r border-gray-100">
                  <span className="block font-bold text-gray-900 text-sm">50k+</span>
                  <span className="text-[9px] text-gray-400 font-semibold block leading-tight">Happy Users</span>
                </div>
                <div>
                  <span className="block font-bold text-gray-900 text-sm">8</span>
                  <span className="text-[9px] text-gray-400 font-semibold block leading-tight">Total Categories</span>
                </div>
              </div>

              {/* Book a Session button */}
              <button className="bg-[#0012FF] hover:bg-[#0010d0] text-white w-full py-2.5 rounded-xl font-bold text-xs transition-colors mt-4 shadow-sm">
                Book a Session
              </button>

              {/* About section */}
              <div className="w-full text-left mt-4">
                <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wide">About</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed line-clamp-3">
                  {creator?.shortBio || "Ayesha Khan is one of Pakistan's leading fashion and lifestyle content creators. With over 500K followers across Instagram and TikTok..."}
                </p>
                <button className="text-[#0012FF] text-[10px] font-bold mt-0.5 hover:underline">
                  Read more
                </button>
              </div>

              {/* Category Tags */}
              <div className="flex flex-wrap gap-1.5 w-full mt-3">
                {(creator?.niches && creator.niches.length > 0 ? creator.niches : ['Fashion Tips', 'Style Guide', 'Shopping']).map(tag => (
                  <span key={tag} className="bg-red-50 text-red-500 text-[9px] font-bold px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Icons inside bottom notch */}
            <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 w-[124px] h-[24px] z-20">
              {['facebook', 'instagram', 'youtube', 'tiktok'].map(platform => (
                <button key={platform} className="w-5 h-5 rounded-full bg-[#0012FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                  <span className="text-[9px] uppercase font-bold">{platform.charAt(0)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============ RIGHT COLUMN: SESSIONS LIST ============ */}
        <div className="flex flex-col w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-full max-w-[246px] h-[340px] bg-gray-200 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm w-full">
              <p className="text-gray-500 italic font-medium">No sessions found for this creator.</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
                {sessions.map((session, index) => {
                  const themeIdx = index % 3;
                  const bg = cardBgs[themeIdx];
                  const theme = cardThemes[themeIdx];
                  const isSelected = booking.selectedSession?.id === session.id;

                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className={`relative w-full max-w-[246px] h-[340px] bg-transparent overflow-visible isolate select-none cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
                        isSelected ? 'scale-105 filter drop-shadow-lg' : 'hover:drop-shadow-sm'
                      }`}
                    >
                      {/* Card Background SVG */}
                      <img
                        src={bg}
                        alt=""
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0"
                      />

                      {/* Card Selected Border Highlight */}
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-[#0012FF] rounded-3xl pointer-events-none z-30" style={{ margin: '-1px' }} />
                      )}

                      {/* Card Content */}
                      <div className="relative z-10 p-5 pt-6 pb-6 flex flex-col h-full justify-between">
                        <div>
                          {/* Top row: Icon + Duration in Notch */}
                          <div className="flex items-start justify-between">
                            {/* Left Icon Container */}
                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={theme.text}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                              </svg>
                            </div>

                            {/* Duration label in notch */}
                            <span className={`absolute top-[4px] right-[6px] text-[10px] font-bold flex items-center gap-0.5 ${theme.text}`}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={theme.stroke}>
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {session.duration}
                            </span>
                          </div>

                          {/* Session Title */}
                          <h4 className="text-base font-bold text-gray-900 mt-4 font-sans line-clamp-1 leading-tight">
                            {session.title}
                          </h4>

                          {/* Session Description */}
                          <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed line-clamp-3">
                            {session.description}
                          </p>

                          {/* Divider */}
                          <div className="border-t border-black/5 my-3" />

                          {/* Features Checklist */}
                          <ul className="space-y-1.5">
                            {session.features.slice(0, 4).map((feature: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-1.5 text-[10px] text-gray-600 font-semibold leading-none">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className={theme.stroke}>
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Price in Anton font at bottom */}
                        <div className={`text-2xl font-bold font-anton uppercase tracking-tight mt-auto text-left leading-none ${theme.text}`}>
                          {session.price.toLocaleString()} PKR
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex gap-4 mt-12 justify-end w-full max-w-[790px] mx-auto px-4">
                <button
                  onClick={() => router.push(`/creators/${params.username}`)}
                  className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-full text-xs hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Back
                </button>

                <button
                  onClick={handleContinue}
                  disabled={!booking.selectedSession}
                  className={`py-2.5 px-8 rounded-full text-xs font-bold transition-all shadow-sm ${
                    booking.selectedSession
                      ? 'bg-[#0012FF] text-white hover:bg-[#0010d0]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
