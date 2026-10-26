'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import FormInput from '@/components/FormInput';
import RichTextEditor from '@/components/RichTextEditor';
import { useBooking, type SessionQuestion } from '../layout';
import { WHAT_TO_DISCUSS_MAX_LENGTH } from '@/lib/richText';

function questionId(q: SessionQuestion, index: number) {
  return String(q.id || q._id || `q-${index}`);
}

export default function BookSessionStep3() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fallbackUrl = searchParams.get('fallbackUrl');
  const queryStr = fallbackUrl ? `?fallbackUrl=${encodeURIComponent(fallbackUrl)}` : '';
  const { booking, setBooking, nextStep, saveToStorage, userData, saveDraft, isDraftSaved } = useBooking();
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoadingBack, setIsLoadingBack] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Determine if user is logged in from userData
  const isLoggedIn = !!(userData?.user?.id);

  const sessionQuestions: SessionQuestion[] = Array.isArray(booking.selectedSession?.questions)
    ? booking.selectedSession!.questions!
    : [];

  // Auto-fill user details if logged in and fields are empty
  useEffect(() => {
    if (isLoggedIn && userData?.user) {
      setBooking((prev) => {
        let updated = { ...prev.userDetails };
        let changed = false;
        if (!updated.fullName && userData.user.name) {
          updated.fullName = userData.user.name;
          changed = true;
        }
        if (!updated.email && userData.user.email) {
          updated.email = userData.user.email;
          changed = true;
        }
        if (changed) {
          return { ...prev, userDetails: updated };
        }
        return prev;
      });
    }
  }, [isLoggedIn, userData, setBooking]);

  const updateUserDetails = (field: string, value: string) => {
    setBooking(b => ({
      ...b,
      userDetails: { ...b.userDetails, [field]: value },
    }));
  };

  const getAnswer = (qid: string): string => {
    const found = (booking.answers || []).find((a) => a.questionId === qid);
    if (!found) return '';
    return Array.isArray(found.answer) ? found.answer[0] || '' : String(found.answer || '');
  };

  const updateAnswer = (q: SessionQuestion, index: number, value: string) => {
    const qid = questionId(q, index);
    setBooking((b) => {
      const rest = (b.answers || []).filter((a) => a.questionId !== qid);
      return {
        ...b,
        answers: [
          ...rest,
          {
            questionId: qid,
            question: q.question,
            answer: value,
            type: q.type,
          },
        ],
      };
    });
  };

  const requiredQuestionsAnswered = sessionQuestions.every((q, i) => {
    if (q.required === false) return true;
    const val = getAnswer(questionId(q, i)).trim();
    return val.length > 0;
  });

  const canProceed =
    booking.userDetails.fullName &&
    booking.userDetails.email &&
    booking.userDetails.whatsapp &&
    requiredQuestionsAnswered;

  const step4Url = `/creators/${params.username}/book-session/step-4${queryStr}`;

  useEffect(() => {
    if (params.username) {
      router.prefetch(step4Url);
    }
  }, [params.username, step4Url, router]);

  const handleContinue = async () => {
    if (!canProceed) return;

    // Prevent logged-in creator from booking themselves
    const isOwnSessionLoggedIn =
      (userData?.user?.id && booking.creator?.id && userData.user.id === booking.creator.id) ||
      (userData?.creatorProfile?.username && params.username &&
        userData.creatorProfile.username.toLowerCase() === decodeURIComponent(params.username as string).toLowerCase());

    if (isOwnSessionLoggedIn) {
      setShowWarningModal(true);
      return;
    }

    // Logged-in user — proceed directly
    saveToStorage();
    nextStep();
    router.push(step4Url);
  };

  const creator = booking.creator;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-2">
      {/* Step Progress Indicator */}
      <BookingProgress currentStep={3} />

      <div className="grid grid-cols-1 lg:grid-cols-[410px_1fr] gap-0 items-start justify-items-center">
        <div className="hidden lg:flex w-full justify-center">
          <CreatorProfileCard creator={creator} />
        </div>

        {/* ============ RIGHT COLUMN ============ */}
        <div className="w-full">
          {!isLoggedIn ? (
            /* ── AUTH PROMPT (not logged in) ── */
            <div className="bg-white rounded-[20px] border border-[#e2e2e2] p-8 sm:p-10 w-full max-w-[790px] mx-auto flex flex-col items-center text-center">
              {/* Illustration */}
              <div className="w-36 sm:w-44 mb-5">
                <img
                  src="/assets/login.png"
                  alt="Sign in to continue"
                  className="w-full h-auto object-contain"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-black mb-2 tracking-tight">
                Sign in to Continue
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed mb-8 max-w-[300px]">
                Create an account or log in to complete your booking with this creator.
              </p>

              <div className="flex flex-col gap-3 w-full max-w-[300px]">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3.5 bg-[#0012FF] hover:bg-[#0010d0] text-white rounded-full font-bold text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>

              {/* Back link */}
              <button
                onClick={() => {
                  setIsLoadingBack(true);
                  router.push(`/creators/${params.username}/book-session/step-2${queryStr}`);
                }}
                disabled={isLoadingBack}
                className="mt-6 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Go back
              </button>
            </div>
          ) : (
            /* ── BOOKING DETAILS FORM (logged in) ── */
            <div className="bg-white rounded-[20px] border border-[#e2e2e2] p-6 sm:p-8 w-full max-w-[790px] mx-auto">
              {/* Header */}
              <div className="flex items-center gap-3.5 border-b border-gray-100 pb-5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">Your Booking Details</h3>
                  <p className="text-xs text-gray-400">
                    Fill in your details to continue with the booking
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <FormInput
                  label="Full Name"
                  required
                  type="text"
                  placeholder="Enter your full name"
                  value={booking.userDetails.fullName}
                  onChange={e => updateUserDetails('fullName', e.target.value)}
                />

                <FormInput
                  label="Email Address"
                  required
                  type="email"
                  placeholder="Enter your email address"
                  value={booking.userDetails.email}
                  onChange={e => updateUserDetails('email', e.target.value)}
                />

                <FormInput
                  label="Phone Number"
                  required
                  type="tel"
                  placeholder="Enter your phone number"
                  value={booking.userDetails.whatsapp}
                  onChange={e => updateUserDetails('whatsapp', e.target.value)}
                  icon={<span className="text-sm font-medium text-gray-500 select-none">+92</span>}
                  className="pl-14"
                />

                <RichTextEditor
                  label="What would you like to discuss"
                  value={booking.userDetails.whatToDiscuss}
                  onChange={(html) => updateUserDetails('whatToDiscuss', html)}
                  placeholder="Share a brief overview so the creator can prepare for a session"
                  maxLength={WHAT_TO_DISCUSS_MAX_LENGTH}
                  autoHeight
                />

                {/* Creator session intake questions (after discuss field) */}
                {sessionQuestions.length > 0 && (
                  <div className="space-y-5 pt-2 border-t border-gray-100">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">Session questions</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Please answer the questions set by this creator
                      </p>
                    </div>

                    {sessionQuestions.map((q, index) => {
                      const qid = questionId(q, index);
                      const value = getAnswer(qid);
                      const isRequired = q.required !== false;

                      return (
                        <div key={qid}>
                          <label className="block text-xs font-bold text-gray-800 mb-2">
                            {q.question}
                            {isRequired && <span className="text-red-500 ml-0.5">*</span>}
                          </label>

                          {q.type === 'multiple_choice' ? (
                            <div className="space-y-2">
                              {(q.options || []).filter(Boolean).map((opt) => {
                                const selected = value === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => updateAnswer(q, index, opt)}
                                    className={`w-full text-left rounded-xl border px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                                      selected
                                        ? 'border-[#0012FF] bg-[#EEF2FF] text-[#0012FF]'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                  >
                                    <span className="inline-flex items-center gap-2.5">
                                      <span
                                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                          selected ? 'border-[#0012FF]' : 'border-gray-300'
                                        }`}
                                      >
                                        {selected && (
                                          <span className="h-2 w-2 rounded-full bg-[#0012FF]" />
                                        )}
                                      </span>
                                      {opt}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <textarea
                              placeholder="Type your answer"
                              value={value}
                              onChange={(e) =>
                                updateAnswer(q, index, e.target.value.slice(0, 300))
                              }
                              rows={3}
                              maxLength={300}
                              className="w-full bg-white border border-gray-200 focus:border-gray-300 focus:outline-none rounded-xl px-4 py-3 text-xs font-bold text-gray-800 placeholder-gray-400 resize-none transition-all shadow-xs"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
                  <p className="text-red-500 text-xs font-semibold">{authError}</p>
                </div>
              )}

              {/* Navigation Buttons Row */}
              <div className="flex flex-wrap justify-between items-center mt-8 pt-6 border-t border-gray-100 gap-2">
                <button
                  onClick={() => saveDraft()}
                  disabled={isDraftSaved}
                  className={`font-bold py-2.5 px-4 sm:px-5 rounded-full text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 border ${isDraftSaved
                    ? 'bg-green-50 border-green-200 text-green-600 cursor-default'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {isDraftSaved ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Saved
                    </>
                  ) : (
                    'Save as Draft'
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsLoadingBack(true);
                      router.push(`/creators/${params.username}/book-session/step-2${queryStr}`);
                    }}
                    disabled={isLoadingBack}
                    className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-4 sm:px-5 rounded-full text-xs hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
                  >
                    {isLoadingBack ? (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin"></div>
                    ) : (
                      'Back'
                    )}
                  </button>

                  <button
                    onClick={handleContinue}
                    disabled={!canProceed || authLoading}
                    className={`py-2.5 px-5 sm:px-6 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center ${canProceed && !authLoading
                      ? 'bg-[#0012FF] text-white hover:bg-[#0010d0]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {authLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#808BFF] border-t-white animate-spin"></div>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showWarningModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="relative overflow-visible w-full max-w-lg flex flex-col items-center px-5 sm:px-7 lg:px-8 pt-10 sm:pt-12 pb-6 sm:pb-8 z-10">
            <img
              src="/assets/cancel-card.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-fill pointer-events-none -z-10"
            />
            <button
              onClick={() => setShowWarningModal(false)}
              className="absolute -top-6 sm:-top-4 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100/50 text-gray-500 hover:bg-gray-55 transition-all z-20 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="w-24 sm:w-36 md:w-44 lg:w-56 mt-2 sm:mt-3 mb-3 sm:mb-4">
              <img
                src="/assets/cancel-appointment.webp"
                alt="Cancel Appointment"
                width={240}
                height={170}
                className="w-full h-auto object-contain"
              />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black text-center mb-2">
              Cannot Book Own Session
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 text-center mb-5 sm:mb-6 leading-relaxed">
              You cannot book a session with yourself. Please book a session with another creator.
            </p>
            <div className="flex justify-center w-full">
              <button
                onClick={() => setShowWarningModal(false)}
                className="px-6 sm:px-8 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all bg-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}