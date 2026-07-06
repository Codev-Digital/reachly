'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CreatorWallet() {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [activeNavItem, setActiveNavItem] = useState('Wallet');
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

  const navItems = [
    { name: 'Dashboard', href: '/creators/dashboard', icon: 'dashboard' },
    { name: 'Events', href: '/creators/events', icon: 'events' },
    { name: 'Calendar', href: '/creators/calendar', icon: 'calendar' },
    { name: 'Wallet', href: '/creators/wallet', icon: 'wallet' },
    { name: 'Settings', href: '/creators/settings', icon: 'settings' },
  ];

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
      {/* Top Navigation Bar */}
      <div className="px-4 sm:px-6 pt-4">
        <nav className="bg-white border border-gray-100 shadow-sm sticky top-0 z-50 rounded-3xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/assets/logo1.png"
                  alt="Reachly"
                  width={100}
                  height={40}
                  className="object-contain w-auto h-auto"
                />
              </Link>

              {/* Navigation Items */}
              <div className="flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setActiveNavItem(item.name)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-md font-semibold transition-all ${
                      activeNavItem === item.name
                        ? 'text-[#0012FF]'
                        : 'text-gray-600 hover:text-[#0012FF]'
                    }`}
                  >
                    {item.icon === 'events' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )}
                    {item.icon === 'dashboard' && (
                      activeNavItem === 'Dashboard' ? (
                        <Image
                          src="/assets/dashboard.png"
                          alt="Dashboard"
                          width={36}
                          height={16}
                          className="object-contain"
                        />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="9" rx="1" />
                          <rect x="14" y="3" width="7" height="5" rx="1" />
                          <rect x="14" y="11" width="7" height="10" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                        </svg>
                      )
                    )}
                    {item.icon === 'calendar' && (
                      activeNavItem === 'Calendar' ? (
                        <Image
                          src="/assets/calendar.svg"
                          alt="Calendar"
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )
                    )}
                    {item.icon === 'wallet' && (
                      activeNavItem === 'Wallet' ? (
                        <Image
                          src="/assets/wallet.svg"
                          alt="Wallet"
                          width={36}
                          height={16}
                          className="object-contain"
                        />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      )
                    )}
                    {item.icon === 'settings' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    )}
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>

                {/* Profile */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center">
                  {profilePhoto ? (
                    <Image src={profilePhoto} alt={displayName} className="w-full h-full object-cover" width={40} height={40} />
                  ) : displayName ? (
                    <span className="text-gray-700 font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <Image src="/Avatars/1.jpg" alt="User" className="w-full h-full object-cover" width={40} height={40} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-gray-500 font-sans mb-1">Hello {displayName ? displayName.split(' ')[0] : 'there'}!</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-black font-sans">
              Manage Your <span className="text-[#0012FF]">Wallet Balance</span> Easily
            </h1>
          </div>
        </div>

        {/* Wallet Cards */}
      <div className="flex w-full gap-1 mb-8">

  {/* Card 1 */}
  <div className="relative flex-[2] h-[210px] overflow-hidden">

    {/* Background */}
    <Image
      src="/assets/wr-1.png"
      alt=""
      fill
      className="object-fill"
      priority
    />
            <div className="absolute inset-0 p-6">
              <div className="flex items-start justify-between h-full">
                <div className="flex flex-col justify-between h-full">
                  <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center mb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-xs opacity-70 mb-1">Available Balance</p>
                    <p className="text-2xl font-bold text-white">64,458 PKR</p>
                    <p className="text-white text-xs opacity-70 mt-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                      </svg>
                      +18.2% from last month
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end h-full">
         <button className="-translate-y-5 translate-x-3 flex items-center gap-1 text-[#0012FF] px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-white/90 transition-all">
                    <Image
                      src="/assets/payout.svg"
                      alt="Payout"
                      width={92}
                      height={12}
                    />
                    
                    
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - Total Earnings */}
         <div className="relative flex-1 h-[210px] overflow-hidden">

    <Image
      src="/assets/wr-2.png"
      alt=""
      fill
      className="object-fill"
    />
            <div className="absolute inset-0 p-5">
              <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <p className="text-gray-700 text-xs opacity-70 mb-1">Lifetime Earning</p>
              <p className="text-xl font-bold text-[#10B981]">2,22,458 PKR</p>
              <p className="text-gray-700 text-xs opacity-70 mt-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" className="inline mr-1">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                +18.2% from last month
              </p>
            </div>
          </div>

          {/* Card 3 - Pending Earnings */}
          <div className="relative flex-1 h-[210px] overflow-hidden">

    <Image
      src="/assets/wr-3.png"
      alt=""
      fill
      className="object-fill"
    />
            <div className="absolute inset-0 p-5">
              <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="text-gray-700 text-xs opacity-70 mb-1">Pending Earning</p>
              <p className="text-xl font-bold text-[#F59E0B]">22,580 PKR</p>
              <p className="text-gray-700 text-xs opacity-70 mt-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" className="inline mr-1">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                +18.2% from last month
              </p>
            </div>
          </div>

          {/* Card 4 - Total Paid Out */}
           <div className="relative flex-1 h-[210px] overflow-hidden">

    <Image
      src="/assets/wr-4.png"
      alt=""
      fill
      className="object-fill"
    />
            <div className="absolute inset-0 p-5">
              <div className="w-8 h-8 bg-white/60 rounded-xl flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-gray-700 text-xs opacity-70 mb-1">Total Paid Out</p>
              <p className="text-xl font-bold text-[#EF4444]">1,55,543 PKR</p>
              <p className="text-gray-700 text-xs opacity-70 mt-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" className="inline mr-1">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                +18.2% from last month
              </p>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-black">Recent Transactions</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or ID"
                className="w-full lg:w-80 bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all"
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{txn.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{txn.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{txn.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{txn.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{txn.amount}</td>
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
