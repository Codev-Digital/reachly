'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminDetailSkeleton } from '@/components/admin/AdminSkeletons';

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

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Status Action Modal Feedback States
  const [showStatusFeedbackModal, setShowStatusFeedbackModal] = useState(false);
  const [statusFeedbackMessage, setStatusFeedbackMessage] = useState('');
  const [statusFeedbackType, setStatusFeedbackType] = useState<'success' | 'error'>('success');

  const loadUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleUpdateStatus = async (userId: string, action: 'approve' | 'reject' | 'suspend' | 'activate') => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });
      if (res.ok) {
        setStatusFeedbackType('success');
        setStatusFeedbackMessage(`User status updated to ${action}d successfully.`);
        setShowStatusFeedbackModal(true);
        loadUser();
      } else {
        const err = await res.json();
        setStatusFeedbackType('error');
        setStatusFeedbackMessage(err.error || 'Failed to update status.');
        setShowStatusFeedbackModal(true);
      }
    } catch (err) {
      console.error(err);
      setStatusFeedbackType('error');
      setStatusFeedbackMessage('Error updating status.');
      setShowStatusFeedbackModal(true);
    }
  };

  const handleDeleteClick = (target: User) => {
    setUserToDelete(target);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        const res = await fetch(`/api/admin/users?userId=${userToDelete.dbId || userToDelete.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          router.push('/admin/users');
          return;
        }
        const err = await res.json();
        alert(err.error || 'Failed to delete user.');
      } catch (err) {
        console.error(err);
        alert('Error deleting user.');
      }
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  if (loading) return <AdminDetailSkeleton />;

  if (notFound || !user) {
    return (
      <div className="pb-12">
        <Link
          href="/admin/users"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-semibold"
        >
          <span>←</span> Back to Users
        </Link>
        <div className="bg-white rounded-[32px] p-12 border border-gray-100 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-black mb-2">User not found</h1>
          <p className="text-sm text-gray-500">
            This user may have been removed, or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className="pb-12"
      >
        {/* Back Link */}
        <Link
          href="/admin/users"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-semibold"
        >
          <span>←</span> Back to Users
        </Link>

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
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-black">{user.name}</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{user.username}</p>
          </div>

          {/* Right Column: Grid Details & Bio */}
          <div className="flex-1 flex flex-col justify-between pt-2">
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6">
                {/* Display Name */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Display Name</p>
                  <p className="text-sm font-bold text-black mt-1">{user.name}</p>
                </div>

                {/* City */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">City</p>
                  <p className="text-sm font-bold text-black mt-1">{user.city || 'N/A'}</p>
                </div>

                {/* Languages Spoken */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Languages Spoken</p>
                  <p className="text-sm font-bold text-black mt-1">{user.languages || 'N/A'}</p>
                </div>

                {/* Joined Date */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Joined Date</p>
                  <p className="text-sm font-bold text-black mt-1">{user.joinedDate}</p>
                </div>

                {/* Email */}
                <div className="col-span-1">
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-black mt-1 break-all">{user.email}</p>
                </div>

                {/* Country */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Country</p>
                  <p className="text-sm font-bold text-black mt-1">{user.country || 'N/A'}</p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
                  <p className={`text-sm font-black mt-1 ${user.status === 'Active'
                    ? 'text-emerald-500'
                    : user.status === 'Pending'
                      ? 'text-amber-500'
                      : user.status === 'Inactive'
                        ? 'text-rose-500'
                        : 'text-gray-500'
                    }`}>
                    {user.status}
                  </p>
                </div>

                {/* Joined Timing */}
                <div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Joined Timing</p>
                  <p className="text-sm font-bold text-black mt-1">{user.time}</p>
                </div>
              </div>

              {/* Short Bio */}
              <div className="mt-8 pt-6 border-t border-gray-50">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Short Bio</p>
                <p className="text-sm text-gray-600 font-medium leading-relaxed mt-2 max-w-3xl">
                  {user.bio || 'This user has not set a bio yet.'}
                </p>
              </div>
            </div>

            {/* Actions Bar inside details view */}
            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-150">
              {user.status === 'Pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(user.dbId || user.id, 'approve')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    Approve User
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(user.dbId || user.id, 'reject')}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    Reject User
                  </button>
                </>
              )}
              {user.status === 'Active' && (
                <button
                  onClick={() => handleUpdateStatus(user.dbId || user.id, 'suspend')}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Suspend User
                </button>
              )}
              {user.status === 'Suspended' && (
                <button
                  onClick={() => handleUpdateStatus(user.dbId || user.id, 'activate')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Re-activate User
                </button>
              )}
              <button
                onClick={() => handleDeleteClick(user)}
                className="px-5 py-2 border border-rose-200 text-rose-600 rounded-xl text-xs sm:text-sm font-semibold hover:bg-rose-50 transition-all cursor-pointer ml-auto shadow-sm active:scale-95 bg-white"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </motion.div>

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

      {/* Action Status Feedback Modal */}
      <AnimatePresence>
        {showStatusFeedbackModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatusFeedbackModal(false)}
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
                onClick={() => setShowStatusFeedbackModal(false)}
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
                  src={statusFeedbackType === 'success' ? '/assets/booking-confirm.png' : '/assets/cancel-appointment.webp'}
                  alt="Feedback Status"
                  width={240}
                  height={170}
                  className="w-full h-auto object-contain"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 text-center">
                {statusFeedbackType === 'success' ? 'Success!' : 'Error'}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 text-center mb-6 px-4">
                {statusFeedbackMessage}
              </p>

              <button
                onClick={() => setShowStatusFeedbackModal(false)}
                className={`w-full py-2.5 max-w-[300px] text-white rounded-xl text-sm font-semibold transition-all ${statusFeedbackType === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
