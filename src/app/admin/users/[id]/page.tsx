'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AdminDetailSkeleton } from '@/components/admin/AdminSkeletons';
import { usePreloadImages } from '@/lib/usePreloadImages';
import ActionDialog from '@/components/ActionDialog';

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
  usePreloadImages(['/assets/cancel-appointment-sm.webp','/assets/booking-confirm-sm.webp']);
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
      <ActionDialog
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        image={{ src: '/assets/cancel-appointment-sm.webp', alt: 'Delete user' }}
        title="Delete User"
        description={['Are you sure you want to delete this user?', 'This action cannot be undone.']}
        actions={[
          { label: 'Cancel', variant: 'outline', onClick: () => setShowDeleteModal(false) },
          { label: 'Delete User', variant: 'destructive', onClick: handleConfirmDelete },
        ]}
      />

      {/* Action Status Feedback Modal */}
      <ActionDialog
        open={showStatusFeedbackModal}
        onOpenChange={setShowStatusFeedbackModal}
        image={{
          src: statusFeedbackType === 'success' ? '/assets/booking-confirm-sm.webp' : '/assets/cancel-appointment-sm.webp',
          alt: 'Feedback status',
        }}
        title={statusFeedbackType === 'success' ? 'Success!' : 'Error'}
        description={statusFeedbackMessage}
        classNames={{ description: 'px-4', actions: 'justify-center' }}
        actions={[
          {
            label: 'OK',
            variant: statusFeedbackType === 'success' ? 'success' : 'destructive',
            className: 'max-w-[300px]',
            onClick: () => setShowStatusFeedbackModal(false),
          },
        ]}
      />
    </>
  );
}
