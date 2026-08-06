'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import LoadingAnimation from '@/components/LoadingAnimation';
import { Calendar, Clock, Video, MapPin, MessageSquare, AlertTriangle, CheckCircle, ArrowUpRight, X } from 'lucide-react';
import DailyCall from '@/components/DailyCall';
import { isMeetingPassed } from '@/lib/time';

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
  status: 'confirmed' | 'cancelled' | 'completed';
  isRescheduled?: boolean;
  meetingUrl?: string;
  bookingRef?: string;
}

export default function CreatorCalendar() {
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const selectedDayRef = useRef<HTMLButtonElement | null>(null);

  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedDayRef.current) {
        selectedDayRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentDate, loading]);

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
  const [meetingToJoin, setMeetingToJoin] = useState<{ url: string; ref: string } | null>(null);
  const [activeCallUrl, setActiveCallUrl] = useState<string | null>(null);

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

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: numDays }, (_, i) => (i + 1).toString().padStart(2, '0'));
  };

  // Fetch creator profile & bookings
  const loadInitialData = useCallback(async () => {
    try {
      const [meRes, bookingsRes] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/creators/bookings')
      ]);

      if (meRes.ok) {
        const data = await meRes.json();
        setDisplayName(data.creatorProfile?.displayName || data.user?.name || '');
        setProfilePhoto(data.creatorProfile?.profilePhoto || null);
        setUsername(data.creatorProfile?.username || '');
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        if (data.bookings) {
          // Format bookings for UI
          const list = data.bookings.map((b: any) => ({
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

  // Group and filter bookings for currently selected day
  const currentBookings = bookings.filter((b) => {
    if (!b.selectedDate) return false;
    const d = new Date(b.selectedDate);
    return (
      d.getDate() === currentDate.getDate() &&
      d.getMonth() === currentDate.getMonth() &&
      d.getFullYear() === currentDate.getFullYear()
    );
  });

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

        {/* Date Filter Strip Bar */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 mb-8 flex flex-wrap items-center justify-between gap-y-4 gap-x-2 shadow-xs">
          {/* Left: Month Selector Button */}
          <div className="relative flex-shrink-0 order-1">
            <button
              onClick={() => { setMonthDropdownOpen(!monthDropdownOpen); setYearDropdownOpen(false); }}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 transition-all cursor-pointer"
            >
              <span className="text-gray-400 font-normal">Month</span>
              <span className="font-bold">{currentDate.toLocaleString('default', { month: 'long' })}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {monthDropdownOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-40 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 max-h-60 overflow-y-auto">
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

          {/* Middle: Horizontal Days Strip */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1 px-1 w-full lg:w-auto lg:flex-1 order-3 lg:order-2">
            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              const isSelected = currentDate.getDate() === dayNum;

              return (
                <button
                  key={dayNum}
                  ref={isSelected ? selectedDayRef : null}
                  onClick={() => {
                    const newD = new Date(currentDate);
                    newD.setDate(dayNum);
                    setCurrentDate(newD);
                  }}
                  className={`flex flex-col items-center justify-center min-w-[46px] sm:min-w-[50px] h-[52px] py-1.5 px-1 rounded-[14px] transition-all cursor-pointer flex-shrink-0 ${isSelected
                    ? 'bg-[#EEF2FF] border border-[#0012FF]/30 text-[#0012FF] shadow-xs'
                    : 'text-[#64748B] hover:bg-gray-100 bg-transparent'
                    }`}
                >
                  <span className={`text-[9px] uppercase font-bold tracking-wider ${isSelected ? 'text-[#0012FF]/80' : 'text-[#64748B]'}`}>
                    {dayName}
                  </span>
                  <span className={`text-xs sm:text-sm font-extrabold mt-0.5 ${isSelected ? 'text-[#0012FF]' : 'text-gray-800'}`}>
                    {String(dayNum).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Year Selector Button */}
          <div className="relative flex-shrink-0 order-2 lg:order-3 ml-auto lg:ml-0">
            <button
              onClick={() => { setYearDropdownOpen(!yearDropdownOpen); setMonthDropdownOpen(false); }}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 transition-all cursor-pointer"
            >
              <span className="text-gray-400 font-normal">Year</span>
              <span className="font-bold">{currentDate.getFullYear()}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {yearDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-28 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
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

        {/* Bookings Grid or Empty State */}
        {currentBookings.length > 0 ? (
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
                            <button
                              disabled={passed}
                              onClick={() => {
                                if (booking.meetingUrl && booking.bookingRef) {
                                  setMeetingToJoin({ url: booking.meetingUrl, ref: booking.bookingRef });
                                } else {
                                  alert('Meeting link is not available yet.');
                                }
                              }}
                              className={`w-full py-2.5 rounded-full text-xs font-bold text-center transition-all shadow-md ${
                                passed
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                  : 'bg-[#0012FF] hover:bg-[#0012FF]/90 text-white shadow-[#0012FF]/20 cursor-pointer'
                              }`}
                            >
                              {passed ? 'Meeting Ended' : 'Join Meeting'}
                            </button>

                            {passed ? (
                              <button
                                onClick={() => router.push(`/creators/chats?bookingRef=${booking.bookingRef}`)}
                                className="w-full py-2.5 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-full text-xs font-bold text-center transition-all cursor-pointer shadow-md shadow-[#0012FF]/20"
                              >
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
            ))}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          {isRescheduleSuccess ? (
            <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden">
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
            <div className="relative bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-gray-100 w-full max-w-2xl p-6 sm:p-8 flex flex-col overflow-hidden">

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
