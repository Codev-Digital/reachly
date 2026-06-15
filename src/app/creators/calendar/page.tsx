'use client';

import { motion } from 'framer-motion';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

const CreatorCalendar = () => {
  const [view, setView] = useState<'month' | 'week' | 'days'>('month');
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Sample booking data for the calendar
  const booking = {
    follower: 'Bilal Qureshi',
    avatar: '/ahad raza mir.png',
    id: 'RCH-99001127',
    sessionType: 'Content Strategy',
    dateTime: 'Sun, 31 May 2026 at 03:00 PM',
    duration: '60 min',
    price: 'PKR 2,500',
    netEarnings: 'PKR 2,125',
    status: 'Completed',
    preSessionQuestion: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what gear should I buy on a budget?'
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

            {/* Page Title and Actions */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-serif text-3xl font-bold text-[#F9F6F2]">Calendar</h1>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-lg text-sm font-sans text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Block Time
                </button>
                {['Month', 'Week', 'Days'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setView(tab.toLowerCase() as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-sans transition-all ${
                      (tab.toLowerCase() === view)
                        ? 'bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] text-[#C8A97E]'
                        : 'bg-[#141414] border border-[rgba(255,255,255,0.1)] text-[#F9F6F2] opacity-70 hover:opacity-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 rounded-lg bg-[#141414] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#F9F6F2] hover:border-[#C8A97E] transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-lg bg-[#141414] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#F9F6F2] hover:border-[#C8A97E] transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button className="px-4 py-2 rounded-lg bg-[#141414] border border-[rgba(255,255,255,0.1)] text-sm font-sans text-[#F9F6F2] hover:border-[#C8A97E] transition-all">
                  Today
                </button>
              </div>
              <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-4 py-2 rounded-lg text-sm font-sans text-[#F9F6F2] hover:border-[#C8A97E] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                June 2026
              </button>
            </div>

            {/* Sync to Google Calendar Banner */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-5 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                    <rect x="1" y="3" width="22" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                    <path d="M8 14h.01" />
                    <path d="M12 14h.01" />
                    <path d="M16 14h.01" />
                    <path d="M8 18h.01" />
                    <path d="M12 18h.01" />
                    <path d="M16 18h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#F9F6F2]">Sync to Google Calendar</h3>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-70">Add your iCal feed to keep everything in one place</p>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-lg text-sm font-sans text-[#C8A97E] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
                Get Calendar Feed URL
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-sans text-[#F9F6F2] opacity-70">0 Selected</span>
                <span className="text-sm font-sans text-[#F9F6F2] opacity-70">•</span>
                <span className="text-sm font-sans text-[#F9F6F2] opacity-70">PKR 0 earnings</span>
              </div>
              <div className="flex items-center gap-4">
                {['Style Consultation', 'Confidence Coaching', 'Content Strategy', 'Blocked'].map((item, i) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${i === 3 ? 'bg-[rgba(255,255,255,0.2)]' : 'bg-[rgba(200,169,126,0.3)]'}`} />
                    <span className="text-sm font-sans text-[#F9F6F2] opacity-70">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Content */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl overflow-hidden">
              {/* Month View */}
              {view === 'month' && (
                <div>
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 border-b border-[rgba(255,255,255,0.1)]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="py-4 text-center">
                        <span className="text-sm font-sans text-[#F9F6F2] opacity-70">{day}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7">
                    {/* Week 1 */}
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2] opacity-30">31</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">1</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">2</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">3</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">4</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">5</span>
                    </div>
                    <div className="border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">6</span>
                    </div>

                    {/* Week 2 */}
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">7</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">8</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">9</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">10</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">11</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">12</span>
                    </div>
                    <div className="border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">13</span>
                    </div>

                    {/* Week 3 */}
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">14</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">15</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">16</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">17</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">18</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">19</span>
                    </div>
                    <div className="border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">20</span>
                    </div>

                    {/* Week 4 */}
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">21</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">22</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">23</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">24</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">25</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">26</span>
                    </div>
                    <div className="border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">27</span>
                    </div>

                    {/* Week 5 */}
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">28</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2]">29</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2 relative">
                      <span className="text-sm font-sans text-[#F9F6F2]">30</span>
                      <button 
                        onClick={() => setShowBookingModal(true)}
                        className="mt-2 bg-[rgba(200,169,126,0.2)] border border-[rgba(200,169,126,0.3)] rounded-md p-2 text-left w-full cursor-pointer"
                      >
                        <div className="text-xs font-sans text-[#C8A97E] font-semibold">03:00 PM</div>
                        <div className="text-xs font-sans text-[#F9F6F2]">Bilal Qureshi</div>
                      </button>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2] opacity-30">1</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2] opacity-30">2</span>
                    </div>
                    <div className="border-r border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2] opacity-30">3</span>
                    </div>
                    <div className="border-b border-[rgba(255,255,255,0.1)] min-h-[100px] p-2">
                      <span className="text-sm font-sans text-[#F9F6F2] opacity-30">4</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Week View */}
              {view === 'week' && (
                <div>
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 border-b border-[rgba(255,255,255,0.1)]">
                    {['Sun 31', 'Mon 1', 'Tue 2', 'Wed 3', 'Thu 4', 'Fri 5', 'Sat 6'].map((day, i) => (
                      <div key={day} className="py-4 text-center border-r last:border-r-0 border-[rgba(255,255,255,0.1)]">
                        <span className={`text-sm font-sans ${i === 2 ? 'text-[#C8A97E]' : 'text-[#F9F6F2] opacity-70'}`}>{day}</span>
                      </div>
                    ))}
                  </div>

                  {/* Time Grid */}
                  <div className="grid grid-cols-7">
                    {/* Time Labels Column */}
                    <div className="col-span-7 grid grid-cols-7">
                      {[...Array(12)].map((_, i) => {
                        const hour = i + 8;
                        const displayHour = hour > 12 ? hour - 12 : hour;
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        
                        return (
                          <div key={hour} className="contents">
                            {/* Time label */}
                            <div className="border-r border-b border-[rgba(255,255,255,0.1)] p-2">
                              <span className="text-xs font-sans text-[#F9F6F2] opacity-70">{displayHour} {ampm}</span>
                            </div>
                            
                            {/* Day columns */}
                            {[...Array(6)].map((_, j) => (
                              <div 
                                key={j} 
                                className={`border-r border-b border-[rgba(255,255,255,0.1)] min-h-[50px] relative ${j === 1 ? 'bg-[rgba(200,169,126,0.05)]' : ''}`}
                              >
                                {i === 7 && j === 1 && (
                                  <button 
                                    onClick={() => setShowBookingModal(true)}
                                    className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 bg-[rgba(200,169,126,0.2)] border border-[rgba(200,169,126,0.3)] rounded-md p-2 text-center w-[90%] cursor-pointer"
                                  >
                                    <div className="text-xs font-sans text-[#C8A97E] font-semibold">03:00 PM</div>
                                    <div className="text-xs font-sans text-[#F9F6F2]">Bilal Qureshi</div>
                                  </button>
                                )}
                                {j === 1 && (
                                  <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-[rgba(200,169,126,0.5)] transform -translate-x-1/2" />
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Days View */}
              {view === 'days' && (
                <div>
                  <div className="text-center py-4 border-b border-[rgba(255,255,255,0.1)]">
                    <span className="text-sm font-sans text-[#C8A97E]">Tuesday 2 June</span>
                  </div>
                  
                  {/* Time slots */}
                  <div>
                    {[...Array(12)].map((_, i) => {
                      const hour = i + 8;
                      const displayHour = hour > 12 ? hour - 12 : hour;
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      
                      return (
                        <div key={hour} className="border-b border-[rgba(255,255,255,0.1)] min-h-[50px] flex">
                          <div className="p-3 w-20 border-r border-[rgba(255,255,255,0.1)]">
                            <span className="text-xs font-sans text-[#F9F6F2] opacity-70">{displayHour} {ampm}</span>
                          </div>
                          <div className="flex-1 p-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Popup Modal */}
            {showBookingModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6 max-w-md w-full mx-4">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={booking.avatar} alt={booking.follower} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-xl font-semibold text-[#F9F6F2]">{booking.follower}</h3>
                      <p className="text-sm font-sans text-[#F9F6F2] opacity-70">{booking.id}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-sm font-sans text-[#F9F6F2] opacity-70">Session</span>
                      <span className="text-sm font-sans text-[#F9F6F2]">{booking.sessionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans text-[#F9F6F2] opacity-70">Date & Time</span>
                      <span className="text-sm font-sans text-[#F9F6F2]">{booking.dateTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans text-[#F9F6F2] opacity-70">Session</span>
                      <span className="text-sm font-sans text-[#F9F6F2]">{booking.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans text-[#F9F6F2] opacity-70">Session</span>
                      <span className="text-sm font-sans text-[#F9F6F2]">{booking.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans text-[#F9F6F2] opacity-70">Net Earning</span>
                      <span className="text-sm font-sans text-[#F9F6F2]">{booking.netEarnings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-sans text-[#F9F6F2] opacity-70">Status</span>
                      <span className="text-sm font-sans text-[#4ade80]">{booking.status}</span>
                    </div>
                  </div>

                  {/* Pre-session Question */}
                  <div className="mb-6">
                    <div className="bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] rounded-lg p-4">
                      <h4 className="text-xs font-sans text-[#C8A97E] mb-2">Pre-session question</h4>
                      <p className="text-sm font-sans text-[#F9F6F2] opacity-80">{booking.preSessionQuestion}</p>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button 
                    onClick={() => setShowBookingModal(false)}
                    className="w-full text-left text-sm font-sans text-[#F9F6F2] opacity-70 hover:opacity-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default CreatorCalendar;
