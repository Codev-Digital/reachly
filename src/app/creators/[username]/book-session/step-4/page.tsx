'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingSummary from '@/components/booking/BookingSummary';
import { useBooking } from '../layout';

export default function BookSessionStep4() {
  const params = useParams();
  const router = useRouter();
  const { booking, nextStep } = useBooking();
  const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [promoApplied, setPromoApplied] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const discountedPrice = promoApplied ? 600 : booking.selectedSession?.price;

  const handleContinue = () => {
    setShowConfirmation(true);
  };

  const handleConfirmPayment = () => {
    nextStep();
    router.push(`/creators/${params.username}/book-session/step-5`);
  };

  if (showConfirmation) {
    return (
      <div>
        <BookingProgress currentStep={4} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Payment Confirmation */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#C8A97E]">Confirm Payment</h3>
              
              <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6">
                {/* Payment Method Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <img 
                      src={paymentMethod === 'jazzcash' ? '/jazzcash.svg' : '/easypaisa.png'} 
                      alt={paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} 
                      className="w-8 h-8" 
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#C8A97E]">
                      {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'}
                    </h4>
                    <p className="text-xs font-sans text-[#F9F6F2] opacity-70">
                      {paymentMethod === 'jazzcash' ? 'Mobile wallet payment' : 'Mobile wallet payment'}
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="font-sans text-sm text-[#F9F6F2] opacity-70">Session price</span>
                    <span className="font-sans text-sm text-[#F9F6F2]">PKR {booking.selectedSession?.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-sm text-[#F9F6F2] opacity-70">Promo discount</span>
                    <span className="font-sans text-sm text-[#C8A97E]">- PKR 600</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[rgba(255,255,255,0.1)]">
                    <span className="font-sans text-sm font-bold text-[#F9F6F2]">Total</span>
                    <span className="font-serif text-xl font-bold text-[#C8A97E]">PKR {discountedPrice}</span>
                  </div>
                </div>

                <p className="text-xs font-sans text-[#F9F6F2] opacity-70 mb-6">
                  You will receive a confirmation prompt on your {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} app. Please approve the transaction to complete your booking.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-sans font-semibold py-3 px-6 rounded-full text-sm hover:border-[#C8A97E] transition-all"
                  >
                    Change method
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="flex-1 font-serif font-semibold py-3 px-6 rounded-full text-sm transition-all bg-[#C8A97E] text-[#0C0C0C] hover:opacity-90"
                  >
                    Confirm Payment
                  </button>
                </div>
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

  return (
    <div>
      <BookingProgress currentStep={4} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Payment */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#C8A97E]">Choose Payment Method</h3>
            
            {/* Payment Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod('jazzcash')}
                className={`bg-[#141414] border rounded-xl p-6 cursor-pointer transition-all ${
                  paymentMethod === 'jazzcash'
                    ? 'border-[#C8A97E]'
                    : 'border-[rgba(200,169,126,0.3)] hover:border-[#C8A97E]'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3">
                  <img src="/jazzcash.svg" alt="JazzCash" className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-[#C8A97E] mb-1">JazzCash</h4>
                <p className="text-xs font-sans text-[#F9F6F2] opacity-70">
                  Pay via your JazzCash mobile wallet. Instant confirmation.
                </p>
              </div>

              <div
                onClick={() => setPaymentMethod('easypaisa')}
                className={`bg-[#141414] border rounded-xl p-6 cursor-pointer transition-all ${
                  paymentMethod === 'easypaisa'
                    ? 'border-[#C8A97E]'
                    : 'border-[rgba(200,169,126,0.3)] hover:border-[#C8A97E]'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3">
                  <img src="/easypaisa.png" alt="EasyPaisa" className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-sm font-semibold text-[#C8A97E] mb-1">EasyPaisa</h4>
                <p className="text-xs font-sans text-[#F9F6F2] opacity-70">
                  Pay via your EasyPaisa account. Fast and secure.
                </p>
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-5">
              <h4 className="font-serif text-sm font-bold text-[#C8A97E] mb-3">Promo code</h4>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoApplied ? 'REACHLY50' : ''}
                  onChange={(e) => setPromoApplied(e.target.value.toLowerCase() === 'reachly50')}
                  className="flex-1 bg-[#0C0C0C] border border-[rgba(200,169,126,0.3)] rounded-lg px-4 py-2 text-sm font-sans text-[#F9F6F2] focus:outline-none focus:border-[#C8A97E]"
                />
                <button
                  onClick={() => setPromoApplied(!promoApplied)}
                  className="bg-[rgba(200,169,126,0.2)] text-[#C8A97E] px-6 py-2 rounded-lg text-sm font-sans font-semibold transition-all hover:bg-[#C8A97E] hover:text-[#0C0C0C]"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="text-xs font-sans text-[#C8A97E] mt-3">
                  Promo applied! You saved PKR 600
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-5">
              <h4 className="font-serif text-sm font-bold text-[#C8A97E] mb-4">Order Summary</h4>
              <div className="flex justify-between items-center mb-4">
                <span className="font-sans text-sm text-[#F9F6F2]">
                  {booking.selectedSession?.title}
                </span>
                <span className="font-sans text-sm text-[#F9F6F2]">
                  Rs. {booking.selectedSession?.price}
                </span>
              </div>
              <div className="border-t border-[rgba(255,255,255,0.1)] pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-sans text-sm text-[#F9F6F2] opacity-70">Total</span>
                  <span className="font-serif text-xl font-bold text-[#C8A97E]">
                    PKR {promoApplied ? 600 : booking.selectedSession?.price}
                  </span>
                </div>
                <button className="text-xs font-sans text-[#C8A97E] flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Edit booking details
                </button>
              </div>
            </div>

            {/* Payment Security Icons */}
            <div className="bg-[#141414] border border-[rgba(200,169,126,0.3)] rounded-xl p-6 flex items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span className="font-serif text-base text-[#F9F6F2]">Secure payment</span>
              </div>
              <div className="h-8 w-px bg-[rgba(200,169,126,0.3)]"></div>
              <div className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span className="font-serif text-base text-[#F9F6F2]">Money-back guarantee</span>
              </div>
              <div className="h-8 w-px bg-[rgba(200,169,126,0.3)]"></div>
              <div className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8A97E" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="font-serif text-base text-[#F9F6F2]">256-bit encryption</span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                onClick={() => router.push(`/creators/${params.username}/book-session/step-3`)}
                className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-serif font-semibold py-3 px-6 rounded-full text-sm hover:border-[#C8A97E] transition-all flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to your details
              </button>

              <button
                onClick={handleContinue}
                className="flex-1 font-serif font-semibold py-3 px-6 rounded-full text-sm transition-all bg-[#C8A97E] text-[#0C0C0C] hover:opacity-90 flex items-center justify-center gap-2"
              >
                Continue to Payment
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
