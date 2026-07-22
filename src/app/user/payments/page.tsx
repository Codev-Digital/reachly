'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import UserNavbar from '@/components/UserNavbar';
import { CreditCard, DollarSign, Clock, Calendar, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function UserPayments() {
  const [displayName, setDisplayName] = useState('James Richard');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/user/bookings');
        if (res.ok) {
          const data = await res.json();
          const formatted = (data.bookings || []).map((b: any) => ({
            id: b.ref || `TXN-${b.id.slice(-5).toUpperCase()}`,
            creator: {
              name: b.creator,
              username: b.username ? `@${b.username}` : '',
              avatar: b.image || '/ahad raza mir.png'
            },
            session: b.session,
            method: b.paymentMethod || 'Jazzcash',
            date: b.shortDate || b.date,
            time: b.time,
            amount: b.price || '0 PKR',
            status: b.originalStatus === 'refunded' ? 'Refunded' : b.status === 'Pending Approval' || b.originalStatus === 'pending' ? 'Pending' : 'Completed',
            rawPrice: parseFloat((b.price || '').replace(/[^0-9.]/g, '')) || 0,
            rawStatus: b.originalStatus,
            scheduledDate: b.scheduledDate
          }));
          setTransactions(formatted);
        }
      } catch (err) {
        console.error('Error loading bookings:', err);
      } finally {
        setLoading(false);
      }
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const userData = await res.json();
          if (userData.user) {
            setDisplayName(userData.user.name || 'James Richard');
            setProfilePhoto(userData.creatorProfile?.profilePhoto || userData.user.image || null);
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    }

    checkAuth();
    loadData();
  }, []);

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.creator.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'All' || txn.method.toLowerCase().replace(/\s+/g, '') === methodFilter.toLowerCase().replace(/\s+/g, '');
    const matchesStatus = statusFilter === 'All' || txn.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesMethod && matchesStatus;
  });

  const totalSpent = transactions
    .filter(t => t.rawStatus === 'completed' || t.rawStatus === 'confirmed')
    .reduce((sum, t) => sum + t.rawPrice, 0);

  const totalRefunded = transactions
    .filter(t => t.rawStatus === 'refunded')
    .reduce((sum, t) => sum + t.rawPrice, 0);

  const activeBookingsValue = transactions
    .filter(t => t.rawStatus === 'confirmed' && new Date(t.scheduledDate) > new Date())
    .reduce((sum, t) => sum + t.rawPrice, 0);

  const availableBalance = Math.max(0, 50000 + totalRefunded - totalSpent);

  return (
    <div className="min-h-screen bg-[#F8F8FA] pb-12">
      <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />

      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1"
        >
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <p className="text-gray-400 font-medium mb-1 text-sm sm:text-base">Hello {displayName.split(' ')[0]}!</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black font-sans tracking-tight">
              Manage Your <span className="text-[#0012FF]">Wallet Balance</span> <span className="text-gray-400 font-normal text-base sm:text-lg">Easily</span>
            </h1>
          </div>

          {/* Redesigned Wallet Cards Section (Matching Creator Wallet Page) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8 items-stretch">

            {/* Card 1 - Available Balance (Longer Card with 3D Ball/Bubble Effects) */}
            <div className="lg:col-span-5 relative bg-[#0012FF] text-white rounded-[10px] p-5 shadow-sm flex flex-col justify-between h-[160px] hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-default">

              {/* 3D Ball / Bubble Background Overlay Effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[10px]">
                <div className="absolute -right-6 -bottom-10 w-48 h-48 rounded-full bg-gradient-to-br from-white/20 via-white/10 to-transparent border border-white/20 shadow-2xl" />
                <div className="absolute right-16 -top-10 w-36 h-36 rounded-full bg-gradient-to-br from-white/15 via-white/5 to-transparent border border-white/15" />
                <div className="absolute right-36 bottom-2 w-28 h-28 rounded-full bg-gradient-to-tr from-blue-700/60 to-blue-500/30" />
                <div className="absolute -left-12 -top-10 w-44 h-44 rounded-full bg-gradient-to-br from-white/15 via-white/5 to-transparent border border-white/15" />
                <div className="absolute left-20 -bottom-14 w-36 h-36 rounded-full bg-gradient-to-tr from-white/20 to-transparent border border-white/20" />
                <div className="absolute left-44 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5 border border-white/10" />
              </div>

              {/* Top Row: Icon Badge */}
              <div className="flex justify-between items-start z-10">
                <div className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5 text-[#0012FF]" />
                </div>
              </div>

              {/* Bottom Row: Balance Meta + Top Up Button */}
              <div className="flex items-end justify-between gap-4 z-10">
                <div>
                  <p className="text-[11px] font-medium text-white/80 uppercase tracking-wide font-sans mb-0.5">Available Balance</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans my-0.5">{availableBalance.toLocaleString()} PKR</h3>
                  <p className="text-[11px] font-medium text-white/85 flex items-center gap-1 font-sans">
                    <span>↑ +18.2% from last month</span>
                  </p>
                </div>

                {/* Top Up Button */}
                <button className="bg-white hover:bg-gray-50 text-black pl-4 pr-1.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer shrink-0">
                  <span>Top Up</span>
                  <div className="w-5 h-5 bg-[#0012FF] rounded-full flex items-center justify-center text-white">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>
              </div>
            </div>

            {/* Right Grid: 3 Equal Cards (Total Spent, Active Sessions, Total Refunded) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Card 2 - Total Spent (Mint Green) */}
              <div className="bg-[#AFE8B9] text-[#0A4A1C] rounded-[10px] p-5 shadow-sm flex flex-col justify-between h-[160px] hover:scale-[1.01] transition-all duration-300 cursor-default">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xs">
                    <DollarSign className="w-5 h-5 text-[#0A4A1C]" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Total Spent</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">{totalSpent ? totalSpent.toLocaleString() : '12,500'} PKR</h3>
                  <p className="text-[11px] font-medium opacity-85 flex items-center gap-1 font-sans">
                    <span>↑ +18.2% from last month</span>
                  </p>
                </div>
              </div>

              {/* Card 3 - Active Sessions (Light Gold) */}
              <div className="bg-[#FFEDB5] text-[#6C4800] rounded-[10px] p-5 shadow-sm flex flex-col justify-between h-[160px] hover:scale-[1.01] transition-all duration-300 cursor-default">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xs">
                    <Clock className="w-5 h-5 text-[#6C4800]" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Active Sessions</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">{activeBookingsValue ? activeBookingsValue.toLocaleString() : '5,000'} PKR</h3>
                  <p className="text-[11px] font-medium opacity-85 flex items-center gap-1 font-sans">
                    <span>↑ +18.2% from last month</span>
                  </p>
                </div>
              </div>

              {/* Card 4 - Total Refunded (Light Pink/Coral) */}
              <div className="bg-[#FFB3B3] text-[#701C1C] rounded-[10px] p-5 shadow-sm flex flex-col justify-between h-[160px] hover:scale-[1.01] transition-all duration-300 cursor-default">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xs">
                    <Calendar className="w-5 h-5 text-[#701C1C]" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Total Refunded</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">{totalRefunded ? totalRefunded.toLocaleString() : '2,500'} PKR</h3>
                  <p className="text-[11px] font-medium opacity-85 flex items-center gap-1 font-sans">
                    <span>↑ +18.2% from last month</span>
                  </p>
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
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-500 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-[#0012FF] animate-spin"></div>
                          <span>Loading transaction history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-500 font-semibold">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((txn, idx) => (
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
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            txn.status === 'Completed'
                              ? 'bg-green-50 text-green-600'
                              : txn.status === 'Pending'
                              ? 'bg-yellow-50 text-yellow-600'
                              : 'bg-red-50 text-red-600'
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-sm text-gray-400 font-medium">Showing {filteredTransactions.length} of {transactions.length}</p>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0012FF] text-white text-xs font-bold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}