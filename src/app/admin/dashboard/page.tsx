'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Creator {
  id: string;
  name: string;
  handle: string;
  tag: string;
  img: string;
  rating: string;
  description: string;
  price: string;
  isVerified: boolean;
}

interface MonthlyData {
  month: string;
  rawEarnings: number;
  earnings: string;
  trend: string;
  height: number;
}

interface Category {
  name: string;
  count: number;
  revenue: string;
  percentage: number;
}

interface DashboardStats {
  totalUsers: number;
  totalCreators: number;
  totalNormalUsers: number;
  userGrowthTrend: string;
  creatorGrowthTrend: string;
  totalRevenue: string;
  pendingPayouts: string;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(new Date().getMonth());
  const [adminName, setAdminName] = useState<string>('Admin');

  // Pagination state for Top Creators
  const [creatorPage, setCreatorPage] = useState<number>(1);
  const creatorsPerPage = 3;

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCreators: 0,
    totalNormalUsers: 0,
    userGrowthTrend: '+0%',
    creatorGrowthTrend: '+0%',
    totalRevenue: '0 PKR',
    pendingPayouts: '0 PKR',
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topCreators, setTopCreators] = useState<Creator[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();

      if (res.ok && data.success) {
        setStats(data.stats);
        setMonthlyData(data.monthlyData || []);
        setCategories(data.categories || []);
        setTopCreators(data.topCreators || []);
        setAdminName(data.adminName || 'Admin');

        const currentMonthIndex = new Date().getMonth();
        setActiveBarIndex(currentMonthIndex < (data.monthlyData?.length || 0) ? currentMonthIndex : 0);
      } else {
        setError(data.error || 'Failed to load dashboard data');
      }
    } catch (err: any) {
      console.error('Error fetching admin dashboard:', err);
      setError('Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0012FF] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 my-8 text-center">
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Calculate paginated creators
  const totalCreatorPages = Math.ceil(topCreators.length / creatorsPerPage) || 1;
  const startIndex = (creatorPage - 1) * creatorsPerPage;
  const paginatedCreators = topCreators.slice(startIndex, startIndex + creatorsPerPage);

  const activeBar = activeBarIndex !== null && monthlyData[activeBarIndex] ? monthlyData[activeBarIndex] : null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="pb-12"
    >
      {/* Greetings */}
      <div className="mb-8">
        <p className="text-gray-500 font-sans text-sm sm:text-base mb-1">Hello {adminName}!</p>
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
                  <p className="text-2xl font-black text-[#0012FF]">{stats.totalUsers.toLocaleString()}</p>
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
                  <p className="text-2xl font-black text-[#10B981]">{stats.totalCreators.toLocaleString()}</p>
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
                  <p className="text-2xl font-black text-[#EF4444]">{stats.totalRevenue}</p>
                  <p className="text-[10px] text-gray-400">Real-time revenue</p>
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
                  <p className="text-2xl font-black text-[#F59E0B]">{stats.pendingPayouts}</p>
                  <p className="text-[10px] text-gray-400">Completed sessions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Graph using Recharts & Shadcn Card style */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-[32px] border border-gray-100 bg-white p-2 sm:p-4 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold font-sans text-black">Earnings</CardTitle>
                  <CardDescription className="text-gray-500 font-sans mt-1">
                    {activeBar
                      ? `${activeBar.month} · ${activeBar.earnings}`
                      : `Full year ${new Date().getFullYear()}`}
                  </CardDescription>
                </div>

                {/* Active Month Earnings Pill */}
                {activeBar && (
                  <div className="bg-[#EEF2FF] rounded-2xl px-4 py-2 flex items-center gap-2 self-start sm:self-center">
                    <div className="w-6 h-6 bg-[#0012FF] rounded-lg flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#0012FF]/70 font-semibold uppercase tracking-wider leading-none">Earnings</p>
                      <p className="text-sm font-bold text-[#0012FF] font-sans leading-tight">{activeBar.earnings}</p>
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="px-2 sm:px-4 pb-2">
                <ResponsiveContainer width="100%" height={288}>
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
                    barCategoryGap="18%"
                    onClick={(data) => {
                      if (data?.activeTooltipIndex !== undefined) {
                        setActiveBarIndex(Number(data.activeTooltipIndex));
                      }
                    }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      tickFormatter={(v) => (v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`)}
                      width={36}
                    />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 flex items-center gap-3 min-w-[180px]">
                            <div className="w-8 h-8 bg-[#EEF2FF] rounded-xl flex items-center justify-center flex-shrink-0">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{label} Earnings</p>
                              <p className="text-sm font-bold text-black font-sans">{d.earnings}</p>
                            </div>
                            {d.rawEarnings > 0 && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                {d.trend}
                              </span>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="rawEarnings"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={52}
                      cursor="pointer"
                    >
                      {monthlyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            activeBarIndex === null
                              ? '#0012FF'
                              : index === activeBarIndex
                              ? '#0012FF'
                              : '#E5E7EB'
                          }
                          fillOpacity={
                            activeBarIndex === null
                              ? 1
                              : index === activeBarIndex
                              ? 1
                              : 0.6
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>

              <CardFooter className="flex-row items-center justify-between border-t border-gray-100 pt-4 px-6 text-sm">
                <div className="flex items-center gap-2 font-semibold text-black leading-none font-sans text-xs">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span>Total Revenue: <span className="text-[#0012FF]">{stats.totalRevenue}</span></span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">Click any bar to see details</p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Top Categories & Top Creators */}
        <div className="space-y-8">
          {/* Top Categories Card */}
          <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-black mb-6 font-sans">Top Categories</h2>
            {categories.length === 0 ? (
              <p className="text-gray-400 text-xs py-4 text-center">No categories found yet.</p>
            ) : (
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="w-16 sm:w-20 font-semibold text-gray-600 truncate">{cat.name}</div>
                    <div className="flex-1 mx-4">
                      <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0012FF] rounded-full transition-all duration-500"
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
            )}
          </div>

          {/* Top Creators section with Pagination */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black font-sans">Top Creators</h2>

              {/* Pagination Controls */}
              {topCreators.length > creatorsPerPage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCreatorPage((prev) => Math.max(prev - 1, 1))}
                    disabled={creatorPage === 1}
                    className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <span className="text-xs font-semibold text-gray-500">
                    {creatorPage} / {totalCreatorPages}
                  </span>
                  <button
                    onClick={() => setCreatorPage((prev) => Math.min(prev + 1, totalCreatorPages))}
                    disabled={creatorPage === totalCreatorPages}
                    className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              )}
            </div>

            {topCreators.length === 0 ? (
              <p className="text-gray-400 text-xs py-4 text-center">No creators found yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {paginatedCreators.map((creator, index) => {
                  const clipId = `cardClip-admin-${creator.id || index}`;
                  return (
                    <div key={creator.id || index}>
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
                          className={`absolute top-2.5 left-3.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            creator.tag === 'Verified'
                              ? 'bg-white text-emerald-600'
                              : 'bg-white text-blue-600'
                          }`}
                        >
                          {creator.tag}
                        </span>

                        {/* Heart Icon */}
                        <button className="absolute top-2 right-0.25 z-20 flex items-center justify-center hover:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-gray-300 hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                      </div>

                      {/* Content Details */}
                      <div className="pt-3 pb-1 px-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-sans font-bold text-sm text-black flex items-center gap-1 truncate">
                            {creator.name}
                            {creator.isVerified && (
                              <svg className="w-4 h-4 text-emerald-500 fill-current flex-shrink-0" viewBox="0 0 24 24">
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
                            href="/admin/creators"
                            className="text-[10px] font-sans font-bold text-blue-600 underline hover:text-blue-800 transition-colors"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
