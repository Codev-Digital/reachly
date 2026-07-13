'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import LoadingAnimation from '@/components/LoadingAnimation';
import { TrendingUp, BookOpen, Calendar, Eye, Users, Copy, Check } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
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
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 2)); // Default to August 2, 2026
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real stats & bookings state
  const [dashboardStats, setDashboardStats] = useState({
    totalBookingsThisMonth: 0,
    upcomingSessions: 0,
    profileViews: 0,
    totalCustomers: 0,
  });
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const handleCopyLink = () => {
    const linkStr = window.location.origin + `/creators/${displayName.toLowerCase().replace(/\s+/g, '-')}`;
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

  const monthlyChartData = [
    { month: 'Jan', earnings: 15000 },
    { month: 'Feb', earnings: 58000 },
    { month: 'Mar', earnings: 35000 },
    { month: 'Apr', earnings: 32000 },
    { month: 'May', earnings: 35000 },
    { month: 'Jun', earnings: 30000 },
    { month: 'Jul', earnings: 28000 },
    { month: 'Aug', earnings: 15000 },
    { month: 'Sep', earnings: 28000 },
    { month: 'Oct', earnings: 15000 },
    { month: 'Nov', earnings: 35000 },
    { month: 'Dec', earnings: 52000 },
  ];

  const chartConfig = {
    earnings: {
      label: "Earnings (PKR)",
      color: "#0012FF",
    },
  } satisfies ChartConfig;

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
        }

        // Fetch Dashboard Stats & Bookings
        const statsRes = await fetch('/api/creators/dashboard');
        if (statsRes.ok) {
          const data = await statsRes.json();
          if (data.success) {
            setDashboardStats(data.stats);
            setBookingsList(data.bookings || []);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

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
        <button className="flex-grow py-2 border border-[#0012FF] text-[#0012FF] hover:bg-[#0012FF]/5 rounded-xl text-xs font-semibold bg-white transition-all active:scale-98 cursor-pointer">
          Reschedule
        </button>
        <button className="flex-grow py-2 border border-red-100 rounded-xl text-xs font-semibold text-red-500 bg-red-550 hover:bg-red-700 transition-all active:scale-98 cursor-pointer">
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

  const columnBookings = bookingsList.slice(0, 2);
  const extraBookings = bookingsList.slice(2);

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
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold font-sans text-black">Earnings Overview</CardTitle>
                    <CardDescription className="text-gray-500 font-sans mt-1">Monthly breakdown of your income</CardDescription>
                  </div>
                  
                  {/* Period Filter */}
                  <div className="flex bg-gray-100 p-1 rounded-2xl self-start sm:self-center">
                    {['daily', 'weekly', 'monthly'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setActivePeriod(period as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                          activePeriod === period
                            ? 'bg-[#0012FF] text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="px-2 sm:px-6">
                  <ChartContainer config={chartConfig} className="w-full h-80 min-h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
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
                          tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <ChartTooltip
                          cursor={{ fill: 'rgba(0, 18, 255, 0.04)', radius: 8 }}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar 
                          dataKey="earnings" 
                          name="Earnings"
                          fill="#0012FF" 
                          radius={[6, 6, 0, 0]} 
                          maxBarSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>

                <CardFooter className="flex-row items-center justify-between border-t border-gray-100 pt-6 px-6 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-black leading-none font-sans">
                    <span>Trending up by 15.2% this month</span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-xs text-gray-400 font-sans">
                    Showing data for year 2026
                  </div>
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
              {bookingsList.length === 0 ? (
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
                    When clients start scheduling sessions with you, they will appear right here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {columnBookings.map((booking, idx) => renderBookingCard(booking, idx))}
                  </div>

                  {bookingsList.length > 2 && (
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
        {bookingsList.length > 2 && (
          <div className="mt-10 border-t border-gray-150 pt-8 space-y-6">
            <h2 className="text-2xl font-bold text-black font-sans">More Upcoming Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {extraBookings.map((booking, idx) => renderBookingCard(booking, idx + 2))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default CreatorDashboard;
