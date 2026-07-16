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
  const [favorites, setFavorites] = useState<string[]>(['Sarah Khan']);

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
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        if (data.user) {
          setDisplayName(data.user.name || 'James Richard');
          setProfilePhoto(data.creatorProfile?.profilePhoto || data.user.image || null);
        }
      } else {
        setIsAuthenticated(false);
      }

      // Fetch bookings
      const bookingsRes = await fetch('/api/user/bookings');
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
  }, []);

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

  const toggleFavorite = (name: string) => {
    setFavorites(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const creators = [
    {
      name: 'Sarah Khan',
      handle: '@sarahkhan',
      tag: 'Sponsored',
      img: '/Avatars/12.jpg',
      rating: '4.9',
      description: "Ayesha Khan is one of Pakistan's leading fashion and lifestyle content creators....",
      price: '1200 PKR',
      isVerified: false
    },
    {
      name: 'Dananeer Mobeen',
      handle: '@dananeermobeen',
      tag: 'Verified',
      img: '/Avatars/5.jpg',
      rating: '4.9',
      description: "Ayesha Khan is one of Pakistan's leading fashion and lifestyle content creators....",
      price: '1200 PKR',
      isVerified: true
    },
    {
      name: 'Bilal Abbas',
      handle: '@bilalabbas',
      tag: 'Sponsored',
      img: '/Avatars/10.jpg',
      rating: '4.9',
      description: "Ayesha Khan is one of Pakistan's leading fashion and lifestyle content creators....",
      price: '1200 PKR',
      isVerified: false
    },
  ];

  const currentBookings = realBookingsList;

  if (loading) return <LoadingAnimation />;

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
    <div className="min-h-screen bg-[#F8F8FA] pb-12 text-black">
      <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Headers */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm font-sans mb-1">Hello {displayName.split(' ')[0]}!</p>
          <h1 className="text-4xl font-black text-black font-anton tracking-tight">
            Your <span className="text-[#0012FF] font-black ">Dashboard</span> <span className="text-gray-400 font-light text-2xl font-sans">at a glance</span>
          </h1>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (takes 8 cols) */}
          <div className="lg:col-span-8 space-y-10">

            {/* Stats Cards Grid (using uc-1, uc-2, uc-3) */}
            <div className="flex items-stretch -ml-10 gap-2">

              {/* Card 1: Total Bookings */}
              <div className="relative w-full h-[160px] z-30 pl-6 pt-4">
                <img
                  src="/assets/uc-1.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10 rounded-2xl"
                />
                <div>
                  <div className="w-12 h-12 bg-white/70 rounded-xl flex items-center justify-center mb-1 shadow-sm">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 font-bold tracking-wide uppercase">Total Bookings</p>
                  <p className="text-3xl font-black text-[#1B6330] mt-1">
                    {currentBookings.Upcoming.length + currentBookings.Past.length + currentBookings.Cancelled.length}
                  </p>
                </div>
                <div className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                  <span>↑ +18.2% from last month</span>
                </div>
              </div>

              {/* Card 2: Total Referrals */}
              <div className="relative w-full h-[160px] -ml-8 z-20 pl-13 pt-4">
                <img
                  src="/assets/uc-2.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
                />
                <div>
                  <div className="w-12 h-12 bg-white/70 rounded-xl flex items-center justify-center mb-1 shadow-sm">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 font-bold tracking-wide uppercase">Total Referrals</p>
                  <p className="text-3xl font-black text-[#854D0E] mt-1">223</p>
                </div>
                <div className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                  <span>↑ +18.2% from last month</span>
                </div>
              </div>

              {/* Card 3: Total Spent */}
              <div className="relative w-full h-[160px] -ml-8 z-10 pl-13 pt-4">
                <img
                  src="/assets/uc-3.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10 rounded-2xl"
                />
                <div>
                  <div className="w-12 h-12 bg-white/70 rounded-xl flex items-center justify-center mb-1 shadow-sm">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 font-bold tracking-wide uppercase">Total Paid Out</p>
                  <p className="text-2xl font-black text-[#1E1B4B] mt-1">63,458 PKR</p>
                </div>
                <div className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                  <span>↑ +18.2% from last month</span>
                </div>
              </div>

            </div>

            {/* Top Creators Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-black font-anton tracking-tight">Top Creators</h2>
                <button
                  onClick={() => router.push('/explore-creators')}
                  className="flex items-center gap-2 bg-[#0012FF] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#0012FF]/90 transition-all shadow-md shadow-[#0012FF]/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Creators
                </button>
              </div>

              {/* Updated Cards to match new design */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {creators.map((creator, index) => {
                  const clipId = `cardClip-dashboard-${index}`;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex flex-col w-full shrink-0 transition-all duration-300 hover:-translate-y-3 hover:scale-[1.04] p-3 rounded-[24px] border border-gray-100/80 group"
                    >
                      {/* Image with SVG clip notch */}
                      <div className="relative w-full h-[280px]">
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                              <path
                                d="
 M0 .06
 C0 .025 .025 0 .06 0
 H0.80
 C0.855 0 .865 .01 .865 .03
 V.10
 C.865 .12 .885 .14 .91 .14
 H.95
 C.985 .14 1 .15 1 .175
 V.91
 C1 .975 .975 1 .94 1
 H.06
 C.025 1 0 .975 0 .94
 V.06
 C0 .025 0 .025 0 .06
 Z
 "
                              />
                            </clipPath>
                          </defs>
                        </svg>

                        <img
                          src={creator.img}
                          alt={creator.name}
                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                          style={{ clipPath: `url(#${clipId})` }}
                        />

                        {/* Tag */}
                        <span className={`absolute top-3 left-4 px-3 py-1 rounded-full text-xs font-semibold ${creator.tag === 'Sponsored'
                          ? 'bg-white text-blue-600'
                          : 'bg-white text-emerald-600'
                          }`}>
                          {creator.tag}
                        </span>

                        {/* Heart — sits in the notch area */}
                        <button
                          onClick={() => toggleFavorite(creator.name)}
                          className="absolute top-2 right-0 z-20 flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <svg
                            className={`w-6 h-6 transition-colors duration-200 ${favorites.includes(creator.name)
                              ? "text-red-500"
                              : "text-gray-300"
                              }`}
                            viewBox="0 0 24 24"
                          >
                            <defs>
                              <filter id="heartGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="0.6" result="blur" />
                                <feMerge>
                                  <feMergeNode in="blur" />
                                  <feMergeNode in="SourceGraphic" />
                                </feMerge>
                              </filter>
                            </defs>

                            <path
                              fill="currentColor"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />

                            <path
                              d="M15.2 6.2c1.5 0 2.7 1.2 2.7 2.7 0 1-.4 1.9-1 2.8"
                              stroke="white"
                              strokeWidth="2.4"
                              strokeOpacity="0.35"
                              strokeLinecap="round"
                              fill="none"
                              filter="url(#heartGlow)"
                            />

                            <path
                              d="M15.2 6.2c1.5 0 2.7 1.2 2.7 2.7 0 1-.4 1.9-1 2.8"
                              stroke="white"
                              strokeWidth="1.3"
                              strokeOpacity="0.95"
                              strokeLinecap="round"
                              fill="none"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Info */}
                      <div className="pt-4 pb-2 px-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-sans font-bold text-lg text-black flex items-center gap-1.5">
                            {creator.name}
                            {creator.isVerified && (
                              <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <g transform="translate(4 4) scale(0.83)">
                                  <path fill="#34C759" d="M24 2.5c2.8 0 5 2.4 7.5 3.2 2.6.8 5.8.1 8 1.8 2.2 1.7 2.9 4.9 4.6 7.1 1.7 2.2 4.8 3.8 5.6 6.4.8 2.6-.8 5.6-.8 8.3s1.6 5.7.8 8.3c-.8 2.6-3.9 4.2-5.6 6.4-1.7 2.2-2.4 5.4-4.6 7.1-2.2 1.7-5.4 1-8 1.8-2.5.8-4.7 3.2-7.5 3.2s-5-2.4-7.5-3.2c-2.6-.8-5.8-.1-8-1.8-2.2-1.7-2.9-4.9-4.6-7.1-1.7-2.2-4.8-3.8-5.6-6.4-.8-2.6.8-5.6.8-8.3s-1.6-5.7-.8-8.3c.8-2.6 3.9-4.2 5.6-6.4 1.7-2.2 2.4-5.4 4.6-7.1 2.2-1.7 5.4-1 8-1.8C19 4.9 21.2 2.5 24 2.5z" />
                                </g>
                                <path d="M17 24L22.5 29.5L32 19" fill="none" stroke="white" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </h3>
                          <span className="flex items-center gap-1 text-sm font-bold text-black">
                            <svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            {creator.rating}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-sans mt-0.5">{creator.handle}</p>
                        <p className="text-xs text-gray-500 font-sans mt-2.5 line-clamp-2">{creator.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs font-sans text-gray-500">Starting from <strong className="text-black font-black">{creator.price}</strong></span>
                          <Link href="/explore-creators" className="text-xs font-sans font-bold text-blue-600 underline hover:text-blue-800 transition-colors">Book Now</Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (takes 4 cols) - Bookings Tabs & List */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            {/* Bookings Tabs */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl justify-between">
              {(['Upcoming', 'Past', 'Cancelled'] as const).map((tab) => {
                const count = currentBookings[tab].length;
                const isActive = activeBookingTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveBookingTab(tab)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isActive
                      ? 'bg-[#0012FF] text-white shadow-md'
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
                    width={200}
                    height={200}
                    className="w-48 h-48 object-contain mb-4"
                  />
                  <p className="text-gray-500 font-semibold">No {activeBookingTab.toLowerCase()} bookings</p>
                </div>
              ) : (
                currentBookings[activeBookingTab].map((booking) => (
                  <div
                    key={booking.id}
                    className="relative w-full min-h-[200px] flex flex-col"
                    style={{ backgroundImage: 'url(/assets/rec-card.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                  >
                    {/* Content */}
                    <div className="relative w-full pl-5 pr-10 pt-5 pb-5 flex flex-col justify-between flex-grow">
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
                              <img
                                src={booking.avatar}
                                alt={booking.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-base text-black leading-tight">{booking.name}</h4>
                              <p className="text-xs text-gray-500">{booking.handle}</p>
                            </div>
                          </div>
                          <p className="font-bold text-base text-[#0012FF] whitespace-nowrap">{booking.amount}</p>
                        </div>

                        {/* Time and Type */}
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                          <div className="flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                              <polyline points="3.5 20 8 17 16 17 20.5 20" />
                            </svg>
                            <span>{booking.type}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 pr-4">
                          {booking.note}
                        </p>
                      </div>

                      {/* Buttons */}
                      {activeBookingTab === 'Upcoming' && (
                        <div>
                          <div className="w-full h-px bg-gray-200 mb-3" />
                          <div className="flex items-center justify-start gap-2 pr-6">
                            <button
                              onClick={() => router.push('/user/bookings')}
                              className="px-4 py-1.5 border-2 border-gray-200 rounded-[14px] text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-all bg-white whitespace-nowrap"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelClick(booking.id)}
                              className="px-4 py-1.5 border-2 border-red-200 rounded-[14px] text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all whitespace-nowrap"
                            >
                              Cancel Appointment
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Arrow indicator */}
                    <div className="absolute right-1 bottom-1">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H10M17 7V14" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="relative overflow-visible w-full max-w-lg flex flex-col items-center p-4 xs:p-6 sm:p-8 pt-10 sm:pt-12 pb-6 sm:pb-8 z-10">
            {/* SVG Background */}
            <img
              src="/assets/cancel-card.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
            />
            {/* Close Button */}
            <button
              onClick={() => setShowCancelConfirmModal(false)}
              className="absolute -top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-50 transition-all z-20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Illustration */}
            <div className="w-20 xs:w-28 sm:w-36 md:w-44 lg:w-56 mt-2 sm:mt-3 mb-3 sm:mb-4">
              <Image
                src="/assets/cancel-appointment.png"
                alt="Cancel Booking"
                width={240}
                height={170}
                className="w-full h-auto object-contain"
              />
            </div>

            <h3 className="text-lg sm:text-2xl font-bold text-black mb-2 text-center">
              Cancel Appointment
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6">
              Are you sure you want to cancel this booking?
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowCancelConfirmModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-red-700 transition-all"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal (Cancelled) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="relative overflow-visible w-full max-w-lg flex flex-col items-center p-4 xs:p-6 sm:p-8 pt-10 sm:pt-12 pb-6 sm:pb-8 z-10">
            {/* SVG Background */}
            <img
              src="/assets/cancel-card.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
            />
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute -top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-50 transition-all z-20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Illustration */}
            <div className="w-20 xs:w-28 sm:w-36 md:w-44 lg:w-56 mt-2 sm:mt-3 mb-3 sm:mb-4">
              <Image
                src="/assets/cancel-appointment.png"
                alt="Booking Cancelled"
                width={240}
                height={170}
                className="w-full h-auto object-contain"
              />
            </div>

            <h3 className="text-lg sm:text-2xl font-bold text-black mb-2 text-center">
              Booking Cancelled
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6">
              Your booking has been cancelled successfully.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2 bg-[#0012FF] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#0010d0] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
