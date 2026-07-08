'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';

export default function CreatorWallet() {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    loadProfile();
  }, []);

  const transactions = [
    { id: 'TXN-10245', type: 'Payout', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Completed' },
    { id: 'TXN-10245', type: 'Refund', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Pending' },
    { id: 'TXN-10245', type: 'Payout', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Failed' },
    { id: 'TXN-10245', type: 'Refund', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Completed' },
    { id: 'TXN-10245', type: 'Payout', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Pending' },
    { id: 'TXN-10245', type: 'Refund', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Failed' },
    { id: 'TXN-10245', type: 'Payout', date: '02 July 2026', time: '10:45 AM', amount: '25,000 PKR', status: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7FA]">
      <CreatorDashboardNav profilePhoto={profilePhoto} displayName={displayName} />

      {/* Main Content */}
      <main className="px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <p className="text-gray-500 font-sans mb-1 text-sm sm:text-base">Hello {displayName ? displayName.split(' ')[0] : 'there'}!</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black font-sans">
              Manage Your <span className="text-[#0012FF]">Wallet Balance</span> Easily
            </h1>
          </div>
        </div>

        {/* Wallet Cards - stacked on mobile, overlapping on desktop */}
        <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-0 mb-8">

          {/* Card 1 - Available Balance */}
          <div className="relative sm:flex-[2] h-[180px] sm:h-[210px] overflow-visible rounded-2xl sm:rounded-none">
            <Image src="/assets/wr-1.png" alt="" fill className="object-fill rounded-2xl sm:rounded-none" priority />
            <div className="absolute inset-0 p-4 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-sans mb-0.5 text-white/80">Available Balance</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white font-sans">64,458 PKR</p>
                </div>
                <div className="flex-1 flex justify-end">
                  <button className="-translate-y-4 sm:-translate-y-7 flex items-center gap-1 text-[#0012FF] px-2 py-1 rounded-xl text-xs font-semibold hover:bg-white/90 transition-all z-20">
                    <Image src="/assets/payout.svg" alt="Payout" width={80} height={12} />
                  </button>
                </div>
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

          {/* Card 2 - Lifetime Earning */}
          <div className="relative sm:flex-1 h-[160px] sm:h-[210px] overflow-visible rounded-2xl sm:rounded-none sm:-ml-0.5 sm:z-10">
            <Image src="/assets/wr-2.png" alt="" fill className="object-fill rounded-2xl sm:rounded-none" />
            <div className="absolute inset-0 p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-sans mb-0.5 text-white/80">Lifetime Earning</p>
                  <p className="text-xl sm:text-3xl font-bold font-sans" style={{ color: "#10B981" }}>2,22,458 PKR</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-white">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span className="text-xs sm:text-sm font-semibold">+18.2% from last month</span>
              </div>
            </div>
          </div>

          {/* Card 3 - Pending Earning */}
          <div className="relative sm:flex-1 h-[160px] sm:h-[210px] overflow-visible rounded-2xl sm:rounded-none ml-0 sm:-ml-10 sm:z-20">
            <Image src="/assets/wr-3.png" alt="" fill className="object-fill rounded-2xl sm:rounded-none" />
            <div className="absolute inset-0 pt-4 pb-4 pr-4 pl-12 sm:p-14 sm:-mt-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-sans mb-0.5 text-white/80">Pending Earning</p>
                  <p className="text-xl sm:text-2xl font-bold font-sans" style={{ color: "#F59E0B" }}>22,580 PKR</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-white">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span className="text-xs sm:text-sm font-semibold">+18.2% from last month</span>
              </div>
            </div>
          </div>

          {/* Card 4 - Total Paid Out */}
          <div className="relative sm:flex-1 h-[160px] sm:h-[210px] overflow-visible rounded-2xl sm:rounded-none ml-0 sm:-ml-10 sm:z-30">
            <Image src="/assets/wr-4.png" alt="" fill className="object-fill rounded-2xl sm:rounded-none" />
            <div className="absolute inset-0 pt-4 pb-4 pr-4 pl-12 sm:p-16 sm:-mt-12">
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-sans mb-0.5 text-white/80">Total Paid Out</p>
                  <p className="text-xl sm:text-2xl font-bold font-sans" style={{ color: "#EF4444" }}>1,55,67 PKR</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-white">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span className="text-xs sm:text-sm font-semibold">+18.2% from last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-black">Recent Transactions</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or ID"
                className="w-full sm:w-64 lg:w-80 bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all"
              />
            </div>
          {/* Replace the <select> with this */}
<div className="relative">
  <button
    onClick={() => setDropdownOpen(!dropdownOpen)}
    className="flex items-center justify-between gap-8 bg-white border border-[#0012FF]/30 rounded-2xl px-4 py-2 text-sm text-gray-900 focus:outline-none min-w-[160px]"
  >
    <span className="font-medium">
      {statusOptions.find(o => o.value === statusFilter)?.label || 'All Statuses'}
    </span>
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"
      className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  </button>

  {dropdownOpen && (
    <div className="absolute right-0 top-[calc(100%+6px)] w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
      {statusOptions.filter(o => o.value !== '').map((option) => (
        <button
          key={option.value}
          onClick={() => {
            setStatusFilter(option.value);
            setDropdownOpen(false);
          }}
          className={`w-full text-left px-4 py-3 text-sm font-medium transition-all ${
            statusFilter === option.value
              ? 'bg-[#0012FF] text-white'
              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">{txn.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">{txn.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">{txn.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">{txn.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-900">{txn.amount}</td>   
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        txn.status === 'Completed'
                          ? 'bg-green-50 text-green-700'
                          : txn.status === 'Pending'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button className="border border-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                          View
                        </button>
                        <button className="border border-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-[#0012FF] hover:bg-[#0012FF]/5 transition-all">
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">Showing 7 of 12</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0012FF] text-white">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-700">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
