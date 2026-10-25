'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import UserNavbar from '@/components/UserNavbar';
import LoadingAnimation from '@/components/LoadingAnimation';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  clearPendingSessionReview,
  readAnyPendingSessionReview,
  storePendingSessionReview,
} from '@/lib/pendingSessionReview';
import AvailabilityDateTimePicker, {
  dateToISO,
} from '@/components/booking/AvailabilityDateTimePicker';
import { pktToday } from '@/lib/pkt';

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface Booking {
  id: string;
  creator: string;
  username: string;
  avatar: string;
  price: string;
  date: string;
  time: string;
  location: string;
  bio: string;
  status: string;
  originalStatus: string;
  scheduledDate: string;
  isRescheduled: boolean;
  meetingUrl?: string;
  meetingStarted?: boolean;
  meetingEnded?: boolean;
  meetingEndsAt?: string | null;
  hasReviewed?: boolean;
  bookingRef?: string;
  durationMins?: number;
  sessionTypeId?: string | null;
  isPackage?: boolean;
  sessionNumber?: number;
  isEvent?: boolean;
  eventId?: string | null;
  tierTitle?: string | null;
}

export default function UserBookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming');
  const [displayName, setDisplayName] = useState('Guest');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestEmail, setGuestEmail] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookings cache on mount to skip skeletons
  useEffect(() => {
    try {
      const cachedBookings = sessionStorage.getItem('reachly_user_bookings_page_cache');
      if (cachedBookings) {
        const cached = JSON.parse(cachedBookings);
        if (cached.displayName) setDisplayName(cached.displayName);
        if (cached.profilePhoto) setProfilePhoto(cached.profilePhoto);
        if (cached.bookings) setBookings(cached.bookings);
        setLoading(false);
      }
    } catch (e) {
      console.error('Failed to load bookings cache:', e);
    }
  }, []);

  // Reschedule States
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [selectedRescheduleTimeSlot, setSelectedRescheduleTimeSlot] = useState<string>('');

  // Custom Cancel / Reschedule Alerts to Modals
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState<boolean>(false);
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);
  const [showRefundConfirmModal, setShowRefundConfirmModal] = useState(false);
  const [eventToRefund, setEventToRefund] = useState<Booking | null>(null);
  const [refundSaving, setRefundSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalType, setSuccessModalType] = useState<'cancelled' | 'rescheduled' | 'refunded'>('cancelled');
  const [blockedWindow, setBlockedWindow] = useState<{
    action: SessionModificationAction;
    kind: 'session' | 'event';
    startMs: number | null;
  } | null>(null);

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
  const [waitingCreatorName, setWaitingCreatorName] = useState<string | null>(null);
  const [joiningMeetingId, setJoiningMeetingId] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<SessionReviewTarget | null>(null);
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});

  // Read guestEmail from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ge = params.get('guestEmail');
    if (ge) {
      setGuestEmail(ge);
      setIsGuest(true);
      setDisplayName(ge.split('@')[0]);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      let uName = 'Guest';
      let uPhoto: string | null = null;

      // Fetch user profile and bookings concurrently
      const params = new URLSearchParams(window.location.search);
      const ge = params.get('guestEmail');
      const bookingsUrl = ge ? `/api/user/bookings?guestEmail=${encodeURIComponent(ge)}` : '/api/user/bookings';

      const [authRes, bookingsRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch(bookingsUrl)
      ]);

      if (authRes.ok) {
        const userData = await authRes.json();
        if (userData.user) {
          uName = userData.user.name || 'Guest';
          uPhoto = userData.creatorProfile?.profilePhoto || userData.user.profilePhoto || null;
          setDisplayName(uName);
          setProfilePhoto(uPhoto);
          setIsGuest(false);
        }
      }
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        if (data.bookings) {
          const list = data.bookings.map((b: any) => {
            const passed = b.isEvent
              ? b.status === 'Past'
              : b.scheduledDate
                ? isMeetingPassed(b.scheduledDate, b.time)
                : false;
            let finalStatus = b.status;
            if (b.originalStatus === 'cancelled' || b.status === 'Cancelled') {
              finalStatus = 'Cancelled';
            } else if (b.isEvent) {
              finalStatus = b.status === 'Past' ? 'Past' : b.status === 'Cancelled' ? 'Cancelled' : 'Upcoming';
            } else if (b.status === 'Past' || passed) {
              finalStatus = 'Past';
            } else {
              finalStatus = 'Upcoming';
            }

            return {
              id: b.id,
              creator: b.creator,
              username: `@${b.username}`,
              avatar: b.image || '/Avatars/12.jpg',
              price: b.price || '2500 PKR',
              date: b.shortDate,
              time: b.time,
              location: b.isEvent ? 'Event' : b.paymentMethod === 'Guest' ? 'Online' : 'In-person',
              bio: b.isEvent
                ? (b.bio || b.session || b.tierTitle || 'Event ticket')
                : (b.bio || 'No description provided.'),
              originalStatus: b.originalStatus,
              status: finalStatus,
              scheduledDate: b.scheduledDate,
              isRescheduled: b.isRescheduled || false,
              meetingUrl: b.meetingUrl,
              meetingStarted: Boolean(b.meetingStarted),
              meetingEnded: Boolean(b.meetingEnded),
              meetingEndsAt: b.meetingEndsAt || null,
              hasReviewed: Boolean(b.hasReviewed),
              bookingRef: b.bookingRef,
              durationMins: Number(b.durationMins) || 15,
              sessionTypeId: b.sessionTypeId || null,
              isPackage: b.isPackage || false,
              sessionNumber: b.sessionNumber,
              isEvent: !!b.isEvent,
              eventId: b.eventId || null,
              tierTitle: b.tierTitle || null,
            };
          });
          setBookings(list);

          try {
            sessionStorage.setItem('reachly_user_bookings_page_cache', JSON.stringify({
              displayName: uName,
              profilePhoto: uPhoto,
              bookings: list
            }));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open reschedule modal when arriving from dashboard (?reschedule=bookingId)
  useEffect(() => {
    if (loading || bookings.length === 0 || showRescheduleModal) return;
    const params = new URLSearchParams(window.location.search);
    const rescheduleId = params.get('reschedule');
    if (!rescheduleId) return;

    const booking = bookings.find((b) => String(b.id) === rescheduleId && !b.isEvent);
    if (booking && booking.status === 'Upcoming') {
      if (assertModificationAllowed(booking, 'reschedule')) {
        setBookingToReschedule(booking);
        setRescheduleDate(pktToday());
        setSelectedRescheduleTimeSlot('');
        setShowRescheduleModal(true);
      }
    }
    // Clear the query so refresh doesn't reopen
    params.delete('reschedule');
    const next = params.toString();
    router.replace(next ? `/user/bookings?${next}` : '/user/bookings', { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, bookings]);

  const openBlockedWindow = (
    booking: Pick<Booking, 'scheduledDate' | 'time' | 'isEvent'>,
    action: SessionModificationAction
  ) => {
    const check = checkSessionModificationWindow(
      booking.scheduledDate,
      booking.time,
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
    booking: Pick<Booking, 'scheduledDate' | 'time' | 'isEvent'>,
    action: SessionModificationAction
  ) => {
    const check = checkSessionModificationWindow(
      booking.scheduledDate,
      booking.time,
      'Asia/Karachi',
      action
    );
    if (check.allowed) return true;
    openBlockedWindow(booking, action);
    return false;
  };

  const handleCancelClick = (booking: Booking) => {
    if (!assertModificationAllowed(booking, 'cancel')) return;
    setBookingToCancelId(booking.id);
    setShowCancelConfirmModal(true);
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
        const booking = bookings.find((b) => b.id === bookingToCancelId);
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

  const handleRescheduleClick = (booking: Booking) => {
    if (!assertModificationAllowed(booking, 'reschedule')) return;
    setBookingToReschedule(booking);
    setRescheduleDate(pktToday());
    setSelectedRescheduleTimeSlot('');
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async () => {
    if (!bookingToReschedule || !selectedRescheduleTimeSlot || !rescheduleDate) {
      toast.error('Please select a new time slot');
      return;
    }
    try {
      const dateStr = dateToISO(rescheduleDate);

      const res = await fetch(`/api/user/bookings/${bookingToReschedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedDate: dateStr,
          selectedTime: selectedRescheduleTimeSlot,
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setShowRescheduleModal(false);
        setSuccessModalType('rescheduled');
        setShowSuccessModal(true);
        loadData();
      } else {
        if (data.error?.includes('24 hours')) {
          openBlockedWindow(bookingToReschedule, 'reschedule');
          setShowRescheduleModal(false);
        } else {
          toast.error(data.error || 'Failed to reschedule appointment');
        }
      }
    } catch (err) {
      toast.error('Error rescheduling appointment');
    }
  };

  const handleUserJoinMeeting = async (booking: Booking) => {
    if (booking.meetingEnded || booking.status === 'Past' || booking.originalStatus === 'completed') {
      toast.error('This meeting is already completed.');
      return;
    }
    if (!booking.meetingUrl || !booking.bookingRef) {
      toast.error('Meeting link is not available yet.');
      return;
    }
    if (joiningMeetingId) return;
    setJoiningMeetingId(booking.id);
    try {
      const res = await fetch(`/api/user/bookings/${booking.id}/meeting`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not check meeting status.');
        return;
      }
      if (data.meetingEnded) {
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, meetingEnded: true } : b))
        );
        toast.error('This meeting is already completed.');
        return;
      }
      if (!data.meetingStarted) {
        setWaitingCreatorName(data.creatorName || booking.creator || 'Your creator');
        return;
      }
      setMeetingToJoin({
        id: booking.id,
        url: data.meetingUrl || booking.meetingUrl,
        ref: data.bookingRef || booking.bookingRef,
        peerName: data.creatorName || booking.creator || 'your creator',
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
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, hasReviewed: true, meetingEnded: true } : b
      )
    );
    setReviewTarget(null);
  };

  const openReviewForBooking = (booking: Booking) => {
    setReviewTarget({
      bookingId: booking.id,
      peerName: booking.creator || 'your creator',
      durationMins: booking.durationMins || 15,
    });
  };

  // Reopen review only if this browser just finished a meeting (not on book / random load)
  useEffect(() => {
    if (loading || reviewTarget || activeCallUrl || meetingToJoin) return;
    const pending = readAnyPendingSessionReview();
    if (!pending) return;
    const known = bookings.find((b) => String(b.id) === String(pending.bookingId));
    if (known?.hasReviewed) {
      clearPendingSessionReview(pending.bookingId);
      return;
    }
    setReviewTarget(pending);
  }, [loading, bookings, reviewTarget, activeCallUrl, meetingToJoin]);

  const handleUserLeaveMeeting = (reason?: 'left' | 'ended' | 'timeout' | 'unavailable') => {
    const ctx = meetingToJoin;
    setActiveCallUrl(null);
    const completed = reason === 'ended' || reason === 'timeout';
    if (ctx?.id) {
      if (completed) {
        const target = {
          bookingId: String(ctx.id),
          peerName: ctx.peerName || 'your creator',
          durationMins: ctx.durationMins || 15,
        };
        storePendingSessionReview(target);
        setBookings((prev) =>
          prev.map((b) =>
            b.id === ctx.id ? { ...b, meetingEnded: true, meetingStarted: true } : b
          )
        );
        setReviewTarget(target);
      }
      setMeetingToJoin(null);
    } else {
      setMeetingToJoin(null);
    }
  };

  const handleRefundClick = (booking: Booking) => {
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

  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = bookings.filter((b) => {
    const matchesTab =
      activeTab === 'Cancelled'
        ? b.originalStatus === 'cancelled' || b.status === 'Cancelled'
        : b.status === activeTab;
    const matchesSearch = !searchQuery.trim() ||
      b.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const countUpcoming = bookings.filter((b) => b.status === 'Upcoming').length;
  const countPast = bookings.filter((b) => b.status === 'Past').length;
  const countCancelled = bookings.filter((b) => b.originalStatus === 'cancelled').length;

  return (
    <div className="min-h-screen bg-[#F8F8FA] pb-12">
      <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {loading ? (
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-md" />
              <div className="h-9 w-80 bg-gray-200 animate-pulse rounded-lg" />
            </div>

            {/* Filter bar & Search Skeleton */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="h-10 w-28 bg-gray-200 animate-pulse rounded-2xl" />
                <div className="h-10 w-28 bg-gray-200 animate-pulse rounded-2xl" />
                <div className="h-10 w-28 bg-gray-200 animate-pulse rounded-2xl" />
              </div>
              <div className="h-10 w-full sm:w-64 bg-gray-200 animate-pulse rounded-2xl" />
            </div>

            {/* Bookings Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-[20px]" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Page Heading */}
            <FadeUp className="mb-8">
              <p className="text-gray-500 text-sm font-sans mb-1">Hello {displayName.split(' ')[0]}!</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-black font-sans tracking-tight">
                Manage Your <span className="text-[#0012FF] font-extrabold">Bookings</span> <span className="text-gray-400 font-normal text-sm font-sans ml-2">with ease</span>
              </h1>
            </FadeUp>

            {/* Guest banner — shown when viewing without login */}
            {isGuest && (
              <div className="mb-6 flex items-center justify-between gap-4 bg-[#EEF2FF] border border-[#0012FF]/20 rounded-2xl px-5 py-3.5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0012FF]/10 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-[#0012FF]">
                    You&apos;re viewing as a guest. <span className="text-gray-600 font-normal">Log in to manage all your bookings and access your dashboard.</span>
                  </p>
                </div>
                <a
                  href="/login"
                  className="shrink-0 bg-[#0012FF] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#0010d0] transition-colors"
                >
                  Log In
                </a>
              </div>
            )}

            {/* Tabs and Search Bar Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4">
              {/* Pill Tabs */}
              <div className="flex items-center gap-3">
                {(['Upcoming', 'Past', 'Cancelled'] as const).map((tab) => {
                  const count = tab === 'Upcoming' ? countUpcoming : tab === 'Past' ? countPast : countCancelled;
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${isActive
                        ? 'bg-[#0012FF] text-white shadow-sm'
                        : 'bg-white border border-gray-200/80 text-gray-600 hover:bg-gray-50 shadow-2xs'
                        }`}
                    >
                      {tab} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Search Input Field */}
              <div className="relative w-full sm:w-72">
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search bookings"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200/80 rounded-2xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0012FF] transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Bookings Grid (3 Columns) */}
            {filteredBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 + index * 0.04 }}
                    className="w-full bg-white border border-gray-200/80 rounded-[20px] p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all relative group"
                  >
                    <div>
                      {/* Header: Avatar, Name, Verified Badge, Accepted Status Badge, Amount */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-100">
                            <img
                              src={booking.avatar || '/avatar.png'}
                              alt={booking.creator}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-extrabold text-base text-black font-sans leading-tight">{booking.creator}</h3>
                              <svg className="w-4 h-4 text-[#12B76A] fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                              <span className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-2xs ${
                                activeTab === 'Cancelled' || booking.originalStatus === 'cancelled' || booking.status === 'Cancelled'
                                  ? 'bg-[#FFF0F0] text-[#FF3B3B]'
                                  : 'bg-[#E6F9EE] text-[#12B76A]'
                              }`}>
                                {activeTab === 'Cancelled' || booking.originalStatus === 'cancelled' || booking.status === 'Cancelled'
                                  ? 'Cancelled'
                                  : 'Accepted'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 font-medium font-sans mt-0.5">{booking.username}</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-lg sm:text-xl text-[#0012FF] font-sans tracking-tight shrink-0 ml-2">
                          {booking.price}
                        </span>
                      </div>

                    
                      <div className="space-y-1.5 text-xs text-gray-500 font-sans font-medium my-3">
                        <div className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>{booking.date} at {booking.time}</span>
                          {booking.isEvent && (
                            <span className="text-[10px] font-bold text-[#0012FF] bg-[#EEF2FF] px-2 py-0.5 rounded-full shrink-0 leading-none">
                              Event{booking.tierTitle ? ` · ${booking.tierTitle}` : ''}
                            </span>
                          )}
                          {booking.isPackage && (
                            <span className="text-[10px] font-bold text-[#0012FF] bg-[#EEF2FF] px-2 py-0.5 rounded-full shrink-0 leading-none">
                              Package · session {booking.sessionNumber}
                            </span>
                          )}
                          {booking.isRescheduled && (
                            <span className="text-[10px] font-bold text-[#0012FF] bg-[#EEF2FF] px-2 py-0.5 rounded-full shrink-0 leading-none">
                              Rescheduled
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            {booking.location.toLowerCase().includes('online') ? (
                              <>
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                              </>
                            ) : (
                              <>
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </>
                            )}
                          </svg>
                          <span>{booking.location}</span>
                        </div>
                      </div>

                      {/* Bio Note Description */}
                      {/* {(() => {
                        const bioText = booking.bio || 'No description provided.';
                        const isLong = bioText.length > 120;
                        const isExpanded = !!expandedBios[booking.id];
                        // return (
                        //   <p className="text-xs text-gray-400 font-sans leading-relaxed">
                        //     {isExpanded || !isLong ? bioText : `${bioText.slice(0, 120).trim()}...`}
                        //     {isLong && (
                        //       <button
                        //         type="button"
                        //         onClick={() => setExpandedBios((prev) => ({ ...prev, [booking.id]: !prev[booking.id] }))}
                        //         className="text-[#0012FF] font-bold text-xs ml-1 hover:underline cursor-pointer"
                        //       >
                        //         {isExpanded ? 'Read less' : 'Read more'}
                        //       </button>
                        //     )}
                        //   </p>
                        // );
                      })()} */}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
                      {(() => {
                        const passed = isMeetingPassed(booking.scheduledDate, booking.time);
                        const isCancelled = activeTab === 'Cancelled' || booking.originalStatus === 'cancelled' || booking.status === 'Cancelled';
                        const isPast = activeTab === 'Past' || passed;

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
                                className="w-full py-2.5 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-full text-xs font-bold text-center transition-all cursor-pointer shadow-md shadow-[#0012FF]/20"
                              >
                                View Session Chat
                              </button>
                            );
                          }

                          return (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  router.push(
                                    booking.eventId
                                      ? `/user/chats?eventId=${booking.eventId}`
                                      : '/user/chats'
                                  )
                                }
                                className="flex-1 py-2.5 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-full text-xs font-bold text-center transition-all cursor-pointer shadow-md shadow-[#0012FF]/20"
                              >
                                View Session Chat
                              </button>
                              <button
                                onClick={() => handleRefundClick(booking)}
                                className="flex-1 py-2.5 bg-[#FFF0F0] border border-red-100 hover:bg-red-100 text-[#FF3B3B] rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
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
                              className="w-full py-2.5 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#0012FF]/20"
                            >
                              <MessageSquare className="size-3.5 shrink-0" />
                              Chat now
                            </button>
                          );
                        }

                        // Otherwise, it's upcoming and active
                        return (
                          <>
                            {booking.meetingEnded ? (
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
                                  Review {booking.creator || 'Creator'}
                                </button>
                              )
                            ) : (
                              <button
                                onClick={() => void handleUserJoinMeeting(booking)}
                                disabled={joiningMeetingId === booking.id}
                                className="w-full py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md bg-[#0012FF] hover:bg-[#0012FF]/90 text-white shadow-[#0012FF]/20 cursor-pointer disabled:opacity-60"
                              >
                                <Video className="size-3.5 shrink-0" />
                                {joiningMeetingId === booking.id ? 'Checking…' : 'Join Meeting'}
                              </button>
                            )}
                            {booking.isPackage ? (
                              <p className="text-[11px] text-gray-400 font-medium text-center">
                                Package sessions can&apos;t be cancelled or rescheduled by you. Your creator can
                                reschedule if needed.
                              </p>
                            ) : (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleRescheduleClick(booking)}
                                className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancelClick(booking)}
                                className="flex-1 py-2 bg-[#FFF0F0] border border-red-100 hover:bg-red-100 text-[#FF3B3B] rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
                              >
                                Cancel Appointment
                              </button>
                            </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200/80 p-16 flex flex-col items-center justify-center text-center shadow-2xs">
                <div className="w-[220px] h-[220px] relative mb-6">
                  <Image
                    src="/assets/no-appointment.webp"
                    alt="No Appointments"
                    fill
                    className="object-contain opacity-85"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">No bookings found</h3>
                <p className="text-xs text-gray-400 max-w-[280px]">
                  You have no {activeTab.toLowerCase()} bookings at the moment.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4 cursor-pointer"
          onClick={() => setShowRescheduleModal(false)}
        >
          <div 
            className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-2xl p-6 sm:p-8 flex flex-col overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-6 text-left">
              <h3 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight mb-1">
                Reschedule Appointment
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Choose a new date and time for your appointment
              </p>
            </div>

            <div className="w-full mb-8">
              {bookingToReschedule && (
                <AvailabilityDateTimePicker
                  username={bookingToReschedule.username.replace('@', '')}
                  sessionId={bookingToReschedule.sessionTypeId}
                  selectedDate={rescheduleDate}
                  selectedTime={selectedRescheduleTimeSlot || null}
                  onDateChange={(d) => {
                    setRescheduleDate(d);
                    setSelectedRescheduleTimeSlot('');
                  }}
                  onTimeChange={setSelectedRescheduleTimeSlot}
                  dayCount={60}
                  compact
                />
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
                disabled={!selectedRescheduleTimeSlot || !rescheduleDate}
                className="flex-1 py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-xs sm:text-sm text-center transition-all shadow-md active:scale-98 disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer"
              >
                Reschedule Appointment
              </button>
            </div>
          </div>
        </div>
      )}

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
              Your ticket for &ldquo;{eventToRefund.bio || 'this event'}&rdquo; will be cancelled and marked for
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

      {/* Success Modal (Cancelled / Rescheduled / Refunded) */}
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
                  successModalType === 'rescheduled'
                    ? '/assets/reschedule.webp'
                    : '/assets/cancel-appointment.webp'
                }
                alt="Success"
                width={220}
                height={160}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
              {successModalType === 'cancelled'
                ? 'Booking Cancelled'
                : successModalType === 'refunded'
                  ? 'Refund Requested'
                  : 'Booking Rescheduled'}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
              {successModalType === 'cancelled'
                ? 'Your booking has been cancelled successfully.'
                : successModalType === 'refunded'
                  ? 'Your event ticket has been cancelled and marked for refund.'
                  : 'Your booking has been rescheduled successfully.'}
            </p>

            {/* Close Button */}
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
