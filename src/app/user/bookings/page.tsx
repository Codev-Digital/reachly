'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import UserNavbar from '@/components/UserNavbar';
import LoadingAnimation from '@/components/LoadingAnimation';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import DailyCall from '@/components/DailyCall';

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
  bookingRef?: string;
}

export default function UserBookingsPage() {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming');
  const [displayName, setDisplayName] = useState('Guest');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestEmail, setGuestEmail] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule States
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date>(new Date());
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedRescheduleTimeSlot, setSelectedRescheduleTimeSlot] = useState<string>('');

  // Custom Cancel / Reschedule Alerts to Modals
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState<boolean>(false);
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalType, setSuccessModalType] = useState<'cancelled' | 'rescheduled'>('cancelled');

  // Meeting Modal States
  const [meetingToJoin, setMeetingToJoin] = useState<{ url: string; ref: string } | null>(null);
  const [activeCallUrl, setActiveCallUrl] = useState<string | null>(null);

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
      const authRes = await fetch('/api/user/me');
      if (authRes.ok) {
        const userData = await authRes.json();
        if (userData.user) {
          setDisplayName(userData.user.name || 'Guest');
          setProfilePhoto(userData.creatorProfile?.profilePhoto || userData.user.image || null);
          setIsGuest(false);
        }
      }

      // Fetch bookings — use guestEmail param if not logged in
      const params = new URLSearchParams(window.location.search);
      const ge = params.get('guestEmail');
      const bookingsUrl = ge ? `/api/user/bookings?guestEmail=${encodeURIComponent(ge)}` : '/api/user/bookings';
      const bookingsRes = await fetch(bookingsUrl);
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        if (data.bookings) {
          const list = data.bookings.map((b: any) => ({
            id: b.id,
            creator: b.creator,
            username: `@${b.username}`,
            avatar: b.image || '/Avatars/12.jpg',
            price: b.price || '2500 PKR',
            date: b.shortDate,
            time: b.time,
            location: b.paymentMethod === 'Guest' ? 'Online' : 'In-person',
            bio: b.bio || 'No description provided.',
            originalStatus: b.originalStatus,
            status: b.status,
            scheduledDate: b.scheduledDate,
            isRescheduled: b.isRescheduled || false,
            meetingUrl: b.meetingUrl,
            bookingRef: b.bookingRef,
          }));
          setBookings(list);
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

  // Load slots for creator availability when reschedule date changes
  useEffect(() => {
    const booking = bookingToReschedule;
    if (!showRescheduleModal || !booking) return;

    async function fetchRescheduleSlots() {
      if (!booking) return;
      setLoadingSlots(true);
      setSelectedRescheduleTimeSlot('');
      try {
        const usernameWithoutAt = booking.username.replace('@', '');
        const year = rescheduleDate.getFullYear();
        const month = String(rescheduleDate.getMonth() + 1).padStart(2, '0');
        const day = String(rescheduleDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const res = await fetch(`/api/creators/${usernameWithoutAt}/availability?date=${dateStr}`);
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
  }, [rescheduleDate, showRescheduleModal, bookingToReschedule]);

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancelId(bookingId);
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
      if (res.ok) {
        setSuccessModalType('cancelled');
        setShowSuccessModal(true);
        loadData();
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (err) {
      alert('Error cancelling appointment');
    } finally {
      setBookingToCancelId(null);
    }
  };

  const handleRescheduleClick = (booking: Booking) => {
    setBookingToReschedule(booking);
    setRescheduleDate(booking.scheduledDate ? new Date(booking.scheduledDate) : new Date());
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async () => {
    if (!bookingToReschedule || !selectedRescheduleTimeSlot) {
      alert('Please select a new time slot');
      return;
    }
    try {
      const year = rescheduleDate.getFullYear();
      const month = String(rescheduleDate.getMonth() + 1).padStart(2, '0');
      const day = String(rescheduleDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const res = await fetch(`/api/user/bookings/${bookingToReschedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedDate: dateStr,
          selectedTime: selectedRescheduleTimeSlot,
        })
      });
      if (res.ok) {
        setShowRescheduleModal(false);
        setSuccessModalType('rescheduled');
        setShowSuccessModal(true);
        loadData();
      } else {
        alert('Failed to reschedule appointment');
      }
    } catch (err) {
      alert('Error rescheduling appointment');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredBookings = bookings.filter((b) => {
    const matchesTab = activeTab === 'Cancelled' ? b.originalStatus === 'cancelled' : b.status === activeTab;
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
                          <span className="bg-[#E6F9EE] text-[#12B76A] font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-2xs">
                            Accepted
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium font-sans mt-0.5">{booking.username}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-lg sm:text-xl text-[#0012FF] font-sans tracking-tight shrink-0 ml-2">
                      {booking.price}
                    </span>
                  </div>

                  {/* Time & Location Row */}
                  <div className="space-y-1.5 text-xs text-gray-500 font-sans font-medium my-3">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{booking.date} at {booking.time}</span>
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
                  <p className="text-xs text-gray-400 font-sans leading-relaxed line-clamp-2">
                    {booking.bio}
                    <span className="text-[#0012FF] font-bold text-xs ml-1 hover:underline cursor-pointer">Read more</span>
                  </p>
                </div>

                {/* Action Buttons (for Upcoming) */}
                {activeTab === 'Upcoming' && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
                    <button
                      onClick={() => {
                        if (booking.meetingUrl && booking.bookingRef) {
                          setMeetingToJoin({ url: booking.meetingUrl, ref: booking.bookingRef });
                        } else {
                          alert('Meeting link is not available yet.');
                        }
                      }}
                      className="w-full py-2.5 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-full text-xs font-bold text-center transition-all cursor-pointer shadow-md shadow-[#0012FF]/20"
                    >
                      Join Meeting
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRescheduleClick(booking)}
                        className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelClick(booking.id)}
                        className="flex-1 py-2 bg-[#FFF0F0] border border-red-100 hover:bg-red-100 text-[#FF3B3B] rounded-full text-xs font-semibold text-center transition-all cursor-pointer"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center text-gray-500 text-sm font-medium shadow-2xs">
            No {activeTab.toLowerCase()} bookings found.
          </div>
        )}
      </>
      )}
      </main>

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-2xl p-6 sm:p-8 flex flex-col overflow-hidden">
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
                    const isSelected = selectedRescheduleTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedRescheduleTimeSlot(slot)}
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
                disabled={!selectedRescheduleTimeSlot}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
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
                  successModalType === 'cancelled'
                    ? '/assets/cancel-appointment.webp'
                    : '/assets/reschedule.webp'
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
                : 'Booking Rescheduled'}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-6 max-w-[260px] sm:max-w-[280px]">
              {successModalType === 'cancelled'
                ? 'Your booking has been cancelled successfully.'
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
            
            <div className="w-24 h-24 mb-6">
              <img src="/assets/meeting.png" alt="Meeting" className="w-full h-full object-contain" />
            </div>
            
            <h3 className="text-2xl font-extrabold text-black mb-2 tracking-tight">Ready to join?</h3>
            <p className="text-gray-500 text-sm mb-4">
              Your meeting is ready. Make sure your camera and microphone are connected before joining.
            </p>
            
            <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6">
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Meeting Link</p>
              <p className="text-sm font-medium text-gray-700 truncate">{window.location.origin}/meeting/{meetingToJoin.ref}</p>
            </div>

            <button
              onClick={() => setActiveCallUrl(meetingToJoin.url)}
              className="w-full bg-[#0012FF] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#0012FF]/20 cursor-pointer"
            >
              Start Meeting
            </button>
          </div>
        </div>
      )}

      {/* Active Daily Call Modal */}
      {activeCallUrl && (
        <DailyCall url={activeCallUrl} onLeave={() => setActiveCallUrl(null)} />
      )}
    </div>
  );
}
