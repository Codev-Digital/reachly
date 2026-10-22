'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import AdminReviewReportCard, {
  type AdminReviewReportItem,
} from '@/components/admin/AdminReviewReportCard';

export default function ReviewsPage() {
  const [filter, setFilter] = useState<'pending' | 'all' | 'verified' | 'dismissed'>('pending');
  const [reports, setReports] = useState<AdminReviewReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${filter}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Could not load reports.');
        return;
      }
      setReports(data.reports || []);
      setTotal(Number(data.total) || (data.reports || []).length);
    } catch (err) {
      console.error(err);
      toast.error('Could not load reports.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="pb-12"
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
            Review <span className="text-[#0012FF] font-black">Reports</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 font-sans">
            Review creator reports of client feedback
            {total > 0 ? <span className="text-gray-400"> · {total} total</span> : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['pending', 'verified', 'dismissed', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-[#0012FF] text-white shadow-sm shadow-[#0012FF]/20'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="min-h-[220px] animate-pulse rounded-[8px] border border-gray-100 bg-[#F8F8FA]"
              />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F8F8FA] px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-600">
              No {filter === 'all' ? '' : `${filter} `}reports
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Reported reviews from creators will show up here for moderation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((rep, idx) => (
              <AdminReviewReportCard
                key={rep.id}
                report={rep}
                commaIdx={idx}
                showActions={rep.status === 'pending'}
                onResolved={() => void loadReports()}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
