'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBooking } from '@/app/creators/[username]/book-session/layout';

export default function BookingProgress({ currentStep }: { currentStep: number }) {
  const steps = [1, 2, 3, 4, 5];
  const params = useParams();
  const router = useRouter();
  const { setBooking } = useBooking();

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setBooking((b) => ({ ...b, step }));
      router.push(`/creators/${params.username}/book-session/step-${step}`);
    }
  };

  return (
    <div className="flex items-center py-6 sm:py-10 max-w-2xl mx-auto w-full select-none px-4">
      {steps.map((step, idx) => {
        const isCurrent = step === currentStep;
        const isComplete = step < currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => handleStepClick(step)}
              disabled={!isComplete}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={isComplete ? `Go to step ${step}` : `Step ${step}`}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all border shrink-0 ${
                isComplete ? 'cursor-pointer hover:opacity-90 active:scale-95' : 'cursor-default'
              } ${
                isCurrent
                  ? 'bg-[#EEF2FF] border-[#0012FF] text-[#0012FF]'
                  : isComplete
                    ? 'bg-[#0012FF] border-[#0012FF] text-white'
                    : 'bg-white border-[#e2e2e2] text-gray-400'
              }`}
            >
              {isComplete ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step
              )}
            </button>

            {idx < steps.length - 1 && (
              <div className={`flex-grow h-px ${isComplete ? 'bg-[#0012FF]' : 'bg-[#e2e2e2]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
