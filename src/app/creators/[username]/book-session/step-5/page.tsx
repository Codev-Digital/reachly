'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import { useBooking } from '../layout';
import Link from 'next/link';

const formatDateLong = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

function generateRef() {
  return 'RCH-' + Math.random().toString(36).toUpperCase().slice(2, 10);
}

export default function BookSessionStep5() {
  const params = useParams();
  const router = useRouter();
  const { booking } = useBooking();
  const creator = booking.creator;

  // Generate a stable reference for this session
  const bookingRef = useMemo(() => generateRef(), []);

  const beforeSessionTips = [
    'Test your camera and microphone',
    'Find a quiet, well-lit space',
    'Prepare your questions in advance',
    'Join the call 2 minutes early',
  ];

  return (
    <div>
      <BookingProgress currentStep={5} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">

        {/* ── Confirmation Header ── */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full border-2 border-[#C8A97E] animate-ping opacity-20" />
            <div className="w-20 h-20 rounded-full bg-[rgba(200,169,126,0.1)] border border-[#C8A97E] flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17L4 12" />
              </svg>
            </div>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#C8A97E] mb-2">Your booking is confirmed!</h3>
          <p className="font-sans text-sm text-[#F9F6F2] opacity-60">
            Details have been sent to <span className="text-[#C8A97E]">{booking.userDetails.email || 'your email'}</span> and WhatsApp
          </p>
        </div>

        {/* ── Booking Reference ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-6 py-4 text-center mb-4 flex items-center justify-between">
          <div>
            <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-1">Booking Reference</p>
            <p className="font-serif text-lg font-bold text-[#C8A97E] tracking-widest">{bookingRef}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(bookingRef)}
            className="flex items-center gap-1.5 text-xs font-sans text-[#C8A97E] border border-[rgba(200,169,126,0.3)] px-3 py-1.5 rounded-lg hover:border-[#C8A97E] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>
        </div>

        {/* ── Creator Info ── */}
        {creator && (
          <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-6 py-5 flex items-center gap-4 mb-4">
            <img
              src={creator.profilePhoto}
              alt={creator.displayName}
              className="w-14 h-14 rounded-full border-2 border-[rgba(200,169,126,0.4)] object-cover"
            />
            <div className="flex-1">
              <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-0.5">You booked a session with</p>
              <h4 className="font-serif text-base font-bold text-[#F9F6F2]">{creator.displayName}</h4>
              <p className="font-sans text-xs text-[#C8A97E]">@{creator.username}</p>
            </div>
            {creator.niches?.[0] && (
              <span className="bg-[rgba(200,169,126,0.1)] text-[#C8A97E] border border-[rgba(200,169,126,0.3)] px-3 py-1 rounded-full text-xs font-semibold capitalize">
                {creator.niches[0]}
              </span>
            )}
          </div>
        )}

        {/* ── Session + Booker Details ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-6 py-5 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 pb-4 border-b border-[rgba(255,255,255,0.07)]">
            {[
              {
                icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
                label: 'Date',
                value: booking.selectedDate ? formatDateLong(booking.selectedDate) : '—',
              },
              {
                icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
                label: 'Time',
                value: booking.selectedTime ? `${booking.selectedTime} PKT` : '—',
              },
              {
                icon: <><rect x="2" y="4" width="20" height="16" rx="2" /><rect x="2" y="10" width="20" height="10" rx="2" /></>,
                label: 'Session',
                value: booking.selectedSession?.title || '—',
              },
              {
                icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
                label: 'Duration',
                value: booking.selectedSession?.duration || '—',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                  {item.icon}
                </svg>
                <div>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-0.5">{item.label}</p>
                  <p className="font-sans text-sm font-semibold text-[#F9F6F2]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Booker details */}
          {booking.userDetails.fullName && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-0.5">Booked by</p>
                <p className="font-sans text-sm font-semibold text-[#F9F6F2]">{booking.userDetails.fullName}</p>
              </div>
              {booking.userDetails.whatsapp && (
                <div>
                  <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-0.5">WhatsApp</p>
                  <p className="font-sans text-sm font-semibold text-[#F9F6F2]">+92 {booking.userDetails.whatsapp}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Meet Link ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-6 py-6 text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
              <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <p className="font-serif text-sm font-semibold text-[#F9F6F2] mb-4">Your Google Meet link</p>
          <a
            href="https://meet.google.com/iqj-bsq-bze"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-2 px-8 rounded-full text-sm mb-4 hover:opacity-90 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            Join Google Meet
          </a>
          <div className="bg-[#0C0C0C] border border-[rgba(200,169,126,0.2)] rounded-lg px-4 py-2">
            <p className="font-mono text-xs text-[#F9F6F2] opacity-50">https://meet.google.com/iqj-bsq-bze</p>
          </div>
          <p className="font-sans text-xs text-[#F9F6F2] opacity-40 mt-3">Save this link — it will also arrive via email and WhatsApp.</p>
        </div>

        {/* ── Add to Calendar ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Google Calendar', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="12" y1="13" x2="12" y2="19" /><line x1="9" y1="16" x2="15" y2="16" /></> },
            { label: 'Apple Calendar', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
            { label: 'Outlook', icon: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></> },
          ].map((item, i) => (
            <button key={i} className="bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] font-sans text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:border-[#C8A97E] transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">{item.icon}</svg>
              {item.label}
            </button>
          ))}
        </div>

        {/* ── Before Your Session ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-6 py-5 mb-6">
          <h5 className="font-serif text-sm font-semibold text-[#C8A97E] mb-4">Before Your Session</h5>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {beforeSessionTips.map((tip, i) => (
              <li key={i} className="flex items-center gap-2 font-sans text-xs text-[#F9F6F2] opacity-70">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Link
            href="/user/bookings"
            className="flex-1 bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-3 px-6 rounded-full text-sm hover:opacity-90 transition-all text-center"
          >
            View My Bookings
          </Link>
          <button
            onClick={() => router.push(`/creators/${params.username}`)}
            className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 px-6 rounded-full text-sm hover:border-[#C8A97E] transition-all"
          >
            Book Another Session
          </button>
        </div>

        {/* ── Share Section ── */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl px-6 py-5 text-center">
          <h5 className="font-serif text-sm font-semibold text-[#C8A97E] mb-1">Loved Reachly?</h5>
          <p className="font-sans text-xs text-[#F9F6F2] opacity-60 mb-4">Share with friends and earn credits when they book</p>
          <div className="inline-flex items-center gap-3 bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-5 py-2.5">
            <span className="font-mono text-sm text-[#C8A97E] font-semibold tracking-widest">{bookingRef}</span>
            <button
              onClick={() => navigator.clipboard.writeText(bookingRef)}
              className="text-[#C8A97E] hover:opacity-70 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M12 16V3" /><path d="M7 8l5-5 5 5" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
