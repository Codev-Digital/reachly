'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import UserNavbar from '@/components/UserNavbar';
import LoadingAnimation from '@/components/LoadingAnimation';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

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
    if (activeTab === 'Cancelled') {
      return b.originalStatus === 'cancelled';
    }
    return b.status === activeTab;
  });

  const countUpcoming = bookings.filter((b) => b.status === 'Upcoming').length;
  const countPast = bookings.filter((b) => b.status === 'Past').length;
  const countCancelled = bookings.filter((b) => b.originalStatus === 'cancelled').length;

  if (loading) return <LoadingAnimation />;

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Heading */}
        <FadeUp className="mb-8">
          <p className="text-gray-500 text-sm font-sans mb-1">Hello {displayName.split(' ')[0]}!</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-anton tracking-tight">
            Manage Your <span className="text-[#0012FF] font-black italic">Bookings</span> <span className="text-gray-400 font-normal text-base sm:text-lg">with ease</span>
          </h1>
        </FadeUp>

        {/* Guest banner — shown when viewing without login */}
        {isGuest && (
          <div className="mb-6 flex items-center justify-between gap-4 bg-[#EEF2FF] border border-[#0012FF]/20 rounded-2xl px-5 py-3.5">
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

        {/* Tabs and Search */}
        <div className="flex flex-wrap items-center justify-between mb-6 sm:mb-8 gap-3">
          <div className="flex gap-3">
            {(['Upcoming', 'Past', 'Cancelled'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${activeTab === tab ? 'bg-[#0012FF] text-white' : 'bg-white text-gray-600 border border-gray-200'
                  }`}
              >
                {tab} <span className="text-sm opacity-80">
                  ({tab === 'Upcoming' ? countUpcoming : tab === 'Past' ? countPast : countCancelled})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length > 0 ? (
          <div className="flex flex-wrap gap-6 justify-start">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="relative w-full max-w-[420px] min-h-[220px] sm:min-h-[212px] z-10 flex flex-col"
              >
                {/* Background Card Image */}
                <Image
                  src="/assets/rec-card.png"
                  alt=""
                  fill
                  className="object-fill pointer-events-none -z-10"
                />
                {/* Content */}
                <div className="relative w-full pl-6 pr-14 pt-6 pb-6 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <Image src={booking.avatar} alt={booking.creator} className="w-full h-full object-cover" width={48} height={48} />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-black leading-tight">{booking.creator}</h3>
                          <p className="text-sm text-gray-500">{booking.username}</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg text-[#0012FF]">{booking.price}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{booking.date} at {booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <polyline points="3.5 20 8 17 16 17 20.5 20" />
                        </svg>
                        <span>{booking.location}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 pr-4">
                      {booking.bio}
                    </p>
                  </div>
                  {activeTab === 'Upcoming' && (
                    <div>
                      <div className="w-full h-px bg-gray-200 mb-4"></div>
                      <div className="flex items-center gap-3 px-4">
                        <button
                          onClick={() => handleRescheduleClick(booking)}
                          className="flex-1 py-2 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all bg-white"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancelClick(booking.id)}
                          className="flex-1 py-2 border-2 border-red-200 rounded-2xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Arrow indicator */}
                  <div className="absolute right-0.5 bottom-0.5">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 17L17 7M17 7H10M17 7V14"
                        stroke="#0012FF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-250 p-12 text-center text-gray-500 text-base font-semibold shadow-sm">
            No {activeTab.toLowerCase()} bookings found.
          </div>
        )}
      </div>

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="relative w-full max-w-lg flex flex-col items-center justify-between p-4 sm:p-8 pt-20 sm:pt-14 pb-8 sm:pb-8 min-h-[480px] sm:min-h-[520px] z-10">
            {/* SVG Background */}
            <img
              src="/assets/cancel-card.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
            />

            {/* Close Button */}
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute top-3 sm:-top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-all z-20 border border-gray-100/50 cursor-pointer text-gray-500"
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

            <div className="flex flex-col items-center w-full flex-grow pt-6 sm:pt-3">
              <h3 className="text-lg sm:text-[22px] font-bold text-black mb-2">
                Reschedule Appointment
              </h3>

              <p className="text-gray-500 text-center mb-4 sm:mb-6 text-xs sm:text-[13px]">
                Choose a new date and time for your session.
              </p>

              {/* Next 14 Days Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full no-scrollbar pb-3 mb-4 sm:mb-6 border-b border-gray-100">
                {getRescheduleDays().map((d, idx) => {
                  const isSelected =
                    rescheduleDate.getDate() === d.getDate() &&
                    rescheduleDate.getMonth() === d.getMonth() &&
                    rescheduleDate.getFullYear() === d.getFullYear();

                  const dayName = d.toLocaleDateString("en-US", {
                    weekday: "short",
                  });
                  const dayNum = String(d.getDate()).padStart(2, "0");

                  return (
                    <button
                      key={idx}
                      onClick={() => setRescheduleDate(d)}
                      className={`flex flex-col items-center justify-center min-w-[48px] py-1.5 rounded-xl text-xs transition-all border shrink-0 cursor-pointer ${isSelected
                          ? "bg-[#EEF2FF] border-[#0012FF] text-[#0012FF] font-bold"
                          : "border-gray-200 text-gray-400 hover:bg-gray-50 bg-white"
                        }`}
                    >
                      <span className="text-[8px] uppercase font-bold mb-0.5">
                        {dayName}
                      </span>
                      <span className="text-xs sm:text-sm font-black">
                        {dayNum}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="w-full mb-3">
                {loadingSlots ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-9 sm:h-10 bg-gray-100 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : rescheduleSlots.length === 0 ? (
                  <p className="text-gray-400 text-center text-xs sm:text-sm">
                    No slots available on this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 sm:max-h-48 overflow-y-auto pr-1 no-scrollbar">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedRescheduleTimeSlot(slot)}
                        className={`py-1.5 px-1 border rounded-xl text-[11px] sm:text-xs font-semibold text-center transition-all cursor-pointer ${selectedRescheduleTimeSlot === slot
                            ? "bg-[#EEF2FF] border-[#0012FF] text-[#0012FF]"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50 bg-white"
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmReschedule}
                  disabled={!selectedRescheduleTimeSlot}
                  className="flex-1 py-2 bg-[#0012FF] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#0010d0] transition-all disabled:bg-gray-200 disabled:text-gray-400"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Cancel Confirmation Modal */}
      {showCancelConfirmModal && (
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
              onClick={() => setShowCancelConfirmModal(false)}
              className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-50 transition-all z-20"
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
                alt="Cancel Booking"
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
              Are you sure you want to cancel this booking?
            </p>

            {/* Actions */}
            <div className="flex justify-center gap-3 w-full">
              <button
                onClick={() => setShowCancelConfirmModal(false)}
                className="w-32 sm:w-36 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmCancel}
                className="w-32 sm:w-36 py-2 sm:py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all"
              >
                Yes, Cancel
              </button>
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
              className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-50 transition-all z-20"
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
            <p className="text-xs sm:text-sm text-gray-500 text-center mb-5 sm:mb-6">
              {successModalType === "cancelled"
                ? "Your booking has been cancelled successfully."
                : "Your booking has been rescheduled successfully."}
            </p>

            {/* Action */}
            <div className="flex justify-center w-full">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-32 sm:w-36 py-2 sm:py-2.5 bg-[#0012FF] text-white rounded-xl text-sm font-semibold hover:bg-[#0010d0] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
