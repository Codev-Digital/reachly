'use client';

import { Plus, Trash2 } from 'lucide-react';
import FormInput, { FormError, FormLabel } from '@/components/FormInput';
import {
  MAX_QUESTIONS_PER_TYPE,
  OPTION_LABELS,
  OPTION_MAX_LENGTH,
  QUESTION_MAX_LENGTH,
  questionIssues,
  type QuestionType,
  type SessionQuestion,
} from '@/lib/sessionQuestions';

export interface PanelItem {
  question: SessionQuestion;
  /** Position of the question in the session's full question list. */
  index: number;
}

const COPY: Record<QuestionType, { title: string; subtitle: string }> = {
  multiple_choice: { title: 'Multiple Choice', subtitle: 'Select from predefined answer options' },
  short_answer: { title: 'Short Answer', subtitle: 'Type their own answer in a text field' },
};

/**
 * Editor for one group of questions (multiple choice or short answer).
 * Edits go straight into the session form, so it is saved with the form's own save button.
 * Each question has a trash button at the end of its row.
 */
export default function SessionQuestionsPanel({
  type,
  items,
  showErrors,
  onChangeItem,
  onDeleteItem,
  onAddItem,
}: {
  type: QuestionType;
  items: PanelItem[];
  /** Show what is missing on unfinished questions (after a failed save). */
  showErrors: boolean;
  onChangeItem: (index: number, patch: Partial<SessionQuestion>) => void;
  onDeleteItem: (index: number) => void;
  onAddItem: () => void;
}) {
  const isChoice = type === 'multiple_choice';

  return (
    <div data-question-panel className="rounded-[16px] border border-[#e2e2e2] bg-white">
      <div className="px-5 pt-5 pb-4">
        <h3 className="font-sans text-base font-semibold text-black">{COPY[type].title}</h3>
        <p className="font-sans text-xs text-gray-500 mt-1">{COPY[type].subtitle}</p>
      </div>

      {items.map(({ question, index }, position) => {
        const issues = showErrors ? questionIssues(question) : {};
        return (
          <div key={index} className="border-t border-[#e2e2e2] px-5 py-4 space-y-4">
            <div className="flex items-start gap-2">
              <FormInput
                wrapperClassName="flex-1 min-w-0"
                label={`Question ${position + 1}`}
                required={position === 0}
                type="text"
                maxLength={QUESTION_MAX_LENGTH}
                value={question.question}
                onChange={(e) => onChangeItem(index, { question: e.target.value })}
                error={issues.question}
                placeholder="Enter your question"
              />
              <button
                type="button"
                onClick={() => onDeleteItem(index)}
                title="Delete question"
                aria-label={`Delete question ${position + 1}`}
                className="mt-5 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[8px] border border-[#e2e2e2] bg-white text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {isChoice && (
              <div>
                <FormLabel required={position === 0}>Answer</FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {question.options.map((option, k) => (
                    <FormInput
                      key={k}
                      type="text"
                      maxLength={OPTION_MAX_LENGTH}
                      value={option}
                      onChange={(e) =>
                        onChangeItem(index, {
                          options: question.options.map((o, i) => (i === k ? e.target.value : o)),
                        })
                      }
                      aria-label={`Question ${position + 1} option ${OPTION_LABELS[k]}`}
                      placeholder={`Option ${OPTION_LABELS[k]}`}
                    />
                  ))}
                </div>
                {issues.options && <FormError className="mt-2">{issues.options}</FormError>}
              </div>
            )}
          </div>
        );
      })}

      <div className="border-t border-[#e2e2e2] px-5 py-4">
        {items.length < MAX_QUESTIONS_PER_TYPE ? (
          <button
            type="button"
            onClick={onAddItem}
            className="w-full flex items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#0012FF]/40 bg-[#0012FF]/5 py-3 text-xs font-semibold text-[#0012FF] transition-colors hover:bg-[#0012FF]/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Add Question
          </button>
        ) : (
          <p className="text-center text-xs text-gray-500">
            You&apos;ve reached the limit of {MAX_QUESTIONS_PER_TYPE} questions.
          </p>
        )}
      </div>
    </div>
  );
}
