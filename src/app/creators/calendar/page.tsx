'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const CreatorCalendar = () => {
  const pathname = usePathname();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [activeNavItem, setActiveNavItem] = useState('Calendar');
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(1); // Default to 02
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<any>(null);

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

  const navItems = [
    { name: 'Dashboard', href: '/creators/dashboard', icon: 'dashboard' },
    { name: 'Events', href: '/creators/events', icon: 'events' },
    { name: 'Calendar', href: '/creators/calendar', icon: 'calendar' },
    { name: 'Wallet', href: '/creators/wallet', icon: 'wallet' },
    { name: 'Settings', href: '/creators/settings', icon: 'settings' },
  ];

  const days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      {/* Top Navigation Bar */}
      <div className="px-4 sm:px-6 pt-4">
        <nav className="bg-white shadow-sm border border-gray-100 sticky top-0 z-50 rounded-3xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/assets/logo1.png"
                  alt="Reachly"
                  width={100}
                  height={40}
                  className="object-contain w-auto h-auto"
                />
              </Link>

              {/* Navigation Items */}
              <div className="flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setActiveNavItem(item.name)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-md font-semibold transition-all ${
                      activeNavItem === item.name
                        ? 'text-[#0012FF]'
                        : 'text-gray-600 hover:text-[#0012FF]'
                    }`}
                  >
                    {item.icon === 'events' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )}
                    {item.icon === 'dashboard' && (
                      activeNavItem === 'Dashboard' ? (
                        <Image
                          src="/assets/dashboard.png"
                          alt="Dashboard"
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="9" rx="1" />
                          <rect x="14" y="3" width="7" height="5" rx="1" />
                          <rect x="14" y="11" width="7" height="10" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                        </svg>
                      )
                    )}
                    {item.icon === 'calendar' && (
                      activeNavItem === 'Calendar' ? (
                        <Image
                          src="/assets/calendar.svg"
                          alt="Calendar"
                          width={36}
                          height={16}
                          className="object-contain"
                        />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )
                    )}
                    {item.icon === 'wallet' && (
                      activeNavItem === 'Wallet' ? (
                        <Image
                          src="/assets/wallet.svg"
                          alt="Wallet"
                          width={36}
                          height={16}
                          className="object-contain"
                        />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      )
                    )}
                    {item.icon === 'settings' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    )}
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>

                {/* Profile */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center">
                  {profilePhoto ? (
                    <Image src={profilePhoto} alt={displayName} className="w-full h-full object-cover" width={40} height={40} />
                  ) : displayName ? (
                    <span className="text-gray-700 font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <Image src="/Avatars/1.jpg" alt="User" className="w-full h-full object-cover" width={40} height={40} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-gray-500 font-sans mb-1">Hello {displayName ? displayName.split(' ')[0] : 'there'}!</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-black font-sans">
              You Have <span className="text-[#0012FF]">{currentBookings.length} Appointments</span> <span className="text-gray-400 font-normal text-lg">/ Today</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 bg-[#0012FF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0012FF]/90 transition-all shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Booking Link
          </button>
        </div>

        {/* Period Tabs and Date Selector */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Month</span>
              <span className="text-sm font-semibold">August</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-2 overflow-x-auto">
            {days.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDateIndex(i)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                  selectedDateIndex === i
                    ? 'bg-[#0012FF] text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-4 py-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Year</span>
              <span className="text-sm font-semibold">2026</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Bookings or No Appointments */}
        {currentBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="relative"
              >
                {/* SVG Background */}
                <Image
                  src="/assets/card.svg"
                  alt=""
                  width={440}
                  height={212}
                  className="w-full h-auto"
                />
                {/* Content */}
                <div className="absolute inset-0 pl-6 pr-14 pt-6 pb-2">
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
                    <p className="text-sm text-gray-500 mb-4">
                      {booking.note} <span className="text-[#0012FF] cursor-pointer font-semibold">Read more</span>
                    </p>
                    <div className="w-full h-px bg-gray-200 mb-4"></div>
                  <div className="flex items-center gap-3 px-4">
                    <button
                      onClick={() => handleRescheduleClick(booking)}
                      className="flex-1 py-2 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
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
                  {/* Arrow indicator */}
                  <div className="absolute -right-0.5 bottom-1">
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
          // No Appointments State
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="relative">
            <Image
              src="/assets/cancel-card.svg"
              alt="Reschedule Modal"
              width={600}
              height={700}
              className="w-full max-w-lg"
            />
            <div className="absolute inset-0 px-8 pt-10 pb-4 flex flex-col items-center justify-between">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="absolute top-1 right-59 w-7 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="flex flex-col items-center w-full">
                <Image
                  src="/assets/reschedule.png"
                  alt="Reschedule Appointment"
                  width={130}
                  height={100}
                  className="mb-4"
                />
                <h3 className="text-xl font-bold text-black mb-1">Reschedule Appointment</h3>
                <p className="text-gray-600 text-center mb-5 text-sm">
                  Choose a new date and time for your appointment
                </p>
                <div className="w-full space-y-3 mb-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Time *</label>
                    <select
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all"
                    >
                      <option value="">Select Time</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 py-2 border-2 border-gray-200 rounded-2xl text-base font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReschedule}
                  className="flex-1 py-2 bg-[#0012FF] text-white rounded-2xl text-base font-semibold hover:bg-[#0012FF]/90 transition-all"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorCalendar;
