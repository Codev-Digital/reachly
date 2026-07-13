'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

interface User {
  id: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All Statuses' | 'Active' | 'Pending' | 'Inactive' | 'Suspended'>('All Statuses');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Track selected user for full detail view
  const [activeDetailUser, setActiveDetailUser] = useState<User | null>(null);

  const initialUsers: User[] = [
    { 
      id: 'USR-10245', 
      name: 'James Richard', 
      username: '@jamesrichard', 
      email: 'jamesrichard@gmail.com', 
      joinedDate: '02 July 2026', 
      time: '10:45 AM', 
      status: 'Active', 
      avatar: '/ahad raza mir.png',
      city: 'Los Angeles',
      country: 'United States',
      languages: 'English',
      bio: 'I want to start a YouTube channel about Pakistani street food. How do I structure my videos and what content should I focus on?'
    },
    { 
      id: 'USR-10246', 
      name: 'James Richard', 
      username: '@jamesrichard', 
      email: 'jamesrichard@gmail.com', 
      joinedDate: '02 July 2026', 
      time: '10:45 AM', 
      status: 'Pending', 
      avatar: '/ahad raza mir.png',
      city: 'New York',
      country: 'United States',
      languages: 'English, Spanish',
      bio: 'Enthusiastic food traveler looking to connect with top creators in Pakistan.'
    },
    { 
      id: 'USR-10247', 
      name: 'James Richard', 
      username: '@jamesrichard', 
      email: 'jamesrichard@gmail.com', 
      joinedDate: '02 July 2026', 
      time: '10:45 AM', 
      status: 'Active', 
      avatar: '/ahad raza mir.png',
      city: 'London',
      country: 'United Kingdom',
      languages: 'English',
      bio: 'Tech enthusiast and digital media manager.'
    },
    { 
      id: 'USR-10248', 
      name: 'James Richard', 
      username: '@jamesrichard', 
      email: 'jamesrichard@gmail.com', 
      joinedDate: '02 July 2026', 
      time: '10:45 AM', 
      status: 'Inactive', 
      avatar: '/ahad raza mir.png',
      city: 'Lahore',
      country: 'Pakistan',
      languages: 'English, Urdu',
      bio: 'Aspiring chef hoping to learn video editing and content creation strategies.'
    },
    { 
      id: 'USR-10249', 
      name: 'James Richard', 
      username: '@jamesrichard', 
      email: 'jamesrichard@gmail.com', 
      joinedDate: '02 July 2026', 
      time: '10:45 AM', 
      status: 'Pending', 
      avatar: '/ahad raza mir.png',
      city: 'Karachi',
      country: 'Pakistan',
      languages: 'Urdu, English',
      bio: 'Digital nomad exploring consulting opportunities.'
    },
    { 
      id: 'USR-10250', 
      name: 'James Richard', 
      username: '@jamesrichard', 
      email: 'jamesrichard@gmail.com', 
      joinedDate: '02 July 2026', 
      time: '10:45 AM', 
      status: 'Suspended', 
      avatar: '/ahad raza mir.png',
      city: 'Toronto',
      country: 'Canada',
      languages: 'English, French',
      bio: 'Videographer looking to collaborate with food vloggers.'
    },
    { 
      id: 'USR-10251', 
      name: 'James Richard', 
      username: '@jamesrichard', 
      email: 'jamesrichard@gmail.com', 
      joinedDate: '02 July 2026', 
      time: '10:45 AM', 
      status: 'Active', 
      avatar: '/ahad raza mir.png',
      city: 'Sydney',
      country: 'Australia',
      languages: 'English',
      bio: 'Vlogger documenting traditional street foods around the globe.'
    }
  ];

  const [users, setUsers] = useState<User[]>(initialUsers);

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

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      if (activeDetailUser?.id === userToDelete.id) {
        setActiveDetailUser(null);
      }
    }
  };

  if (activeDetailUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className="pb-12"
      >
        {/* Back Link */}
        <button
          onClick={() => setActiveDetailUser(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-semibold"
        >
          <span>←</span> Back to Users
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
            <span className="text-[#0012FF] font-black">User</span> Details{' '}
            <span className="text-gray-400 font-normal text-sm sm:text-base">Account Overview</span>
          </h1>
        </div>

        {/* User Detail Card */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-stretch">
          {/* Left Column: Avatar & Name */}
          <div className="flex flex-col items-center text-center justify-center md:border-r md:border-gray-100 md:pr-10 flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-100 shadow-inner mb-4">
              <img
                src={activeDetailUser.avatar}
                alt={activeDetailUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-black">{activeDetailUser.name}</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{activeDetailUser.username}</p>
          </div>

          {/* Right Column: Grid Details & Bio */}
          <div className="flex-1 flex flex-col justify-between pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6">
              {/* Display Name */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Display Name</p>
                <p className="text-sm font-bold text-black mt-1">{activeDetailUser.name}</p>
              </div>

              {/* City */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">City</p>
                <p className="text-sm font-bold text-black mt-1">{activeDetailUser.city || 'N/A'}</p>
              </div>

              {/* Languages Spoken */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Languages Spoken</p>
                <p className="text-sm font-bold text-black mt-1">{activeDetailUser.languages || 'N/A'}</p>
              </div>

              {/* Joined Date */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Joined Date</p>
                <p className="text-sm font-bold text-black mt-1">{activeDetailUser.joinedDate}</p>
              </div>

              {/* Email */}
              <div className="col-span-1">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                <p className="text-sm font-bold text-black mt-1 break-all">{activeDetailUser.email}</p>
              </div>

              {/* Country */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Country</p>
                <p className="text-sm font-bold text-black mt-1">{activeDetailUser.country || 'N/A'}</p>
              </div>

              {/* Status */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
                <p className={`text-sm font-black mt-1 ${
                  activeDetailUser.status === 'Active'
                    ? 'text-emerald-500'
                    : activeDetailUser.status === 'Pending'
                    ? 'text-amber-500'
                    : activeDetailUser.status === 'Inactive'
                    ? 'text-rose-500'
                    : 'text-gray-500'
                }`}>
                  {activeDetailUser.status}
                </p>
              </div>

              {/* Joined Timing */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Joined Timing</p>
                <p className="text-sm font-bold text-black mt-1">{activeDetailUser.time}</p>
              </div>
            </div>

            {/* Short Bio */}
            <div className="mt-8 pt-6 border-t border-gray-50">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Short Bio</p>
              <p className="text-sm text-gray-600 font-medium leading-relaxed mt-2 max-w-3xl">
                {activeDetailUser.bio || 'This user has not set a bio yet.'}
              </p>
            </div>
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
      {/* Greetings & Title */}
      <div className="mb-8">
        <p className="text-gray-500 font-sans text-sm sm:text-base mb-1">Hello Anna Chris!</p>
        <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
          <span className="text-[#0012FF] font-black">User</span> Management{' '}
          <span className="text-gray-400 font-normal text-sm sm:text-base">Overview & Control</span>
        </h1>
      </div>

      {/* Interlocking Metrics Cards */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start w-full gap-1 sm:gap-7 mb-10 overflow-visible">
        {/* Card 1: Total Users */}
        <div className="relative w-full sm:w-[26%] aspect-[329/160] p-6 flex flex-col justify-between overflow-visible z-[1]">
          <img
            src="/assets/admin-user-rc-1.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
          />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0012FF] shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div className="mt-auto">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-black text-[#0012FF]">1,410</p>
            <p className="text-[10px] text-gray-400">↑ +18.2% from last month</p>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="relative w-full sm:w-[28.5%] aspect-[361/160] pl-10 pr-6 py-6 flex flex-col justify-between overflow-visible z-[2] mt-4 sm:mt-0 sm:-ml-[3.9%]">
          <img
            src="/assets/admin-user-rc-2.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
          />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#10B981] shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="mt-auto">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Users</p>
            <p className="text-2xl font-black text-[#10B981]">1,376</p>
            <p className="text-[10px] text-gray-400">↑ +18.2% from last month</p>
          </div>
        </div>

        {/* Card 3: Inactive Users */}
        <div className="relative w-full sm:w-[28.5%] aspect-[363/160] pl-10 pr-6 py-6 flex flex-col justify-between overflow-visible z-[3] mt-4 sm:mt-0 sm:-ml-[3.9%]">
          <img
            src="/assets/admin-user-rc-3.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
          />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#EF4444] shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <div className="mt-auto">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Inactive Users</p>
            <p className="text-2xl font-black text-[#EF4444]">34</p>
            <p className="text-[10px] text-gray-400">↑ +18.2% from last month</p>
          </div>
        </div>

        {/* Card 4: Pending Approval */}
        <div className="relative w-full sm:w-[28.5%] aspect-[363/160] pl-10 pr-6 py-6 flex flex-col justify-between overflow-visible z-[4] mt-4 sm:mt-0 sm:-ml-[3.9%]">
          <img
            src="/assets/admin-user-rc-4.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-fill -z-10 pointer-events-none"
          />
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#F59E0B] shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="mt-auto">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pending Approval</p>
            <p className="text-2xl font-black text-[#F59E0B]">234</p>
            <p className="text-[10px] text-gray-400">↑ +18.2% from last month</p>
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
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => setActiveDetailUser(user)}
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
                          onClick={() => setActiveDetailUser(user)}
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
          <p className="text-xs font-semibold text-gray-400">Showing {filteredUsers.length} of {users.length}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentPage === 1
                ? 'bg-[#0012FF] text-white shadow-md shadow-[#0012FF]/20'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentPage === 2
                ? 'bg-[#0012FF] text-white shadow-md shadow-[#0012FF]/20'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
              onClick={() => setCurrentPage(2)}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
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
              className="relative overflow-visible w-full max-w-lg flex flex-col items-center p-8 pt-12 pb-8 z-10 bg-transparent"
            >
              {/* SVG Background */}
              <img
                src="/assets/cancel-card.svg"
                alt=""
                className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
              />

              {/* Close Button */}
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute -mt-20 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-50 transition-all z-20"
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
                  src="/assets/cancel-appointment.png"
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
