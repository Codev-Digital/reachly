'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const CreatorDashboard = () => {
  const pathname = usePathname();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeNavItem, setActiveNavItem] = useState('Dashboard');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          const name = data.creatorProfile?.displayName || data.user?.name || '';
          const photo = data.creatorProfile?.profilePhoto || null;
          setDisplayName(name);
          setProfilePhoto(photo);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    loadProfile();
  }, []);

  const stats = [
    { label: 'Total Bookings this month', value: '12', valueColor: '#22C55E', svg: 'Rectangle-1.svg', icon: 'bookings' },
    { label: 'Upcoming Sessions', value: '3', valueColor: '#F59E0B', svg: 'Rectangle-2.svg', icon: 'calendar' },
    { label: 'Profile Views', value: '1,256', valueColor: '#EF4444', svg: 'Rectangle-3.svg', icon: 'eye' },
    { label: 'Upcoming Sessions', value: '3', valueColor: '#0012FF', svg: 'Rectangle-4.svg', icon: 'users' },
  ];

  const bookings = [
    {
      id: 1,
      name: 'James Richard',
      handle: '@jamesrichard',
      avatar: '/Avatars/3.jpg',
      time: 'Sat at 03:00 PM to 05:00 PM',
      type: 'In-person',
      note: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...',
      amount: '2500 PKR'
    },
    {
      id: 2,
      name: 'James Richard',
      handle: '@jamesrichard',
      avatar: '/Avatars/5.jpg',
      time: 'Sat at 03:00 PM to 05:00 PM',
      type: 'Online',
      note: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...',
      amount: '2500 PKR'
    },
  ];

  const navItems = [
    { name: 'Dashboard', href: '/creators/dashboard', icon: 'dashboard' },
    { name: 'Events', href: '/creators/events', icon: 'events' },
    { name: 'Calendar', href: '/creators/calendar', icon: 'calendar' },
    { name: 'Wallet', href: '/creators/wallet', icon: 'wallet' },
    { name: 'Settings', href: '/creators/settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      {/* Top Navigation Bar */}
      <div className="px-4 sm:px-6 pt-4">
        <nav className="bg-white shadow-sm border border-gray-100 sticky top-0 z-50 rounded-3xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/assets/logo1.png"
                  alt="Reachly"
                  width={100}
                  height={40}
                  className="object-contain w-auto h-auto"
                />
              </Link>

              {/* Navigation Items */}
              <div className="flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setActiveNavItem(item.name)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-md font-semibold transition-all ${
                      activeNavItem === item.name
                        ? 'text-[#0012FF]'
                        : 'text-gray-600 hover:text-[#0012FF]'
                    }`}
                  >
                    {item.icon === 'events' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )}
                    {item.icon === 'dashboard' && (
                      activeNavItem === 'Dashboard' ? (
                        <Image
                          src="/assets/dashboard.png"
                          alt="Dashboard"
                          width={36}
                          height={16}
                          className="object-contain"
                        />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="9" rx="1" />
                          <rect x="14" y="3" width="7" height="5" rx="1" />
                          <rect x="14" y="11" width="7" height="10" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                        </svg>
                      )
                    )}
                    {item.icon === 'calendar' && (
                      activeNavItem === 'Calendar' ? (
                        <Image
                          src="/assets/calendar.svg"
                          alt="Calendar"
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )
                    )}
                    {item.icon === 'wallet' && (
                      activeNavItem === 'Wallet' ? (
                        <Image
                          src="/assets/wallet.svg"
                          alt="Wallet"
                          width={36}
                          height={16}
                          className="object-contain"
                        />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      )
                    )}
                    {item.icon === 'settings' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    )}
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>

                {/* Profile */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center">
                  {profilePhoto ? (
                    <Image src={profilePhoto} alt={displayName} className="w-full h-full object-cover" width={40} height={40} />
                  ) : displayName ? (
                    <span className="text-gray-700 font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <Image src="/Avatars/1.jpg" alt="User" className="w-full h-full object-cover" width={40} height={40} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-gray-500 font-sans mb-1">Hello {displayName ? displayName.split(' ')[0] : 'there'}!</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-black font-sans">
              You Have <span className="text-[#0012FF]">10 Appointments</span> <span className="text-gray-400 font-normal text-lg">/ This week</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 bg-[#0012FF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0012FF]/90 transition-all shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Booking Link
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Earnings Graph (takes 6 columns) */}
          <div className="lg:col-span-6">
            {/* Earnings Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-black font-sans mb-6">Earnings</h2>

              <div className="space-y-6">
                {/* Total Earnings */}
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-black">30,000 PKR</p>
                    <p className="text-sm text-green-500 flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                      </svg>
                      +18.2%
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="relative h-96">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 500 300"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="earningsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0012FF" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0012FF" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 35}
                        x2="500"
                        y2={i * 35}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Y-axis labels */}
                    <text x="10" y="30" fontSize="12" fill="#9CA3AF">70k</text>
                    <text x="10" y="65" fontSize="12" fill="#9CA3AF">60k</text>
                    <text x="10" y="100" fontSize="12" fill="#9CA3AF">50k</text>
                    <text x="10" y="135" fontSize="12" fill="#9CA3AF">40k</text>
                    <text x="10" y="170" fontSize="12" fill="#9CA3AF">30k</text>
                    <text x="10" y="205" fontSize="12" fill="#9CA3AF">20k</text>
                    <text x="10" y="240" fontSize="12" fill="#9CA3AF">10k</text>
                    <text x="10" y="270" fontSize="12" fill="#9CA3AF">0</text>

                    {/* Bars */}
                    {[
                      { x: 50, height: 70 },
                      { x: 90, height: 120 },
                      { x: 130, height: 100 },
                      { x: 170, height: 150 },
                      { x: 210, height: 130 },
                      { x: 250, height: 180 },
                      { x: 290, height: 160 },
                      { x: 330, height: 100 },
                      { x: 370, height: 120 },
                      { x: 410, height: 140 },
                      { x: 450, height: 100 },
                      { x: 490, height: 80 },
                    ].map((bar, i) => (
                      <g key={i}>
                        <rect
                          x={bar.x}
                          y={280 - bar.height}
                          width="22"
                          height={bar.height}
                          fill="url(#earningsGradient)"
                          rx="8"
                        />
                        <rect
                          x={bar.x}
                          y={280 - bar.height}
                          width="22"
                          height={bar.height}
                          fill="#0012FF"
                          rx="8"
                          style={{ clipPath: `inset(30px 0 0 0)` }}
                        />
                        {/* Top circle for June */}
                        {i === 5 && (
                          <g>
                            <circle cx={bar.x + 11} cy={280 - bar.height} r="8" fill="#0012FF" />
                            <circle cx={bar.x + 11} cy={280 - bar.height} r="4" fill="white" />
                          </g>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="flex justify-around text-gray-400 text-sm">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                    <span key={i}>{month}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Stats and Bookings (takes 6 columns) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Period Tabs and Bookings Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex bg-gray-100 p-2 rounded-2xl">
                {['daily', 'weekly', 'monthly'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setActivePeriod(period as any)}
                    className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activePeriod === period
                        ? 'bg-[#0012FF] text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-4 py-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Month</span>
                    <span className="text-sm font-semibold">August</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-2">
                  {['01', '02', '03', '04', '05', '06', '07'].map((day, i) => (
                    <span
                      key={i}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${
                        i === 1 ? 'bg-[#0012FF] text-white' : 'text-gray-500'
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-4 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Year</span>
                    <span className="text-sm font-semibold">2026</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4">
              {/* Stats Cards */}
              <div className="">
                {/* Card 0 - Total Bookings */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="relative">
                    <Image
                      src="/assets/Rectangle-1.svg"
                      alt=""
                      width={420}
                      height={180}
                      className="w-[120%] -mr-[20%] h-auto"
                    />
                    <div className="absolute top-6 left-6 right-6 bottom-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 bg-white/60 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 font-sans mb-1">Total Bookings this month</p>
                          <p className="text-3xl font-bold font-sans" style={{ color: "#22C55E" }}>12</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        <span className="text-sm font-semibold">+18.2% from last month</span>
                      </div>
                    </div>
                  </div>
                  
                </motion.div>

                {/* Card 1 - Upcoming Sessions */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="relative -mt-12 z-10"
                >
                  <div className="relative">
                    <Image
                      src="/assets/Rectangle-2.svg"
                      alt=""
                      width={420}
                      height={180}
                      className="w-[120%] -mr-[20%] h-auto"
                    />
                    <div className="absolute top-19 left-6 right-6 bottom-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 bg-white/60 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 font-sans mb-1">Upcoming Sessions</p>
                          <p className="text-3xl font-bold font-sans" style={{ color: "#F59E0B" }}>3</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        <span className="text-sm font-semibold">+18.2% from last month</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Card 2 - Profile Views */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative -mt-12 z-10"
                >
                  <div className="relative">
                    <Image
                      src="/assets/Rectangle-3.svg"
                      alt=""
                      width={420}
                      height={180}
                      className="w-[120%] -mr-[20%] h-auto"
                    />
                    <div className="absolute top-19 left-6 right-6 bottom-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 bg-white/60 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 font-sans mb-1">Profile Views</p>
                          <p className="text-3xl font-bold font-sans" style={{ color: "#EF4444" }}>1,256</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        <span className="text-sm font-semibold">+18.2% from last month</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Card 3 - Upcoming Sessions */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="relative -mt-12 z-10"
                >
                  <div className="relative">
                    <Image
                      src="/assets/Rectangle-4.svg"
                      alt=""
                      width={420}
                      height={180}
                      className="w-[120%] -mr-[20%] h-auto"
                    />
                    <div className="absolute top-19 left-6 right-6 bottom-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 bg-white/60 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 font-sans mb-1">Upcoming Sessions</p>
                          <p className="text-3xl font-bold font-sans" style={{ color: "#0012FF" }}>3</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                        <span className="text-sm font-semibold">+18.2% from last month</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden">
                          <Image src={booking.avatar} alt={booking.name} className="w-full h-full object-cover" width={64} height={64} />
                        </div>
                        <div>
                          <h3 className="font-bold text-2xl text-black">{booking.name}</h3>
                          <p className="text-md text-gray-500">{booking.handle}</p>
                        </div>
                      </div>
                      <p className="font-bold text-xl text-[#0012FF]">{booking.amount}</p>
                    </div>
                    <div className="flex items-center gap-4 text-md text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.type === 'In-person' ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <polyline points="3.5 20 8 17 16 17 20.5 20" />
                            <line x1="8" y1="10" x2="8" y2="14" />
                            <line x1="11" y1="10" x2="11" y2="14" />
                            <line x1="14" y1="10" x2="14" y2="14" />
                          </svg>
                        )}
                        <span>{booking.type}</span>
                      </div>
                    </div>
                    <p className="text-md text-gray-500 mb-5">
                      {booking.note} <span className="text-[#0012FF] cursor-pointer font-semibold">Read more</span>
                    </p>
                   <div className="flex items-center gap-1">
  <button className="flex-1 py-1 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all">
    Reschedule
  </button>

  <button className="flex-1 py-1 border-2 border-red-200 rounded-2xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all">
    Cancel Appointment
  </button>
</div>
                    {/* Arrow indicator */}
                    <div className="absolute -right-1 bottom-6">
                   <svg
  width="32"
  height="32"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#0012FF"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  {/* Shaft */}
  <line x1="7" y1="17" x2="17" y2="7" />

  {/* Arrow head */}
  <polyline points="12,7 17,7 17,12" />
</svg>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatorDashboard;
