'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import UserSidebar from '@/components/UserSidebar';
import CreatorNavbar from '@/components/CreatorNavbar';
import UserTopBar from '@/components/UserTopBar';

export default function UserPayments() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');

  const stats = [
    { label: 'Total spent', value: 'PKR 8,100', icon: true },
    { label: 'Total refunded', value: 'PKR 1,200', icon: true },
    { label: 'Active bookings value', value: 'PKR 8,100', icon: true },
  ];

  const payments = [
    { id: 1, ref: 'RCH-78492031', creator: 'Sana Mir', session: 'Live Training Session', amount: 'PKR 900', method: 'JazzCash', date: '2025-06-28', status: 'Paid' },
    { id: 2, ref: 'RCH-78492031', creator: 'Sana Mir', session: 'Live Training Session', amount: 'PKR 900', method: 'JazzCash', date: '2025-06-28', status: 'Paid' },
    { id: 3, ref: 'RCH-78492031', creator: 'Sana Mir', session: 'Live Training Session', amount: 'PKR 900', method: 'JazzCash', date: '2025-06-28', status: 'Paid' },
    { id: 4, ref: 'RCH-78492031', creator: 'Sana Mir', session: 'Live Training Session', amount: 'PKR 900', method: 'JazzCash', date: '2025-06-28', status: 'Paid' },
    { id: 5, ref: 'RCH-78492031', creator: 'Sana Mir', session: 'Live Training Session', amount: 'PKR 900', method: 'JazzCash', date: '2025-06-28', status: 'Paid' },
    { id: 6, ref: 'RCH-78492031', creator: 'Sana Mir', session: 'Live Training Session', amount: 'PKR 900', method: 'JazzCash', date: '2025-06-28', status: 'Paid' },
    { id: 7, ref: 'RCH-78492031', creator: 'Sana Mir', session: 'Live Training Session', amount: 'PKR 900', method: 'JazzCash', date: '2025-06-28', status: 'Paid' },
    { id: 8, ref: 'RCH-78492031', creator: 'Sana Mir', session: 'Live Training Session', amount: 'PKR 900', method: 'JazzCash', date: '2025-06-28', status: 'Paid' },
    { id: 9, ref: 'RCH-78492031', creator: 'Sana Mir', session: 'Live Training Session', amount: 'PKR 900', method: 'JazzCash', date: '2025-06-28', status: 'Paid' },
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

            <div className="mb-6">
              <h1 className="font-serif text-4xl font-bold text-[#C8A97E] mb-4">Payment History</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[rgba(255,255,255,0.05)] rounded-full flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-serif text-xl font-bold text-[#F9F6F2]">{stat.value}</p>
                      <p className="font-sans text-xs text-[#F9F6F2] opacity-70">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <div className="relative flex-1 max-w-xs">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-3 py-2 pl-10 text-xs font-sans text-[#F9F6F2] placeholder-[#F9F6F2] opacity-50 focus:outline-none"
                  />
                </div>
                
                <div className="relative">
                  <select 
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-3 py-2 rounded-xl text-xs font-sans appearance-none pr-8"
                  >
                    <option value="All">All</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Bank Card">Bank Card</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-3 py-2 rounded-xl text-xs font-sans appearance-none pr-8"
                  >
                    <option value="All">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Refund">Refund</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                <button className="bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] px-4 py-2 rounded-xl text-xs font-sans flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export CSV
                </button>
              </div>

              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[rgba(200,169,126,0.05)]">
                      <tr>
                        <th className="px-4 py-3 font-sans text-xs text-[#C8A97E] opacity-90">Booking Ref</th>
                        <th className="px-4 py-3 font-sans text-xs text-[#C8A97E] opacity-90">Creator</th>
                        <th className="px-4 py-3 font-sans text-xs text-[#C8A97E] opacity-90">Session</th>
                        <th className="px-4 py-3 font-sans text-xs text-[#C8A97E] opacity-90">Amount</th>
                        <th className="px-4 py-3 font-sans text-xs text-[#C8A97E] opacity-90">Method</th>
                        <th className="px-4 py-3 font-sans text-xs text-[#C8A97E] opacity-90">Date</th>
                        <th className="px-4 py-3 font-sans text-xs text-[#C8A97E] opacity-90">Status</th>
                        <th className="px-4 py-3 font-sans text-xs text-[#C8A97E] opacity-90"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.1)]">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                          <td className="px-4 py-3 font-sans text-xs text-[#F9F6F2]">{payment.ref}</td>
                          <td className="px-4 py-3 font-sans text-xs text-[#F9F6F2]">{payment.creator}</td>
                          <td className="px-4 py-3 font-sans text-xs text-[#F9F6F2]">{payment.session}</td>
                          <td className="px-4 py-3 font-sans text-xs text-[#F9F6F2]">{payment.amount}</td>
                          <td className="px-4 py-3 font-sans text-xs text-[#F9F6F2]">{payment.method}</td>
                          <td className="px-4 py-3 font-sans text-xs text-[#F9F6F2]">{payment.date}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-sans ${
                              payment.status === 'Paid' 
                                ? ' text-[#F9F6F2]' 
                                : ' text-[#F871F2]'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-[#C8A97E]">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
