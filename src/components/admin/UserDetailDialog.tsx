'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export interface AdminUser {
  id: string;
  dbId?: string;
  name: string;
  username: string;
  email: string;
  joinedDate: string;
  time: string;
  deletedDate?: string;
  deletedTime?: string;
  status: 'Active' | 'Pending' | 'Inactive' | 'Suspended' | 'Rejected' | 'Deleted';
  avatar: string;
  city?: string;
  country?: string;
  phone?: string;
  languages?: string;
  bio?: string;
}

type Action = 'approve' | 'reject' | 'suspend' | 'activate';

const statusColor: Record<AdminUser['status'], string> = {
  Active: 'text-emerald-500',
  Pending: 'text-amber-500',
  Inactive: 'text-rose-500',
  Suspended: 'text-gray-500',
  Rejected: 'text-rose-500',
  Deleted: 'text-red-600',
};

const Field = ({ label, value, className = '' }: { label: string; value?: string; className?: string }) => (
  <div className={className}>
    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
    <p className="text-sm font-bold text-black mt-1 break-words">{value || 'N/A'}</p>
  </div>
);

const btn = 'px-5 py-2 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50';

export default function UserDetailDialog({
  user,
  onClose,
  onAction,
  onDelete,
}: {
  user: AdminUser | null;
  onClose: () => void;
  /** Resolves to an error message, or null on success. */
  onAction: (user: AdminUser, action: Action) => Promise<string | null>;
  onDelete: (user: AdminUser) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (action: Action) => {
    if (!user) return;
    setBusy(true);
    setError('');
    const err = await onAction(user, action);
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => { if (!o) { setError(''); onClose(); } }}>
      <DialogContent className="font-poppins max-w-3xl max-h-[92vh] overflow-y-auto rounded-[32px] p-6 sm:p-8">
        {user && (
          <>
            <DialogTitle className="text-left text-2xl sm:text-3xl font-bold text-black">
              <span className="text-[#0012FF] font-black">User</span> Details
            </DialogTitle>
            <DialogDescription className="text-left text-gray-400 mb-6">Account overview</DialogDescription>

            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="flex flex-col items-center text-center sm:border-r sm:border-gray-100 sm:pr-8 shrink-0">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-100 mb-3">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <h2 className="text-lg font-bold text-black">{user.name}</h2>
                <p className="text-sm text-gray-400 font-medium">{user.username}</p>
                <p className={`text-sm font-black mt-2 ${statusColor[user.status]}`}>{user.status}</p>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-5 content-start">
                <Field label="Email" value={user.email} className="col-span-2" />
                <Field label="Phone" value={user.phone} />
                <Field label="City" value={user.city} />
                <Field label="Country" value={user.country} />
                <Field label="Joined" value={user.joinedDate} />
                <div className="col-span-2 pt-4 border-t border-gray-50">
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Reason for joining</p>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed mt-1">
                    {user.bio || 'No reason provided.'}
                  </p>
                </div>
              </div>
            </div>

            {error && <p className="mt-4 text-xs font-semibold text-rose-600">{error}</p>}

            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-100">
              {user.status === 'Pending' && (
                <>
                  <button disabled={busy} onClick={() => run('approve')} className={`${btn} bg-emerald-600 hover:bg-emerald-700`}>
                    Approve User
                  </button>
                  <button disabled={busy} onClick={() => run('reject')} className={`${btn} bg-rose-600 hover:bg-rose-700`}>
                    Reject User
                  </button>
                </>
              )}
              {user.status === 'Active' && (
                <button disabled={busy} onClick={() => run('suspend')} className={`${btn} bg-amber-600 hover:bg-amber-700`}>
                  Suspend User
                </button>
              )}
              {(user.status === 'Suspended' || user.status === 'Rejected' || user.status === 'Deleted') && (
                <button disabled={busy} onClick={() => run('activate')} className={`${btn} bg-emerald-600 hover:bg-emerald-700`}>
                  {user.status === 'Deleted' ? 'Restore User' : 'Re-activate User'}
                </button>
              )}
              {user.status !== 'Deleted' && (

                <button

                  disabled={busy}

                  onClick={() => onDelete(user)}

                  className="px-5 py-2 bg-red-50 border border-red-200 text-red-600 rounded-full text-xs sm:text-sm font-semibold hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer ml-auto"

                >

                  Delete Account

                </button>

              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
