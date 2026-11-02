'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import RichTextContent from '@/components/RichTextContent';
import { AdminDetailSkeleton } from '@/components/admin/AdminSkeletons';
import CreatorStatusActions from '@/components/admin/CreatorStatusActions';
import { Pencil } from 'lucide-react';
import ActionDialog from '@/components/ActionDialog';
import FormInput from '@/components/FormInput';
import { usePreloadImages } from '@/lib/usePreloadImages';

const COMMISSION_DIALOG_IMAGE = '/assets/creator-data.svg';

interface Creator {
  id: string;
  dbId?: string;
  name: string;
  username: string;
  email: string;
  joinedDate: string;
  time: string;
  eventsCreated: string;
  status: 'Active' | 'Pending' | 'Inactive' | 'Suspended' | 'Rejected' | 'Deleted';
  avatar: string;
  city?: string;
  country?: string;
  languages?: string;
  startingPrice?: string;
  onboardingStep?: string;
  niches?: string[];
  bio?: string;
  longBio?: string;
  coverPhoto?: string;
  bannerName?: string;
  bannerNiche?: string;
  bannerContact?: string;
  sessionsCompleted?: number;
  happyUsers?: number;
  totalCategories?: number;
  commissionPercent: number;
  wallet?: {
    availableBalance: number;
    lifetimeEarning: number;
    pendingEarning: number;
    pendingSessionPayments: number;
    pendingEventPayments: number;
    totalPaidOut: number;
  };
}

export default function AdminCreatorDetailPage() {
  const { id } = useParams<{ id: string }>();
  usePreloadImages([COMMISSION_DIALOG_IMAGE]);

  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [commissionInput, setCommissionInput] = useState('');
  const [commissionError, setCommissionError] = useState('');
  const [commissionSaving, setCommissionSaving] = useState(false);

  const loadCreator = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/creators?id=${id}`, { cache: 'no-store' });
      if (res.ok) {
        setCreator((await res.json()).creator);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Failed to load creator:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const openCommissionEditor = () => {
    if (!creator) return;
    setCommissionInput(String(creator.commissionPercent ?? 20));
    setCommissionError('');
    setCommissionOpen(true);
  };

  const saveCommission = async () => {
    const normalizedInput = commissionInput.trim();
    const value = Number(normalizedInput);
    if (!/^(?:\d{1,2}(?:\.\d)?|0\.\d)$/.test(normalizedInput) || !Number.isFinite(value) || value < 0.1 || value > 99) {
      setCommissionError('Enter a commission between 0.1% and 99%, with at most one decimal place.');
      return;
    }
    setCommissionSaving(true);
    setCommissionError('');
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: creator?.dbId, action: 'updateCommission', commissionPercent: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCommissionError(data.error || 'Unable to update commission.');
        return;
      }
      setCreator((current) => current ? { ...current, commissionPercent: Number(data.commissionPercent) } : current);
      setCommissionOpen(false);
      await loadCreator();
    } catch {
      setCommissionError('Unable to update commission. Please try again.');
    } finally {
      setCommissionSaving(false);
    }
  };

  useEffect(() => {
    loadCreator();
  }, [loadCreator]);

  if (loading) return <AdminDetailSkeleton />;

  if (notFound || !creator) {
    return (
      <div className="pb-12">
        <Link
          href="/admin/creators"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-semibold"
        >
          <span>←</span> Back to Creators
        </Link>
        <div className="bg-white rounded-[32px] p-12 border border-gray-100 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-black mb-2">Creator not found</h1>
          <p className="text-sm text-gray-500">
            This creator may have been removed, or the link is incorrect.
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
        href="/admin/creators"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4 font-semibold"
      >
        <span>←</span> Back to Creators
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-sans text-black">
          <span className="text-[#0012FF] font-black">Creator</span> Details{' '}
          <span className="text-gray-400 font-normal text-sm sm:text-base">Account Overview</span>
        </h1>
      </div>

      {/* Premium Creator Detail Card with creator-detail-card.svg background */}
      <div className="relative bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm overflow-hidden z-10">
        {/* <img
          src="/assets/creator-detail-card.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
        /> */}

        {/* Banner Graphic Header */}
        <div className="relative w-full aspect-[1140/320] rounded-2xl overflow-visible mb-12 flex items-center justify-end p-8 sm:p-12 text-white">
          {/* Background Graphic Mockup */}
          <div className="absolute inset-0 bg-black/45 z-0" />
          <img
            src={creator.coverPhoto || "/welcome-creator.png"}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              // Fallback neutral dark gradient if image doesn't load
              (e.target as HTMLImageElement).className = "absolute inset-0 w-full h-full bg-gradient-to-r from-neutral-800 to-neutral-950 z-[-1]";
            }}
          />

          {/* Profile circular overlay positioned inside the banner layout */}
          <div className="absolute left-8 sm:left-1 -bottom-16 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[6px] border-white shadow-lg bg-white z-20 flex-shrink-0">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Text Overlay Details */}
          <div className="relative z-10 text-right max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans leading-tight">
              {creator.bannerName || creator.name}
            </h2>
            <div className="mt-2.5 inline-block px-5 py-1.5 border border-white/40 rounded-full text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-sm">
              {creator.bannerNiche || 'Content Creator'}
            </div>
            <p className="mt-4 text-[10px] sm:text-xs text-white/80 font-bold uppercase tracking-wider">
              {creator.bannerContact || creator.email}
            </p>
          </div>
        </div>

        {/* Profile Name & Social Pills (Aligned below banner) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-20 gap-4 border-b border-gray-50 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl font-black text-black leading-none">{creator.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0012FF] capitalize">
                Influencer
              </span>
            </div>
            <p className="text-sm text-gray-400 font-bold mt-1.5">{creator.username}</p>
          </div>

          {/* Niches List */}
          {creator.niches && creator.niches.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {creator.niches.map((n, i) => {
                const colors = [
                  'bg-rose-50 text-rose-500 border border-rose-100',
                  'bg-emerald-50 text-emerald-500 border border-emerald-100',
                  'bg-amber-50 text-amber-500 border border-amber-100'
                ];
                return (
                  <span
                    key={i}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold capitalize ${colors[i % colors.length]}`}
                  >
                    {n}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Block (Details Grid & Bio) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6">
              {/* Display Name */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Display Name</p>
                <p className="text-sm font-bold text-black mt-1">{creator.name}</p>
              </div>

              {/* City */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">City</p>
                <p className="text-sm font-bold text-black mt-1">{creator.city || 'N/A'}</p>
              </div>

              {/* Languages Spoken */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Languages Spoken</p>
                <p className="text-sm font-bold text-black mt-1">{creator.languages || 'N/A'}</p>
              </div>

              {/* Joined Date */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Joined Date</p>
                <p className="text-sm font-bold text-black mt-1">{creator.joinedDate}</p>
              </div>

              {/* Email */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                <p className="text-sm font-bold text-black mt-1 break-all">{creator.email}</p>
              </div>

              {/* Country */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Country</p>
                <p className="text-sm font-bold text-black mt-1">{creator.country || 'N/A'}</p>
              </div>

              {/* Status */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
                <p className={`text-sm font-black mt-1 ${creator.status === 'Active'
                  ? 'text-[#10B981]'
                  : creator.status === 'Pending'
                    ? 'text-[#F59E0B]'
                    : 'text-rose-500'
                  }`}>
                  {creator.status}
                </p>
              </div>

              {/* Commission */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Platform Commission</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-bold text-black">{creator.commissionPercent ?? 20}%</p>
                  <button
                    type="button"
                    onClick={openCommissionEditor}
                    aria-label="Edit platform commission"
                    className="w-7 h-7 rounded-full bg-blue-50 text-[#0012FF] flex items-center justify-center hover:bg-blue-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>


              {/* Actions */}
              <div className="col-span-2 sm:col-span-4 pt-5 mt-1 border-t border-gray-50">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-3">Actions</p>
                <CreatorStatusActions
                  solid
                  userId={creator.dbId || creator.id}
                  status={creator.status}
                  onChanged={loadCreator}
                />
              </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-col gap-1 border-b border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-950">Creator wallet overview</h3>
                  <p className="mt-1 text-xs text-gray-500">Earnings and payout totals in PKR</p>
                </div>
                <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0012FF]">
                  Financial summary
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-white text-left">
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Wallet metric</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-gray-100">
                    {([
                      { label: 'Available balance', value: creator.wallet?.availableBalance ?? 0, tone: 'text-[#0012FF]' },
                      { label: 'Lifetime earnings', value: creator.wallet?.lifetimeEarning ?? 0, tone: 'text-gray-900' },
                      { label: 'Session pending payments', value: creator.wallet?.pendingSessionPayments ?? 0, tone: 'text-amber-700' },
                      { label: 'Events pending payment', value: creator.wallet?.pendingEventPayments ?? 0, tone: 'text-amber-700' },
                      { label: 'Total paid out', value: creator.wallet?.totalPaidOut ?? 0, tone: 'text-emerald-700' },
                    ]).map((metric) => (
                      <tr key={metric.label} className="transition-colors hover:bg-gray-50/70">
                        <th scope="row" className="px-5 py-3.5 text-left text-sm font-semibold text-gray-600">{metric.label}</th>
                        <td className={`px-5 py-3.5 text-right text-sm font-extrabold tabular-nums ${metric.tone}`}>
                          PKR {metric.value.toLocaleString('en-PK')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Bio Field 1 */}
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Short Bio</p>
              <p className="text-sm text-gray-500 font-bold mt-2">
                {creator.bio || 'No bio provided.'}
              </p>
            </div>

            {/* Bio Field 2 */}
            <div className="pt-2">
              {creator.longBio ? (
                <RichTextContent
                  value={creator.longBio}
                  className="text-xs text-gray-500 font-medium leading-relaxed max-w-4xl"
                />
              ) : (
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-4xl">
                  No detailed bio provided.
                </p>
              )}
            </div>
          </div>

          {/* Right Block (Vertical Stats) */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between items-center gap-6">
            {/* Stat 1 */}
            <div className="text-center w-full">
              <p className="text-4xl font-black text-[#0012FF] leading-none mb-1">{creator.sessionsCompleted ?? 0}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sessions completed</p>
            </div>

            {/* Divider */}
            <div className="w-16 h-[1px] bg-gray-50" />

            {/* Stat 2 */}
            <div className="text-center w-full">
              <p className="text-4xl font-black text-[#10B981] leading-none mb-1">{creator.happyUsers ?? 0}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Happy Users</p>
            </div>

            {/* Divider */}
            <div className="w-16 h-[1px] bg-gray-50" />

            {/* Stat 3 */}
            <div className="text-center w-full">
              <p className="text-4xl font-black text-[#F59E0B] leading-none mb-1">{creator.totalCategories ?? 0}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Categories</p>
            </div>
          </div>
        </div>

        {/* Social Icons Row */}
        <div className="mt-12 flex justify-center items-center gap-4">
          {/* Facebook */}
          <a href="#" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
            </svg>
          </a>

          {/* Instagram */}
          <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFB13B] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          {/* YouTube */}
          <a href="#" className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>

          {/* TikTok */}
          <a href="#" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-.99v6.5c0 1.9-.53 3.86-1.67 5.37-1.43 1.93-3.86 3.1-6.27 3.09-2.91.02-5.74-1.53-7.07-4.12-1.47-2.77-1.12-6.39.88-8.8 1.58-1.94 4.09-2.97 6.57-2.77V11.3c-1.04-.11-2.13.08-3.03.65-.96.6-1.6 1.66-1.72 2.78-.17 1.29.35 2.63 1.34 3.44.96.8 2.29 1.11 3.52.82.99-.21 1.89-.83 2.4-1.71.4-.66.58-1.44.57-2.22V.02z" />
            </svg>
          </a>
        </div>
      </div>

      <ActionDialog
        open={commissionOpen}
        onOpenChange={(open) => {
          if (!open && !commissionSaving) setCommissionOpen(false);
        }}
        // image={{ src: COMMISSION_DIALOG_IMAGE, alt: 'Edit creator commission' }}
        title={<>Edit <span className="text-[#0012FF]">Commission</span></>}
        description="Set the platform commission charged for this creator."
        actions={[
          {
            label: 'Cancel',
            variant: 'outline',
            onClick: () => setCommissionOpen(false),
            disabled: commissionSaving,
            className: 'rounded-full border-gray-200 text-gray-700 hover:bg-gray-50',
          },
          {
            label: commissionSaving ? 'Saving...' : 'Save commission',
            onClick: saveCommission,
            disabled: commissionSaving,
            className: 'rounded-full font-bold',
          },
        ]}
        classNames={{ content: 'sm:max-w-[480px]', description: 'mb-2' }}
      >
        <form
          className="mb-6 w-full text-left"
          onSubmit={(event) => {
            event.preventDefault();
            saveCommission();
          }}
        >
          <FormInput
            id="commission-percent"
            label="Commission percentage"
            type="text"
            inputMode="decimal"
            min="0.1"
            max="99"
            maxLength={4}
            suffix="%"
            value={commissionInput}
            onChange={(event) => {
              setCommissionInput(event.target.value);
              setCommissionError('');
            }}
            error={commissionError}
            placeholder="e.g. 5 or 5.5"
            autoFocus
            disabled={commissionSaving}
          />
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </ActionDialog>
    </motion.div>
  );
}
