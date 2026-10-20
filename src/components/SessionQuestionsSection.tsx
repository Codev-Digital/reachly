'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import QuestionTypeDialog, { QUESTION_DIALOG_IMAGE } from '@/components/QuestionTypeDialog';
import SessionQuestionsPanel from '@/components/SessionQuestionsPanel';
import { usePreloadImages } from '@/lib/usePreloadImages';
import {
  INITIAL_QUESTIONS_PER_TYPE,
  MAX_QUESTIONS_PER_TYPE,
  QUESTION_TYPES,
  blankQuestion,
  type QuestionType,
  type SessionQuestion,
} from '@/lib/sessionQuestions';

/**
 * Questions part of the session form. A session can have multiple choice questions, short answer
 * questions, or both. Edits go straight into the form values and are saved with the form's own button.
 * - "Add Question" opens the type popup; the chosen type's editor appears below.
 * - The button is hidden once both types are in use.
 */
export default function SessionQuestionsSection({
  questions,
  onChange,
  showErrors,
}: {
  questions: SessionQuestion[];
  onChange: (questions: SessionQuestion[]) => void;
  /** Show what is missing on unfinished questions (after a failed save). */
  showErrors: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  usePreloadImages([QUESTION_DIALOG_IMAGE]);

  const itemsOf = (type: QuestionType) =>
    questions.flatMap((question, index) => (question.type === type ? [{ question, index }] : []));

  const usedTypes = QUESTION_TYPES.filter((t) => itemsOf(t).length > 0);
  const allTypesUsed = usedTypes.length === QUESTION_TYPES.length;

  const addGroup = (type: QuestionType) => {
    const fresh = Array.from({ length: INITIAL_QUESTIONS_PER_TYPE }, () => blankQuestion(type));
    const merged = [...questions, ...fresh];
    merged.sort((a, b) => QUESTION_TYPES.indexOf(a.type) - QUESTION_TYPES.indexOf(b.type));
    onChange(merged);
  };

  const addItem = (type: QuestionType) => {
    if (itemsOf(type).length >= MAX_QUESTIONS_PER_TYPE) return;
    const lastIndex = Math.max(...itemsOf(type).map((i) => i.index));
    const next = [...questions];
    next.splice(lastIndex + 1, 0, blankQuestion(type));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {usedTypes.map((type) => (
        <SessionQuestionsPanel
          key={type}
          type={type}
          items={itemsOf(type)}
          showErrors={showErrors}
          onChangeItem={(index, patch) =>
            onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)))
          }
          onDeleteItem={(index) => onChange(questions.filter((_, i) => i !== index))}
          onAddItem={() => addItem(type)}
        />
      ))}

      {!allTypesUsed && (
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-[8px] border-2 border-dashed border-[#e2e2e2] bg-[#F8F8F8] py-4 font-sans text-sm font-semibold text-gray-600 transition-colors hover:border-[#0012FF]/40 hover:text-[#0012FF] cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Question
        </button>
      )}

      <QuestionTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        disabledTypes={usedTypes}
        onContinue={addGroup}
      />
    </div>
  );
}
