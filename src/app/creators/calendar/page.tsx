'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import LoadingAnimation from '@/components/LoadingAnimation';
import DaysOfMonth from '@/components/DaysOfMonth';
import { Calendar, Clock, Video, MapPin, MessageSquare, AlertTriangle, CheckCircle, ArrowUpRight, X } from 'lucide-react';
import DailyCall from '@/components/DailyCall';
import SessionReviewModal, {
  type SessionReviewTarget,
} from '@/components/booking/SessionReviewModal';
import OutsideSessionModal, { type OutsideBlock } from '@/components/creator/OutsideSessions';
import { format12h, parse12h } from '@/lib/slots';
import { isMeetingPassed } from '@/lib/time';
import { fromISODate, toISODate } from '@/lib/eventTicketing';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface BookingType {
  _id: string;
  id: string;
  name: string;
  handle: string;
  avatar: string;
  time: string;
  type: 'In-person' | 'Online';
  note: string;
  amount: string;
  selectedDate: string;
  selectedTime: string;
  status: 'confirmed' | 'cancelled' | 'completed' | string;
  statusRaw?: string;
  isRescheduled?: boolean;
  meetingUrl?: string;
  meetingStarted?: boolean;
  meetingEnded?: boolean;
  meetingEndsAt?: string | null;
  durationMins?: number;
  bookingRef?: string;
  isCreatorBooker?: boolean;
  isPackage?: boolean;
  sessionNumber?: number;
  rescheduleStatus?: 'pending' | 'unlocked';
}

export default function CreatorCalendar() {
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cached calendar details on mount
  useEffect(() => {
    try {
      const cachedCalendar = sessionStorage.getItem('reachly_creator_calendar_cache');
      if (cachedCalendar) {
        const cached = JSON.parse(cachedCalendar);
        if (cached.displayName) setDisplayName(cached.displayName);
        if (cached.profilePhoto) setProfilePhoto(cached.profilePhoto);
        if (cached.username) setUsername(cached.username);
        if (cached.bookings) setBookings(cached.bookings);
        setLoading(false);
      }
    } catch (e) {
      console.error('Failed to load creator calendar cache:', e);
    }
  }, []);

  // Reschedule & Cancel Modal States
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<BookingType | null>(null);

  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<BookingType | null>(null);
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
      const endsAt =
        data.meeting?.meetingEndsAt ||
        data.meetingEndsAt ||
        meetingToJoin.meetingEndsAt ||
        null;
      setMeetingToJoin((prev) =>
        prev
          ? {
              ...prev,
              meetingEndsAt: endsAt ? String(endsAt) : prev.meetingEndsAt,
              durationMins:
                data.meeting?.totalMeetingMins ||
                data.totalMeetingMins ||
                prev.durationMins,
            }
          : prev
      );
      setActiveCallUrl(meetingToJoin.url);
    } catch (err) {
      console.error(err);
      alert('Could not start the meeting.');
    } finally {
      setStartingMeeting(false);
    }
  };

  const handleCreatorLeaveMeeting = () => {
    const ctx = meetingToJoin;
    setActiveCallUrl(null);
    setMeetingToJoin(null);
    if (ctx?.id) {
      setBookings((prev) =>
        prev.map((b) =>
          String(b.id) === String(ctx.id)
            ? { ...b, meetingEnded: true, meetingStarted: true, status: 'completed', statusRaw: 'completed' }
            : b
        )
      );
      setReviewTarget({
        bookingId: ctx.id,
        peerName: ctx.peerName || 'your client',
        durationMins: ctx.durationMins || 15,
      });
    }
  };

  // Fetch creator profile & bookings
  const loadInitialData = useCallback(async () => {
    try {
      let uName = displayName;
      let uPhoto: string | null = profilePhoto;
      let uUser = username;
      let list: any[] = [];

      if (!uUser && typeof window !== 'undefined') {
        try {
          const cachedCalendar = sessionStorage.getItem('reachly_creator_calendar_cache');
          if (cachedCalendar) {
            const cached = JSON.parse(cachedCalendar);
            if (cached.username) uUser = cached.username;
            if (cached.displayName) uName = cached.displayName;
            if (cached.profilePhoto) uPhoto = cached.profilePhoto;
          }
        } catch (e) {}
      }

      const fetchProfile = !uUser;
      const [meRes, bookingsRes] = await Promise.all([
        fetchProfile ? fetch('/api/user/me') : Promise.resolve(null),
        fetch('/api/creators/bookings')
      ]);

      if (meRes && meRes.ok) {
        const data = await meRes.json();
        uName = data.creatorProfile?.displayName || data.user?.name || '';
        uPhoto = data.creatorProfile?.profilePhoto || null;
        uUser = data.creatorProfile?.username || '';
        setDisplayName(uName);
        setProfilePhoto(uPhoto);
        setUsername(uUser);
      }

      if (bookingsRes && bookingsRes.ok) {
        const data = await bookingsRes.json();
        if (data.bookings) {
          // Format bookings for UI
          list = data.bookings.map((b: any) => {
            const minsMatch = String(b.duration || '').match(/(\d+)/);
            return {
              id: b.id,
              _id: b.id,
              name: b.follower || 'Client',
              handle: b.email || '@client',
              avatar: b.avatar || '/Avatars/3.jpg',
              time: b.time || 'N/A',
              type: b.type || 'Online',
              note: b.preSessionQuestion || 'No notes provided',
              amount: b.amount || '2,500 PKR',
              selectedDate: b.scheduledDate,
              selectedTime: b.time,
              status: b.statusRaw,
              isRescheduled: b.isRescheduled || false,
              meetingUrl: b.meetingUrl,
              bookingRef: b.bookingRef,
              durationMins: minsMatch ? Number(minsMatch[1]) : 15,
              isCreatorBooker: b.isCreatorBooker || false,
              isPackage: b.isPackage || false,
              sessionNumber: b.sessionNumber,
              rescheduleStatus: b.rescheduleStatus,
            };
          });
          setBookings(list);
        }
      }

      // Save to cache
      try {
        sessionStorage.setItem('reachly_creator_calendar_cache', JSON.stringify({
          displayName: uName,
          profilePhoto: uPhoto,
          username: uUser,
          bookings: list
        }));
      } catch (e) { }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [displayName, profilePhoto, username]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Fetch reschedule slots when date changes
  useEffect(() => {
    if (!showRescheduleModal) return;

    async function fetchRescheduleSlots() {
      setLoadingSlots(true);
      setSelectedRescheduleTime('');
      try {
        let activeUsername = username;
        if (!activeUsername) {
          try {
            const cachedCalendar = sessionStorage.getItem('reachly_creator_calendar_cache');
            if (cachedCalendar) {
              const cached = JSON.parse(cachedCalendar);
              if (cached.username) activeUsername = cached.username;
            }
          } catch (e) {}
        }
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

  // Sessions the creator booked outside Reachly: shown in the day's list and hidden from booking slots
  const [outsideBlocks, setOutsideBlocks] = useState<OutsideBlock[]>([]);
  const [showOutsideModal, setShowOutsideModal] = useState(false);
  const loadOutsideBlocks = useCallback(async () => {
    try {
      const res = await fetch('/api/creators/calendar-blocks');
      if (res.ok) setOutsideBlocks((await res.json()).blocks || []);
    } catch {}
  }, []);
  useEffect(() => {
    loadOutsideBlocks();
  }, [loadOutsideBlocks]);
  const removeOutsideBlock = async (id: string) => {
    setOutsideBlocks((prev) => prev.filter((b) => b.id !== id));
    await fetch(`/api/creators/calendar-blocks?id=${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const dayOutsideBlocks = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    return outsideBlocks
      .filter((b) => b.date === `${y}-${m}-${d}`)
      .sort((a, b) => (parse12h(a.startTime) ?? 0) - (parse12h(b.startTime) ?? 0));
  }, [outsideBlocks, currentDate]);

  // Group and filter bookings for currently selected day (memoized)
  const currentBookings = useMemo(() => {
    const curDate = currentDate.getDate();
    const curMonth = currentDate.getMonth();
    const curYear = currentDate.getFullYear();
    return bookings.filter((b) => {
      if (!b.selectedDate) return false;
      const d = new Date(b.selectedDate);
      return (
        d.getDate() === curDate &&
        d.getMonth() === curMonth &&
        d.getFullYear() === curYear
      );
    });
  }, [bookings, currentDate]);

  const selectedDateIso = toISODate(currentDate);

  // Dates with bookings or outside blocks (dots on DaysOfMonth)
  const markedCalendarDates = useMemo(() => {
    const set = new Set<string>();
    for (const b of bookings) {
      if (!b.selectedDate) continue;
      set.add(toISODate(new Date(b.selectedDate)));
    }
    for (const ob of outsideBlocks) {
      if (ob.date) set.add(ob.date);
    }
    return Array.from(set);
  }, [bookings, outsideBlocks]);

  const handleCancelClick = (booking: BookingType) => {
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
        setBookings((prev) => prev.map((b) => b.id === bookingToCancel.id ? { ...b, status: 'cancelled' } : b));
        setSuccessModalType('cancelled');
        setShowSuccessModal(true);
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

  // Package sessions: the creator first asks the admin to unlock the chat so both sides can talk
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const handleRequestReschedule = async (booking: BookingType) => {
    setRequestingId(booking.id);
    try {
      const res = await fetch(`/api/creators/bookings/${booking.id}/reschedule-request`, { method: 'POST' });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, rescheduleStatus: 'pending' } : b)));
      } else {
        alert((await res.json()).error || 'Could not send the request.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setRequestingId(null);
    }
  };

  const handleRescheduleClick = (booking: BookingType) => {
    setBookingToReschedule(booking);
    setRescheduleDate(booking.selectedDate ? new Date(booking.selectedDate) : new Date());
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
        // Update locally
        setBookings((prev) => prev.map((b) => {
          if (b.id === bookingToReschedule.id) {
            return {
              ...b,
              selectedDate: dateStr,
              selectedTime: selectedRescheduleTime,
              time: selectedRescheduleTime,
            };
          }
          return b;
        }));
        setIsRescheduleSuccess(true);
      } else {
        alert('Failed to reschedule appointment');
      }
    } catch (err) {
      alert('Error rescheduling appointment');
    }
  };

  // Generate next 14 days starting from today for rescheduling slider
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

  const GoogleMeetIcon = () => (
    <img
      src="https://static.vecteezy.com/system/resources/thumbnails/022/484/498/small/google-meet-gmeet-icon-logo-symbol-free-png.png"
      alt="Google Meet"
      className="w-4 h-4 object-contain shrink-0"
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FA]">
        <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />
        <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          {/* Header Greeting Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-36 bg-gray-200 animate-pulse rounded-md" />
              <div className="h-9 w-80 bg-gray-200 animate-pulse rounded-lg" />
            </div>
            <div className="h-11 w-44 bg-gray-200 animate-pulse rounded-full" />
          </div>

          {/* Date Picker Bar Skeleton */}
          <div className="h-20 bg-gray-200 rounded-3xl animate-pulse mb-8" />

          {/* Appointments Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-60 bg-gray-200 rounded-[20px] animate-pulse" />
            ))}
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
            <p className="text-gray-400 font-medium mb-1 text-sm sm:text-base">Hello {displayName ? displayName : 'Sophia Reed'}!</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight font-sans">
              You Have <span className="text-[#0012FF]">{currentBookings.length} Appointments</span> <span className="text-gray-400 font-normal text-base sm:text-xl">/ Today</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowOutsideModal(true)}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-full font-bold text-sm sm:text-base hover:bg-gray-50 transition-all shadow-sm active:scale-95 w-fit cursor-pointer"
          >
            + Outside session
          </button>
          <button
            onClick={() => {
              const linkStr = window.location.origin + `/creators/${username || displayName.toLowerCase().replace(/\s+/g, '-')}`;
              navigator.clipboard.writeText(linkStr);
              alert('Booking link copied to clipboard!');
            }}
            className="flex items-center gap-2 bg-[#0012FF] text-white px-6 py-3 rounded-full font-bold text-sm sm:text-base hover:bg-[#0012FF]/90 transition-all shadow-md active:scale-95 w-fit cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            Copy Booking Link
          </button>
          </div>
        </div>

        <OutsideSessionModal
          open={showOutsideModal}
          onClose={() => setShowOutsideModal(false)}
          onSaved={loadOutsideBlocks}
        />

        {/* Date filter — shared DaysOfMonth calendar */}
        <div className="mb-8 w-full rounded-2xl border border-gray-100 bg-white p-3 shadow-xs sm:p-4">
          <DaysOfMonth
            selectedDates={[selectedDateIso]}
            activeDate={selectedDateIso}
            onDateClick={(iso) => setCurrentDate(fromISODate(iso))}
            minDate={new Date(2020, 0, 1)}
            yearsBehind={0}
            yearsAhead={5}
            markedDates={markedCalendarDates}
          />
        </div>

        {/* Bookings Grid or Empty State */}
        {currentBookings.length > 0 || dayOutsideBlocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBookings.map((booking, index) => (
              <motion.div
                key={booking.id || index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
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

                  {booking.status === 'cancelled' ? (
                    <div className="w-full py-2.5 bg-[#FFF0F0] border border-red-100 text-[#FF3B3B] rounded-full text-xs font-bold text-center select-none">
                      Cancelled
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {(() => {
                        const passed = booking.selectedDate ? isMeetingPassed(booking.selectedDate, booking.time) : false;
                        return (
                          <>
                            {booking.meetingEnded || booking.statusRaw === 'completed' || booking.status === 'completed' ? (
                              <div className="w-full py-2.5 rounded-full text-xs font-bold text-center bg-gray-100 text-gray-500 border border-gray-200 select-none">
                                Meeting Completed
                              </div>
                            ) : (
                              <button
                                disabled={passed}
                                onClick={() => {
                                  if (booking.meetingUrl && booking.bookingRef) {
                                    setMeetingToJoin({
                                      id: String(booking.id),
                                      url: booking.meetingUrl,
                                      ref: booking.bookingRef,
                                      peerName: booking.name || 'your client',
                                      durationMins: Number(booking.durationMins) || 15,
                                      meetingEndsAt: booking.meetingEndsAt || null,
                                    });
                                  } else {
                                    alert('Meeting link is not available yet.');
                                  }
                                }}
                                className={`w-full py-2.5 rounded-full text-xs font-bold text-center transition-all shadow-md ${passed
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                  : 'bg-[#0012FF] hover:bg-[#0012FF]/90 text-white shadow-[#0012FF]/20 cursor-pointer'
                                  }`}
                              >
                                {passed ? 'Meeting Ended' : booking.meetingStarted ? 'Rejoin Meeting' : 'Start Meeting'}
                              </button>
                            )}

                            {passed ? (
                              <button
                                onClick={() => router.push(`/creators/chats?bookingRef=${booking.bookingRef}`)}
                                className="w-full py-2.5 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-full text-xs font-bold text-center transition-all cursor-pointer shadow-md shadow-[#0012FF]/20"
                              >
                                Chat now
                              </button>
                            ) : (
                              booking.isPackage ? (
                                // Package sessions can't be cancelled; reschedule goes through the admin chat unlock
                                booking.rescheduleStatus === 'pending' ? (
                                  <button
                                    disabled
                                    className="w-full py-2.5 border border-gray-200 bg-gray-50 text-gray-400 rounded-full text-xs font-semibold text-center cursor-not-allowed"
                                  >
                                    Waiting for admin to unlock chat
                                  </button>
                                ) : booking.rescheduleStatus === 'unlocked' ? (
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => router.push(`/creators/chats?bookingRef=${booking.bookingRef}`)}
                                      className="flex-1 py-2 sm:py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
                                    >
                                      Open chat
                                    </button>
                                    <button
                                      onClick={() => handleRescheduleClick(booking)}
                                      className="flex-1 py-2 sm:py-2.5 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
                                    >
                                      Reschedule
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleRequestReschedule(booking)}
                                    disabled={requestingId === booking.id}
                                    className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-semibold text-center transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    {requestingId === booking.id ? 'Sending...' : 'Reschedule'}
                                  </button>
                                )
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
                              )
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Sessions booked outside Reachly */}
            {dayOutsideBlocks.map((ob, index) => {
              const start = parse12h(ob.startTime);
              const endLabel = start === null ? '' : format12h((start + ob.durationMinutes) % 1440);
              return (
                <motion.div
                  key={ob.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: (currentBookings.length + index) * 0.05 }}
                  className="relative w-full bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[220px]"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 bg-gray-100 text-gray-500 border border-gray-100">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-black leading-tight">{ob.title || 'Outside session'}</h3>
                          <p className="text-xs text-gray-400 font-medium">Booked outside Reachly</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full leading-none whitespace-nowrap">
                        Outside session
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-700">
                          {ob.startTime}
                          {endLabel && ` – ${endLabel}`}
                        </span>
                        <span className="text-gray-400">· {ob.durationMinutes} min</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed mt-4">
                      This time is blocked, so no one can book it on Reachly.
                    </p>
                  </div>

                  <div>
                    <div className="w-full h-px bg-gray-100 mb-4"></div>
                    <button
                      onClick={() => removeOutsideBlock(ob.id)}
                      className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
            <Image
              src="/assets/no-appointment.webp"
              alt="No Appointments"
              width={220}
              height={220}
              className="mb-8 opacity-85"
            />
            <h2 className="text-xl font-bold text-black mb-2">No Appointments Today</h2>
            <p className="text-gray-500 max-w-sm text-sm">
              You are free! There are no sessions scheduled for this date. Click other dates to view bookings.
            </p>
          </div>
        )}
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

            <h3 className="text-2xl font-extrabold text-black mb-2 tracking-tight">Ready to start?</h3>
            <p className="text-gray-500 text-sm mb-4">
              Starting the meeting lets your client join. Make sure your camera and microphone are ready.
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
              {startingMeeting ? 'Starting…' : 'Start Meeting'}
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
      />
    </div>
  );
}
