'use client';

import { AdminPaymentsSkeleton } from '@/components/admin/AdminSkeletons';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, DollarSign, Clock, Calendar, ArrowUpRight } from 'lucide-react';
import ManualPaymentProofs from '@/components/admin/ManualPaymentProofs';

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
  status: 'Completed' | 'Pending' | 'Refunded' | 'Rejected';
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const openDetail = (p: any) => router.push(`/admin/payments/${p.dbId || p.id}`);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All Statuses' | 'Completed' | 'Pending' | 'Refunded' | 'Rejected'>('All Statuses');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/payments');
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
        }
      } catch (err) {
        console.error('Failed to load payments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  // Calculate dynamic stats
  const totalRevenue = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + (p.rawAmount || 0), 0);
  const successfulPayments = payments.filter(p => p.status === 'Completed').length;
  const refundIssued = payments.filter(p => p.status === 'Refunded').reduce((sum, p) => sum + (p.rawAmount || 0), 0);
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;

  // Filter logic
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.creator.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'All Statuses' || payment.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <AdminPaymentsSkeleton />;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="pb-12"
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-500 font-sans text-sm sm:text-base mb-1">Hello Admin Abdullah!</p>
        <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
          <span className="text-[#0012FF] font-black">Payments</span> Management{' '}
          <span className="text-gray-400 font-normal text-sm sm:text-base">Overview</span>
        </h1>
      </div>
      <ManualPaymentProofs />
      {/* Metrics Cards (Wallet Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10 items-stretch">
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
            <div className="w-9 h-9 shrink-0 self-start bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5 text-[#0012FF]" />
            </div>
          </div>

          {/* Bottom Row: Balance Meta + Top Up Button */}
          <div className="flex items-end justify-between gap-4 z-10">
            <div>
              <p className="text-[11px] font-medium text-white/80 uppercase tracking-wide font-sans mb-0.5">Total Revenue</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans my-0.5">{totalRevenue.toLocaleString()} PKR</h3>
            </div>

            {/* Payout Button */}
            <button className="bg-white hover:bg-gray-50 text-black pl-4 pr-1.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer shrink-0">
              <span>Payout</span>
              <div className="w-5 h-5 bg-[#0012FF] rounded-full flex items-center justify-center text-white">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </button>
          </div>
        </div>

        {/* Right Grid: 3 Equal Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 2 - Successful Payments */}
          <div className="bg-[#AFE8B9] text-[#0A4A1C] rounded-[10px] p-5 shadow-sm flex flex-col justify-between h-[160px] hover:scale-[1.01] transition-all duration-300 cursor-default">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 shrink-0 self-start bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xs">
                <DollarSign className="w-5 h-5 text-[#0A4A1C]" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Successful Payments</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">{successfulPayments}</h3>
            </div>
          </div>

          {/* Card 3 - Refund Issued */}
          <div className="bg-[#FFEDB5] text-[#6C4800] rounded-[10px] p-5 shadow-sm flex flex-col justify-between h-[160px] hover:scale-[1.01] transition-all duration-300 cursor-default">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 shrink-0 self-start bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5 text-[#6C4800]" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Refund Issued</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">{refundIssued.toLocaleString()} PKR</h3>
            </div>
          </div>

          {/* Card 4 - Failed Payments */}
          <div className="bg-[#FFB3B3] text-[#701C1C] rounded-[10px] p-5 shadow-sm flex flex-col justify-between h-[160px] hover:scale-[1.01] transition-all duration-300 cursor-default">
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 shrink-0 self-start bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xs">
                <Calendar className="w-5 h-5 text-[#701C1C]" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Pending Payments</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">{pendingPayments}</h3>
            </div>
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
                      {(['All Statuses', 'Completed', 'Pending', 'Rejected', 'Refunded'] as const).map((filter) => {
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
            <thead className="bg-white">
              <tr className="border-b border-gray-200">
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
            <tbody className="divide-y divide-gray-200 bg-[#F8F8F8] border-b border-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => openDetail(payment)}
                    className="hover:bg-[#EFEFEF] transition-colors cursor-pointer"
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
                            : payment.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
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
                          onClick={() => openDetail(payment)}
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
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
