'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const UsersPage = () => {
  const [selectedTab, setSelectedTab] = useState('All Users (50)');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const users = [
    { id: 1, name: 'Zainab Malik', email: 'zainab.m@gmail.com', role: 'Follower', joined: '28 Apr 2026', status: 'Completed', spent: 'PKR 15,200', lastActive: '7 May, 07:00 am', avatar: '/ahad raza mir.png' },
    { id: 2, name: 'Zainab Malik', email: 'zainab.m@gmail.com', role: 'Follower', joined: '28 Apr 2026', status: 'Completed', spent: 'PKR 15,200', lastActive: '7 May, 07:00 am', avatar: '/ahad raza mir.png' },
    { id: 3, name: 'Zainab Malik', email: 'zainab.m@gmail.com', role: 'Follower', joined: '28 Apr 2026', status: 'Completed', spent: 'PKR 45,200', lastActive: '7 May, 07:00 am', avatar: '/ahad raza mir.png' },
    { id: 4, name: 'Zainab Malik', email: 'zainab.m@gmail.com', role: 'Follower', joined: '28 Apr 2026', status: 'Completed', spent: 'PKR 45,200', lastActive: '7 May, 07:00 am', avatar: '/ahad raza mir.png' },
    { id: 5, name: 'Zainab Malik', email: 'zainab.m@gmail.com', role: 'Follower', joined: '28 Apr 2026', status: 'Completed', spent: 'PKR 15,200', lastActive: '7 May, 07:00 am', avatar: '/ahad raza mir.png' },
    { id: 6, name: 'Zainab Malik', email: 'zainab.m@gmail.com', role: 'Follower', joined: '28 Apr 2026', status: 'Completed', spent: 'PKR 45,200', lastActive: '7 May, 07:00 am', avatar: '/ahad raza mir.png' },
    { id: 7, name: 'Zainab Malik', email: 'zainab.m@gmail.com', role: 'Follower', joined: '28 Apr 2026', status: 'Completed', spent: 'PKR 15,200', lastActive: '7 May, 07:00 am', avatar: '/ahad raza mir.png' },
    { id: 8, name: 'Zainab Malik', email: 'zainab.m@gmail.com', role: 'Follower', joined: '28 Apr 2026', status: 'Completed', spent: 'PKR 45,200', lastActive: '7 May, 07:00 am', avatar: '/ahad raza mir.png' },
    { id: 9, name: 'Zainab Malik', email: 'zainab.m@gmail.com', role: 'Follower', joined: '28 Apr 2026', status: 'Completed', spent: 'PKR 15,200', lastActive: '7 May, 07:00 am', avatar: '/ahad raza mir.png' },
    { id: 10, name: 'Zainab Malik', email: 'zainab.m@gmail.com', role: 'Follower', joined: '28 Apr 2026', status: 'Completed', spent: 'PKR 45,200', lastActive: '7 May, 07:00 am', avatar: '/ahad raza mir.png' },
  ];

  const tabs = ['All Users (50)', 'Followers (28)', 'Creators (20)', 'Admins (2)', 'Suspended (4)'];

  const toggleRow = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const userDetails = selectedUser || {
    name: 'Emaan Raza',
    email: 'emaan.r@gmail.com',
    status: 'Active',
    location: 'Lahore',
    joined: '28 Apr 2026',
    lastActive: '7 May, 07:00 am',
    totalBookings: 1,
    totalSpent: 'PKR 1,800',
    avatar: '/ahad raza mir.png',
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col lg:flex-row gap-6 w-full"
    >
      <div className={`flex-1 ${selectedUser ? 'lg:pr-6' : ''}`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-2 text-xs font-sans text-[#F9F6F2] opacity-60">
          <span>Dashboard</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="opacity-100">Users</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#F9F6F2]">User Management</h1>
          <div className="flex gap-3 flex-wrap">
            <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-lg text-xs md:text-sm font-sans text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Export CSV
            </button>
            <button className="flex items-center gap-2 bg-[#141414] border border-[rgba(200,169,126,0.3)] px-4 py-2 rounded-lg text-xs md:text-sm font-sans text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Bulk Email
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-sans whitespace-nowrap transition-all ${
                selectedTab === tab
                  ? 'bg-[rgba(200,169,126,0.15)] border border-[rgba(200,169,126,0.4)] text-[#C8A97E]'
                  : 'bg-[#141414] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] opacity-70 hover:opacity-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,20,0.5)]">
                  <th className="text-left py-4 px-4 w-10">
                    <input type="checkbox" className="w-4 h-4 rounded border-[rgba(200,169,126,0.4)] bg-[#0C0C0C] text-[#C8A97E] focus:ring-[#C8A97E]" />
                  </th>
                  {['User', 'Email', 'Role', 'Joined', 'Status', 'Spent', 'Last Active'].map(header => (
                    <th
                      key={header}
                      className="text-left py-4 px-4 font-sans text-xs font-semibold text-[#C8A97E] uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.02 }}
                    onClick={() => setSelectedUser(user)}
                    className={`border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(200,169,126,0.05)] cursor-pointer ${selectedUser?.id === user.id ? 'bg-[rgba(200,169,126,0.1)]' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(user.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleRow(user.id);
                        }}
                        className="w-4 h-4 rounded border-[rgba(200,169,126,0.4)] bg-[#0C0C0C] text-[#C8A97E] focus:ring-[#C8A97E]"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-sans text-sm text-[#F9F6F2]">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4"><span className="font-sans text-sm text-[#F9F6F2] opacity-70">{user.email}</span></td>
                    <td className="py-4 px-4"><span className="font-sans text-sm text-[#F9F6F2] opacity-70">{user.role}</span></td>
                    <td className="py-4 px-4"><span className="font-sans text-sm text-[#F9F6F2] opacity-70">{user.joined}</span></td>
                    <td className="py-4 px-4">
                      <span className="font-sans text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{user.status}</span>
                    </td>
                    <td className="py-4 px-4"><span className="font-sans text-sm text-[#F9F6F2]">{user.spent}</span></td>
                    <td className="py-4 px-4"><span className="font-sans text-sm text-[#F9F6F2] opacity-70">{user.lastActive}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <p className="font-sans text-xs text-[#F9F6F2] opacity-60">Showing 1 to 10 of 1256 users</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#141414] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] opacity-60 hover:opacity-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#C8A97E] text-[#0C0C0C] font-sans text-sm font-semibold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#141414] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] font-sans text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#141414] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] opacity-60 hover:opacity-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* User Details Sidebar */}
      <AnimatePresence>
        {selectedUser !== null && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="w-full lg:w-[380px] bg-[#141414] border-t lg:border-t-0 lg:border-l border-[rgba(200,169,126,0.3)] rounded-xl p-6 mt-6 lg:mt-0 sticky top-6 h-fit"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img src={userDetails.avatar} alt={userDetails.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#F9F6F2]">{userDetails.name}</h3>
                <p className="font-sans text-sm text-[#F9F6F2] opacity-70">{userDetails.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-2">Status</p>
                <span className="font-sans text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">{userDetails.status}</span>
              </div>
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-2">Location</p>
                <p className="font-sans text-sm text-[#F9F6F2]">{userDetails.location}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-2">Joined</p>
                <p className="font-sans text-sm text-[#F9F6F2]">{userDetails.joined}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-2">Last Active</p>
                <p className="font-sans text-sm text-[#F9F6F2]">{userDetails.lastActive}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-2">Total Bookings</p>
                <p className="font-sans text-sm text-[#F9F6F2]">{userDetails.totalBookings}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-xl p-4">
                <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mb-2">Total Spent</p>
                <p className="font-sans text-sm text-[#C8A97E]">{userDetails.totalSpent}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] px-4 py-3 rounded-xl text-sm font-sans text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                View Public Profile
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] px-4 py-3 rounded-xl text-sm font-sans text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Reset Password
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] px-4 py-3 rounded-xl text-sm font-sans text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <path d="M20 8v6" />
                  <path d="M23 11h-6" />
                </svg>
                Impersonate
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] px-4 py-3 rounded-xl text-sm font-sans text-[#F9F6F2] hover:bg-[rgba(200,169,126,0.1)] transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Force re-verify
              </button>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={() => setShowSuspendModal(true)}
                className="flex items-center justify-center gap-2 bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.4)] px-6 py-3 rounded-xl text-sm font-sans text-[#C8A97E] hover:bg-[rgba(200,169,126,0.2)] transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.5 19.5a7.5 7.5 0 0 1 0-15 7.5 7.5 0 0 1 7.5 7.5c0 4.14-3.36 7.5-7.5 7.5" />
                  <polyline points="21 12 17 12 17 18" />
                  <circle cx="7" cy="7" r="1" />
                </svg>
                Suspend Account
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center gap-2 bg-red-900/10 border border-red-500/30 px-6 py-3 rounded-xl text-sm font-sans text-red-400 hover:bg-red-900/20 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Delete Account
              </button>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-[#F9F6F2] mb-4">Audit Log</h4>
              <div className="space-y-3">
                {[
                  { action: 'Account created', date: '28 Apr, 09:00 am by System' },
                  { action: 'Email verified', date: '28 Apr, 09:00 am by User' },
                  { action: 'Last login', date: '7 May, 07:00 am by User' },
                ].map((log, index) => (
                  <div key={index} className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.2)] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="font-sans text-sm text-[#F9F6F2]">{log.action}</p>
                    <p className="font-sans text-xs text-[#F9F6F2] opacity-60">{log.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="font-serif text-xl font-bold text-[#F9F6F2] mb-2">Delete Account</h3>
              <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-6">
                Are you sure you want to delete {userDetails.name}? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end flex-wrap">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 rounded-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] font-sans text-sm hover:bg-[rgba(200,169,126,0.1)] transition-all"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 rounded-full bg-red-600 text-white font-sans text-sm hover:bg-red-700 transition-all">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Suspend Modal */}
      <AnimatePresence>
        {showSuspendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuspendModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="font-serif text-xl font-bold text-[#F9F6F2] mb-2">Suspend Account</h3>
              <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-6">
                Are you sure you want to suspend {userDetails.name}? This action can be reversed later.
              </p>
              <div className="flex gap-3 justify-end flex-wrap">
                <button
                  onClick={() => setShowSuspendModal(false)}
                  className="px-6 py-2 rounded-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] font-sans text-sm hover:bg-[rgba(200,169,126,0.1)] transition-all"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 rounded-full bg-[#C8A97E] text-[#0C0C0C] font-sans text-sm hover:opacity-90 transition-all">
                  Suspend
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UsersPage;
