'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import BookingProgress from '@/components/booking/BookingProgress';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import AvailabilityDateTimePicker from '@/components/booking/AvailabilityDateTimePicker';
import LoadingAnimation from '@/components/LoadingAnimation';
import { useBooking, type CreatorInfo, type SessionType, getCachedUserData } from '../layout';

export default function BookSessionStepTwo() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const query = searchParams.toString();
  const queryString = query ? `?${query}` : '';
  const { booking, setBooking, saveToStorage } = useBooking();
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const username = String(params.username || '');

  useEffect(() => {
    if (!sessionId) {
      router.replace(`/creators/${username}/book-session/step-1`);
      return;
    }

    let cancelled = false;
    const loadLinkedSession = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/creators/${encodeURIComponent(username)}`);
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Unable to load this creator.');
        }

        const session = (data.sessions || []).find((item: SessionType) => String(item.id) === sessionId);
        if (!session) throw new Error('This session is unavailable or no longer active.');

        const creatorInfo: CreatorInfo = {
          id: data.creator.id,
          name: data.creator.name,
          username: data.creator.username,
          displayName: data.creator.displayName,
          profilePhoto: data.creator.profilePhoto,
          coverPhoto: data.creator.coverPhoto,
          shortBio: data.creator.shortBio,
          niches: data.creator.niches || [],
          city: data.creator.city,
          country: data.creator.country,
          languages: data.creator.languages || [],
          socialLinks: data.creator.socialLinks || {},
          rating: data.creator.rating,
          ratingLabel: data.creator.ratingLabel,
          reviewCount: data.creator.reviewCount,
          ratingDisplay: data.creator.ratingDisplay,
          stats: data.creator.stats,
        };
        if (cancelled) return;

        setCreator(creatorInfo);
        setSessionType(session);
        try {
          sessionStorage.setItem(`reachly_sessions_${username}`, JSON.stringify(data.sessions || []));
          sessionStorage.setItem(`reachly_creator_${username}`, JSON.stringify(creatorInfo));
        } catch (storageError) {
          console.error('Unable to cache linked session details:', storageError);
        }

        setBooking((current) => {
          const sameSession = current.selectedSession?.id === session.id;
          const cachedUser = getCachedUserData();
          return {
            ...current,
            creator: creatorInfo,
            selectedSession: session,
            selectedDate: sameSession ? current.selectedDate : null,
            selectedTime: sameSession ? current.selectedTime : null,
            answers: sameSession ? current.answers : [],
            step: 2,
            userDetails: {
              ...current.userDetails,
              fullName: current.userDetails.fullName || cachedUser.name,
              email: current.userDetails.email || cachedUser.email,
            },
          };
        });
      } catch (loadError) {
        console.error('Unable to load linked session:', loadError);
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load this session.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadLinkedSession();
    return () => {
      cancelled = true;
    };
  }, [sessionId, username, router, setBooking]);

  const canContinue = Boolean(sessionType && booking.selectedDate && booking.selectedTime);
  const step3Url = useMemo(
    () => `/creators/${username}/book-session/step-3${queryString}`,
    [username, queryString],
  );

  const continueBooking = () => {
    if (!canContinue) return;
    setBooking((current) => ({ ...current, step: 2 }));
    saveToStorage();
    router.push(step3Url);
  };

  if (loading) return <LoadingAnimation />;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-2 sm:px-6">
      <BookingProgress currentStep={2} />
      <div className="grid grid-cols-1 items-start justify-items-center gap-0 lg:grid-cols-[410px_1fr]">
        <div className="hidden w-full justify-center lg:flex">
          <CreatorProfileCard creator={creator} />
        </div>
        <section className="w-full max-w-[790px]">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => router.push(`/creators/${username}/book-session/step-1`)}
                className="mt-4 font-bold underline"
              >
                Browse all sessions
              </button>
            </div>
          ) : sessionType ? (
            <>
              <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#0012FF]">Selected session</p>
                <h1 className="mt-1 text-xl font-extrabold text-gray-950">{sessionType.title}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {sessionType.duration}
                  {sessionType.isFreeConsultation ? ' · Free Consultancy' : ` · PKR ${sessionType.price.toLocaleString()}`}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Select Date &amp; Time</h2>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Choose an available date and time for your session.
                  </p>
                </div>
                <AvailabilityDateTimePicker
                  key={sessionType.id}
                  username={username}
                  sessionId={sessionType.id}
                  selectedDate={booking.selectedSession?.id === sessionType.id ? booking.selectedDate : null}
                  selectedTime={booking.selectedSession?.id === sessionType.id ? booking.selectedTime : null}
                  onDateChange={(date) => setBooking((current) => ({ ...current, selectedDate: date, selectedTime: null }))}
                  onTimeChange={(time) => setBooking((current) => ({ ...current, selectedTime: time }))}
                />
                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/creators/${username}/book-session/step-1`)}
                    className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Browse sessions
                  </button>
                  <button
                    type="button"
                    disabled={!canContinue}
                    onClick={continueBooking}
                    className="rounded-full bg-[#0012FF] px-6 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
