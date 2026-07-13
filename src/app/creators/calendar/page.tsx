'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import LoadingAnimation from '@/components/LoadingAnimation';
import { Calendar, Clock, Video, MapPin, MessageSquare, AlertTriangle, CheckCircle, ArrowUpRight, X } from 'lucide-react';

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

  // Success Modal States
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalType, setSuccessModalType] = useState<'cancelled' | 'rescheduled'>('cancelled');

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
            amount: b.amount || '2,500 PKR',
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
        setSuccessModalType('rescheduled');
        setShowSuccessModal(true);
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

      {/* Main Content Area - Constrained Max Width */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-gray-500 font-sans mb-1 text-sm sm:text-base">{getGreeting()}, {displayName ? displayName.split(' ')[0] : 'there'}!</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-sans tracking-tight">
              You Have <span className="text-[#0012FF]">{currentBookings.length} Appointments</span> <span className="text-gray-400 font-normal text-base sm:text-lg">/ Today</span>
            </h1>
          </div>
        </div>

        {/* Date Selector Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white rounded-3xl border border-gray-200 shadow-sm mb-8">
          
          <div className="flex items-center gap-3">
            {/* Month Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setMonthDropdownOpen(!monthDropdownOpen); setYearDropdownOpen(false); }}
                className="flex items-center justify-between gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2.5 cursor-pointer transition-all select-none min-w-[130px]"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold">Month</span>
                  <span className="text-sm text-gray-800 font-bold">
                    {currentDate.toLocaleString('default', { month: 'long' })}
                  </span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-gray-500 transition-transform duration-200 ${monthDropdownOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {monthDropdownOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-[50] max-h-60 overflow-y-auto">
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

            {/* Year Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setYearDropdownOpen(!yearDropdownOpen); setMonthDropdownOpen(false); }}
                className="flex items-center justify-between gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl px-4 py-2.5 cursor-pointer transition-all select-none min-w-[100px]"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold">Year</span>
                  <span className="text-sm text-gray-800 font-bold">{currentDate.getFullYear()}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-gray-500 transition-transform duration-200 ${yearDropdownOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {yearDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-[50]">
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

          {/* Days Strip */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 px-1 max-w-full flex-1 no-scrollbar sm:justify-start">
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
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all flex-shrink-0 border ${
                    isSelected 
                      ? 'bg-[#0012FF] border-[#0012FF] text-white shadow-md shadow-blue-200 scale-105' 
                      : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-850'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings Grid or Empty State */}
        {currentBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between min-h-[220px] group overflow-hidden"
              >
                {/* Background soft hover glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0012FF]/0 via-[#0012FF]/0 to-[#0012FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Top Section: Client Meta */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-150 border-2 border-white shadow-sm ring-1 ring-gray-100">
                        <Image 
                          src={booking.avatar} 
                          alt={booking.name} 
                          className="w-full h-full object-cover" 
                          width={48} 
                          height={48} 
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-black leading-tight group-hover:text-[#0012FF] transition-colors">{booking.name}</h3>
                        <p className="text-xs text-gray-400 font-medium">{booking.handle}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-sm text-[#0012FF] bg-blue-50/80 px-3 py-1.5 rounded-xl border border-blue-100/50">
                      {booking.amount}
                    </span>
                  </div>

                  {/* Middleware Details */}
                  <div className="flex flex-col gap-2 text-xs text-gray-500 mb-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/60">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#0012FF] shrink-0" />
                      <span className="font-semibold text-gray-700">{booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.type === 'Online' ? (
                        <>
                          <Video className="h-3.5 w-3.5 text-[#0012FF] shrink-0" />
                          <span className="font-medium text-gray-600">Google Meet (Online)</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3.5 w-3.5 text-[#0012FF] shrink-0" />
                          <span className="font-medium text-gray-600">In-person Meeting</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Pre-session query note */}
                  <div className="flex items-start gap-2 mb-4 bg-[#F8F8FA] p-3 rounded-2xl border border-gray-100/40">
                    <MessageSquare className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 pr-1">
                      {booking.note}
                    </p>
                  </div>
                </div>

                {/* Bottom Section: Action Buttons */}
                <div>
                  <div className="w-full h-px bg-gray-100 mb-4"></div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleRescheduleClick(booking)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all bg-white shadow-sm active:scale-[0.98]"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancelClick(booking)}
                      className="flex-1 py-2.5 border border-red-100 rounded-2xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100/80 transition-all active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
            <Image
              src="/assets/no-appointment.png"
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
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-8 flex flex-col items-center">
            {/* Close Button */}
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon Banner */}
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-black text-center mb-2">
              Cancel Appointment
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Are you sure you want to cancel this appointment with <strong className="text-gray-800 font-semibold">{bookingToCancel?.name}</strong>? This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all bg-white"
              >
                Go Back
              </button>

              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-3 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 transition-all active:scale-[0.98]"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-8 flex flex-col items-center">
            {/* Close Button */}
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center w-full">
              <h3 className="text-xl font-bold text-black mb-1">Reschedule Session</h3>
              <p className="text-gray-500 text-center mb-6 text-xs sm:text-sm">
                Choose a new slot for your appointment with <strong className="text-gray-700">{bookingToReschedule?.name}</strong>.
              </p>

              {/* Next 14 Days Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full no-scrollbar pb-3.5 mb-6 border-b border-gray-150">
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
                      className={`flex flex-col items-center justify-center min-w-[50px] py-2 rounded-2xl text-xs transition-all border shrink-0 ${isSelected
                        ? 'bg-blue-50 border-[#0012FF] text-[#0012FF] font-bold shadow-sm'
                        : 'border-gray-200 text-gray-400 hover:bg-gray-50 bg-white'
                        }`}
                    >
                      <span className="text-[8px] uppercase font-bold mb-0.5 tracking-wider">{dayName}</span>
                      <span className="text-sm font-extrabold">{dayNum}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time Slots Grid */}
              <div className="w-full mb-6">
                {loadingSlots ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : rescheduleSlots.length === 0 ? (
                  <p className="text-gray-400 text-center text-xs py-4">No available timeslots on this date.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedRescheduleTime(slot)}
                        className={`py-2 px-3 border rounded-2xl text-xs font-bold text-center transition-all ${selectedRescheduleTime === slot
                          ? 'bg-[#0012FF] border-[#0012FF] text-white shadow-sm'
                          : 'border-gray-200 text-gray-650 hover:bg-gray-55 bg-white'
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
                  className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all bg-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmReschedule}
                  disabled={!selectedRescheduleTime}
                  className="flex-1 py-3 bg-[#0012FF] text-white rounded-2xl text-sm font-bold hover:bg-[#0010d0] transition-all disabled:bg-gray-100 disabled:text-gray-400 active:scale-[0.98]"
                >
                  Reschedule
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Success Modal (Cancelled or Rescheduled) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-8 flex flex-col items-center">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon Banner */}
            <div className="w-16 h-16 bg-emerald-55 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-black text-center mb-2">
              {successModalType === "cancelled"
                ? "Booking Cancelled"
                : "Booking Rescheduled"}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-550 text-center mb-6 leading-relaxed">
              {successModalType === "cancelled"
                ? "The session has been cancelled and the client has been notified."
                : "The session has been rescheduled successfully."}
            </p>

            {/* Action */}
            <div className="flex justify-center w-full">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-[#0012FF] text-white rounded-2xl text-sm font-bold hover:bg-[#0010d0] transition-all active:scale-[0.98]"
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
