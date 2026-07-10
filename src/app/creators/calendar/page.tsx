'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import LoadingAnimation from '@/components/LoadingAnimation';

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
}

export default function CreatorCalendar() {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule & Cancel Modal States
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<BookingType | null>(null);

  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<BookingType | null>(null);

  const [rescheduleDate, setRescheduleDate] = useState<Date>(new Date());
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState<string>('');

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
      const meRes = await fetch('/api/user/me');
      if (meRes.ok) {
        const data = await meRes.json();
        setDisplayName(data.creatorProfile?.displayName || data.user?.name || '');
        setProfilePhoto(data.creatorProfile?.profilePhoto || null);
        setUsername(data.creatorProfile?.username || '');
      }

      const bookingsRes = await fetch('/api/creators/bookings');
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        if (data.bookings) {
          // Format bookings for UI
          const list = data.bookings.map((b: any) => ({
            id: b.id,
            _id: b.id,
            name: b.follower || 'Client',
            handle: b.email ? `@${b.email.split('@')[0]}` : '@client',
            avatar: b.avatar || '/Avatars/3.jpg',
            time: b.time || 'N/A',
            type: b.type || 'Online',
            note: b.preSessionQuestion || 'No notes provided',
            amount: b.amount || '2500 PKR',
            selectedDate: b.scheduledDate,
            selectedTime: b.time,
            status: b.statusRaw,
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

  // Group and filter bookings for currently selected day
  const currentBookings = bookings.filter((b) => {
    if (!b.selectedDate || b.status === 'cancelled') return false;
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
        setBookings((prev) => prev.filter((b) => b.id !== bookingToCancel.id));
        alert('Booking cancelled successfully!');
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
        alert('Rescheduled successfully!');
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

  if (loading) return <LoadingAnimation />;

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      {/* Main Content */}
      <main className="px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <p className="text-gray-500 font-sans mb-1 text-sm sm:text-base">Hello {displayName ? displayName.split(' ')[0] : 'there'}!</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-sans">
              You Have <span className="text-[#0012FF]">{currentBookings.length} Appointments</span> <span className="text-gray-400 font-normal text-base sm:text-lg">/ Today</span>
            </h1>
          </div>
        </div>

        {/* Period Tabs and Date Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap mb-6 sm:mb-8">
          {/* Month Selector Dropdown */}
          <div className="relative">
            <div
              onClick={() => { setMonthDropdownOpen(!monthDropdownOpen); setYearDropdownOpen(false); }}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-50 transition-all select-none min-w-[110px]"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">Month</span>
                <span className="text-xs sm:text-sm text-gray-700 font-semibold">
                  {currentDate.toLocaleString('default', { month: 'long' })}
                </span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${monthDropdownOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {monthDropdownOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-40 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-[50] max-h-60 overflow-y-auto">
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                  <button
                    key={m}
                    onClick={() => selectMonth(idx)}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#0012FF]/5 transition-colors ${currentDate.getMonth() === idx ? 'text-[#0012FF] bg-[#0012FF]/5' : 'text-gray-600'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Days Strip */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-2 overflow-x-auto max-w-full flex-1">
            {getDaysInMonth().map((day, i) => {
              const isSelected = currentDate.getDate() === i + 1;
              return (
                <button
                  key={i}
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setDate(i + 1);
                    setCurrentDate(newDate);
                  }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-all flex-shrink-0 ${isSelected ? 'bg-[#0012FF] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Year Selector Dropdown */}
          <div className="relative">
            <div
              onClick={() => { setYearDropdownOpen(!yearDropdownOpen); setMonthDropdownOpen(false); }}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-50 transition-all select-none min-w-[90px]"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">Year</span>
                <span className="text-xs sm:text-sm text-gray-700 font-semibold">{currentDate.getFullYear()}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-200 ${yearDropdownOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {yearDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-28 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-[50]">
                {[2024, 2025, 2026, 2027, 2028, 2029].map((y) => (
                  <button
                    key={y}
                    onClick={() => selectYear(y)}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-[#0012FF]/5 transition-colors ${currentDate.getFullYear() === y ? 'text-[#0012FF] bg-[#0012FF]/5' : 'text-gray-600'}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bookings or No Appointments */}
        {currentBookings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="relative w-full h-auto min-h-[170px] z-10 flex flex-col"
              >
                {/* Background Card Image */}
                <Image
                  src="/assets/rec-card.png"
                  alt=""
                  fill
                  className="object-fill pointer-events-none -z-10"
                />
                {/* Content */}
                <div className="relative w-full pl-4 pr-12 pt-4 pb-4 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={booking.avatar} alt={booking.name} className="w-full h-full object-cover" width={40} height={40} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-black leading-tight">{booking.name}</h3>
                          <p className="text-xs text-gray-500">{booking.handle}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm text-[#0012FF] whitespace-nowrap">{booking.amount}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {booking.type === 'In-person' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <polyline points="3.5 20 8 17 16 17 20.5 20" />
                          </svg>
                        )}
                        <span>{booking.type}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 pr-2">
                      {booking.note}
                    </p>
                  </div>
                  <div>
                    <div className="w-full h-px bg-gray-200 mb-2.5"></div>
                    <div className="flex items-center gap-2 pr-8">
                      <button
                        onClick={() => handleRescheduleClick(booking)}
                        className="flex-grow py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-all bg-white"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelClick(booking)}
                        className="flex-grow py-1.5 border border-red-200 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {/* Arrow indicator */}
                  <div className="absolute right-0.5 bottom-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H10M17 7V14" stroke="#0012FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <Image
              src="/assets/no-appointment.png"
              alt="No Appointments"
              width={260}
              height={260}
              className="mb-8"
            />
            <h2 className="text-xl font-bold text-black mb-2">No Appointments Today</h2>
            <p className="text-gray-500 max-w-md">
              There are currently no appointments for the selected date. Check other dates in the selector.
            </p>
          </div>
        )}
      </main>

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              ✕
            </button>
            <div className="flex flex-col items-center">
              <Image
                src="/assets/cancel-appointment.png"
                alt="Cancel Appointment"
                width={180}
                height={120}
                className="mb-4 object-contain"
              />
              <h3 className="text-xl font-bold text-black mb-1">Are You Sure?</h3>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="relative w-full max-w-lg flex flex-col items-center justify-between p-8 pt-12 pb-8 min-h-[520px] z-10">
            {/* SVG Background notched card */}
            <img
              src="/assets/cancel-card.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
            />
            {/* Close Button */}
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute -top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-all z-20 border border-gray-100/50 cursor-pointer text-gray-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="flex flex-col items-center w-full flex-grow pt-3">
              <h3 className="text-[22px] font-bold text-black mb-1">Reschedule Appointment</h3>
              <p className="text-gray-500 text-center mb-6 text-[13px]">
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
              <div className="w-full mb-3">
                {loadingSlots ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : rescheduleSlots.length === 0 ? (
                  <p className="text-gray-400 text-center text-sm">No slots available on this date.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedRescheduleTime(slot)}
                        className={`py-1 px-1 border rounded-xl text-xs font-semibold text-center transition-all ${selectedRescheduleTime === slot
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
                  className="flex-1 py-1 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmReschedule}
                  disabled={!selectedRescheduleTime}
                  className="flex-1 py-1 bg-[#0012FF] text-white rounded-xl text-sm font-semibold hover:bg-[#0010d0] transition-all disabled:bg-gray-200 disabled:text-gray-400"
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
