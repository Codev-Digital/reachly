'use client';

import { AdminListSkeleton } from '@/components/admin/AdminSkeletons';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePreloadImages } from '@/lib/usePreloadImages';
import CreatorStatusActions from '@/components/admin/CreatorStatusActions';

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
  usePreloadImages(['/assets/cancel-appointment-sm.webp','/assets/booking-confirm-sm.webp','/assets/add-category-sm.webp']);
  const router = useRouter();
  const openDetail = (c: Creator) => router.push(`/admin/creators/${c.dbId || c.id}`);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All Statuses' | 'Active' | 'Pending' | 'Inactive' | 'Suspended'>('All Statuses');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    'Software Engineering',
    'Fashion & Lifestyle',
    'Finance & Business',
    'Health & Fitness',
    'Digital Marketing',
    'Food & Travel',
    'Education'
  ];

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic stats
  const totalCreators = creators.length;
  const activeCreators = creators.filter(c => c.status === 'Active').length;
  const inactiveCreators = creators.filter(c => c.status === 'Inactive' || c.status === 'Suspended').length;
  const pendingCreators = creators.filter(c => c.status === 'Pending').length;

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

  const handleAddCategorySubmit = () => {
    if (selectedCategory) {
      alert(`Category "${selectedCategory}" added successfully!`);
      setShowAddCategoryModal(false);
      setSelectedCategory('');
    }
  };

  if (loading) return <AdminListSkeleton />;

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
            <p className="text-3xl font-black text-[#0012FF] leading-none mb-1">{totalCreators}</p>
            <p className="text-[10px] text-white flex items-center gap-1">All registered creators</p>
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
            <p className="text-3xl font-black text-[#12B76A] leading-none mb-1">{activeCreators}</p>
            <p className="text-[10px] text-white flex items-center gap-1">Approved profiles</p>
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
            <p className="text-3xl font-black text-[#EF4444] leading-none mb-1">{inactiveCreators}</p>
            <p className="text-[10px] text-white flex items-center gap-1">Suspended or incomplete</p>
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
            <p className="text-3xl font-black text-[#F59E0B] leading-none mb-1">{pendingCreators}</p>
            <p className="text-[10px] text-white flex items-center gap-1">Awaiting admin action</p>
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
                    onClick={() => openDetail(creator)}
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
                        <CreatorStatusActions userId={creator.dbId || creator.id} status={creator.status} onChanged={loadCreators} />
                        <button
                          onClick={() => openDetail(creator)}
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

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategoryModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddCategoryModal(false)}
              className="absolute inset-0 bg-black/40"
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
              <div className="w-28 sm:w-36 md:w-44 lg:w-56 aspect-[3/2] mt-3 mb-4">
                <Image
                  src="/assets/add-category-sm.webp"
                  unoptimized
                  alt="Add category"
                  width={480}
                  height={320}
                  loading="eager"
                  className="w-full h-full object-contain"
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
