'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';
import UserTopBar from '@/components/UserTopBar';
import LoginToExplore from '@/components/LoginToExplore';

export default function UserDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const stats = [
    { label: 'Total sessions booked', value: '12' },
    { label: 'Total spent', value: 'PKR 8,100' },
    { label: 'Favourite creator', value: 'Kainat Aslam' },
  ];

  const recentActivity = [
    { text: 'You booked Hamza Ali for Startup Mentoring', date: '8 Jun' },
    { text: 'You left a 5-star review for Sana Mir', date: '8 Jun' },
    { text: 'You saved Ayesha Khan to your favourites', date: '8 Jun' },
    { text: 'Paid PKR 1,200 to Ayesha Khan for Style Consultation', date: '8 Jun' },
    { text: 'You booked Sana Mir for Live Training Session', date: '8 Jun' },
    { text: 'You left a 4-star review for Omar Farooq', date: '8 Jun' },
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

            {/* Welcome Card */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C8A97E]">
                  <img src="/ahad raza mir.png" alt="User" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#F9F6F2]">Welcome back, Bilal</h2>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-70">Here is everything happening with your Reachly journey today.</p>
                </div>
              </div>
            </div>

            {/* Upcoming Session */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img src="/merium in creators section.png" alt="Creator" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[rgba(200,169,126,0.15)] text-[#C8A97E] px-3 py-1 rounded-full text-xs font-sans">Upcoming</span>
                    <span className="text-xs font-sans text-[#F9F6F2] opacity-60">RCH-78492031</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#F9F6F2] mb-1">Live Training Session with Kainat</h3>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-3">Sat, 5 Jul 2025 at 06:00 PM</p>
                  <p className="font-sans text-sm text-[#C8A97E] font-medium">Starts in NaNh NaNm</p>
                </div>
                <button className="bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] text-[#C8A97E] px-5 py-2 rounded-full text-sm font-sans flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join meet
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-[rgba(255,255,255,0.05)] rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-serif text-xl font-bold text-[#C8A97E]">{stat.value}</p>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-70">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Creators */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-bold text-[#F9F6F2]">Recommended for you</h3>
                <button className="font-sans text-sm text-[#C8A97E]">See all</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl overflow-hidden">
                    <div className="h-40">
                      <img src="/yoga.jpg" alt="Yoga" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img src="/merium.png" alt="Creator" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-sans text-sm font-medium text-[#F9F6F2]">Kainat Aslam</p>
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-60">Lifestyle & Fashion</p>
                        </div>
                      </div>
                      <p className="font-sans text-sm text-[#C8A97E]">From PKR 1,200</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity & Upcoming Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                <h3 className="font-serif text-xl font-bold text-[#F9F6F2] mb-4">Recent activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="font-sans text-sm text-[#F9F6F2] opacity-80">{item.text}</p>
                      </div>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{item.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                <h3 className="font-serif text-xl font-bold text-[#F9F6F2] mb-4">Upcoming sessions</h3>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img src="/merium in creators section.png" alt="Creator" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[rgba(200,169,126,0.15)] text-[#C8A97E] px-2 py-0.5 rounded-full text-xs font-sans">Upcoming</span>
                          <span className="text-xs font-sans text-[#F9F6F2] opacity-60">RCH-78492031</span>
                        </div>
                        <p className="font-sans text-sm text-[#F9F6F2] mb-1">Live Training Session</p>
                        <p className="font-sans text-xs text-[#F9F6F2] opacity-60">Sat, 5 Jul 2025 at 06:00 PM</p>
                      </div>
                      <button className="bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-3 py-1.5 rounded-full text-xs font-sans">
                        Join meet
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
