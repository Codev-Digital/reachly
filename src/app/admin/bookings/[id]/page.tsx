'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Pencil, Plus, X } from 'lucide-react';
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

interface EventDetail {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  category: string;
  status: string;
  dates: EventDate[];
  formattedDate: string;
  formattedTime: string;
  venue: string;
  refundPolicy: string;
  termsAndConditions: string;
  creator: {
    id: string;
    displayName: string;
    username: string;
    profilePhoto?: string | null;
    city?: string;
    country?: string;
  } | null;
  stats?: {
    totalPurchases: number;
    totalTicketsSold: number;
    totalRevenue: number;
  };
}

const TIER_CARD_PALETTES = [
  {
    bg: 'bg-[#FFD4D8]',
    label: 'text-[#FF4D6D]',
    price: 'text-[#FF2D55]',
  },
  {
    bg: 'bg-[#FFEBA5]',
    label: 'text-[#D97706]',
    price: 'text-[#F59E0B]',
  },
  {
    bg: 'bg-[#B4F0C5]',
    label: 'text-[#16A34A]',
    price: 'text-[#10B981]',
  },
  {
    bg: 'bg-[#E0E7FF]',
    label: 'text-[#0012FF]',
    price: 'text-[#0012FF]',
  },
];

const DEFAULT_SAMPLE_TIERS: EventTier[] = [
  { title: 'Early Bird', price: 1200 },
  { title: 'General', price: 1600 },
  { title: 'Early Bird', price: 2000 },
];

function getInitialEvent(id: string): EventDetail | null {
  if (typeof window === 'undefined' || !id) return null;
  try {
    const raw = sessionStorage.getItem(`reachly_admin_active_event_${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      id: parsed.id || id,
      title: parsed.title || 'Event Details',
      description: parsed.description || '',
      bannerUrl: parsed.image || parsed.bannerUrl || '/assets/event-1.jpg',
      category: parsed.category || 'Workshops',
      status: parsed.status || 'Upcoming',
      dates: parsed.dates || [],
      formattedDate: parsed.date || '5 July 2026',
      formattedTime: parsed.time || '2PM - 6PM',
      venue: parsed.venue || 'Nishat Hotel, Gulberg, Lahore',
      refundPolicy: parsed.refundPolicy || '',
      termsAndConditions: parsed.termsAndConditions || '',
      creator: parsed.creator || {
        id: '',
        displayName: parsed.creatorName || 'Creator',
        username: parsed.creatorName ? parsed.creatorName.toLowerCase().replace(/\s+/g, '') : 'creator',
      },
      stats: parsed.stats || {
        totalPurchases: 0,
        totalTicketsSold: 2,
        totalRevenue: 0,
      },
    };
  } catch {
    return null;
  }
}

export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [event, setEvent] = useState<EventDetail | null>(() => getInitialEvent(id));
  const [loading, setLoading] = useState<boolean>(() => !getInitialEvent(id));
  const [notFound, setNotFound] = useState(false);

  // Modals state
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    email: '',
    role: 'Registration Desk',
  });
  const [volunteerSuccess, setVolunteerSuccess] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const loadEvent = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      // Only show full-screen skeleton if we don't have prefilled cached data
      if (!event) {
        setLoading(true);
      }
      const res = await fetch(`/api/admin/events/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        setNotFound(false);
        try {
          sessionStorage.setItem(`reachly_admin_active_event_${id}`, JSON.stringify(data.event));
        } catch {
          /* ignore */
        }
      } else if (!event) {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Failed to load event details:', err);
      if (!event) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id, event]);

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVolunteerSuccess(true);
    setTimeout(() => {
      setShowVolunteerModal(false);
      setVolunteerSuccess(false);
      setVolunteerForm({ name: '', email: '', role: 'Registration Desk' });
    }, 1200);
  };

  if (loading && !event) {
    return (
      <div className="pb-16 max-w-[1240px] mx-auto animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded-md" />
          <div className="h-10 w-36 bg-gray-200 rounded-full" />
        </div>

        <div className="bg-white rounded-[32px] p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="w-full lg:w-[590px] h-[311px] rounded-2xl bg-gray-200 flex-shrink-0" />
            <div className="w-full lg:w-[530px] min-h-[300px] flex flex-col justify-between">
              <div>
                <div className="h-5 w-24 bg-gray-200 rounded-full mb-4" />
                <div className="h-9 w-3/4 bg-gray-200 rounded-md mb-3" />
                <div className="h-16 w-full bg-gray-200 rounded-md mb-6" />
                <div className="h-5 w-64 bg-gray-200 rounded-md mb-6" />
              </div>
              <div className="flex gap-3">
                <div className="w-[170px] h-[66px] bg-gray-200 rounded-[8px]" />
                <div className="w-[170px] h-[66px] bg-gray-200 rounded-[8px]" />
                <div className="w-[170px] h-[66px] bg-gray-200 rounded-[8px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="pb-16 max-w-[1240px] mx-auto">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span>Back to Events</span>
        </Link>
        <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-black mb-2">Event Not Found</h2>
          <p className="text-sm text-gray-400 mb-6">
            The event you are looking for may have been removed or does not exist.
          </p>
          <button
            type="button"
            onClick={() => router.push('/admin/bookings')}
            className="px-6 py-2.5 bg-[#0012FF] text-white rounded-full text-sm font-bold shadow-md hover:bg-[#0012FF]/90 transition-all cursor-pointer"
          >
            Go Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Extract tiers from first date or fallback to default sample tiers
  const activeTiers = (event.dates?.[0]?.tiers && event.dates[0].tiers.length > 0)
    ? event.dates[0].tiers
    : DEFAULT_SAMPLE_TIERS;

  // Plain-text preview of description
  const cleanDescription = (event.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Track your event performance, monitor audience engagement, and gain valuable insights to grow your community and create even more successful events.';

  return (
    <div className="pb-16 max-w-[1240px] mx-auto">
      {/* Top Header: Back Link + Add Volunteer Button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Events</span>
        </Link>

        <button
          type="button"
          onClick={() => setShowVolunteerModal(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0012FF] hover:bg-[#0012FF]/90 active:scale-95 text-white rounded-full text-sm font-bold shadow-md shadow-[#0012FF]/20 transition-all cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Volunteer</span>
        </button>
      </div>

      {/* Main Event Details Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-sm">
        {/* Top Flex/Grid Section (590px Image + 530px Creator Section) */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 xl:gap-[34px]">
          {/* Left: Banner Image Box (width: 590px; height: 311px;) */}
          <div className="w-full lg:w-[590px] h-[311px] rounded-2xl overflow-hidden relative flex-shrink-0 bg-gray-100 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.bannerUrl || '/assets/event-1.jpg'}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/event-1.jpg';
              }}
            />

            {/* Edit / Pencil button at bottom-right corner of image */}
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-black/45 flex items-center justify-center text-white hover:bg-black/65 transition-colors shadow-sm cursor-pointer active:scale-95"
              title="Event Information"
            >
              <Pencil size={15} />
            </button>
          </div>

          {/* Right: Creator Growth Section (width: 530px; height: 300px;) */}
          <div className="w-full lg:w-[530px] min-h-[300px] flex flex-col justify-between">
            <div>
              {/* Category Badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF0FF] text-[#0012FF] mb-3">
                {event.category || 'Workshops'}
              </span>

              {/* Event Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black font-sans text-black leading-tight tracking-tight mb-2.5">
                {event.title}
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed line-clamp-3 mb-4">
                {cleanDescription}
              </p>

              {/* Schedule row: Date, Time & Venue */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#2A2B2F] font-semibold mb-6">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#0012FF] flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{event.formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#0012FF] flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{event.formattedTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#0012FF] flex-shrink-0" />
                  <span className="text-gray-700 font-medium truncate max-w-[200px]" title={event.venue}>
                    {event.venue}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Tier Boxes (width: 170px; height: 66px; border-radius: 8px;) */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 max-w-full">
              {activeTiers.map((tier, idx) => {
                const palette = TIER_CARD_PALETTES[idx % TIER_CARD_PALETTES.length];
                const priceLabel = tier.price === 0 ? 'Free' : `${tier.price.toLocaleString('en-US')} PKR`;
                return (
                  <div
                    key={`${tier.title}-${idx}`}
                    className={cn(
                      'w-[170px] h-[66px] rounded-[8px] flex flex-col justify-center items-center text-center px-2 flex-shrink-0 transition-transform hover:scale-[1.02] shadow-xs cursor-default select-none',
                      palette.bg
                    )}
                  >
                    <span className={cn('text-[10px] font-semibold tracking-wide capitalize', palette.label)}>
                      {tier.title}
                    </span>
                    <span className={cn('text-base sm:text-lg font-black tracking-tight leading-tight', palette.price)}>
                      {priceLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Refund Policy & Terms and Conditions */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <h3 className="font-bold text-sm sm:text-base text-black mb-2">
            Refund Policy
          </h3>
          <p className="text-xs text-gray-400 font-normal leading-relaxed mb-6 max-w-5xl">
            {event.refundPolicy ||
              'All ticket sales are final unless otherwise stated by the event organizer. Refund requests may be considered only if the event is canceled, significantly rescheduled, or required by applicable law. If a refund is approved, it will be processed using the original payment method within the applicable processing period. Service fees and processing charges may be non-refundable where permitted.'}
          </p>

          <h3 className="font-bold text-sm sm:text-base text-black mb-2">
            Terms & Conditions
          </h3>
          <p className="text-xs text-gray-400 font-normal leading-relaxed max-w-5xl">
            {event.termsAndConditions ||
              'By purchasing a ticket, you agree to comply with the event organizer\'s rules and policies. Tickets are valid only for the specified event and may not be resold or transferred unless permitted by the organizer. The organizer reserves the right to modify event schedules, speakers, or venue details if necessary. Attendees are expected to behave respectfully, and the organizer may refuse entry or remove anyone who violates event policies without a refund. By attending the event, you consent to the possible use of photographs or recordings for promotional purposes unless prohibited by law.'}
          </p>
        </div>
      </div>

      {/* Add Volunteer Modal - Flicker-Free Motion Dialog */}
      <AnimatePresence>
        {showVolunteerModal && (
          <motion.div
            key="volunteer-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setShowVolunteerModal(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8"
            >
              <button
                type="button"
                onClick={() => setShowVolunteerModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <h2 className="text-xl font-black text-black mb-1">Add Volunteer</h2>
              <p className="text-xs text-gray-400 mb-6">
                Assign a volunteer team member to support this event.
              </p>

              {volunteerSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 font-black text-xl">
                    ✓
                  </div>
                  <p className="text-sm font-bold text-gray-800">Volunteer Added Successfully!</p>
                </div>
              ) : (
                <form onSubmit={handleAddVolunteerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Khan"
                      value={volunteerForm.name}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black focus:outline-none focus:border-[#0012FF] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sarah@example.com"
                      value={volunteerForm.email}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black focus:outline-none focus:border-[#0012FF] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Assigned Role
                    </label>
                    <select
                      value={volunteerForm.role}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, role: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black focus:outline-none focus:border-[#0012FF] transition-colors cursor-pointer"
                    >
                      <option value="Registration Desk">Registration Desk</option>
                      <option value="Ticket Scanning">Ticket Scanning</option>
                      <option value="Stage Management">Stage Management</option>
                      <option value="Guest Support">Guest Support</option>
                      <option value="Logistics & Usher">Logistics & Usher</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowVolunteerModal(false)}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#0012FF] hover:bg-[#0012FF]/90 text-white rounded-xl text-sm font-bold shadow-md shadow-[#0012FF]/20 transition-all cursor-pointer"
                    >
                      Add Volunteer
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Banner / Event Information Modal - Flicker-Free Motion Dialog */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            key="edit-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setShowEditModal(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8"
            >
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <h2 className="text-xl font-black text-black mb-1">Event Information</h2>
              <p className="text-xs text-gray-400 mb-6">
                Event ID: <span className="font-mono text-gray-600">{event.id}</span>
              </p>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-400 uppercase text-[10px] block mb-0.5">Creator</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {event.creator?.displayName || 'Creator'} (@{event.creator?.username || 'user'})
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-400 uppercase text-[10px] block mb-0.5">Status</span>
                  <span className="font-semibold capitalize text-gray-900">{event.status || 'published'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-400 uppercase text-[10px] block mb-0.5">Total Tickets Sold</span>
                  <span className="font-semibold text-gray-900 text-sm">{event.stats?.totalTicketsSold || 0} tickets</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full py-2.5 bg-[#0012FF] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#0012FF]/90 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
