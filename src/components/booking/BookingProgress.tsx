'use client';

export default function BookingProgress({ currentStep }: { currentStep: number }) {
  const steps = [1, 2, 3, 4, 5];
  
  return (
    <div className="flex items-center justify-center py-6 sm:py-10 max-w-2xl mx-auto w-full select-none px-4">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center flex-1 justify-center last:flex-initial">
          {/* Step Box */}
          <div
            className={`w-9 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all border shrink-0 ${
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
              className={`flex-grow h-px mx-1.5 max-w-[60px] min-w-[12px] ${
                step < currentStep ? 'bg-[#0012FF]/60' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
