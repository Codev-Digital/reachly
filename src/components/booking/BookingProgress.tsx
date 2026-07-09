'use client';

export default function BookingProgress({ currentStep }: { currentStep: number }) {
  const steps = [1, 2, 3, 4, 5];
  
  return (
    <div className="flex items-center justify-center py-8 sm:py-10 max-w-3xl mx-auto select-none">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center">
          {/* Step Box */}
          <div
            className={`w-9 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all border ${
              step === currentStep
                ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF]'
                : step < currentStep
                ? 'bg-[#0012FF] border-[#0012FF] text-white'
                : 'bg-white border-gray-200 text-gray-400'
            }`}
          >
            {step < currentStep ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              step
            )}
          </div>
          {/* Line */}
          {idx < steps.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-px mx-2 ${
                step < currentStep ? 'bg-[#0012FF]/60' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
