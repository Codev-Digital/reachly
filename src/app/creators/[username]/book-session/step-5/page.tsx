'use client';

import { useParams, useRouter } from 'next/navigation';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingSummary from '@/components/booking/BookingSummary';
import { useBooking } from '../layout';

const formatDateLong = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function BookSessionStep5() {
  const params = useParams();
  const router = useRouter();
  const { booking } = useBooking();

  return (
    <div>
      <BookingProgress currentStep={5} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        {/* Confirmation Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[rgba(200,169,126,0.1)] border border-[#C8A97E] flex items-center justify-center mx-auto mb-4">
          <svg
  width="32"
  height="32"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#C8A97E"
  strokeWidth="3"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M20 6L9 17L4 12" />
</svg>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#C8A97E] mb-2">Your booking is confirmed</h3>
          <p className="font-sans text-xs text-[#F9F6F2] opacity-70">We have sent the details to your email and WhatsApp</p>
        </div>

        {/* Booking Reference */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg px-6 py-3 text-center mb-4">
          <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mb-1">Booking Reference</p>
          <p className="font-serif text-base font-semibold text-[#C8A97E]">RCH-KYVS7G9E</p>
        </div>

        {/* Creator Info */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg px-6 py-4 flex items-center gap-4 mb-4">
          <img src="/merium.png" alt="Kainat Aslam" className="w-12 h-12 rounded-full border border-[rgba(200,169,126,0.3)]" />
          <div>
            <h4 className="font-serif text-base font-semibold text-[#F9F6F2]">Kainat Aslam</h4>
            <p className="font-sans text-xs text-[#F9F6F2] opacity-70">@kainataslam.ka</p>
          </div>
        </div>

        {/* Session Details */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg px-6 py-4 grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div>
              <p className="font-sans text-xs text-[#F9F6F2] opacity-50">Date</p>
              <p className="font-sans text-sm font-semibold text-[#F9F6F2]">{booking.selectedDate ? formatDateLong(booking.selectedDate) : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <p className="font-sans text-xs text-[#F9F6F2] opacity-50">Time</p>
              <p className="font-sans text-sm font-semibold text-[#F9F6F2]">{booking.selectedTime} PKT</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
          <svg
  width="16"
  height="16"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#C8A97E"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <circle cx="12" cy="13" r="8" />
  <path d="M12 13l3-2" />
  <path d="M9 2h6" />
  <path d="M12 5v2" />
</svg>
            <div>
              <p className="font-sans text-xs text-[#F9F6F2] opacity-50">Duration</p>
              <p className="font-sans text-sm font-semibold text-[#F9F6F2]">{booking.selectedSession?.duration.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Google Meet Link */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg px-6 py-6 text-center mb-4">
          <div className="w-10 h-10 rounded-full bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.3)] flex items-center justify-center mx-auto mb-3">
          <svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#C8A97E"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M23 7l-7 5 7 5V7z" />
  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
</svg>
          </div>
          <p className="font-serif text-sm font-semibold text-[#F9F6F2] mb-4">Your Google Meet link</p>



         <button className="bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-2 px-8 rounded-full text-sm mb-3 hover:opacity-90 transition-all flex items-center justify-center gap-2 mx-auto">
          <svg
  width="16"
  height="16"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M23 7l-7 5 7 5V7z" />
  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
</svg>
            Join google meet
          </button>
          <div className="bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-2">
            <p className="font-sans text-xs text-[#F9F6F2] opacity-50 break-all">https://meet.google.com/iqj-bsq-bze</p>
          </div>
          <p className="font-sans text-xs text-[#F9F6F2] opacity-50 mt-3">Save this link. You will also receive it via email and WhatsApp</p>
        </div>

        {/* Calendar Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button className="bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] font-sans text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:border-[#C8A97E] transition-all">
         <svg
  width="16"
  height="16"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect x="3" y="4" width="18" height="18" rx="2" />
  <line x1="8" y1="2" x2="8" y2="6" />
  <line x1="16" y1="2" x2="16" y2="6" />
  <line x1="3" y1="10" x2="21" y2="10" />
  <line x1="12" y1="13" x2="12" y2="19" />
  <line x1="9" y1="16" x2="15" y2="16" />
</svg>
            Google Calendar
          </button>
          <button className="bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] font-sans text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:border-[#C8A97E] transition-all">
         <svg
  width="16"
  height="16"
  viewBox="0 0 24 24"
  fill="currentColor"
>
  <path d="M16.37 12.77c.03 3.13 2.74 4.17 2.77 4.18-.02.07-.43 1.48-1.41 2.93-.85 1.25-1.73 2.49-3.12 2.52-1.36.03-1.8-.81-3.36-.81-1.57 0-2.05.78-3.33.84-1.34.05-2.37-1.34-3.22-2.58-1.74-2.52-3.07-7.11-1.29-10.2.88-1.53 2.46-2.5 4.18-2.53 1.31-.03 2.54.88 3.36.88.82 0 2.37-1.08 4-0.92.68.03 2.58.28 3.8 2.06-.1.06-2.26 1.32-2.38 3.63zM13.88 3.94c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.25.68-2.98 1.53-.66.76-1.24 1.98-1.09 3.14 1.13.09 2.29-.58 3.01-1.42z"/>
</svg>
            Apple Calendar
          </button>
          <button className="bg-[#141414] border border-[rgba(200,169,126,0.3)] text-[#F9F6F2] font-sans text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:border-[#C8A97E] transition-all">
           <svg
  width="16"
  height="16"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect x="2" y="4" width="20" height="16" rx="2" />
  <path d="M22 7l-10 7L2 7" />
</svg>
            Outlook
          </button>
        </div>

        {/* Before Session */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg px-6 py-4 mb-6">
          <h5 className="font-serif text-sm font-semibold text-[#C8A97E] mb-3">Before Your Session</h5>
          <ul className="space-y-2">
            {['Test your camera and microphone', 'Find a quiet, well-lit space', 'Prepare your questions in advance', 'Join the call 2 minutes early'].map((item, i) => (
              <li key={i} className="font-sans text-xs text-[#F9F6F2] opacity-70 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button className="flex-1 bg-[#C8A97E] text-[#0C0C0C] font-serif font-semibold py-3 px-6 rounded-full text-sm hover:opacity-90 transition-all">
            View My Bookings
          </button>
          <button
            onClick={() => router.push(`/creators/${params.username}`)}
            className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 px-6 rounded-full text-sm hover:border-[#C8A97E] transition-all"
          >
            Book Another Session
          </button>
        </div>

        {/* Share Section */}
        <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-lg px-6 py-4 text-center">
          <h5 className="font-serif text-sm font-semibold text-[#C8A97E] mb-2">Loved Reachly?</h5>
          <p className="font-sans text-xs text-[#F9F6F2] opacity-70 mb-4">Share with friends and earn credits when they book</p>
          <div className="flex items-center justify-center gap-2 bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-5 py-2 inline-block">
            
        <span className="flex items-center gap-2 font-sans text-xs text-[#F9F6F2] opacity-70">
  RCH-KYVS7G9E

  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#C8A97E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="flex-shrink-0"
  >
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
    <path d="M12 16V3" />
    <path d="M7 8l5-5 5 5" />
  </svg>
</span>
         
          </div>
        </div>
      </div>
    </div>
  );
}
