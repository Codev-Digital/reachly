'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import { useBooking, SessionType } from '../layout';

export default function BookSessionStep1() {
  const params = useParams();
  const router = useRouter();
  const { booking, setBooking, nextStep } = useBooking();
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [isLoadingBack, setIsLoadingBack] = useState(false);

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
              coverPhoto: data.creator.coverPhoto,
              shortBio: data.creator.shortBio,
              niches: data.creator.niches || [],
              city: data.creator.city,
              country: data.creator.country,
              languages: data.creator.languages || [],
              socialLinks: data.creator.socialLinks || {},
              stats: data.creator.stats,
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
      setIsLoadingContinue(true);
      nextStep();
      router.push(`/creators/${params.username}/book-session/step-2`);
    }
  };

  const handleBack = () => {
    setIsLoadingBack(true);
    router.push(`/creators/${params.username}`);
  };


  const creator = booking.creator;

  // Svg cards templates rotated
  const cardColors = ['#B7C0FF', '#FFEDB5', '#FFB3B3'];
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
        <CreatorProfileCard creator={creator} />

        {/* ============ RIGHT COLUMN: SESSIONS LIST ============ */}
        <div className="flex flex-col w-full ">
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
                  const cardColor = cardColors[themeIdx];
                  const theme = cardThemes[themeIdx];
                  const isSelected = booking.selectedSession?.id === session.id;

                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className={`relative w-full max-w-[246px] h-[340px] bg-transparent overflow-visible isolate select-none cursor-pointer transition-all duration-200 hover:-translate-y-1 ${isSelected ? 'scale-105 filter drop-shadow-md' : ''
                        }`}
                    >
                      {/* Card Background SVG containing the exact notch outline stroke */}
                      <svg width="246" height="340" viewBox="0 0 246 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        <path
                          d="M1 332C1 336.418 4.58172 340 9 340H237C241.418 340 245 336.418 245 332V35.1559C245 30.7376 241.418 27.1559 237 27.1559H201C196.582 27.1559 193 23.5742 193 19.1559V9C193 4.58173 189.418 1 185 1H9C4.58172 1 1 4.58173 1 9L1 332Z"
                          fill={cardColor}
                          stroke={isSelected ? '#0012FF' : 'transparent'}
                          strokeWidth={isSelected ? '2.2' : '0'}
                        />
                      </svg>

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

                            <span className={`absolute top-[4px] right-[1px] text-[10px] font-bold flex items-center gap-0.5 ${theme.text}`}>
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
              <div className="flex flex-wrap gap-2 mt-12 justify-end w-full max-w-[790px] mx-auto px-4">
                <button
                  onClick={handleBack}
                  disabled={isLoadingBack}
                  className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-4 sm:px-6 rounded-full text-xs hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
                >
                  {isLoadingBack ? (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin"></div>
                  ) : (
                    "Back"
                  )}
                </button>

                <button
                  onClick={handleContinue}
                  disabled={!booking.selectedSession || isLoadingContinue}
                  className={`py-2.5 px-5 sm:px-8 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center ${booking.selectedSession
                    ? 'bg-[#0012FF] text-white hover:bg-[#0010d0]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {isLoadingContinue ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#808BFF] border-t-white animate-spin"></div>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
