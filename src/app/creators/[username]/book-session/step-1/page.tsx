'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
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
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileBookingStarted, setIsMobileBookingStarted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const SWIPE_THRESHOLD = 30;
    if (info.offset.y < -SWIPE_THRESHOLD) {
      setMobileActiveIndex((prev) => (prev + 1) % sessions.length);
    } else if (info.offset.y > SWIPE_THRESHOLD) {
      setMobileActiveIndex((prev) => (prev - 1 + sessions.length) % sessions.length);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -270, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    setHasScrolled(true);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 270, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      if (scrollContainerRef.current.scrollLeft > 10) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    }
  };

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
    { text: 'text-[#0012FF]', stroke: 'stroke-[#0012FF]', bg: 'bg-[#BAC5FF]', title: 'text-white', desc: 'text-white/90', feature: 'text-white/95', divider: 'bg-white/35' }, // Card 1: Blue
    { text: 'text-[#B86B00]', stroke: 'stroke-[#B86B00]', bg: 'bg-[#FFEDB5]', title: 'text-[#4A3B18]', desc: 'text-[#5C4D26]', feature: 'text-[#4A3B18]', divider: 'bg-[#4A3B18]/20' }, // Card 2: Yellow (Clear dark grayish text)
    { text: 'text-[#E32A2A]', stroke: 'stroke-[#E32A2A]', bg: 'bg-[#FFB3B3]', title: 'text-white', desc: 'text-white/90', feature: 'text-white/95', divider: 'bg-white/35' }, // Card 3: Pink
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-2">
      {/* Step Progress Indicator */}
      <BookingProgress currentStep={1} />

      <div className="grid grid-cols-1 lg:grid-cols-[410px_1fr] gap-8 items-start justify-items-center">
        <CreatorProfileCard 
          creator={creator} 
          mobileMode={isMobileBookingStarted ? 'compact' : 'full'}
          onMobileBookClick={() => setIsMobileBookingStarted(true)}
        />

        {/* ============ RIGHT COLUMN: SESSIONS LIST ============ */}
        <div className={`flex-col w-full ${!isMobileBookingStarted ? 'hidden lg:flex' : 'flex'}`}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-full max-w-[285px] h-[390px] bg-gray-200 animate-pulse rounded-[14px]" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm w-full">
              <p className="text-gray-500 italic font-medium">No sessions found for this creator.</p>
            </div>
          ) : (
            <div className="flex flex-col w-full max-w-[790px]">
              {sessions.length > 3 && (
                <div className="hidden lg:flex justify-end gap-3 mb-2 px-2">
                  <button
                    onClick={scrollLeft}
                    className="w-9 h-9 rounded-full border-[1.5px] border-[#0012FF] text-[#0012FF] flex items-center justify-center hover:bg-[#EEF2FF] transition-all active:scale-95 cursor-pointer"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <button
                    onClick={scrollRight}
                    className="w-9 h-9 rounded-full bg-[#0012FF] text-white flex items-center justify-center hover:bg-[#0010d0] transition-all active:scale-95 shadow-md cursor-pointer"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              )}

              <div className="relative w-full">
                <style jsx>{`
                  .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                  .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>

                <div className="w-full flex justify-center lg:block">

                  {/* MOBILE STACKED SWIPER */}
                  <div className="lg:hidden relative w-full h-[460px] flex justify-center items-start mt-2">
                    <AnimatePresence mode="popLayout">
                      {sessions.map((session, index) => {
                        const themeIdx = index % 3;
                        const theme = cardThemes[themeIdx];
                        const isSelected = booking.selectedSession?.id === session.id;

                        let relativeIndex = (index - mobileActiveIndex) % sessions.length;
                        if (relativeIndex < 0) {
                          relativeIndex += sessions.length;
                        }
                        if (relativeIndex > 2) return null;

                        const xOffset = relativeIndex * -18;
                        const yOffset = relativeIndex * 5;
                        const scale = 1 - (relativeIndex * 0.04);
                        const rotateZ = relativeIndex * -5;
                        const zIndex = sessions.length - relativeIndex;

                        return (
                          <motion.div
                            key={session.id}
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            onDragEnd={handleDragEnd}
                            initial={{ opacity: 0, y: 50, x: 0, scale: 0.9 }}
                            animate={{ opacity: 1, y: yOffset, x: xOffset, scale: scale, rotate: rotateZ }}
                            exit={{ opacity: 0, y: -200, scale: 0.8 }}
                            transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                            className="absolute top-0 w-full max-w-[280px] cursor-grab active:cursor-grabbing"
                            style={{ zIndex }}
                          >
                            <div
                              onClick={() => handleSelectSession(session)}
                              className={`w-full h-[400px] ${theme.bg} rounded-[28px] p-6 flex flex-col justify-between select-none shadow-xl ${isSelected ? 'border-4 border-[#0012FF]' : 'border-4 border-transparent'}`}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-5">
                                  <div className="w-9 h-9 rounded-xl bg-white/90 shadow-2xs flex items-center justify-center shrink-0">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={theme.text}>
                                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                  </div>
                                  <span className={`text-xs font-bold font-sans flex items-center gap-1.5 ${theme.text}`}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={theme.stroke}>
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 16 14" />
                                    </svg>
                                    {session.duration}
                                  </span>
                                </div>
                                <h4 className={`text-lg font-bold font-sans leading-tight mb-2 line-clamp-1 ${theme.title}`}>{session.title}</h4>
                                <p className={`text-xs font-medium font-sans leading-relaxed line-clamp-3 ${theme.desc}`}>{session.description}</p>
                                <div className={`w-full h-px my-4 ${theme.divider}`} />
                                <ul className="space-y-2">
                                  {session.features.slice(0, 4).map((feature: string, idx: number) => (
                                    <li key={idx} className={`flex items-center gap-2 text-xs font-semibold font-sans leading-tight ${theme.feature}`}>
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${theme.text} shrink-0`}>
                                        <circle cx="12" cy="12" r="9" />
                                        <path d="M8 12l3 3 5-5" />
                                      </svg>
                                      <span className="truncate">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className={`text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight mt-6 leading-none ${theme.text}`}>
                                {session.price.toLocaleString()} PKR
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* DESKTOP CAROUSEL */}
                  <div ref={scrollContainerRef} onScroll={handleScroll} className="hidden lg:flex flex-row overflow-x-auto snap-x snap-mandatory hide-scrollbar lg:h-auto w-full lg:max-w-none lg:mx-0 lg:pt-4 lg:pb-6 lg:gap-[20px]">
                  {sessions.map((session, index) => {
                    const themeIdx = index % 3;
                    const theme = cardThemes[themeIdx];
                    const isSelected = booking.selectedSession?.id === session.id;

                    return (
                      <div
                        key={session.id}
                        className="w-[250px] shrink-0 snap-center h-[460px] lg:h-auto flex lg:block items-center justify-center p-0"
                      >
                        <div
                          onClick={() => handleSelectSession(session)}
                          className={`w-[250px] min-h-[400px] h-[400px] ${theme.bg} rounded-[13px] p-6 flex flex-col justify-between select-none cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 ${isSelected ? 'border-4 border-[#0012FF] scale-[1.03] shadow-lg' : 'border-4 border-transparent'
                            } ${!hasScrolled && index >= 3 ? 'opacity-0 lg:pointer-events-none' : 'opacity-100'}`}
                        >
                        <div>
                          {/* Top row: Briefcase Icon + Duration */}
                          <div className="flex items-center justify-between mb-5">
                            {/* Icon Badge */}
                            <div className="w-9 h-9 rounded-xl bg-white/90 shadow-2xs flex items-center justify-center shrink-0">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={theme.text}>
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                              </svg>
                            </div>

                            {/* Duration */}
                            <span className={`text-xs font-bold font-sans flex items-center gap-1.5 ${theme.text}`}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={theme.stroke}>
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 16 14" />
                              </svg>
                              {session.duration}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className={`text-lg font-bold font-sans leading-tight mb-2 line-clamp-1 ${theme.title}`}>
                            {session.title}
                          </h4>

                          {/* Description */}
                          <p className={`text-xs font-medium font-sans leading-relaxed line-clamp-3 ${theme.desc}`}>
                            {session.description}
                          </p>

                          {/* Divider */}
                          <div className={`w-full h-px my-4 ${theme.divider}`} />

                          {/* Features List */}
                          <ul className="space-y-2">
                            {session.features.slice(0, 4).map((feature: string, idx: number) => (
                              <li key={idx} className={`flex items-center gap-2 text-xs font-semibold font-sans leading-tight ${theme.feature}`}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${theme.text} shrink-0`}>
                                  <circle cx="12" cy="12" r="9" />
                                  <path d="M8 12l3 3 5-5" />
                                </svg>
                                <span className="truncate">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Price */}
                        <div className={`text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight mt-6 leading-none ${theme.text}`}>
                          {session.price.toLocaleString()} PKR
                        </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>

                {/* Navigation Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-6 mb-12 justify-end w-full max-w-[790px] mx-auto px-4 relative z-[100]">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
