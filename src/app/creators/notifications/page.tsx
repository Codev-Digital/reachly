'use client';

import { motion } from 'framer-motion';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

export default function CreatorNotifications() {
  const [activeTab, setActiveTab] = useState('All Types');
  const [showDropdown, setShowDropdown] = useState(false);

  const notificationTypes = ['All Types', 'Booking', 'Reschedule', 'Cancellation', 'Reminder', 'Payout', 'Review', 'Verification', 'System'];

  const notifications = [
    { id: 1, title: 'Payout failed', message: 'Your payout of PKR 55,000 to JazzCash failed. Reason: Account number incorrect. Please update your payment method.', time: '2 Min', read: false },
    { id: 2, title: 'Payout failed', message: 'Your payout of PKR 55,000 to JazzCash failed. Reason: Account number incorrect. Please update your payment method.', time: '2 Min', read: false },
    { id: 3, title: 'Payout failed', message: 'Your payout of PKR 55,000 to JazzCash failed. Reason: Account number incorrect. Please update your payment method.', time: '2 Min', read: false },
    { id: 4, title: 'Payout failed', message: 'Your payout of PKR 55,000 to JazzCash failed. Reason: Account number incorrect. Please update your payment method.', time: '2 Min', read: false },
    { id: 5, title: 'Payout failed', message: 'Your payout of PKR 55,000 to JazzCash failed. Reason: Account number incorrect. Please update your payment method.', time: '2 Min', read: false },
    { id: 6, title: 'Payout failed', message: 'Your payout of PKR 55,000 to JazzCash failed. Reason: Account number incorrect. Please update your payment method.', time: '2 Min', read: false },
    { id: 7, title: 'Payout failed', message: 'Your payout of PKR 55,000 to JazzCash failed. Reason: Account number incorrect. Please update your payment method.', time: '2 Min', read: false },
    { id: 8, title: 'Payout failed', message: 'Your payout of PKR 55,000 to JazzCash failed. Reason: Account number incorrect. Please update your payment method.', time: '2 Min', read: false },
    { id: 9, title: 'Payout failed', message: 'Your payout of PKR 55,000 to JazzCash failed. Reason: Account number incorrect. Please update your payment method.', time: '2 Min', read: false },
    { id: 10, title: 'Payout failed', message: 'Your payout of PKR 55,000 to JazzCash failed. Reason: Account number incorrect. Please update your payment method.', time: '2 Min', read: false },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
      <CreatorNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <CreatorSidebar />
          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Find a booking by ref or name..."
                  className="w-full bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-full px-5 py-3 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none focus:border-[#C8A97E]"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] px-5 py-2 rounded-full text-sm font-sans text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Booking Link
                </button>
                <button className="w-10 h-10 rounded-full bg-[#141414] border border-[rgba(200,169,126,0.3)] flex items-center justify-center text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C8A97E]">
                  <img src="/ahad raza mir.png" alt="Ahad" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-serif text-3xl font-bold text-[#C8A97E] mb-2">Notifications</h1>
                <p className="font-sans text-sm text-[#F9F6F2] opacity-60">Stay updated on bookings, payouts, reviews, and more.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-5 py-2 rounded-lg text-sm font-sans text-[#F9F6F2]">
                  Mark all as read
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-between gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-xl text-sm font-sans min-w-[140px] hover:border-[#C8A97E] transition-all"
                  >
                    {activeTab}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl overflow-hidden z-10 shadow-lg w-full">
                      {notificationTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setActiveTab(type);
                            setShowDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-sans transition-colors ${
                            activeTab === type
                              ? 'bg-[#C8A97E] text-[#0C0C0C]'
                              : 'text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {notifications.map((notification, idx) => (
                <motion.div
                  key={notification.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + idx * 0.03 }}
                  className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5"
                >
                  <div className="flex items-start gap-3">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-[#C8A97E] rounded-full mt-2 flex-shrink-0"></div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-serif text-lg font-semibold text-[#C8A97E]">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-sans text-[#F9F6F2] opacity-60">{notification.time}</span>
                          <button className="w-6 h-6 flex items-center justify-center text-[#F9F6F2] opacity-50 hover:opacity-100">
                            ⋮
                          </button>
                        </div>
                      </div>
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-4">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-lg text-xs font-sans text-[#C8A97E]">
                          Resend
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Notification Preference */}
            <div className="mt-6">
              <span className="font-sans text-sm text-[#F9F6F2] opacity-60">Notification Preference</span>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
