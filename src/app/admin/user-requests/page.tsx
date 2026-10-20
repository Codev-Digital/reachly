'use client';

import { useEffect, useState } from 'react';
import { AdminRequestsSkeleton } from '@/components/admin/AdminSkeletons';

interface UserRequest {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export default function AdminUserRequestsPage() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { void loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const res = await fetch('/api/admin/user-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const act = async (requestId: string, action: 'approve' | 'reject') => {
    setActionLoading(requestId);
    try {
      const res = await fetch('/api/admin/user-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((item) => item._id !== requestId));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update request');
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <AdminRequestsSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-black">User Approval Requests</h1>
        <p className="text-sm text-gray-500">Review pending normal user applications separately from creator requests.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-sm">
          <p className="text-gray-500 font-semibold">No user requests found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-black">{req.name}</h2>
                  <p className="text-sm text-gray-500">{req.email}</p>
                </div>
                <span className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold ${req.status === 'pending' ? 'bg-amber-50 text-amber-600' : req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {req.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div><span className="font-semibold">Phone:</span> {req.phone || 'N/A'}</div>
                <div><span className="font-semibold">City:</span> {req.city || 'N/A'}</div>
                <div><span className="font-semibold">Country:</span> {req.country || 'N/A'}</div>
              </div>

              {req.reason && <p className="text-sm text-gray-600 bg-gray-50 rounded-2xl p-4">{req.reason}</p>}

              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => act(req._id, 'reject')}
                  disabled={actionLoading === req._id}
                  className="px-5 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 font-semibold hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => act(req._id, 'approve')}
                  disabled={actionLoading === req._id}
                  className="px-5 py-2 rounded-full bg-[#0012FF] text-white font-semibold disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
