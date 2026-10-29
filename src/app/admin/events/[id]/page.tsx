'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  MapPin,
  Ticket,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import ActionDialog from '@/components/ActionDialog';
import { formatEventCardDate, formatEventCardTime } from '@/lib/eventDisplay';
import { isRichTextEmpty } from '@/lib/richText';
import { cn } from '@/lib/cn';

interface EventTier {
  title: string;
  price: number;
  persons?: number;
  quantity?: number;
}

interface EventDate {
  date: string;
  startHour?: string;
  startMinute?: string;
  startPeriod?: string;
  endHour?: string;
  endMinute?: string;
  endPeriod?: string;
  tiers?: EventTier[];
}

interface EventBuyer {
  id: string;
  name: string;
  email: string;
  date: string;
  tier: string;
  quantity: number;
  seats: number;
  amount: number;
  purchasedAt: string;
  ticketRef: string;
}

interface EventDetail {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  category: string;
  status: 'draft' | 'published' | 'cancelled';
  dates: EventDate[];
  refundPolicy: string;
  termsAndConditions: string;
  creator: {
    id: string;
    displayName: string;
    username: string;
    profilePhoto?: string | null;
    shortBio?: string;
    city?: string;
    country?: string;
  } | null;
  stats: {
    totalBuyers: number;
    totalPurchases: number;
    totalTicketsSold: number;
    totalSeats: number;
    totalRevenue: number;
    buyers: EventBuyer[];
  };
}

const TIER_STYLES = [
  { bg: 'bg-[#FFE4EC]', text: 'text-[#C2185B]', label: 'text-[#AD1457]/80' },
  { bg: 'bg-[#FFF3C4]', text: 'text-[#F57F17]', label: 'text-[#E65100]/80' },
  { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', label: 'text-[#1B5E20]/80' },
];

export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = typeof params.id === 'string' ? params.id : '';
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [pendingAction, setPendingAction] = useState<'hide' | 'show' | 'delete' | null>(null);
  const [savingAction, setSavingAction] = useState(false);
  const salesRef = useRef<HTMLElement>(null);
  const activeDate = event?.dates[selectedDateIndex];
  const tiers = activeDate?.tiers || [];

  useEffect(() => {
    let active = true;
    if (!eventId) return () => { active = false; };

    fetch(`/api/admin/events/${eventId}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load event.');
        return data;
      })
      .then((data) => {
        if (!active) return;
        setEvent(data.event);
        const initialDate = (data.event.dates || []).findIndex((date: EventDate) => (date.tiers || []).length > 0);
        setSelectedDateIndex(initialDate >= 0 ? initialDate : 0);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error('[Admin event] failed to load:', error);
        toast.error(error instanceof Error ? error.message : 'Unable to load event.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [eventId]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !savingAction) setPendingAction(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [savingAction]);

  const confirmAction = async () => {
    if (!pendingAction || !event || savingAction) return;
    setSavingAction(true);
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: pendingAction === 'delete' ? 'DELETE' : 'PATCH',
        ...(pendingAction === 'delete'
          ? {}
          : {
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: pendingAction }),
            }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to complete event action.');
      if (pendingAction === 'delete') {
        toast.success('Event deleted.');
        router.push('/admin/bookings');
        return;
      }
      setEvent((current) => current
        ? { ...current, status: pendingAction === 'hide' ? 'draft' : 'published' }
        : current);
      toast.success(pendingAction === 'hide' ? 'Event hidden.' : 'Event unhidden.');
      setPendingAction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to complete event action.');
    } finally {
      setSavingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full animate-pulse space-y-5">
        <div className="h-10 w-40 rounded-xl bg-gray-200" />
        <div className="grid gap-5 rounded-2xl border border-gray-200 bg-white p-5 lg:grid-cols-2">
          <div className="h-72 rounded-xl bg-gray-200" />
          <div className="h-72 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900">Event not found</h1>
        <p className="mt-2 text-sm text-gray-500">The event may have been deleted or is no longer available.</p>
        <Link href="/admin/bookings" className="mt-5 inline-flex rounded-lg bg-[#0012FF] px-4 py-2.5 text-sm font-semibold text-white">
          Back to events
        </Link>
      </div>
    );
  }

  const creatorLocation = [event.creator?.city, event.creator?.country].filter(Boolean).join(', ');

  return (
    <div className="w-full pb-12">
      <Link href="/admin/bookings" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#0012FF]">
        <ArrowLeft size={16} /> Back to events
      </Link>

      <section className="overflow-hidden rounded-[8px] border border-[#e2e2e2] bg-white shadow-sm">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[240px] bg-gray-100 lg:min-h-[340px]">
            {event.bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.bannerUrl} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0012FF] via-[#1732b8] to-[#0d1248]" />
            )}
          </div>

          <div className="flex flex-col p-5 sm:p-7 lg:p-9">
            <div className="flex flex-wrap items-center gap-2">
              {event.category && (
                <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0012FF]">{event.category}</span>
              )}
              <span className={cn(
                'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide',
                event.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
              )}>
                {event.status === 'published' ? 'Published' : event.status === 'draft' ? 'Hidden' : 'Cancelled'}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-black sm:text-3xl lg:text-4xl">{event.title}</h1>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-gray-600">
              <span className="inline-flex items-center gap-1.5"><Calendar size={14} className="text-[#0012FF]" />{formatEventCardDate(activeDate?.date)}</span>
              <span className="inline-flex items-center gap-1.5"><Clock size={14} className="text-[#0012FF]" />{formatEventCardTime(activeDate)}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-[#0012FF]" />{creatorLocation || event.category || 'Location TBA'}</span>
            </div>

            {!!event.dates.length && (
              <div className="mt-5 flex flex-wrap gap-2">
                {event.dates.map((date, index) => (
                  <button
                    key={`${date.date}-${index}`}
                    type="button"
                    onClick={() => setSelectedDateIndex(index)}
                    aria-pressed={selectedDateIndex === index}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                      selectedDateIndex === index
                        ? 'border-[#0012FF] bg-[#0012FF] text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-[#0012FF]/50'
                    )}
                  >
                    {formatEventCardDate(date.date)}
                  </button>
                ))}
              </div>
            )}

            {tiers.length > 0 && (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {tiers.map((tier, index) => {
                  const style = TIER_STYLES[index % TIER_STYLES.length];
                  return (
                    <div key={`${tier.title}-${index}`} className={cn('rounded-[8px] px-4 py-3', style.bg)}>
                      <p className={cn('text-[11px] font-semibold uppercase tracking-wide', style.label)}>{tier.title}</p>
                      <p className={cn('mt-1 text-lg font-extrabold tracking-tight', style.text)}>
                        {Number(tier.price) === 0 ? 'Free' : `${Number(tier.price).toLocaleString('en-US')} PKR`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-auto flex flex-wrap gap-2.5 pt-6">
              <button
                type="button"
                onClick={() => setPendingAction(event.status === 'published' ? 'hide' : 'show')}
                disabled={event.status === 'cancelled'}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {event.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                {event.status === 'published' ? 'Hide event' : 'Unhide event'}
              </button>
              <button
                type="button"
                onClick={() => setPendingAction('delete')}
                disabled={event.status === 'cancelled'}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} /> Delete
              </button>
              <button
                type="button"
                onClick={() => salesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0012FF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0010d0]"
              >
                <BarChart3 size={16} /> Sales report
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-8 rounded-[8px] border border-[#e2e2e2] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        {event.creator && (
          <div className="rounded-[8px] border border-[#e2e2e2] bg-[#FAFAFC] p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm ring-1 ring-[#e2e2e2] sm:h-16 sm:w-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.creator.profilePhoto || '/avatar.png'}
                  alt={event.creator.displayName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Hosted by</p>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="truncate text-base font-extrabold text-black sm:text-lg">{event.creator.displayName}</span>
                  {event.creator.username && <span className="text-xs text-gray-400">@{event.creator.username}</span>}
                </div>
                {event.creator.shortBio && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600 sm:text-sm">{event.creator.shortBio}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="font-sans text-lg font-bold text-black sm:text-xl">About this event</h2>
          {isRichTextEmpty(event.description) ? (
            <p className="mt-2 text-sm text-gray-400">No description provided for this event.</p>
          ) : (
            <div
              className="prose prose-sm mt-3 max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          )}
        </div>

        <div className="border-t border-[#e2e2e2] pt-6">
          <h2 className="font-sans text-base font-bold text-black sm:text-lg">Refund Policy</h2>
          <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
            {event.refundPolicy ||
              'All ticket sales are final unless otherwise stated by the event organizer. Refund requests may be considered only if the event is canceled, significantly rescheduled, or required by applicable law.'}
          </p>
        </div>

        <div className="border-t border-[#e2e2e2] pt-6">
          <h2 className="font-sans text-base font-bold text-black sm:text-lg">Terms &amp; Conditions</h2>
          <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
            {event.termsAndConditions ||
              "By purchasing a ticket, you agree to comply with the event organizer's rules and policies. Tickets are valid only for the specified event and may not be resold or transferred unless permitted by the organizer."}
          </p>
        </div>
      </section>

      <section ref={salesRef} className="mt-6 scroll-mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-gray-950">Ticket sales</h2>
            <p className="mt-1 text-sm text-gray-500">Confirmed ticket purchases for this event.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-3 py-1.5 text-xs font-semibold text-[#0012FF]">
            <Users size={14} /> {event.stats.totalBuyers} {event.stats.totalBuyers === 1 ? 'buyer' : 'buyers'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:px-6">
          {[
            { label: 'Total buyers', value: event.stats.totalBuyers.toLocaleString() },
            { label: 'Tickets sold', value: event.stats.totalTicketsSold.toLocaleString() },
            { label: 'Seats purchased', value: event.stats.totalSeats.toLocaleString() },
            { label: 'Ticket revenue', value: `PKR ${event.stats.totalRevenue.toLocaleString()}` },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-gray-950">{stat.value}</p>
            </div>
          ))}
        </div>

        {event.stats.buyers.length === 0 ? (
          <div className="border-t border-gray-100 px-5 py-10 text-center sm:px-6">
            <Ticket size={21} className="mx-auto text-gray-400" />
            <p className="mt-3 text-sm font-semibold text-gray-800">No tickets sold yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-gray-100">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 sm:px-6">Buyer</th>
                  <th className="px-4 py-3">Event date</th>
                  <th className="px-4 py-3">Ticket tier</th>
                  <th className="px-4 py-3">Tickets / seats</th>
                  <th className="px-4 py-3">Purchased</th>
                  <th className="px-5 py-3 text-right sm:px-6">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {event.stats.buyers.map((buyer) => (
                  <tr key={buyer.id} className="text-sm text-gray-700">
                    <td className="px-5 py-4 sm:px-6">
                      <p className="font-semibold text-gray-900">{buyer.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{buyer.email}</p>
                    </td>
                    <td className="px-4 py-4">{formatEventCardDate(buyer.date)}</td>
                    <td className="px-4 py-4">{buyer.tier}</td>
                    <td className="px-4 py-4"><span className="font-semibold text-gray-900">{buyer.quantity}</span><span className="text-gray-500"> tickets · {buyer.seats} seats</span></td>
                    <td className="px-4 py-4 text-xs text-gray-500">{new Date(buyer.purchasedAt).toLocaleString()}</td>
                    <td className="px-5 py-4 text-right font-semibold tabular-nums text-gray-900 sm:px-6">
                      {buyer.amount > 0 ? `PKR ${buyer.amount.toLocaleString()}` : 'Free'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ActionDialog
        open={!!pendingAction}
        onOpenChange={(open) => {
          if (!open && !savingAction) setPendingAction(null);
        }}
        title={pendingAction === 'delete' ? 'Delete this event?' : pendingAction === 'hide' ? 'Hide this event?' : 'Unhide this event?'}
        description={
          pendingAction === 'delete'
            ? [
                'This event will be soft deleted and its record retained.',
                'Events with ticket purchases cannot be deleted. Hide the event instead.',
              ]
            : pendingAction === 'hide'
              ? 'The event will be removed from public view. The creator will receive an email with the event title and image.'
              : 'The event will become visible publicly and available for ticket purchases.'
        }
        actions={[
          { label: 'Cancel', variant: 'outline', onClick: () => setPendingAction(null), disabled: savingAction },
          {
            label: savingAction ? 'Please wait…' : pendingAction === 'delete' ? 'Delete event' : pendingAction === 'hide' ? 'Hide event' : 'Unhide event',
            variant: pendingAction === 'delete' || pendingAction === 'hide' ? 'destructive' : 'default',
            onClick: () => void confirmAction(),
            disabled: savingAction,
          },
        ]}
      />
    </div>
  );
}
