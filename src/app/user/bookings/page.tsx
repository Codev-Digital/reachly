'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import UserNavbar from '@/components/UserNavbar';
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
  const [displayName, setDisplayName] = useState('James Richard');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule States
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date>(new Date());
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedRescheduleTimeSlot, setSelectedRescheduleTimeSlot] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      const authRes = await fetch('/api/user/me');
      if (authRes.ok) {
        const userData = await authRes.json();
        if (userData.user) {
          setDisplayName(userData.user.name || 'James Richard');
          setProfilePhoto(userData.creatorProfile?.profilePhoto || userData.user.image || null);
        }
      }

      const bookingsRes = await fetch('/api/user/bookings');
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
            location: b.paymentMethod === 'Guest' ? 'Online' : 'In-person', // display helper or location
            bio: b.preSessionQuestion || 'No description provided.',
            status: b.status, // displayStatus: 'Upcoming', 'Past', 'Cancelled'
            originalStatus: b.originalStatus,
            scheduledDate: b.scheduledDate,
          }));
          setBookings(list);
        }
      }
    } catch (error) {
      console.error(error);
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

  const handleCancelClick = async (bookingId: string) => {
    const confirm = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirm) return;

    try {
      const res = await fetch(`/api/user/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        alert('Booking cancelled successfully!');
        loadData();
      } else {
        alert('Failed to cancel appointment');
      }
    } catch (err) {
      alert('Error cancelling appointment');
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
        alert('Rescheduled successfully!');
        setShowRescheduleModal(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FA] flex items-center justify-center">
        <p className="text-gray-500 font-semibold animate-pulse">Loading bookings...</p>
      </div>
    );
  }

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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="relative w-full h-auto min-h-[220px] sm:min-h-[212px] z-10 flex flex-col"
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              ✕
            </button>
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold text-black mb-1">Reschedule Appointment</h3>
              <p className="text-gray-500 text-center mb-6 text-sm">
                Choose a new date and time for your session.
              </p>

              {/* Next 14 Days Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full no-scrollbar pb-3 mb-6 border-b border-gray-100">
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
                      className={`flex flex-col items-center justify-center min-w-[50px] py-2 rounded-xl text-xs transition-all border shrink-0 ${isSelected
                        ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF] font-bold'
                        : 'border-gray-200 text-gray-400 hover:bg-gray-50 bg-white'
                        }`}
                    >
                      <span className="text-[9px] uppercase font-bold mb-0.5">{dayName}</span>
                      <span className="text-sm font-black">{dayNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time Slots Grid */}
              <div className="w-full mb-6">
                {loadingSlots ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : rescheduleSlots.length === 0 ? (
                  <p className="text-gray-400 text-center text-sm">No slots available on this date.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 w-full">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedRescheduleTimeSlot(slot)}
                        className={`py-2 px-1 border rounded-xl text-xs font-semibold text-center transition-all ${selectedRescheduleTimeSlot === slot
                          ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReschedule}
                  disabled={!selectedRescheduleTimeSlot}
                  className="flex-1 py-2.5 bg-[#0012FF] text-white rounded-xl text-sm font-semibold hover:bg-[#0010d0] transition-all disabled:bg-gray-200 disabled:text-gray-400"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
