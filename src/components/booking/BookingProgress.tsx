'use client';

export default function BookingProgress({ currentStep }: { currentStep: number }) {
  const steps = [1, 2, 3, 4, 5];
  
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-6 sm:py-8 max-w-3xl mx-auto">
      {steps.map((step) => (
        <div key={step} className="flex items-center">
          {/* Step Circle */}
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-serif font-bold transition-all ${
              step < currentStep
                ? 'bg-[#C8A97E] text-[#0C0C0C]'
                : step === currentStep
                ? 'bg-[#C8A97E] text-[#0C0C0C] scale-110'
                : 'bg-[#141414] text-[#F9F6F2] opacity-50 border border-[rgba(200,169,126,0.3)]'
            }`}
          >
            {step < currentStep ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0C0C0C" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              step
            )}
          </div>
          {/* Line */}
          {step < 5 && (
            <div
              className={`w-12 sm:w-20 h-px mx-1 sm:mx-2 ${
                step < currentStep ? 'bg-[#C8A97E]' : 'bg-[rgba(200,169,126,0.2)]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
