'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import UserNavbar from '@/components/UserNavbar';
import LoadingAnimation from '@/components/LoadingAnimation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

function LoginToExplore() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Login to view your dashboard</h2>
      <p className="text-gray-500 mb-6 max-w-sm">Manage your profile settings, look at upcoming/past sessions and more.</p>
      <button
        onClick={() => router.push('/login')}
        className="bg-[#0012FF] text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#0012FF]/10"
      >
        Login Account
      </button>
    </div>
  );
}

interface DisplayBooking {
  id: string | number;
  name: string;
  handle: string;
  avatar: string;
  time: string;
  type: string;
  status: string;
  amount: string;
  note: string;
  scheduledDate?: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeBookingTab, setActiveBookingTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming');
  const [favorites, setFavorites] = useState<string[]>([]); // creator usernames

  // User details
  const [displayName, setDisplayName] = useState<string>('James Richard');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Bookings list state
  const [realBookingsList, setRealBookingsList] = useState<{
    Upcoming: DisplayBooking[];
    Past: DisplayBooking[];
    Cancelled: DisplayBooking[];
  }>({
    Upcoming: [],
    Past: [],
    Cancelled: []
  });

  const [useFallback, setUseFallback] = useState(false);

  // Modals for cancel and success
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState<boolean>(false);
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalType, setSuccessModalType] = useState<'cancelled'>('cancelled');

  const fallbackBookingsList = {
    Upcoming: [
      {
        id: 'fallback-1',
        name: 'Sophia Reed',
        handle: '@sophiareed',
        avatar: '/Avatars/6.jpg',
        time: 'Sat at 03:00 PM to 05:00 PM',
        type: 'In-person',
        status: 'Accepted',
        amount: '2500 PKR',
        note: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content....'
      },
      {
        id: 'fallback-2',
        name: 'Sophia Reed',
        handle: '@sophiareed',
        avatar: '/Avatars/6.jpg',
        time: 'Sat at 03:00 PM to 05:00 PM',
        type: 'Online',
        status: 'Accepted',
        amount: '2500 PKR',
        note: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content....'
      },
      {
        id: 'fallback-3',
        name: 'Sophia Reed',
        handle: '@sophiareed',
        avatar: '/Avatars/6.jpg',
        time: 'Sat at 03:00 PM to 05:00 PM',
        type: 'Online',
        status: 'Accepted',
        amount: '2500 PKR',
        note: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content....'
      }
    ],
    Past: [
      {
        id: 'fallback-4',
        name: 'Sophia Reed',
        handle: '@sophiareed',
        avatar: '/Avatars/6.jpg',
        time: 'Last Tuesday at 02:00 PM',
        type: 'Online',
        status: 'Completed',
        amount: '2500 PKR',
        note: 'Great consultation session regarding fashion styles and trends.'
      }
    ],
    Cancelled: [
      {
        id: 'fallback-5',
        name: 'Sophia Reed',
        handle: '@sophiareed',
        avatar: '/Avatars/6.jpg',
        time: 'Cancelled on 5 Jun',
        type: 'In-person',
        status: 'Cancelled',
        amount: '2500 PKR',
        note: 'Session was cancelled due to scheduling conflicts.'
      }
    ]
  };

  const loadData = useCallback(async () => {
    try {
      // Execute all dashboard requests in parallel to eliminate sequential network latency
      const [meRes, bookingsRes, favRes, creatorsRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/user/bookings'),
        fetch('/api/user/favourite-creators'),
        fetch('/api/creators'),
      ]);

      if (meRes.ok) {
        const data = await meRes.json();
        setIsAuthenticated(true);
        if (data.user) {
          if (data.user.approvalStatus === 'pending' && data.user.hasCreatorProfile) {
            router.push('/creators/pending-approval');
            return;
          }
          if (data.user.approvalStatus === 'pending') {
            router.push('/user/pending-approval');
            return;
          }
          setDisplayName(data.user.name || 'James Richard');
          setProfilePhoto(data.creatorProfile?.profilePhoto || data.user.image || null);
        }
      } else {
        setIsAuthenticated(false);
      }

      if (favRes.ok) {
        const favData = await favRes.json();
        setFavorites(favData.favouriteCreators || []);
      }

      if (creatorsRes.ok) {
        const creatorsData = await creatorsRes.json();
        if (creatorsData.success && creatorsData.creators?.length) {
          setCreatorsList(creatorsData.creators);
        }
      }

      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        if (bData.bookings && bData.bookings.length > 0) {
          const upcomingArr: DisplayBooking[] = [];
          const pastArr: DisplayBooking[] = [];
          const cancelledArr: DisplayBooking[] = [];

          bData.bookings.forEach((b: any) => {
            const displayObj: DisplayBooking = {
              id: b.id,
              name: b.creator,
              handle: `@${b.username}`,
              avatar: b.image || '/Avatars/12.jpg',
              time: `${b.shortDate} at ${b.time}`,
              type: b.paymentMethod === 'Guest' ? 'Online' : 'In-person',
              status: b.originalStatus === 'cancelled' ? 'Cancelled' : 'Accepted',
              amount: b.price || '2500 PKR',
              note: b.preSessionQuestion || 'No description provided.',
              scheduledDate: b.scheduledDate
            };

            if (b.originalStatus === 'cancelled' || b.status === 'Cancelled') {
              cancelledArr.push(displayObj);
            } else if (b.status === 'Past') {
              pastArr.push(displayObj);
            } else {
              upcomingArr.push(displayObj);
            }
          });

          setRealBookingsList({
            Upcoming: upcomingArr,
            Past: pastArr,
            Cancelled: cancelledArr
          });
          setUseFallback(false);
        } else {
          setUseFallback(true);
        }
      } else {
        setUseFallback(true);
      }
    } catch (err) {
      console.error(err);
      setUseFallback(true);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    } else if (status === 'unauthenticated') {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [status, loadData]);

  const handleCancelClick = (bookingId: string | number) => {
    if (String(bookingId).startsWith('fallback-')) {
      alert('Cannot modify fallback bookings.');
      return;
    }
    setBookingToCancelId(String(bookingId));
    setShowCancelConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancelId) return;
    setShowCancelConfirmModal(false);

    try {
      const res = await fetch(`/api/user/bookings/${bookingToCancelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        setSuccessModalType('cancelled');
        setShowSuccessModal(true);
        loadData();
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (err) {
      alert('Error cancelling appointment');
    } finally {
      setBookingToCancelId(null);
    }
  };

  const toggleFavorite = async (username: string) => {
    const isFav = favorites.includes(username);
    setFavorites(prev => isFav ? prev.filter(u => u !== username) : [...prev, username]);
    try {
      const res = await fetch('/api/user/favourite-creators', {
        method: isFav ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favouriteCreators || []);
      } else {
        // revert on error
        setFavorites(prev => isFav ? [...prev, username] : prev.filter(u => u !== username));
      }
    } catch {
      setFavorites(prev => isFav ? [...prev, username] : prev.filter(u => u !== username));
    }
  };

  // Real-time creators state
  const [creatorsList, setCreatorsList] = useState<any[]>([]);
  const [creatorsPage, setCreatorsPage] = useState(0);
  const CREATORS_PER_PAGE = 3;

  const fetchCreators = useCallback(async () => {
    try {
      const res = await fetch('/api/creators');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.creators?.length) {
          setCreatorsList(data.creators);
        }
      }
    } catch (err) {
      console.error('Failed to fetch creators:', err);
    }
  }, []);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FA] pb-12 text-black overflow-x-hidden">
        <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />
        <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          {/* Welcome Header Skeleton */}
          <div className="mb-8 space-y-2">
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-md" />
            <div className="h-9 w-80 bg-gray-200 animate-pulse rounded-lg" />
          </div>

          {/* 2-Column Skeleton Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              {/* 3 Stat Cards Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-full h-[160px] rounded-[10px] bg-gray-200 animate-pulse" />
                ))}
              </div>

              {/* Top Creators Skeleton */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-7 w-36 bg-gray-200 animate-pulse rounded-md" />
                  <div className="h-9 w-36 bg-gray-200 animate-pulse rounded-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-[4/4.2] bg-gray-200 rounded-[20px] animate-pulse" />
                  ))}
                </div>
              </div>

              {/* Bookings Section Skeleton */}
              <div className="space-y-4">
                <div className="h-7 w-48 bg-gray-200 animate-pulse rounded-md" />
                <div className="h-[280px] w-full bg-gray-200 rounded-3xl animate-pulse" />
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-4 space-y-6">
              <div className="h-[420px] w-full bg-gray-200 rounded-3xl animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F8FA] pb-12">
        <header className="px-4 sm:px-6 pt-4">
          <nav className="bg-white shadow-sm border border-gray-100 max-w-7xl mx-auto rounded-3xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/assets/logo1.png" alt="Reachly" className="h-10 w-auto object-contain" />
            </Link>
            <div className="flex gap-3">
              <button onClick={() => router.push('/login')} className="text-gray-600 font-semibold text-sm hover:text-black transition-all">Login</button>
              <button onClick={() => router.push('/signup')} className="bg-[#0012FF] text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-[#0012FF]/90 transition-all">Sign up</button>
            </div>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <LoginToExplore />
        </main>
      </div>
    );
  }

  return (
<div className="min-h-screen bg-[#F8F8FA] pb-12 text-black overflow-x-hidden">
      <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />

      {/* Main Grid Content */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Welcome Headers */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm font-sans mb-1">Hello {displayName.split(' ')[0]}!</p>
          <h1 className="text-4xl font-extrabold text-black font-sans tracking-tight">
            Your <span className="text-[#0012FF] font-extrabold">Dashboard</span> <span className="text-gray-400 font-normal text-sm font-sans ml-2">at a glance</span>
          </h1>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (takes 8 cols) */}
          <div className="lg:col-span-8 space-y-8">

            {/* 3 Stat Cards Grid */}
            {/* 3 Overview Stat Cards */}
            {(() => {
              const totalBookingsCount = useFallback ? 0 : (realBookingsList.Upcoming.length + realBookingsList.Past.length + realBookingsList.Cancelled.length);
              
              // Calculate total paid/spent on non-cancelled bookings
              let totalSpent = 0;
              if (!useFallback) {
                [...realBookingsList.Upcoming, ...realBookingsList.Past].forEach(b => {
                  const numericPrice = parseInt(String(b.amount).replace(/[^0-9]/g, ''), 10) || 0;
                  totalSpent += numericPrice;
                });
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  {/* Card 1: Total Bookings */}
                  <div className="w-full h-[160px] rounded-[10px] bg-[#AFE8B9] text-[#0A4A1C] p-5 flex flex-col justify-between shadow-xs transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center shadow-2xs">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A4A1C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="4" y="3" width="16" height="18" rx="3" />
                          <path d="M9 3v7l3-2 3 2V3" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Total Bookings</p>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                        {totalBookingsCount}
                      </h3>
                    </div>
                  </div>

                  {/* Card 2: Total Referrals */}
                  <div className="w-full h-[160px] rounded-[10px] bg-[#FFEDB5] text-[#6C4800] p-5 flex flex-col justify-between shadow-xs transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center shadow-2xs">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C4800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Total Referrals</p>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                        0
                      </h3>
                    </div>
                  </div>

                  {/* Card 3: Total Paid Out / Spent */}
                  <div className="w-full h-[160px] rounded-[10px] bg-[#BAC5FF] text-[#0012FF] p-5 flex flex-col justify-between shadow-xs transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center shadow-2xs">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Total Paid Out</p>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                        {totalSpent > 0 ? `${totalSpent.toLocaleString()} PKR` : '0 PKR'}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Top Creators Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black font-sans">Top Creators</h2>
                <button
                  onClick={() => router.push('/explore-creators')}
                  className="flex items-center gap-2 bg-[#0012FF] text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-[#0012FF]/90 transition-all shadow-md shadow-[#0012FF]/10 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Browse Creators
                </button>
              </div>

              {/* Creators Grid */}
              {creatorsList.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-[4/4.2] bg-gray-100 rounded-[20px] animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {creatorsList
                      .slice(creatorsPage * CREATORS_PER_PAGE, (creatorsPage + 1) * CREATORS_PER_PAGE)
                      .map((creator, index) => {
                        const isFav = favorites.includes(creator.username);
                        return (
                          <motion.div
                            key={creator.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="flex flex-col w-full group cursor-pointer"
                          >
                            {/* Top Image Container */}
                            <div className="relative w-full aspect-[4/4.2] rounded-[20px] overflow-hidden bg-gray-100 mb-3.5 shadow-xs transition-transform duration-300 group-hover:scale-[1.01]">
                              <img
                                src={creator.profilePhoto || '/avatar.png'}
                                alt={creator.displayName}
                                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              />

                              {/* Top Left Badge */}
                              <span
                                className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs tracking-wide ${
                                  creator.isVerified
                                    ? 'bg-[#E6F9EE] text-[#12B76A]'
                                    : 'bg-[#EEF2FF] text-[#0012FF]'
                                }`}
                              >
                                {creator.isVerified ? 'Verified' : 'Sponsored'}
                              </span>

                              {/* Top Right Heart Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(creator.username);
                                }}
                                className="absolute top-3.5 right-3.5 z-20 hover:scale-110 transition-transform active:scale-90"
                                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <svg
                                  className={`w-6 h-6 transition-colors duration-200 ${
                                    isFav ? 'text-[#E32A2A] fill-[#E32A2A] drop-shadow-sm' : 'text-white fill-white/80 drop-shadow-md'
                                  }`}
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              </button>
                            </div>

                            {/* Info Box Below Image */}
                            <div className="px-0.5 space-y-1">
                              {/* Title & Star Rating */}
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-base text-black font-sans flex items-center gap-1.5 leading-tight truncate">
                                  <span>{creator.displayName}</span>
                                  {creator.isVerified && (
                                    <svg className="w-4.5 h-4.5 text-[#12B76A] fill-current shrink-0" viewBox="0 0 24 24">
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                  )}
                                </h3>
                                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                                  ★ {creator.rating || '4.9'}
                                </span>
                              </div>

                              {/* Handle */}
                              <p className="text-xs text-gray-400 font-medium font-sans">@{creator.username}</p>

                              {/* Short Bio */}
                              <p className="text-xs text-gray-400 font-sans leading-relaxed line-clamp-2 pt-1">
                                {creator.shortBio || 'Ayesha Khan is one of Pakistan’s leading fashion and lifestyle content creators...'}
                              </p>

                              {/* Price Row */}
                              <div className="pt-2 flex items-center gap-1 text-xs text-gray-400 font-sans">
                                <span>Starting from</span>
                                <strong className="text-black font-black text-sm ml-1">
                                  {creator.startingPrice ? `${creator.startingPrice.toLocaleString()} PKR` : '1200 PKR'}
                                </strong>
                              </div>

                              {/* Book Now Link */}
                              <div>
                                <Link
                                  href={`/creators/${creator.username}/book-session`}
                                  className="text-xs font-bold text-[#0012FF] underline hover:text-[#0010d0] font-sans pt-1 inline-block"
                                >
                                  Book Now
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>

                  {/* Pagination arrows */}
                  {creatorsList.length > CREATORS_PER_PAGE && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <button
                        onClick={() => setCreatorsPage(p => Math.max(0, p - 1))}
                        disabled={creatorsPage === 0}
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                          creatorsPage === 0
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:border-[#0012FF] hover:text-[#0012FF] hover:bg-[#EEF2FF]'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>

                      <span className="text-xs font-bold text-gray-500">
                        {creatorsPage + 1} / {Math.ceil(creatorsList.length / CREATORS_PER_PAGE)}
                      </span>

                      <button
                        onClick={() => setCreatorsPage(p => Math.min(Math.ceil(creatorsList.length / CREATORS_PER_PAGE) - 1, p + 1))}
                        disabled={creatorsPage >= Math.ceil(creatorsList.length / CREATORS_PER_PAGE) - 1}
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                          creatorsPage >= Math.ceil(creatorsList.length / CREATORS_PER_PAGE) - 1
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:border-[#0012FF] hover:text-[#0012FF] hover:bg-[#EEF2FF]'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

          {/* Right Column (takes 4 cols) - Bookings Tabs & List */}
          <div className="lg:col-span-4 bg-white rounded-[24px] p-5 border border-gray-100 shadow-2xs space-y-5">
            {/* Bookings Tabs */}
            <div className="flex bg-gray-100/80 p-1 rounded-2xl justify-between border border-gray-200/50">
              {(['Upcoming', 'Past', 'Cancelled'] as const).map((tab) => {
                const count = currentBookings[tab].length;
                const isActive = activeBookingTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveBookingTab(tab)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isActive
                      ? 'bg-[#0012FF] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>

            {/* List of bookings */}
            <div className="space-y-4">
              {currentBookings[activeBookingTab].length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 w-full h-full min-h-[200px]">
                  <Image
                    src="/assets/cancel-appointment.png"
                    alt="No bookings yet"
                    width={180}
                    height={180}
                    className="w-40 h-40 object-contain mb-3"
                  />
                  <p className="text-gray-500 font-semibold text-sm">No {activeBookingTab.toLowerCase()} bookings</p>
                </div>
              ) : (
                currentBookings[activeBookingTab].map((booking) => (
                  <div
                    key={booking.id}
                    className="w-full bg-white border border-gray-200/80 rounded-[20px] p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all relative group"
                  >
                    <div>
                      {/* Header: Avatar, Name, Verified Badge, Accepted Badge, Amount */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-100">
                            <img
                              src={booking.avatar || '/avatar.png'}
                              alt={booking.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-base text-black font-sans leading-tight">{booking.name}</h4>
                              <svg className="w-4 h-4 text-[#12B76A] fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                              <span className="bg-[#E6F9EE] text-[#12B76A] font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-2xs">
                                {booking.status || 'Accepted'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 font-medium font-sans mt-0.5">{booking.handle}</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-lg sm:text-xl text-[#0012FF] font-sans tracking-tight shrink-0 ml-2">
                          {booking.amount}
                        </span>
                      </div>

                      {/* Time & Meeting Type Row */}
                      <div className="space-y-1.5 text-xs text-gray-500 font-sans font-medium my-3">
                        <div className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>{booking.type}</span>
                        </div>
                      </div>

                      {/* Note Description */}
                      <p className="text-xs text-gray-400 font-sans leading-relaxed line-clamp-2">
                        {booking.note}
                        <span className="text-[#0012FF] font-bold text-xs ml-1 hover:underline cursor-pointer">Read more</span>
                      </p>
                    </div>

                    {/* Action Buttons (for Upcoming) */}
                    {activeBookingTab === 'Upcoming' && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => router.push('/user/bookings')}
                            className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelClick(booking.id)}
                            className="flex-1 py-2 bg-[#FFF0F0] border border-red-100 hover:bg-red-100 text-[#FF3B3B] rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
                          >
                            Cancel Appointment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowCancelConfirmModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Illustration */}
            <div className="w-40 sm:w-52 h-auto my-2">
              <Image
                src="/assets/cancel-appointment.png"
                alt="Cancel Appointment"
                width={220}
                height={160}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
              Are You Sure?
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>

            {/* Red Pill Action Button */}
            <button
              onClick={handleConfirmCancel}
              className="w-full max-w-[260px] py-3.5 bg-[#E32A2A] hover:bg-[#c92222] text-white rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer"
            >
              Cancel Appointment
            </button>
          </div>
        </div>
      )}

      {/* Success Modal (Cancelled) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Illustration */}
            <div className="w-40 sm:w-52 h-auto my-2">
              <Image
                src="/assets/cancel-appointment.png"
                alt="Booking Cancelled"
                width={220}
                height={160}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
              Booking Cancelled
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
              Your booking has been cancelled successfully.
            </p>

            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full max-w-[220px] py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-sm transition-all shadow-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
