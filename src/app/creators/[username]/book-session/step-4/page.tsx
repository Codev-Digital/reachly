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
  const [promoApplied, setPromoApplied] = useState(true);
  const discountedPrice = promoApplied ? 600 : booking.selectedSession?.price;

  const handleContinue = () => {
    nextStep();
    router.push(`/creators/${params.username}/book-session/step-5`);
  };

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
                  <img src="/jazzcash.svg" alt="JazzCash" className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#C8A97E]">JazzCash</h4>
                  <p className="text-xs font-sans text-[#F9F6F2] opacity-70">Mobile wallet payment</p>
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
                You will receive a confirmation prompt on your JazzCash app. Please approve the transaction to complete your booking.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 border border-[rgba(200,169,126,0.3)] text-[#C8A97E] font-sans font-semibold py-3 px-6 rounded-full text-sm hover:border-[#C8A97E] transition-all">
                  Change method
                </button>
                <button
                  onClick={handleContinue}
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
