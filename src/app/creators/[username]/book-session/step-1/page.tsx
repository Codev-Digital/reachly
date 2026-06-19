'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingSummary from '@/components/booking/BookingSummary';
import { useBooking, SessionType } from '../layout';

export default function BookSessionStep1() {
  const params = useParams();
  const router = useRouter();
  const { booking, setBooking, nextStep } = useBooking();

  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreator() {
      try {
        const res = await fetch(`/api/creators/${params.username}`);
        const data = await res.json();
        if (data.success) {
          setSessions(data.sessions || []);
          // Store creator info into global booking context for use by BookingSummary & other steps
          setBooking(b => ({
            ...b,
            creator: {
              id: data.creator.id,
              name: data.creator.name,
              username: data.creator.username,
              displayName: data.creator.displayName,
              profilePhoto: data.creator.profilePhoto,
              shortBio: data.creator.shortBio,
              niches: data.creator.niches || [],
            },
            // Keep previously selected session if it exists in the new sessions list, otherwise no selection
            selectedSession: b.selectedSession
              ? (data.sessions.find((s: SessionType) => s.id === b.selectedSession?.id) || null)
              : null,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch creator sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCreator();
  }, [params.username]);

  const handleSelectSession = (session: SessionType) => {
    setBooking(b => ({ ...b, selectedSession: session }));
  };

  const handleContinue = () => {
    if (booking.selectedSession) {
      nextStep();
      router.push(`/creators/${params.username}/book-session/step-2`);
    }
  };

  const creator = booking.creator;

  return (
    <div>
      <BookingProgress currentStep={1} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Session Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Creator Info */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-16 h-16 rounded-full border border-[rgba(200,169,126,0.3)] bg-white/5 animate-pulse" />
              ) : (
                <img
                  src={creator?.profilePhoto || '/merium.png'}
                  alt={creator?.displayName || ''}
                  className="w-16 h-16 rounded-full border border-[rgba(200,169,126,0.3)] object-cover"
                />
              )}
              <div>
                {loading ? (
                  <>
                    <div className="h-6 w-36 bg-white/10 animate-pulse rounded mb-2" />
                    <div className="h-4 w-24 bg-white/10 animate-pulse rounded" />
                  </>
                ) : (
                  <>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F9F6F2]">{creator?.displayName}</h2>
                    <p className="text-xs font-sans text-[#F9F6F2] opacity-70">@{creator?.username}</p>
                  </>
                )}
              </div>
            </div>

            <h3 className="font-serif text-xl font-bold text-[#F9F6F2]">Choose a Session Type</h3>

            {/* Session Cards */}
            <div className="space-y-6 flex flex-col items-center">
              {loading ? (
                [1, 2].map(i => (
                  <div key={i} className="w-full max-w-[783px] h-48 bg-[#141414] border border-[rgba(200,169,126,0.15)] rounded-xl animate-pulse" />
                ))
              ) : sessions.length === 0 ? (
                <p className="text-white/50 italic">No sessions found for this creator.</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`w-full max-w-[783px] bg-[#141414] border rounded-xl p-6 transition-all cursor-pointer flex flex-col ${booking.selectedSession?.id === session.id
                        ? 'border-[#C8A97E] shadow-[0_0_20px_rgba(200,169,126,0.15)]'
                        : 'border-[rgba(200,169,126,0.3)] hover:border-[rgba(200,169,126,0.5)]'
                      }`}
                    onClick={() => handleSelectSession(session)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[rgba(200,169,126,0.05)] flex items-center justify-center border border-[rgba(200,169,126,0.3)]">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="1.5">
                            <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                            <rect x="2" y="10" width="20" height="10" rx="2" ry="2" />
                            <line x1="6" y1="2" x2="6" y2="4" />
                            <line x1="18" y1="2" x2="18" y2="4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-serif text-lg font-semibold text-[#F9F6F2]">{session.title}</h4>
                          <p className="text-xs font-sans text-[#F9F6F2] opacity-70">{session.duration}</p>
                        </div>
                      </div>
                      <p className="font-serif text-xl font-bold text-[#C8A97E]">PKR {session.price.toLocaleString()}</p>
                    </div>

                    {/* Description */}
                    <p className="text-sm font-sans text-[#F9F6F2] opacity-80 mb-6">{session.description}</p>

                    {/* Features */}
                    <ul className="space-y-3 mb-6 flex-1">
                      {session.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm font-sans text-[#F9F6F2] opacity-70">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12l2 2 4-4" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Select Button */}
                    <button
                      className={`mt-auto w-full py-3 rounded-full text-sm font-sans font-semibold transition-all ${booking.selectedSession?.id === session.id
                          ? 'bg-[#C8A97E] text-[#0C0C0C]'
                          : 'border border-[rgba(200,169,126,0.3)] text-[#C8A97E] bg-transparent hover:border-[#C8A97E]'
                        }`}
                    >
                      {booking.selectedSession?.id === session.id ? 'Selected ✓' : 'Select Session'}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                onClick={() => router.push(`/creators/${params.username}`)}
                className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 px-6 rounded-full text-sm hover:border-[#C8A97E] transition-all flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <button
                onClick={handleContinue}
                disabled={!booking.selectedSession}
                className={`flex-1 font-serif font-semibold py-3 px-6 rounded-full text-sm transition-all flex items-center justify-center gap-2 ${booking.selectedSession
                    ? 'bg-[#C8A97E] text-[#0C0C0C] hover:opacity-90'
                    : 'bg-[rgba(200,169,126,0.2)] text-[rgba(0,0,0,0.4)] cursor-not-allowed'
                  }`}
              >
                Continue to Date and Time
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column: Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
