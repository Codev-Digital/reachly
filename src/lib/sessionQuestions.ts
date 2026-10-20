/**
 * Intake questions a creator can attach to a session. A session can have multiple-choice questions,
 * short-answer questions, or both. Pure helpers - used by the form and by the API.
 */

export type QuestionType = 'multiple_choice' | 'short_answer';

export interface SessionQuestion {
  type: QuestionType;
  question: string;
  /** Answer choices, only for multiple choice (2-4). */
  options: string[];
  required: boolean;
}

export const QUESTION_TYPES: QuestionType[] = ['multiple_choice', 'short_answer'];
export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  short_answer: 'Short Answer',
};

export const MAX_QUESTIONS_PER_TYPE = 5;
export const OPTIONS_PER_QUESTION = 4;
export const MIN_OPTIONS_PER_QUESTION = 2;
export const QUESTION_MAX_LENGTH = 300;
export const OPTION_MAX_LENGTH = 100;
export const OPTION_LABELS = ['A', 'B', 'C', 'D'];

/** Clean up questions coming from the client; returns an error message for anything invalid. */
export function sanitizeQuestions(raw: unknown): { value: SessionQuestion[] } | { error: string } {
  if (raw === undefined || raw === null) return { value: [] };
  if (!Array.isArray(raw)) return { error: 'Questions are invalid.' };

  const value: SessionQuestion[] = [];
  const counts: Record<QuestionType, number> = { multiple_choice: 0, short_answer: 0 };

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const q = item as Record<string, unknown>;
    const text = String(q.question ?? '').trim();
    if (!text) continue;

    const type: QuestionType = q.type === 'multiple_choice' ? 'multiple_choice' : 'short_answer';
    if (text.length > QUESTION_MAX_LENGTH) {
      return { error: `A question can have at most ${QUESTION_MAX_LENGTH} characters.` };
    }

    counts[type] += 1;
    if (counts[type] > MAX_QUESTIONS_PER_TYPE) {
      return { error: `You can add up to ${MAX_QUESTIONS_PER_TYPE} ${QUESTION_TYPE_LABEL[type].toLowerCase()} questions.` };
    }

    let options: string[] = [];
    if (type === 'multiple_choice') {
      options = (Array.isArray(q.options) ? q.options : [])
        .map((opt) => String(opt ?? '').trim())
        .filter(Boolean);
      if (options.length < MIN_OPTIONS_PER_QUESTION) {
        return { error: `"${text}" needs at least ${MIN_OPTIONS_PER_QUESTION} answer options.` };
      }
      if (options.length > OPTIONS_PER_QUESTION) {
        return { error: `A multiple choice question can have up to ${OPTIONS_PER_QUESTION} options.` };
      }
      if (options.some((opt) => opt.length > OPTION_MAX_LENGTH)) {
        return { error: `An answer option can have at most ${OPTION_MAX_LENGTH} characters.` };
      }
    }

    value.push({ type, question: text, options, required: q.required !== false });
  }

  // multiple choice first, then short answer - the same order the form shows them
  value.sort((a, b) => (a.type === b.type ? 0 : a.type === 'multiple_choice' ? -1 : 1));
  return { value };
}

/** Questions of one type, as stored on the session. */
export const questionsOfType = (questions: SessionQuestion[], type: QuestionType) =>
  questions.filter((q) => q.type === type);

/** Read stored questions (from the API) into the shape the form uses. */
export function normalizeStoredQuestions(raw: unknown): SessionQuestion[] {
  if (!Array.isArray(raw)) return [];
  const list: SessionQuestion[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const q = item as Record<string, unknown>;
    const text = String(q.question ?? '').trim();
    if (!text) continue;
    const type: QuestionType = q.type === 'multiple_choice' ? 'multiple_choice' : 'short_answer';
    const options =
      type === 'multiple_choice' && Array.isArray(q.options)
        ? q.options.map((o) => String(o ?? '').trim()).filter(Boolean).slice(0, OPTIONS_PER_QUESTION)
        : [];
    list.push({ type, question: text, options, required: q.required !== false });
  }
  return list;
}
