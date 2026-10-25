'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import UserNavbar from '@/components/UserNavbar';
import LoadingAnimation from '@/components/LoadingAnimation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import DailyCall from '@/components/DailyCall';
import ModificationWindowBlockedModal from '@/components/booking/ModificationWindowBlockedModal';
import MeetingNotStartedModal from '@/components/booking/MeetingNotStartedModal';
import SessionReviewModal, {
  type SessionReviewTarget,
} from '@/components/booking/SessionReviewModal';
import {
  checkSessionModificationWindow,
  isMeetingPassed,
  type SessionModificationAction,
} from '@/lib/time';
import { toast } from 'sonner';
import { Star, CheckCircle, Video, MessageSquare } from 'lucide-react';
import {
  getStoredFavourites,
  setStoredFavourites,
  toggleFavouriteApi,
  subscribeFavourites,
} from '@/lib/favouritesSync';
import {
  clearPendingSessionReview,
  readAnyPendingSessionReview,
  storePendingSessionReview,
} from '@/lib/pendingSessionReview';
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
  /** Raw start time from API (e.g. "05:00 PM") for the 24h window check. */
  scheduledTime?: string;
  type: string;
  status: string;
  amount: string;
  note: string;
  scheduledDate?: string;
  meetingUrl?: string;
  meetingStarted?: boolean;
  meetingEnded?: boolean;
  meetingEndsAt?: string | null;
  hasReviewed?: boolean;
  bookingRef?: string;
  durationMins?: number;
  isEvent?: boolean;
  eventId?: string | null;
  tierTitle?: string | null;
}

export default function UserDashboard() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeBookingTab, setActiveBookingTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming');
  const [bookingsPage, setBookingsPage] = useState(0);
  const BOOKINGS_PER_PAGE = 3;
  const [favorites, setFavorites] = useState<string[]>(() => getStoredFavourites()); // creator usernames

  // Synchronously load from sessionStorage cache on mount and subscribe to global favourites
  useEffect(() => {
    const storedFavs = getStoredFavourites();
    if (storedFavs.length > 0) setFavorites(storedFavs);

    const unsubscribe = subscribeFavourites((newFavs) => {
      setFavorites(newFavs);
    });

    try {
      const cachedDashboard = sessionStorage.getItem('reachly_user_dashboard_cache');
      console.log("cachedDashboard",cachedDashboard)
      if (cachedDashboard) {
        const cached = JSON.parse(cachedDashboard);
        if (cached.displayName) setDisplayName(cached.displayName);
        if (cached.profilePhoto) setProfilePhoto(cached.profilePhoto);
        if (cached.creatorsList) setCreatorsList(cached.creatorsList);
        if (cached.realBookingsList) setRealBookingsList(cached.realBookingsList);
        setIsAuthenticated(true);
        setUseFallback(false);
        setLoading(false);
      }
    } catch (e) {
      console.error('Failed to load dashboard cache:', e);
    }

    return () => unsubscribe();
  }, []);

  // User details
  const [displayName, setDisplayName] = useState<string>('James Richard');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  let [userId, setUserId] = useState<string | null>(null);

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
  const [showRefundConfirmModal, setShowRefundConfirmModal] = useState(false);
  const [eventToRefund, setEventToRefund] = useState<DisplayBooking | null>(null);
  const [refundSaving, setRefundSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalType, setSuccessModalType] = useState<'cancelled' | 'refunded'>('cancelled');
  const [meetingToJoin, setMeetingToJoin] = useState<{
    id: string;
    url: string;
    ref: string;
    peerName: string;
    durationMins: number;
    meetingEndsAt?: string | null;
  } | null>(null);
  const [activeCallUrl, setActiveCallUrl] = useState<string | null>(null);
  const [waitingCreatorName, setWaitingCreatorName] = useState<string | null>(null);
  const [joiningMeetingId, setJoiningMeetingId] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<SessionReviewTarget | null>(null);
  const [blockedWindow, setBlockedWindow] = useState<{
    action: SessionModificationAction;
    kind: 'session' | 'event';
    startMs: number | null;
  } | null>(null);

  const handleUserJoinMeeting = async (booking: DisplayBooking) => {
    if (booking.meetingEnded || booking.status === 'Completed' || booking.status === 'completed') {
      toast.error('This meeting is already completed.');
      return;
    }
    if (!booking.meetingUrl || !booking.bookingRef) {
      toast.error('Meeting link is not available yet.');
      return;
    }
    const bookingId = String(booking.id);
    if (joiningMeetingId) return;
    setJoiningMeetingId(bookingId);
    try {
      const res = await fetch(`/api/user/bookings/${bookingId}/meeting`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not check meeting status.');
        return;
      }
      if (data.meetingEnded) {
        setRealBookingsList((prev) => ({
          ...prev,
          Upcoming: prev.Upcoming.map((b) =>
            String(b.id) === bookingId ? { ...b, meetingEnded: true } : b
          ),
        }));
        toast.error('This meeting is already completed.');
        return;
      }
      if (!data.meetingStarted) {
        setWaitingCreatorName(data.creatorName || booking.name || 'Your creator');
        return;
      }
      setMeetingToJoin({
        id: bookingId,
        url: data.meetingUrl || booking.meetingUrl,
        ref: data.bookingRef || booking.bookingRef,
        peerName: data.creatorName || booking.name || 'your creator',
        durationMins: data.totalMeetingMins || booking.durationMins || 15,
        meetingEndsAt: data.meetingEndsAt || null,
      });
    } catch (err) {
      console.error(err);
      toast.error('Could not check meeting status.');
    } finally {
      setJoiningMeetingId(null);
    }
  };

  const markBookingReviewed = (bookingId: string) => {
    clearPendingSessionReview(bookingId);
    setRealBookingsList((prev) => ({
      ...prev,
      Upcoming: prev.Upcoming.map((b) =>
        String(b.id) === String(bookingId) ? { ...b, hasReviewed: true, meetingEnded: true } : b
      ),
      Past: prev.Past.map((b) =>
        String(b.id) === String(bookingId) ? { ...b, hasReviewed: true, meetingEnded: true } : b
      ),
    }));
    setReviewTarget(null);
  };

  const openReviewForBooking = (booking: DisplayBooking) => {
    setReviewTarget({
      bookingId: String(booking.id),
      peerName: booking.name || 'your creator',
      durationMins: booking.durationMins || 15,
    });
  };

  // Reopen review only if this browser just finished a meeting (not on book / random load)
  useEffect(() => {
    if (loading || reviewTarget || activeCallUrl || meetingToJoin) return;
    const pending = readAnyPendingSessionReview();
    if (!pending) return;
    const known = [...realBookingsList.Upcoming, ...realBookingsList.Past].find(
      (b) => String(b.id) === String(pending.bookingId)
    );
    if (known?.hasReviewed) {
      clearPendingSessionReview(pending.bookingId);
      return;
    }
    setReviewTarget(pending);
  }, [loading, realBookingsList, reviewTarget, activeCallUrl, meetingToJoin]);

  const handleUserLeaveMeeting = (reason?: 'left' | 'ended' | 'timeout' | 'unavailable') => {
    const ctx = meetingToJoin;
    setActiveCallUrl(null);
    // Review only when the live call actually ended — not before join / unavailable
    const completed = reason === 'ended' || reason === 'timeout';
    if (ctx?.id) {
      if (completed) {
        const target = {
          bookingId: String(ctx.id),
          peerName: ctx.peerName || 'your creator',
          durationMins: ctx.durationMins || 15,
        };
        storePendingSessionReview(target);
        setRealBookingsList((prev) => ({
          ...prev,
          Upcoming: prev.Upcoming.map((b) =>
            String(b.id) === String(ctx.id)
              ? { ...b, meetingEnded: true, meetingStarted: true }
              : b
          ),
          Past: prev.Past.map((b) =>
            String(b.id) === String(ctx.id)
              ? { ...b, meetingEnded: true, meetingStarted: true }
              : b
          ),
        }));
        setReviewTarget(target);
      }
      setMeetingToJoin(null);
    } else {
      setMeetingToJoin(null);
    }
  };

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

  const routerRef = useRef(router);
  routerRef.current = router;
  const dashboardLoadedRef = useRef(false);

  const loadData = useCallback(async (opts?: { force?: boolean }) => {
    if (dashboardLoadedRef.current && !opts?.force) return;
    dashboardLoadedRef.current = true;
    try {
      let uName = 'James Richard';
      let uPhoto: string | null = null;
      let userFavorites: string[] = [];
      let creators: any[] = [];

      // Execute all dashboard requests in parallel to eliminate sequential network latency
      const [meRes, bookingsRes, favRes, creatorsRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/user/bookings'),
        fetch('/api/user/favourite-creators'),
        fetch('/api/creators'),
      ]);

      if (meRes.ok) {
        const data = await meRes.json();
        console.log("meRes data",data);
        setIsAuthenticated(true);
        if (data.user) {
          if (data.user.approvalStatus === 'pending' && data.user.hasCreatorProfile) {
            routerRef.current.push('/creators/pending-approval');
            return;
          }
          if (data.user.approvalStatus === 'pending') {
            routerRef.current.push('/user/pending-approval');
            return;
          }
          uName = data.user.name || 'James Richard';
          uPhoto = data.creatorProfile?.profilePhoto || data.user.profilePhoto || null;
          userId = data.user.id;
          setDisplayName(uName);
          setProfilePhoto(uPhoto);
          setUserId(userId);
        }
      } else {
        setIsAuthenticated(false);
      }

      if (favRes.ok) {
        const favData = await favRes.json();
        userFavorites = favData.favouriteCreators || [];
        setFavorites(userFavorites);
        setStoredFavourites(userFavorites, true);
      }

      if (creatorsRes.ok) {
        const creatorsData = await creatorsRes.json();
        if (creatorsData.success && creatorsData.creators?.length) {
          creators = creatorsData.creators;
          setCreatorsList(creators);
        }
      }

      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        let upcomingArr: DisplayBooking[] = [];
        let pastArr: DisplayBooking[] = [];
        let cancelledArr: DisplayBooking[] = [];

        if (bData.bookings && bData.bookings.length > 0) {
          bData.bookings.forEach((b: any) => {
            const displayObj: DisplayBooking = {
              id: b.id,
              name: b.creator,
              handle: `@${b.username}`,
              avatar: b.image || '/Avatars/12.jpg',
              time: `${b.shortDate} at ${b.time}`,
              scheduledTime: b.time,
              type: b.isEvent ? 'Event' : b.paymentMethod === 'Guest' ? 'Online' : 'In-person',
              status: b.originalStatus === 'cancelled' ? 'Cancelled' : 'Accepted',
              amount: b.price || '2500 PKR',
              note: b.isEvent
                ? (b.bio || b.session || b.tierTitle || 'Event ticket')
                : (b.preSessionQuestion || b.session || 'No description provided.'),
              scheduledDate: b.scheduledDate,
              meetingUrl: b.meetingUrl,
              meetingStarted: Boolean(b.meetingStarted),
              meetingEnded: Boolean(b.meetingEnded),
              meetingEndsAt: b.meetingEndsAt || null,
              hasReviewed: Boolean(b.hasReviewed),
              bookingRef: b.bookingRef,
              durationMins: Number(b.durationMins) || 15,
              isEvent: !!b.isEvent,
              eventId: b.eventId || null,
              tierTitle: b.tierTitle || null,
            };

            // Events: trust API status (avoid time-parse false "Past")
            const passed = b.isEvent
              ? b.status === 'Past'
              : b.scheduledDate
                ? isMeetingPassed(b.scheduledDate, b.time)
                : false;

            if (b.originalStatus === 'cancelled' || b.status === 'Cancelled') {
              cancelledArr.push(displayObj);
            } else if (b.status === 'Past' || passed) {
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

        // Save all fetched data into cache
        try {
          const cacheData = {
            displayName: uName,
            profilePhoto: uPhoto,
            userId: userId,
            favorites: userFavorites,
            creatorsList: creators,
            realBookingsList: { Upcoming: upcomingArr, Past: pastArr, Cancelled: cancelledArr }
          };
          sessionStorage.setItem('reachly_user_dashboard_cache', JSON.stringify(cacheData));
        } catch (e) {}
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
      void loadData();
    } else if (status === 'unauthenticated') {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [status, loadData]);

  const findBookingById = (id: string | number) => {
    const sid = String(id);
    return (
      realBookingsList.Upcoming.find((b) => String(b.id) === sid) ||
      realBookingsList.Past.find((b) => String(b.id) === sid) ||
      realBookingsList.Cancelled.find((b) => String(b.id) === sid) ||
      null
    );
  };

  const openBlockedWindow = (
    booking: Pick<DisplayBooking, 'scheduledDate' | 'scheduledTime' | 'time' | 'isEvent'>,
    action: SessionModificationAction
  ) => {
    const check = checkSessionModificationWindow(
      booking.scheduledDate || '',
      booking.scheduledTime || booking.time,
      'Asia/Karachi',
      action
    );
    setBlockedWindow({
      action,
      kind: booking.isEvent ? 'event' : 'session',
      startMs: check.sessionStartUTC?.getTime() ?? null,
    });
  };

  const assertModificationAllowed = (
    booking: Pick<DisplayBooking, 'scheduledDate' | 'scheduledTime' | 'time' | 'isEvent'>,
    action: SessionModificationAction
  ) => {
    if (!booking.scheduledDate) {
      toast.error('Missing schedule details for this booking.');
      return false;
    }
    const check = checkSessionModificationWindow(
      booking.scheduledDate,
      booking.scheduledTime || booking.time,
      'Asia/Karachi',
      action
    );
    if (check.allowed) return true;
    openBlockedWindow(booking, action);
    return false;
  };

  const handleCancelClick = (booking: DisplayBooking) => {
    if (String(booking.id).startsWith('fallback-')) {
      toast.error('Cannot modify fallback bookings.');
      return;
    }
    if (!assertModificationAllowed(booking, 'cancel')) return;
    setBookingToCancelId(String(booking.id));
    setShowCancelConfirmModal(true);
  };

  const handleRescheduleNav = (booking: DisplayBooking) => {
    if (String(booking.id).startsWith('fallback-')) {
      toast.error('Cannot modify fallback bookings.');
      return;
    }
    if (!assertModificationAllowed(booking, 'reschedule')) return;
    router.push(`/user/bookings?reschedule=${encodeURIComponent(String(booking.id))}`);
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
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccessModalType('cancelled');
        setShowSuccessModal(true);
        loadData();
      } else {
        const booking = findBookingById(bookingToCancelId);
        if (booking && data.error?.includes('24 hours')) {
          openBlockedWindow(booking, 'cancel');
        } else {
          toast.error(data.error || 'Failed to cancel appointment');
        }
      }
    } catch (err) {
      toast.error('Error cancelling appointment');
    } finally {
      setBookingToCancelId(null);
    }
  };

  const handleRefundClick = (booking: DisplayBooking) => {
    if (!assertModificationAllowed(booking, 'refund')) return;
    setEventToRefund(booking);
    setShowRefundConfirmModal(true);
  };

  const handleConfirmRefund = async () => {
    if (!eventToRefund || refundSaving) return;
    setRefundSaving(true);
    try {
      const res = await fetch(`/api/user/event-purchases/${eventToRefund.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refund' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowRefundConfirmModal(false);
        setEventToRefund(null);
        setSuccessModalType('refunded');
        setShowSuccessModal(true);
        loadData();
      } else if (data.error?.includes('24 hours') || data.remainingMs != null) {
        setShowRefundConfirmModal(false);
        openBlockedWindow(eventToRefund, 'refund');
      } else {
        toast.error(data.error || 'Could not refund this ticket.');
      }
    } catch (err) {
      toast.error('Could not refund this ticket.');
    } finally {
      setRefundSaving(false);
    }
  };

  const toggleFavorite = async (username: string) => {
    await toggleFavouriteApi(username);
  };

  // Real-time creators state
  const [creatorsList, setCreatorsList] = useState<any[]>([]);
  const [creatorsPage, setCreatorsPage] = useState(0);
  const CREATORS_PER_PAGE = 3;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FA] pb-12 text-black overflow-x-hidden">
        <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />
        <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          {/* Welcome Header Skeleton */}
          <div className="mb-8 space-y-2">
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-md" />
            <div className="h-9 w-80 bg-gray-200 animate-pulse rounded-lg" />
          </div>

          {/* 2-Column Skeleton Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              {/* 3 Stat Cards Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-full h-[160px] rounded-[10px] bg-gray-200 animate-pulse" />
                ))}
              </div>

              {/* Top Creators Skeleton */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-7 w-36 bg-gray-200 animate-pulse rounded-md" />
                  <div className="h-9 w-36 bg-gray-200 animate-pulse rounded-full" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-[4/4.2] bg-gray-200 rounded-[20px] animate-pulse" />
                  ))}
                </div>
              </div>

              {/* Bookings Section Skeleton */}
              <div className="space-y-4">
                <div className="h-7 w-48 bg-gray-200 animate-pulse rounded-md" />
                <div className="h-[280px] w-full bg-gray-200 rounded-3xl animate-pulse" />
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-4 space-y-6">
              <div className="h-[420px] w-full bg-gray-200 rounded-3xl animate-pulse" />
            </div>
          </div>
        </main>
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

  const currentBookings = realBookingsList;

  return (
    <div className="min-h-screen bg-[#F8F8FA] pb-12 text-black overflow-x-hidden">
      <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />

      {/* Main Grid Content */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Welcome Headers */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm font-sans mb-1">Hello {displayName.split(' ')[0]}!</p>
          <h1 className="text-4xl font-extrabold text-black font-sans tracking-tight">
            Your <span className="text-[#0012FF] font-extrabold">Dashboard</span> <span className="text-gray-400 font-normal text-sm font-sans ml-2">at a glance</span>
          </h1>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (takes 8 cols) */}
          <div className="lg:col-span-8 space-y-8">

            {/* 3 Stat Cards Grid */}
            {/* 3 Overview Stat Cards */}
            {(() => {
              const totalBookingsCount = useFallback ? 0 : (realBookingsList.Upcoming.length + realBookingsList.Past.length + realBookingsList.Cancelled.length);

              // Calculate total paid/spent on non-cancelled bookings
              let totalSpent = 0;
              if (!useFallback) {
                [...realBookingsList.Upcoming, ...realBookingsList.Past].forEach(b => {
                  const numericPrice = parseInt(String(b.amount).replace(/[^0-9]/g, ''), 10) || 0;
                  totalSpent += numericPrice;
                });
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  {/* Card 1: Total Bookings */}
                  <div className="w-full h-[160px] rounded-[10px] bg-[#AFE8B9] text-[#0A4A1C] p-5 flex flex-col justify-between shadow-xs transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center shadow-2xs">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A4A1C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="4" y="3" width="16" height="18" rx="3" />
                          <path d="M9 3v7l3-2 3 2V3" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Total Bookings</p>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                        {totalBookingsCount}
                      </h3>
                    </div>
                  </div>

                  {/* Card 2: Total Referrals */}
                  <div className="w-full h-[160px] rounded-[10px] bg-[#FFEDB5] text-[#6C4800] p-5 flex flex-col justify-between shadow-xs transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center shadow-2xs">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C4800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Total Referrals</p>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                        0
                      </h3>
                    </div>
                  </div>

                  {/* Card 3: Total Paid Out / Spent */}
                  <div className="w-full h-[160px] rounded-[10px] bg-[#BAC5FF] text-[#0012FF] p-5 flex flex-col justify-between shadow-xs transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-white/80 backdrop-blur-xs rounded-xl flex items-center justify-center shadow-2xs">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Total Paid Out</p>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                        {totalSpent > 0 ? `${totalSpent.toLocaleString()} PKR` : '0 PKR'}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Top Creators Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black font-sans">Top Creators</h2>
                <button
                  onClick={() => router.push('/explore-creators')}
                  className="flex items-center gap-2 bg-[#0012FF] text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-[#0012FF]/90 transition-all shadow-md shadow-[#0012FF]/10 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Browse Creators
                </button>
              </div>

              {/* Creators Grid */}
              {creatorsList.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-[4/4.2] bg-gray-100 rounded-[20px] animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {creatorsList
                      .slice(creatorsPage * CREATORS_PER_PAGE, (creatorsPage + 1) * CREATORS_PER_PAGE)
                      .map((creator, index) => {
                        const isFav = favorites.includes(creator.username);
                        return (
                          <motion.div
                            key={creator.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            onClick={() => router.push(`/creators/${creator.username}/book-session`)}
                            className="flex flex-col w-full group cursor-pointer"
                          >
                            {/* Top Image Container */}
                            <div className="relative w-full aspect-[4/4.2] rounded-[20px] overflow-hidden bg-gray-100 mb-3.5 shadow-xs transition-transform duration-300 group-hover:scale-[1.01]">
                              <img
                                src={creator.profilePhoto || '/avatar.png'}
                                alt={creator.displayName}
                                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              />

                              {/* Top Left Badge */}
                              <span
                                className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs tracking-wide ${creator.isVerified
                                  ? 'bg-[#E6F9EE] text-[#12B76A]'
                                  : 'bg-[#EEF2FF] text-[#0012FF]'
                                  }`}
                              >
                                {creator.isVerified ? 'Verified' : 'Sponsored'}
                              </span>

                              {/* Top Right Heart Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(creator.username);
                                }}
                                className="absolute top-3.5 right-3.5 z-20 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <svg
                                  className={`w-6 h-6 transition-colors duration-200 ${isFav ? 'text-[#FF3B3B] fill-[#FF3B3B] drop-shadow-md' : 'text-white fill-white drop-shadow-md'
                                    }`}
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              </button>
                            </div>

                            {/* Info Box Below Image */}
                            <div className="px-0.5 space-y-1">
                              {/* Title & Star Rating */}
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-base text-black font-sans flex items-center gap-1.5 leading-tight truncate">
                                  <span>{creator.displayName}</span>
                                  {creator.isVerified && (
                                    <svg className="w-4.5 h-4.5 text-[#12B76A] fill-current shrink-0" viewBox="0 0 24 24">
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                  )}
                                </h3>
                                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                                  ★ {creator.ratingDisplay || '5.0 (0)'}
                                </span>
                              </div>

                              {/* Handle */}
                              <p className="text-xs text-gray-400 font-medium font-sans">@{creator.username}</p>

                              {/* Short Bio */}
                              <p className="text-xs text-gray-400 font-sans leading-relaxed line-clamp-2 pt-1">
                                {creator.shortBio || 'Ayesha Khan is one of Pakistan’s leading fashion and lifestyle content creators...'}
                              </p>

                              {/* Price Row */}
                              <div className="pt-2 flex items-center gap-1 text-xs text-gray-400 font-sans">
                                <span>Starting from</span>
                                <strong className="text-black font-black text-sm ml-1">
                                  {creator.startingPrice ? `${creator.startingPrice.toLocaleString()} PKR` : '1200 PKR'}
                                </strong>
                              </div>

                              {/* Book Now Link */}
                              <div>
                                <Link
                                  href={`/creators/${creator.username}/book-session`}
                                  className="text-xs font-bold text-[#0012FF] underline hover:text-[#0010d0] font-sans pt-1 inline-block"
                                >
                                  Book Now
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>

                  {/* Pagination arrows */}
                  {creatorsList.length > CREATORS_PER_PAGE && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <button
                        onClick={() => setCreatorsPage(p => Math.max(0, p - 1))}
                        disabled={creatorsPage === 0}
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${creatorsPage === 0
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:border-[#0012FF] hover:text-[#0012FF] hover:bg-[#EEF2FF]'
                          }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>

                      <span className="text-xs font-bold text-gray-500">
                        {creatorsPage + 1} / {Math.ceil(creatorsList.length / CREATORS_PER_PAGE)}
                      </span>

                      <button
                        onClick={() => setCreatorsPage(p => Math.min(Math.ceil(creatorsList.length / CREATORS_PER_PAGE) - 1, p + 1))}
                        disabled={creatorsPage >= Math.ceil(creatorsList.length / CREATORS_PER_PAGE) - 1}
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${creatorsPage >= Math.ceil(creatorsList.length / CREATORS_PER_PAGE) - 1
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:border-[#0012FF] hover:text-[#0012FF] hover:bg-[#EEF2FF]'
                          }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

          {/* Right Column (takes 4 cols) - Bookings Tabs & List */}
          <div className="lg:col-span-4 bg-white rounded-[24px] p-5 border border-gray-100 shadow-2xs">
            {/* Bookings Tabs */}
            <div className="flex bg-gray-100/80 p-1 rounded-2xl justify-between border border-gray-200/50 mb-5">
              {(['Upcoming', 'Past', 'Cancelled'] as const).map((tab) => {
                const count = currentBookings[tab].length;
                const isActive = activeBookingTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveBookingTab(tab);
                      setBookingsPage(0);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${isActive
                      ? 'bg-[#0012FF] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>

            {/* List of bookings */}
            <div>
              {currentBookings[activeBookingTab].length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 w-full h-full min-h-[200px]">
                  <Image
                    src="/assets/no-appointment.webp"
                    alt="No bookings yet"
                    width={180}
                    height={180}
                    className="w-40 h-40 object-contain mb-3"
                  />
                  <p className="text-gray-500 font-semibold text-sm">No {activeBookingTab.toLowerCase()} bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {currentBookings[activeBookingTab].slice(bookingsPage * BOOKINGS_PER_PAGE, (bookingsPage + 1) * BOOKINGS_PER_PAGE).map((booking) => (
                      <div
                        key={booking.id}
                        className="w-full bg-white border border-gray-200/70 rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all group"
                      >
                        <div>
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100">
                                <img
                                  src={booking.avatar || '/avatar.png'}
                                  alt={booking.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-extrabold text-sm text-gray-900 font-sans leading-tight">{booking.name}</h4>
                                  <svg className="w-3.5 h-3.5 text-[#12B76A] fill-current shrink-0" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                  <span className="bg-[#E6F9EE] text-[#12B76A] font-bold text-[10px] px-2 py-0.5 rounded-full">
                                    {booking.status || 'Accepted'}
                                  </span>
                                  {booking.isEvent && (
                                    <span className="bg-[#EEF2FF] text-[#0012FF] font-bold text-[10px] px-2 py-0.5 rounded-full">
                                      Event
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-400 font-medium font-sans mt-0.5">{booking.handle}</p>
                              </div>
                            </div>
                            <span className="font-bold text-sm text-[#0012FF] font-sans tracking-tight shrink-0 ml-2 mt-1">
                              {booking.amount}
                            </span>
                          </div>

                          {/* Time & Meeting Type Row */}
                          <div className="flex items-center gap-4 text-[11px] text-gray-500 font-sans font-medium my-2.5">
                            <div className="flex items-center gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              <span>{booking.time}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <span>{booking.type}</span>
                            </div>
                          </div>

                          {/* Note Description */}
                          <p className="text-[11px] text-gray-400 font-sans leading-relaxed line-clamp-1">
                            {booking.note}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                          {(() => {
                            const passed = booking.scheduledDate
                              ? isMeetingPassed(booking.scheduledDate, booking.scheduledTime || booking.time)
                              : false;
                            const isCancelled = activeBookingTab === 'Cancelled' || booking.status === 'Cancelled' || booking.status === 'cancelled';
                            const isPast = activeBookingTab === 'Past' || passed;

                            if (booking.isEvent) {
                              if (isCancelled || isPast) {
                                return (
                                  <button
                                    onClick={() =>
                                      router.push(
                                        booking.eventId
                                          ? `/user/chats?eventId=${booking.eventId}`
                                          : '/user/chats'
                                      )
                                    }
                                    className="w-full py-2 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer shadow-sm"
                                  >
                                    View Session Chat
                                  </button>
                                );
                              }

                              return (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      router.push(
                                        booking.eventId
                                          ? `/user/chats?eventId=${booking.eventId}`
                                          : '/user/chats'
                                      )
                                    }
                                    className="flex-1 py-2 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer shadow-sm"
                                  >
                                    View Session Chat
                                  </button>
                                  <button
                                    onClick={() => handleRefundClick(booking)}
                                    className="flex-1 py-2 bg-[#FFF0F0] border border-red-100 hover:bg-red-100 text-[#FF3B3B] rounded-lg text-[11px] font-semibold text-center transition-all cursor-pointer"
                                  >
                                    Refund
                                  </button>
                                </div>
                              );
                            }

                            if (isCancelled || isPast) {
                              return (
                                <button
                                  onClick={() => router.push(`/user/chats?bookingRef=${booking.bookingRef}`)}
                                  className="w-full py-2 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-[#0012FF]/20"
                                >
                                  <MessageSquare className="size-3.5 shrink-0" />
                                  Chat now
                                </button>
                              );
                            }

                            // Otherwise, upcoming active
                            return (
                              <>
                                {booking.meetingEnded ? (
                                  booking.hasReviewed ? (
                                    <div className="w-full py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 bg-gray-100 text-gray-500 border border-gray-200 select-none">
                                      <CheckCircle className="size-3.5 shrink-0" />
                                      Meeting Completed
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => openReviewForBooking(booking)}
                                      className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                    >
                                      <Star className="size-3.5 shrink-0" />
                                      Review {booking.name || 'Creator'}
                                    </button>
                                  )
                                ) : (
                                  <button
                                    onClick={() => void handleUserJoinMeeting(booking)}
                                    disabled={joiningMeetingId === String(booking.id)}
                                    className="w-full py-2 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-60"
                                  >
                                    <Video className="size-3.5 shrink-0" />
                                    {joiningMeetingId === String(booking.id) ? 'Checking…' : 'Join Meeting'}
                                  </button>
                                )}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleRescheduleNav(booking)}
                                    className="flex-1 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-[11px] font-semibold text-center transition-all cursor-pointer"
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={() => handleCancelClick(booking)}
                                    className="flex-1 py-1.5 bg-[#FFF0F0] border border-red-100 hover:bg-red-100 text-[#FF3B3B] rounded-lg text-[11px] font-semibold text-center transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {/* Pagination arrows */}
                    {currentBookings[activeBookingTab].length > BOOKINGS_PER_PAGE && (
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <button
                          onClick={() => setBookingsPage(p => Math.max(0, p - 1))}
                          disabled={bookingsPage === 0}
                          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${bookingsPage === 0
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:border-[#0012FF] hover:text-[#0012FF] hover:bg-[#EEF2FF]'
                            }`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </button>

                        <span className="text-xs font-bold text-gray-500">
                          {bookingsPage + 1} / {Math.ceil(currentBookings[activeBookingTab].length / BOOKINGS_PER_PAGE)}
                        </span>

                        <button
                          onClick={() => setBookingsPage(p => Math.min(Math.ceil(currentBookings[activeBookingTab].length / BOOKINGS_PER_PAGE) - 1, p + 1))}
                          disabled={bookingsPage >= Math.ceil(currentBookings[activeBookingTab].length / BOOKINGS_PER_PAGE) - 1}
                          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${bookingsPage >= Math.ceil(currentBookings[activeBookingTab].length / BOOKINGS_PER_PAGE) - 1
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:border-[#0012FF] hover:text-[#0012FF] hover:bg-[#EEF2FF]'
                            }`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Show All Bookings Button */}
                    <button
                      onClick={() => router.push('/user/bookings')}
                      className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Show All {activeBookingTab} Bookings
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4 cursor-pointer"
          onClick={() => setShowCancelConfirmModal(false)}
        >
          <div 
            className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCancelConfirmModal(false)}
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

      {/* Refund Confirmation Modal (events) */}
      {showRefundConfirmModal && eventToRefund && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4 cursor-pointer"
          onClick={() => {
            if (!refundSaving) {
              setShowRefundConfirmModal(false);
              setEventToRefund(null);
            }
          }}
        >
          <div
            className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                if (!refundSaving) {
                  setShowRefundConfirmModal(false);
                  setEventToRefund(null);
                }
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
                src="/assets/cancel-appointment.webp"
                alt="Refund ticket"
                width={220}
                height={160}
                className="w-full h-auto object-contain"
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
              Request a refund?
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[280px]">
              Your ticket for &ldquo;{eventToRefund.note || 'this event'}&rdquo; will be cancelled and marked for
              refund. This cannot be undone.
            </p>
            <button
              onClick={() => void handleConfirmRefund()}
              disabled={refundSaving}
              className="w-full max-w-[260px] py-3.5 bg-[#E32A2A] hover:bg-[#c92222] text-white rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {refundSaving ? 'Processing…' : 'Confirm Refund'}
            </button>
          </div>
        </div>
      )}

      <ModificationWindowBlockedModal
        open={!!blockedWindow}
        onClose={() => setBlockedWindow(null)}
        startMs={blockedWindow?.startMs ?? null}
        action={blockedWindow?.action || 'cancel'}
        kind={blockedWindow?.kind || 'session'}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="w-40 sm:w-52 h-auto my-2">
              <Image
                src="/assets/cancel-appointment.webp"
                alt="Success"
                width={220}
                height={160}
                className="w-full h-auto object-contain"
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
              {successModalType === 'refunded' ? 'Refund Requested' : 'Booking Cancelled'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
              {successModalType === 'refunded'
                ? 'Your event ticket has been cancelled and marked for refund.'
                : 'Your booking has been cancelled successfully.'}
            </p>
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
              Your creator has started the meeting. Make sure your camera and microphone are connected before joining.
            </p>

            <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6">
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Meeting Link</p>
              <p className="text-sm font-medium text-gray-700 truncate">{window.location.origin}/meeting/{meetingToJoin.ref}</p>
            </div>

            <button
              onClick={async () => {
                // Re-check: creator must have pressed Join before user can enter
                try {
                  const res = await fetch(
                    `/api/user/bookings/${meetingToJoin.id}/meeting`,
                    { cache: 'no-store' }
                  );
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok || data.meetingEnded) {
                    toast.error(data.error || 'This meeting is not available.');
                    setMeetingToJoin(null);
                    return;
                  }
                  if (!data.meetingStarted) {
                    const name = data.creatorName || meetingToJoin.peerName || 'Your creator';
                    setMeetingToJoin(null);
                    setWaitingCreatorName(name);
                    return;
                  }
                  setMeetingToJoin((prev) =>
                    prev
                      ? {
                          ...prev,
                          meetingEndsAt: data.meetingEndsAt
                            ? String(data.meetingEndsAt)
                            : prev.meetingEndsAt,
                        }
                      : prev
                  );
                  setActiveCallUrl(meetingToJoin.url);
                } catch {
                  toast.error('Could not check meeting status.');
                }
              }}
              className="w-full bg-[#0012FF] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#0012FF]/20 cursor-pointer"
            >
              Join Meeting
            </button>
          </div>
        </div>
      )}

      <MeetingNotStartedModal
        open={!!waitingCreatorName}
        onClose={() => setWaitingCreatorName(null)}
        creatorName={waitingCreatorName || 'Your creator'}
      />

      {/* Active Daily Call Modal */}
      {activeCallUrl && meetingToJoin && (
        <DailyCall
          url={activeCallUrl}
          bookingId={meetingToJoin.id}
          role="user"
          meetingEndsAt={meetingToJoin.meetingEndsAt}
          onLeave={handleUserLeaveMeeting}
          onWaitingForCreator={(name) => {
            setActiveCallUrl(null);
            setMeetingToJoin(null);
            setWaitingCreatorName(name || 'Your creator');
          }}
        />
      )}

      <SessionReviewModal
        open={!!reviewTarget}
        onClose={() => {
          /* user must submit — ignore dismiss */
        }}
        target={reviewTarget}
        role="user"
        onSubmitted={markBookingReviewed}
      />
    </div>
  );
}
