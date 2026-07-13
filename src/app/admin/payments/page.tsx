'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Payment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  creator: {
    name: string;
    username: string;
    avatar: string;
  };
  paymentMethod: string;
  date: string;
  time: string;
  amount: string;
  platformFee: string;
  creatorEarnings: string;
  status: 'Completed' | 'Pending' | 'Refunded';
}

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All Statuses' | 'Completed' | 'Pending' | 'Refunded'>('All Statuses');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Track selected payment for detailed view
  const [activeDetailPayment, setActiveDetailPayment] = useState<Payment | null>(null);

  const initialPayments: Payment[] = [
    {
      id: 'TXN-10245',
      user: { name: 'James Richard', username: '@jamesrichard', avatar: '/ahad raza mir.png' },
      creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/ahad raza mir.png' },
      paymentMethod: 'Jazzcash',
      date: '02 July 2026',
      time: '10:45 AM',
      amount: '25,000 PKR',
      platformFee: '5,000 PKR',
      creatorEarnings: '20,000 PKR',
      status: 'Completed'
    },
    {
      id: 'TXN-10246',
      user: { name: 'James Richard', username: '@jamesrichard', avatar: '/ahad raza mir.png' },
      creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/ahad raza mir.png' },
      paymentMethod: 'Easy Paisa',
      date: '02 July 2026',
      time: '10:45 AM',
      amount: '25,000 PKR',
      platformFee: '5,000 PKR',
      creatorEarnings: '20,000 PKR',
      status: 'Pending'
    },
    {
      id: 'TXN-10247',
      user: { name: 'James Richard', username: '@jamesrichard', avatar: '/ahad raza mir.png' },
      creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/ahad raza mir.png' },
      paymentMethod: 'Bank Card',
      date: '02 July 2026',
      time: '10:45 AM',
      amount: '25,000 PKR',
      platformFee: '5,000 PKR',
      creatorEarnings: '20,000 PKR',
      status: 'Completed'
    },
    {
      id: 'TXN-10248',
      user: { name: 'James Richard', username: '@jamesrichard', avatar: '/ahad raza mir.png' },
      creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/ahad raza mir.png' },
      paymentMethod: 'Jazzcash',
      date: '02 July 2026',
      time: '10:45 AM',
      amount: '25,000 PKR',
      platformFee: '5,000 PKR',
      creatorEarnings: '20,000 PKR',
      status: 'Refunded'
    },
    {
      id: 'TXN-10249',
      user: { name: 'James Richard', username: '@jamesrichard', avatar: '/ahad raza mir.png' },
      creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/ahad raza mir.png' },
      paymentMethod: 'Easy Paisa',
      date: '02 July 2026',
      time: '10:45 AM',
      amount: '25,000 PKR',
      platformFee: '5,000 PKR',
      creatorEarnings: '20,000 PKR',
      status: 'Pending'
    },
    {
      id: 'TXN-10250',
      user: { name: 'James Richard', username: '@jamesrichard', avatar: '/ahad raza mir.png' },
      creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/ahad raza mir.png' },
      paymentMethod: 'Bank Card',
      date: '02 July 2026',
      time: '10:45 AM',
      amount: '25,000 PKR',
      platformFee: '5,000 PKR',
      creatorEarnings: '20,000 PKR',
      status: 'Refunded'
    },
    {
      id: 'TXN-10251',
      user: { name: 'James Richard', username: '@jamesrichard', avatar: '/ahad raza mir.png' },
      creator: { name: 'Sophia Reed', username: '@sophiareed', avatar: '/ahad raza mir.png' },
      paymentMethod: 'Jazzcash',
      date: '02 July 2026',
      time: '10:45 AM',
      amount: '25,000 PKR',
      platformFee: '5,000 PKR',
      creatorEarnings: '20,000 PKR',
      status: 'Completed'
    }
  ];

  const [payments] = useState<Payment[]>(initialPayments);

  // Filter logic
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.creator.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'All Statuses' || payment.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (activeDetailPayment) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className="pb-12"
      >
        {/* Back Link */}
        <button
          onClick={() => setActiveDetailPayment(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-semibold"
        >
          <span>←</span> Back to Payments
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
            <span className="text-[#0012FF] font-black">Payment</span> Details{' '}
            <span className="text-gray-400 font-normal text-sm sm:text-base">Overview</span>
          </h1>
        </div>

        {/* Payment Detail Card */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Creator Profile (Left) */}
          <div className="flex flex-col items-center text-center md:border-r md:border-gray-100 md:pr-12 flex-shrink-0 w-full md:w-auto">
            <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-100 mb-4 shadow-sm">
              <img
                src={activeDetailPayment.creator.avatar}
                alt={activeDetailPayment.creator.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-lg font-bold text-black">{activeDetailPayment.creator.name}</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{activeDetailPayment.creator.username}</p>
            <span className="mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
              Creator
            </span>
          </div>

          {/* Details (Middle) */}
          <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Method</p>
              <p className="text-sm font-bold text-black mt-1">{activeDetailPayment.paymentMethod}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Platform Fee</p>
              <p className="text-sm font-bold text-black mt-1">{activeDetailPayment.platformFee}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
              <p className={`text-sm font-black mt-1 ${activeDetailPayment.status === 'Completed'
                  ? 'text-emerald-500'
                  : activeDetailPayment.status === 'Pending'
                    ? 'text-amber-500'
                    : 'text-rose-500'
                }`}>
                {activeDetailPayment.status}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Amount</p>
              <p className="text-sm font-bold text-black mt-1">{activeDetailPayment.amount}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date</p>
              <p className="text-sm font-bold text-black mt-1">{activeDetailPayment.date}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Creator Earnings</p>
              <p className="text-sm font-bold text-black mt-1">{activeDetailPayment.creatorEarnings}</p>
            </div>

            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Time</p>
              <p className="text-sm font-bold text-black mt-1">{activeDetailPayment.time}</p>
            </div>
          </div>

          {/* User Profile (Right) */}
          <div className="flex flex-col items-center text-center md:border-l md:border-gray-100 md:pl-12 flex-shrink-0 w-full md:w-auto">
            <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-100 mb-4 shadow-sm">
              <img
                src={activeDetailPayment.user.avatar}
                alt={activeDetailPayment.user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-lg font-bold text-black">{activeDetailPayment.user.name}</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{activeDetailPayment.user.username}</p>
            <span className="mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-[#E6F0FA] text-blue-500">
              User
            </span>
          </div>

        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="pb-12"
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-500 font-sans text-sm sm:text-base mb-1">Hello Anna Chris!</p>
        <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
          <span className="text-[#0012FF] font-black">Payments</span> Management{' '}
          <span className="text-gray-400 font-normal text-sm sm:text-base">Overview</span>
        </h1>
      </div>
      {/* Metrics Cards */}
      <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-5 mb-10 overflow-visible">
        {/* Card 1: Available Balance (Wallet Card) */}
        <div className="relative w-full sm:flex-[2.5] h-[160px] sm:h-[180px] p-5 flex flex-col justify-between overflow-visible z-[1]">
          <img
            src="/assets/wr-1.png"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none rounded-2xl sm:rounded-none"
          />
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
                <p className="text-2xl sm:text-3xl font-bold text-white font-sans">1,63,458 PKR</p>
              </div>
            </div>
            
            <button className="flex items-center hover:opacity-90 transition-all">
              <img
                src="/assets/payout.svg"
                alt="Payout"
                className="w-20 h-auto -translate-y-2 translate-x-3"
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

        {/* Card 2: Successful Payments */}
        <div className="relative w-full sm:flex-1 h-[145px] sm:h-[180px] p-5 flex flex-col justify-between overflow-visible z-[2] mt-4 sm:mt-0 sm:-ml-0.5">
          <img
            src="/assets/wr-2.png"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none rounded-2xl sm:rounded-none"
          />
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-sans mb-0.5 text-gray-500 font-medium">Successful Payments</p>
              <p className="text-xl sm:text-2xl font-bold font-sans text-[#22C55E]">2,234</p>
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

        {/* Card 3: Refund Issued */}
        <div className="relative w-full sm:flex-1 h-[145px] sm:h-[180px] pt-5 pb-5 pr-5 pl-12 sm:pl-14 flex flex-col justify-between overflow-visible z-[3] mt-4 sm:mt-0 sm:-ml-10">
          <img
            src="/assets/wr-3.png"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none rounded-2xl sm:rounded-none"
          />
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-sans mb-0.5 text-gray-500 font-medium">Refund Issued</p>
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

        {/* Card 4: Failed Payments */}
        <div className="relative w-full sm:flex-1 h-[145px] sm:h-[180px] pt-5 pb-5 pr-5 pl-12 sm:pl-14 flex flex-col justify-between overflow-visible z-[4] mt-4 sm:mt-0 sm:-ml-10">
          <img
            src="/assets/wr-4.png"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
          />
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-sans mb-0.5 text-gray-500 font-medium">Failed Payments</p>
              <p className="text-xl sm:text-2xl font-bold font-sans text-[#F43F5E]">543</p>
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

      {/* Main Container */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-black text-black font-sans">All Payments</h2>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Search by name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-black placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Custom Interactive Dropdown Filter */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between gap-8 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-all min-w-[150px]"
              >
                <span>{selectedStatusFilter}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-1.5 min-w-[170px] overflow-hidden"
                    >
                      {(['All Statuses', 'Completed', 'Pending', 'Refunded'] as const).map((filter) => {
                        const isSelected = selectedStatusFilter === filter;
                        return (
                          <button
                            key={filter}
                            onClick={() => {
                              setSelectedStatusFilter(filter);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm font-semibold transition-all ${isSelected
                              ? 'bg-[#0012FF] text-white'
                              : 'text-gray-500 hover:bg-gray-50'
                              }`}
                          >
                            {filter}
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100/80">
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Creator</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Method</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined Date</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 text-center uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => setActiveDetailPayment(payment)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    {/* ID */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{payment.id}</td>

                    {/* User */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                          <img src={payment.user.avatar} alt={payment.user.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black leading-none mb-0.5">{payment.user.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{payment.user.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Creator */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                          <img src={payment.creator.avatar} alt={payment.creator.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black leading-none mb-0.5">{payment.creator.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{payment.creator.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Method */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{payment.paymentMethod}</td>

                    {/* Date */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{payment.date}</td>

                    {/* Time */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{payment.time}</td>

                    {/* Amount */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{payment.amount}</td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${payment.status === 'Completed'
                            ? 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                            : payment.status === 'Pending'
                              ? 'bg-amber-50 text-[#F59E0B] border border-amber-200'
                              : 'bg-blue-50 text-blue-500 border border-blue-200'
                          }`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setActiveDetailPayment(payment)}
                          className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-400 hover:bg-gray-200 hover:text-gray-500 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm font-semibold text-gray-400">
                    No transactions found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-50">
          <p className="text-xs font-semibold text-gray-400">Showing {filteredPayments.length} of {payments.length}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentPage === 1
                ? 'bg-[#0012FF] text-white shadow-md shadow-[#0012FF]/20'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentPage === 2
                ? 'bg-[#0012FF] text-white shadow-md shadow-[#0012FF]/20'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
              onClick={() => setCurrentPage(2)}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
