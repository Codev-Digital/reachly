'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Creator {
  name: string;
  handle: string;
  tag: 'Sponsored' | 'Verified';
  img: string;
  rating: string;
  description: string;
  price: string;
  isVerified: boolean;
}

const AdminDashboard = () => {
  const [activeBarIndex, setActiveBarIndex] = useState<number>(5); // Default to June (index 5)

  // Chart data
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

  // Categories data
  const categories = [
    { name: 'Lifestyle', count: 124, revenue: 'PKR 892,000', percentage: 95 },
    { name: 'Tech', count: 104, revenue: 'PKR 792,000', percentage: 80 },
    { name: 'Fitness', count: 94, revenue: 'PKR 692,000', percentage: 70 },
    { name: 'Fashion', count: 84, revenue: 'PKR 592,000', percentage: 60 },
    { name: 'Business', count: 74, revenue: 'PKR 492,000', percentage: 50 },
    { name: 'Education', count: 64, revenue: 'PKR 392,000', percentage: 40 },
    { name: 'Beauty', count: 54, revenue: 'PKR 292,000', percentage: 30 },
  ];

  // Top Creators data
  const topCreators: Creator[] = [
    {
      name: 'Sarah Khan',
      handle: '@sarahkhan',
      tag: 'Sponsored',
      img: '/Avatars/12.jpg',
      rating: '4.9',
      description: "Ayesha Khan is one of Pakistan's leading fashion and lifestyle content creators....",
      price: '1200 PKR',
      isVerified: false,
    },
    {
      name: 'Dananeer Mobeen',
      handle: '@dananeermobeen',
      tag: 'Verified',
      img: '/Avatars/5.jpg',
      rating: '4.9',
      description: "Ayesha Khan is one of Pakistan's leading fashion and lifestyle content creators....",
      price: '1200 PKR',
      isVerified: true,
    },
    {
      name: 'Bilal Abbas',
      handle: '@bilalabbas',
      tag: 'Sponsored',
      img: '/Avatars/10.jpg',
      rating: '4.9',
      description: "Ayesha Khan is one of Pakistan's leading fashion and lifestyle content creators....",
      price: '1200 PKR',
      isVerified: false,
    },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="pb-12"
    >
      {/* Greetings */}
      <div className="mb-8">
        <p className="text-gray-500 font-sans text-sm sm:text-base mb-1">Hello Anna Chris!</p>
        <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
          Your <span className="text-[#0012FF] font-black">Dashboard</span>{' '}
          <span className="text-gray-400 font-normal text-sm sm:text-base">at a glance</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Stats & Earnings Graph */}
        <div className="space-y-8">
          {/* Overlapping Stats Cards Container */}
          <div className="space-y-4">
            {/* Row 1: Total Users & Total Creators */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start w-full">
              {/* Card 1: Total Users */}
              <div className="relative w-full sm:w-[48%] aspect-[329/160] p-6 flex flex-col justify-between overflow-visible z-[1]">
                <img
                  src="/assets/admin-rc-1.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
                />
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0012FF] shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <div className="mt-auto">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Users</p>
                  <p className="text-2xl font-black text-[#0012FF]">1,410</p>
                  <p className="text-[10px] text-gray-400">↑ +18.2% from last month</p>
                </div>
              </div>

              {/* Card 2: Total Creators */}
              <div className="relative w-full sm:w-[53%] aspect-[361/160] pl-10 pr-6 py-6 flex flex-col justify-between overflow-visible z-[2] mt-4 sm:mt-0 sm:-ml-[3%]">
                <img
                  src="/assets/admin-rc-2.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
                />

                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#10B981] shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                  </svg>
                </div>

                <div className="mt-auto">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Total Creators
                  </p>
                  <p className="text-2xl font-black text-[#10B981]">410</p>
                  <p className="text-[10px] text-gray-400">
                    ↑ +18.2% from last month
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Total Revenue & Pending Payouts */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start w-full">
              {/* Card 3: Total Revenue */}
              <div className="relative w-full sm:w-[48%] aspect-[329/160] p-6 flex flex-col justify-between overflow-visible z-[1]">
                <img
                  src="/assets/admin-rc-3.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
                />
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#EF4444] shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="mt-auto">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p>
                  <p className="text-2xl font-black text-[#EF4444]">22,058 PKR</p>
                  <p className="text-[10px] text-gray-400">↑ +18.2% from last month</p>
                </div>
              </div>

              {/* Card 4: Pending Payouts */}
              <div className="relative w-full sm:w-[53%] aspect-[361/160] pl-10 pr-6 py-6 flex flex-col justify-between overflow-visible z-[2] mt-4 sm:mt-0 sm:-ml-[3%]">
                <img
                  src="/assets/admin-rc-4.svg"
                  alt=""
                  className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
                />
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#F59E0B] shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="mt-auto">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pending Payouts</p>
                  <p className="text-2xl font-black text-[#F59E0B]">458</p>
                  <p className="text-[10px] text-gray-400">↑ +18.2% from last month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Graph */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm relative overflow-hidden"
          >
            <h2 className="text-2xl font-bold text-black font-sans mb-6">Earnings</h2>

            <div className="space-y-6">
              {/* Chart */}
              <div className="relative h-64 sm:h-80 md:h-96">
                {/* Floating Tooltip */}
                <div
                  className="absolute bg-white border border-gray-100 rounded-2xl shadow-xl p-3 flex items-center gap-3 z-30 transition-all duration-300 pointer-events-none"
                  style={{
                    left: `${((50 + activeBarIndex * 36 + 11) / 500) * 100}%`,
                    top: `${((280 - monthlyData[activeBarIndex].height - 55) / 300) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '190px',
                  }}
                >
                  <div className="w-9 h-9 bg-[#0012FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <p className="text-[9px] text-gray-400 font-sans font-semibold uppercase tracking-wider">Total Earnings</p>
                    <p className="text-xs font-black text-black font-sans">{monthlyData[activeBarIndex].earnings}</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[9px] font-bold">
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
                      stroke="#F3F4F6"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Y-axis labels */}
                  <text x="10" y="30" fontSize="10" fill="#9CA3AF" fontWeight="semibold">70k</text>
                  <text x="10" y="65" fontSize="10" fill="#9CA3AF" fontWeight="semibold">60k</text>
                  <text x="10" y="100" fontSize="10" fill="#9CA3AF" fontWeight="semibold">50k</text>
                  <text x="10" y="135" fontSize="10" fill="#9CA3AF" fontWeight="semibold">40k</text>
                  <text x="10" y="170" fontSize="10" fill="#9CA3AF" fontWeight="semibold">30k</text>
                  <text x="10" y="205" fontSize="10" fill="#9CA3AF" fontWeight="semibold">20k</text>
                  <text x="10" y="240" fontSize="10" fill="#9CA3AF" fontWeight="semibold">10k</text>
                  <text x="10" y="270" fontSize="10" fill="#9CA3AF" fontWeight="semibold">0</text>

                  {/* Bars */}
                  {monthlyData.map((bar, i) => {
                    const x = 50 + i * 36;
                    const isActive = i === activeBarIndex;
                    return (
                      <g key={i} className="cursor-pointer" onClick={() => setActiveBarIndex(i)}>
                        {/* Inactive Bar */}
                        {!isActive && (
                          <rect
                            x={x}
                            y={280 - bar.height}
                            width="20"
                            height={bar.height}
                            fill="#F3F4F6"
                            rx="6"
                            className="hover:fill-gray-200 transition-colors duration-200"
                          />
                        )}
                        {/* Active Bar */}
                        {isActive && (
                          <>
                            <rect
                              x={x}
                              y={280 - bar.height}
                              width="20"
                              height={bar.height}
                              fill="url(#earningsGradient)"
                              rx="6"
                            />
                            <rect
                              x={x}
                              y={280 - bar.height}
                              width="20"
                              height={bar.height}
                              fill="#0012FF"
                              rx="6"
                              style={{ clipPath: `inset(30px 0 0 0)` }}
                            />
                            {/* Top Circle */}
                            <g>
                              <circle cx={x + 10} cy={280 - bar.height} r="7" fill="#0012FF" />
                              <circle cx={x + 10} cy={280 - bar.height} r="3" fill="white" />
                            </g>
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* X-axis labels */}
              <div className="flex justify-around text-gray-400 text-xs font-semibold px-4">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                  <span key={i} className={i === activeBarIndex ? 'text-[#0012FF] font-black' : ''}>
                    {month}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Top Categories & Top Creators */}
        <div className="space-y-8">
          {/* Top Categories Card */}
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-black mb-6 font-sans">Top Categories</h2>
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="w-16 sm:w-20 font-semibold text-gray-600">{cat.name}</div>
                  <div className="flex-1 mx-4">
                    <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0012FF] rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className="text-gray-400 font-semibold">{cat.count}</span>
                    <span className="font-bold text-gray-900 w-24">{cat.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Creators section */}
          <div>
            <h2 className="text-xl font-bold text-black mb-6 font-sans">Top Creators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topCreators.map((creator, index) => {
                const clipId = `cardClip-admin-${index}`;
                return (
                  <div
                    key={index}
                    className="flex flex-col bg-white p-3 rounded-[24px] border border-gray-100 group shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Image with SVG clip notch */}
                    <div className="relative w-full h-48 sm:h-52 md:h-56 overflow-hidden rounded-t-[18px]">
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
                      <span
                        className={`absolute top-2.5 left-3.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${creator.tag === 'Sponsored'
                          ? 'bg-white text-blue-600'
                          : 'bg-white text-emerald-600'
                          }`}
                      >
                        {creator.tag}
                      </span>

                      {/* Heart Icon sits in the notch */}
                      <button className="absolute top-2 right-1.5 z-20 flex items-center justify-center hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-gray-300 hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>

                    {/* Content Details */}
                    <div className="pt-3 pb-1 px-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-sans font-bold text-sm text-black flex items-center gap-1">
                          {creator.name}
                          {creator.isVerified && (
                            <svg className="w-4 h-4 text-emerald-500 fill-current" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </h3>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-black">
                          <svg className="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {creator.rating}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans mt-0.5">{creator.handle}</p>
                      <p className="text-[10px] text-gray-500 font-sans mt-2 line-clamp-2 leading-relaxed">
                        {creator.description}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                        <span className="text-[10px] font-sans text-gray-400">
                          Starting from <strong className="text-black font-extrabold">{creator.price}</strong>
                        </span>
                        <Link
                          href="/explore-creators"
                          className="text-[10px] font-sans font-bold text-blue-600 underline hover:text-blue-800 transition-colors"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
