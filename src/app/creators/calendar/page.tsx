'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const CreatorCalendar = () => {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(1); // Default to 02
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<any>(null);
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState<string>('02');
  const [selectedRescheduleTimeSlot, setSelectedRescheduleTimeSlot] = useState<string>('3 PM - 4 PM');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          const name = data.creatorProfile?.displayName || data.user?.name || '';
          const photo = data.creatorProfile?.profilePhoto || null;
          setDisplayName(name);
          setProfilePhoto(photo);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    loadProfile();
  }, []);

  // Define bookings for different dates (index 1 has bookings, others are empty)
  const bookingsByDate: Record<number, any[]> = {
    1: [ // 02 has appointments
      { id: 1, name: 'James Richard', handle: '@jamesrichard', avatar: '/Avatars/3.jpg', time: 'Sat at 03:00 PM to 05:00 PM', type: 'In-person', note: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...', amount: '2500 PKR' },
      { id: 2, name: 'James Richard', handle: '@jamesrichard', avatar: '/Avatars/5.jpg', time: 'Sat at 03:00 PM to 05:00 PM', type: 'Online', note: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...', amount: '2500 PKR' },
      { id: 3, name: 'James Richard', handle: '@jamesrichard', avatar: '/Avatars/3.jpg', time: 'Sat at 03:00 PM to 05:00 PM', type: 'Online', note: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...', amount: '2500 PKR' },
      { id: 4, name: 'James Richard', handle: '@jamesrichard', avatar: '/Avatars/5.jpg', time: 'Sat at 03:00 PM to 05:00 PM', type: 'In-person', note: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...', amount: '2500 PKR' },
      { id: 5, name: 'James Richard', handle: '@jamesrichard', avatar: '/Avatars/3.jpg', time: 'Sat at 03:00 PM to 05:00 PM', type: 'Online', note: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...', amount: '2500 PKR' },
      { id: 6, name: 'James Richard', handle: '@jamesrichard', avatar: '/Avatars/5.jpg', time: 'Sat at 03:00 PM to 05:00 PM', type: 'In-person', note: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...', amount: '2500 PKR' },
      { id: 7, name: 'James Richard', handle: '@jamesrichard', avatar: '/Avatars/3.jpg', time: 'Sat at 03:00 PM to 05:00 PM', type: 'Online', note: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...', amount: '2500 PKR' },
      { id: 8, name: 'James Richard', handle: '@jamesrichard', avatar: '/Avatars/5.jpg', time: 'Sat at 03:00 PM to 05:00 PM', type: 'In-person', note: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...', amount: '2500 PKR' },
      { id: 9, name: 'James Richard', handle: '@jamesrichard', avatar: '/Avatars/3.jpg', time: 'Sat at 03:00 PM to 05:00 PM', type: 'Online', note: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what...', amount: '2500 PKR' },
    ],
    // All other dates have no appointments
  };

  const currentBookings = bookingsByDate[selectedDateIndex] || [];

  const handleCancelClick = (booking: any) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    // Logic to cancel booking would go here
    setShowCancelModal(false);
    setBookingToCancel(null);
  };

  const handleRescheduleClick = (booking: any) => {
    setBookingToReschedule(booking);
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = () => {
    // Logic to reschedule booking would go here
    setShowRescheduleModal(false);
    setBookingToReschedule(null);
  };

  const days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];

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

          <button className="flex items-center gap-2 bg-[#0012FF] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-[#0012FF]/90 transition-all shadow-md w-fit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Booking Link
          </button>
        </div>

        {/* Period Tabs and Date Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap mb-6 sm:mb-8">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400">Month</span>
              <span className="text-xs sm:text-sm text-gray-700 font-semibold">July</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-2 overflow-x-auto max-w-full flex-1">
            {days.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDateIndex(i)}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-all flex-shrink-0 ${selectedDateIndex === i
                  ? 'bg-[#0012FF] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400">Year</span>
              <span className="text-xs sm:text-sm text-gray-700 font-semibold">2026</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
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
                          <Image src={booking.avatar} alt={booking.name} className="w-full h-full object-cover" width={48} height={48} />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-black">{booking.name}</h3>
                          <p className="text-sm text-gray-500">{booking.handle}</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg text-[#0012FF]">{booking.amount}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.type === 'In-person' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <polyline points="3.5 20 8 17 16 17 20.5 20" />
                            <line x1="8" y1="10" x2="8" y2="14" />
                            <line x1="11" y1="10" x2="11" y2="14" />
                            <line x1="14" y1="10" x2="14" y2="14" />
                          </svg>
                        )}
                        <span>{booking.type}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 pr-4">
                      {booking.note} <span className="text-[#0012FF] cursor-pointer font-semibold">Read more</span>
                    </p>
                  </div>
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
                        onClick={() => handleCancelClick(booking)}
                        className="flex-1 py-2 border-2 border-red-200 rounded-2xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  </div>
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
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <Image
              src="/assets/no-appointment.png"
              alt="No Appointments"
              width={300}
              height={300}
              className="mb-8"
            />
            <h2 className="text-xl font-bold text-black mb-2">No Appointments Available</h2>
            <p className="text-gray-500 max-w-md">
              There are currently no appointments available. Please check back again soon.
            </p>
          </div>
        )}
      </main>

      {/* Cancel Appointment Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="relative">
            <Image
              src="/assets/cancel-card.svg"
              alt="Cancel Modal"
              width={600}
              height={500}
              className="w-full max-w-lg"
            />
            <div className="absolute inset-0 px-8 pt-10 pb-6 flex flex-col items-center justify-between">
              <button
                onClick={() => setShowCancelModal(false)}
                className="absolute top-1 right-59 w-7 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="flex flex-col items-center w-full">
                <Image
                  src="/assets/cancel-appointment.png"
                  alt="Cancel Appointment"
                  width={300}
                  height={100}
                  className="mb-4"
                />
                <h3 className="text-xl font-bold text-black mb-1">Are You Sure?</h3>
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Are you sure you want to cancel this appointment? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2 border-2 border-gray-200 rounded-2xl text-base font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 py-2 bg-red-500 text-white rounded-2xl text-base font-semibold hover:bg-red-600 transition-all"
                >
                  Cancel Appointment
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
              className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-all z-20 border border-gray-100/50 cursor-pointer text-gray-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Content */}
            <div className="flex flex-col items-center w-full flex-grow">
              <h3 className="text-2xl font-bold text-black mb-1">Reschedule Appointment</h3>
              <p className="text-gray-500 text-center mb-6 text-sm">
                Choose a new date and time for your appointment
              </p>

              {/* Dates Slider */}
              <div className="flex items-center gap-1 w-full border border-gray-100 rounded-2xl p-2 mb-5 bg-white/50">
                <button className="text-gray-400 hover:text-black px-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-grow py-1 justify-between">
                  {[
                    { day: 'Mon', num: '01' },
                    { day: 'Tue', num: '02' },
                    { day: 'Wed', num: '03' },
                    { day: 'Thu', num: '04' },
                    { day: 'Fri', num: '05' },
                    { day: 'Sat', num: '06' },
                    { day: 'Sun', num: '07' },
                    { day: 'Mon', num: '08' },
                    { day: 'Tue', num: '09' },
                    { day: 'Wed', num: '10' },
                    { day: 'Thu', num: '12' },
                    { day: 'Fri', num: '13' },
                    { day: 'Sat', num: '15' },
                    { day: 'Sun', num: '16' },
                    { day: 'Mon', num: '17' },
                    { day: 'Tue', num: '18' },
                  ].map((d) => (
                    <button
                      key={d.num}
                      onClick={() => setSelectedRescheduleDate(d.num)}
                      className={`flex flex-col items-center justify-center min-w-[36px] py-1.5 rounded-lg text-xs transition-all ${
                        selectedRescheduleDate === d.num
                          ? 'bg-[#0012FF]/10 text-[#0012FF] font-bold border border-[#0012FF]/20'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-medium">{d.day}</span>
                      <span className="text-sm font-semibold">{d.num}</span>
                    </button>
                  ))}
                </div>
                <button className="text-gray-400 hover:text-black px-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* Time Slots Grid */}
              <div className="grid grid-cols-3 gap-2.5 w-full mb-6">
                {[
                  '11 AM - 12 PM',
                  '12 PM - 1 PM',
                  '1 PM - 2 PM',
                  '2 PM - 3 PM',
                  '3 PM - 4 PM',
                  '4 PM - 5 PM',
                  '5 PM - 6 PM',
                  '6 PM - 7 PM',
                  '7 PM - 8 PM',
                  '8 PM - 9 PM',
                  '9 PM - 10 PM',
                  '10 PM - 11 PM'
                ].map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedRescheduleTimeSlot(slot)}
                    className={`py-3 px-1 border rounded-xl text-xs font-semibold text-center transition-all ${
                      selectedRescheduleTimeSlot === slot
                        ? 'bg-[#0012FF]/10 border-[#0012FF] text-[#0012FF]'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full text-sm font-bold transition-all border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="flex-1 py-3.5 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-full text-sm font-bold transition-all shadow-md"
              >
                Reschedule Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorCalendar;
