'use client';

import { motion } from 'framer-motion';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

const CreatorAvailability = () => {
  const [activeTab, setActiveTab] = useState('Weekly Schedule');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
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
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="font-serif text-4xl font-bold text-[#C8A97E] mb-2">Manage Your Availability</h1>
              <p className="font-sans text-base text-[#F9F6F2] opacity-90">Set when you are available for bookings. Changes apply to all session types.</p>
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

            {/* Copy to buttons */}
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
                          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-5 py-3">
                            <select className="bg-transparent text-[#F9F6F2] text-sm font-sans outline-none">
                              <option>9:00 AM</option>
                            </select>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2" className="inline-block ml-2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                          <span className="text-sm font-sans text-[#F9F6F2] opacity-70">to</span>
                          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-5 py-3">
                            <select className="bg-transparent text-[#F9F6F2] text-sm font-sans outline-none">
                              <option>12:00 AM</option>
                            </select>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2" className="inline-block ml-2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
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
                          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-5 py-3">
                            <select className="bg-transparent text-[#F9F6F2] text-sm font-sans outline-none">
                              <option>2:00 AM</option>
                            </select>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2" className="inline-block ml-2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                          <span className="text-sm font-sans text-[#F9F6F2] opacity-70">to</span>
                          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-5 py-3">
                            <select className="bg-transparent text-[#F9F6F2] text-sm font-sans outline-none">
                              <option>6:00 AM</option>
                            </select>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2" className="inline-block ml-2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
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
       {/* Save Button */}
            <div className="flex justify-center mb-8">
              <button className="bg-[#C8A97E] text-[#0C0C0C] px-4 py-3 rounded-full text-base font-sans font-medium hover:opacity-90 transition-all">
                Save Weekly Schedule
              </button>
            </div>
            {/* Live Preview: Next 14 Days */}
           <div>
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="font-serif text-2xl font-bold text-[#C8A97E] mb-2">
        Live Preview - Next 14 Days
      </h2>
      <p className="font-sans text-base text-[#F9F6F2] opacity-70">
        This is what your booking page looks like to followers.
      </p>
    </div>

    <button
      type="button"
      className="flex items-center gap-2 text-base font-sans text-[#F9F6F2] opacity-70 hover:opacity-100 transition-opacity"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
      Refresh
    </button>
  </div>

  {/* Days Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {[
      { day: 'SUN', date: '31', month: 'MAY', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
      { day: 'MON', date: '1', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
      { day: 'TUE', date: '2', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'], isToday: true },
      { day: 'WED', date: '3', month: 'JUNE', slots: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'] },
      { day: 'THU', date: '4', month: 'JUNE', slots: ['9:00 AM', '9:30 AM'] },
      { day: 'FRI', date: '5', month: 'JUNE', slots: [] },
      { day: 'SAT', date: '6', month: 'JUNE', slots: ['9:00 AM', '9:30 AM'] },
      { day: 'SUN', date: '7', month: 'JUNE', slots: ['9:00 AM', '9:30 AM'] },
    ].map((item, index) => (
      <div
        key={index}
        className={`bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-2xl p-7 ${
          item.isToday ? 'ring-2 ring-[#C8A97E]' : ''
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="font-sans text-lg font-semibold text-[#F9F6F2]">
            {item.day}, {item.date} {item.month}
          </span>
        </div>

        <div className="space-y-3">
          {item.slots.length > 0 ? (
            item.slots.map((slot, slotIndex) => (
              <div
                key={slotIndex}
                className={`rounded-xl py-3 text-center text-base font-sans transition-colors ${
                  item.isToday && slotIndex === 1
                    ? 'bg-[#C8A97E] text-[#0C0C0C]'
                    : 'bg-[rgba(255,255,255,0.05)] text-[#C8A97E] opacity-80'
                }`}
              >
                {slot}
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-[#F9F6F2] opacity-40 py-4">
              No slots available
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
</div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default CreatorAvailability;
