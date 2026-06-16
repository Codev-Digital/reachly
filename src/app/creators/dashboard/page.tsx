'use client';

import { motion } from 'framer-motion';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

const CreatorDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <CreatorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          {/* Reusable Sidebar */}
          <CreatorSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Content */}
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
            {/* Header with search and quick actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Find a booking"
                  className="w-full bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-full px-5 py-3 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2]/50 focus:outline-none focus:border-[#C8A97E]"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-full text-sm font-sans text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Booking Link
                </button>

                <button className="w-10 h-10 rounded-full bg-[#141414] border border-[rgba(200,169,126,0.3)] flex items-center justify-center text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>

                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C8A97E]">
                  <img src="/ahad raza mir.png" alt="Ahad" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Greeting Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-[#141414] to-[#0C0C0C] border border-[rgba(200,169,126,0.2)] rounded-xl p-5 mb-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#C8A97E]">
                  <img src="/ahad raza mir.png" alt="Ahad" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#F9F6F2]">Good evening, Ahad</h2>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-70">
                    Here is everything happening with your creator business today.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            >
              {[
                { label: 'Total earnings this month', value: 'PKR 8,243' },
                { label: 'Total bookings this month', value: '7' },
                { label: 'Upcoming sessions', value: '0' },
                { label: 'Profile views (7 days)', value: '1,247' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5"
                >
                  <div className="w-10 h-10 rounded-full bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <p className="font-serif text-xl font-bold text-[#F9F6F2] mb-1">{stat.value}</p>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-70">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Earnings Chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#F9F6F2]">Earnings (last 30 days)</h3>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-70">50 bookings · PKR 61,956 total</p>
                </div>
                <div className="text-right">
                  <span className="font-sans text-sm text-[#C8A97E] opacity-80">Net Earnings</span>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="h-56 bg-gradient-to-t from-[rgba(200,169,126,0.15)] to-transparent rounded-xl relative overflow-hidden flex items-end">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 500 200"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#C8A97E" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#C8A97E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 140 Q30 120 60 110 T120 90 T180 100 T240 80 T300 95 T360 70 T420 85 T500 60 L500 200 L0 200 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0 140 Q30 120 60 110 T120 90 T180 100 T240 80 T300 95 T360 70 T420 85 T500 60"
                    fill="none"
                    stroke="#C8A97E"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points */}
                  {[0, 60, 120, 180, 240, 300, 360, 420, 500].map((x, i) => (
                    <circle
                      key={i}
                      cx={x}
                      cy={[140, 110, 90, 100, 80, 95, 70, 85, 60][i]}
                      r="5"
                      fill="#C8A97E"
                    />
                  ))}
                </svg>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5 mb-6"
            >
              <h3 className="font-serif text-lg font-semibold text-[#F9F6F2] mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  'Copy Booking Link',
                  'Update Availability',
                  'Add Session Type',
                  'View Public Profile',
                ].map((action, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-2 bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-full text-sm font-sans text-[#C8A97E] hover:bg-[rgba(200,169,126,0.2)] transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    {action}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Recent Bookings and To Do / Weekly Tip */}
            <div className="space-y-6">
              {/* Recent Bookings */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 bg-[rgba(20,20,20,0.8)] border-b border-[rgba(255,255,255,0.1)]">
                  <h3 className="font-serif text-lg font-bold text-[#C8A97E]">Recent bookings</h3>
                  <a href="#" className="font-sans text-sm text-[#C8A97E] hover:underline">
                    View All
                  </a>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,20,0.5)]">
                        {['Follower', 'Session', 'Date', 'Status', 'Amount'].map((header) => (
                          <th
                            key={header}
                            className="text-left py-4 px-5 font-sans text-sm font-semibold text-[#C8A97E]"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { follower: 'Mariam Hussain', session: 'Style Consultation', date: '2025-06-28', status: 'Confirmed', amount: 'PKR 900' },
                        { follower: 'Sara Ahmed', session: 'Confidence Coaching', date: '2025-06-28', status: 'Confirmed', amount: 'PKR 900' },
                        { follower: 'Nida Shah', session: 'Content Strategy', date: '2025-06-28', status: 'Confirmed', amount: 'PKR 900' },
                        { follower: 'Ahmed Raza', session: 'Style Consultation', date: '2025-06-28', status: 'Confirmed', amount: 'PKR 900' },
                        { follower: 'Bilal Qureshi', session: 'Content Strategy', date: '2025-06-28', status: 'Confirmed', amount: 'PKR 900' },
                      ].map((booking, index) => (
                        <motion.tr
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.8 + index * 0.05 }}
                          className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(200,169,126,0.05)]"
                        >
                          <td className="py-4 px-5">
                            <span className="font-sans text-sm text-[#F9F6F2]">{booking.follower}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className="font-sans text-sm text-[#F9F6F2]">{booking.session}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className="font-sans text-sm text-[#F9F6F2]">{booking.date}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className="font-sans text-sm text-[#F9F6F2]">{booking.status}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className="font-sans text-sm text-[#F9F6F2]">{booking.amount}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* To Do and Weekly Tip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* To Do List */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5"
                >
                  <h3 className="font-serif text-xl font-bold text-[#F9F6F2] mb-4">To-Do</h3>
                  <div className="space-y-3">
                    {[
                      'You have 3 unread reviews to respond to',
                      'Verify your CNIC for payouts over PKR 50,000',
                      'Update your May availability calendar',
                      'Your payout of PKR 45,200 is processing',
                      'Your payout of PKR 45,200 is processing',
                    ].map((task, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <p className="font-sans text-sm text-[#F9F6F2]">{task}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Weekly Tip */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5"
                >
                  <h3 className="font-serif text-xl font-bold text-[#C8A97E] mb-2">Weekly Tip</h3>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-80 mb-6">
                    Add an Instagram story with your booking link for a 3x conversion boost.
                  </p>
                  <button className="flex items-center gap-3 text-[#C8A97E] font-sans text-sm hover:opacity-80 transition-opacity">
                    <span>Copy Link</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="w-12 border-b-2 border-[rgba(200,169,126,0.4)] mt-2" />
                </motion.div>
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
