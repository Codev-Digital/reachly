'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import LoadingAnimation from '@/components/LoadingAnimation';
import { TrendingUp, BookOpen, Calendar, Eye, Users, Copy, Check } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
} from "@/components/ui/chart";

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
  const [username, setUsername] = useState<string>('');
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 2));
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Earnings chart state
  const [chartData, setChartData] = useState<{ month: string; earnings: number; bookings: number }[]>([]);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const [chartYear, setChartYear] = useState<number>(new Date().getFullYear());
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartYearDropdownOpen, setChartYearDropdownOpen] = useState(false);

  // Real stats & bookings state
  const [dashboardStats, setDashboardStats] = useState({
    totalBookingsThisMonth: 0,
    upcomingSessions: 0,
    profileViews: 0,
    totalCustomers: 0,
  });
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Reschedule & Cancel Modal States
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<any | null>(null);

  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<any | null>(null);

  const [rescheduleDate, setRescheduleDate] = useState<Date>(new Date());
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState<string>('');

  // Success Modal States
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalType, setSuccessModalType] = useState<'cancelled' | 'rescheduled'>('cancelled');

  const handleCopyLink = () => {
    const linkStr = window.location.origin + `/creators/${username || displayName.toLowerCase().replace(/\s+/g, '-')}`;
    navigator.clipboard.writeText(linkStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const chartConfig = {
    earnings: {
      label: "Earnings (PKR)",
      color: "#0012FF",
    },
  } satisfies ChartConfig;

  // Fetch real earnings chart data
  const loadEarningsChart = async (year: number) => {
    setLoadingChart(true);
    try {
      const res = await fetch(`/api/creators/earnings?year=${year}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChartData(data.chartData);
          setTotalEarnings(data.totalEarnings);
          // Default active bar to current month if same year, else last non-zero month
          const now = new Date();
          if (year === now.getFullYear()) {
            setActiveBarIndex(now.getMonth());
          } else {
            const lastNonZero = [...data.chartData].reverse().findIndex((d: any) => d.earnings > 0);
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

  useEffect(() => { loadEarningsChart(chartYear); }, [chartYear]);

  // Helper to load fresh stats & bookings
  const loadDashboardData = async () => {
    try {
      const statsRes = await fetch('/api/creators/dashboard');
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.success) {
          setDashboardStats(data.stats);
          setBookingsList(data.bookings || []);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  // Load profile and dashboard stats
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch Profile
        const profileRes = await fetch('/api/user/me');
        if (profileRes.ok) {
          const data = await profileRes.json();
          const name = data.creatorProfile?.displayName || data.user?.name || '';
          const photo = data.creatorProfile?.profilePhoto || null;
          setDisplayName(name);
          setProfilePhoto(photo);
          setUsername(data.creatorProfile?.username || '');
        }

        await loadDashboardData();
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // Fetch reschedule slots when date changes
  useEffect(() => {
    if (!showRescheduleModal || !username) return;

    async function fetchRescheduleSlots() {
      setLoadingSlots(true);
      setSelectedRescheduleTime('');
      try {
        const year = rescheduleDate.getFullYear();
        const month = String(rescheduleDate.getMonth() + 1).padStart(2, '0');
        const day = String(rescheduleDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const res = await fetch(`/api/creators/${username}/availability?date=${dateStr}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.slots) {
            setRescheduleSlots(data.slots);
          } else {
            setRescheduleSlots([]);
          }
        }
      } catch (err) {
        console.error(err);
        setRescheduleSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchRescheduleSlots();
  }, [rescheduleDate, showRescheduleModal, username]);

  const handleCancelClick = (booking: any) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    try {
      const res = await fetch(`/api/creators/bookings/${bookingToCancel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        setBookingsList((prev) => prev.filter((b) => b.id !== bookingToCancel.id));
        setSuccessModalType('cancelled');
        setShowSuccessModal(true);
        // Refresh metrics
        await loadDashboardData();
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (err) {
      alert('Error cancelling appointment');
    } finally {
      setShowCancelModal(false);
      setBookingToCancel(null);
    }
  };

  const handleRescheduleClick = (booking: any) => {
    setBookingToReschedule(booking);
    setRescheduleDate(booking.scheduledDate ? new Date(booking.scheduledDate) : new Date());
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async () => {
    if (!bookingToReschedule || !selectedRescheduleTime) {
      alert('Please select a new time slot');
      return;
    }
    try {
      const year = rescheduleDate.getFullYear();
      const month = String(rescheduleDate.getMonth() + 1).padStart(2, '0');
      const day = String(rescheduleDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const res = await fetch(`/api/creators/bookings/${bookingToReschedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedDate: dateStr,
          selectedTime: selectedRescheduleTime,
        })
      });
      if (res.ok) {
        setSuccessModalType('rescheduled');
        setShowSuccessModal(true);
        await loadDashboardData();
      } else {
        alert('Failed to reschedule appointment');
      }
    } catch (err) {
      alert('Error rescheduling appointment');
    } finally {
      setShowRescheduleModal(false);
      setBookingToReschedule(null);
    }
  };

  const getRescheduleDays = () => {
    const list = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(d);
    }
    return list;
  };

  const stats = [
    { 
      label: 'Total Bookings this month', 
      value: String(dashboardStats.totalBookingsThisMonth), 
      trend: '+18.2% from last month',
      bg: '#AFE8B9', 
      textColor: '#0A4A1C',
      icon: BookOpen 
    },
    { 
      label: 'Upcoming Sessions', 
      value: String(dashboardStats.upcomingSessions), 
      trend: '+5.4% from last month',
      bg: '#FFEDB5', 
      textColor: '#6C4800',
      icon: Calendar 
    },
    { 
      label: 'Profile Views', 
      value: String(dashboardStats.profileViews), 
      trend: '+24.1% from last month',
      bg: '#FFB3B3', 
      textColor: '#701C1C',
      icon: Eye 
    },
    { 
      label: 'Total Customers', 
      value: String(dashboardStats.totalCustomers), 
      trend: '+12.8% from last month',
      bg: '#B7C0FF', 
      textColor: '#000A7D',
      icon: Users 
    },
  ];

  // Helper to render booking cards in the original vertical format
  const renderBookingCard = (booking: any, index: number) => (
    <motion.div
      key={booking.id}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 + index * 0.05 }}
      className="relative w-full bg-white rounded-3xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[180px]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 relative">
            <Image 
              src={booking.avatar} 
              alt={booking.name} 
              className="w-full h-full object-cover" 
              width={44} 
              height={44} 
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-black leading-tight">{booking.name}</h3>
            <p className="text-xs text-gray-500">{booking.handle}</p>
          </div>
        </div>
        <p className="font-bold text-sm text-[#0012FF] whitespace-nowrap">{booking.amount}</p>
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#0012FF]" />
          <span>{booking.time}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            {booking.type === 'In-person' ? (
              <div className="w-2 h-2 rounded-full bg-[#0012FF]" />
            ) : (
              <div className="w-2.5 h-2 bg-[#0012FF] rounded-sm" />
            )}
          </div>
          <span className="font-medium text-gray-700 capitalize">{booking.type}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4 line-clamp-2 pr-2 leading-relaxed">
        {booking.note}
      </p>

      <div className="w-full h-px bg-gray-100 mb-4"></div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleRescheduleClick(booking)}
          className="flex-grow py-2 border border-[#0012FF] text-[#0012FF] hover:bg-[#0012FF]/5 rounded-xl text-xs font-semibold bg-white transition-all active:scale-98 cursor-pointer"
        >
          Reschedule
        </button>
        <button 
          onClick={() => handleCancelClick(booking)}
          className="flex-grow py-2 border border-red-200 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all active:scale-98 cursor-pointer"
        >
          Cancel Appointment
        </button>
      </div>

      {/* Top-right corner arrow link icon */}
      <div className="absolute right-4 top-4 text-gray-300 hover:text-[#0012FF] transition-colors cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 17L17 7M17 7H10M17 7V14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  );

  // Filter bookings based on Month / Year selectors
  const filteredBookingsList = bookingsList.filter((booking) => {
    if (!booking.scheduledDate) return false;
    const date = new Date(booking.scheduledDate);
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  });

  const columnBookings = filteredBookingsList.slice(0, 2);
  const extraBookings = filteredBookingsList.slice(2);

  if (loadingData) return <LoadingAnimation />;

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      {/* Main Content Area - Constrained Max Width */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-gray-500 font-sans mb-1 text-sm sm:text-base">{getGreeting()}, {displayName ? displayName.split(' ')[0] : 'there'}!</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-sans tracking-tight">
              You Have <span className="text-[#0012FF]">{dashboardStats.upcomingSessions} Appointments</span> <span className="text-gray-400 font-normal text-base sm:text-lg">/ Scheduled</span>
            </h1>
          </div>

          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-[#0012FF] text-white px-5 py-3 rounded-2xl font-semibold text-sm sm:text-base hover:bg-[#0012FF]/90 transition-all shadow-md active:scale-95 w-fit cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Booking Link'}
          </button>
        </div>

        {/* Stats Row - Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-40 transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default"
                style={{ backgroundColor: stat.bg, color: stat.textColor }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold opacity-75 uppercase tracking-wider mb-1 font-sans">{stat.label}</span>
                    <span className="text-3xl font-bold tracking-tight font-sans">{stat.value}</span>
                  </div>
                  <div className="w-12 h-12 bg-white/40 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm">
                    <Icon className="h-6 w-6" style={{ color: stat.textColor }} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium opacity-85">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{stat.trend}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Split Layout: Chart (Left) & Bookings List (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Earnings Chart Section */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="rounded-3xl border border-gray-200 bg-white p-2 sm:p-4 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold font-sans text-black">Earnings</CardTitle>
                    <CardDescription className="text-gray-500 font-sans mt-1">
                      {activeBarIndex !== null && chartData[activeBarIndex]
                        ? `${chartData[activeBarIndex].month} ${chartYear} · ${chartData[activeBarIndex].bookings} booking${chartData[activeBarIndex].bookings !== 1 ? 's' : ''}`
                        : `Full year ${chartYear}`}
                    </CardDescription>
                  </div>

                  {/* Right: Total + Year Selector */}
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    {/* Active Month Earnings Pill */}
                    {activeBarIndex !== null && chartData[activeBarIndex] && (
                      <div className="bg-[#EEF2FF] rounded-2xl px-4 py-2 flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#0012FF] rounded-lg flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#0012FF]/70 font-semibold uppercase tracking-wider leading-none">Earnings</p>
                          <p className="text-sm font-bold text-[#0012FF] font-sans leading-tight">{chartData[activeBarIndex].earnings.toLocaleString()} PKR</p>
                        </div>
                      </div>
                    )}

                    {/* Year Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setChartYearDropdownOpen(!chartYearDropdownOpen)}
                        className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer"
                      >
                        <span>{chartYear}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                      </button>
                      {chartYearDropdownOpen && (
                        <div className="absolute right-0 top-[calc(100%+6px)] w-24 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
                          {[2024, 2025, 2026, 2027].map((y) => (
                            <button
                              key={y}
                              onClick={() => { setChartYear(y); setChartYearDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#0012FF]/5 transition-colors cursor-pointer ${chartYear === y ? 'text-[#0012FF] bg-[#0012FF]/5' : 'text-gray-600'}`}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-2 sm:px-4 pb-2">
                  {loadingChart ? (
                    <div className="w-full h-72 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-[#0012FF] border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-gray-400 font-sans">Loading earnings…</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={288}>
                      <BarChart
                        data={chartData}
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
                          tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`}
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
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{label} Earnings</p>
                                  <p className="text-sm font-bold text-black font-sans">{d.earnings.toLocaleString()} PKR</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{d.bookings} booking{d.bookings !== 1 ? 's' : ''}</p>
                                </div>
                                {d.earnings > 0 && (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    ✓
                                  </span>
                                )}
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="earnings"
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

                <CardFooter className="flex-row items-center justify-between border-t border-gray-100 pt-4 px-6 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-black leading-none font-sans text-xs">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span>Total {chartYear}: <span className="text-[#0012FF]">{totalEarnings.toLocaleString()} PKR</span></span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-sans">Click any bar to see details</p>
                </CardFooter>
              </Card>
            </motion.div>
          </div>

          {/* Bookings Section (Right Column - Max 2 Cards) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-black font-sans">Upcoming Bookings</h2>
              
              {/* Month / Year Selectors */}
              <div className="flex items-center gap-2">
                {/* Month Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setMonthDropdownOpen(!monthDropdownOpen); setYearDropdownOpen(false); }}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer"
                  >
                    <span>{currentDate.toLocaleString('default', { month: 'short' })}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {monthDropdownOpen && (
                    <div className="absolute right-0 top-[calc(100%+6px)] w-36 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-[50] max-h-60 overflow-y-auto">
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                        <button
                          key={m}
                          onClick={() => selectMonth(idx)}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#0012FF]/5 transition-colors cursor-pointer ${currentDate.getMonth() === idx ? 'text-[#0012FF] bg-[#0012FF]/5' : 'text-gray-600'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setYearDropdownOpen(!yearDropdownOpen); setMonthDropdownOpen(false); }}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer"
                  >
                    <span>{currentDate.getFullYear()}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {yearDropdownOpen && (
                    <div className="absolute right-0 top-[calc(100%+6px)] w-24 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-[50]">
                      {[2024, 2025, 2026, 2027, 2028, 2029].map((y) => (
                        <button
                          key={y}
                          onClick={() => selectYear(y)}
                          className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#0012FF]/5 transition-colors cursor-pointer ${currentDate.getFullYear() === y ? 'text-[#0012FF] bg-[#0012FF]/5' : 'text-gray-600'}`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bookings Stack */}
            <div className="space-y-4">
              {filteredBookingsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white rounded-[2rem] border border-gray-200 shadow-sm">
                  <div className="relative w-40 h-40 mb-4 opacity-90">
                    <Image
                      src="/assets/no-appointment.png"
                      alt="No bookings till now"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-base font-extrabold text-black font-sans mb-1">No bookings till now</h3>
                  <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
                    No sessions scheduled for this month. Choose another date in the selector above or share your booking link.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {columnBookings.map((booking, idx) => renderBookingCard(booking, idx))}
                  </div>

                  {filteredBookingsList.length > 2 && (
                    <div className="pt-2">
                      <Link
                        href="/creators/calendar"
                        className="w-full block text-center bg-white border border-[#0012FF] hover:bg-[#0012FF] hover:text-white text-[#0012FF] font-bold py-3 rounded-2xl text-xs transition-all shadow-sm cursor-pointer"
                      >
                        Show All
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>

        {/* Extra Bookings Section - Placed Below the Split Grid if bookings > 2 */}
        {filteredBookingsList.length > 2 && (
          <div className="mt-10 border-t border-gray-150 pt-8 space-y-6">
            <h2 className="text-2xl font-bold text-black font-sans">More Upcoming Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {extraBookings.map((booking, idx) => renderBookingCard(booking, idx + 2))}
            </div>
          </div>
        )}

      </main>

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="relative overflow-visible w-full max-w-lg flex flex-col items-center px-5 sm:px-7 lg:px-8 pt-10 sm:pt-12 pb-6 sm:pb-8 z-10">
            {/* SVG Background */}
            <img
              src="/assets/cancel-card.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
            />

            {/* Close Button */}
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute -top-1 sm:-top-3 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-55 transition-all z-20 cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Illustration */}
            <div className="w-24 sm:w-36 md:w-44 lg:w-56 mt-2 sm:mt-3 mb-3 sm:mb-4">
              <Image
                src="/assets/cancel-appointment.png"
                alt="Cancel Appointment"
                width={240}
                height={170}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black text-center mb-2">
              Cancel Appointment
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-500 text-center mb-5 sm:mb-6">
              Are you sure you want to cancel this booking with <strong className="text-gray-800 font-semibold">{bookingToCancel?.name}</strong>?
            </p>

            {/* Actions */}
            <div className="flex justify-center gap-3 w-full">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-6 sm:px-8 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-55 transition-all bg-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmCancel}
                className="px-6 sm:px-8 py-2 sm:py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="relative w-full max-w-lg flex flex-col items-center justify-between p-4 sm:p-8 pt-14 sm:pt-16 pb-8 sm:pb-10 min-h-[450px] sm:min-h-[520px] z-10">
            {/* SVG Background notched card */}
            <img
              src="/assets/cancel-card.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
            />
            {/* Close Button */}
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute -top-6 sm:-top-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-55 transition-all z-20 border border-gray-100/50 cursor-pointer text-gray-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="flex flex-col items-center w-full flex-grow pt-3">
              <h3 className="text-lg sm:text-[22px] font-bold text-black mb-1">Reschedule Appointment</h3>
              <p className="text-gray-500 text-center mb-4 sm:mb-6 text-xs sm:text-[13px]">
                Choose a new slot for your appointment with <strong className="text-gray-700">{bookingToReschedule?.name}</strong>.
              </p>

              {/* Next 14 Days Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full no-scrollbar pb-3 mb-4 sm:mb-6 border-b border-gray-100">
                {getRescheduleDays().map((d, idx) => {
                  const isSelected = rescheduleDate.getDate() === d.getDate() &&
                    rescheduleDate.getMonth() === d.getMonth() &&
                    rescheduleDate.getFullYear() === d.getFullYear();

                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = String(d.getDate()).padStart(2, '0');

                  return (
                    <button
                      key={idx}
                      onClick={() => setRescheduleDate(d)}
                      className={`flex flex-col items-center justify-center min-w-[48px] py-1.5 rounded-xl text-xs transition-all border shrink-0 cursor-pointer ${isSelected
                        ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF] font-bold'
                        : 'border-gray-200 text-gray-400 hover:bg-gray-50 bg-white'
                        }`}
                    >
                      <span className="text-[8px] uppercase font-bold mb-0.5">{dayName}</span>
                      <span className="text-xs sm:text-sm font-black">{dayNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time Slots Grid */}
              <div className="w-full mb-3">
                {loadingSlots ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-9 sm:h-10 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : rescheduleSlots.length === 0 ? (
                  <p className="text-gray-400 text-center text-xs sm:text-sm">No slots available on this date.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-28 sm:max-h-48 overflow-y-auto pr-1 no-scrollbar">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedRescheduleTime(slot)}
                        className={`py-1.5 px-1 border rounded-xl text-[11px] sm:text-xs font-semibold text-center transition-all cursor-pointer ${selectedRescheduleTime === slot
                          ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF]'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-55 bg-white'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 py-1 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmReschedule}
                  disabled={!selectedRescheduleTime}
                  className="flex-1 py-1 bg-[#0012FF] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#0010d0] transition-all disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal (Cancelled or Rescheduled) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="relative overflow-visible w-full max-w-lg flex flex-col items-center px-5 sm:px-7 lg:px-8 pt-10 sm:pt-12 pb-6 sm:pb-8 z-10">
            {/* SVG Background */}
            <img
              src="/assets/cancel-card.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
            />

            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-50 transition-all z-20 cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Illustration */}
            <div className="w-24 sm:w-36 md:w-44 lg:w-56 mt-2 sm:mt-3 mb-3 sm:mb-4">
              <Image
                src={
                  successModalType === "cancelled"
                    ? "/assets/cancel-appointment.png"
                    : "/assets/reschedule.png"
                }
                alt={
                  successModalType === "cancelled"
                    ? "Booking Cancelled"
                    : "Booking Rescheduled"
                }
                width={240}
                height={170}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black text-center mb-2">
              {successModalType === "cancelled"
                ? "Booking Cancelled"
                : "Booking Rescheduled"}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-550 text-center mb-5 sm:mb-6">
              {successModalType === "cancelled"
                ? "Your booking has been cancelled successfully."
                : "Your booking has been rescheduled successfully."}
            </p>

            {/* Action */}
            <div className="flex justify-center w-full">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-32 sm:w-36 py-2 sm:py-2.5 bg-[#0012FF] text-white rounded-xl text-sm font-semibold hover:bg-[#0010d0] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;
