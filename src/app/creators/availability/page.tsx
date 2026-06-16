'use client';

import { motion } from 'framer-motion';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

const CreatorAvailability = () => {
  const [activeTab, setActiveTab] = useState('Weekly Schedule');
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [maxDays, setMaxDays] = useState(30);
  const [minHours, setMinHours] = useState(4);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [oneTimeSlots, setOneTimeSlots] = useState([
    { id: 1, date: 'Sat, 6 Jun 2026', startTime: '7:00 AM', endTime: '9:00 AM', reason: 'Early morning special!' },
    { id: 2, date: 'Sat, 6 Jun 2026', startTime: '7:00 AM', endTime: '9:00 AM', reason: 'Early morning special!' },
  ]);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const timeOptions = [
    '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM',
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'
  ];
  
  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
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
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="font-serif text-4xl font-bold text-[#C8A97E] mb-2">Manage Your Availability</h1>
              <p className="font-sans text-base text-[#F9F6F2] opacity-90">Set when you are available for bookings. Changes apply to all session types.</p>
            </div>

            {/* Save Button */}
            <div className="flex justify-center mb-8">
              <button className="bg-[#C8A97E] text-[#0C0C0C] px-8 py-3 rounded-full text-base font-sans font-medium hover:opacity-90 transition-all">
                Save Weekly Schedule
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
              {['Weekly Schedule', 'Blocked Dates', 'One-Time Slots', 'Settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-sans transition-all ${
                    activeTab === tab
                      ? 'bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] text-[#C8A97E]'
                      : 'bg-[#141414] border border-[rgba(255,255,255,0.1)] text-[#F9F6F2] opacity-70 hover:opacity-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Copy to buttons - only for Weekly Schedule */}
            {activeTab === 'Weekly Schedule' && (
              <div className="flex gap-4 mb-8">
                <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-5 py-3 rounded-xl text-sm font-sans text-[#F9F6F2]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy to all weekdays
                </button>
                <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(255,255,255,0.1)] px-5 py-3 rounded-xl text-sm font-sans text-[#F9F6F2]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy to weekend
                </button>
              </div>
            )}

            {activeTab === 'Weekly Schedule' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                {/* Days of Week Column */}
                <div className="lg:col-span-7 space-y-4">
                  {days.map((day, index) => (
                    <div key={day} className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-7">
                      <div className="flex items-center gap-5 mb-6">
                        <h3 className="font-serif text-2xl font-bold text-[#F9F6F2]">{day}</h3>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-7 bg-[rgba(200,169,126,0.3)] rounded-full relative">
                            <div className="absolute right-1 top-1 w-5 h-5 bg-[#C8A97E] rounded-full" />
                          </div>
                          <span className="text-sm font-sans text-[#C8A97E]">Available</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        {/* Time Block 1 */}
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <select className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-5 py-3 text-[#F9F6F2] text-sm font-sans outline-none appearance-none pr-10 w-48">
                              {timeOptions.map((time, i) => (
                                <option key={i} value={time}>{time}</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </div>
                          </div>
                          <span className="text-sm font-sans text-[#F9F6F2] opacity-70">to</span>
                          <div className="relative">
                            <select className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-5 py-3 text-[#F9F6F2] text-sm font-sans outline-none appearance-none pr-10 w-48">
                              {timeOptions.map((time, i) => (
                                <option key={i} value={time}>{time}</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </div>
                          </div>
                          <button className="text-[#F9F6F2] opacity-50 hover:opacity-100">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>

                        {/* Time Block 2 */}
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <select className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-5 py-3 text-[#F9F6F2] text-sm font-sans outline-none appearance-none pr-10 w-48">
                              {timeOptions.map((time, i) => (
                                <option key={i} value={time}>{time}</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </div>
                          </div>
                          <span className="text-sm font-sans text-[#F9F6F2] opacity-70">to</span>
                          <div className="relative">
                            <select className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-5 py-3 text-[#F9F6F2] text-sm font-sans outline-none appearance-none pr-10 w-48">
                              {timeOptions.map((time, i) => (
                                <option key={i} value={time}>{time}</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </div>
                          </div>
                          <button className="text-[#F9F6F2] opacity-50 hover:opacity-100">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>

                        <button className="flex items-center gap-2 mt-2 text-sm font-sans text-[#C8A97E]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add another time block
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weekly Summary Column */}
                <div className="lg:col-span-5">
                  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-7 sticky top-8">
                    <h3 className="font-serif text-2xl font-bold text-[#F9F6F2] mb-7">Weekly Summary</h3>
                    
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-sans text-[#F9F6F2] opacity-80">Total hours per week</span>
                        <span className="text-base font-sans text-[#C8A97E] font-semibold">44h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-sans text-[#F9F6F2] opacity-80">Available days</span>
                        <span className="text-base font-sans text-[#C8A97E] font-semibold">7/7</span>
                      </div>
                    </div>

                    <div className="border-t border-[rgba(255,255,255,0.1)] my-6" />

                    <p className="text-base font-sans text-[#F9F6F2] opacity-80">Your followers will see slots based on this schedule. Changes apply immediately after saving.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Blocked Dates' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                    <div className="mb-6">
                      <h3 className="font-serif text-xl font-bold text-[#F9F6F2] mb-2">June 2026</h3>
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                          <div key={i} className="text-center text-sm font-sans text-[#F9F6F2] opacity-50">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {['', '', '', '', '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'].map((date, i) => (
                          <div 
                            key={i} 
                            className={`aspect-square flex items-center justify-center rounded-lg text-sm font-sans ${
                              ['9', '17', '24', '30'].includes(date) 
                                ? 'bg-[#f87171] text-[#0C0C0C]' 
                                : date ? 'text-[#F9F6F2] hover:bg-[rgba(255,255,255,0.1)] cursor-pointer' : ''
                            }`}
                          >
                            {date}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setShowBlockForm(!showBlockForm)}
                      className="flex items-center gap-3 text-base font-sans text-[#C8A97E] opacity-80 hover:opacity-100"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Block a date range
                    </button>

                    {showBlockForm && (
                      <div className="mt-4 bg-[rgba(255,255,255,0.03)] rounded-xl p-6 border border-[rgba(200,169,126,0.15)]">
                        <div className="flex items-end gap-1">
                          <div className="flex flex-col gap-2">
                            <label className="text-base font-sans text-[#F9F6F2] opacity-80">From</label>
                            <div className="relative w-48">
                              <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-5 py-3 text-[#F9F6F2] text-base font-sans flex items-center justify-between">
                                <span>{fromDate ? new Date(fromDate).toLocaleDateString('en-US') : 'mm/dd/yyyy'}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <label className="text-base font-sans text-[#F9F6F2] opacity-80">To</label>
                            <div className="relative w-48">
                              <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-5 py-3 text-[#F9F6F2] text-base font-sans flex items-center justify-between">
                                <span>{toDate ? new Date(toDate).toLocaleDateString('en-US') : 'mm/dd/yyyy'}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                  <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <button className="bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.4)] text-[#f87171] px-4 py-2.75 rounded-xl text-base font-sans hover:bg-[rgba(248,113,113,0.15)] transition-all">
                            Block
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 sticky top-8">
                    <h3 className="font-serif text-xl font-bold text-[#F9F6F2] mb-5">Blocked Dates</h3>
                    
                    <div className="space-y-3">
                      <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-sans text-[#f87171]">Sat 9 Jun 2026</span>
                          <button className="text-xs font-sans text-[#C8A97E]">Unblock</button>
                        </div>
                        <div className="text-xs font-sans text-[#F9F6F2] opacity-50">Full day</div>
                      </div>
                      
                      <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-sans text-[#f87171]">Sun 17 Jun 2026</span>
                          <button className="text-xs font-sans text-[#C8A97E]">Unblock</button>
                        </div>
                        <div className="text-xs font-sans text-[#F9F6F2] opacity-50">Full day</div>
                      </div>

                      <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-sans text-[#f87171]">Sat 29 Jun 2026</span>
                          <button className="text-xs font-sans text-[#C8A97E]">Unblock</button>
                        </div>
                        <div className="text-xs font-sans text-[#F9F6F2] opacity-50">Full day</div>
                      </div>

                      <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-sans text-[#f87171]">Sun 30 Jun 2026</span>
                          <button className="text-xs font-sans text-[#C8A97E]">Unblock</button>
                        </div>
                        <div className="text-xs font-sans text-[#F9F6F2] opacity-50">Family event</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button className="w-full bg-[#C8A97E] text-[#0C0C0C] py-2 rounded-full text-sm font-sans font-medium hover:opacity-90 transition-all">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'One-Time Slots' && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <p className="font-sans text-base text-[#F9F6F2] opacity-70">Add one-off availability outside your regular schedule, for special hours or events</p>
                  <button 
                    onClick={() => setShowSlotModal(true)}
                    className="bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#C8A97E] px-4 py-2 rounded-xl text-sm font-sans hover:bg-[rgba(200,169,126,0.1)] transition-all"
                  >
                    + Add Slot
                  </button>
                </div>
                
                <div className="space-y-4 mb-6">
                  {oneTimeSlots.map((slot) => (
                    <div key={slot.id} className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[rgba(200,169,126,0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                              <circle cx="12" cy="12" r="5" />
                              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-sans text-base font-semibold text-[#F9F6F2] mb-1">{slot.date}</h4>
                            <p className="font-sans text-sm text-[#F9F6F2] opacity-60">{slot.startTime} to {slot.endTime} · {slot.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-[#F9F6F2] opacity-40 hover:opacity-70">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                          </button>
                          <button className="text-[#F9F6F2] opacity-40 hover:opacity-70">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <button className="bg-[#C8A97E] text-[#0C0C0C] px-6 py-2 rounded-full text-sm font-sans font-medium hover:opacity-90 transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Settings' && (
              <div className="mb-12">
                <div className="space-y-5">
                  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-bold text-[#C8A97E] mb-3">Buffer Between Sessions</h3>
                    <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-4">Adds a gap between your bookings so you have time to prepare.</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {['No buffer', '5 min', '10 min', '15 min', '30 min'].map((buffer, index) => (
                        <button
                          key={index}
                          className={`px-4 py-2 rounded-xl text-sm font-sans transition-all ${
                            buffer === '15 min'
                              ? 'bg-[#C8A97E] text-[#0C0C0C]'
                              : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] hover:bg-[rgba(255,255,255,0.1)]'
                          }`}
                        >
                          {buffer}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-bold text-[#C8A97E] mb-5">Booking Window</h3>
                    
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-sans text-sm text-[#F9F6F2] opacity-80">How far in advance can followers book?</p>
                          <span className="font-sans text-sm text-[#C8A97E] font-medium">{maxDays} days</span>
                        </div>
                   <input
  type="range"
  min="7"
  max="90"
  value={maxDays}
  onChange={(e) => setMaxDays(parseInt(e.target.value))}
  className="w-full h-2 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C8A97E]"
  style={{
    background: `linear-gradient(to right, #C8A97E 0%, #C8A97E ${((maxDays - 7) / 83) * 100}%, rgba(200,169,126,0.2) ${((maxDays - 7) / 83) * 100}%, rgba(200,169,126,0.2) 100%)`
  }}
/>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-sans text-sm text-[#F9F6F2] opacity-80">How far in advance can followers book?</p>
                          <span className="font-sans text-sm text-[#C8A97E] font-medium">{minHours} hours</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="24"
                          value={minHours}
                          onChange={(e) => setMinHours(parseInt(e.target.value))}
                          className="w-full h-2 bg-[rgba(200,169,126,0.2)] rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #C8A97E 0%, #C8A97E ${((minHours - 1) / 23) * 100}%, rgba(200,169,126,0.2) ${((minHours - 1) / 23) * 100}%, rgba(200,169,126,0.2) 100%)`
                          }}
                        />
                      </div>
                      
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mt-2">Followers can book up to {maxDays} days in advance, and at least {minHours} hours before the session starts.</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                    <h3 className="font-serif text-lg font-bold text-[#C8A97E] mb-3">Timezone</h3>
                    <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-4">All your availability times will be shown in this timezone.</p>
                    
                    <style jsx>{`
                      select {
                        color: #F9F6F2;
                      }
                      select option {
                        background-color: #141414;
                        color: #F9F6F2;
                        padding: 8px 12px;
                      }
                      select option:checked {
                        background-color: #C8A97E;
                        color: #0C0C0C;
                      }
                      select option:hover {
                        background-color: rgba(200,169,126,0.2);
                      }
                    `}</style>
                    
                    <select className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(200,169,126,0.2)] rounded-xl px-4 py-3 text-sm font-sans outline-none">
                      <option value="pkt">Pakistan Standard Time (PKT, UTC+5)</option>
                      <option value="ist">India Standard Time (IST, UTC+5:30)</option>
                      <option value="gst">Gulf Standard Time (GST, UTC+4)</option>
                      <option value="ast">Arabian Standard Time (AST, UTC+3)</option>
                      <option value="utc">Coordinated Universal Time (UTC+0)</option>
                      <option value="eet">Eastern European Time (EET, UTC+2)</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="bg-[#C8A97E] text-[#0C0C0C] px-6 py-2 rounded-full text-sm font-sans font-medium hover:opacity-90 transition-all">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Live Preview: Next 14 Days */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#C8A97E] mb-2">Live Preview - Next 14 Days</h2>
                  <p className="font-sans text-base text-[#F9F6F2] opacity-70">This is what your booking page looks like to followers.</p>
                </div>
                
                <button className="flex items-center gap-2 text-base font-sans text-[#F9F6F2] opacity-70 hover:opacity-100">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  Refresh
                </button>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { day: 'SUN', date: '31', month: 'MAY', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
                  { day: 'MON', date: '1', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
                  { day: 'TUE', date: '2', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'], isToday: true },
                  { day: 'WED', date: '3', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
                  { day: 'THU', date: '4', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
                  { day: 'FRI', date: '5', month: 'JUNE', slots: [] },
                  { day: 'SAT', date: '6', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
                  { day: 'SUN', date: '7', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
                  { day: 'MON', date: '8', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
                  { day: 'TUE', date: '9', month: 'JUNE', slots: [] },
                  { day: 'WED', date: '10', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
                  { day: 'THU', date: '11', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className={`bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-2xl p-6 ${item.isToday ? 'ring-2 ring-[#C8A97E]' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="font-sans text-base font-semibold text-[#F9F6F2]">{item.day}, {item.date} {item.month}</span>
                    </div>
                    
                    {item.slots.length > 0 ? (
                      <div className="space-y-3">
                        {item.slots.map((slot, slotIndex) => (
                          <div 
                            key={slotIndex} 
                            className={`bg-[rgba(255,255,255,0.05)] rounded-xl py-3 text-center text-base font-sans ${
                              item.isToday && slotIndex === 1 ? 'bg-[#C8A97E] text-[#0C0C0C]' : 'text-[#C8A97E] opacity-80'
                            }`}
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm font-sans text-[#F9F6F2] opacity-50">No slots</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm font-sans text-[#F9F6F2] opacity-50">130 slots available across the next 14 days.</p>
              </div>
            </div>
          </motion.main>
          
          {showSlotModal && (
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-50">
              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-3xl p-8 w-full max-w-md">
                <h3 className="font-serif text-2xl font-bold text-[#F9F6F2] mb-6">Add One Time Slot</h3>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">Date</label>
                    <div className="relative w-full">
                      <input
                        type="date"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(200,169,126,0.2)] rounded-xl px-4 py-3 text-[#F9F6F2] text-base font-sans flex items-center justify-between">
                        <span>mm/dd/yyyy</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">Start Time</label>
                      <select className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(200,169,126,0.2)] rounded-xl px-4 py-3 text-[#F9F6F2] text-base font-sans outline-none">
                        {timeOptions.map((time, i) => (
                          <option key={i} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">End Time</label>
                      <select className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(200,169,126,0.2)] rounded-xl px-4 py-3 text-[#F9F6F2] text-base font-sans outline-none">
                        {timeOptions.map((time, i) => (
                          <option key={i} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-sans text-[#F9F6F2] opacity-70 mb-2 block">Reason (optional)</label>
                    <textarea 
                      placeholder="e.g. Special event, Early morning!"
                      className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(200,169,126,0.2)] rounded-xl px-4 py-3 text-[#F9F6F2] text-base font-sans outline-none resize-none h-24"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowSlotModal(false)}
                    className="flex-1 bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] py-3 rounded-full text-base font-sans font-medium hover:bg-[rgba(255,255,255,0.1)] transition-all"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 bg-[#C8A97E] text-[#0C0C0C] py-3 rounded-full text-base font-sans font-medium hover:opacity-90 transition-all">
                    Add Slot
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorAvailability;
