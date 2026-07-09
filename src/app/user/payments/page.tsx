'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import UserNavbar from '@/components/UserNavbar';

export default function UserPayments() {
  const [displayName, setDisplayName] = useState('James Richard');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const userData = await res.json();
          if (userData.user) {
            setDisplayName(userData.user.name || 'James Richard');
            setProfilePhoto(userData.user.image || null);
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    }
    checkAuth();
  }, []);

  const transactions = [
    { id: 'TXN-10245', creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg' }, session: 'Styling Consultation', method: 'Jazzcash', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Completed' },
    { id: 'TXN-10245', creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg' }, session: 'Styling Consultation', method: 'Easy Paisa', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Pending' },
    { id: 'TXN-10245', creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg' }, session: 'Styling Consultation', method: 'Bank Card', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Completed' },
    { id: 'TXN-10245', creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg' }, session: 'Styling Consultation', method: 'Jazzcash', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Refunded' },
    { id: 'TXN-10245', creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg' }, session: 'Styling Consultation', method: 'Easy Paisa', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Pending' },
    { id: 'TXN-10245', creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg' }, session: 'Styling Consultation', method: 'Bank Card', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Refunded' },
    { id: 'TXN-10245', creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/Avatars/12.jpg' }, session: 'Styling Consultation', method: 'Jazzcash', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Completed' },
  ];

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.creator.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'All' || txn.method === methodFilter;
    const matchesStatus = statusFilter === 'All' || txn.status === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F7F7FA] pb-12">
      <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.main
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          {/* Header */}
          <div className="mb-6">
            <p className="text-gray-400 font-sans mb-1 text-sm sm:text-base font-medium">Hello {displayName}!</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black font-anton tracking-tight mb-6">
              Manage Your <span className="text-[#0012FF] italic">Wallet</span> <span className="text-gray-400 font-normal text-xl sm:text-2xl">with ease</span>
            </h1>
          </div>

          {/* Wallet Cards - stacked on mobile, overlapping on desktop */}
          <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-5 mb-8">

            {/* Card 1 - Available Balance */}
            <div className="relative sm:flex-[2] h-[180px] sm:h-[210px] overflow-visible rounded-2xl sm:rounded-none">
              <Image src="/assets/wr-1.png" alt="" fill className="object-fill rounded-2xl sm:rounded-none" priority />
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-sans mb-0.5 text-white/80">Available Balance</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white font-sans">63,458 PKR</p>
                    </div>
                  </div>
                  <button className="flex items-center hover:opacity-90 transition-all">
                    <Image
                      src="/assets/payout.svg"
                      alt="Payout"
                      width={80}
                      height={12}
                      className="-translate-y-3 translate-x-5"
                    />
                  </button>
                </div>
                <div className="flex items-center gap-1 text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  <span className="text-xs sm:text-sm font-semibold">+18.2% from last month</span>
                </div>
              </div>
            </div>

            {/* Card 2 - Total Spent */}
            <div className="relative sm:flex-1 h-[160px] sm:h-[210px] overflow-visible rounded-2xl sm:rounded-none sm:-ml-0.5 sm:z-10">
              <Image src="/assets/wr-2.png" alt="" fill className="object-fill rounded-2xl sm:rounded-none" />
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-sans mb-0.5 text-gray-500 font-medium">Total spent</p>
                    <p className="text-xl sm:text-2xl font-bold font-sans text-[#22C55E]">22,458 PKR</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#22C55E]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  <span className="text-xs sm:text-sm font-semibold">+18.2% from last month</span>
                </div>
              </div>
            </div>

            {/* Card 3 - Total Refunded */}
            <div className="relative sm:flex-1 h-[160px] sm:h-[210px] overflow-visible rounded-2xl sm:rounded-none ml-0 sm:-ml-10 sm:z-20">
              <Image src="/assets/wr-3.png" alt="" fill className="object-fill rounded-2xl sm:rounded-none" />
              <div className="absolute inset-0 pt-4 pb-4 pr-4 pl-12 sm:pt-5 sm:pb-5 sm:pr-5 sm:pl-14 flex flex-col justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-sans mb-0.5 text-gray-500 font-medium">Total Refunded</p>
                    <p className="text-xl sm:text-2xl font-bold font-sans text-[#F59E0B]">2,058 PKR</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#F59E0B]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  <span className="text-xs sm:text-sm font-semibold">+18.2% from last month</span>
                </div>
              </div>
            </div>

            {/* Card 4 - Active Bookings Value */}
            <div className="relative sm:flex-1 h-[160px] sm:h-[210px] overflow-visible rounded-2xl sm:rounded-none ml-0 sm:-ml-10 sm:z-30">
              <Image src="/assets/wr-4.png" alt="" fill className="object-fill rounded-2xl sm:rounded-none" />
              <div className="absolute inset-0 pt-4 pb-4 pr-4 pl-12 sm:pt-5 sm:pb-5 sm:pr-5 sm:pl-14 flex flex-col justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-sans mb-0.5 text-gray-500 font-medium">Active Bookings Value</p>
                    <p className="text-xl sm:text-2xl font-bold font-sans text-[#F43F5E]">5,543 PKR</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#F43F5E]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  <span className="text-xs sm:text-sm font-semibold">+18.2% from last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Table Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-black font-anton">Payment History</h2>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 lg:w-80 bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all"
                />
              </div>

              {/* Payment Method Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setMethodDropdownOpen(!methodDropdownOpen);
                    setStatusDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-6 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none min-w-[150px]"
                >
                  <span className="font-medium">{methodFilter === 'All' ? 'Payment method' : methodFilter}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${methodDropdownOpen ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {methodDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    {['All', 'Jazzcash', 'Easy Paisa', 'Bank Card'].map((method) => (
                      <button
                        key={method}
                        onClick={() => {
                          setMethodFilter(method);
                          setMethodDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-all ${methodFilter === method ? 'bg-[#0012FF] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {method === 'All' ? 'All Methods' : method}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* All Statuses Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setStatusDropdownOpen(!statusDropdownOpen);
                    setMethodDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-6 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none min-w-[140px]"
                >
                  <span className="font-medium">{statusFilter === 'All' ? 'All Statuses' : statusFilter}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${statusDropdownOpen ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {statusDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    {['All', 'Completed', 'Pending', 'Refunded'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-all ${statusFilter === status ? 'bg-[#0012FF] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {status === 'All' ? 'All Statuses' : status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FCFCFD] border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Creator</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Session</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Method</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredTransactions.map((txn, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500 font-medium">{txn.id}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                            <img src={txn.creator.avatar} alt={txn.creator.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{txn.creator.name}</p>
                            <p className="text-xs text-gray-400">{txn.creator.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">{txn.session}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-900 font-bold">{txn.method}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">{txn.date}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">{txn.time}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-gray-900">{txn.amount}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${txn.status === 'Completed'
                          ? 'bg-green-50 text-green-600'
                          : txn.status === 'Pending'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-blue-50 text-blue-600'
                          }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm">
                        <button className="border border-gray-200 rounded-full px-4 py-1 text-xs font-semibold text-[#0012FF] hover:bg-[#0012FF]/5 transition-all">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-sm text-gray-400 font-medium">Showing 7 of 20</p>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0012FF] text-white text-xs font-bold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 text-xs font-bold transition-all">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}