'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, MapPin, ChevronRight, Ticket, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import UserNavbar from '@/components/UserNavbar';
import AdminNavbar from '@/components/AdminNavbar';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import GuestLoginModal from '@/components/GuestLoginModal';
import { formatEventCardDate, formatEventCardTime } from '@/lib/eventDisplay';
import { isRichTextEmpty } from '@/lib/richText';
import { cn } from '@/lib/cn';

interface EventTier {
  title: string;
  price: number;
  persons: number;
  quantity: number;
}

interface EventDate {
  date: string;
  startHour?: string;
  startMinute?: string;
  startPeriod?: string;
  endHour?: string;
  endMinute?: string;
  endPeriod?: string;
  tiers?: EventTier[];
}

interface EventDetail {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  category: string;
  dates: EventDate[];
  refundPolicy: string;
  termsAndConditions: string;
  creator: {
    username: string;
    displayName: string;
    profilePhoto?: string | null;
    shortBio?: string;
    city?: string;
    country?: string;
  } | null;
}

function firstAvailableTierKey(dates: EventDate[] | undefined, dateIndex: number): string | null {
  const tiers = dates?.[dateIndex]?.tiers ?? [];
  const idx = tiers.findIndex((t) => Number(t.quantity) > 0);
  if (idx >= 0) return `${dateIndex}:${idx}`;
  if (tiers.length > 0) return `${dateIndex}:0`;
  return null;
}

const TIER_STYLES = [
  { bg: 'bg-[#FFE4EC]', text: 'text-[#C2185B]', label: 'text-[#AD1457]/80' },
  { bg: 'bg-[#FFF3C4]', text: 'text-[#F57F17]', label: 'text-[#E65100]/80' },
  { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', label: 'text-[#1B5E20]/80' },
];

function formatPkr(price: number) {
  if (price === 0) return 'Free';
  return `${price.toLocaleString('en-US')} PKR`;
}

export default function PublicEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTierKey, setSelectedTierKey] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [buying, setBuying] = useState(false);

  // Guest login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const [meRes, eventRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch(`/api/events/${id}`),
        ]);

        if (meRes.ok) {
          const userData = await meRes.json();
          setIsAuthenticated(true);
          const email = userData.user?.email?.toLowerCase() || '';
          if (email === 'abdullahgotaccess@gmail.com' || email === 'admin@reachly.com') {
            setIsAdmin(true);
          }
          if (userData.creatorProfile) {
            setIsCreator(true);
            setDisplayName(userData.creatorProfile.displayName || userData.user?.name || '');
            setProfilePhoto(userData.creatorProfile.profilePhoto || null);
          } else {
            setDisplayName(userData.user?.name || '');
            setProfilePhoto(userData.user?.profilePhoto || null);
          }
        }

        if (eventRes.status === 404) {
          setNotFound(true);
          return;
        }

        if (eventRes.ok) {
          const data = await eventRes.json();
          const loaded: EventDetail = data.event;
          setEvent(loaded);
          const firstWithTiers = (loaded.dates || []).findIndex(
            (d: EventDate) => (d.tiers || []).length > 0
          );
          const dateIdx = firstWithTiers >= 0 ? firstWithTiers : 0;
          setSelectedDateIndex(dateIdx);
          setSelectedTierKey(firstAvailableTierKey(loaded.dates, dateIdx));
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const activeDate = event?.dates?.[selectedDateIndex];
  const tiers = activeDate?.tiers ?? [];

  const locationLabel = useMemo(() => {
    if (!event?.creator) return event?.category || 'Location TBA';
    const place = [event.creator.city, event.creator.country].filter(Boolean).join(', ');
    if (place) return place;
    return event.creator.displayName || event.category || 'Location TBA';
  }, [event]);

  const selectedTier = useMemo(() => {
    if (!selectedTierKey) return null;
    const [dateIdx, tierIdx] = selectedTierKey.split(':').map(Number);
    return event?.dates?.[dateIdx]?.tiers?.[tierIdx] ?? null;
  }, [event, selectedTierKey]);

  const selectDate = (i: number) => {
    setSelectedDateIndex(i);
    setSelectedTierKey(firstAvailableTierKey(event?.dates, i));
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!selectedTier) return;
    setConfirmOpen(true);
  };

  const confirmBuy = async () => {
    if (!selectedTier || !event || !activeDate?.date) return;
    setBuying(true);
    try {
      const res = await fetch(`/api/events/${event.id}/purchase`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventDate: activeDate.date,
          tierTitle: selectedTier.title,
          quantity: 1,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || 'Failed to buy ticket');
        return;
      }
      setConfirmOpen(false);
      try {
        sessionStorage.removeItem('reachly_user_bookings_page_cache');
        sessionStorage.removeItem('reachly_user_dashboard_cache');
      } catch {
        /* ignore */
      }
      window.location.href = '/user/dashboard';
    } catch (err) {
      console.error(err);
      alert('Failed to buy ticket');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8FA] pb-28 text-[#1a1a1a]">
      {/* Navbar: Logged-in vs Guest */}
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
              <Link href="/" className="flex items-center gap-2 z-10 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/logo1.png" alt="Reachly" className="h-10 w-auto object-contain" />
              </Link>

              <div className="hidden lg:flex items-center gap-7 xl:gap-9 absolute left-1/2 -translate-x-1/2">
                <Link href="/" className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  Home
                </Link>
                <Link href="/explore-creators" className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  Explore Creators
                </Link>
                <Link href="/events" className="font-sans text-sm font-bold text-[#0012FF] transition-colors">
                  Events
                </Link>
                <Link href="/for-creators" className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  For Creators
                </Link>
                <Link href="/about" className="font-sans text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  About
                </Link>
              </div>

              <div className="hidden lg:flex items-center gap-4 z-10">
                <button
                  type="button"
                  onClick={() => router.push(`/login?callbackUrl=/events/${id}`)}
                  className="text-gray-700 font-sans font-medium text-sm hover:text-black transition-all cursor-pointer"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/signup?callbackUrl=/events/${id}`)}
                  className="bg-[#0012FF] hover:bg-[#0010d0] text-white font-sans font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-sm cursor-pointer"
                >
                  Sign up
                </button>
              </div>

              <div className="lg:hidden flex items-center">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-700 hover:text-black p-2"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="lg:hidden overflow-hidden mt-4 pt-4 border-t border-gray-100"
                >
                  <div className="flex flex-col gap-4 pb-4">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block font-sans text-base font-medium text-gray-700 hover:text-black">
                      Home
                    </Link>
                    <Link href="/explore-creators" onClick={() => setIsMobileMenuOpen(false)} className="block font-sans text-base font-medium text-gray-700 hover:text-black">
                      Explore Creators
                    </Link>
                    <Link href="/events" onClick={() => setIsMobileMenuOpen(false)} className="block font-sans text-base font-bold text-[#0012FF]">
                      Events
                    </Link>
                    <Link href="/for-creators" onClick={() => setIsMobileMenuOpen(false)} className="block font-sans text-base font-medium text-gray-700 hover:text-black">
                      For Creators
                    </Link>
                    <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block font-sans text-base font-medium text-gray-700 hover:text-black">
                      About
                    </Link>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push(`/login?callbackUrl=/events/${id}`);
                      }}
                      className="w-full py-2.5 rounded-full text-center text-sm font-semibold text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        router.push(`/signup?callbackUrl=/events/${id}`);
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

      {/* Main Container */}
      <main className="mx-auto max-w-[1536px] px-4 py-8 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => router.push('/events')}
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-[#0012FF]"
        >
          <ArrowLeft size={16} />
          Back to Events
        </button>

        {loading ? (
          <div className="space-y-6">
            <div className="h-[320px] animate-pulse rounded-[8px] bg-gray-200" />
            <div className="h-40 animate-pulse rounded-[8px] bg-gray-200" />
          </div>
        ) : notFound || !event ? (
          <div className="rounded-[8px] border border-dashed border-[#e2e2e2] bg-white px-6 py-16 text-center">
            <p className="text-base font-semibold text-gray-700">Event not found</p>
            <p className="mt-1 text-sm text-gray-400">This event may be unpublished or removed.</p>
            <button
              type="button"
              onClick={() => router.push('/events')}
              className="mt-5 inline-flex cursor-pointer rounded-full bg-[#0012FF] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#0010d0]"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <>
            {/* Top section: banner + event info + tiers */}
            <section className="overflow-hidden rounded-[8px] border border-[#e2e2e2] bg-white shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative min-h-[240px] bg-gray-100 lg:min-h-[340px]">
                  {event.bannerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.bannerUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(120% 90% at 0% 0%, #FF5A36 0%, rgba(255,90,54,0) 55%), linear-gradient(180deg, #0B1B8F 0%, #050A3A 100%)',
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  {event.category && (
                    <span className="mb-3 inline-flex w-fit rounded-full bg-[#E8E9FB] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0012FF]">
                      {event.category}
                    </span>
                  )}
                  <h1 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl lg:text-4xl">
                    {event.title}
                  </h1>

                  <div className="mt-5 flex flex-col gap-2.5 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-2">
                      <Calendar size={16} className="shrink-0 text-[#0012FF]" />
                      {formatEventCardDate(activeDate?.date)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock size={16} className="shrink-0 text-[#0012FF]" />
                      {formatEventCardTime(activeDate)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} className="shrink-0 text-[#0012FF]" />
                      <span className="truncate">{locationLabel}</span>
                    </span>
                  </div>

                  {event.dates.length > 1 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {event.dates.map((d, i) => (
                        <button
                          key={`${d.date}-${i}`}
                          type="button"
                          onClick={() => selectDate(i)}
                          className={cn(
                            'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                            i === selectedDateIndex
                              ? 'border-[#0012FF] bg-[#0012FF] text-white'
                              : 'border-[#e2e2e2] bg-white text-gray-600 hover:border-[#0012FF]/40'
                          )}
                        >
                          {formatEventCardDate(d.date)}
                        </button>
                      ))}
                    </div>
                  )}

                  {tiers.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {tiers.map((tier, i) => {
                        const style = TIER_STYLES[i % TIER_STYLES.length];
                        const key = `${selectedDateIndex}:${i}`;
                        const selected = selectedTierKey === key;
                        const soldOut = Number(tier.quantity) <= 0;
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={soldOut}
                            onClick={() => setSelectedTierKey(key)}
                            className={cn(
                              'rounded-[8px] px-4 py-3 text-left transition-all',
                              style.bg,
                              selected && 'ring-2 ring-[#0012FF] ring-offset-2',
                              soldOut ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:brightness-[0.98]'
                            )}
                          >
                            <p className={cn('text-[11px] font-semibold', style.label)}>{tier.title}</p>
                            <p className={cn('mt-1 text-lg font-extrabold tracking-tight', style.text)}>
                              {formatPkr(Number(tier.price) || 0)}
                            </p>
                            {soldOut && (
                              <p className="mt-1 text-[10px] font-bold uppercase text-gray-500">Sold out</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Bottom section: Host -> Description -> Refund -> Terms */}
            <section className="mt-8 space-y-8 rounded-[8px] border border-[#e2e2e2] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              {event.creator && (
                <div className="rounded-[8px] border border-[#e2e2e2] bg-[#FAFAFC] p-4 sm:p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm ring-1 ring-[#e2e2e2] sm:h-16 sm:w-16">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.creator.profilePhoto || '/avatar.png'}
                        alt={event.creator.displayName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Hosted by
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        {event.creator.username ? (
                          <Link
                            href={`/creators/${event.creator.username}`}
                            className="truncate text-base font-extrabold text-black hover:text-[#0012FF] sm:text-lg"
                          >
                            {event.creator.displayName}
                          </Link>
                        ) : (
                          <span className="truncate text-base font-extrabold text-black sm:text-lg">
                            {event.creator.displayName}
                          </span>
                        )}
                        {event.creator.username && (
                          <span className="text-xs text-gray-400">@{event.creator.username}</span>
                        )}
                      </div>
                      {event.creator.shortBio && (
                        <p className="mt-1 line-clamp-2 text-xs text-gray-600 sm:text-sm">
                          {event.creator.shortBio}
                        </p>
                      )}
                    </div>
                    {event.creator.username && (
                      <Link
                        href={`/creators/${event.creator.username}`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#e2e2e2] bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:border-[#0012FF] hover:text-[#0012FF]"
                      >
                        Profile
                        <ChevronRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h2 className="font-sans text-lg font-bold text-black sm:text-xl">About this event</h2>
                {isRichTextEmpty(event.description) ? (
                  <p className="mt-2 text-sm text-gray-400">No description provided for this event.</p>
                ) : (
                  <div
                    className="prose prose-sm mt-3 max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                )}
              </div>

              {/* Refund Policy */}
              <div className="border-t border-[#e2e2e2] pt-6">
                <h2 className="font-sans text-base font-bold text-black sm:text-lg">Refund Policy</h2>
                <p className="mt-2 text-xs text-gray-500 sm:text-sm leading-relaxed">
                  {event.refundPolicy ||
                    'All ticket sales are final unless otherwise stated by the event organizer. Refund requests may be considered only if the event is canceled, significantly rescheduled, or required by applicable law.'}
                </p>
              </div>

              {/* Terms & Conditions */}
              <div className="border-t border-[#e2e2e2] pt-6">
                <h2 className="font-sans text-base font-bold text-black sm:text-lg">Terms & Conditions</h2>
                <p className="mt-2 text-xs text-gray-500 sm:text-sm leading-relaxed">
                  {event.termsAndConditions ||
                    "By purchasing a ticket, you agree to comply with the event organizer's rules and policies. Tickets are valid only for the specified event and may not be resold or transferred unless permitted by the organizer."}
                </p>
              </div>
            </section>

            {/* Sticky Bottom Booking Bar */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e2e2e2] bg-white/95 backdrop-blur-md">
              <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-10">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {selectedTier ? selectedTier.title : 'Ticket tier'}
                  </p>
                  <p className="truncate text-lg font-black tracking-tight text-black sm:text-2xl">
                    {selectedTier ? formatPkr(Number(selectedTier.price) || 0) : 'Select a tier'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBookingClick}
                  disabled={!selectedTier && isAuthenticated}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0012FF] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#0010d0] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none sm:px-8 sm:text-base"
                >
                  <Ticket size={18} strokeWidth={2.5} />
                  Book Ticket
                </button>
              </div>
            </div>

            {/* Authenticated Confirmation Modal */}
            {confirmOpen && selectedTier && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                  onClick={() => !buying && setConfirmOpen(false)}
                />

                <div
                  role="dialog"
                  aria-modal="true"
                  className="relative w-full max-w-md overflow-hidden rounded-[8px] bg-white shadow-2xl"
                >
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(false)}
                    disabled={buying}
                    className="absolute right-3.5 top-3.5 z-10 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>

                  <div className="relative h-40 w-full bg-gray-100 sm:h-44">
                    {event.bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.bannerUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            'radial-gradient(120% 90% at 0% 0%, #FF5A36 0%, rgba(255,90,54,0) 55%), linear-gradient(180deg, #0B1B8F 0%, #050A3A 100%)',
                        }}
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Confirm purchase
                    </p>
                    <h3 className="mt-1 text-lg font-extrabold leading-snug tracking-tight text-black sm:text-xl">
                      {event.title}
                    </h3>

                    <div className="mt-4 rounded-[8px] border border-[#e2e2e2] bg-[#F8F8FA] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Selected tier
                          </p>
                          <p className="mt-0.5 truncate text-sm font-bold text-black">
                            {selectedTier.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatEventCardDate(activeDate?.date)}
                            {' · '}
                            {formatEventCardTime(activeDate)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Price
                          </p>
                          <p className="mt-0.5 text-base font-extrabold text-[#0012FF]">
                            {formatPkr(Number(selectedTier.price) || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setConfirmOpen(false)}
                        disabled={buying}
                        className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#e2e2e2] bg-white px-4 py-3 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={confirmBuy}
                        disabled={buying}
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0012FF] px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#0010d0] active:scale-[0.98] disabled:bg-gray-400"
                      >
                        <Ticket size={16} strokeWidth={2.5} />
                        {buying ? 'Processing...' : 'Buy Ticket'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Guest Login Required Modal */}
      <GuestLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        mode="booking"
        callbackUrl={`/events/${id}`}
      />
    </div>
  );
}
