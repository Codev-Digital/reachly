'use client';

import { motion } from 'framer-motion';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

type BookingStatus = 'Upcoming' | 'Past' | 'Cancelled' | 'Pending Action';

interface Booking {
  id: string;
  follower: string;
  avatar: string;
  session: string;
  date: string;
  time: string;
  duration: string;
  amount: string;
  status: BookingStatus;
  preSessionQuestion: string;
  reason?: string;
}

const CreatorBookings = () => {
  const [activeTab, setActiveTab] = useState<BookingStatus>('Upcoming');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [sessionTypeFilter, setSessionTypeFilter] = useState('All session types');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const tabs: { name: BookingStatus; count: number }[] = [
    { name: 'Upcoming', count: 2 },
    { name: 'Past', count: 3 },
    { name: 'Cancelled', count: 2 },
    { name: 'Pending Action', count: 1 },
  ];

  const sessionTypes = ['All session types', 'Style Consultation', 'Confidence Coaching', 'Content Strategy'];
  const statusOptions = ['All statuses', 'Confirmed', 'Pending', 'Cancelled', 'Completed'];

  const bookings: Booking[] = [
    {
      id: 'RCH-78492031',
      follower: 'Kainat Faisal',
      avatar: '/merium.png',
      session: 'Content Strategy',
      date: 'Sat, 30 May 2026',
      time: '03:00 PM',
      duration: '60 min',
      amount: 'PKR 2,500',
      status: 'Past',
      preSessionQuestion: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what equipment do I need?',
    },
    {
      id: 'RCH-78492032',
      follower: 'Kainat Faisal',
      avatar: '/merium.png',
      session: 'Content Strategy',
      date: 'Sat, 30 May 2026',
      time: '03:00 PM',
      duration: '60 min',
      amount: 'PKR 2,500',
      status: 'Past',
      preSessionQuestion: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what equipment do I need?',
    },
    {
      id: 'RCH-78492033',
      follower: 'Kainat Faisal',
      avatar: '/merium.png',
      session: 'Content Strategy',
      date: 'Sat, 30 May 2026',
      time: '03:00 PM',
      duration: '60 min',
      amount: 'PKR 2,500',
      status: 'Past',
      preSessionQuestion: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what equipment do I need?',
    },
    {
      id: 'RCH-78492034',
      follower: 'Hira Noor',
      avatar: '/merium.png',
      session: 'Style Consultation',
      date: 'Wed, 20 May 2026',
      time: '04:30 PM',
      duration: '30 min',
      amount: 'PKR 1,200',
      status: 'Cancelled',
      preSessionQuestion: 'Need help with my Eid outfit planning. I want something traditional but modern.',
      reason: 'Follower cancelled more than 24h before - Full refund processed',
    },
    {
      id: 'RCH-78492035',
      follower: 'Hira Noor',
      avatar: '/merium.png',
      session: 'Style Consultation',
      date: 'Wed, 20 May 2026',
      time: '04:30 PM',
      duration: '30 min',
      amount: 'PKR 1,200',
      status: 'Cancelled',
      preSessionQuestion: 'Need help with my Eid outfit planning. I want something traditional but modern.',
      reason: 'Follower cancelled more than 24h before - Full refund processed',
    },
  ];

  const toggleBookingSelection = (id: string) => {
    setSelectedBookings(prev => 
      prev.includes(id) ? prev.filter(bookingId => bookingId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedBookings(filteredBookings.map(b => b.id));
  };

  const clearSelection = () => {
    setSelectedBookings([]);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesTab = booking.status === activeTab;
    const matchesSearch = 
      booking.follower.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.session.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSessionType = sessionTypeFilter === 'All session types' || booking.session === sessionTypeFilter;
    return matchesTab && matchesSearch && matchesSessionType;
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-[rgba(200,169,126,0.1)] text-[#C8A97E] border-[rgba(200,169,126,0.3)]';
      case 'Past':
        return 'bg-[rgba(74,222,128,0.1)] text-[#4ade80] border-[rgba(74,222,128,0.3)]';
      case 'Cancelled':
        return 'bg-[rgba(248,113,113,0.1)] text-[#f87171] border-[rgba(248,113,113,0.3)]';
      case 'Pending Action':
        return 'bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border-[rgba(251,191,36,0.3)]';
      default:
        return '';
    }
  };

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    clearSelection();
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-sans transition-all ${
                    activeTab === tab.name
                      ? 'bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] text-[#C8A97E]'
                      : 'bg-[#141414] border border-[rgba(255,255,255,0.1)] text-[#F9F6F2] opacity-70 hover:opacity-100'
                  }`}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder="Search by name, ref or session....."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-10 text-sm font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none focus:border-[#C8A97E]"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2" opacity="0.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSessionDropdown(!showSessionDropdown);
                    setShowStatusDropdown(false);
                  }}
                  className="flex items-center justify-between bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E] w-48"
                >
                  {sessionTypeFilter}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform transition-transform">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {showSessionDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-lg w-48 z-10">
                  {sessionTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSessionTypeFilter(type);
                        setShowSessionDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-sans ${
                        sessionTypeFilter === type ? 'text-[#C8A97E] bg-[rgba(200,169,126,0.1)]' : 'text-[#F9F6F2]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowSessionDropdown(false);
                  }}
                  className="flex items-center justify-between bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E] w-40"
                >
                  {statusFilter}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform transition-transform">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-[#141414] border border-[rgba(255,255,255,0.1)] rounded-lg w-40 z-10">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-sans ${
                        statusFilter === status ? 'text-[#C8A97E] bg-[rgba(200,169,126,0.1)]' : 'text-[#F9F6F2]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                )}
              </div>
            </div>

            {/* Selection Bar */}
            {selectedBookings.length > 0 && (
              <div className="flex items-center justify-between bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-lg px-4 py-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-sans text-[#F9F6F2]">{selectedBookings.length} Selected</span>
                  <button className="flex items-center gap-2 bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] px-4 py-1.5 rounded-full text-xs font-sans text-[#C8A97E]">
                    Mark Completed
                  </button>
                  <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-4 py-1.5 rounded-full text-xs font-sans text-[#F9F6F2]">
                    Export Selected
                  </button>
                </div>
                <button 
                  onClick={clearSelection}
                  className="text-sm font-sans text-[#F9F6F2] opacity-70 hover:opacity-100"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Bookings List */}
            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5 relative"
                  >
                    {/* Select Checkbox */}
                    <button
                      onClick={() => toggleBookingSelection(booking.id)}
                      className="absolute top-4 right-4 w-5 h-5 border border-[rgba(255,255,255,0.2)] rounded flex items-center justify-center"
                    >
                      {selectedBookings.includes(booking.id) && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>

                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={booking.avatar} 
                          alt={booking.follower} 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`px-3 py-1 rounded-full text-xs font-sans border ${getStatusColor(booking.status)}`}>
                                {booking.status === 'Past' ? 'Completed' : booking.status}
                              </span>
                              {booking.status === 'Past' && (
                                <span className="px-3 py-1 rounded-full text-xs font-sans bg-[rgba(200,169,126,0.1)] text-[#C8A97E] border border-[rgba(200,169,126,0.3)]">
                                  Past
                                </span>
                              )}
                              {booking.status === 'Cancelled' && (
                                <span className="px-3 py-1 rounded-full text-xs font-sans bg-[rgba(74,222,128,0.1)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]">
                                  Refund
                                </span>
                              )}
                              <span className="text-xs font-sans text-[#F9F6F2] opacity-50">{booking.id}</span>
                            </div>
                            <h3 className="font-sans text-lg font-semibold text-[#F9F6F2] mb-1">
                              {booking.session} with {booking.follower}
                            </h3>
                            <p className="font-sans text-sm text-[#F9F6F2] opacity-70">
                              {booking.date} at {booking.time} · {booking.duration} · {booking.amount}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            <span className="text-xs font-sans text-[#C8A97E]">Pre-session question:</span>
                          </div>
                          <p className="text-sm font-sans text-[#F9F6F2] opacity-70">
                            {booking.preSessionQuestion.length > 100 ? `${booking.preSessionQuestion.slice(0, 100)}...` : booking.preSessionQuestion}
                            {booking.preSessionQuestion.length > 100 && (
                              <button className="text-[#C8A97E] text-sm ml-1">Read more</button>
                            )}
                          </p>
                        </div>

                        {booking.reason && (
                          <div className="pt-3 border-t border-[rgba(255,255,255,0.1)]">
                            <p className="text-xs font-sans text-[#F9F6F2] opacity-50">
                              Reason: {booking.reason}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-4">
                          {booking.status === 'Past' && (
                            <>
                              <button className="flex items-center gap-2 bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] px-4 py-1.5 rounded-full text-xs font-sans text-[#C8A97E]">
                                Mark Completed
                              </button>
                              <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-4 py-1.5 rounded-full text-xs font-sans text-[#F9F6F2]">
                                View Profile
                              </button>
                            </>
                          )}
                          {booking.status === 'Cancelled' && (
                            <>
                              <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-4 py-1.5 rounded-full text-xs font-sans text-[#F9F6F2]">
                                View Profile
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State */
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
                  No {activeTab.toLowerCase()} bookings yet. Share your booking link to get started.
                </p>
                <button className="flex items-center gap-2 mx-auto bg-[#141414] border border-[rgba(200,169,126,0.3)] px-5 py-2 rounded-full text-sm font-sans text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Link
                </button>
              </motion.div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default CreatorBookings;
