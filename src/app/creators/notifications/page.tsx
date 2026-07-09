'use client';

import { motion } from 'framer-motion';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState, useEffect } from 'react';

interface NotificationType {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  time: string;
  createdAt: string;
}

export default function CreatorNotifications() {
  const [activeTab, setActiveTab] = useState('All Types');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  const notificationTypes = ['All Types', 'Booking', 'Reschedule', 'Cancellation', 'Reminder', 'Payout', 'Review', 'Verification', 'System'];

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/creators/notifications');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/creators/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch('/api/creators/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'All Types') return true;
    return n.type.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <CreatorSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            {/* Mobile sidebar toggle button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden mb-4 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg p-2 text-[#C8A97E]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Header / Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#C8A97E] mb-2">Notifications</h1>
                <p className="font-sans text-sm text-[#F9F6F2] opacity-60">Stay updated on bookings, payouts, reviews, and more.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-5 py-2 rounded-lg text-sm font-sans text-[#F9F6F2] hover:bg-white/5 transition-all"
                >
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
                    <div className="absolute top-full right-0 mt-1 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl overflow-hidden z-10 shadow-lg">
                      {notificationTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setActiveTab(type);
                            setShowDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-sans transition-colors ${activeTab === type
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
            {loading ? (
              <p className="text-gray-500 text-sm animate-pulse">Loading notifications...</p>
            ) : filteredNotifications.length === 0 ? (
              <div className="bg-[#141414] border border-[rgba(200,169,126,0.1)] rounded-xl p-8 text-center text-gray-500 text-sm font-sans">
                No notifications found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification, idx) => (
                  <motion.div
                    key={notification._id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + idx * 0.03 }}
                    className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5 cursor-pointer hover:bg-[#181818] transition-colors"
                    onClick={() => !notification.read && handleMarkRead(notification._id)}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#C8A97E] rounded-full mt-2 flex-shrink-0"></div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-serif text-lg font-semibold text-[#C8A97E]">{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-sans text-[#F9F6F2] opacity-60">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="font-sans text-sm text-[#F9F6F2] opacity-70">{notification.message}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}