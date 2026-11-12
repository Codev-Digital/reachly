'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface SupportItem {
  id: string;
  ticketRef: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export default function AdminSupportPage() {
  const [messages, setMessages] = useState<SupportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/support', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load support messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const toggleStatus = async (item: SupportItem) => {
    const nextStatus = item.status === 'resolved' ? 'open' : 'resolved';
    setUpdatingId(item.id);
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: nextStatus }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === item.id ? { ...m, status: nextStatus } : m))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (filter !== 'all' && m.status !== filter) return false;
      if (!q) return true;
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.ticketRef.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [messages, filter, search]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="pb-12"
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-gray-500 font-sans text-sm sm:text-base mb-1">Customer Queries</p>
          <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
            <span className="text-[#0012FF] font-black">Support</span> Inbox{' '}
            <span className="text-gray-400 font-normal text-sm sm:text-base">
              {messages.filter((m) => m.status === 'open').length} open
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queries..."
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0012FF]"
          />
          {(['all', 'open', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-[#0012FF] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center text-sm font-semibold text-gray-400">
            Loading support queries...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-gray-100 text-center text-sm font-semibold text-gray-400">
            No support messages match your filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#0012FF]">
                      {item.ticketRef}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {item.status === 'resolved' ? 'Resolved' : 'Open'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{item.subject}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    From <span className="font-semibold text-gray-800">{item.fullName}</span> (
                    <a href={`mailto:${item.email}`} className="text-[#0012FF] hover:underline">
                      {item.email}
                    </a>
                    )
                  </p>
                </div>

                <button
                  type="button"
                  disabled={updatingId === item.id}
                  onClick={() => toggleStatus(item)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                    item.status === 'resolved'
                      ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {updatingId === item.id
                    ? 'Saving...'
                    : item.status === 'resolved'
                      ? 'Re-open'
                      : 'Mark Resolved'}
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                {item.message}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
