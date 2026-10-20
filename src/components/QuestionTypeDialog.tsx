'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Check, ListChecks, Type } from 'lucide-react';
import ActionDialog from '@/components/ActionDialog';
import { cn } from '@/lib/cn';
import { QUESTION_TYPES, type QuestionType } from '@/lib/sessionQuestions';

const OPTIONS: Record<QuestionType, { title: string; description: string; icon: ReactNode }> = {
  multiple_choice: {
    title: 'Multiple Choice',
    description: 'Select from predefined answer options.',
    icon: <ListChecks className="w-5 h-5" aria-hidden="true" />,
  },
  short_answer: {
    title: 'Short Answer',
    description: 'Type their own answer in a text field.',
    icon: <Type className="w-5 h-5" aria-hidden="true" />,
  },
};

export const QUESTION_DIALOG_IMAGE = '/assets/add-category-sm.webp';

/** "Choose Question Type" popup shown by the Add Question button. */
export default function QuestionTypeDialog({
  open,
  onOpenChange,
  onContinue,
  disabledTypes = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the chosen type when the creator presses Continue. */
  onContinue: (type: QuestionType) => void;
  /** Types the session already has - shown greyed out and can't be picked again. */
  disabledTypes?: QuestionType[];
}) {
  const firstAvailable = QUESTION_TYPES.find((t) => !disabledTypes.includes(t));
  const [type, setType] = useState<QuestionType | undefined>(firstAvailable);

  // Start from the first available choice every time the popup opens
  useEffect(() => {
    if (open) setType(QUESTION_TYPES.find((t) => !disabledTypes.includes(t)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      image={{ src: QUESTION_DIALOG_IMAGE, alt: 'Add question' }}
      title="Choose Question Type"
      description="Select how you want respondents to answer your question."
      actions={[
        {
          label: 'Continue',
          disabled: !type,
          onClick: () => {
            if (!type) return;
            onOpenChange(false);
            onContinue(type);
          },
        },
      ]}
      classNames={{ content: 'sm:max-w-[480px]' }}
    >
      <div role="radiogroup" aria-label="Question type" className="w-full space-y-3 mb-6">
        {QUESTION_TYPES.map((value) => {
          const option = OPTIONS[value];
          const disabled = disabledTypes.includes(value);
          const selected = value === type;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => setType(value)}
              className={cn(
                'w-full flex items-center gap-3 rounded-[12px] border p-3 text-left transition-colors cursor-pointer',
                'disabled:cursor-not-allowed disabled:opacity-50',
                selected
                  ? 'bg-[#E8E9FB] border-[#C9CCF5]'
                  : 'bg-white border-[#e2e2e2] enabled:hover:border-[#c9ccf5]'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[#0012FF]',
                  selected ? 'bg-white' : 'bg-[#E8E9FB]'
                )}
              >
                {option.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-black">{option.title}</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {disabled ? 'Already added to this session.' : option.description}
                </span>
              </span>
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white',
                  selected ? 'bg-[#0012FF]' : 'bg-gray-200'
                )}
              >
                <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
    </ActionDialog>
  );
}
