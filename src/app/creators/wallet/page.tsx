'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import { CreditCard, DollarSign, Clock, Calendar, ArrowUpRight, Search, ChevronDown, TrendingUp } from 'lucide-react';

export default function CreatorWallet() {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [availableBalance, setAvailableBalance] = useState(0);
  const [lifetimeEarning, setLifetimeEarning] = useState(0);
  const [pendingEarning, setPendingEarning] = useState(0);
  const [totalPaidOut, setTotalPaidOut] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          const name = data.creatorProfile?.displayName || data.user?.name || '';
          const photo = data.creatorProfile?.profilePhoto || null;
          setDisplayName(name);
          setProfilePhoto(photo);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }

    async function loadWalletData() {
      try {
        setLoading(true);
        const res = await fetch('/api/creators/wallet');
        if (res.ok) {
          const data = await res.json();
          setAvailableBalance(data.availableBalance || 0);
          setLifetimeEarning(data.lifetimeEarning || 0);
          setPendingEarning(data.pendingEarning || 0);
          setTotalPaidOut(data.totalPaidOut || 0);
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error('Failed to load wallet data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
    loadWalletData();
  }, []);

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      txn.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === '' || txn.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      {/* Main Content with Constrained Max Width */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <p className="text-gray-500 font-sans mb-1 text-sm sm:text-base">Hello {displayName ? displayName.split(' ')[0] : 'Creator'}!</p>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-sans tracking-tight">
              Manage Your <span className="text-[#0012FF]">Wallet Balance</span> Easily
            </h1>
            <span className="text-gray-400 font-sans text-base sm:text-lg">/ Overview</span>
          </div>
        </div>

        {/* Pure CSS Cards Grid - Shorter height and exact dashboard styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1 - Available Balance (Solid Royal Blue) */}
          <div className="bg-[#0012FF] text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40 hover:scale-[1.02] transition-all duration-300 hover:shadow-md cursor-default">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-semibold text-white/80 uppercase tracking-wider mb-1 font-sans">Available Balance</span>
                <span className="text-3xl font-bold tracking-tight font-sans">{availableBalance.toLocaleString()} PKR</span>
              </div>
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+18.2% from last month</span>
              </div>
              <button className="bg-white hover:bg-white/95 text-[#0012FF] px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-sm cursor-pointer">
                Payout
              </button>
            </div>
          </div>

          {/* Card 2 - Lifetime Earning (Light Green) */}
          <div className="bg-[#AFE8B9] text-[#0A4A1C] rounded-3xl p-6 shadow-sm border border-emerald-100/30 flex flex-col justify-between h-40 hover:scale-[1.02] transition-all duration-300 hover:shadow-md cursor-default">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-semibold opacity-75 uppercase tracking-wider mb-1 font-sans">Lifetime Earning</span>
                <span className="text-3xl font-bold tracking-tight font-sans">{lifetimeEarning.toLocaleString()} PKR</span>
              </div>
              <div className="w-12 h-12 bg-white/40 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm">
                <DollarSign className="w-6 h-6 text-[#0A4A1C]" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium opacity-85">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+18.2% from last month</span>
            </div>
          </div>

          {/* Card 3 - Pending Earning (Light Gold) */}
          <div className="bg-[#FFEDB5] text-[#6C4800] rounded-3xl p-6 shadow-sm border border-amber-100/30 flex flex-col justify-between h-40 hover:scale-[1.02] transition-all duration-300 hover:shadow-md cursor-default">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-semibold opacity-75 uppercase tracking-wider mb-1 font-sans">Pending Earning</span>
                <span className="text-3xl font-bold tracking-tight font-sans">{pendingEarning.toLocaleString()} PKR</span>
              </div>
              <div className="w-12 h-12 bg-white/40 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm">
                <Clock className="w-6 h-6 text-[#6C4800]" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium opacity-85">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+18.2% from last month</span>
            </div>
          </div>

          {/* Card 4 - Total Paid Out (Light Red) */}
          <div className="bg-[#FFB3B3] text-[#701C1C] rounded-3xl p-6 shadow-sm border border-red-100/30 flex flex-col justify-between h-40 hover:scale-[1.02] transition-all duration-300 hover:shadow-md cursor-default">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-semibold opacity-75 uppercase tracking-wider mb-1 font-sans">Total Paid Out</span>
                <span className="text-3xl font-bold tracking-tight font-sans">{totalPaidOut.toLocaleString()} PKR</span>
              </div>
              <div className="w-12 h-12 bg-white/40 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm">
                <Calendar className="w-6 h-6 text-[#701C1C]" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium opacity-85">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+18.2% from last month</span>
            </div>
          </div>

        </div>

        {/* Transactions Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-black font-sans">Recent Transactions</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Search by name or ID"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 lg:w-80 bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all"
              />
            </div>

            {/* Dropdown status selector */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between gap-8 bg-white border border-gray-200 rounded-2xl px-4.5 py-2.5 text-sm text-gray-900 focus:outline-none min-w-[160px] font-bold cursor-pointer hover:border-gray-305"
              >
                <span className="font-semibold text-gray-700">
                  {statusOptions.find(o => o.value === statusFilter)?.label || 'All Statuses'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-semibold transition-all cursor-pointer ${
                        statusFilter === option.value
                          ? 'bg-[#0012FF] text-white'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-[#0012FF] animate-spin"></div>
                        <span>Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 font-semibold">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-900">{txn.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-semibold">{txn.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">{txn.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">{txn.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-extrabold text-gray-900">{txn.amount}</td>   
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold ${
                          txn.status === 'Completed'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : txn.status === 'Pending'
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="border border-gray-200 rounded-full px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer">
                            View
                          </button>
                          <button className="border border-gray-200 rounded-full px-3 py-1.5 text-xs font-bold text-[#0012FF] hover:bg-[#0012FF]/5 transition-all cursor-pointer">
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500 font-medium">Showing {filteredTransactions.length} of {transactions.length}</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0012FF] text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
