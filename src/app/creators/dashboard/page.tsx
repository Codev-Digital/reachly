'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';

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
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 2)); // Default to August 2, 2026
  const [activeBarIndex, setActiveBarIndex] = useState<number>(5); // Default to June (index 5)
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const selectMonth = (monthIndex: number) => {
    const d = new Date(currentDate);
    d.setMonth(monthIndex);
    setCurrentDate(d);
    setMonthDropdownOpen(false);
  };

  const selectYear = (year: number) => {
    const d = new Date(currentDate);
    d.setFullYear(year);
    setCurrentDate(d);
    setYearDropdownOpen(false);
  };

  const monthlyData = [
    { month: 'Jan', earnings: '15,000 PKR', trend: '+12.4%', height: 70 },
    { month: 'Feb', earnings: '58,000 PKR', trend: '+15.2%', height: 190 },
    { month: 'Mar', earnings: '35,000 PKR', trend: '+18.2%', height: 120 },
    { month: 'Apr', earnings: '32,000 PKR', trend: '+18.2%', height: 110 },
    { month: 'May', earnings: '35,000 PKR', trend: '+18.2%', height: 120 },
    { month: 'Jun', earnings: '30,000 PKR', trend: '+18.2%', height: 180 },
    { month: 'Jul', earnings: '28,000 PKR', trend: '+18.2%', height: 100 },
    { month: 'Aug', earnings: '15,000 PKR', trend: '+18.2%', height: 70 },
    { month: 'Sep', earnings: '28,000 PKR', trend: '+18.2%', height: 100 },
    { month: 'Oct', earnings: '15,000 PKR', trend: '+18.2%', height: 70 },
    { month: 'Nov', earnings: '35,000 PKR', trend: '+18.2%', height: 120 },
    { month: 'Dec', earnings: '52,000 PKR', trend: '+18.2%', height: 170 },
  ];

  const getDaysStrip = () => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const prevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(d);
  };

  const nextYear = () => {
    const d = new Date(currentDate);
    d.setFullYear(currentDate.getFullYear() + 1);
    setCurrentDate(d);
  };

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

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      {/* Main Content */}
      <main className="px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <p className="text-gray-500 font-sans mb-1 text-sm sm:text-base">Hello {displayName ? displayName.split(' ')[0] : 'there'}!</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-sans">
              You Have <span className="text-[#0012FF]">10 Appointments</span> <span className="text-gray-400 font-normal text-base sm:text-lg">/ This week</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 bg-[#0012FF] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-[#0012FF]/90 transition-all shadow-md w-fit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Booking Link
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
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
                {/* Chart */}
                <div className="relative h-96">
                  {/* Floating Tooltip */}
                  <div
                    className="absolute bg-white border border-gray-100 rounded-2xl shadow-xl p-3 flex items-center gap-3 z-30 transition-all duration-300 pointer-events-none"
                    style={{
                      left: `${((50 + activeBarIndex * 40 + 11) / 500) * 100}%`,
                      top: `${((280 - monthlyData[activeBarIndex].height - 55) / 300) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '210px',
                    }}
                  >
                    <div className="w-10 h-10 bg-[#0012FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <p className="text-[10px] text-gray-400 font-sans font-semibold uppercase tracking-wider">Total Earnings</p>
                      <p className="text-sm font-black text-black font-sans">{monthlyData[activeBarIndex].earnings}</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                      {monthlyData[activeBarIndex].trend}
                    </div>
                  </div>

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
                    {monthlyData.map((bar, i) => {
                      const x = 50 + i * 40;
                      const isActive = i === activeBarIndex;
                      return (
                        <g key={i} className="cursor-pointer" onClick={() => setActiveBarIndex(i)}>
                          {/* Inactive Bar */}
                          {!isActive && (
                            <rect
                              x={x}
                              y={280 - bar.height}
                              width="22"
                              height={bar.height}
                              fill="#E5E7EB"
                              rx="8"
                              className="hover:fill-gray-300 transition-colors duration-200"
                            />
                          )}
                          {/* Active Bar */}
                          {isActive && (
                            <>
                              <rect
                                x={x}
                                y={280 - bar.height}
                                width="22"
                                height={bar.height}
                                fill="url(#earningsGradient)"
                                rx="8"
                              />
                              <rect
                                x={x}
                                y={280 - bar.height}
                                width="22"
                                height={bar.height}
                                fill="#0012FF"
                                rx="8"
                                style={{ clipPath: `inset(30px 0 0 0)` }}
                              />
                              {/* Top Circle */}
                              <g>
                                <circle cx={x + 11} cy={280 - bar.height} r="8" fill="#0012FF" />
                                <circle cx={x + 11} cy={280 - bar.height} r="4" fill="white" />
                              </g>
                            </>
                          )}
                        </g>
                      );
                    })}
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                {['daily', 'weekly', 'monthly'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setActivePeriod(period as any)}
                    className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activePeriod === period
                      ? 'bg-[#0012FF] text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Month Selector */}
                <div className="relative">
                  <div
                    onClick={() => { setMonthDropdownOpen(!monthDropdownOpen); setYearDropdownOpen(false); }}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-50 transition-all select-none min-w-[110px]"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400">Month</span>
                      <span className="text-xs sm:text-sm text-gray-700 font-semibold">
                        {currentDate.toLocaleString('default', { month: 'long' })}
                      </span>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${monthDropdownOpen ? 'rotate-180' : ''}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {monthDropdownOpen && (
                    <div className="absolute left-0 top-[calc(100%+6px)] w-40 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-[50] max-h-60 overflow-y-auto">
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                        <button
                          key={m}
                          onClick={() => selectMonth(idx)}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#0012FF]/5 transition-colors ${currentDate.getMonth() === idx ? 'text-[#0012FF] bg-[#0012FF]/5' : 'text-gray-600'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Days Strip */}
                <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-2">
                  {getDaysStrip().map((day, i) => {
                    const isSelected = day.getDate() === currentDate.getDate() &&
                                       day.getMonth() === currentDate.getMonth() &&
                                       day.getFullYear() === currentDate.getFullYear();
                    return (
                      <span
                        key={i}
                        onClick={() => setCurrentDate(day)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-all ${
                          isSelected ? 'bg-[#0012FF] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {day.getDate().toString().padStart(2, '0')}
                      </span>
                    );
                  })}
                </div>

                {/* Year Selector */}
                <div className="relative">
                  <div
                    onClick={() => { setYearDropdownOpen(!yearDropdownOpen); setMonthDropdownOpen(false); }}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-50 transition-all select-none min-w-[90px]"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400">Year</span>
                      <span className="text-xs sm:text-sm text-gray-700 font-semibold">{currentDate.getFullYear()}</span>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${yearDropdownOpen ? 'rotate-180' : ''}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {yearDropdownOpen && (
                    <div className="absolute right-0 top-[calc(100%+6px)] w-28 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-[50]">
                      {[2024, 2025, 2026, 2027, 2028, 2029].map((y) => (
                        <button
                          key={y}
                          onClick={() => selectYear(y)}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#0012FF]/5 transition-colors ${currentDate.getFullYear() === y ? 'text-[#0012FF] bg-[#0012FF]/5' : 'text-gray-600'}`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-4">
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
                    className="relative w-full h-auto min-h-[170px] z-10 flex flex-col"
                  >
                    {/* Background Card Image */}
                    <Image
                      src="/assets/rec-card.png"
                      alt=""
                      fill
                      className="object-fill pointer-events-none -z-10"
                    />
                    {/* Content */}
                    <div className="relative w-full pl-4 pr-12 pt-4 pb-4 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex items-start justify-between mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                              <Image src={booking.avatar} alt={booking.name} className="w-full h-full object-cover" width={40} height={40} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-black leading-tight">{booking.name}</h3>
                              <p className="text-xs text-gray-500">{booking.handle}</p>
                            </div>
                          </div>
                          <p className="font-bold text-sm text-[#0012FF] whitespace-nowrap">{booking.amount}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {booking.type === 'In-person' ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <polyline points="3.5 20 8 17 16 17 20.5 20" />
                              </svg>
                            )}
                            <span>{booking.type}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 pr-2">
                          {booking.note} <span className="text-[#0012FF] cursor-pointer font-semibold">Read more</span>
                        </p>
                      </div>
                      <div>
                        <div className="w-full h-px bg-gray-200 mb-2.5"></div>
                        <div className="flex items-center gap-2 pr-8">
                          <button className="flex-grow py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-all bg-white">
                            Reschedule
                          </button>
                          <button className="flex-grow py-1.5 border border-red-200 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all">
                            Cancel Appointment
                          </button>
                        </div>
                      </div>
                      {/* Arrow indicator */}
                      <div className="absolute right-0.5 bottom-0.5">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 17L17 7M17 7H10M17 7V14" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
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
