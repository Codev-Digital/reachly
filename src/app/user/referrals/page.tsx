'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import UserNavbar from '@/components/UserNavbar';

export default function UserReferrals() {
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
            setProfilePhoto(userData.creatorProfile?.profilePhoto || userData.user.profilePhoto || null);
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    }
    checkAuth();
  }, []);

  const referralsData = [
    { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Rewarded', rewardDate: '05 July 2026' },
    { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Pending', rewardDate: '05 July 2026' },
    { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Rewarded', rewardDate: '05 July 2026' },
    { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Rejected', rewardDate: '05 July 2026' },
    { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Pending', rewardDate: '05 July 2026' },
    { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Rejected', rewardDate: '05 July 2026' },
    { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Rewarded', rewardDate: '05 July 2026' },
  ];

  const filteredReferrals = referralsData.filter(ref => {
    const matchesSearch = ref.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ref.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          {/* Header & Copy Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <p className="text-gray-400 font-sans mb-1 text-sm sm:text-base font-medium">Hello {displayName}!</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black font-anton tracking-tight">
                Manage Your <span className="text-[#0012FF] italic">Wallet</span> <span className="text-gray-400 font-normal text-xl sm:text-2xl">with ease</span>
              </h1>
            </div>

            <button className="flex items-center gap-2 bg-[#0012FF] hover:bg-[#0012FF]/95 text-white px-6 py-3 rounded-full text-xs font-bold shadow-md self-start sm:self-center transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy Referral Link
            </button>
          </div>

          {/* Referral Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-4 sm:gap-5 mb-8">

            {/* Card 1 - Total Referrals */}
            <div className="w-full bg-[#B6C2FF] rounded-2xl p-6 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-sans mb-1 text-gray-700 font-bold uppercase tracking-wider">Total Referrals</p>
                <p className="text-3xl font-black text-[#0012FF] font-sans leading-none">0</p>
              </div>
            </div>

            {/* Card 2 - Successful Referrals */}
            <div className="w-full bg-[#A3F0B5] rounded-2xl p-6 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-sans mb-1 text-gray-700 font-bold uppercase tracking-wider">Successful Referrals</p>
                <p className="text-3xl font-black text-[#16A34A] font-sans leading-none">0</p>
              </div>
            </div>

            {/* Card 3 - Total Rewards Earned */}
            <div className="w-full bg-[#FFB5B5] rounded-2xl p-6 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-sans mb-1 text-gray-700 font-bold uppercase tracking-wider">Total Rewards Earned</p>
                <p className="text-3xl font-black text-[#E11D48] font-sans leading-none">0 PKR</p>
              </div>
            </div>

            {/* Card 4 - Pending Rewards */}
            <div className="w-full bg-[#FFE5A3] rounded-2xl p-6 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-sans mb-1 text-gray-700 font-bold uppercase tracking-wider">Pending Rewards</p>
                <p className="text-3xl font-black text-[#D97706] font-sans leading-none">0 PKR</p>
              </div>
            </div>
          </div>

          {/* Referral History Heading and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-black font-anton">Referral History</h2>

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
                    {['All', 'Rewarded', 'Pending', 'Rejected'].map((status) => (
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

          {/* Referral History Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FCFCFD] border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Referral ID</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Referral Name</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Reward</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Reward Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredReferrals.map((ref, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500 font-medium">{ref.id}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-900 font-bold">{ref.name}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">{ref.email}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">{ref.date}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">{ref.time}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-gray-900">{ref.reward}</td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${ref.status === 'Rewarded'
                          ? 'bg-green-50 text-green-600'
                          : ref.status === 'Pending'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-red-50 text-red-600'
                          }`}>
                          {ref.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">{ref.rewardDate}</td>
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
