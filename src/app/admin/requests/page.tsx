'use client';

import { useEffect, useState } from 'react';

interface RequestItem {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  profile?: {
    displayName: string;
    username: string;
    profilePhoto: string;
    niches: string[];
    city: string;
    country: string;
  };
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });
      if (res.ok) {
        // Remove from list
        setRequests(prev => prev.filter(r => r._id !== userId));
      } else {
        alert('Failed to process action');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-[#C8A97E] font-serif text-lg animate-pulse">Loading requests...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#F9F6F2] mb-2">Creator Requests</h1>
          <p className="font-sans text-sm text-[#F9F6F2] opacity-70">
            Review and approve new creator applications
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-[rgba(200,169,126,0.05)] rounded-full flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-semibold text-[#F9F6F2] mb-2">No pending requests</h3>
          <p className="font-sans text-sm text-[#F9F6F2] opacity-50">All caught up! There are no creators waiting for approval.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <div key={req._id} className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
              
              {/* Profile Image & Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-full bg-[#0C0C0C] border border-[rgba(200,169,126,0.2)] overflow-hidden flex-shrink-0">
                  <img 
                    src={req.profile?.profilePhoto || '/Group 2085668106.png'} 
                    alt={req.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/Group 2085668106.png'; }}
                  />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#F9F6F2]">
                    {req.profile?.displayName || req.name}
                  </h3>
                  <p className="font-sans text-sm text-[#C8A97E]">@{req.profile?.username || 'username'}</p>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mt-1">{req.email}</p>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="1.5" className="opacity-50">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="font-sans text-sm text-[#F9F6F2] opacity-70">
                    {[req.profile?.city, req.profile?.country].filter(Boolean).join(', ') || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F9F6F2" strokeWidth="1.5" className="opacity-50">
                    <path d="M20 7h-3V4c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-9-3h2v3h-2V4z" />
                  </svg>
                  <div className="flex gap-1 flex-wrap">
                    {req.profile?.niches?.length ? req.profile.niches.map((n, i) => (
                      <span key={i} className="bg-[rgba(200,169,126,0.1)] text-[#C8A97E] px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                        {n}
                      </span>
                    )) : (
                      <span className="font-sans text-sm text-[#F9F6F2] opacity-70">No niches added</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleAction(req._id, 'reject')}
                  disabled={actionLoading === req._id}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-red-900/50 text-red-400 font-sans text-sm hover:bg-red-900/10 transition-all disabled:opacity-50"
                >
                  {actionLoading === req._id ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleAction(req._id, 'approve')}
                  disabled={actionLoading === req._id}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-[#C8A97E] text-[#0C0C0C] font-semibold font-sans text-sm hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {actionLoading === req._id ? 'Processing...' : 'Approve'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
