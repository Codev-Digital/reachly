'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import LoadingAnimation from '@/components/LoadingAnimation';
import DaysOfMonth from '@/components/DaysOfMonth';
import { TrendingUp, BookOpen, Calendar, Eye, Users, Copy, Check, Bookmark, Target, Presentation, Star, CheckCircle, Video, MessageSquare, VideoOff } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import DailyCall from '@/components/DailyCall';
import SessionReviewModal, {
  type SessionReviewTarget,
} from '@/components/booking/SessionReviewModal';
import { isMeetingPassed } from '@/lib/time';
import { fromISODate, toISODate } from '@/lib/eventTicketing';
import { parse12h } from '@/lib/slots';
import { useCreatorJoinNudge } from '@/hooks/useCreatorJoinNudge';

/** Prefer API scheduledDateIso (UTC-safe); fall back to UTC parts of scheduledDate. */
function bookingDateIso(booking: { scheduledDateIso?: string; scheduledDate?: string | Date }) {
  if (booking.scheduledDateIso && /^\d{4}-\d{2}-\d{2}$/.test(booking.scheduledDateIso)) {
    return booking.scheduledDateIso;
  }
  if (!booking.scheduledDate) return '';
  const d = new Date(booking.scheduledDate);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [copied, setCopied] = useState(false);

  // Real stats & bookings state
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 0,
    totalBookingsThisMonth: 0,
    upcomingSessions: 0,
    profileViews: 0,
    totalCustomers: 0,
  });
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Synchronously load from sessionStorage cache on mount to bypass skeleton loading
  useEffect(() => {
    try {
      const cachedCreatorDashboard = sessionStorage.getItem('reachly_creator_dashboard_cache');
      if (cachedCreatorDashboard) {
        const cached = JSON.parse(cachedCreatorDashboard);
        if (cached.displayName) setDisplayName(cached.displayName);
        if (cached.profilePhoto) setProfilePhoto(cached.profilePhoto);
        if (cached.username) setUsername(cached.username);
        if (cached.dashboardStats) setDashboardStats(cached.dashboardStats);
        if (cached.bookingsList) setBookingsList(cached.bookingsList);
        setLoadingData(false);
      }
    } catch (e) {
      console.error('Failed to load creator dashboard cache:', e);
    }
  }, []);

  // Earnings chart state
  const [chartData, setChartData] = useState<{ month: string; earnings: number; bookings: number }[]>([]);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const [chartYear, setChartYear] = useState<number>(new Date().getFullYear());
  const [chartTimeframe, setChartTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartYearDropdownOpen, setChartYearDropdownOpen] = useState(false);

  // Reschedule & Cancel Modal States
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<any | null>(null);

  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<any | null>(null);
  const [isRescheduleSuccess, setIsRescheduleSuccess] = useState<boolean>(false);

  const [rescheduleDate, setRescheduleDate] = useState<Date>(new Date());
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState<string>('');

  // Success Modal States
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalType, setSuccessModalType] = useState<'cancelled' | 'rescheduled'>('cancelled');

  // Meeting Modal States
  const [meetingToJoin, setMeetingToJoin] = useState<{
    id: string;
    url: string;
    ref: string;
    peerName: string;
    durationMins: number;
    meetingEndsAt?: string | null;
  } | null>(null);
  const [activeCallUrl, setActiveCallUrl] = useState<string | null>(null);
  const [startingMeeting, setStartingMeeting] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<SessionReviewTarget | null>(null);

  const handleCreatorStartMeeting = async () => {
    if (!meetingToJoin || startingMeeting) return;
    setStartingMeeting(true);
    try {
      const res = await fetch(`/api/creators/bookings/${meetingToJoin.id || meetingToJoin.ref}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startMeeting: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || 'Could not start the meeting.');
        return;
      }
      const endsAt = data.meeting?.meetingEndsAt || data.meetingEndsAt || null;
      if (!endsAt) {
        alert('Could not start the session timer. Please try Join again.');
        return;
      }
      setMeetingToJoin((prev) =>
        prev
          ? {
              ...prev,
              meetingEndsAt: String(endsAt),
              durationMins:
                data.meeting?.totalMeetingMins ||
                data.totalMeetingMins ||
                prev.durationMins,
            }
          : prev
      );
      // Timer + user join unlock only after this startMeeting succeeds
      setActiveCallUrl(meetingToJoin.url);
    } catch (err) {
      console.error(err);
      alert('Could not start the meeting.');
    } finally {
      setStartingMeeting(false);
    }
  };

  useCreatorJoinNudge({
    waitingToJoin: Boolean(meetingToJoin && !activeCallUrl),
    starting: startingMeeting,
    bookingId: meetingToJoin?.id || meetingToJoin?.ref || null,
    onAutoJoin: () => {
      void handleCreatorStartMeeting();
    },
  });

  const markBookingReviewed = (bookingId: string) => {
    setBookingsList((prev) =>
      prev.map((b) =>
        String(b.id) === String(bookingId)
          ? { ...b, hasReviewed: true, meetingEnded: true, meetingStarted: true, status: 'completed' }
          : b
      )
    );
    setReviewTarget(null);
  };

  const openReviewForBooking = (booking: any) => {
    setReviewTarget({
      bookingId: String(booking.id),
      peerName: booking.name || 'your client',
      durationMins: Number(booking.durationMins) || 15,
    });
  };

  const handleCreatorLeaveMeeting = (
    reason?: 'left' | 'ended' | 'timeout' | 'unavailable'
  ) => {
    const ctx = meetingToJoin;
    setActiveCallUrl(null);
    setMeetingToJoin(null);
    // Review only after a real in-call end — not when join never happened
    const showReview =
      reason === 'ended' || reason === 'timeout' || reason === 'left';
    if (ctx?.id && showReview) {
      setBookingsList((prev) =>
        prev.map((b) =>
          String(b.id) === String(ctx.id)
            ? { ...b, meetingEnded: true, meetingStarted: true, status: 'completed' }
            : b
        )
      );
      setReviewTarget({
        bookingId: String(ctx.id),
        peerName: ctx.peerName || 'your client',
        durationMins: ctx.durationMins || 15,
      });
    }
  };

  const handleCopyLink = () => {
    const linkStr = window.location.origin + `/creators/${username || displayName.toLowerCase().replace(/\s+/g, '-')}`;
    navigator.clipboard.writeText(linkStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartConfig = {
    earnings: {
      label: "Earnings (PKR)",
      color: "#0012FF",
    },
  } satisfies ChartConfig;

  // Fetch real earnings chart data
  const loadEarningsChart = async (year: number, timeframe: 'weekly' | 'monthly') => {
    setLoadingChart(true);
    try {
      const res = await fetch(`/api/creators/earnings?year=${year}&timeframe=${timeframe}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChartData(data.chartData);
          setTotalEarnings(data.totalEarnings);
          const now = new Date();
          const lastNonZero = [...data.chartData].reverse().findIndex((d: any) => d.earnings > 0);
          const maxIdx = data.chartData.length - 1;
          const targetIndex = lastNonZero === -1 ? -1 : maxIdx - lastNonZero;

          if (timeframe === 'weekly') {
            const currentDayIdx = (now.getDay() + 6) % 7;
            setActiveBarIndex(targetIndex !== -1 ? targetIndex : currentDayIdx);
          } else if (year === now.getFullYear()) {
            setActiveBarIndex(targetIndex !== -1 ? targetIndex : now.getMonth());
          } else {
            setActiveBarIndex(targetIndex !== -1 ? targetIndex : maxIdx);
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

  const writeDashboardCache = (patch: {
    displayName?: string;
    profilePhoto?: string | null;
    username?: string;
    dashboardStats?: typeof dashboardStats;
    bookingsList?: any[];
  }) => {
    try {
      const prevRaw = sessionStorage.getItem('reachly_creator_dashboard_cache');
      const prev = prevRaw ? JSON.parse(prevRaw) : {};
      sessionStorage.setItem(
        'reachly_creator_dashboard_cache',
        JSON.stringify({
          displayName: patch.displayName ?? prev.displayName ?? '',
          profilePhoto: patch.profilePhoto !== undefined ? patch.profilePhoto : prev.profilePhoto ?? null,
          username: patch.username ?? prev.username ?? '',
          dashboardStats: patch.dashboardStats ?? prev.dashboardStats ?? null,
          bookingsList: patch.bookingsList ?? prev.bookingsList ?? [],
        })
      );
    } catch (e) {
      /* ignore quota / private mode */
    }
  };

  // Helper to load fresh stats & bookings
  const loadDashboardData = async () => {
    try {
      const statsRes = await fetch('/api/creators/dashboard', { cache: 'no-store' });
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.success) {
          const list = data.bookings || [];
          setDashboardStats(data.stats);
          setBookingsList(list);
          jumpToNearestBookingDay(list);
          writeDashboardCache({
            dashboardStats: data.stats,
            bookingsList: list,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  // Load profile and dashboard stats once on mount (avoid refetch races from profile state deps)
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch('/api/user/me', { cache: 'no-store' }),
          fetch('/api/creators/dashboard', { cache: 'no-store' }),
        ]);

        let nextName = '';
        let nextPhoto: string | null = null;
        let nextUsername = '';

        if (profileRes.ok) {
          const data = await profileRes.json();
          nextName = data.creatorProfile?.displayName || data.user?.name || '';
          nextPhoto = data.creatorProfile?.profilePhoto || null;
          nextUsername = data.creatorProfile?.username || '';
          if (!cancelled) {
            setDisplayName(nextName);
            setProfilePhoto(nextPhoto);
            setUsername(nextUsername);
          }
        }

        if (statsRes.ok) {
          const data = await statsRes.json();
          if (data.success && !cancelled) {
            const list = data.bookings || [];
            setDashboardStats(data.stats);
            setBookingsList(list);
            jumpToNearestBookingDay(list);
            writeDashboardCache({
              displayName: nextName,
              profilePhoto: nextPhoto,
              username: nextUsername,
              dashboardStats: data.stats,
              bookingsList: list,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const didAutoJumpDate = useRef(false);

  const jumpToNearestBookingDay = (list: any[]) => {
    if (didAutoJumpDate.current || !list.length) return;
    didAutoJumpDate.current = true;

    const todayIso = toISODate(new Date());
    const hasToday = list.some((b) => bookingDateIso(b) === todayIso);
    if (hasToday) return;

    const upcomingIsos = list
      .map((b) => bookingDateIso(b))
      .filter((iso: string) => iso && iso >= todayIso)
      .sort();
    if (upcomingIsos[0]) {
      setCurrentDate(fromISODate(upcomingIsos[0]));
      return;
    }

    const pastIsos = list
      .map((b) => bookingDateIso(b))
      .filter(Boolean)
      .sort();
    const last = pastIsos[pastIsos.length - 1];
    if (last) setCurrentDate(fromISODate(last));
  };

  // Fetch reschedule slots when date changes
  useEffect(() => {
    if (!showRescheduleModal) return;

    async function fetchRescheduleSlots() {
      setLoadingSlots(true);
      setSelectedRescheduleTime('');
      try {
        let activeUsername = username;
        if (!activeUsername) {
          const profileRes = await fetch('/api/user/me');
          if (profileRes.ok) {
            const data = await profileRes.json();
            activeUsername = data.creatorProfile?.username || '';
            if (activeUsername) setUsername(activeUsername);
          }
        }

        if (activeUsername) {
          const year = rescheduleDate.getFullYear();
          const month = String(rescheduleDate.getMonth() + 1).padStart(2, '0');
          const day = String(rescheduleDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;

          const res = await fetch(`/api/creators/${activeUsername}/availability?date=${dateStr}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.slots)) {
              setRescheduleSlots(data.slots);
            } else {
              setRescheduleSlots([]);
            }
          }
        } else {
          setRescheduleSlots([]);
        }
      } catch (err) {
        console.error('Failed to fetch reschedule slots:', err);
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
        setBookingsList((prev) => prev.map((b) => b.id === bookingToCancel.id ? { ...b, status: 'cancelled' } : b));
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
    setIsRescheduleSuccess(false);
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
        setIsRescheduleSuccess(true);
        await loadDashboardData();
      } else {
        alert('Failed to reschedule appointment');
      }
    } catch (err) {
      alert('Error rescheduling appointment');
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

  const BookCardIcon = ({ color }: { color: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M9 3v7l3-2 3 2V3" />
    </svg>
  );

  const EyeCardIcon = ({ color }: { color: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const PresentationCardIcon = ({ color }: { color: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="2" />
      <path d="M4 17v-1.5a2.5 2.5 0 0 1 2.5-2.5h1.5" />
      <rect x="12" y="4" width="8" height="7" rx="1.5" />
      <path d="M16 11v6" />
      <path d="M13.5 17h5" />
    </svg>
  );

  const stats = [
    {
      label: 'Total Bookings',
      value: String(dashboardStats.totalBookings ?? 0),
      bg: '#BAC5FF',
      textColor: '#0012FF',
      iconType: 'book'
    },
    {
      label: 'Total Bookings this month',
      value: String(dashboardStats.totalBookingsThisMonth ?? 0),
      bg: '#AFE8B9',
      textColor: '#0A4A1C',
      iconType: 'book'
    },
    {
      label: 'Profile Views',
      value: String(dashboardStats.profileViews ?? 0),
      bg: '#FFB3B3',
      textColor: '#701C1C',
      iconType: 'eye'
    },
    {
      label: 'Upcoming Sessions',
      value: String(dashboardStats.upcomingSessions ?? 0),
      bg: '#FFEDB5',
      textColor: '#6C4800',
      iconType: 'presentation'
    }
  ];

  const GoogleMeetIcon = () => (
    <img
      src="https://static.vecteezy.com/system/resources/thumbnails/022/484/498/small/google-meet-gmeet-icon-logo-symbol-free-png.png"
      alt="Google Meet"
      className="w-4 h-4 object-contain shrink-0"
    />
  );

  // Helper to render booking cards matching the design image
  const renderBookingCard = (booking: any, index: number) => (
    <motion.div
      key={booking.id || index}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 + index * 0.05 }}
      className="relative w-full bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 relative border border-gray-100">
              <Image
                src={booking.avatar || '/assets/avatar.png'}
                alt={booking.name || 'User'}
                className="w-full h-full object-cover"
                width={44}
                height={44}
              />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-black leading-tight">{booking.name}</h3>
              <p className="text-xs text-gray-400 font-medium">{booking.handle}</p>
              {booking.isCreatorBooker && (
                <span className="inline-block mt-0.5 text-[10px] font-bold text-[#0012FF] bg-[#FFFFFF] border border-[#0012FF]/20 px-2 py-0.5 rounded-full leading-none">
                  You booked a session with this creator
                </span>
              )}
            </div>
          </div>
          <p className="font-extrabold text-sm text-[#0012FF] whitespace-nowrap">{booking.amount || '2500 PKR'}</p>
        </div>

        <div className="flex flex-col gap-2 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-[#0012FF] shrink-0" />
            <span className="font-medium text-gray-700">{booking.time}</span>
            {booking.isRescheduled && (
              <span className="text-[10px] font-bold text-[#0012FF] bg-[#EEF2FF] px-2 py-0.5 rounded-full shrink-0 leading-none">
                Rescheduled
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
              {booking.type === 'In-person' ? (
                <div className="w-2.5 h-2.5 rounded-full bg-[#0012FF]" />
              ) : (
                <GoogleMeetIcon />
              )}
            </div>
            <span className="font-medium text-gray-700 capitalize">{booking.type}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
          {booking.note || 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...'}
          <span className="text-[#0012FF] font-bold ml-1 cursor-pointer hover:underline">Read more</span>
        </p>
      </div>

      <div>
        <div className="w-full h-px bg-gray-100 mb-4"></div>

        {booking.status === 'cancelled' || booking.status === 'Cancelled' ? (
          <div className="w-full py-2.5 bg-[#FFF0F0] border border-red-100 text-[#FF3B3B] rounded-full text-xs font-bold text-center select-none">
            Cancelled
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {(() => {
              const passed = booking.scheduledDate ? isMeetingPassed(booking.scheduledDate, booking.time) : false;
              return (
                <>
                  {booking.meetingEnded || booking.status === 'completed' ? (
                    booking.hasReviewed ? (
                      <div className="w-full py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 bg-gray-100 text-gray-500 border border-gray-200 select-none">
                        <CheckCircle className="size-3.5 shrink-0" />
                        Meeting Completed
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openReviewForBooking(booking)}
                        className="w-full py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
                      >
                        <Star className="size-3.5 shrink-0" />
                        Review {booking.name || 'Client'}
                      </button>
                    )
                  ) : (
                    <button
                      disabled={passed}
                      onClick={() => {
                        if (booking.meetingUrl && booking.bookingRef) {
                          const minsMatch = String(booking.time || '').match(/(\d+)\s*mins?/i);
                          setMeetingToJoin({
                            id: String(booking.id),
                            url: booking.meetingUrl,
                            ref: booking.bookingRef,
                            peerName: booking.name || 'your client',
                            durationMins:
                              Number(booking.durationMins) ||
                              (minsMatch ? Number(minsMatch[1]) : 15),
                            // Timer starts only after Join → startMeeting
                            meetingEndsAt: null,
                          });
                        } else {
                          alert('Meeting link is not available yet.');
                        }
                      }}
                      className={`w-full py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${passed
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-[#0012FF] hover:bg-[#0012FF]/90 text-white shadow-[#0012FF]/20 cursor-pointer'
                        }`}
                    >
                      {passed ? (
                        <VideoOff className="size-3.5 shrink-0" />
                      ) : (
                        <Video className="size-3.5 shrink-0" />
                      )}
                      {passed ? 'Meeting Ended' : booking.meetingStarted ? 'Rejoin Meeting' : 'Start Meeting'}
                    </button>
                  )}

                  {passed ? (
                    <button
                      onClick={() => router.push(`/creators/chats?bookingRef=${booking.bookingRef}`)}
                      className="w-full py-2.5 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#0012FF]/20"
                    >
                      <MessageSquare className="size-3.5 shrink-0" />
                      Chat now
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRescheduleClick(booking)}
                        className="flex-1 py-2 sm:py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelClick(booking)}
                        className="flex-1 py-2 sm:py-2.5 bg-[#FFF0F0] border border-red-100 hover:bg-red-100 text-[#FF3B3B] rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </motion.div>
  );

  const selectedDateIso = toISODate(currentDate);

  // Days that have at least one booking (dots on the month strip)
  const markedBookingDates = useMemo(() => {
    const set = new Set<string>();
    for (const booking of bookingsList) {
      const iso = bookingDateIso(booking);
      if (iso) set.add(iso);
    }
    return Array.from(set);
  }, [bookingsList]);

  // Filter to selected day; newest bookings first within that day
  const filteredBookingsList = useMemo(() => {
    return bookingsList
      .filter((booking) => bookingDateIso(booking) === selectedDateIso)
      .sort((a, b) => {
        const createdDiff =
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        if (createdDiff !== 0) return createdDiff;
        const minsA = parse12h(String(a.scheduledTime || '').split(/to|-/i)[0].trim()) ?? 0;
        const minsB = parse12h(String(b.scheduledTime || '').split(/to|-/i)[0].trim()) ?? 0;
        return minsA - minsB;
      });
  }, [bookingsList, selectedDateIso]);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#F8F8FA]">
        <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />
        <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          {/* Top Header Greeting Bar Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-36 bg-gray-200 animate-pulse rounded-md" />
              <div className="h-9 w-80 bg-gray-200 animate-pulse rounded-lg" />
            </div>
            <div className="h-11 w-44 bg-gray-200 animate-pulse rounded-full" />
          </div>

          {/* Top Section Grid: 4 Stat Cards & Bar Chart Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full h-[160px] rounded-[10px] bg-gray-200 animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-6 h-[336px] rounded-[24px] bg-gray-200 animate-pulse" />
          </div>

          {/* Calendar & Schedule Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-[400px] bg-gray-200 rounded-[28px] animate-pulse" />
            <div className="lg:col-span-4 h-[400px] bg-gray-200 rounded-[28px] animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      {/* Main Content Area */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* Top Header Greeting Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-gray-400 font-medium mb-1 text-sm sm:text-base">Hello {displayName ? displayName : 'Creator'}!</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight font-sans">
              You Have <span className="text-[#0012FF]">{dashboardStats.upcomingSessions} Appointments</span> <span className="text-gray-400 font-normal text-base sm:text-xl">/ Scheduled</span>
            </h1>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-[#0012FF] text-white px-6 py-3 rounded-full font-bold text-sm sm:text-base hover:bg-[#0012FF]/90 transition-all shadow-md active:scale-95 w-fit cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Booking Link'}
          </button>
        </div>

        {/* Top Section Grid: 2x2 Stat Cards (Left) & Earnings Bar Chart (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">

          {/* Left: 2x2 Grid of 4 Stat Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((stat, idx) => {
              return (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="w-full h-[160px] rounded-[10px] p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] shadow-sm hover:shadow-md cursor-default"
                  style={{ backgroundColor: stat.bg, color: stat.textColor }}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-2xs">
                      {stat.iconType === 'book' && <BookCardIcon color={stat.textColor} />}
                      {stat.iconType === 'eye' && <EyeCardIcon color={stat.textColor} />}
                      {stat.iconType === 'presentation' && <PresentationCardIcon color={stat.textColor} />}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">{stat.label}</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">{stat.value}</h3>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Earnings Bar Chart Card */}
          <div className="lg:col-span-6 flex flex-col">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="h-full"
            >
              <Card className="rounded-[20px] border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden h-full flex flex-col justify-between">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-2 pt-0 px-0 space-y-3 sm:space-y-0 flex-wrap gap-2">
                  <CardTitle className="text-xl font-bold font-sans text-black">Earnings</CardTitle>

                  <div className="flex flex-wrap items-center gap-2">
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
                  </div>
                </CardHeader>

                <CardContent className="px-0 pb-0 flex-1 flex flex-col justify-center">


                  {loadingChart ? (
                    <div className="w-full h-48 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#0012FF] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart
                        data={chartData}
                        margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                        barCategoryGap="16%"
                        tabIndex={-1}
                        className="focus:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none"
                        style={{ outline: 'none' }}
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
                          tickMargin={8}
                          axisLine={false}
                          tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={6}
                          tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                          tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`}
                          width={44}
                        />
                        <Tooltip
                          cursor={false}
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2.5 text-xs">
                                <p className="font-bold text-gray-800">{label}</p>
                                <p className="text-[#0012FF] font-semibold">{d.earnings.toLocaleString()} PKR</p>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="earnings"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={44}
                          cursor="pointer"
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                activeBarIndex === index
                                  ? '#0012FF'
                                  : '#F1F3F5'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Date filter — shared DaysOfMonth calendar */}
        <div className="mb-8 w-full rounded-2xl border border-gray-100 bg-white p-3 shadow-xs sm:p-4">
          <DaysOfMonth
            selectedDates={[selectedDateIso]}
            activeDate={selectedDateIso}
            onDateClick={(iso) => setCurrentDate(fromISODate(iso))}
            minDate={new Date(2020, 0, 1)}
            yearsBehind={0}
            yearsAhead={5}
            markedDates={markedBookingDates}
          />
        </div>

        {/* Upcoming Bookings Section */}
        <div className="space-y-6">
          {filteredBookingsList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <Image
                src="/assets/no-appointment.webp"
                alt="No Appointments"
                width={220}
                height={220}
                className="mb-8 opacity-85"
              />
              <h2 className="text-xl font-bold text-black mb-2">No Appointments</h2>
              <p className="text-gray-500 max-w-sm text-sm">
                There are no sessions scheduled for this date. Marked days on the calendar have bookings — tap one to view them.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-black sm:text-xl">Latest Bookings</h2>
                  <p className="text-xs text-gray-400 sm:text-sm">
                    Newest appointments for the selected day
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookingsList.slice(0, 6).map((booking, idx) => renderBookingCard(booking, idx))}
              </div>

              {/* Show All button redirecting to calendar page */}
              <div className="mt-8 flex justify-center">
                <Link
                  href="/creators/calendar"
                  className="px-8 py-3 bg-white border-2 border-[#0012FF] text-[#0012FF] hover:bg-[#0012FF] hover:text-white rounded-full font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Show All</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>

      </main>

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4 cursor-pointer"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCancelModal(false)}
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
                src="/assets/cancel-appointment.webp"
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

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4 cursor-pointer"
          onClick={() => {
            setShowRescheduleModal(false);
            setIsRescheduleSuccess(false);
            setBookingToReschedule(null);
          }}
        >
          {isRescheduleSuccess ? (
            <div
              className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setIsRescheduleSuccess(false);
                  setBookingToReschedule(null);
                }}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="w-40 sm:w-52 h-auto my-2">
                <Image
                  src="/assets/reschedule.webp"
                  alt="Success"
                  width={220}
                  height={160}
                  className="w-full h-auto object-contain"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
                Booking Rescheduled
              </h3>

              <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
                Your booking has been rescheduled successfully.
              </p>

              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setIsRescheduleSuccess(false);
                  setBookingToReschedule(null);
                }}
                className="w-full max-w-[220px] py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-sm transition-all shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <div
              className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-2xl p-6 sm:p-8 flex flex-col overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Header */}
              <div className="mb-6 text-left">
                <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-1">
                  Reschedule Appointment
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">
                  Choose a new date and time for your appointment
                </p>
              </div>

              {/* Date Selector Strip Box */}
              <div className="w-full bg-white rounded-2xl border border-gray-200/80 p-2 sm:p-2.5 mb-6 flex items-center justify-between gap-1 shadow-2xs">
                <button
                  onClick={() => {
                    const prev = new Date(rescheduleDate);
                    prev.setDate(prev.getDate() - 1);
                    setRescheduleDate(prev);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </button>

                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 px-1 flex-1">
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
                        className={`flex flex-col items-center justify-center min-w-[44px] sm:min-w-[48px] py-1.5 px-1 rounded-xl transition-all cursor-pointer shrink-0 ${isSelected
                          ? 'bg-[#EEF2FF] border border-[#0012FF]/30 text-[#0012FF] font-bold shadow-2xs'
                          : 'text-gray-500 hover:bg-gray-100 bg-transparent'
                          }`}
                      >
                        <span className={`text-[9px] uppercase font-bold tracking-wider ${isSelected ? 'text-[#0012FF]/80' : 'text-gray-400'}`}>{dayName}</span>
                        <span className={`text-xs sm:text-sm font-extrabold mt-0.5 ${isSelected ? 'text-[#0012FF]' : 'text-gray-800'}`}>{dayNum}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    const next = new Date(rescheduleDate);
                    next.setDate(next.getDate() + 1);
                    setRescheduleDate(next);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>

              {/* Time Slots Grid (3 Columns) */}
              <div className="w-full mb-8">
                {loadingSlots ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-11 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : rescheduleSlots.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-gray-50 border border-gray-200/70 rounded-2xl">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">No available time slots for this date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                    {rescheduleSlots.map((slot) => {
                      const isSelected = selectedRescheduleTime === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedRescheduleTime(slot)}
                          className={`py-3 px-3 border rounded-2xl text-xs sm:text-sm font-medium text-center transition-all cursor-pointer ${isSelected
                            ? 'bg-[#EEF2FF] border-2 border-[#0012FF] text-[#0012FF] font-bold shadow-xs'
                            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-500'
                            }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center gap-4 w-full">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full font-bold text-xs sm:text-sm text-center transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmReschedule}
                  disabled={!selectedRescheduleTime}
                  className="flex-1 py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-xs sm:text-sm text-center transition-all shadow-md active:scale-98 disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer"
                >
                  Reschedule Appointment
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Success Modal (Cancelled or Rescheduled) */}
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
                src={
                  successModalType === "cancelled"
                    ? "/assets/cancel-appointment.webp"
                    : "/assets/reschedule.webp"
                }
                alt="Success"
                width={220}
                height={160}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
              {successModalType === "cancelled"
                ? "Booking Cancelled"
                : "Booking Rescheduled"}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
              {successModalType === "cancelled"
                ? "Your booking has been cancelled successfully."
                : "Your booking has been rescheduled successfully."}
            </p>

            {/* Action */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full max-w-[220px] py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-sm transition-all shadow-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Meeting Details Modal */}
      {meetingToJoin && !activeCallUrl && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="relative bg-white rounded-[28px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
            <button
              onClick={() => setMeetingToJoin(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="w-34 h-34 mb-6">
              <img src="/assets/meeting.png" alt="Meeting" className="w-full h-full object-contain" />
            </div>

            <h3 className="text-2xl font-extrabold text-black mb-2 tracking-tight">Ready to join?</h3>
            <p className="text-gray-500 text-sm mb-4">
              Press Join to start the session timer and let your client enter. Make sure your camera and microphone are ready.
            </p>

            <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6">
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Meeting Link</p>
              <p className="text-sm font-medium text-gray-700 truncate">{window.location.origin}/meeting/{meetingToJoin.ref}</p>
            </div>

            <button
              onClick={() => void handleCreatorStartMeeting()}
              disabled={startingMeeting}
              className="w-full bg-[#0012FF] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#0012FF]/20 cursor-pointer disabled:opacity-60"
            >
              {startingMeeting ? 'Joining…' : 'Join Meeting'}
            </button>
          </div>
        </div>
      )}

      {/* Active Daily Call Modal */}
      {activeCallUrl && meetingToJoin && (
        <DailyCall
          url={activeCallUrl}
          bookingId={meetingToJoin.id}
          role="creator"
          meetingEndsAt={meetingToJoin.meetingEndsAt}
          onLeave={handleCreatorLeaveMeeting}
        />
      )}

      <SessionReviewModal
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        target={reviewTarget}
        role="creator"
        onSubmitted={markBookingReviewed}
      />
    </div>
  );
};

export default CreatorDashboard;
