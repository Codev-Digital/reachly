'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminRequestsSkeleton } from '@/components/admin/AdminSkeletons';

interface RescheduleRequest {
  id: string;
  bookingRef: string;
  sessionTitle: string;
  sessionNumber?: number;
  scheduledDate: string;
  scheduledTime: string;
  creator: string;
  creatorEmail: string;
  user: string;
  userEmail: string;
  requestedAt: string;
}

export default function AdminRescheduleRequestsPage() {
  const [requests, setRequests] = useState<RescheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/reschedule-requests');
      if (res.ok) setRequests((await res.json()).requests || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unlock = async (bookingId: string) => {
    setBusyId(bookingId);
    setError('');
    try {
      const res = await fetch('/api/admin/reschedule-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== bookingId));
      else setError((await res.json()).error || 'Could not unlock the chat.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <AdminRequestsSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black text-black">Reschedule Requests</h1>
        <p className="text-sm text-gray-500">
          Creators asking to unlock the chat for a package session, so they can agree a new time with the user.
        </p>
      </div>

      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

      {requests.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-sm">
          <p className="text-gray-500 font-semibold">No pending requests.</p>
        </div>
      ) : (
        requests.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between"
          >
            <div className="space-y-1 text-sm">
              <p className="font-bold text-black">
                {r.sessionTitle}
                {r.sessionNumber ? ` · session ${r.sessionNumber}` : ''}{' '}
                <span className="text-gray-400 font-medium">({r.bookingRef})</span>
              </p>
              <p className="text-gray-500">
                <span className="font-semibold">Creator:</span> {r.creator} ({r.creatorEmail})
              </p>
              <p className="text-gray-500">
                <span className="font-semibold">User:</span> {r.user} ({r.userEmail})
              </p>
              <p className="text-gray-500">
                <span className="font-semibold">Scheduled:</span>{' '}
                {new Date(r.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at{' '}
                {r.scheduledTime}
              </p>
            </div>
            <button
              onClick={() => unlock(r.id)}
              disabled={busyId === r.id}
              className="px-6 py-2.5 bg-[#0012FF] hover:bg-[#000EB4] text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 shrink-0"
            >
              {busyId === r.id ? 'Unlocking...' : 'Unlock chat'}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
