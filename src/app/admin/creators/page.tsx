'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Creator {
  id: string;
  dbId?: string;
  name: string;
  username: string;
  email: string;
  joinedDate: string;
  time: string;
  eventsCreated: string;
  status: 'Active' | 'Pending' | 'Inactive' | 'Suspended';
  avatar: string;
  city?: string;
  country?: string;
  languages?: string;
  startingPrice?: string;
  onboardingStep?: string;
  niches?: string[];
  bio?: string;
  longBio?: string;
  coverPhoto?: string;
  bannerName?: string;
  bannerNiche?: string;
  bannerContact?: string;
  sessionsCompleted?: number;
  happyUsers?: number;
  totalCategories?: number;
}

export default function AdminCreatorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All Statuses' | 'Active' | 'Pending' | 'Inactive' | 'Suspended'>('All Statuses');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [creatorToReject, setCreatorToReject] = useState<Creator | null>(null);
  const [rejectSuccess, setRejectSuccess] = useState(false);

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [creatorToAccept, setCreatorToAccept] = useState<Creator | null>(null);
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  // Track selected creator for full detail view
  const [activeDetailCreator, setActiveDetailCreator] = useState<Creator | null>(null);

  const categories = [
    'Software Engineering',
    'Fashion & Lifestyle',
    'Finance & Business',
    'Health & Fitness',
    'Digital Marketing',
    'Food & Travel',
    'Education'
  ];

  const initialCreators: Creator[] = [
    {
      id: 'CRT-10245',
      name: 'Sophia Reed',
      username: '@sophiareed',
      email: 'sophiareed@gmail.com',
      joinedDate: '02 July 2026',
      time: '10:45 AM',
      eventsCreated: 'Creator Growth',
      status: 'Active',
      avatar: '/ahad raza mir.png',
      city: 'Los Angeles',
      country: 'United States',
      languages: 'English',
      startingPrice: '15,000 PKR',
      onboardingStep: '7 / 7',
      niches: ['Fashion Tips', 'Style Guide', 'Shopping'],
      bio: 'Fashion creator sharing timeless style, seasonal trends, and everyday outfit inspiration for every occasion.',
      bannerName: 'Nageen Shah',
      bannerNiche: 'Software Engineering',
      bannerContact: '+ 123-456-7890   |   hello@reallygreatsite.com'
    },
    {
      id: 'CRT-10246',
      name: 'Sophia Reed',
      username: '@sophiareed',
      email: 'sophiareed@gmail.com',
      joinedDate: '02 July 2026',
      time: '10:45 AM',
      eventsCreated: 'Creator Growth +2',
      status: 'Pending',
      avatar: '/ahad raza mir.png',
      city: 'London',
      country: 'United Kingdom',
      languages: 'English',
      startingPrice: '20,000 PKR',
      onboardingStep: '5 / 7',
      niches: ['Travel', 'Food'],
      bio: 'Sophia explores local cuisines and hidden travel spots around Europe.',
      bannerName: 'Nageen Shah',
      bannerNiche: 'Travel Vlogging',
      bannerContact: '+ 123-456-7890   |   hello@reallygreatsite.com'
    },
    {
      id: 'CRT-10247',
      name: 'Sophia Reed',
      username: '@sophiareed',
      email: 'sophiareed@gmail.com',
      joinedDate: '02 July 2026',
      time: '10:45 AM',
      eventsCreated: 'None',
      status: 'Active',
      avatar: '/ahad raza mir.png',
      city: 'Lahore',
      country: 'Pakistan',
      languages: 'Urdu, English',
      startingPrice: '10,000 PKR',
      onboardingStep: '6 / 7',
      niches: ['Tech', 'Gadgets'],
      bio: 'Unboxing and reviewing the latest tech products and smart home devices.',
      bannerName: 'Nageen Shah',
      bannerNiche: 'Tech Reviewing',
      bannerContact: '+ 123-456-7890   |   hello@reallygreatsite.com'
    },
    {
      id: 'CRT-10248',
      name: 'Sophia Reed',
      username: '@sophiareed',
      email: 'sophiareed@gmail.com',
      joinedDate: '02 July 2026',
      time: '10:45 AM',
      eventsCreated: 'Creator Growth +1',
      status: 'Inactive',
      avatar: '/ahad raza mir.png',
      city: 'Dubai',
      country: 'UAE',
      languages: 'English, Arabic',
      startingPrice: '30,000 PKR',
      onboardingStep: '7 / 7',
      niches: ['Business', 'Finance'],
      bio: 'Helping young entrepreneurs scale their brands using digital platforms.',
      bannerName: 'Nageen Shah',
      bannerNiche: 'Business Growth',
      bannerContact: '+ 123-456-7890   |   hello@reallygreatsite.com'
    },
    {
      id: 'CRT-10249',
      name: 'Sophia Reed',
      username: '@sophiareed',
      email: 'sophiareed@gmail.com',
      joinedDate: '02 July 2026',
      time: '10:45 AM',
      eventsCreated: 'Creator Growth',
      status: 'Pending',
      avatar: '/ahad raza mir.png',
      city: 'Karachi',
      country: 'Pakistan',
      languages: 'Urdu, English',
      startingPrice: '12,000 PKR',
      onboardingStep: '7 / 7',
      niches: ['Education', 'Skill Development'],
      bio: 'Sharing tutorials and courses on UI/UX design and development.',
      bannerName: 'Nageen Shah',
      bannerNiche: 'UI/UX Design',
      bannerContact: '+ 123-456-7890   |   hello@reallygreatsite.com'
    },
    {
      id: 'CRT-10250',
      name: 'Sophia Reed',
      username: '@sophiareed',
      email: 'sophiareed@gmail.com',
      joinedDate: '02 July 2026',
      time: '10:45 AM',
      eventsCreated: 'Creator Growth',
      status: 'Suspended',
      avatar: '/ahad raza mir.png',
      city: 'New York',
      country: 'United States',
      languages: 'English',
      startingPrice: '25,000 PKR',
      onboardingStep: '4 / 7',
      niches: ['Fitness', 'Wellness'],
      bio: 'Sophia is a certified trainer sharing workout routines and meal plans.',
      bannerName: 'Nageen Shah',
      bannerNiche: 'Fitness Training',
      bannerContact: '+ 123-456-7890   |   hello@reallygreatsite.com'
    },
    {
      id: 'CRT-10251',
      name: 'Sophia Reed',
      username: '@sophiareed',
      email: 'sophiareed@gmail.com',
      joinedDate: '02 July 2026',
      time: '10:45 AM',
      eventsCreated: 'None',
      status: 'Active',
      avatar: '/ahad raza mir.png',
      city: 'Sydney',
      country: 'Australia',
      languages: 'English',
      startingPrice: '18,000 PKR',
      onboardingStep: '7 / 7',
      niches: ['Art', 'Design'],
      bio: 'Digital artist showcasing illustration processes and design tutorials.',
      bannerName: 'Nageen Shah',
      bannerNiche: 'Digital Art',
      bannerContact: '+ 123-456-7890   |   hello@reallygreatsite.com'
    }
  ];

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCreators = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/creators');
      if (res.ok) {
        const data = await res.json();
        setCreators(data.creators || []);
      }
    } catch (err) {
      console.error('Failed to load creators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreators();
  }, []);

  // Filter logic
  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'All Statuses' || creator.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic (10 creators per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCreators.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatusFilter]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCreators = filteredCreators.slice(startIndex, startIndex + itemsPerPage);

  const handleRejectClick = (creator: Creator) => {
    setCreatorToReject(creator);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (creatorToReject) {
      try {
        const res = await fetch('/api/admin/creators', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: creatorToReject.dbId || creatorToReject.id, action: 'reject' })
        });
        if (res.ok) {
          setRejectSuccess(true);
          loadCreators();
          setActiveDetailCreator(null);
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to reject creator.');
          setShowRejectModal(false);
          setCreatorToReject(null);
        }
      } catch (err) {
        console.error(err);
        alert('Error rejecting creator.');
        setShowRejectModal(false);
        setCreatorToReject(null);
      }
    }
  };

  const handleAcceptClick = (creator: Creator) => {
    setCreatorToAccept(creator);
    setAcceptSuccess(false);
    setShowAcceptModal(true);
  };

  const handleConfirmAccept = async () => {
    if (creatorToAccept) {
      try {
        const res = await fetch('/api/admin/creators', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: creatorToAccept.dbId || creatorToAccept.id, action: 'approve' })
        });
        if (res.ok) {
          setAcceptSuccess(true);
          loadCreators();
          setActiveDetailCreator(null);
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to approve creator.');
          setShowAcceptModal(false);
          setCreatorToAccept(null);
        }
      } catch (err) {
        console.error(err);
        alert('Error approving creator.');
        setShowAcceptModal(false);
        setCreatorToAccept(null);
      }
    }
  };

  const handleAddCategorySubmit = () => {
    if (selectedCategory) {
      alert(`Category "${selectedCategory}" added successfully!`);
      setShowAddCategoryModal(false);
      setSelectedCategory('');
    }
  };

  if (activeDetailCreator) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className="pb-12"
      >
        {/* Back Link */}
        <button
          onClick={() => setActiveDetailCreator(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-semibold"
        >
          <span>←</span> Back to Creators
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
            <span className="text-[#0012FF] font-black">Creator</span> Details{' '}
            <span className="text-gray-400 font-normal text-sm sm:text-base">Account Overview</span>
          </h1>
        </div>

        {/* Premium Creator Detail Card with creator-detail-card.svg background */}
        <div className="relative bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm overflow-hidden z-10">
          <img
            src="/assets/creator-detail-card.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
          />

          {/* Banner Graphic Header */}
          <div className="relative w-full aspect-[1140/320] rounded-2xl overflow-visible mb-12 flex items-center justify-end p-8 sm:p-12 text-white">
            {/* Background Graphic Mockup */}
            <div className="absolute inset-0 bg-black/45 z-0" />
            <img
              src={activeDetailCreator.coverPhoto || "/welcome-creator.png"}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                // Fallback neutral dark gradient if image doesn't load
                (e.target as HTMLImageElement).className = "absolute inset-0 w-full h-full bg-gradient-to-r from-neutral-800 to-neutral-950 z-[-1]";
              }}
            />

            {/* Profile circular overlay positioned inside the banner layout */}
            <div className="absolute left-8 sm:left-1 -bottom-16 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[6px] border-white shadow-lg bg-white z-20 flex-shrink-0">
              <img
                src={activeDetailCreator.avatar}
                alt={activeDetailCreator.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Text Overlay Details */}
            <div className="relative z-10 text-right max-w-xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans leading-tight">
                {activeDetailCreator.bannerName || activeDetailCreator.name}
              </h2>
              <div className="mt-2.5 inline-block px-5 py-1.5 border border-white/40 rounded-full text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-sm">
                {activeDetailCreator.bannerNiche || 'Content Creator'}
              </div>
              <p className="mt-4 text-[10px] sm:text-xs text-white/80 font-bold uppercase tracking-wider">
                {activeDetailCreator.bannerContact || activeDetailCreator.email}
              </p>
            </div>
          </div>

          {/* Profile Name & Social Pills (Aligned below banner) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-20 gap-4 border-b border-gray-50 pb-6 mb-8">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl font-black text-black leading-none">{activeDetailCreator.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0012FF] capitalize">
                  Influencer
                </span>
              </div>
              <p className="text-sm text-gray-400 font-bold mt-1.5">{activeDetailCreator.username}</p>
            </div>

            {/* Niches List */}
            {activeDetailCreator.niches && activeDetailCreator.niches.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeDetailCreator.niches.map((n, i) => {
                  const colors = [
                    'bg-rose-50 text-rose-500 border border-rose-100',
                    'bg-emerald-50 text-emerald-500 border border-emerald-100',
                    'bg-amber-50 text-amber-500 border border-amber-100'
                  ];
                  return (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold capitalize ${colors[i % colors.length]}`}
                    >
                      {n}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Block (Details Grid & Bio) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6">
                {/* Display Name */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Display Name</p>
                  <p className="text-sm font-bold text-black mt-1">{activeDetailCreator.name}</p>
                </div>

                {/* City */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">City</p>
                  <p className="text-sm font-bold text-black mt-1">{activeDetailCreator.city || 'N/A'}</p>
                </div>

                {/* Languages Spoken */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Languages Spoken</p>
                  <p className="text-sm font-bold text-black mt-1">{activeDetailCreator.languages || 'N/A'}</p>
                </div>

                {/* Joined Date */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Joined Date</p>
                  <p className="text-sm font-bold text-black mt-1">{activeDetailCreator.joinedDate}</p>
                </div>

                {/* Email */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-black mt-1 break-all">{activeDetailCreator.email}</p>
                </div>

                {/* Country */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Country</p>
                  <p className="text-sm font-bold text-black mt-1">{activeDetailCreator.country || 'N/A'}</p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
                  <p className={`text-sm font-black mt-1 ${activeDetailCreator.status === 'Active'
                    ? 'text-[#10B981]'
                    : activeDetailCreator.status === 'Pending'
                      ? 'text-[#F59E0B]'
                      : 'text-rose-500'
                    }`}>
                    {activeDetailCreator.status}
                  </p>
                </div>

                {/* Joined Timing */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Joined Timing</p>
                  <p className="text-sm font-bold text-black mt-1">{activeDetailCreator.time}</p>
                </div>
              </div>

              {/* Bio Field 1 */}
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Short Bio</p>
                <p className="text-sm text-gray-500 font-bold mt-2">
                  {activeDetailCreator.bio || 'No bio provided.'}
                </p>
              </div>

              {/* Bio Field 2 */}
              <div className="pt-2">
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-4xl">
                  {activeDetailCreator.longBio || 'No detailed bio provided.'}
                </p>
              </div>
            </div>

            {/* Right Block (Vertical Stats) */}
            <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between items-center gap-6">
              {/* Stat 1 */}
              <div className="text-center w-full">
                <p className="text-4xl font-black text-[#0012FF] leading-none mb-1">{activeDetailCreator.sessionsCompleted ?? 0}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sessions completed</p>
              </div>

              {/* Divider */}
              <div className="w-16 h-[1px] bg-gray-50" />

              {/* Stat 2 */}
              <div className="text-center w-full">
                <p className="text-4xl font-black text-[#10B981] leading-none mb-1">{activeDetailCreator.happyUsers ?? 0}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Happy Users</p>
              </div>

              {/* Divider */}
              <div className="w-16 h-[1px] bg-gray-50" />

              {/* Stat 3 */}
              <div className="text-center w-full">
                <p className="text-4xl font-black text-[#F59E0B] leading-none mb-1">{activeDetailCreator.totalCategories ?? 0}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Categories</p>
              </div>
            </div>
          </div>

          {/* Social Icons Row */}
          <div className="mt-12 flex justify-center items-center gap-4">
            {/* Facebook */}
            <a href="#" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
              </svg>
            </a>

            {/* Instagram */}
            <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFB13B] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* YouTube */}
            <a href="#" className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* TikTok */}
            <a href="#" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-.99v6.5c0 1.9-.53 3.86-1.67 5.37-1.43 1.93-3.86 3.1-6.27 3.09-2.91.02-5.74-1.53-7.07-4.12-1.47-2.77-1.12-6.39.88-8.8 1.58-1.94 4.09-2.97 6.57-2.77V11.3c-1.04-.11-2.13.08-3.03.65-.96.6-1.6 1.66-1.72 2.78-.17 1.29.35 2.63 1.34 3.44.96.8 2.29 1.11 3.52.82.99-.21 1.89-.83 2.4-1.71.4-.66.58-1.44.57-2.22V.02z" />
              </svg>
            </a>
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
      {/* Greetings & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-gray-500 font-sans text-sm sm:text-base mb-1">Hello Admin Abdullah!</p>
          <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
            <span className="text-[#0012FF] font-black">Creator</span> Management{' '}
            <span className="text-gray-400 font-normal text-sm sm:text-base">Overview & Control</span>
          </h1>
        </div>

        {/* Add Creator Category Button */}
        <button
          onClick={() => setShowAddCategoryModal(true)}
          className="sm:self-end px-6 py-3 bg-[#0012FF] text-white rounded-2xl text-sm font-bold shadow-md shadow-[#0012FF]/20 hover:bg-[#0012FF]/95 transition-all"
        >
          + Add Creator Category
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {/* Card 1: Total Creators */}
        <div className="bg-[#BAC4FF] rounded-xl p-5 sm:p-6 flex flex-col justify-between h-[170px] sm:h-[160px]">
          <div className="w-10 h-10 shrink-0 self-start bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 sm:mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-white/90 font-semibold mb-0.5">Total Creators</p>
            <p className="text-3xl font-black text-[#0012FF] leading-none mb-1">410</p>
            <p className="text-[10px] text-white flex items-center gap-1">↑ +18.2% from last month</p>
          </div>
        </div>

        {/* Card 2: Active Creators */}
        <div className="bg-[#A3E5A5] rounded-xl p-5 sm:p-6 flex flex-col justify-between h-[170px] sm:h-[160px]">
          <div className="w-10 h-10 shrink-0 self-start bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 sm:mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#12B76A" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-white/90 font-semibold mb-0.5">Active Creators</p>
            <p className="text-3xl font-black text-[#12B76A] leading-none mb-1">376</p>
            <p className="text-[10px] text-white flex items-center gap-1">↑ +18.2% from last month</p>
          </div>
        </div>

        {/* Card 3: Inactive Creators */}
        <div className="bg-[#FFADAD] rounded-xl p-5 sm:p-6 flex flex-col justify-between h-[170px] sm:h-[160px]">
          <div className="w-10 h-10 shrink-0 self-start bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 sm:mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-white/90 font-semibold mb-0.5">Inactive Creators</p>
            <p className="text-3xl font-black text-[#EF4444] leading-none mb-1">34</p>
            <p className="text-[10px] text-white flex items-center gap-1">↑ +18.2% from last month</p>
          </div>
        </div>

        {/* Card 4: Pending Approval */}
        <div className="bg-[#FFE199] rounded-xl p-5 sm:p-6 flex flex-col justify-between h-[170px] sm:h-[160px]">
          <div className="w-10 h-10 shrink-0 self-start bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 sm:mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-white/90 font-semibold mb-0.5">Pending Approval</p>
            <p className="text-3xl font-black text-[#F59E0B] leading-none mb-1">234</p>
            <p className="text-[10px] text-white flex items-center gap-1">↑ +18.2% from last month</p>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
        {/* Table Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-black text-black font-sans">All Creators</h2>

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
                      {(['All Statuses', 'Active', 'Pending', 'Inactive', 'Suspended'] as const).map((filter) => {
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
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Creator ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Creator</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined Date</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Events Created</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm font-semibold text-gray-400">
                    Loading creators list...
                  </td>
                </tr>
              ) : paginatedCreators.length > 0 ? (
                paginatedCreators.map((creator) => (
                  <tr
                    key={creator.id}
                    onClick={() => setActiveDetailCreator(creator)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    {/* Creator ID */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{creator.id}</td>

                    {/* Creator Profile */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                          <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black leading-none mb-0.5">{creator.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{creator.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{creator.email}</td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{creator.joinedDate}</td>

                    {/* Time */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{creator.time}</td>

                    {/* Events Created */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{creator.eventsCreated}</td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${creator.status === 'Active'
                          ? 'bg-[#E5F7ED] text-[#12B76A]'
                          : creator.status === 'Pending'
                            ? 'bg-[#FFF3E0] text-[#F59E0B]'
                            : creator.status === 'Inactive'
                              ? 'bg-[#FFEBEB] text-[#EF4444]'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                      >
                        {creator.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcceptClick(creator)}
                          className="px-3.5 py-1.5 border border-[#12B76A]/30 bg-[#12B76A]/5 rounded-full text-[10px] font-bold text-[#12B76A] hover:bg-[#12B76A]/10 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectClick(creator)}
                          className="px-3.5 py-1.5 border border-[#EF4444]/30 bg-[#EF4444]/5 rounded-full text-[10px] font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setActiveDetailCreator(creator)}
                          className="px-3.5 py-1.5 border border-gray-200 bg-gray-50 rounded-full text-[10px] font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm font-semibold text-gray-400">
                    No creators found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-50">
          <p className="text-xs font-semibold text-gray-400">
            Showing {filteredCreators.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredCreators.length)} of {filteredCreators.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentPage === page
                  ? 'bg-[#0012FF] text-white shadow-md shadow-[#0012FF]/20'
                  : 'text-gray-500 hover:bg-gray-50'
                  }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Reject Confirmation Modal (Delete structure) */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm flex flex-col items-center p-8 z-10 bg-white rounded-[24px] shadow-xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowRejectModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all z-20"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Responsive Illustration */}
              <div className="w-28 sm:w-36 md:w-44 lg:w-56 mt-3 mb-4">
                <Image
                  src="/assets/cancel-appointment.webp"
                  alt="Reject creator"
                  width={240}
                  height={170}
                  className="w-full h-auto object-contain"
                />
              </div>

              {rejectSuccess ? (
                <>
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 text-center">
                    Success!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
                    Creator rejected successfully.
                  </p>
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setCreatorToReject(null);
                      setRejectSuccess(false);
                    }}
                    className="w-full py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all"
                  >
                    OK
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 text-center">
                    Reject Creator
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 text-center">
                    Are you sure you want to reject this creator?
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setShowRejectModal(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmReject}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all"
                    >
                      Reject Creator
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Accept Confirmation Modal */}
      <AnimatePresence>
        {showAcceptModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAcceptModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm flex flex-col items-center p-8 z-10 bg-white rounded-[24px] shadow-xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAcceptModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all z-20"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Responsive Illustration */}
              <div className="w-28 sm:w-36 md:w-44 lg:w-56 mt-3 mb-4">
                <Image
                  src="/assets/booking-confirm.png"
                  alt="Accept creator"
                  width={240}
                  height={170}
                  className="w-full h-auto object-contain"
                />
              </div>

              {acceptSuccess ? (
                <>
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 text-center">
                    Success!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
                    Creator approved successfully.
                  </p>
                  <button
                    onClick={() => {
                      setShowAcceptModal(false);
                      setCreatorToAccept(null);
                      setAcceptSuccess(false);
                    }}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all"
                  >
                    OK
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 text-center">
                    Accept Creator
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 text-center">
                    Are you sure you want to accept this creator?
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setShowAcceptModal(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmAccept}
                      className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all"
                    >
                      Accept Creator
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategoryModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddCategoryModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm flex flex-col items-center p-8 z-10 bg-white rounded-[24px] shadow-xl animate-fade-in"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all z-20"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Responsive Illustration */}
              <div className="w-28 sm:w-36 md:w-44 lg:w-56 mt-3 mb-4">
                <Image
                  src="/assets/add-category.png"
                  alt="Add category"
                  width={240}
                  height={170}
                  className="w-full h-auto object-contain"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 text-center">
                Add Creator Category
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
                Add a new category for creators.
              </p>

              {/* Custom Input / Dropdown Container */}
              <div className="w-full mb-6 relative">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-all text-left"
                >
                  <span>{selectedCategory || 'Select Category'}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsCategoryDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto py-1"
                      >
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all ${selectedCategory === cat
                              ? 'bg-[#0012FF] text-white'
                              : 'text-gray-600 hover:bg-gray-50'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddCategorySubmit}
                  disabled={!selectedCategory}
                  className="flex-1 py-2.5 bg-[#0012FF] disabled:bg-blue-300 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
                >
                  Add
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
