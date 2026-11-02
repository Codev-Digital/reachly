'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CreatorDashboardNav from '@/components/CreatorDashboardNav';
import FormInput, { FormLabel } from '@/components/FormInput';
import { InfoTooltip } from '@/components/ui/tooltip';
import { usePreloadImages } from '@/lib/usePreloadImages';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  DollarSign,
  Clock,
  Calendar,
  ArrowUpRight,
  Search,
  ChevronDown,
  TrendingUp,
  Building2,
  WalletCards,
  CheckCircle2,
  Pencil,
  Clock3,
} from 'lucide-react';

const payoutBanks = [
  { name: 'UBL', type: 'Bank', logo: '/banks/ubl.png' },
  { name: 'HBL', type: 'Bank', logo: '/banks/hbl.jfif' },
  { name: 'Meezan Bank', type: 'Bank', logo: '/banks/meezan.png' },
  { name: 'Bank Alfalah', type: 'Bank', logo: '/banks/alphla.jfif' },
  { name: 'MCB Bank', type: 'Bank', logo: '/banks/mcb.png' },
  { name: 'Allied Bank', type: 'Bank', logo: '/banks/allied.png' },
  { name: 'Faysal Bank', type: 'Bank', logo: '/banks/faysal.png' },
  { name: 'Askari Bank', type: 'Bank', logo: '/banks/askari.png' },
  { name: 'Standard Chartered', type: 'Bank', logo: '/banks/standard charterd.png' },
  { name: 'NayaPay', type: 'Wallet', logo: '/banks/nayapay.png' },
  { name: 'SadaPay', type: 'Wallet', logo: '/banks/sadapay.png' },
  { name: 'Easypaisa', type: 'Wallet', logo: '/assets/easypaisa (2).png' },
  { name: 'JazzCash', type: 'Wallet', logo: '/assets/jazzcash.png' },
];
type PayoutBank = (typeof payoutBanks)[number];
const MINIMUM_PAYOUT_BALANCE = 50000;

export default function CreatorWallet() {
  usePreloadImages(['/assets/no-appointment.webp', '/assets/booking-confirm-sm.webp']);
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
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<PayoutBank | null>(null);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [otherBankSelected, setOtherBankSelected] = useState(false);
  const [otherBankName, setOtherBankName] = useState('');
  const [bankEditing, setBankEditing] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutError, setPayoutError] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [payoutEligibleAt, setPayoutEligibleAt] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadPayoutDetails() {
      try {
        const response = await fetch('/api/creators/payouts');
        if (!response.ok) return;
        const data = await response.json();
        const savedBankName = data.bankName || '';
        const savedAccountNumber = data.accountNumber || '';
        const savedBank = payoutBanks.find((bank) => bank.name.toLowerCase() === savedBankName.toLowerCase());
        if (savedBank) {
          setSelectedBank(savedBank);
        } else if (savedBankName) {
          setOtherBankSelected(true);
          setOtherBankName(savedBankName);
        }
        setAccountNumber(savedAccountNumber);
        if (data.nextWithdrawDate) {
          setPayoutEligibleAt(new Date(data.nextWithdrawDate).getTime());
        }
      } catch (error) {
        console.error('Failed to load payout details:', error);
      }
    }

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
    loadPayoutDetails();
  }, []);

  const payoutIsOnCooldown = payoutEligibleAt > currentTime;
  const cooldownMilliseconds = Math.max(0, payoutEligibleAt - currentTime);
  const cooldownDays = Math.floor(cooldownMilliseconds / 86400000);
  const cooldownHours = Math.floor((cooldownMilliseconds % 86400000) / 3600000);
  const cooldownMinutes = Math.floor((cooldownMilliseconds % 3600000) / 60000);
  const cooldownSeconds = Math.floor((cooldownMilliseconds % 60000) / 1000);

  const resetPayoutForm = () => {
    setBankDropdownOpen(false);
    setBankEditing(false);
    setWithdrawAmount('');
    setPayoutError('');
    setPayoutSuccess(false);
  };

  const handlePayoutSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(withdrawAmount);

    if (payoutIsOnCooldown) {
      setPayoutError(`Your next payout will be available in about ${cooldownMinutes} minutes.`);
      return;
    }
    if (!selectedBank && !otherBankSelected) {
      setPayoutError('Please select a bank or wallet.');
      return;
    }
    if (otherBankSelected && !otherBankName.trim()) {
      setPayoutError('Please enter your bank name.');
      return;
    }
    if (!accountNumber.trim()) {
      setPayoutError('Please enter your account number.');
      return;
    }
    if (!/^[0-9]{6,24}$/.test(accountNumber.replace(/\s/g, ''))) {
      setPayoutError('Enter a valid account number using 6 to 24 digits.');
      return;
    }
    if (!Number.isFinite(amount) || amount < 1000) {
      setPayoutError('Enter an amount between 1,000 and 50,000 PKR.');
      return;
    }
    if (amount > 50000) {
      setPayoutError('The maximum withdrawal amount is 50,000 PKR.');
      return;
    }
    if (amount > availableBalance) {
      setPayoutError('The withdrawal amount cannot exceed your available balance.');
      return;
    }

    try {
      const response = await fetch('/api/creators/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: payoutDestinationName,
          accountNumber,
          withdrawAmount: amount,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPayoutError(data.error || 'Unable to create payout request.');
        if (data.nextWithdrawDate) {
          setPayoutEligibleAt(new Date(data.nextWithdrawDate).getTime());
        }
        return;
      }

      setPayoutEligibleAt(new Date(data.nextWithdrawDate).getTime());
      setPayoutError('');
      setPayoutSuccess(true);
    } catch (error) {
      console.error('Failed to submit payout request:', error);
      setPayoutError('Unable to create payout request. Please try again.');
    }
  };

  const amountError = withdrawAmount && (
    Number(withdrawAmount) < 1000
      ? 'Minimum withdrawal amount is 1,000 PKR.'
      : Number(withdrawAmount) > 50000
        ? 'Maximum withdrawal amount is 50,000 PKR.'
        : ''
  );
  const payoutDestinationName = otherBankSelected ? otherBankName : selectedBank?.name;

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
              <button
                type="button"
                onClick={() => {
                  resetPayoutForm();
                  setIsPayoutOpen(true);
                }}
                className="bg-white hover:bg-gray-50 text-black pl-4 pr-1.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
              >
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

      <Dialog
        open={isPayoutOpen}
        onOpenChange={(open) => {
          setIsPayoutOpen(open);
          if (!open) resetPayoutForm();
        }}
      >
        <DialogContent
          closeClassName="bg-[#F5F7FF] text-[#0012FF] hover:bg-[#EEF2FF] hover:text-[#0012FF]"
          className={`rounded-[28px] border border-gray-100 p-0 overflow-visible shadow-[0_24px_70px_rgba(15,23,42,0.18)] ${availableBalance < MINIMUM_PAYOUT_BALANCE ? 'max-w-md' : 'max-w-lg'}`}
        >
          <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            {availableBalance < MINIMUM_PAYOUT_BALANCE ? (
              <>
                <DialogHeader className="items-center text-center">
                  <Image
                    src="/assets/no-appointment.webp"
                    alt=""
                    width={176}
                    height={132}
                    unoptimized
                    priority
                    className="mb-3 h-28 w-40 object-contain"
                  />
                  <DialogTitle className="text-2xl">Build your payout balance</DialogTitle>
                  <DialogDescription className="mt-2 max-w-sm text-sm leading-relaxed">
                    You can request a payout once your available wallet balance reaches PKR 50,000.
                    Keep earning from your bookings and check back when you meet the minimum.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 rounded-2xl border border-[#0012FF]/10 bg-[#F7F8FF] p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your available balance</p>
                  <p className="mt-1 text-2xl font-extrabold text-gray-950">PKR {availableBalance.toLocaleString()}</p>
                 
                </div>
                <button
                  type="button"
                  onClick={() => setIsPayoutOpen(false)}
                  className="mt-5 w-full rounded-xl bg-[#0012FF] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#000dcc]"
                >
                  Got it
                </button>
              </>
            ) : (
              <>
                <DialogHeader className="items-center text-center">
                  <Image
                    src="/assets/booking-confirm-sm.webp"
                    alt=""
                    width={144}
                    height={108}
                    unoptimized
                    priority
                    className="mb-2 h-24 w-32 object-contain"
                  />
                  <DialogTitle className="text-2xl">Request a payout</DialogTitle>
                  <DialogDescription className="mt-1">
                    Choose where you want to receive your available balance.
                  </DialogDescription>
                </DialogHeader>

                {payoutSuccess ? (
              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
                <h3 className="text-base font-bold text-green-900">Payout request received</h3>
                <p className="mt-1 text-sm leading-relaxed text-green-800">
                  We&apos;ll review your request and send the funds to {payoutDestinationName}.
                  Your next payout will be available after 15 days.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPayoutOpen(false)}
                  className="mt-5 rounded-xl bg-[#0012FF] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#000dcc]"
                >
                  Done
                </button>
              </div>
                ) : payoutIsOnCooldown ? (
              <div className="mt-8 rounded-2xl border border-[#DDE3FF] bg-[#F7F8FF] p-5 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FF]">
                  <Clock3 className="h-8 w-8 text-[#0012FF]" />
                </div>
                <h3 className="text-base font-bold text-gray-950">Next Payout In</h3>
                {/* <p className="mt-1 text-sm leading-relaxed text-amber-900">
                  You can submit your next payout request when the eligibility period ends.
                </p> */}
                <div className="mt-5 grid grid-cols-4 gap-2">
                  {[
                    ['Days', cooldownDays],
                    ['Hours', cooldownHours],
                    ['Minutes', cooldownMinutes],
                    ['Seconds', cooldownSeconds],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-[#E5E9FF] bg-white px-2 py-2">
                      <p className="text-lg font-extrabold text-[#0012FF]">{String(value).padStart(2, '0')}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs font-medium text-gray-500">You will be eligible to request a payout after this countdown.</p>
              </div>
                ) : (
              <form onSubmit={handlePayoutSubmit} className="mt-7 space-y-5">
                <div className="relative">
                  <FormLabel htmlFor="payout-bank" required>Bank or wallet</FormLabel>
                  {!bankEditing && (selectedBank || (otherBankSelected && otherBankName)) ? (
                    <div className="flex items-center gap-3 rounded-lg border border-[#e2e2e2] bg-white px-3.5 py-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-[#F5F7FF] p-1">
                        <Image
                          src={selectedBank?.logo || '/assets/wallet.svg'}
                          alt=""
                          width={32}
                          height={32}
                          unoptimized
                          className="h-full w-full object-contain"
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
                        {selectedBank?.name || otherBankName}
                      </span>
                      <button
                        type="button"
                        aria-label="Edit bank name"
                        onClick={() => setBankEditing(true)}
                        className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#0012FF]/10 hover:text-[#0012FF]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  ) : otherBankSelected ? (
                    <div className="flex items-center gap-3 rounded-lg border border-[#e2e2e2] bg-white px-3.5 py-2.5 transition-all focus-within:border-[#0012FF]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-[#F5F7FF] p-1">
                        <Image src="/assets/wallet.svg" alt="" width={32} height={32} unoptimized className="h-full w-full object-contain" />
                      </span>
                      <input
                        id="payout-bank"
                        type="text"
                        autoFocus
                        placeholder="Enter your bank name"
                        value={otherBankName}
                        onChange={(event) => {
                          setOtherBankName(event.target.value);
                          setPayoutError('');
                        }}
                        className="min-w-0 flex-1 bg-transparent py-0.5 text-sm font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        aria-label="Choose from bank list"
                        onClick={() => setBankDropdownOpen((open) => !open)}
                        className="shrink-0 text-gray-400 transition-colors hover:text-[#0012FF]"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${bankDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  ) : (
                    <button
                      id="payout-bank"
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={bankDropdownOpen}
                      onClick={() => setBankDropdownOpen((open) => !open)}
                      className="flex w-full items-center justify-between rounded-lg border border-[#e2e2e2] bg-white px-3.5 py-3 text-left text-sm transition-all hover:border-[#0012FF] focus:outline-none focus:border-[#0012FF]"
                    >
                      {selectedBank ? (
                        <span className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white">
                            <Image src={selectedBank.logo} alt="" width={32} height={32} unoptimized className="h-full w-full object-contain" />
                          </span>
                          <span className="font-semibold text-gray-900">{selectedBank.name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">Select a bank or wallet</span>
                      )}
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${bankDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}

                  {bankDropdownOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl">
                      {payoutBanks.map((bank) => (
                        <button
                          key={bank.name}
                          type="button"
                          role="option"
                          aria-selected={selectedBank?.name === bank.name}
                          onClick={() => {
                            setSelectedBank(bank);
                            setOtherBankSelected(false);
                            setBankDropdownOpen(false);
                            setPayoutError('');
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[#0012FF]/5"
                        >
                          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white p-0.5">
                            <Image src={bank.logo} alt={`${bank.name} logo`} width={36} height={36} unoptimized className="h-full w-full object-contain" />
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-semibold text-gray-900">{bank.name}</span>
                            <span className="block text-[11px] text-gray-400">{bank.type}</span>
                          </span>
                          {selectedBank?.name === bank.name && <CheckCircle2 className="h-4 w-4 text-[#0012FF]" />}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBank(null);
                          setOtherBankSelected(true);
                          setBankDropdownOpen(false);
                          setPayoutError('');
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[#0012FF]/5 ${
                          otherBankSelected ? 'bg-[#0012FF]/5' : ''
                        }`}
                      >
                        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-[#F5F7FF] p-1">
                          <Image src="/assets/wallet.svg" alt="" width={36} height={36} unoptimized className="h-full w-full object-contain" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold text-gray-900">Other Banks</span>
                          <span className="block text-[11px] text-gray-400">Enter your bank name</span>
                        </span>
                        {otherBankSelected && <CheckCircle2 className="h-4 w-4 text-[#0012FF]" />}
                      </button>
                    </div>
                  )}
                </div>

                <FormInput
                  id="payout-account"
                  label="Account number"
                  required
                  inputMode="numeric"
                  placeholder="Enter your account number"
                  icon={<Building2 className="h-4 w-4" />}
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ''))}
                />

                <FormInput
                  id="payout-amount"
                  label="How much would you like to withdraw?"
                  labelAddon={
                    <InfoTooltip title="Withdrawal limit">
                      You can withdraw a maximum of 50,000 PKR per request. After a withdrawal,
                      your next withdrawal will be eligible after 15 days.
                    </InfoTooltip>
                  }
                  required
                  type="number"
                  min="1000"
                  max="50000"
                  inputMode="numeric"
                  placeholder="0"
                  suffix="PKR"
                  value={withdrawAmount}
                  error={amountError || undefined}
                  onChange={(event) => {
                    setWithdrawAmount(event.target.value);
                    setPayoutError('');
                  }}
                />

                {payoutIsOnCooldown && (
                  <p className="text-xs font-semibold text-amber-700">Next payout available in about {cooldownMinutes} minutes.</p>
                )}
                {payoutError && <p role="alert" className="text-xs font-semibold text-red-600">{payoutError}</p>}

                <button
                  type="submit"
                  disabled={payoutIsOnCooldown}
                  className="flex w-full items-center justify-center rounded-xl bg-[#0012FF] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#000dcc] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {payoutIsOnCooldown ? 'Payout temporarily unavailable' : 'Request payout'}
                </button>
              </form>
            )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
