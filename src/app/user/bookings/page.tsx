'use client';

import { useEffect, useState, useRef } from 'react';
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
  name: string;
  username: string;
  avatar: string;
  status: 'Accepted' | 'Rejected' | 'Pending';
  price: string;
  date: string;
  time: string;
  location: 'In-person' | 'Online';
  bio: string;
}

const mockBookings: Booking[] = [
  { id: '1', name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg', status: 'Accepted', price: '2500 PKR', date: 'Sat', time: '03:00 PM to 05:00 PM', location: 'In-person', bio: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content...' },
  { id: '2', name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg', status: 'Rejected', price: '2500 PKR', date: 'Sat', time: '03:00 PM to 05:00 PM', location: 'In-person', bio: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content...' },
  { id: '3', name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg', status: 'Accepted', price: '2500 PKR', date: 'Sat', time: '03:00 PM to 05:00 PM', location: 'Online', bio: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content...' },
  { id: '4', name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg', status: 'Accepted', price: '2500 PKR', date: 'Sat', time: '03:00 PM to 05:00 PM', location: 'In-person', bio: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content...' },
  { id: '5', name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg', status: 'Rejected', price: '2500 PKR', date: 'Sat', time: '03:00 PM to 05:00 PM', location: 'Online', bio: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content...' },
  { id: '6', name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg', status: 'Accepted', price: '2500 PKR', date: 'Sat', time: '03:00 PM to 05:00 PM', location: 'In-person', bio: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content...' },
  { id: '7', name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg', status: 'Accepted', price: '2500 PKR', date: 'Sat', time: '03:00 PM to 05:00 PM', location: 'Online', bio: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content...' },
  { id: '8', name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg', status: 'Rejected', price: '2500 PKR', date: 'Sat', time: '03:00 PM to 05:00 PM', location: 'Online', bio: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content...' },
  { id: '9', name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg', status: 'Accepted', price: '2500 PKR', date: 'Sat', time: '03:00 PM to 05:00 PM', location: 'In-person', bio: 'Passionate content creator dedicated to helping brands and businesses connect with their audience through engaging, high-quality content...' },
];

export default function UserBookingsPage() {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming');
  const [displayName, setDisplayName] = useState('James Richard');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState<string>('02');
  const [selectedRescheduleTimeSlot, setSelectedRescheduleTimeSlot] = useState<string>('3 PM - 4 PM');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authRes = await fetch('/api/user/me');
        if (authRes.ok) {
          const userData = await authRes.json();
          if (userData.user) {
            setDisplayName(userData.user.name || 'James Richard');
            setProfilePhoto(userData.user.image || null);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

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
                {tab} <span className="text-sm opacity-80">({tab === 'Upcoming' ? 9 : tab === 'Past' ? 6 : 3})</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookings"
              className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0012FF]/20 w-64"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockBookings.map((booking, index) => (
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
                      {booking.location === 'In-person' ? (
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
                      <span>{booking.location}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 pr-4">
                    {booking.bio} <span className="text-[#0012FF] cursor-pointer font-semibold">Read more</span>
                  </p>
                </div>
                <div>
                  <div className="w-full h-px bg-gray-200 mb-4"></div>
                  <div className="flex items-center gap-3 px-4">
                    <button
                      onClick={() => setShowRescheduleModal(true)}
                      className="flex-1 py-2 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all bg-white"
                    >
                      Reschedule
                    </button>
                    <button
                      className="flex-1 py-2 border-2 border-red-200 rounded-2xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                </div>
                {/* Arrow indicator (from creator calendar) */}
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
      </div>

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
                      className={`flex flex-col items-center justify-center min-w-[36px] py-1.5 rounded-lg text-xs transition-all ${selectedRescheduleDate === d.num
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
                    className={`py-3 px-1 border rounded-xl text-xs font-semibold text-center transition-all ${selectedRescheduleTimeSlot === slot
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
                onClick={() => setShowRescheduleModal(false)}
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
}
