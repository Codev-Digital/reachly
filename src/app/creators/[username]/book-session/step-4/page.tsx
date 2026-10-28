'use client';

import { useEffect, useRef, useState } from 'react';
import { loadStripe, type StripeEmbeddedCheckout } from '@stripe/stripe-js';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Check, Eye, RefreshCw, ShieldCheck, Smartphone, UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';
import BookingProgress from '@/components/booking/BookingProgress';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import { useBooking, sessionPrice } from '../layout';

type PaymentMethod = 'stripe' | 'easypaisa' | 'jazzcash';

const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; description: string }> = [
  { id: 'easypaisa', label: 'EasyPaisa', description: 'Mobile wallet transfer' },
  { id: 'jazzcash', label: 'JazzCash', description: 'Mobile wallet transfer' },
];

export default function BookSessionStep4() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fallbackUrl = searchParams.get('fallbackUrl');
  const returnTo = searchParams.get('returnTo');
  const query = new URLSearchParams();
  if (fallbackUrl) query.set('fallbackUrl', fallbackUrl);
  if (returnTo) query.set('returnTo', returnTo);
  const queryString = query.toString();
  const queryStr = queryString ? `?${queryString}` : '';
  const { booking, nextStep, setBooking, saveDraft, isDraftSaved } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('easypaisa');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [manualBooking, setManualBooking] = useState<{ id: string; ref: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const checkoutContainer = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const creator = booking.creator;

  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [screenshot]);

  useEffect(() => {
    if (!isImageModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsImageModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageModalOpen]);

  const handleScreenshotChange = (file: File | null) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or WebP screenshot.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot must be 5 MB or smaller.');
      return;
    }
    setError('');
    setScreenshot(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pkg = booking.selectedSession?.isPackage ? booking.selectedSession : null;
  const [paidPackage, setPaidPackage] = useState<{ number: number; total: number } | null>(null);
  useEffect(() => {
    if (!pkg) return;
    fetch('/api/user/packages')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const purchase = (data?.packages || []).find(
          (item: { sessionTypeId: string; status: string; sessionsBooked: number; sessionsTotal: number }) =>
            item.sessionTypeId === pkg.id && item.status === 'active'
        );
        if (purchase) setPaidPackage({ number: purchase.sessionsBooked + 1, total: purchase.sessionsTotal });
      })
      .catch((fetchError) => console.error('Unable to check existing session package:', fetchError));
  }, [pkg]);
  const amountDue = pkg && paidPackage ? 0 : booking.selectedSession ? sessionPrice(booking.selectedSession) : 0;
  const visibleError =
    error ||
    (clientSecret && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? 'Stripe is not configured. Please choose EasyPaisa or JazzCash.'
      : '');

  useEffect(() => {
    if (params.username) router.prefetch(`/creators/${params.username}/book-session/step-5${queryStr}`);
  }, [params.username, queryStr, router]);

  useEffect(() => {
    if (!clientSecret) return;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) return;
    let cancelled = false;
    let embeddedCheckout: StripeEmbeddedCheckout | null = null;

    void (async () => {
      const stripe = await loadStripe(publishableKey);
      if (!stripe) throw new Error('Stripe could not be initialized.');
      embeddedCheckout = await stripe.createEmbeddedCheckoutPage({ clientSecret });
      if (cancelled || !checkoutContainer.current) {
        embeddedCheckout.destroy();
        return;
      }
      embeddedCheckout.mount(checkoutContainer.current);
    })().catch((checkoutError: unknown) => {
      console.error('Unable to initialize embedded Stripe checkout:', checkoutError);
      if (!cancelled) setError('Unable to load Stripe checkout. Please try again or choose another payment method.');
    });

    return () => {
      cancelled = true;
      embeddedCheckout?.destroy();
    };
  }, [clientSecret]);

  const bookingPayload = () => {
    if (!booking.selectedSession || !booking.selectedDate || !booking.selectedTime) {
      throw new Error('Select a session, date, and time before continuing.');
    }
    const date = booking.selectedDate;
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return {
      username: params.username,
      sessionId: booking.selectedSession.id,
      date: dateString,
      time: booking.selectedTime,
      userDetails: booking.userDetails,
      answers: booking.answers || [],
      proceedAs: booking.userDetails.proceedAs || 'guest',
      paymentMethod,
      promoApplied: null,
      finalPrice: sessionPrice(booking.selectedSession),
      originalPrice: booking.selectedSession.price,
      reservationToken: booking.reservationToken,
    };
  };

  const goToConfirmation = (bookingRef: string) => {
    setBooking((current) => ({
      ...current,
      bookingRef,
      paymentMethod,
      reservationToken: undefined,
      step: 4,
    }));
    try {
      localStorage.removeItem('reachly_booking_draft');
      sessionStorage.removeItem('reachly_booking_state');
    } catch (storageError) {
      console.error('Unable to clear booking draft:', storageError);
    }
    nextStep();
    router.push(`/creators/${params.username}/book-session/step-5${queryStr}`);
  };

  const submitPayment = async () => {
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      if (paymentMethod !== 'stripe' && amountDue > 0 && !screenshot) {
        throw new Error('Upload your payment screenshot to continue.');
      }

      let createdBooking = manualBooking;
      if (!createdBooking) {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload()),
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Unable to create booking.');
        if (data.checkoutClientSecret) {
          setClientSecret(data.checkoutClientSecret);
          return;
        }
        if (data.requiresPaymentProof) {
          if (!data.bookingId || !data.bookingRef) throw new Error('Booking response is missing its reference.');
          createdBooking = { id: String(data.bookingId), ref: data.bookingRef };
          setManualBooking(createdBooking);
        } else if (data.bookingRef) {
          goToConfirmation(data.bookingRef);
          return;
        } else {
          throw new Error('Booking response is incomplete.');
        }
      }

      if (paymentMethod === 'stripe') {
        throw new Error('Stripe did not return a checkout session. Please try again.');
      }
      if (!screenshot || !createdBooking) throw new Error('Upload your payment screenshot to continue.');
      const formData = new FormData();
      formData.set('bookingId', createdBooking.id);
      formData.set('bookingRef', createdBooking.ref);
      formData.set('email', booking.userDetails.email);
      formData.set('screenshot', screenshot);
      const proofResponse = await fetch('/api/payment-proofs', { method: 'POST', body: formData });
      const proofData = await proofResponse.json();
      if (!proofResponse.ok || !proofData.success) {
        throw new Error(proofData.error || 'Unable to submit payment proof.');
      }
      goToConfirmation(createdBooking.ref);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to complete payment.';
      if (message.toLowerCase().includes('reservation') || message.toLowerCase().includes('slot is no longer available')) {
        if (booking.reservationToken) {
          void fetch(`/api/creators/${encodeURIComponent(String(params.username))}/availability/reservations`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: booking.reservationToken }),
          }).catch((releaseError) => console.error('Unable to release expired session slot:', releaseError));
        }
        setBooking((current) => ({ ...current, reservationToken: undefined, step: 1 }));
        toast.error(message);
        router.replace(`/creators/${params.username}/book-session/step-1${queryStr}`);
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-2 sm:px-6">
      <BookingProgress currentStep={3} />
      <div className="grid grid-cols-1 items-start justify-items-center gap-0 lg:grid-cols-[410px_1fr]">
        <div className="hidden w-full justify-center lg:flex">
          <CreatorProfileCard creator={creator} />
        </div>

        <section className="w-full max-w-[790px] rounded-[20px] border border-[#e2e2e2] bg-white p-5 sm:p-8">
          <div className="mb-6 border-b border-gray-100 pb-5">
            {/* <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0012FF]">Payment</p> */}
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">Choose how to pay</h1>
            <p className="mt-1.5 text-sm text-gray-500">Select your preferred payment method to continue.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((method) => {
              const selected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    if (clientSecret || manualBooking) return;
                    setPaymentMethod(method.id);
                    setError('');
                  }}
                  aria-pressed={selected}
                  className={`group relative flex min-h-[150px] flex-col items-start rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0012FF] focus-visible:ring-offset-2 ${
                    selected
                      ? 'border-[#0012FF] bg-[#F7F8FF] shadow-[0_4px_16px_rgba(0,18,255,0.08)]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70'
                  } ${clientSecret || manualBooking ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                >
                  <span
                    className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                      selected ? 'border-[#0012FF] bg-[#0012FF] text-white' : 'border-gray-300 bg-white text-transparent'
                    }`}
                    aria-hidden="true"
                  >
                    {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="flex h-12 w-full items-center pr-8">
                    {method.id === 'easypaisa' ? (
                      <span className="flex h-11 w-[112px] items-center justify-center rounded-lg bg-white px-2.5">
                        <Image
                          src="/assets/easypaisa-horizontal.png"
                          alt="EasyPaisa"
                          width={160}
                          height={44}
                          className="h-auto max-h-8 w-full object-contain"
                        />
                      </span>
                    ) : method.id === 'jazzcash' ? (
                      <span className="flex h-11 w-[112px] items-center justify-center rounded-lg bg-white px-2.5">
                        <Image
                          src="/assets/jazzcash.png"
                          alt="JazzCash"
                          width={160}
                          height={44}
                          className="h-auto max-h-8 w-full object-contain"
                        />
                      </span>
                    ) : (
                      <span className="flex h-11 items-center gap-2 rounded-lg bg-white px-3">
                        <span className="text-xl font-black tracking-tight text-[#635BFF]" aria-label="Stripe">stripe</span>
                        <span className="h-5 w-px bg-gray-200" />
                        <span className="text-xs font-medium text-gray-500">Card</span>
                      </span>
                    )}
                  </span>
                  <span className="mt-3 min-w-0">
                    <span className="block text-sm font-bold text-gray-950">{method.label}</span>
                    <span className="mt-1 block text-xs leading-snug text-gray-500">{method.description}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-gray-600">{pkg ? `Package · ${pkg.packageSessions} sessions` : 'Session price'}</span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">
                PKR {booking.selectedSession ? sessionPrice(booking.selectedSession).toLocaleString() : '0'}
              </span>
            </div>
            {pkg && paidPackage && (
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                This is session {paidPackage.number} of {paidPackage.total}; your package is already paid.
              </p>
            )}
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
              <span className="text-sm font-semibold text-gray-700">Total due</span>
              <span className="shrink-0 text-xl font-bold tabular-nums tracking-tight text-gray-950">
                PKR {amountDue.toLocaleString()}
              </span>
            </div>
          </div>

          {paymentMethod === 'stripe' && (
            <div className="mt-5 rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <ShieldCheck className="h-4 w-4 text-[#635BFF]" />
                Secure card checkout by Stripe
              </div>
              {clientSecret ? (
                <div ref={checkoutContainer} className="mt-4 min-h-80" />
              ) : (
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  Stripe’s secure card form will load here after you continue.
                </p>
              )}
            </div>
          )}

          {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0012FF] shadow-sm ring-1 ring-gray-100">
                  <Smartphone className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-gray-950">Transfer details</h2>
                  <p className="mt-0.5 text-xs text-gray-500">Send your payment using {paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}.</p>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-gray-900">Send this amount</p>
                    <p className="text-lg font-bold tabular-nums tracking-tight text-gray-950">PKR {amountDue.toLocaleString()}</p>
                  </div>
                  <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                      <span className="text-sm text-gray-500">Account name</span>
                      <span className="text-sm font-semibold text-gray-900">John Doe</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                      <span className="text-sm text-gray-500">Mobile account</span>
                      <span className="text-sm font-semibold tabular-nums text-gray-900">92123456789</span>
                    </div>
                  </div>
                </div>


                {amountDue > 0 && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        handleScreenshotChange(event.target.files?.[0] || null);
                        event.target.value = '';
                      }}
                    />

                    {!screenshot ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center transition-all hover:border-[#0012FF] hover:bg-[#F7F8FF]"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#0012FF] shadow-sm ring-1 ring-gray-100 transition-transform group-hover:scale-105">
                          <UploadCloud className="h-6 w-6" />
                        </span>
                        <p className="mt-3 text-sm font-bold text-gray-900 group-hover:text-[#0012FF]">
                          Upload payment screenshot
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          JPG, PNG, or WebP · Maximum file size 5 MB
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3.5 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Clickable thumbnail to open image modal */}
                            <button
                              type="button"
                              onClick={() => setIsImageModalOpen(true)}
                              className="group relative h-26 w-26 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0012FF]"
                              title="Click to open image"
                            >
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt={screenshot.name}
                                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                  <UploadCloud className="h-6 w-6" />
                                </div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <Eye className="h-5 w-5 text-white" />
                              </div>
                            </button>

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-bold text-gray-950" title={screenshot.name}>
                                  {screenshot.name}
                                </p>
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  <Check className="h-2.5 w-2.5" /> Attached
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-gray-500">
                                {formatFileSize(screenshot.size)} · Payment screenshot ready
                              </p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          {/* <div className="flex items-center gap-2 border-t border-gray-100 pt-3 sm:border-0 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => setIsImageModalOpen(true)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition"
                            >
                              <Eye className="h-3.5 w-3.5 text-gray-500" />
                              Open image
                            </button>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition"
                            >
                              <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
                              Change image
                            </button>
                          </div> */}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="flex items-start gap-2 text-xs leading-relaxed text-gray-500">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  Your booking will be confirmed after an administrator verifies your payment.
                </p>
              </div>
            </div>
          )}

          {visibleError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{visibleError}</p>}

          {!clientSecret && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={() => saveDraft()}
                disabled={isDraftSaved}
                className="rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:text-green-600"
              >
                {isDraftSaved ? 'Saved' : 'Save as Draft'}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBooking((current) => ({ ...current, step: 2 }));
                    router.push(`/creators/${params.username}/book-session/step-3${queryStr}`);
                  }}
                  disabled={isSubmitting || !!manualBooking}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => void submitPayment()}
                  disabled={isSubmitting || (paymentMethod !== 'stripe' && amountDue > 0 && !screenshot)}
                  className="min-w-36 rounded-full bg-[#0012FF] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0010d0] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isSubmitting ? 'Confirming…' : 'Confirm'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Image Preview Lightbox Modal */}
      {isImageModalOpen && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-gray-950">Payment screenshot</h3>
                <p className="text-xs text-gray-500">
                  {screenshot?.name} {screenshot ? `· ${formatFileSize(screenshot.size)}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image Preview Area */}
            <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-950 p-4 sm:p-6">
              <img
                src={previewUrl}
                alt={screenshot?.name || 'Payment screenshot'}
                className="max-h-[60vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3.5">
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
                Change image
              </button>

              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="rounded-full bg-gray-900 px-6 py-2 text-xs font-bold text-white hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
