'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { ArrowLeft, BriefcaseBusiness } from 'lucide-react';
import { Star } from 'lucide-react';
import BookingProgress from '@/components/booking/BookingProgress';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import AvailabilityDateTimePicker from '@/components/booking/AvailabilityDateTimePicker';
import EventCard, { type EventCardData } from '@/components/EventCard';
import { useBooking, SessionType, sessionPrice } from '../layout';
import { richTextToPlain, richTextPreview } from '@/lib/richText';
import { formatEventCardDate, formatEventCardTime } from '@/lib/eventDisplay';

const COMMA_SVGS = ['/assets/comma-1.svg', '/assets/comma-2.svg', '/assets/comma3.svg'];

type PublicReview = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  dateLabel: string;
  commaIdx: number;
};

type CreatorEventRaw = {
  id: string;
  title: string;
  description: string;
  bannerUrl?: string;
  category?: string;
  dates?: any[];
};

export default function BookSessionStep1() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fallbackUrl = searchParams.get('fallbackUrl');
  const returnTo = searchParams.get('returnTo');
  const eventReturnUrl = returnTo && /^\/(?:user\/)?events\/[^/?#]+$/.test(returnTo)
    ? returnTo
    : null;
  const wantedSessionId = searchParams.get('session');
  const query = new URLSearchParams();
  if (fallbackUrl) query.set('fallbackUrl', fallbackUrl);
  if (returnTo) query.set('returnTo', returnTo);
  const queryString = query.toString();
  const queryStr = queryString ? `?${queryString}` : '';
  const { booking, setBooking } = useBooking();
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [creatorEvents, setCreatorEvents] = useState<CreatorEventRaw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [isLoadingBack, setIsLoadingBack] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileBookingStarted, setIsMobileBookingStarted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);



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
    // Prefetch the next booking step and warm up availability in the background.
    if (params.username) {
      router.prefetch(`/creators/${params.username}/book-session/step-3${queryStr}`);
      fetch(`/api/creators/${params.username}/availability`).catch(() => {});
    }
  }, [params.username, queryStr, router]);

  useEffect(() => {
    const username = String(params.username || '');
    if (!username) return;

    let cancelled = false;
    setLoading(true);
    setReviews([]);
    setCreatorEvents([]);

    // Drop previous creator immediately so cover/avatar never flash the wrong person
    setBooking((b) => {
      const same =
        b.creator?.username &&
        String(b.creator.username).toLowerCase() === username.toLowerCase();
      if (b.bookingRef) {
        return { ...b, selectedSession: null, selectedDate: null, selectedTime: null, answers: [], bookingRef: undefined, paymentMethod: undefined };
      }
      if (same) return b;
      return { ...b, creator: null, selectedSession: null, selectedDate: null, selectedTime: null, answers: [] };
    });

    // Hydrate from this username's cache only (never another creator's)
    try {
      const cachedCreator = sessionStorage.getItem(`reachly_creator_${username}`);
      const cachedSessions = sessionStorage.getItem(`reachly_sessions_${username}`);
      if (cachedCreator) {
        const creator = JSON.parse(cachedCreator);
        if (creator?.username) {
          setBooking((b) => ({ ...b, creator }));
        }
      }
      if (cachedSessions) {
        const parsed = JSON.parse(cachedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
        } else {
          setSessions([]);
        }
      } else {
        setSessions([]);
      }
    } catch {
      setSessions([]);
    }

    async function fetchCreator() {
      try {
        const res = await fetch(`/api/creators/${username}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setSessions(data.sessions || []);
          try {
            sessionStorage.setItem(`reachly_sessions_${username}`, JSON.stringify(data.sessions || []));
            sessionStorage.setItem(`reachly_creator_${username}`, JSON.stringify(data.creator));
          } catch {}
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
          setCreatorEvents(Array.isArray(data.events) ? data.events : []);
          setBooking((b) => ({
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
              rating: data.creator.rating,
              ratingLabel: data.creator.ratingLabel,
              reviewCount: data.creator.reviewCount,
              ratingDisplay: data.creator.ratingDisplay,
              stats: data.creator.stats,
            },
            selectedSession: (() => {
              const wanted = wantedSessionId || b.selectedSession?.id;
              return wanted
                ? data.sessions.find((s: SessionType) => s.id === wanted) || null
                : null;
            })(),
          }));

        }
      } catch (err) {
        console.error('Failed to fetch creator sessions:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCreator();
    return () => {
      cancelled = true;
    };
  }, [params.username, setBooking, wantedSessionId, router]);

  const handleSelectSession = (session: SessionType) => {
    setBooking((b) => ({
      ...b,
      selectedSession: session,
      selectedTime: null,
      // Reset answers when switching sessions
      answers: [],
    }));
  };

  const handleContinue = () => {
    if (booking.selectedSession && booking.selectedDate && booking.selectedTime) {
      setIsLoadingContinue(true);
      setBooking((b) => ({ ...b, step: 2 }));
      router.push(`/creators/${params.username}/book-session/step-3${queryStr}`);
    }
  };

  const handleBack = () => {
    setIsLoadingBack(true);
    if (eventReturnUrl) {
      router.push(eventReturnUrl);
    } else if (fallbackUrl) {
      window.location.href = fallbackUrl;
    } else {
      router.push('/user/dashboard');
    }
  };


  const routeUsername = String(params.username || '').toLowerCase();
  // Only pass creator into the card when it matches this route (avoids stale photos)
  const creator =
    booking.creator &&
    String(booking.creator.username || '').toLowerCase() === routeUsername
      ? booking.creator
      : null;

  const upcomingEventCards: EventCardData[] = useMemo(() => {
    return creatorEvents.map((e) => {
      const first = e.dates?.[0];
      return {
        id: e.id,
        title: e.title,
        description: richTextPreview(e.description, 140) || 'No description yet.',
        date: formatEventCardDate(first?.date),
        time: formatEventCardTime(first),
        location: e.category || 'Event',
        image: e.bannerUrl || undefined,
        visible: true,
      };
    });
  }, [creatorEvents]);

  // Svg cards templates rotated
  const cardColors = ['#B7C0FF', '#FFEDB5', '#FFB3B3'];
  const cardThemes = [
    { text: 'text-[#0012FF]', stroke: 'stroke-[#0012FF]', bg: 'bg-[#B7C0FF]', title: 'text-white', desc: 'text-white/90', feature: 'text-white/95', divider: 'bg-white/35' }, // Card 1: Blue
    { text: 'text-[#B86B00]', stroke: 'stroke-[#B86B00]', bg: 'bg-[#FFEDB5]', title: 'text-[#4A3B18]', desc: 'text-[#5C4D26]', feature: 'text-[#4A3B18]', divider: 'bg-[#4A3B18]/20' }, // Card 2: Yellow (Clear dark grayish text)
    { text: 'text-[#E32A2A]', stroke: 'stroke-[#E32A2A]', bg: 'bg-[#FFB3B3]', title: 'text-white', desc: 'text-white/90', feature: 'text-white/95', divider: 'bg-white/35' }, // Card 3: Pink
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-2">
      {eventReturnUrl && (
        <button
          type="button"
          onClick={() => router.push(eventReturnUrl)}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-[#0012FF]"
        >
          <ArrowLeft size={16} />
          Back to Event
        </button>
      )}
      {/* Step Progress Indicator */}
      <BookingProgress currentStep={1} />

      <div className="grid grid-cols-1 lg:grid-cols-[410px_1fr] gap-0 items-start justify-items-center">
        <CreatorProfileCard
          key={routeUsername || 'loading'}
          creator={creator}
          mobileMode={isMobileBookingStarted ? 'compact' : 'full'}
          onMobileBookClick={() => setIsMobileBookingStarted(true)}
        />

        {/* ============ RIGHT COLUMN: SESSIONS LIST ============ */}
        <div className={`flex-col w-full ${!isMobileBookingStarted ? 'hidden lg:flex' : 'flex'}`}>
          {loading || !creator ? (
            <div className="w-full max-w-[870px] space-y-6">
              <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg" />
              <div className="flex flex-row overflow-hidden w-full h-[460px] lg:h-auto lg:w-[810px] px-[calc(50%-140px)] lg:px-[10px] lg:pt-4 lg:pb-6 gap-4 lg:gap-5 py-4 items-center lg:items-stretch">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[400px] w-[260px] shrink-0 animate-pulse rounded-[10px] bg-gray-200"
                  />
                ))}
              </div>
              <div className="mt-8 space-y-4">
                <div className="h-6 w-40 bg-gray-200 animate-pulse rounded-lg" />
                <div className="h-16 w-full animate-pulse rounded-[20px] bg-gray-200" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-11 animate-pulse rounded-[20px] bg-gray-200" />
                  ))}
                </div>
              </div>
              <div className="h-6 w-40 bg-gray-200 animate-pulse rounded-lg mt-8" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[270px] animate-pulse rounded-[8px] bg-gray-200" />
                ))}
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm w-full">
              <p className="text-gray-500 italic font-medium">No sessions found for this creator.</p>
            </div>
          ) : (
            <div className="flex flex-col w-full max-w-[870px]">
              {/* {sessions.length > 3 && (
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
              )} */}

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

                <div className="w-full flex justify-center lg:block -mt-[13px]">

                  {/* SESSIONS CAROUSEL (Mobile & Desktop) */}
                  <div ref={scrollContainerRef} onScroll={handleScroll} className="flex flex-row overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-[460px] lg:h-auto lg:w-[810px] lg:-ml-[10px] px-[calc(50%-140px)] lg:px-[10px] lg:pt-4 lg:pb-6 gap-4 lg:gap-[20px] py-4 items-center lg:items-stretch">
                  {sessions.map((session, index) => {
                    const themeIdx = index % 3;
                    const theme = cardThemes[themeIdx];
                    const isSelected = booking.selectedSession?.id === session.id;
                    const payPrice = sessionPrice(session);
                    const hasDiscount = payPrice < session.price;

                    return (
                      <div
                        key={session.id}
                        className="w-[260px]  shrink-0 snap-center flex items-center justify-center p-0"
                      >
                        <div
                          onClick={() => handleSelectSession(session)}
                          className={`w-[260px] lg:w-[260px] min-h-[400px] h-[400px] ${theme.bg} rounded-[10px] lg:rounded-[10px] p-6 flex flex-col justify-between select-none cursor-pointer transition-all duration-300  lg:hover:-translate-y-1 ${isSelected ? 'border-4 border-[#0012FF] scale-[1.03] shadow-lg' : 'border-4 border-transparent'
                            } ${!hasScrolled && index >= 3 ? 'lg:opacity-0 lg:pointer-events-none' : 'opacity-100'}`}
                        >
                        <div>
                          {/* Top row: Briefcase Icon + Duration */}
                          <div className="flex items-center justify-between mb-5">
                            {/* Icon Badge */}
                            <div className="w-10 h-10 rounded-[8px] bg-white/90 shadow-2xs flex items-center justify-center shrink-0">
                             <BriefcaseBusiness className={`${theme.text}`}/>
                            </div>

                            {/* Duration */}
                            <span className={`text-[12px] leading-3 font-medium font-sans flex items-center gap-1.5 ${theme.text}`}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={theme.stroke}>
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 16 14" />
                              </svg>
                              {session.duration}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className={`text-[14px] leading-[14px] font-semibold font-sans  mb-2 line-clamp-1 ${theme.title}`}>
                            {session.title}
                          </h4>

                          {/* Description */}
                          <p className={`text-[14px] leading-3 font-normal font-sans leading-relaxed line-clamp-3 ${theme.desc}`}>
                            {richTextToPlain(session.description)}
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

                        {/* Price — discounted amount first; cut original below when set */}
                        <div className="mt-6">
                          <div className={`text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight leading-none ${theme.text}`}>
                            {payPrice.toLocaleString()} PKR
                          </div>
                          {hasDiscount && (
                            <div className={`mt-1.5 text-sm font-semibold line-through opacity-50 ${theme.text}`}>
                              {session.price.toLocaleString()} PKR
                            </div>
                          )}
                          {session.isPackage && (
                            <span className={`block text-[11px] font-bold normal-case tracking-normal mt-1.5 opacity-80 ${theme.text}`}>
                              Package · {session.packageSessions} sessions per {session.packagePeriod}
                            </span>
                          )}
                        </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>

                {booking.selectedSession && (
                  <section className="mt-8 w-full">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Select Date &amp; Time</h3>
                      <p className="mt-1 text-sm font-medium text-gray-500">
                        Choose an available date and time for your session.
                      </p>
                    </div>
                    <AvailabilityDateTimePicker
                      key={booking.selectedSession.id}
                      username={routeUsername}
                      sessionId={booking.selectedSession.id}
                      selectedDate={booking.selectedDate}
                      selectedTime={booking.selectedTime}
                      onDateChange={(date) =>
                        setBooking((b) => ({ ...b, selectedDate: date, selectedTime: null }))
                      }
                      onTimeChange={(time) => setBooking((b) => ({ ...b, selectedTime: time }))}
                    />
                  </section>
                )}

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
                    disabled={!booking.selectedSession || !booking.selectedDate || !booking.selectedTime || isLoadingContinue}
                    className={`py-2.5 px-5 sm:px-8 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center ${booking.selectedSession && booking.selectedDate && booking.selectedTime
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

      {/* Upcoming events — future published events only (below sessions / profile) */}
      {!loading && upcomingEventCards.length > 0 && (
        <section className="mt-10 w-full">
          <div className="mb-5">
            <h3 className="text-xl sm:text-2xl font-extrabold text-black font-sans tracking-tight">
              Upcoming <span className="text-[#0012FF]">Events</span>
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Live sessions and tickets from this creator.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {upcomingEventCards.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={(eventId) => router.push(`/events/${eventId}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Public client reviews — only when someone has rated */}
      {!loading && reviews.length > 0 && (
        <section className="mt-10 w-full">
          <div className="bg-white rounded-[8px] border border-[#e2e2e2] p-6 sm:p-8 shadow-sm">
            <div className="border-b border-[#e2e2e2] pb-5 mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-black mb-1">Client Reviews</h3>
                <p className="text-gray-500 text-sm">What clients say after sessions with this creator.</p>
              </div>
              <span className="text-sm font-bold text-amber-500 shrink-0">
                ★ {creator?.ratingDisplay || '5.0 (0)'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="relative bg-[#F8F8FA] border border-[#e2e2e2] rounded-[8px] p-6 flex flex-col justify-between min-h-[220px] transition-all hover:shadow-sm"
                >
                  <img
                    src={COMMA_SVGS[rev.commaIdx % 3]}
                    alt=""
                    className="absolute top-4 right-4 w-14 h-14 pointer-events-none object-contain"
                  />

                  <div>
                    <div className="flex items-center gap-3 mb-4 pr-10">
                      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-200">
                        <Image
                          src={rev.avatar || '/avatar.png'}
                          alt={rev.name}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm sm:text-base text-black leading-tight">
                          {rev.name}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                          {rev.dateLabel || 'Recent'}
                        </p>
                      </div>
                    </div>

                    <div className="w-full h-px bg-gray-200/80 mb-4" />

                    <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed font-sans mb-4">
                      &ldquo;{rev.comment || 'No written feedback.'}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 pt-2">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`h-3.5 w-3.5 ${
                          si < rev.rating
                            ? 'fill-[#F5C542] text-[#F5C542]'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
