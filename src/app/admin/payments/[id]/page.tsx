'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AdminDetailSkeleton } from '@/components/admin/AdminSkeletons';

interface Payment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  creator: {
    name: string;
    username: string;
    avatar: string;
  };
  paymentMethod: string;
  date: string;
  time: string;
  amount: string;
  platformFee: string;
  creatorEarnings: string;
  status: 'Completed' | 'Pending' | 'Refunded';
}

export default function AdminPaymentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/payments?id=${id}`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setPayment(data.payment);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load payment:', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <AdminDetailSkeleton />;

  if (notFound || !payment) {
    return (
      <div className="pb-12">
        <Link
          href="/admin/payments"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-semibold"
        >
          <span>←</span> Back to Payments
        </Link>
        <div className="bg-white rounded-[32px] p-12 border border-gray-100 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-black mb-2">Payment not found</h1>
          <p className="text-sm text-gray-500">
            This payment may have been removed, or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="pb-12"
    >
      {/* Back Link */}
      <Link
        href="/admin/payments"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-semibold"
      >
        <span>←</span> Back to Payments
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
          <span className="text-[#0012FF] font-black">Payment</span> Details{' '}
          <span className="text-gray-400 font-normal text-sm sm:text-base">Overview</span>
        </h1>
      </div>

      {/* Payment Detail Card */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">

        {/* Creator Profile (Left) */}
        <div className="flex flex-col items-center text-center md:border-r md:border-gray-100 md:pr-12 flex-shrink-0 w-full md:w-auto">
          <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-100 mb-4 shadow-sm">
            <img
              src={payment.creator.avatar}
              alt={payment.creator.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-lg font-bold text-black">{payment.creator.name}</h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{payment.creator.username}</p>
          <span className="mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
            Creator
          </span>
        </div>

        {/* Details (Middle) */}
        <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Payment Method</p>
            <p className="text-sm font-bold text-black mt-1">{payment.paymentMethod}</p>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Platform Fee</p>
            <p className="text-sm font-bold text-black mt-1">{payment.platformFee}</p>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
            <p className={`text-sm font-black mt-1 ${payment.status === 'Completed'
              ? 'text-emerald-500'
              : payment.status === 'Pending'
                ? 'text-amber-500'
                : 'text-rose-500'
              }`}>
              {payment.status}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Amount</p>
            <p className="text-sm font-bold text-black mt-1">{payment.amount}</p>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date</p>
            <p className="text-sm font-bold text-black mt-1">{payment.date}</p>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Creator Earnings</p>
            <p className="text-sm font-bold text-black mt-1">{payment.creatorEarnings}</p>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Time</p>
            <p className="text-sm font-bold text-black mt-1">{payment.time}</p>
          </div>
        </div>

        {/* User Profile (Right) */}
        <div className="flex flex-col items-center text-center md:border-l md:border-gray-100 md:pl-12 flex-shrink-0 w-full md:w-auto">
          <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-100 mb-4 shadow-sm">
            <img
              src={payment.user.avatar}
              alt={payment.user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-lg font-bold text-black">{payment.user.name}</h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{payment.user.username}</p>
          <span className="mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-[#E6F0FA] text-blue-500">
            User
          </span>
        </div>

      </div>
    </motion.div>
  );
}
