'use client';

import { motion } from 'framer-motion';
import CreatorNavbar from '@/components/CreatorNavbar';
import CreatorSidebar from '@/components/CreatorSidebar';
import { useState } from 'react';

const CreatorAnalytics = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [timePeriod, setTimePeriod] = useState('Last 30 days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0C0C0C] pb-12">
      <CreatorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <CreatorSidebar />

          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="font-serif text-4xl font-bold text-[#C8A97E]">Analytics & Insights</h1>
                <div className="flex items-center gap-3">
                  {/* Custom Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-between gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-xl text-sm font-sans min-w-[140px] hover:border-[#C8A97E] transition-all"
                    >
                      <span>{timePeriod}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl overflow-hidden z-10 shadow-lg">
                        {[
                          'Last 7 days',
                          'Last 30 days',
                          'Last 90 days',
                          'Custom'
                        ].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setTimePeriod(option);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-sans transition-colors ${
                              timePeriod === option
                                ? 'bg-[#C8A97E] text-[#0C0C0C]'
                                : 'text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)]'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-xl text-sm font-sans hover:bg-[rgba(200,169,126,0.1)] transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>
              <p className="font-sans text-base text-[#F9F6F2] opacity-70">Understand your audience and optimize your performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              {[
                { label: 'Profile Views', value: '13,926' },
                { label: 'Bookings', value: '1,240' },
                { label: 'Conversion Rate', value: '9.9%' },
                { label: 'Avg. Session Value', value: 'PKR 1,654' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6"
                >
                  <div className="w-12 h-12 bg-[rgba(200,169,126,0.1)] rounded-full flex items-center justify-center mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <p className="font-serif text-2xl font-bold text-[#F9F6F2] mb-1">{stat.value}</p>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-60">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {[
                { id: 'profile', label: 'Profile Views' },
                { id: 'funnel', label: 'Conversion Funnel' },
                { id: 'trends', label: 'Booking Trends' },
                { id: 'demographics', label: 'Demographics' },
                { id: 'earnings', label: 'Earnings Insights' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans transition-all border ${
                    activeTab === tab.id
                      ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border-[rgba(200,169,126,0.3)]'
                      : 'bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] opacity-70 border-transparent hover:opacity-100'
                  }`}
                >
                  {tab.id === 'profile' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  {tab.id === 'funnel' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  )}
                  {tab.id === 'trends' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  )}
                  {tab.id === 'demographics' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  )}
                  {tab.id === 'earnings' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* Profile Views Chart */}
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <div className="mb-5">
                    <h3 className="font-serif text-xl font-bold text-[#C8A97E] mb-1">Profile Views Over Time</h3>
                    <p className="font-sans text-sm text-[#F9F6F2] opacity-60">Add this widget to your website to let visitors book a session directly.</p>
                  </div>
                  <div className="relative h-64 rounded-xl overflow-hidden">
                    <svg viewBox="0 0 800 200" className="w-full h-full">
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#C8A97E" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#C8A97E" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,60 Q100,40 200,50 T400,120 T600,70 T800,50 L800,200 L0,200 Z"
                        fill="url(#areaGradient)"
                      />
                      <path
                        d="M0,60 Q100,40 200,50 T400,120 T600,70 T800,50"
                        fill="none"
                        stroke="#C8A97E"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Data Points */}
                      <circle cx="0" cy="60" r="5" fill="#C8A97E" />
                      <circle cx="200" cy="50" r="5" fill="#C8A97E" />
                      <circle cx="400" cy="120" r="5" fill="#C8A97E" />
                      <circle cx="600" cy="70" r="5" fill="#C8A97E" />
                      <circle cx="800" cy="50" r="5" fill="#C8A97E" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                    {[
                      { source: 'Direct', value: '3,471' },
                      { source: 'Instagram', value: '6,253' },
                      { source: 'Search', value: '2,074' },
                      { source: 'Other', value: '2,128' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(200,169,126,0.15)]">
                        <div className="w-10 h-10 bg-[rgba(200,169,126,0.1)] rounded-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-serif text-lg font-bold text-[#F9F6F2]">{item.value}</p>
                          <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{item.source}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Followers by City, Highlight Stats, Performance Comparison */}
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <h3 className="font-serif text-xl font-bold text-[#C8A97E] mb-5">Followers by City</h3>
                  
                  {/* Highlight Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(200,169,126,0.15)]">
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-1">Highest Revenue Day</p>
                      <p className="font-serif text-xl font-bold text-[#C8A97E] mb-1">PKR 7,200</p>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-60">2026-04-15</p>
                    </div>
                    <div className="p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(200,169,126,0.15)]">
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-1">Most Booked Session</p>
                      <p className="font-serif text-xl font-bold text-[#C8A97E] mb-1">Style Consultation</p>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-60">47 total bookings</p>
                    </div>
                    <div className="p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(200,169,126,0.15)]">
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-1">Average Session Value</p>
                      <p className="font-serif text-xl font-bold text-[#C8A97E]">PKR 1,654</p>
                    </div>
                  </div>

                  <div className="border-t border-[rgba(255,255,255,0.05)] pt-6">
                    <h4 className="font-serif text-lg font-bold text-[#C8A97E] mb-5">Your Performance vs Category Average</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(200,169,126,0.15)]">
                        <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-3">Rating</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-sans text-sm text-[#F9F6F2]">You</p>
                            <p className="font-serif text-xl font-bold text-[#C8A97E]">4.8</p>
                          </div>
                          <div className="text-right">
                            <p className="font-sans text-sm text-[#F9F6F2]">Avg</p>
                            <p className="font-serif text-xl font-bold text-[#F9F6F2]">4.2</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(200,169,126,0.15)]">
                        <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-3">Conversion Rate</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-sans text-sm text-[#F9F6F2]">You</p>
                            <p className="font-serif text-xl font-bold text-[#C8A97E]">9.9%</p>
                          </div>
                          <div className="text-right">
                            <p className="font-sans text-sm text-[#F9F6F2]">Avg</p>
                            <p className="font-serif text-xl font-bold text-[#F9F6F2]">6.5%</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(200,169,126,0.15)]">
                        <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-3">Avg Price</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-sans text-sm text-[#F9F6F2]">You</p>
                            <p className="font-serif text-xl font-bold text-[#C8A97E]">PKR 1,654</p>
                          </div>
                          <div className="text-right">
                            <p className="font-sans text-sm text-[#F9F6F2]">Avg</p>
                            <p className="font-serif text-xl font-bold text-[#F9F6F2]">PKR 1,200</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'funnel' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 mb-6"
              >
                <div className="mb-5">
                  <h3 className="font-serif text-xl font-bold text-[#C8A97E] mb-1">Conversion Funnel</h3>
                  <p className="font-sans text-sm text-[#F9F6F2] opacity-60">How followers move from discovery to booking</p>
                </div>

                <div className="space-y-4">
                  {[
                    { step: 'Profile Views', count: 12470, percent: 100 },
                    { step: 'Session selected', count: 3120, percent: 25 },
                    { step: 'Time selected', count: 1890, percent: 15 },
                    { step: 'Payment initiated', count: 1450, percent: 12 },
                    { step: 'Confirmed booking', count: 1240, percent: 10 },
                  ].map((step, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-sans text-sm text-[#F9F6F2]">{step.step}</span>
                        <span className="font-sans text-sm text-[#F9F6F2]">{step.count.toLocaleString()}</span>
                      </div>
                      <div className="relative h-10 bg-[rgba(255,255,255,0.05)] rounded-lg overflow-hidden">
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-[#C8A97E] rounded-lg flex items-center justify-end pr-3"
                          style={{ width: `${step.percent}%` }}
                        >
                          <span className="font-sans text-sm text-[#0C0C0C] font-bold">{step.percent}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'trends' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* Best Days & Times */}
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <div className="mb-5">
                    <h3 className="font-serif text-xl font-bold text-[#C8A97E] mb-1">Best Days & Times</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      <div className="grid grid-cols-8 gap-3 mb-4">
                        <div></div>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
                          <div key={idx} className="text-center">
                            <span className="font-sans text-sm text-[#F9F6F2] opacity-60">{day}</span>
                          </div>
                        ))}
                      </div>

                      {[
                        { time: '10:00 AM', data: [1, 2, 1, 2, 7, 1, 2] },
                        { time: '12:00 AM', data: [3, 1, 5, 6, 7, 8, 9] },
                        { time: '14:00 AM', data: [6, 5, 4, 3, 1, 1, 1] },
                        { time: '15:00 AM', data: [1, 1, 6, 4, 3, 2, 6] },
                        { time: '18:00 AM', data: [4, 6, 4, 6, 6, 6, 6] },
                        { time: '20:00 AM', data: [5, 6, 3, 7, 6, 7, 6] },
                      ].map((row, rowIdx) => (
                        <div key={rowIdx} className="grid grid-cols-8 gap-3 mb-3 items-center">
                          <div className="font-sans text-xs text-[#F9F6F2] opacity-60">{row.time}</div>
                          {row.data.map((value, colIdx) => {
                            const intensity = value / 10;
                            return (
                              <div
                                key={colIdx}
                                className="h-10 rounded-md flex items-center justify-center"
                                style={{
                                  backgroundColor: `rgba(200,169,126,${0.1 + intensity * 0.9})`
                                }}
                              >
                                <span className="font-sans text-xs text-[#0C0C0C]">{value}</span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Session Performance */}
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <div className="mb-5">
                    <h3 className="font-serif text-xl font-bold text-[#C8A97E] mb-1">Session Performance</h3>
                    <p className="font-sans text-sm text-[#F9F6F2] opacity-60">How followers move from discovery to booking</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'Style Consultation', revenue: 'PKR 98,400', bookings: 47, percent: 85 },
                      { name: 'Confidence Coaching', revenue: 'PKR 102,300', bookings: 31, percent: 100 },
                      { name: 'Content Strategy', revenue: 'PKR 86,800', bookings: 22, percent: 65 },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-sans text-sm text-[#F9F6F2]">{item.name}</span>
                          <span className="font-sans text-xs text-[#F9F6F2]">{item.bookings} bookings</span>
                        </div>
                        <div className="relative flex-1 h-8 bg-[rgba(255,255,255,0.05)] rounded-md overflow-hidden border border-[rgba(255,255,255,0.1)]">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-[#C8A97E] rounded-md flex items-center pl-3"
                            style={{ width: `${item.percent}%` }}
                          >
                            <span className="font-sans text-xs text-[#0C0C0C] font-bold">{item.revenue}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* No Shows Stats */}
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-xl font-bold text-[#C8A97E]">No Shows</h3>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-xl text-sm font-sans bg-[rgba(200,169,126,0.15)] text-[#C8A97E] border border-[rgba(200,169,126,0.3)]">
                        No shows
                      </button>
                      <button className="px-4 py-2 rounded-xl text-sm font-sans bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] opacity-70 border border-transparent">
                        Cancellations
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(200,169,126,0.15)]">
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-1">Total No Shows</p>
                      <p className="font-serif text-2xl font-bold text-[#C8A97E]">7</p>
                    </div>
                    <div className="p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(200,169,126,0.15)]">
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-1">No Show Rate</p>
                      <p className="font-serif text-2xl font-bold text-[#C8A97E]">0.56%</p>
                    </div>
                    <div className="p-5 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(200,169,126,0.15)]">
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-1">Last No Show</p>
                      <p className="font-serif text-2xl font-bold text-[#C8A97E]">2026-06-14</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#C8A97E] mb-4">No Shows by Session Type</h4>
                      <div className="space-y-4">
                        {[
                          { type: 'Style Consultation', count: 4, percent: 57 },
                          { type: 'Confidence Coaching', count: 2, percent: 29 },
                          { type: 'Content Strategy', count: 1, percent: 14 },
                        ].map((item, idx) => (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-sans text-sm text-[#F9F6F2]">{item.type}</span>
                              <span className="font-sans text-xs text-[#F9F6F2]">{item.count}</span>
                            </div>
                            <div className="relative h-8 bg-[rgba(255,255,255,0.05)] rounded-md overflow-hidden border border-[rgba(255,255,255,0.1)]">
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-[#C8A97E] rounded-md flex items-center justify-end pr-3"
                                style={{ width: `${item.percent}%` }}
                              >
                                <span className="font-sans text-xs text-[#0C0C0C] font-bold">{item.percent}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#C8A97E] mb-4">Last 10 No Shows</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'Kashaf Shah', date: '2026-06-14', time: '11:00 AM' },
                          { name: 'Zain Mian', date: '2026-06-13', time: '3:30 PM' },
                          { name: 'Hoorain Qureshi', date: '2026-06-12', time: '10:00 AM' },
                          { name: 'Samia Ahmed', date: '2026-06-11', time: '5:00 PM' },
                          { name: 'Ayesha Khan', date: '2026-06-10', time: '12:00 PM' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(200,169,126,0.15)]">
                            <span className="font-sans text-sm text-[#F9F6F2]">{item.name}</span>
                            <span className="font-sans text-xs text-[#F9F6F2] opacity-60">{item.date} at {item.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'demographics' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* Followers by City */}
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <div className="mb-5">
                    <h3 className="font-serif text-xl font-bold text-[#C8A97E] mb-1">Followers by City</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      { city: 'Lahore', percent: 35 },
                      { city: 'Karachi', percent: 23 },
                      { city: 'Islamabad', percent: 15 },
                      { city: 'Faisalabad', percent: 7 },
                      { city: 'Other', percent: 10 },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-sans text-sm text-[#F9F6F2]">{item.city}</span>
                          <span className="font-sans text-xs text-[#0C0C0C] bg-[#C8A97E] px-2 py-1 rounded">{item.percent}%</span>
                        </div>
                        <div className="relative h-8 bg-[rgba(255,255,255,0.05)] rounded-md overflow-hidden border border-[rgba(255,255,255,0.1)]">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-[#C8A97E] rounded-md"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Repeat vs New Bookings */}
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <div className="mb-5">
                    <h3 className="font-serif text-xl font-bold text-[#C8A97E] mb-1">Repeat vs New Bookings</h3>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="font-serif text-2xl font-bold text-[#F9F6F2]">38</p>
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-60">Repeat followers</p>
                    </div>
                    <div className="w-px h-12 bg-[rgba(255,255,255,0.1)]"></div>
                    <div className="text-center">
                      <p className="font-serif text-2xl font-bold text-[#F9F6F2]">82</p>
                      <p className="font-sans text-sm text-[#F9F6F2] opacity-60">New followers</p>
                    </div>
                    <div className="flex-1">
                      <div className="relative h-8 bg-[rgba(255,255,255,0.05)] rounded-md overflow-hidden">
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-[#C8A97E] rounded-md"
                          style={{ width: '32%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'earnings' && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* Earnings Overview Chart */}
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#F9F6F2] mb-1">Earnings Overview</h3>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-60">Total PKR 54,842 - Daily average PKR 1,028</p>
                    </div>
                    <div className="flex gap-2">
                      {['7 days', '30 days', '90 days', 'Month', 'Year'].map((period, idx) => (
                        <button
                          key={idx}
                          className={`px-3 py-1 rounded-full text-xs font-sans ${
                            period === '30 days'
                              ? 'bg-[rgba(200,169,126,0.15)] text-[#C8A97E]'
                              : 'bg-[rgba(255,255,255,0.05)] text-[#F9F6F2] opacity-70'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative h-48 rounded-xl overflow-hidden">
                    <svg viewBox="0 0 800 150" className="w-full h-full">
                      <path
                        d="M0,120 Q100,100 200,110 T400,70 T600,90 T800,60"
                        fill="none"
                        stroke="#C8A97E"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Session Type Earnings */}
                <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6">
                  <h3 className="font-serif text-2xl font-bold text-[#C8A97E] mb-7">Earnings by Session Type</h3>

                  <div className="space-y-7">
                    {[
                      { name: 'Style Consultation', revenue: 'PKR 98,400', bookings: 82, percent: 75, highlight: false },
                      { name: 'Confidence Coaching', revenue: 'PKR 102,300', bookings: 57, percent: 100, highlight: true },
                      { name: 'Content Strategy', revenue: 'PKR 86,800', bookings: 35, percent: 65, highlight: false },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <span className="font-sans text-lg text-[#F9F6F2]">{item.name}</span>
                            {item.highlight && (
                              <span className="font-sans text-base text-[#C8A97E] font-semibold">Best Performing</span>
                            )}
                          </div>
                          <span className="font-sans text-lg text-[#F9F6F2]">{item.revenue} · {item.bookings} bookings</span>
                        </div>
                        <div className="relative h-3.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-[#C8A97E] rounded-full flex items-center justify-end"
                            style={{ width: `${item.percent}%` }}
                          >
                            <div className="w-5 h-5 bg-[#C8A97E] rounded-full border-3 border-[#141414]"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default CreatorAnalytics;
