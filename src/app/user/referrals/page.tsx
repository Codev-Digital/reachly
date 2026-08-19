// 'use client';

// import { useState, useEffect , useRef } from 'react';
// import { motion } from 'framer-motion';
// import Image from 'next/image';
// import UserNavbar from '@/components/UserNavbar';

// export default function UserReferrals() {
//   const [displayName, setDisplayName] = useState('James Richard');
//   const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [methodFilter, setMethodFilter] = useState('All');
//   const [statusFilter, setStatusFilter] = useState('All');
//   const [copied, setCopied] = useState(false);
//   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
//   const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

//   //copy referral link function
//   const CopyReferralLink = async () => {
//   try {
//     const data = sessionStorage.getItem('reachly_user_dashboard_cache');
//     const parsedData = data ? JSON.parse(data) : null;
//     const userId = parsedData?.userId;

//     if (!userId) {
//       console.error('No userId found in session storage');
//       return;
//     }

//     const encrypted = btoa(userId);
//     const referralLink = `${window.location.origin}/signup?ref=${encrypted}`;

//     await navigator.clipboard.writeText(referralLink);

//     setCopied(true);
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     timeoutRef.current = setTimeout(() => setCopied(false), 2000);
//   } catch (err) {
//     console.error('Failed to copy referral link:', err);
//   }
// };

//   useEffect(() => {
//     async function checkAuth() {
//       try {
//         const res = await fetch('/api/user/me');
//         if (res.ok) {
//           const userData = await res.json();
//           if (userData.user) {
//             setDisplayName(userData.user.name || 'James Richard');
//             setProfilePhoto(userData.creatorProfile?.profilePhoto || userData.user.profilePhoto || null);
//           }
//         }
//       } catch (err) {
//         console.error('Error fetching user:', err);
//       }
//     }
//     checkAuth();
//   }, []);

//   const referralsData = [
//     { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Rewarded', rewardDate: '05 July 2026' },
//     { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Pending', rewardDate: '05 July 2026' },
//     { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Rewarded', rewardDate: '05 July 2026' },
//     { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Rejected', rewardDate: '05 July 2026' },
//     { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Pending', rewardDate: '05 July 2026' },
//     { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Rejected', rewardDate: '05 July 2026' },
//     { id: 'REF-10245', name: 'Ava John', email: 'avajohn@gmail.com', date: '02 July 2026', time: '10:45 AM', reward: '5,000 PKR', status: 'Rewarded', rewardDate: '05 July 2026' },
//   ];

//   const filteredReferrals = referralsData.filter(ref => {
//     const matchesSearch = ref.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       ref.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       ref.email.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesStatus = statusFilter === 'All' || ref.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="min-h-screen bg-[#F7F7FA] pb-12">
//       <UserNavbar displayName={displayName} profilePhoto={profilePhoto} />

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
//         <motion.main
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className="flex-1"
//         >
//           {/* Header & Copy Button */}
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
//             <div>
//               <p className="text-gray-400 font-sans mb-1 text-sm sm:text-base font-medium">Hello {displayName}!</p>
//               <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black font-anton tracking-tight">
//                 Manage Your <span className="text-[#0012FF] italic">Wallet</span> <span className="text-gray-400 font-normal text-xl sm:text-2xl">with ease</span>
//               </h1>
//             </div>

//             {/* <button onClick={CopyReferralLink} className="flex items-center gap-2 bg-[#0012FF] hover:bg-[#0012FF]/95 text-white px-6 py-3 rounded-full text-xs font-bold shadow-md self-start sm:self-center transition-all">
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                 <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
//                 <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
//               </svg>
//               Copy Referral Link
//             </button> */}
//             <button
//   onClick={CopyReferralLink}
//   disabled={copied}
//   className={`relative flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold shadow-md self-start sm:self-center
//     transition-all duration-300 ease-out overflow-hidden
//     ${copied
//       ? "bg-emerald-500 text-white shadow-emerald-500/40 shadow-lg"
//       : "bg-[#0012FF] hover:bg-[#0012FF]/95 text-white"
//     }`}
// >
//   <span
//     className={`flex items-center gap-2 transition-all duration-300 ease-out
//       ${copied ? "opacity-0 -translate-y-2 scale-90" : "opacity-100 translate-y-0 scale-100"}`}
//   >
//     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//       <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
//       <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
//     </svg>
//     Copy Referral Link
//   </span>

//   <span
//     className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ease-out
//       ${copied ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-90"}`}
//   >
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="3"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className={copied ? "animate-[checkPop_0.4s_ease-out]" : ""}
//     >
//       <path
//         d="M4 12l5 5L20 6"
//         style={{
//           strokeDasharray: 24,
//           strokeDashoffset: copied ? 0 : 24,
//           transition: "stroke-dashoffset 0.35s ease-out 0.05s",
//         }}
//       />
//     </svg>
//     Copied!
//   </span>
// </button>
//           </div>

//           {/* Referral Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-4 sm:gap-5 mb-8">

//             {/* Card 1 - Total Referrals */}
//             <div className="w-full bg-[#B6C2FF] rounded-2xl p-6 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-1">
//               <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center mb-4">
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2.5">
//                   <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//                   <circle cx="8.5" cy="7" r="4" />
//                   <line x1="20" y1="8" x2="20" y2="14" />
//                   <line x1="23" y1="11" x2="17" y2="11" />
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-[11px] font-sans mb-1 text-gray-700 font-bold uppercase tracking-wider">Total Referrals</p>
//                 <p className="text-3xl font-black text-[#0012FF] font-sans leading-none">0</p>
//               </div>
//             </div>

//             {/* Card 2 - Successful Referrals */}
//             <div className="w-full bg-[#A3F0B5] rounded-2xl p-6 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-1">
//               <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center mb-4">
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
//                   <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//                   <polyline points="22 4 12 14.01 9 11.01" />
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-[11px] font-sans mb-1 text-gray-700 font-bold uppercase tracking-wider">Successful Referrals</p>
//                 <p className="text-3xl font-black text-[#16A34A] font-sans leading-none">0</p>
//               </div>
//             </div>

//             {/* Card 3 - Total Rewards Earned */}
//             <div className="w-full bg-[#FFB5B5] rounded-2xl p-6 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-1">
//               <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center mb-4">
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.5">
//                   <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-[11px] font-sans mb-1 text-gray-700 font-bold uppercase tracking-wider">Total Rewards Earned</p>
//                 <p className="text-3xl font-black text-[#E11D48] font-sans leading-none">0 PKR</p>
//               </div>
//             </div>

//             {/* Card 4 - Pending Rewards */}
//             <div className="w-full bg-[#FFE5A3] rounded-2xl p-6 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-1">
//               <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center mb-4">
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5">
//                   <circle cx="12" cy="12" r="10" />
//                   <polyline points="12 6 12 12 16 14" />
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-[11px] font-sans mb-1 text-gray-700 font-bold uppercase tracking-wider">Pending Rewards</p>
//                 <p className="text-3xl font-black text-[#D97706] font-sans leading-none">0 PKR</p>
//               </div>
//             </div>
//           </div>

//           {/* Referral History Heading and Filters */}
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
//             <h2 className="text-2xl font-bold text-black font-anton">Referral History</h2>

//             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//               {/* Search Bar */}
//               <div className="relative">
//                 <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <circle cx="11" cy="11" r="8" />
//                   <path d="M21 21l-4.35-4.35" />
//                 </svg>
//                 <input
//                   type="text"
//                   placeholder="Search by name or ID"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="w-full sm:w-64 lg:w-80 bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#0012FF] transition-all"
//                 />
//               </div>

//               {/* Payment Method Dropdown */}
//               <div className="relative">
//                 <button
//                   onClick={() => {
//                     setMethodDropdownOpen(!methodDropdownOpen);
//                     setStatusDropdownOpen(false);
//                   }}
//                   className="flex items-center justify-between gap-6 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none min-w-[150px]"
//                 >
//                   <span className="font-medium">{methodFilter === 'All' ? 'Payment method' : methodFilter}</span>
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${methodDropdownOpen ? 'rotate-180' : ''}`}>
//                     <polyline points="6 9 12 15 18 9" />
//                   </svg>
//                 </button>
//                 {methodDropdownOpen && (
//                   <div className="absolute right-0 top-[calc(100%+6px)] w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
//                     {['All', 'Jazzcash', 'Easy Paisa', 'Bank Card'].map((method) => (
//                       <button
//                         key={method}
//                         onClick={() => {
//                           setMethodFilter(method);
//                           setMethodDropdownOpen(false);
//                         }}
//                         className={`w-full text-left px-4 py-3 text-sm font-medium transition-all ${methodFilter === method ? 'bg-[#0012FF] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
//                       >
//                         {method === 'All' ? 'All Methods' : method}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* All Statuses Dropdown */}
//               <div className="relative">
//                 <button
//                   onClick={() => {
//                     setStatusDropdownOpen(!statusDropdownOpen);
//                     setMethodDropdownOpen(false);
//                   }}
//                   className="flex items-center justify-between gap-6 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none min-w-[140px]"
//                 >
//                   <span className="font-medium">{statusFilter === 'All' ? 'All Statuses' : statusFilter}</span>
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${statusDropdownOpen ? 'rotate-180' : ''}`}>
//                     <polyline points="6 9 12 15 18 9" />
//                   </svg>
//                 </button>
//                 {statusDropdownOpen && (
//                   <div className="absolute right-0 top-[calc(100%+6px)] w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
//                     {['All', 'Rewarded', 'Pending', 'Rejected'].map((status) => (
//                       <button
//                         key={status}
//                         onClick={() => {
//                           setStatusFilter(status);
//                           setStatusDropdownOpen(false);
//                         }}
//                         className={`w-full text-left px-4 py-3 text-sm font-medium transition-all ${statusFilter === status ? 'bg-[#0012FF] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
//                       >
//                         {status === 'All' ? 'All Statuses' : status}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Referral History Table */}
//           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-[#FCFCFD] border-b border-gray-100">
//                   <tr>
//                     <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Referral ID</th>
//                     <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Referral Name</th>
//                     <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
//                     <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined Date</th>
//                     <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
//                     <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Reward</th>
//                     <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
//                     <th className="px-6 py-4.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Reward Date</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100 bg-white">
//                   {filteredReferrals.map((ref, idx) => (
//                     <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
//                       <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500 font-medium">{ref.id}</td>
//                       <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-900 font-bold">{ref.name}</td>
//                       <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">{ref.email}</td>
//                       <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">{ref.date}</td>
//                       <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">{ref.time}</td>
//                       <td className="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-gray-900">{ref.reward}</td>
//                       <td className="px-6 py-4.5 whitespace-nowrap">
//                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${ref.status === 'Rewarded'
//                           ? 'bg-green-50 text-green-600'
//                           : ref.status === 'Pending'
//                             ? 'bg-yellow-50 text-yellow-600'
//                             : 'bg-red-50 text-red-600'
//                           }`}>
//                           {ref.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4.5 whitespace-nowrap text-sm text-gray-500">{ref.rewardDate}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Pagination */}
//           <div className="flex items-center justify-between mt-6 px-2">
//             <p className="text-sm text-gray-400 font-medium">Showing 7 of 20</p>
//             <div className="flex items-center gap-2">
//               <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all">
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                   <polyline points="15 18 9 12 15 6" />
//                 </svg>
//               </button>
//               <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0012FF] text-white text-xs font-bold">1</button>
//               <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 text-xs font-bold transition-all">2</button>
//               <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all">
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                   <polyline points="9 18 15 12 9 6" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </motion.main>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import UserNavbar from '@/components/UserNavbar';

interface BuyActivity {
  _id: string;
  type: string;
  activityTime: string;
  totalAmount: number;
  status: string;
}

interface Joinnee {
  _id: string;
  name: string;
  email: string;
}

interface ReferralItem {
  _id: string;
  referrer: string;
  joinnee: Joinnee;
  totalBuyActivities: number;
  buyActivity: BuyActivity;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function UserReferrals() {
  const [displayName, setDisplayName] = useState('James Richard');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Referral data state
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //copy referral link function
  const CopyReferralLink = async () => {
    try {
      const data = sessionStorage.getItem('reachly_user_dashboard_cache');
      const parsedData = data ? JSON.parse(data) : null;
      const userId = parsedData?.userId;

      if (!userId) {
        console.error('No userId found in session storage');
        return;
      }

      const encrypted = btoa(userId);
      const referralLink = `${window.location.origin}/signup?ref=${encrypted}`;

      await navigator.clipboard.writeText(referralLink);

      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral link:', err);
    }
  };

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

  // Fetch referrals from API
  const fetchReferrals = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/referral?page=${page}&limit=10`);
      const data = await res.json();

      if (data.success) {
        setReferrals(data.referrals || []);
        setTotalReferrals(data.pagination?.total || 0);
        setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      } else {
        setError(data.error || 'Failed to load referrals');
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals(1);
  }, []);

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages || page === pagination.page) return;
    fetchReferrals(page);
  };

  // Helpers
  const getShortId = (id: string) => `REF-${id.slice(-5).toUpperCase()}`;

  const getCleanStatus = (status: string) => status.trim().toLowerCase();

  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const statusStyles: Record<string, string> = {
    rewarded: 'bg-green-50 text-green-600',
    pending: 'bg-yellow-50 text-yellow-600',
    rejected: 'bg-red-50 text-red-600',
  };

  const statusLabels: Record<string, string> = {
    rewarded: 'Rewarded',
    pending: 'Pending',
    rejected: 'Rejected',
  };

  const filteredReferrals = referrals.filter((ref) => {
    const status = getCleanStatus(ref.buyActivity?.status || '');
    const matchesSearch =
      getShortId(ref._id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.joinnee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.joinnee?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || statusLabels[status] === statusFilter;
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

            <button
              onClick={CopyReferralLink}
              disabled={copied}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold shadow-md self-start sm:self-center
    transition-all duration-300 ease-out overflow-hidden
    ${copied
                  ? "bg-emerald-500 text-white shadow-emerald-500/40 shadow-lg"
                  : "bg-[#0012FF] hover:bg-[#0012FF]/95 text-white"
                }`}
            >
              <span
                className={`flex items-center gap-2 transition-all duration-300 ease-out
      ${copied ? "opacity-0 -translate-y-2 scale-90" : "opacity-100 translate-y-0 scale-100"}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Referral Link
              </span>

              <span
                className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ease-out
      ${copied ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-90"}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={copied ? "animate-[checkPop_0.4s_ease-out]" : ""}
                >
                  <path
                    d="M4 12l5 5L20 6"
                    style={{
                      strokeDasharray: 24,
                      strokeDashoffset: copied ? 0 : 24,
                      transition: "stroke-dashoffset 0.35s ease-out 0.05s",
                    }}
                  />
                </svg>
                Copied!
              </span>
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
                <p className="text-3xl font-black text-[#0012FF] font-sans leading-none">
                  {loading ? (
                    <span className="inline-block h-7 w-10 bg-white/50 rounded-md animate-pulse align-middle" />
                  ) : (
                    totalReferrals
                  )}
                </p>
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
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FCFCFD] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Referral ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Referral Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Reward</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={`skeleton-${i}`}>
                        <td className="px-6 py-4">
                          <div className="h-3.5 w-16 bg-gray-200 rounded-md animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3.5 w-28 bg-gray-200 rounded-md animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3.5 w-40 bg-gray-200 rounded-md animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3.5 w-24 bg-gray-200 rounded-md animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3.5 w-16 bg-gray-200 rounded-md animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3.5 w-20 bg-gray-200 rounded-md animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-red-500 font-medium">
                        {error}
                      </td>
                    </tr>
                  ) : filteredReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400 font-medium">
                        No referrals found.
                      </td>
                    </tr>
                  ) : (
                    filteredReferrals.map((ref) => {
                      const status = getCleanStatus(ref.buyActivity?.status || '');
                      return (
                        <tr key={ref._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                            {getShortId(ref._id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                            {ref.joinnee?.name || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ref.joinnee?.email || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(ref.buyActivity.activityTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTime(ref.buyActivity.activityTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {ref.buyActivity.totalAmount.toLocaleString()} PKR
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                statusStyles[status] || 'bg-gray-50 text-gray-500'
                              }`}
                            >
                              {statusLabels[status] || status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-sm text-gray-400 font-medium">
              {loading ? 'Loading...' : `Showing ${referrals.length} of ${pagination.total}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={loading || pagination.page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  disabled={loading}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all disabled:cursor-not-allowed ${
                    p === pagination.page
                      ? 'bg-[#0012FF] text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={loading || pagination.page >= pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
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