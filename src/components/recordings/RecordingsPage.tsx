'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Film, FileText, RefreshCw, Calendar, Clock, User } from 'lucide-react';

type RecordingItem = {
  id: string;
  bookingRef: string;
  status: string;
  creatorName: string;
  creatorUsername?: string;
  creatorPhoto?: string;
  userName: string;
  userEmail?: string;
  userPhoto?: string;
  sessionTitle: string;
  sessionDurationMins: number;
  scheduledDate?: string;
  scheduledTime?: string;
  purchasedAt?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  finalPrice?: number;
  meetingStartedAt?: string;
  meetingEndedAt?: string;
  durationSeconds?: number;
  videoUrl?: string;
  transcriptUrl?: string;
  transcriptText?: string;
  error?: string;
  createdAt?: string;
};

function formatWhen(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatDuration(sec?: number) {
  if (!sec || sec < 1) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

const statusStyles: Record<string, string> = {
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  recording: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-gray-50 text-gray-600 border-gray-200',
  failed: 'bg-red-50 text-red-600 border-red-200',
};

export default function RecordingsPage({
  role,
  backHref,
  apiUrl = '/api/recordings',
}: {
  role: 'user' | 'creator' | 'admin';
  backHref: string;
  apiUrl?: string;
}) {
  const [items, setItems] = useState<RecordingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not load recordings');
        setItems([]);
        return;
      }
      setItems(data.recordings || []);
    } catch {
      setError('Network error loading recordings');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshOne = async (id: string) => {
    setRefreshingId(id);
    try {
      await fetch(`/api/recordings/${id}/refresh`, { method: 'POST' });
      await load();
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href={backHref} className="text-sm font-semibold text-gray-500 hover:text-gray-800">
            ← Back
          </Link>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-black tracking-tight">
            Meeting <span className="text-[#0012FF]">Recordings</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {role === 'admin'
              ? 'All meeting cloud recordings across creators and clients.'
              : role === 'creator'
                ? 'Cloud recordings of sessions you hosted, with purchase and call metadata.'
                : 'Recordings of sessions you booked, with purchase and call metadata.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-full border border-[#e2e2e2] bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh list
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse border border-[#e2e2e2]" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-[#e2e2e2] bg-white p-12 text-center">
          <Film className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-bold text-gray-800">No recordings yet</p>
          <p className="text-sm text-gray-500 mt-1">
            When a meeting ends, its cloud recording appears here after Daily finishes processing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((r) => {
            const peerName =
              role === 'creator' ? r.userName : role === 'admin' ? r.creatorName : r.creatorName;
            const peerPhoto =
              role === 'creator' ? r.userPhoto : role === 'admin' ? r.creatorPhoto : r.creatorPhoto;
            const expanded = expandedId === r.id;

            return (
              <div
                key={r.id}
                className="rounded-2xl border border-[#e2e2e2] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-[#e2e2e2]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={peerPhoto || '/avatar.png'}
                        alt={peerName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-black truncate">{r.sessionTitle}</h2>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                            statusStyles[r.status] || statusStyles.pending
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {role === 'admin'
                          ? `${r.creatorName}${r.creatorUsername ? ` (@${r.creatorUsername})` : ''} ↔ ${r.userName}`
                          : role === 'creator'
                            ? `Client: ${r.userName}`
                            : `Creator: ${r.creatorName}`}
                        {role === 'user' && r.creatorUsername ? ` (@${r.creatorUsername})` : ''}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {r.scheduledTime
                            ? `${formatWhen(r.scheduledDate).split(',')[0]} · ${r.scheduledTime}`
                            : formatWhen(r.scheduledDate)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Call {formatDuration(r.durationSeconds)} · Session {r.sessionDurationMins}m
                        </span>
                        <span>Ref {r.bookingRef}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {r.videoUrl ? (
                      <a
                        href={r.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0012FF] px-4 py-2 text-xs font-bold text-white hover:bg-[#0010d0]"
                      >
                        <Film className="w-3.5 h-3.5" />
                        Watch
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void refreshOne(r.id)}
                        disabled={refreshingId === r.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e2e2] px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${refreshingId === r.id ? 'animate-spin' : ''}`}
                        />
                        Check status
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : r.id)}
                      className="rounded-full border border-[#e2e2e2] px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {expanded ? 'Hide details' : 'Details'}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#e2e2e2] pt-4 text-xs text-gray-600">
                    <div className="rounded-xl bg-[#F8F8FA] p-3">
                      <p className="font-bold text-gray-900 mb-1">Purchase</p>
                      <p>Bought: {formatWhen(r.purchasedAt)}</p>
                      <p>
                        Paid: {r.paymentStatus || '—'}
                        {r.finalPrice != null ? ` · PKR ${Number(r.finalPrice).toLocaleString()}` : ''}
                      </p>
                      <p>Method: {r.paymentMethod || '—'}</p>
                    </div>
                    <div className="rounded-xl bg-[#F8F8FA] p-3">
                      <p className="font-bold text-gray-900 mb-1">Meeting</p>
                      <p>Started: {formatWhen(r.meetingStartedAt)}</p>
                      <p>Ended: {formatWhen(r.meetingEndedAt)}</p>
                      <p>
                        Parties: {r.creatorName} ↔ {r.userName}
                        {r.userEmail ? ` (${r.userEmail})` : ''}
                      </p>
                    </div>
                    {(r.transcriptUrl || r.transcriptText) && (
                      <div className="sm:col-span-2 rounded-xl bg-[#F8F8FA] p-3">
                        <p className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Transcript
                        </p>
                        {r.transcriptUrl && (
                          <a
                            href={r.transcriptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0012FF] font-semibold hover:underline"
                          >
                            Download transcript
                          </a>
                        )}
                        {r.transcriptText && (
                          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-white border border-[#e2e2e2] p-3 text-[11px] text-gray-700">
                            {r.transcriptText.slice(0, 8000)}
                          </pre>
                        )}
                      </div>
                    )}
                    {r.videoUrl && (
                      <div className="sm:col-span-2">
                        <video
                          src={r.videoUrl}
                          controls
                          className="w-full max-h-[420px] rounded-xl bg-black"
                        />
                      </div>
                    )}
                    {r.error && r.status === 'failed' && (
                      <p className="sm:col-span-2 text-red-600">{r.error}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
