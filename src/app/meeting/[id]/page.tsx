import { Metadata } from 'next';
import MeetingClient from './MeetingClient';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

export const metadata: Metadata = {
  title: 'Meeting | Reachly',
};

export default async function MeetingPage({ params }: { params: { id: string } }) {
  await connectDB();
  
  // Find the booking by bookingRef
  const booking = await Booking.findOne({ bookingRef: params.id }).select('meetingUrl');

  if (!booking || !booking.meetingUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA]">
        <div className="text-center bg-white p-10 rounded-[32px] shadow-sm max-w-md w-full mx-4 border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-black mb-3 font-sans tracking-tight">Meeting Not Found</h1>
          <p className="text-gray-500 text-sm font-sans mb-8">
            The meeting link you followed is invalid or the booking could not be found.
          </p>
          <a href="/" className="inline-block bg-[#0012FF] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[#0012FF]/10 w-full text-center">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return <MeetingClient url={booking.meetingUrl} />;
}
