'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Creator {
  _id: string;
  name: string;
  email: string;
  approvalStatus: string;
  onboardingStep: number;
  createdAt: string;
  sessionCount: number;
  startingPrice: number;
  profile: {
    displayName: string;
    username: string;
    profilePhoto: string;
    niches: string[];
    city: string;
    country: string;
    shortBio: string;
    isProfileComplete: boolean;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  approved: { label: 'Approved', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  pending:  { label: 'Pending',  color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  none:     { label: 'Incomplete', color: 'text-[#F9F6F2]', bg: 'bg-white/5', border: 'border-white/10' },
};

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const res = await fetch('/api/admin/creators');
      if (res.ok) {
        const data = await res.json();
        setCreators(data.creators || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, action: 'approve' | 'reject') => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) {
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        setCreators(prev => prev.map(c => c._id === userId ? { ...c, approvalStatus: newStatus } : c));
        if (selectedCreator?._id === userId) {
          setSelectedCreator(prev => prev ? { ...prev, approvalStatus: newStatus } : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = ['All', 'Approved', 'Pending', 'Rejected', 'Incomplete'];

  const filtered = creators.filter(c => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Approved') return c.approvalStatus === 'approved';
    if (activeTab === 'Pending') return c.approvalStatus === 'pending';
    if (activeTab === 'Rejected') return c.approvalStatus === 'rejected';
    if (activeTab === 'Incomplete') return c.approvalStatus === 'none';
    return true;
  });

  const counts = {
    All: creators.length,
    Approved: creators.filter(c => c.approvalStatus === 'approved').length,
    Pending: creators.filter(c => c.approvalStatus === 'pending').length,
    Rejected: creators.filter(c => c.approvalStatus === 'rejected').length,
    Incomplete: creators.filter(c => c.approvalStatus === 'none').length,
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col lg:flex-row gap-6 w-full"
    >
      <div className={`flex-1 ${selectedCreator ? 'lg:pr-2' : ''}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#F9F6F2]">Creators</h1>
            <p className="font-sans text-sm text-[#F9F6F2] opacity-60 mt-1">
              Manage creator accounts and approvals
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-sans whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-[rgba(200,169,126,0.15)] border border-[rgba(200,169,126,0.4)] text-[#C8A97E]'
                  : 'bg-[#141414] border border-[rgba(200,169,126,0.2)] text-[#F9F6F2] opacity-70 hover:opacity-100'
              }`}
            >
              {tab}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab ? 'bg-[rgba(200,169,126,0.3)] text-[#C8A97E]' : 'bg-white/10 text-[#F9F6F2]'
              }`}>
                {counts[tab as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-12 text-center">
            <p className="text-[#C8A97E] font-serif text-lg animate-pulse">Loading creators...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-[rgba(200,169,126,0.05)] rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6" /><path d="M23 11h-6" />
              </svg>
            </div>
            <p className="font-sans text-sm text-[#F9F6F2] opacity-50">No creators found in this category.</p>
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,20,0.5)]">
                    {['Creator', 'Niches', 'Sessions', 'Starting Price', 'Status', 'Actions'].map(header => (
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
                  {filtered.map((creator, index) => {
                    const statusCfg = STATUS_CONFIG[creator.approvalStatus] || STATUS_CONFIG.none;
                    const displayName = creator.profile?.displayName || creator.name;
                    const username = creator.profile?.username;
                    const photo = creator.profile?.profilePhoto;

                    return (
                      <motion.tr
                        key={creator._id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + index * 0.03 }}
                        onClick={() => setSelectedCreator(selectedCreator?._id === creator._id ? null : creator)}
                        className={`border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(200,169,126,0.05)] cursor-pointer transition-colors ${
                          selectedCreator?._id === creator._id ? 'bg-[rgba(200,169,126,0.08)]' : ''
                        }`}
                      >
                        {/* Creator */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0C0C0C] border border-[rgba(200,169,126,0.2)] flex-shrink-0">
                              {photo ? (
                                <img
                                  src={photo}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/Group 2085668106.png'; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#C8A97E] font-serif text-sm font-bold">
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-sans text-sm text-[#F9F6F2] font-medium">{displayName}</p>
                              {username && (
                                <p className="font-sans text-xs text-[#C8A97E] opacity-70">@{username}</p>
                              )}
                              <p className="font-sans text-xs text-[#F9F6F2] opacity-40">{creator.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Niches */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {creator.profile?.niches?.length ? (
                              creator.profile.niches.slice(0, 2).map((n, i) => (
                                <span key={i} className="bg-[rgba(200,169,126,0.1)] text-[#C8A97E] px-2 py-0.5 rounded text-[10px] capitalize">
                                  {n}
                                </span>
                              ))
                            ) : (
                              <span className="font-sans text-xs text-[#F9F6F2] opacity-40">—</span>
                            )}
                          </div>
                        </td>

                        {/* Sessions */}
                        <td className="py-4 px-4">
                          <span className="font-sans text-sm text-[#F9F6F2] opacity-70">{creator.sessionCount}</span>
                        </td>

                        {/* Starting Price */}
                        <td className="py-4 px-4">
                          <span className="font-sans text-sm text-[#C8A97E] font-semibold">
                            {creator.startingPrice > 0 ? `PKR ${creator.startingPrice.toLocaleString()}` : '—'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={`font-sans text-xs px-2.5 py-1 rounded-full border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                          {creator.approvalStatus === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproval(creator._id, 'approve')}
                                disabled={actionLoading === creator._id}
                                className="px-3 py-1.5 rounded-lg bg-green-900/10 border border-green-500/30 text-green-400 text-xs font-sans hover:bg-green-900/20 transition-all disabled:opacity-50"
                              >
                                {actionLoading === creator._id ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleApproval(creator._id, 'reject')}
                                disabled={actionLoading === creator._id}
                                className="px-3 py-1.5 rounded-lg bg-red-900/10 border border-red-500/30 text-red-400 text-xs font-sans hover:bg-red-900/20 transition-all disabled:opacity-50"
                              >
                                {actionLoading === creator._id ? '...' : 'Reject'}
                              </button>
                            </div>
                          )}
                          {creator.approvalStatus === 'approved' && (
                            <button
                              onClick={() => handleApproval(creator._id, 'reject')}
                              disabled={actionLoading === creator._id}
                              className="px-3 py-1.5 rounded-lg bg-red-900/10 border border-red-500/30 text-red-400 text-xs font-sans hover:bg-red-900/20 transition-all disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          )}
                          {creator.approvalStatus === 'rejected' && (
                            <button
                              onClick={() => handleApproval(creator._id, 'approve')}
                              disabled={actionLoading === creator._id}
                              className="px-3 py-1.5 rounded-lg bg-green-900/10 border border-green-500/30 text-green-400 text-xs font-sans hover:bg-green-900/20 transition-all disabled:opacity-50"
                            >
                              Re-approve
                            </button>
                          )}
                          {creator.approvalStatus === 'none' && (
                            <span className="font-sans text-xs text-[#F9F6F2] opacity-30">Incomplete</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Creator Detail Panel */}
      <AnimatePresence>
        {selectedCreator && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="w-full lg:w-[340px] flex-shrink-0 bg-[#141414] border border-[rgba(200,169,126,0.2)] rounded-xl p-6 sticky top-6 h-fit"
          >
            {/* Close */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-lg font-bold text-[#F9F6F2]">Creator Details</h3>
              <button onClick={() => setSelectedCreator(null)} className="text-[#F9F6F2] opacity-50 hover:opacity-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Photo + Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[#0C0C0C] border border-[rgba(200,169,126,0.2)] flex-shrink-0">
                {selectedCreator.profile?.profilePhoto ? (
                  <img
                    src={selectedCreator.profile.profilePhoto}
                    alt={selectedCreator.profile.displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/Group 2085668106.png'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#C8A97E] font-serif text-xl font-bold">
                    {(selectedCreator.profile?.displayName || selectedCreator.name).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-serif text-xl font-bold text-[#F9F6F2]">
                  {selectedCreator.profile?.displayName || selectedCreator.name}
                </h4>
                {selectedCreator.profile?.username && (
                  <p className="font-sans text-sm text-[#C8A97E]">@{selectedCreator.profile.username}</p>
                )}
                <p className="font-sans text-xs text-[#F9F6F2] opacity-50">{selectedCreator.email}</p>
              </div>
            </div>

            {/* Bio */}
            {selectedCreator.profile?.shortBio && (
              <div className="bg-[#0C0C0C] border border-[rgba(200,169,126,0.1)] rounded-xl p-4 mb-4">
                <p className="font-sans text-sm text-[#F9F6F2] opacity-70 leading-relaxed">{selectedCreator.profile.shortBio}</p>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.15)] rounded-xl p-3">
                <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-1">Status</p>
                <span className={`font-sans text-xs px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selectedCreator.approvalStatus]?.color} ${STATUS_CONFIG[selectedCreator.approvalStatus]?.bg} ${STATUS_CONFIG[selectedCreator.approvalStatus]?.border}`}>
                  {STATUS_CONFIG[selectedCreator.approvalStatus]?.label}
                </span>
              </div>
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.15)] rounded-xl p-3">
                <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-1">Location</p>
                <p className="font-sans text-sm text-[#F9F6F2]">
                  {[selectedCreator.profile?.city, selectedCreator.profile?.country].filter(Boolean).join(', ') || '—'}
                </p>
              </div>
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.15)] rounded-xl p-3">
                <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-1">Sessions</p>
                <p className="font-sans text-sm text-[#F9F6F2] font-semibold">{selectedCreator.sessionCount}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.15)] rounded-xl p-3">
                <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-1">Starting Price</p>
                <p className="font-sans text-sm text-[#C8A97E] font-semibold">
                  {selectedCreator.startingPrice > 0 ? `PKR ${selectedCreator.startingPrice.toLocaleString()}` : '—'}
                </p>
              </div>
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.15)] rounded-xl p-3">
                <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-1">Onboarding Step</p>
                <p className="font-sans text-sm text-[#F9F6F2]">{selectedCreator.onboardingStep} / 7</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.15)] rounded-xl p-3">
                <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-1">Profile Complete</p>
                <p className="font-sans text-sm text-[#F9F6F2]">{selectedCreator.profile?.isProfileComplete ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {/* Niches */}
            {selectedCreator.profile?.niches?.length ? (
              <div className="mb-5">
                <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-2">Niches</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCreator.profile.niches.map((n, i) => (
                    <span key={i} className="bg-[rgba(200,169,126,0.12)] text-[#C8A97E] px-2.5 py-1 rounded-full text-xs capitalize">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Approval Actions */}
            {selectedCreator.approvalStatus === 'pending' && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleApproval(selectedCreator._id, 'approve')}
                  disabled={actionLoading === selectedCreator._id}
                  className="w-full py-3 rounded-xl bg-green-900/10 border border-green-500/30 text-green-400 font-sans text-sm hover:bg-green-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {actionLoading === selectedCreator._id ? 'Processing...' : 'Approve Creator'}
                </button>
                <button
                  onClick={() => handleApproval(selectedCreator._id, 'reject')}
                  disabled={actionLoading === selectedCreator._id}
                  className="w-full py-3 rounded-xl bg-red-900/10 border border-red-500/30 text-red-400 font-sans text-sm hover:bg-red-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {actionLoading === selectedCreator._id ? 'Processing...' : 'Reject Creator'}
                </button>
              </div>
            )}
            {selectedCreator.approvalStatus === 'approved' && (
              <button
                onClick={() => handleApproval(selectedCreator._id, 'reject')}
                disabled={actionLoading === selectedCreator._id}
                className="w-full py-3 rounded-xl bg-red-900/10 border border-red-500/30 text-red-400 font-sans text-sm hover:bg-red-900/20 transition-all disabled:opacity-50"
              >
                {actionLoading === selectedCreator._id ? 'Processing...' : 'Revoke Approval'}
              </button>
            )}
            {selectedCreator.approvalStatus === 'rejected' && (
              <button
                onClick={() => handleApproval(selectedCreator._id, 'approve')}
                disabled={actionLoading === selectedCreator._id}
                className="w-full py-3 rounded-xl bg-green-900/10 border border-green-500/30 text-green-400 font-sans text-sm hover:bg-green-900/20 transition-all disabled:opacity-50"
              >
                {actionLoading === selectedCreator._id ? 'Processing...' : 'Re-approve Creator'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
