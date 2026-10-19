'use client';

import { AdminListSkeleton } from '@/components/admin/AdminSkeletons';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  dbId?: string;
  name: string;
  username: string;
  email: string;
  joinedDate: string;
  time: string;
  status: 'Active' | 'Pending' | 'Inactive' | 'Suspended';
  avatar: string;
  city?: string;
  country?: string;
  languages?: string;
  bio?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const openDetail = (u: User) => router.push(`/admin/users/${u.dbId || u.id}`);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All Statuses' | 'Active' | 'Pending' | 'Inactive' | 'Suspended'>('All Statuses');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'All Statuses' || user.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        const res = await fetch(`/api/admin/users?userId=${userToDelete.dbId || userToDelete.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to delete user.');
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting user.');
      } finally {
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    }
  };

  // Pagination logic (10 users per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatusFilter]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <AdminListSkeleton />;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="pb-12"
    >
      {/* Greetings & Title */}
      <div className="mb-8">
        <p className="text-gray-500 font-sans text-sm sm:text-base mb-1">Hello Admin Abdullah!</p>
        <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
          <span className="text-[#0012FF] font-black">User</span> Management{' '}
          <span className="text-gray-400 font-normal text-sm sm:text-base">Overview & Control</span>
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {/* Card 1: Total Users */}
        <div className="bg-[#BAC4FF] rounded-xl p-5 sm:p-6 flex flex-col justify-between h-[170px] sm:h-[160px]">
          <div className="w-10 h-10 shrink-0 self-start bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 sm:mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-white/90 font-semibold mb-0.5">Total Users</p>
            <p className="text-3xl font-black text-[#0012FF] leading-none mb-1">{users.length}</p>
            <p className="text-[10px] text-white/90">All registered users</p>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="bg-[#A3E5A5] rounded-xl p-5 sm:p-6 flex flex-col justify-between h-[170px] sm:h-[160px]">
          <div className="w-10 h-10 shrink-0 self-start bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 sm:mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#12B76A" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-white/90 font-semibold mb-0.5">Active Users</p>
            <p className="text-3xl font-black text-[#12B76A] leading-none mb-1">{users.filter(u => u.status === 'Active').length}</p>
            <p className="text-[10px] text-white/90">Approved & active profiles</p>
          </div>
        </div>

        {/* Card 3: Inactive Users */}
        <div className="bg-[#FFADAD] rounded-xl p-5 sm:p-6 flex flex-col justify-between h-[170px] sm:h-[160px]">
          <div className="w-10 h-10 shrink-0 self-start bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 sm:mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-white/90 font-semibold mb-0.5">Suspended & Inactive</p>
            <p className="text-3xl font-black text-[#EF4444] leading-none mb-1">{users.filter(u => u.status === 'Inactive' || u.status === 'Suspended').length}</p>
            <p className="text-[10px] text-white/90">Inactive or blocked users</p>
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
            <p className="text-3xl font-black text-[#F59E0B] leading-none mb-1">{users.filter(u => u.status === 'Pending').length}</p>
            <p className="text-[10px] text-white/90">Awaiting creator approval</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
        {/* Table Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-black text-black font-sans">All Users</h2>

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
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User ID</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined Date</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 text-center uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm font-semibold text-gray-400">
                    Loading users list...
                  </td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => openDetail(user)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    {/* User ID */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{user.id}</td>

                    {/* User Profile */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black leading-none mb-0.5">{user.name}</p>
                          <p className="text-xs text-gray-400 font-medium">{user.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{user.email}</td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{user.joinedDate}</td>

                    {/* Time */}
                    <td className="py-4 px-4 text-sm font-semibold text-gray-500">{user.time}</td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${user.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : user.status === 'Pending'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : user.status === 'Inactive'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="px-4 py-1.5 border border-rose-100 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => openDetail(user)}
                          className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-400 hover:bg-gray-200 hover:text-gray-500 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm font-semibold text-gray-400">
                    No users found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-50">
          <p className="text-xs font-semibold text-gray-400">
            Showing {filteredUsers.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-[400px] shadow-2xl relative flex flex-col items-center z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Responsive Illustration */}
              <div className="w-28 sm:w-36 md:w-44 lg:w-56 mt-3 mb-4">
                <Image
                  src="/assets/cancel-appointment.webp"
                  alt="Delete account"
                  width={240}
                  height={170}
                  className="w-full h-auto object-contain"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 text-center">
                Delete User
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 text-center">
                Are you sure you want to delete this user?
              </p>

              <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
                This action cannot be undone.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all"
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
