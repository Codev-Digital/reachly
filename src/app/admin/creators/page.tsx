'use client';

import { AdminListSkeleton } from '@/components/admin/AdminSkeletons';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePreloadImages } from '@/lib/usePreloadImages';
import CreatorStatusActions from '@/components/admin/CreatorStatusActions';
import FormInput from '@/components/FormInput';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Creator {
  id: string;
  dbId?: string;
  name: string;
  username: string;
  email: string;
  joinedDate: string;
  time: string;
  deletedDate?: string;
  deletedTime?: string;
  eventsCreated: string;
  status: 'Active' | 'Pending' | 'Inactive' | 'Suspended' | 'Rejected' | 'Deleted';
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
  commissionPercent?: number;
}

export default function AdminCreatorsPage() {
  usePreloadImages(['/assets/cancel-appointment-sm.webp','/assets/booking-confirm-sm.webp','/assets/add-category-sm.webp']);
  const router = useRouter();
  const openDetail = (c: Creator) => router.push(`/admin/creators/${c.dbId || c.id}`);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All Statuses' | 'Active' | 'Pending' | 'Inactive' | 'Suspended' | 'Rejected' | 'Deleted'>('All Statuses');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [categories, setCategories] = useState<string[]>([
    'Lifestyle',
    'Tech',
    'Fitness',
    'Fashion',
    'Business',
    'Education',
    'Beauty',
    'Food',
    'Software Engineering',
    'Digital Marketing'
  ]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories.map((c: any) => c.name));
        }
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic stats
  const totalCreators = creators.filter(c => c.status !== 'Deleted').length;
  const activeCreators = creators.filter(c => c.status === 'Active').length;
  const inactiveCreators = creators.filter(c => c.status === 'Inactive' || c.status === 'Suspended' || c.status === 'Rejected' || c.status === 'Deleted').length;
  const pendingCreators = creators.filter(c => c.status === 'Pending').length;

  const loadCreators = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/creators', { cache: 'no-store' });
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

    const matchesStatus = selectedStatusFilter === 'All Statuses' ? creator.status !== 'Deleted' : creator.status === selectedStatusFilter;

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

  const handleAddCategorySubmit = async () => {
    const name = selectedCategory.trim();
    if (!name) {
      setCategoryError('Please enter a category name');
      return;
    }
    setIsSubmittingCategory(true);
    setCategoryError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        });
      const data = await res.json();
        if (res.ok) {
        setShowAddCategoryModal(false);
        setSelectedCategory('');
        await loadCategories();
        } else {
        setCategoryError(data.error || 'Failed to add category');
      }
    } catch {
      setCategoryError('Network error while adding category');
    } finally {
      setIsSubmittingCategory(false);
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
            <p className="text-[10px] text-white flex items-center gap-1">Suspended, rejected or incomplete</p>
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
                      {(['All Statuses', 'Active', 'Pending', 'Inactive', 'Suspended', 'Rejected', 'Deleted'] as const).map((filter) => {
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
            <thead className="bg-white">
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 text-xs font-semibold text-gray-500">Creator ID</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500">Creator</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500">Email</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500">{selectedStatusFilter === 'Deleted' ? 'Deleted Date' : 'Joined Date'}</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500">{selectedStatusFilter === 'Deleted' ? 'Deleted Time' : 'Time'}</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500">Events Created</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500">Commission</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500">Status</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-[#F8F8F8] border-b border-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm font-semibold text-gray-400">
                    Loading creators list...
                  </td>
                </tr>
              ) : paginatedCreators.length > 0 ? (
                paginatedCreators.map((creator) => (
                  <tr
                    key={creator.id}
                    onClick={() => openDetail(creator)}
                    className="hover:bg-[#EFEFEF] transition-colors cursor-pointer"
                  >
                    {/* Creator ID */}
                    <td className="py-4 px-4 text-sm font-medium text-gray-500">{creator.id}</td>

                    {/* Creator Profile */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                          <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-none mb-1">{creator.name}</p>
                          <p className="text-xs text-gray-400 font-medium">@{creator.username?.replace(/^@/, '')}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 text-sm text-gray-500">{creator.email}</td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-sm text-gray-500">{selectedStatusFilter === 'Deleted' && creator.deletedDate ? creator.deletedDate : creator.joinedDate}</td>

                    {/* Time */}
                    <td className="py-4 px-4 text-sm text-gray-500">{selectedStatusFilter === 'Deleted' && creator.deletedTime ? creator.deletedTime : (creator.time || '—')}</td>

                    {/* Events Created */}
                    <td className="py-4 px-4 text-sm text-gray-500">{creator.eventsCreated}</td>

                    {/* Commission */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-700">{creator.commissionPercent ?? 20}%</td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${creator.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600'
                          : creator.status === 'Pending'
                            ? 'bg-amber-50 text-amber-600'
                            : creator.status === 'Inactive'
                              ? 'bg-rose-50 text-rose-600'
                              : creator.status === 'Suspended'
                                ? 'bg-gray-100 text-gray-600'
                                : creator.status === 'Deleted'
                                  ? 'bg-red-50 text-red-600 font-semibold border border-red-200'
                                  : 'bg-rose-50 text-rose-600'
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
                          className="px-3.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm font-semibold text-gray-400">
                    No creators found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
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

      <Dialog
        open={showAddCategoryModal}
        onOpenChange={(open) => {
          setShowAddCategoryModal(open);
          if (!open) {
            setIsCategoryDropdownOpen(false);
            setCategoryError('');
          }
        }}
      >
        <DialogContent className="max-w-md rounded-[28px] border border-gray-100 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:p-8">
              <DialogHeader>
                <Image
                  src="/assets/add-category-sm.webp"
                  unoptimized
                  alt=""
                  width={176}
                  height={132}
                  loading="eager"
                  className="mb-3 h-28 w-40 object-contain"
                />
                <DialogTitle>Add Creator Category</DialogTitle>
                <DialogDescription className="mt-1">Add a new category for creators.</DialogDescription>
              </DialogHeader>

              <form
                className="mt-6 space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleAddCategorySubmit();
                }}
              >
              <div className="relative">
                <FormInput
                  id="creator-category"
                  label="Category"
                  required
                  placeholder="Type or select category (e.g. Gaming)"
                  value={selectedCategory}
                  error={categoryError}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCategoryError('');
                  }}
                  className="pr-11 font-semibold"
                  disabled={isSubmittingCategory}
                />
                <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen((open) => !open)}
                    disabled={isSubmittingCategory}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
                >
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
                {isCategoryDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
                        <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                          Existing Categories
                        </div>
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsCategoryDropdownOpen(false);
                              setCategoryError('');
                            }}
                            className={`w-full px-4 py-2 text-left text-sm font-semibold transition-all ${selectedCategory === cat
                              ? 'bg-[#0012FF] text-white'
                              : 'text-gray-600 hover:bg-gray-50'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  disabled={isSubmittingCategory}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!selectedCategory.trim() || isSubmittingCategory}
                  className="flex-1 rounded-xl bg-[#0012FF] py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isSubmittingCategory ? 'Adding...' : 'Add'}
                </button>
              </div>
              </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
