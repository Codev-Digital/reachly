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

      {/* Main Content with Wide Container */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <p className="text-gray-400 font-medium mb-1 text-sm sm:text-base">Hello {displayName ? displayName : 'Sophia Reed'}!</p>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black font-sans tracking-tight">
              Manage Your <span className="text-[#0012FF]">Wallet Balance</span> <span className="text-gray-400 font-normal text-base sm:text-lg">Easily</span>
            </h1>
          </div>
        </div>

        {/* Redesigned Wallet Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8 items-stretch">
          
          {/* Card 1 - Available Balance (Longer Card with 3D Ball/Bubble Effects) */}
          <div className="lg:col-span-5 relative bg-[#0012FF] text-white rounded-[10px] p-5 shadow-sm flex flex-col justify-between h-[160px] hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-default">
            
            {/* 3D Ball / Bubble Background Overlay Effects across entire card */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[10px]">
              {/* Right side circles */}
              <div className="absolute -right-6 -bottom-10 w-48 h-48 rounded-full bg-gradient-to-br from-white/20 via-white/10 to-transparent border border-white/20 shadow-2xl" />
              <div className="absolute right-16 -top-10 w-36 h-36 rounded-full bg-gradient-to-br from-white/15 via-white/5 to-transparent border border-white/15" />
              <div className="absolute right-36 bottom-2 w-28 h-28 rounded-full bg-gradient-to-tr from-blue-700/60 to-blue-500/30" />
              
              {/* Left side & Middle circles */}
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

            {/* Bottom Row: Balance Meta + Payout Button */}
            <div className="flex items-end justify-between gap-4 z-10">
              <div>
                <p className="text-[11px] font-medium text-white/80 uppercase tracking-wide font-sans mb-0.5">Available Balance</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans my-0.5">
                  {availableBalance !== undefined && availableBalance !== null ? `${availableBalance.toLocaleString()} PKR` : '0 PKR'}
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

          {/* Right Grid: 3 Equal Cards (Lifetime Earning, Pending Earning, Total Paid Out) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 2 - Lifetime Earning (Mint Green) */}
            <div className="bg-[#AFE8B9] text-[#0A4A1C] rounded-[10px] p-5 shadow-sm flex flex-col justify-between h-[160px] hover:scale-[1.01] transition-all duration-300 cursor-default">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xs">
                  <DollarSign className="w-5 h-5 text-[#0A4A1C]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Lifetime Earning</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                  {lifetimeEarning !== undefined && lifetimeEarning !== null ? `${lifetimeEarning.toLocaleString()} PKR` : '0 PKR'}
                </h3>
              </div>
            </div>

            {/* Card 3 - Pending Earning (Light Gold) */}
            <div className="bg-[#FFEDB5] text-[#6C4800] rounded-[10px] p-5 shadow-sm flex flex-col justify-between h-[160px] hover:scale-[1.01] transition-all duration-300 cursor-default">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xs">
                  <Clock className="w-5 h-5 text-[#6C4800]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Pending Earning</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                  {pendingEarning !== undefined && pendingEarning !== null ? `${pendingEarning.toLocaleString()} PKR` : '0 PKR'}
                </h3>
              </div>
            </div>

            {/* Card 4 - Total Paid Out (Light Coral/Pink) */}
            <div className="bg-[#FFB3B3] text-[#701C1C] rounded-[10px] p-5 shadow-sm flex flex-col justify-between h-[160px] hover:scale-[1.01] transition-all duration-300 cursor-default">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xs">
                  <Calendar className="w-5 h-5 text-[#701C1C]" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium opacity-80 uppercase tracking-wide font-sans mb-0.5">Total Paid Out</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans my-0.5">
                  {totalPaidOut !== undefined && totalPaidOut !== null ? `${totalPaidOut.toLocaleString()} PKR` : '0 PKR'}
                </h3>
              </div>
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
