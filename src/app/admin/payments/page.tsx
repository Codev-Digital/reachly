'use client';

import { AdminPaymentsSkeleton } from '@/components/admin/AdminSkeletons';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  DollarSign,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import ManualPaymentProofs from '@/components/admin/ManualPaymentProofs';

interface Payment {
  id: string;
  dbId: string;
  bookingRef?: string | null;
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
  rawAmount: number;
  platformFee: string;
  creatorEarnings: string;
  status: 'Completed' | 'Pending' | 'Refunded' | 'Rejected';
  createdAtMs?: number;
  isoDate?: string;
}

type StatusFilter = 'All Statuses' | 'Completed' | 'Pending' | 'Refunded' | 'Rejected';
type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low';
type DatePreset = 'all' | 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'lastMonth' | 'custom';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const openDetail = (p: any) => router.push(`/admin/payments/${p.dbId || p.id}`);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilter>('All Statuses');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Date / Calendar Filter
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // Sort Filter
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  // Calculate dynamic stats
  const totalRevenue = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'Completed')
        .reduce((sum, p) => sum + (p.rawAmount || 0), 0),
    [payments]
  );
  const successfulPayments = useMemo(
    () => payments.filter((p) => p.status === 'Completed').length,
    [payments]
  );
  const refundIssued = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'Refunded')
        .reduce((sum, p) => sum + (p.rawAmount || 0), 0),
    [payments]
  );
  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status === 'Pending').length,
    [payments]
  );

  // Date preset selector
  const handleSelectDatePreset = (preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      setIsDateDropdownOpen(false);
      return;
    }
    if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
      setIsDateDropdownOpen(false);
      return;
    }
    if (preset === 'yesterday') {
      const y = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      setStartDate(y.toISOString().split('T')[0]);
      setEndDate(y.toISOString().split('T')[0]);
      setIsDateDropdownOpen(false);
      return;
    }
    if (preset === 'last7') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(past7.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
      setIsDateDropdownOpen(false);
      return;
    }
    if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
      setIsDateDropdownOpen(false);
      return;
    }
    if (preset === 'lastMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
      setIsDateDropdownOpen(false);
      return;
    }
  };

  const dateFilterLabel = useMemo(() => {
    if (startDate && endDate) {
      if (startDate === endDate) return startDate;
      return `${startDate} → ${endDate}`;
    }
    if (startDate) return `From ${startDate}`;
    if (endDate) return `Until ${endDate}`;
    return 'Filter by Date';
  }, [startDate, endDate]);

  const sortLabel = useMemo(() => {
    if (sortBy === 'newest') return 'Newest';
    if (sortBy === 'oldest') return 'Oldest';
    if (sortBy === 'amount-high') return 'Amount: High';
    if (sortBy === 'amount-low') return 'Amount: Low';
    return 'Newest';
  }, [sortBy]);

  // Filter & Sort logic
  const filteredPayments = useMemo(() => {
    return payments
      .filter((payment) => {
        // Search matches ID, bookingRef, user name, creator name, or paymentMethod
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          payment.id.toLowerCase().includes(q) ||
          (payment.bookingRef || '').toLowerCase().includes(q) ||
          (payment.user?.name || '').toLowerCase().includes(q) ||
          (payment.creator?.name || '').toLowerCase().includes(q) ||
          (payment.paymentMethod || '').toLowerCase().includes(q);

        const matchesStatus =
          selectedStatusFilter === 'All Statuses' || payment.status === selectedStatusFilter;

        // Date filter
        let matchesDate = true;
        if (startDate || endDate) {
          const itemTime =
            payment.createdAtMs ||
            (payment.isoDate ? new Date(payment.isoDate).getTime() : 0);
          if (startDate) {
            const startMs = new Date(`${startDate}T00:00:00`).getTime();
            if (itemTime < startMs) matchesDate = false;
          }
          if (endDate) {
            const endMs = new Date(`${endDate}T23:59:59.999`).getTime();
            if (itemTime > endMs) matchesDate = false;
          }
        }

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (b.createdAtMs || 0) - (a.createdAtMs || 0);
        if (sortBy === 'oldest') return (a.createdAtMs || 0) - (b.createdAtMs || 0);
        if (sortBy === 'amount-high') return (b.rawAmount || 0) - (a.rawAmount || 0);
        if (sortBy === 'amount-low') return (a.rawAmount || 0) - (b.rawAmount || 0);
        return 0;
      });
  }, [payments, searchQuery, selectedStatusFilter, startDate, endDate, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatusFilter, startDate, endDate, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

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
      <ManualPaymentProofs onReviewed={loadPayments} />

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
              <p className="text-[11px] font-medium text-white/80 uppercase tracking-wide font-sans mb-0.5">
                Total Revenue
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans my-0.5">
                {totalRevenue.toLocaleString()} PKR
              </h3>
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
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">
                Successful Payments
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                {successfulPayments}
              </h3>
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
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">
                Refund Issued
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                {refundIssued.toLocaleString()} PKR
              </h3>
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
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">
                Pending Payments
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                {pendingPayments}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-black text-black font-sans">All Payments</h2>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

            {/* ── 1. Filter by Date Dropdown ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                className={`flex items-center gap-2.5 px-4 py-2.5 bg-white border rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  startDate || endDate || datePreset !== 'all'
                    ? 'border-[#0012FF] text-[#0012FF]'
                    : 'border-gray-200 text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#0012FF]" />
                <span>{dateFilterLabel}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-200 ${
                    isDateDropdownOpen ? 'rotate-180' : ''
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <AnimatePresence>
                {isDateDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDateDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 p-4 w-[280px] sm:w-[320px]"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-800">Date Range</span>
                        {(startDate || endDate || datePreset !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setDatePreset('all');
                              setStartDate('');
                              setEndDate('');
                              setIsDateDropdownOpen(false);
                            }}
                            className="text-[11px] font-semibold text-rose-600 hover:underline"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        {[
                          { key: 'all', label: 'All Time' },
                          { key: 'today', label: 'Today' },
                          { key: 'yesterday', label: 'Yesterday' },
                          { key: 'last7', label: 'Last 7 Days' },
                          { key: 'thisMonth', label: 'This Month' },
                          { key: 'lastMonth', label: 'Last Month' },
                        ].map((preset) => (
                          <button
                            key={preset.key}
                            type="button"
                            onClick={() => handleSelectDatePreset(preset.key as DatePreset)}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl text-left transition-all ${
                              datePreset === preset.key
                                ? 'bg-[#0012FF] text-white'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Custom Date
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="block text-[10px] text-gray-500 mb-0.5">From</span>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => {
                                setStartDate(e.target.value);
                                setDatePreset('custom');
                              }}
                              className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] text-gray-500 mb-0.5">To</span>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => {
                                setEndDate(e.target.value);
                                setDatePreset('custom');
                              }}
                              className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setIsDateDropdownOpen(false)}
                          className="px-3 py-1 text-xs font-bold bg-[#0012FF] text-white rounded-lg hover:bg-[#0010d0]"
                        >
                          Apply
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* ── 2. All Statuses Dropdown ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center justify-between gap-6 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-all min-w-[140px]"
              >
                <span>{selectedStatusFilter}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-200 ${
                    isStatusDropdownOpen ? 'rotate-180' : ''
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <AnimatePresence>
                {isStatusDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsStatusDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-1.5 min-w-[170px] overflow-hidden"
                    >
                      {(
                        [
                          'All Statuses',
                          'Completed',
                          'Pending',
                          'Rejected',
                          'Refunded',
                        ] as const
                      ).map((filter) => {
                        const isSelected = selectedStatusFilter === filter;
                        return (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => {
                              setSelectedStatusFilter(filter);
                              setIsStatusDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm font-semibold transition-all ${
                              isSelected
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

            {/* ── 3. Sort: Newest Dropdown ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 font-normal">Sort:</span>
                <span className="text-gray-800 font-bold">{sortLabel}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`transition-transform duration-200 ${
                    isSortDropdownOpen ? 'rotate-180' : ''
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <AnimatePresence>
                {isSortDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsSortDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 py-1.5 min-w-[190px] overflow-hidden"
                    >
                      {[
                        { key: 'newest', label: 'Newest' },
                        { key: 'oldest', label: 'Oldest' },
                        { key: 'amount-high', label: 'Amount: High to low' },
                        { key: 'amount-low', label: 'Amount: Low to high' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setSortBy(item.key as SortOption);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm font-semibold transition-all flex items-center justify-between ${
                            sortBy === item.key
                              ? 'bg-[#0012FF] text-white'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>{item.label}</span>
                          {sortBy === item.key && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
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
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Creator
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 text-center uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-[#F8F8F8] border-b border-gray-200">
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    onClick={() => openDetail(payment)}
                    className="hover:bg-[#EFEFEF] transition-colors cursor-pointer"
                  >
                    {/* ID */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">
                      <div>
                        <span>{payment.id}</span>
                        {payment.bookingRef && (
                          <span className="block text-[11px] font-mono text-gray-400 font-normal">
                            {payment.bookingRef}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                          <img
                            src={payment.user.avatar || '/avatar.png'}
                            alt={payment.user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black leading-none mb-0.5">
                            {payment.user.name}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">
                            {payment.user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Creator */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                          <img
                            src={payment.creator.avatar || '/avatar.png'}
                            alt={payment.creator.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black leading-none mb-0.5">
                            {payment.creator.name}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">
                            {payment.creator.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Method */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">
                      {payment.paymentMethod}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">
                      {payment.date}
                    </td>

                    {/* Time */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">
                      {payment.time}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">
                      {payment.amount}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          payment.status === 'Completed'
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
                          type="button"
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
                  <td
                    colSpan={9}
                    className="py-8 text-center text-sm font-semibold text-gray-400"
                  >
                    No transactions found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-400">
            Showing{' '}
            {filteredPayments.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredPayments.length)} of{' '}
            {filteredPayments.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 5) return true;
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, idx, arr) => {
                const prevPage = arr[idx - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsis && <span className="text-xs text-gray-400">…</span>}
                    <button
                      type="button"
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        currentPage === page
                          ? 'bg-[#0012FF] text-white shadow-md shadow-[#0012FF]/20'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
