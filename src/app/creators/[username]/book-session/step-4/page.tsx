'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import CreatorProfileCard from '@/components/booking/CreatorProfileCard';
import { useBooking } from '../layout';

export default function BookSessionStep4() {
  const params = useParams();
  const router = useRouter();
  const { booking, nextStep, setBooking } = useBooking();
  const creator = booking.creator;
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [showQr, setShowQr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBack, setIsLoadingBack] = useState(false);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [saved, setSaved] = useState(true);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState('');

  // Reset loading states when switching between payment views
  useEffect(() => {
    setIsLoadingBack(false);
    setIsLoadingContinue(false);
  }, [showQr]);

  const handleContinue = () => {
    setShowQr(true);
  };

  const handleConfirmPayment = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const toISO = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const payload = {
        username: params.username,
        sessionId: booking.selectedSession?.id,
        date: booking.selectedDate ? toISO(booking.selectedDate) : null,
        time: booking.selectedTime,
        userDetails: booking.userDetails,
        proceedAs: booking.userDetails.proceedAs || 'guest',
        paymentMethod,
        promoApplied: null,
        finalPrice: booking.selectedSession?.price || 0,
        originalPrice: booking.selectedSession?.price || 0
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setBooking(b => ({ ...b, bookingRef: data.bookingRef }));
        nextStep();
        router.push(`/creators/${params.username}/book-session/step-5`);
      } else {
        setErrorModalMsg(data.error || 'Failed to place booking');
        setErrorModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setErrorModalMsg('An error occurred during booking creation.');
      setErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-2">
      {/* Step Progress Indicator */}
      <BookingProgress currentStep={4} />

      <div className="grid grid-cols-1 lg:grid-cols-[370px_1fr] gap-8 items-start justify-items-center">
        <CreatorProfileCard creator={creator} />


                {/* ============ RIGHT COLUMN: PAYMENT SELECTION / CONFIRMATION ============ */}
        <div className="w-full">
          {showQr ? (
            /* ============ VIEW: CONFIRMATION ============ */
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm w-full max-w-[790px] mx-auto">
              <div className="flex items-center gap-3.5 border-b border-gray-100 pb-5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">Confirm Payment</h3>
                  <p className="text-xs text-gray-400">
                    Authorize payment on your phone to complete your booking
                  </p>
                </div>
              </div>

              {/* Selected Method Details */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 mb-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-2 shadow-xs shrink-0">
                  <img
                    src={paymentMethod === 'jazzcash' ? '/assets/jazzcash.png' : '/assets/easypaisa (2).png'}
                    alt={paymentMethod}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    {paymentMethod === 'jazzcash' ? 'JazzCash Mobile Wallet' : 'EasyPaisa Mobile Wallet'}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    Fast mobile account authorization
                  </p>
                </div>
              </div>

              {/* Order breakdown */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Session price</span>
                  <span className="text-gray-900 font-bold">
                    PKR {booking.selectedSession?.price.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-800">Total Amount</span>
                  <span className="text-[#0012FF] text-lg font-black leading-none">
                    PKR {booking.selectedSession?.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 leading-relaxed mb-8">
                You will receive an automatic transaction prompt on your mobile number linked to your {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} account. Please unlock your phone and input your M-PIN to approve.
              </p>

              {/* Navigation Buttons inside QR panel */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 px-1 w-full gap-4 lg:justify-end">
                <button
                  onClick={() => {
                    setIsLoadingBack(true);
                    setShowQr(false);
                  }}
                  disabled={isLoadingBack || isSubmitting}
                  className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-full text-xs hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center min-w-[100px]"
                >
                  {isLoadingBack ? (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin"></div>
                  ) : (
                    "Back"
                  )}
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={isSubmitting}
                  className={`py-2.5 px-8 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center min-w-[150px] ${isSubmitting
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#0012FF] text-white hover:bg-[#0010d0]'
                    }`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#808BFF] border-t-white animate-spin"></div>
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ============ VIEW: METHOD SELECTION ============ */
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm w-full max-w-[790px] mx-auto">
              <div className="flex items-center gap-3.5 border-b border-gray-100 pb-5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0012FF" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                    <line x1="12" y1="4" x2="12" y2="20" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">Select Payment Method</h3>
                  <p className="text-xs text-gray-400">
                    Choose your preferred payment method to complete the booking
                  </p>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {/* JazzCash option */}
                <div
                  onClick={() => setPaymentMethod('jazzcash')}
                  className={`border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between h-44 shadow-xs ${paymentMethod === 'jazzcash'
                    ? 'border-[#0012FF] bg-[#EEF2FF]/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-1 shadow-sm">
                    <img src="/assets/jazzcash.png" alt="JazzCash" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">JazzCash</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                      Pay via your JazzCash mobile wallet. Instant confirmation.
                    </p>
                  </div>
                </div>

                {/* EasyPaisa option */}
                <div
                  onClick={() => setPaymentMethod('easypaisa')}
                  className={`border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between h-44 shadow-xs ${paymentMethod === 'easypaisa'
                    ? 'border-[#0012FF] bg-[#EEF2FF]/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                >
                  <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-1.5 shadow-sm">
                    <img src="/assets/easypaisa (2).png" alt="EasyPaisa" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">EasyPaisa</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                      Pay via your EasyPaisa account. Fast and secure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order breakdown */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 mt-6 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Session price</span>
                  <span className="text-gray-800 font-bold">
                    PKR {booking.selectedSession?.price.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200/50 pt-2.5 flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-800">Total Amount</span>
                  <span className="text-[#0012FF] text-sm font-black">
                    PKR {booking.selectedSession?.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Navigation buttons inside selection panel */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 px-1 w-full gap-4 lg:justify-end">
                <button
                  onClick={() => {
                    setIsLoadingBack(true);
                    router.push(`/creators/${params.username}/book-session/step-3`);
                  }}
                  disabled={isLoadingBack}
                  className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-full text-xs hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center min-w-[100px]"
                >
                  {isLoadingBack ? (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin"></div>
                  ) : (
                    "Back"
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsLoadingContinue(true);
                    setTimeout(() => setShowQr(true), 100);
                  }}
                  disabled={isLoadingContinue}
                  className="bg-[#0012FF] text-white hover:bg-[#0010d0] font-bold py-2.5 px-8 rounded-full text-xs transition-colors shadow-sm flex items-center justify-center min-w-[120px]"
                >
                  {isLoadingContinue ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#808BFF] border-t-white animate-spin"></div>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning/Error Modal styled exactly like CancelBookingModal */}
      {errorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] border border-[rgba(200,169,126,0.3)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-serif text-xl font-semibold text-[#F9F6F2] mb-2">Booking Warning</h2>
            <p className="font-sans text-sm text-[#F9F6F2] opacity-70 mb-6">
              {errorModalMsg}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setErrorModalOpen(false)}
                className="flex-1 bg-[#C8A97E] text-[#0C0C0C] px-4 py-2.5 rounded-full text-sm font-sans font-semibold hover:opacity-90 transition-all"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
