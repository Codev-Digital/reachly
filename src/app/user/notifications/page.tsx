'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';
import UserTopBar from '@/components/UserTopBar';

export default function UserNotifications() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Your booking is confirmed!',
      message: 'Your session with Kainat Aslam has been confirmed.',
      time: '2h ago',
      read: false,
    },
    {
      id: 2,
      title: 'New review from Bilal',
      message: 'Bilal left a 5-star review for your session.',
      time: '1d ago',
      read: true,
    },
    {
      id: 3,
      title: 'Payment received',
      message: 'Your payment of PKR 1,200 to Kainat Aslam has been processed.',
      time: '2d ago',
      read: true,
    },
  ];

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

            <div className="flex items-center justify-between mb-6">
              <h1 className="font-serif text-4xl font-bold text-[#C8A97E]">Notifications</h1>
              <button className="bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] text-[#C8A97E] px-4 py-2 rounded-xl text-sm font-sans">
                Mark all as read
              </button>
            </div>

            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-2xl p-6 ${
                    notification.read
                      ? 'bg-[#141414] border-[rgba(200,169,126,0.2)]'
                      : 'bg-[rgba(200,169,126,0.05)] border-[rgba(200,169,126,0.4)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-serif text-lg font-semibold mb-2 ${
                        notification.read ? 'text-[#F9F6F2] opacity-80' : 'text-[#C8A97E]'
                      }`}>
                        {notification.title}
                      </h3>
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-2">
                        {notification.message}
                      </p>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-50">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-3 h-3 bg-[#C8A97E] rounded-full flex-shrink-0" />
                    )}
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
