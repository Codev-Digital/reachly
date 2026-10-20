'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import FormInput, { FormError, FormLabel } from '@/components/FormInput';
import { Button } from '@/components/ui/button';
import {
  MAX_QUESTIONS_PER_TYPE,
  MIN_OPTIONS_PER_QUESTION,
  OPTIONS_PER_QUESTION,
  OPTION_LABELS,
  OPTION_MAX_LENGTH,
  QUESTION_MAX_LENGTH,
  type QuestionType,
  type SessionQuestion,
} from '@/lib/sessionQuestions';

interface Row {
  question: string;
  options: string[];
}
interface RowErrors {
  question?: string;
  options?: string;
}

const COPY: Record<QuestionType, { title: string; subtitle: string }> = {
  multiple_choice: { title: 'Multiple Choice', subtitle: 'Select from predefined answer options' },
  short_answer: { title: 'Short Answer', subtitle: 'Type their own answer in a text field' },
};

const blankRow = (): Row => ({ question: '', options: Array(OPTIONS_PER_QUESTION).fill('') });

/** Fixed number of question slots, filled from the saved questions of this type. */
const buildRows = (initial: SessionQuestion[]): Row[] =>
  Array.from({ length: MAX_QUESTIONS_PER_TYPE }, (_, i) => {
    const q = initial[i];
    if (!q) return blankRow();
    return {
      question: q.question,
      options: Array.from({ length: OPTIONS_PER_QUESTION }, (_, k) => q.options[k] ?? ''),
    };
  });

/**
 * Editor for one group of questions (multiple choice or short answer).
 * Shown in place of the "Add Question" button. Empty slots are ignored when saving.
 */
export default function SessionQuestionsPanel({
  type,
  initial,
  onSave,
  onBack,
  onCancel,
}: {
  type: QuestionType;
  initial: SessionQuestion[];
  onSave: (questions: SessionQuestion[]) => void;
  /** Back to the "Choose Question Type" popup. */
  onBack: () => void;
  onCancel: () => void;
}) {
  const isChoice = type === 'multiple_choice';
  const [rows, setRows] = useState<Row[]>(() => buildRows(initial));
  const [errors, setErrors] = useState<RowErrors[]>([]);
  const [formError, setFormError] = useState('');

  const clearRowError = (index: number, key: keyof RowErrors) =>
    setErrors((prev) => (prev[index]?.[key] ? prev.map((e, i) => (i === index ? { ...e, [key]: '' } : e)) : prev));

  const setQuestion = (index: number, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, question: value } : r)));
    clearRowError(index, 'question');
    setFormError('');
  };

  const setOption = (index: number, optionIndex: number, value: string) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, options: r.options.map((o, k) => (k === optionIndex ? value : o)) } : r
      )
    );
    clearRowError(index, 'options');
    setFormError('');
  };

  const handleSave = () => {
    const next: RowErrors[] = rows.map(() => ({}));
    const questions: SessionQuestion[] = [];

    rows.forEach((row, i) => {
      const text = row.question.trim();
      const options = row.options.map((o) => o.trim()).filter(Boolean);
      const started = !!text || (isChoice && options.length > 0);
      if (!started) return;

      if (!text) next[i].question = 'Enter the question';
      if (isChoice && options.length < MIN_OPTIONS_PER_QUESTION) {
        next[i].options = `Add at least ${MIN_OPTIONS_PER_QUESTION} answer options`;
      }
      if (text && (!isChoice || options.length >= MIN_OPTIONS_PER_QUESTION)) {
        questions.push({ type, question: text, options: isChoice ? options : [], required: true });
      }
    });

    const hasRowErrors = next.some((e) => e.question || e.options);
    setErrors(next);

    if (hasRowErrors) {
      setFormError('');
      setTimeout(() => {
        document.querySelector('[data-question-panel] [role="alert"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    if (questions.length === 0) {
      setErrors(rows.map((_, i) => (i === 0 ? { question: 'Enter at least one question' } : {})));
      setFormError('');
      return;
    }
    onSave(questions);
  };

  return (
    <div data-question-panel className="rounded-[16px] border border-[#e2e2e2] bg-white">
      <div className="px-5 pt-5 pb-4">
        <h3 className="font-sans text-base font-semibold text-black">{COPY[type].title}</h3>
        <p className="font-sans text-xs text-gray-500 mt-1">{COPY[type].subtitle}</p>
      </div>

      {rows.map((row, i) => (
        <div key={i} className="border-t border-[#e2e2e2] px-5 py-4 space-y-4">
          <FormInput
            label={`Question ${i + 1}`}
            required={i === 0}
            type="text"
            maxLength={QUESTION_MAX_LENGTH}
            value={row.question}
            onChange={(e) => setQuestion(i, e.target.value)}
            error={errors[i]?.question}
            placeholder="Enter your question"
          />

          {isChoice && (
            <div>
              <FormLabel required={i === 0}>Answer</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {row.options.map((option, k) => (
                  <FormInput
                    key={k}
                    type="text"
                    maxLength={OPTION_MAX_LENGTH}
                    value={option}
                    onChange={(e) => setOption(i, k, e.target.value)}
                    aria-label={`Question ${i + 1} option ${OPTION_LABELS[k]}`}
                    placeholder={`Option ${OPTION_LABELS[k]}`}
                  />
                ))}
              </div>
              {errors[i]?.options && <FormError className="mt-2">{errors[i].options}</FormError>}
            </div>
          )}
        </div>
      ))}

      <div className="border-t border-[#e2e2e2] px-5 py-4">
        {formError && <FormError className="mb-3">{formError}</FormError>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={onBack} className="rounded-full px-6 py-2.5 text-xs text-gray-500">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="rounded-full px-6 py-2.5 text-xs border-[#0012FF] text-[#0012FF] hover:bg-[#0012FF]/5"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="rounded-full px-6 py-2.5 text-xs">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
