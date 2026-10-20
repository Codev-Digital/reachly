'use client';

import { useState, type ReactNode } from 'react';
import { ListChecks, Pencil, Plus, Trash2, Type } from 'lucide-react';
import QuestionTypeDialog, { QUESTION_DIALOG_IMAGE } from '@/components/QuestionTypeDialog';
import SessionQuestionsPanel from '@/components/SessionQuestionsPanel';
import { usePreloadImages } from '@/lib/usePreloadImages';
import {
  QUESTION_TYPES,
  QUESTION_TYPE_LABEL,
  questionsOfType,
  type QuestionType,
  type SessionQuestion,
} from '@/lib/sessionQuestions';

const TYPE_ICON: Record<QuestionType, ReactNode> = {
  multiple_choice: <ListChecks className="w-5 h-5" aria-hidden="true" />,
  short_answer: <Type className="w-5 h-5" aria-hidden="true" />,
};

/**
 * Questions part of the session form.
 * - Saved question groups are listed (a session can have multiple choice, short answer, or both).
 * - "Add Question" opens the type popup; once a type is chosen the button is replaced by that
 *   type's editor, and it only comes back when the editor is closed and a type is still available.
 */
export default function SessionQuestionsSection({
  questions,
  onChange,
}: {
  questions: SessionQuestion[];
  onChange: (questions: SessionQuestion[]) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<QuestionType | null>(null);
  usePreloadImages([QUESTION_DIALOG_IMAGE]);

  const savedTypes = QUESTION_TYPES.filter((t) => questionsOfType(questions, t).length > 0);
  const allTypesAdded = savedTypes.length === QUESTION_TYPES.length;

  const saveGroup = (type: QuestionType, group: SessionQuestion[]) => {
    const others = questions.filter((q) => q.type !== type);
    const merged = [...others, ...group];
    // multiple choice first, then short answer
    merged.sort((a, b) => QUESTION_TYPES.indexOf(a.type) - QUESTION_TYPES.indexOf(b.type));
    onChange(merged);
    setEditingType(null);
  };

  const removeGroup = (type: QuestionType) => onChange(questions.filter((q) => q.type !== type));

  return (
    <div className="space-y-3">
      {/* Saved groups */}
      {savedTypes
        .filter((t) => t !== editingType)
        .map((type) => {
          const group = questionsOfType(questions, type);
          return (
            <div
              key={type}
              className="flex items-start gap-3 rounded-[12px] border border-[#e2e2e2] bg-white p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#E8E9FB] text-[#0012FF]">
                {TYPE_ICON[type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-black">
                  {QUESTION_TYPE_LABEL[type]}{' '}
                  <span className="font-normal text-gray-500">
                    · {group.length} {group.length === 1 ? 'question' : 'questions'}
                  </span>
                </p>
                <ul className="mt-1.5 space-y-0.5">
                  {group.map((q, i) => (
                    <li key={i} className="truncate text-xs text-gray-500">
                      {i + 1}. {q.question}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditingType(type)}
                  title="Edit questions"
                  aria-label={`Edit ${QUESTION_TYPE_LABEL[type]} questions`}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-[#0012FF] cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeGroup(type)}
                  title="Remove questions"
                  aria-label={`Remove ${QUESTION_TYPE_LABEL[type]} questions`}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

      {/* Editor replaces the button while a type is selected */}
      {editingType ? (
        <SessionQuestionsPanel
          key={editingType}
          type={editingType}
          initial={questionsOfType(questions, editingType)}
          onSave={(group) => saveGroup(editingType, group)}
          onBack={() => {
            setEditingType(null);
            setDialogOpen(true);
          }}
          onCancel={() => setEditingType(null)}
        />
      ) : (
        !allTypesAdded && (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-[8px] border-2 border-dashed border-[#e2e2e2] bg-[#F8F8F8] py-4 font-sans text-sm font-semibold text-gray-600 transition-colors hover:border-[#0012FF]/40 hover:text-[#0012FF] cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Question
          </button>
        )
      )}

      <QuestionTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        disabledTypes={savedTypes}
        onContinue={setEditingType}
      />
    </div>
  );
}
