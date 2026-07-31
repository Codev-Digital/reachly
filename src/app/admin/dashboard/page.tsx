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
  const creatorsPerPage = 2;

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

  // Earnings chart state
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartYear, setChartYear] = useState<number>(new Date().getFullYear());
  const [chartTimeframe, setChartTimeframe] = useState<'weekly' | 'monthly'>('monthly');
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartYearDropdownOpen, setChartYearDropdownOpen] = useState(false);

  const loadEarningsChart = async (year: number, timeframe: 'weekly' | 'monthly') => {
    setLoadingChart(true);
    try {
      const res = await fetch(`/api/admin/earnings?year=${year}&timeframe=${timeframe}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChartData(data.chartData);
          setTotalEarnings(data.totalEarnings);
          const now = new Date();
          if (timeframe === 'weekly') {
            const dayIdx = (now.getDay() + 6) % 7;
            setActiveBarIndex(dayIdx);
          } else if (year === now.getFullYear()) {
            setActiveBarIndex(now.getMonth());
          } else {
            const lastNonZero = [...data.chartData].reverse().findIndex((d: any) => d.rawEarnings > 0);
            setActiveBarIndex(lastNonZero === -1 ? 11 : 11 - lastNonZero);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load earnings chart:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => { loadEarningsChart(chartYear, chartTimeframe); }, [chartYear, chartTimeframe]);

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
        setCategories(data.categories || []);
        setTopCreators(data.topCreators || []);
        setAdminName(data.adminName || 'Admin');
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

  const activeBar = activeBarIndex !== null && chartData[activeBarIndex] ? chartData[activeBarIndex] : null;

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Stats & Earnings Graph */}
        <div className="lg:col-span-7 space-y-8">
          {/* Overlapping Stats Cards Container */}
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Card 1 */}
            <div className="bg-[#BAC4FF] rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[160px]">
              <div className="w-10 h-10 shrink-0 self-start bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-white/90 font-semibold mb-0.5">Total Users</p>
                <p className="text-2xl sm:text-3xl font-black text-[#0012FF] leading-none mb-1">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-[10px] text-white flex items-center gap-1 leading-tight">
                  {stats.userGrowthTrend.startsWith('-') ? '↓' : '↑'} {stats.userGrowthTrend} from last month
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#A3E5A5] rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[160px]">
              <div className="w-10 h-10 shrink-0 self-start bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#12B76A" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-white/90 font-semibold mb-0.5">Total Creators</p>
                <p className="text-2xl sm:text-3xl font-black text-[#12B76A] leading-none mb-1">{stats.totalCreators.toLocaleString()}</p>
                <p className="text-[10px] text-white flex items-center gap-1 leading-tight">
                  {stats.creatorGrowthTrend.startsWith('-') ? '↓' : '↑'} {stats.creatorGrowthTrend} from last month
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FFADAD] rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[160px]">
              <div className="w-10 h-10 shrink-0 self-start bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-white/90 font-semibold mb-0.5">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-black text-[#EF4444] leading-none mb-1">{stats.totalRevenue}</p>
                <p className="text-[10px] text-white flex items-center gap-1 leading-tight">
                  {activeBar?.trend?.startsWith('-') ? '↓' : '↑'} {activeBar?.trend || '+0%'} from last month
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#FFE199] rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[160px]">
              <div className="w-10 h-10 shrink-0 self-start bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-white/90 font-semibold mb-0.5">Pending Payouts</p>
                <p className="text-2xl sm:text-3xl font-black text-[#F59E0B] leading-none mb-1">{stats.pendingPayouts}</p>
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
                      : `Full year ${chartYear}`}
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                  {/* Weekly / Monthly timeframe toggle */}
                  <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/60">
                    <button
                      onClick={() => setChartTimeframe('weekly')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${chartTimeframe === 'weekly'
                        ? 'bg-[#0012FF] text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setChartTimeframe('monthly')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${chartTimeframe === 'monthly'
                        ? 'bg-[#0012FF] text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      Monthly
                    </button>
                  </div>

                  {/* Year dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setChartYearDropdownOpen(!chartYearDropdownOpen)}
                      className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <span>{chartYear}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    {chartYearDropdownOpen && (
                      <div className="absolute right-0 top-[calc(100%+6px)] w-24 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                        {[2024, 2025, 2026, 2027].map((y) => (
                          <button
                            key={y}
                            onClick={() => { setChartYear(y); setChartYearDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-[#0012FF]/5 transition-colors cursor-pointer ${chartYear === y ? 'text-[#0012FF] bg-[#0012FF]/5' : 'text-gray-600'}`}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Month Earnings Pill */}
                  {activeBar && (
                    <div className="bg-[#EEF2FF] rounded-2xl px-4 py-2 flex items-center gap-2 ml-auto">
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
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {loadingChart ? (
                  <div className="w-full h-48 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#0012FF] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 10, left: -15, bottom: 0 }}
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
                        tickMargin={12}
                        axisLine={false}
                        interval={0}
                        padding={{ left: 10, right: 10 }}
                        tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        cursor={false}
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs z-50">
                              <p className="font-bold text-gray-800 mb-1">{label}</p>
                              <p className="text-[#0012FF] font-bold text-sm">{d.earnings}</p>
                              {d.trend && (
                                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
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
                        {chartData.map((entry, index) => (
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
                )}
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 border-t border-gray-100 pt-4 px-4 sm:px-6 text-sm">
                <div className="flex items-center gap-2 font-semibold text-black leading-none font-sans text-xs sm:text-sm">
                  <TrendingUp className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="truncate">Total Revenue: <span className="text-[#0012FF]">{stats.totalRevenue}</span></span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 font-sans mt-1 sm:mt-0">Click any bar to see details</p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Top Categories & Top Creators */}
        <div className="lg:col-span-5 space-y-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedCreators.map((creator, index) => {
                  const clipId = `cardClip-admin-${creator.id || index}`;
                  return (
                    <div key={creator.id || index} className="group cursor-pointer">
                      {/* Top Image Container */}
                      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-[24px] mb-4 shadow-sm">
                        <img
                          src={creator.img}
                          alt={creator.name}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Top Left Badge */}
                        <span
                          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-sm ${
                            creator.tag === 'Verified'
                              ? 'bg-white text-[#12B76A]'
                              : 'bg-white text-[#0012FF]'
                          }`}
                        >
                          {creator.tag}
                        </span>

                        {/* Heart Icon */}
                        <button className="absolute top-4 right-4 z-20 flex items-center justify-center hover:scale-110 transition-transform bg-transparent">
                          <svg className="w-6 h-6 text-white drop-shadow-md hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                      </div>

                      {/* Content Details */}
                      <div className="px-1 text-left space-y-1">
                        {/* Title & Rating */}
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-base sm:text-base text-black font-sans flex items-center gap-1.5 leading-tight truncate">
                            <span>{creator.name}</span>
                            {creator.isVerified && (
                              <svg className="w-4 h-4 text-[#12B76A] fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            )}
                          </h3>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                            ★ {creator.rating}
                          </span>
                        </div>

                        {/* Handle & Bio */}
                        <p className="text-xs text-gray-400 font-medium font-sans">{creator.handle}</p>
                        <p className="text-xs text-gray-400 font-sans leading-relaxed line-clamp-2 pt-1">
                          {creator.description}
                        </p>

                        {/* Price Row */}
                        <div className="pt-3 flex items-center gap-1 text-xs text-gray-400 font-sans">
                          <span>Starting from</span>
                          <strong className="text-black font-black text-sm ml-1">
                            {creator.price}
                          </strong>
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
