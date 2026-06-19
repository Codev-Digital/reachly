'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';
import UserTopBar from '@/components/UserTopBar';
import LoginToExplore from '@/components/LoginToExplore';

export default function UserNotifications() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Session reminder',
      message: 'Your Live Training Session with Sana Mir starts in 2 hours.',
      date: '5 Jul',
      read: false,
    },
    {
      id: 2,
      title: 'Review requested',
      message: 'Your session with Fatima Noor ended yesterday. Please leave a review!',
      date: '5 Jul',
      read: false,
    },
    {
      id: 3,
      title: 'Refund processed',
      message: 'PKR 700 refunded for Cooking Class with Bilal Ahmed. It may take 3 to 5 business days.',
      date: '5 Jul',
      read: true,
    },
    {
      id: 4,
      title: 'Weekend offer',
      message: 'Get 20% off your next booking with code WEEKEND20. Valid until Sunday midnight.',
      date: '5 Jul',
      read: true,
    },
    {
      id: 5,
      title: 'Profile verified',
      message: 'Your email has been successfully verified. You can now book sessions with any creator.',
      date: '5 Jul',
      read: true,
    },
    {
      id: 6,
      title: 'Booking confirmed',
      message: 'Your Style Consultation with Ayesha Khan on July 10 is confirmed.',
      date: '5 Jul',
      read: true,
    },
    {
      id: 7,
      title: 'New review on your profile',
      message: 'You received a 5-star review for your Startup Mentoring session with Hamza Ali.',
      date: '5 Jul',
      read: true,
    },
    {
      id: 8,
      title: 'New creator joined',
      message: 'Bilal Ahmed (Food & Cooking) just joined Reachly. Book your first cooking class now!',
      date: '5 Jul',
      read: true,
    },
  ];

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#C8A97E]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] pb-12">
        <CreatorNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex gap-8">
            <UserSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            <main className="flex-1">
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
              <LoginToExplore />
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
      <CreatorNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <UserSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
          />

          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
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

            <UserTopBar searchPlaceholder="Search Creators" />

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="font-serif text-4xl font-bold text-[#C8A97E]">Notifications</h1>
                <div className="flex items-center gap-2">
                  <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-3 py-1.5 rounded-xl text-xs font-sans">
                    Mark all as read
                  </button>
                  <div className="relative">
                    <select 
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-3 py-1.5 rounded-xl text-xs font-sans appearance-none pr-8"
                    >
                      <option value="All">All</option>
                      <option value="Unread">Unread</option>
                      <option value="Read">Read</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-xl p-4 ${
                    notification.read
                      ? 'bg-[#141414] border-[rgba(200,169,126,0.2)]'
                      : 'bg-[rgba(200,169,126,0.05)] border-[rgba(200,169,126,0.4)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-serif text-base font-bold mb-1 ${
                        notification.read ? 'text-[#F9F6F2] opacity-80' : 'text-[#F9F6F2]'
                      }`}>
                        {notification.title}
                      </h3>
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-70">
                        {notification.message}
                      </p>
                    </div>
                    <p className="font-sans text-xs text-[#F9F6F2] opacity-60 flex-shrink-0 ml-4">
                      {notification.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
