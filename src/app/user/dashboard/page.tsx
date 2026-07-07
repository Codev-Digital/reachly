'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import LoginToExplore from '@/components/LoginToExplore';

export default function UserDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('Dashboard');
  const [activeBookingTab, setActiveBookingTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming');
  const [favorites, setFavorites] = useState<string[]>(['Sarah Khan']);

  // User details
  const [displayName, setDisplayName] = useState<string>('James Richard');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          if (data.user) {
            setDisplayName(data.user.name || 'James Richard');
            // Check if user has photo
            setProfilePhoto(data.user.image || null);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const toggleFavorite = (name: string) => {
    setFavorites(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const navItems = [
    { name: 'Dashboard', href: '/user/dashboard', icon: 'dashboard' },
    { name: 'Events', href: '/explore-creators', icon: 'events' },
    { name: 'Bookings', href: '/user/bookings', icon: 'bookings' },
    { name: 'Referrals', href: '#', icon: 'referrals' },
    { name: 'Wallet', href: '/user/payments', icon: 'wallet' },
    { name: 'Settings', href: '/user/settings', icon: 'settings' },
  ];

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

  const bookingsList = {
    Upcoming: [
      {
        id: 1,
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
        id: 2,
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
        id: 3,
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
        id: 4,
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
        id: 5,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FA] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#0012FF]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
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
    <div className="min-h-screen bg-[#F8F8FA] pb-12 text-black">
      {/* Redesigned Floating Top Navigation Bar */}
      <div className="px-4 sm:px-6 pt-4">
        <nav className="bg-white shadow-sm border border-gray-100 sticky top-0 z-50 rounded-full max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/assets/logo1.png"
              alt="Reachly"
              className="object-contain h-8 w-auto"
            />
          </Link>

          {/* Centered Navigation Items */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = activeNavItem === item.name || (item.name === 'Dashboard' && pathname === '/user/dashboard');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => item.href !== '#' && setActiveNavItem(item.name)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    isActive
                      ? ' text-[#0012FF]'
                      : 'text-gray-500 hover:text-[#0012FF] hover:bg-gray-50'
                  }`}
                >
                  {/* Dashboard Icon */}
                  {item.icon === 'dashboard' && (
                    isActive ? (
                      <img
  src="/assets/dashboard.png"
  alt="Dashboard"
  className="w-[38px] h-[38px] object-contain"
/>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="9" rx="1" />
                        <rect x="14" y="3" width="7" height="5" rx="1" />
                        <rect x="14" y="11" width="7" height="10" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                      </svg>
                    )
                  )}

                  {/* Events Icon */}
                  {item.icon === 'events' && (
                    isActive ? (
                      <img
                        src="/assets/calendar.svg"
                        alt="Events"
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )
                  )}

                  {/* Bookings Icon */}
                  {item.icon === 'bookings' && (
                    isActive ? (
                      <img
                        src="/assets/calendar.svg"
                        alt="Bookings"
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    )
                  )}

                  {/* Referrals Icon */}
                  {item.icon === 'referrals' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  )}

                  {/* Wallet Icon */}
                  {item.icon === 'wallet' && (
                    isActive ? (
                      <img
                        src="/assets/wallet.svg"
                        alt="Wallet"
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    )
                  )}

                  {/* Settings Icon */}
                  {item.icon === 'settings' && (
                    isActive ? (
                      <img
                        src="/assets/settings.svg.png"
                        alt="Settings"
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    )
                  )}

                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center shadow-sm">
              {profilePhoto ? (
                <img src={profilePhoto} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <img src="/Avatars/1.jpg" alt="User Avatar" className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Headers */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm font-sans mb-1">Hello {displayName.split(' ')[0]}!</p>
          <h1 className="text-4xl font-extrabold text-black font-sans tracking-tight">
            Your <span className="text-[#0012FF] font-black italic">Dashboard</span> <span className="text-gray-400 font-light text-2xl">at a glance</span>
          </h1>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (takes 8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Stats Cards Grid (using uc-1, uc-2, uc-3) */}
          <div className="flex items-stretch -ml-10 gap-3">
              
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
                  <p className="text-3xl font-black text-[#1B6330] mt-1">18</p>
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
                <h2 className="text-3xl font-black text-black tracking-tight">Top Creators</h2>
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

              {/* Exact Homepage Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {creators.map((creator, index) => {
                  const clipId = `cardClip-dashboard-${index}`;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                 className="flex flex-col w-full rounded-3xl shadow-sm"
                    >
                      {/* Image with SVG clip notch */}
                      <div className="relative w-full h-[250px]">
                        <svg width="0" height="0" className="absolute">
                          <defs>
                            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                              <path
                                d="
                                  M0 0
                                  H0.87
                                  C0.885 0 .895 .01 .895 .03
                                  V.09
                                  C.895 .12 .905 .14 .93 .14
                                  H.96
                                  C.99 .14 1 .15 1 .175
                                  V.94
                                  C1 .975 .975 1 .94 1
                                  H.06
                                  C.025 1 0 .975 0 .94
                                  V0
                                  Z
                                "
                              />
                            </clipPath>
                          </defs>
                        </svg>

                        <img
                          src={creator.img}
                          alt={creator.name}
                          className="w-full h-full object-cover object-top rounded-2xl"
                          style={{ clipPath: `url(#${clipId})` }}
                        />

                        {/* Tag */}
                        <span className={`absolute top-3 left-4 px-3 py-1 rounded-full text-[11px] font-bold ${
                          creator.tag === 'Sponsored'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {creator.tag}
                        </span>

                        {/* Heart icon button in the notch */}
                      <button
  onClick={() => toggleFavorite(creator.name)}
  className="absolute top-1 right-1 flex items-center justify-center hover:scale-105 transition-all"
>
                          <svg
  className={`w-6 h-6 transition-colors duration-200 ${
    favorites.includes(creator.name)
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

  {/* Heart */}
  <path
    fill="currentColor"
    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
  />

  {/* Glow */}
  <path
    d="M15.2 6.2c1.5 0 2.7 1.2 2.7 2.7 0 1-.4 1.9-1 2.8"
    stroke="white"
    strokeWidth="2.4"
    strokeOpacity="0.35"
    strokeLinecap="round"
    fill="none"
    filter="url(#heartGlow)"
  />

  {/* Main shine */}
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

                      {/* Creator Info */}
                      <div className="pt-4 pb-2 px-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-sans font-bold text-lg text-black flex items-center gap-1">
                              {creator.name}
                              {creator.isVerified && (
                                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                  <g transform="translate(4 4) scale(0.83)">
                                    <path fill="#34C759" d="M24 2.5c2.8 0 5 2.4 7.5 3.2 2.6.8 5.8.1 8 1.8 2.2 1.7 2.9 4.9 4.6 7.1 1.7 2.2 4.8 3.8 5.6 6.4.8 2.6-.8 5.6-.8 8.3s1.6 5.7.8 8.3c-.8 2.6-3.9 4.2-5.6 6.4-1.7 2.2-2.4 5.4-4.6 7.1-2.2 1.7-5.4 1-8 1.8-2.5.8-4.7 3.2-7.5 3.2s-5-2.4-7.5-3.2c-2.6-.8-5.8-.1-8-1.8-2.2-1.7-2.9-4.9-4.6-7.1-1.7-2.2-4.8-3.8-5.6-6.4-.8-2.6.8-5.6.8-8.3s-1.6-5.7-.8-8.3c.8-2.6 3.9-4.2 5.6-6.4 1.7-2.2 2.4-5.4 4.6-7.1 2.2-1.7 5.4-1 8-1.8C19 4.9 21.2 2.5 24 2.5z"/>
                                  </g>
                                  <path d="M17 24L22.5 29.5L32 19" fill="none" stroke="white" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </h3>
                            <span className="flex items-center gap-0.5 text-sm font-bold text-black">
                              <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                              {creator.rating}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 font-sans mt-0.5">{creator.handle}</p>
                          <p className="text-[12px] text-gray-500 font-sans mt-2 leading-relaxed line-clamp-2">{creator.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-[11px] font-sans text-gray-500">Starting from <strong className="text-black font-black text-sm">{creator.price}</strong></span>
                          <Link href="/welcome" className="text-xs font-sans font-bold text-blue-600 underline hover:text-blue-800 transition-colors">Book Now</Link>
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
                const count = tab === 'Upcoming' ? 9 : tab === 'Past' ? 6 : 3;
                const isActive = activeBookingTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveBookingTab(tab)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      isActive
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
              {bookingsList[activeBookingTab].map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative group hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.avatar}
                          alt={booking.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-base text-black flex items-center gap-1">
                            {booking.name}
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" fill="#34C759" />
                              <path d="M8 12l3 3 5-5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </h4>
                          <span className="text-xs text-gray-400">{booking.handle}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                          {booking.status}
                        </span>
                        <span className="text-sm font-bold text-[#0012FF] mt-1">
                          {booking.amount}
                        </span>
                      </div>
                    </div>

                    {/* Time and Type */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {booking.type === 'In-person' ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>In-person</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                              <path d="M10 17v4M14 17v4M6 21h12" />
                            </svg>
                            <span>Online</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[12px] text-gray-500 mt-3 leading-relaxed">
                      {booking.note}
                      <span className="text-[#0012FF] font-bold cursor-pointer hover:underline">Read more</span>
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                    <button className="flex-1 py-1.5 text-xs font-bold border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-all">
                      Reschedule
                    </button>
                    <button className="flex-1 py-1.5 text-xs font-bold border border-red-200 rounded-full text-red-500 bg-red-50/50 hover:bg-red-50 transition-all">
                      Cancel Appointment
                    </button>
                  </div>

                  {/* Up-Right Arrow Icon */}
                  <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0012FF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="12,7 17,7 17,12" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
