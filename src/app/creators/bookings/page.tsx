'use client';

import { motion } from 'framer-motion';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

const CreatorBookings = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const tabs = ['Upcoming', 'Past', 'Cancelled', 'Pending Action'];

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <CreatorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          {/* Reusable Sidebar */}
          <CreatorSidebar />

          {/* Main Content */}
          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            {/* Header with search and quick actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Find a booking by ref or name...."
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

            {/* Page Title */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-serif text-3xl font-bold text-[#F9F6F2]">My Bookings</h1>
              <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] px-5 py-2 rounded-full text-sm font-sans text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-sans transition-all ${
                    activeTab === tab
                      ? 'bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] text-[#C8A97E]'
                      : 'bg-[#141414] border border-[rgba(255,255,255,0.1)] text-[#F9F6F2] opacity-70 hover:opacity-100'
                  }`}
                >
                  {tab} {index === 0 && '(2)'} {index === 1 && '(3)'} {index === 2 && '(2)'} {index === 3 && '(1)'}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder="Search by name, ref or session....."
                  className="w-full bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-10 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none focus:border-[#C8A97E]"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2" opacity="0.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              <select className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E]">
                <option>All session types</option>
              </select>
              <select className="bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E]">
                <option>All statuses</option>
              </select>
            </div>

            {/* Empty State */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-10 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-6">
                No upcoming bookings yet. Share your booking link to get started.
              </p>
              <button className="flex items-center gap-2 mx-auto bg-[#141414] border border-[rgba(200,169,126,0.3)] px-5 py-2 rounded-full text-sm font-sans text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Link
              </button>
            </motion.div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default CreatorBookings;