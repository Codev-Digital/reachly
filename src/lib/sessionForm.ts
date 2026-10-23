import { isRichTextEmpty } from '@/lib/richText';
import {
  cleanQuestionsForSave,
  normalizeStoredQuestions,
  questionsAreValid,
  withOptionSlots,
  type SessionQuestion,
} from '@/lib/sessionQuestions';

/** Shared by the "Add / Edit session" page and the creator onboarding sessions step. */

export const PRESET_DURATIONS = [
  { label: '15 mins', value: '15' },
  { label: '30 mins', value: '30' },
  { label: '45 mins', value: '45' },
  { label: '60 mins', value: '60' },
  { label: '90 mins', value: '90' },
];
export const CUSTOM_DURATION_OPTION = 'Custom Duration';
export const DURATION_OPTIONS = [...PRESET_DURATIONS.map((d) => d.label), CUSTOM_DURATION_OPTION];
export const MAX_DURATION_MINUTES = 1440;

// Buffer time (rest after a session) can never be longer than the session itself.
// Short sessions: 5-minute steps (5, 10, 15 ...). From 1 hour up: 15-minute steps (15, 30, 45, 60 ...).
export const NO_BUFFER_OPTION = 'No buffer';
export const CUSTOM_BUFFER_OPTION = 'Custom Buffer';
export const MAX_BUFFER_MINUTES = 120;

export const bufferChoicesFor = (durationMinutes: number): number[] => {
  if (!Number.isInteger(durationMinutes) || durationMinutes < 1) return [];
  const step = durationMinutes >= 60 ? 15 : 5;
  const max = Math.min(durationMinutes, MAX_BUFFER_MINUTES);
  const choices: number[] = [];
  for (let m = step; m <= max; m += step) choices.push(m);
  return choices;
};

export const bufferLabel = (minutes: number) => (minutes === 0 ? NO_BUFFER_OPTION : `${minutes} mins`);

export const isPresetDuration = (value: string) => PRESET_DURATIONS.some((d) => d.value === value);

/** Digits only - no decimals, signs or letters. */
export const digitsOnly = (value: string) => value.replace(/\D/g, '');

/** "45 mins", "1 hour", "1 hr 30 mins" ... */
export const formatDuration = (minutes: number | string) => {
  const m = Number(minutes);
  if (!Number.isFinite(m) || m < 1) return '';
  const hours = Math.floor(m / 60);
  const rest = m % 60;
  if (hours === 0) return `${rest} mins`;
  const h = hours === 1 ? '1 hour' : `${hours} hours`;
  return rest ? `${h} ${rest} mins` : h;
};

export interface SessionFormValues {
  title: string;
  /** Rich text (HTML). */
  description: string;
  /** Minutes, as typed. */
  duration: string;
  customDuration: boolean;
  /** Minutes, as typed or selected. */
  bufferTime: number | string;
  customBufferTime: boolean;
  price: string;
  discountedPrice: string;
  maxBookings: string;
  /** Intake questions (multiple choice and/or short answer). */
  questions: SessionQuestion[];
  /** Package = N sessions sold for one total price. */
  isPackage: boolean;
  packageSessions: string;
  packagePeriod: 'week' | 'month';
}

export type SessionErrorKey =
  | 'title'
  | 'description'
  | 'duration'
  | 'bufferTime'
  | 'price'
  | 'discountedPrice'
  | 'maxBookings'
  | 'packageSessions'
  | 'questions';
export type SessionErrors = Partial<Record<SessionErrorKey, string>>;

export const emptySessionValues = (): SessionFormValues => ({
  title: '',
  description: '',
  duration: '60',
  customDuration: false,
  bufferTime: 0,
  customBufferTime: false,
  price: '1200',
  discountedPrice: '',
  maxBookings: '4',
  questions: [],
  isPackage: false,
  packageSessions: '5',
  packagePeriod: 'week',
});

/** Build form values from a stored session (description must already be editor HTML). */
export const sessionToValues = (
  s: {
    title?: string;
    duration?: number | string;
    bufferTime?: number;
    price?: number | string;
    discountedPrice?: number | string | null;
    maxBookings?: number | string;
    questions?: unknown;
    isPackage?: boolean;
    packageSessions?: number | string;
    packagePeriod?: 'week' | 'month';
  },
  description: string
): SessionFormValues => {
  const dur = String(s.duration || '60');
  const durNum = Number(dur);
  const bufNum = Number(s.bufferTime) || 0;
  const isPresetBuf = bufNum === 0 || (durNum > 0 && bufferChoicesFor(durNum).includes(bufNum));

  return {
    title: s.title || '',
    description,
    duration: dur,
    customDuration: !isPresetDuration(dur),
    bufferTime: isPresetBuf ? bufNum : String(bufNum),
    customBufferTime: !isPresetBuf,
    price: String(s.price ?? ''),
    discountedPrice:
      s.discountedPrice !== undefined && s.discountedPrice !== null ? String(s.discountedPrice) : '',
    maxBookings: String(s.maxBookings || 4),
    questions: normalizeStoredQuestions(s.questions).map(withOptionSlots),
    isPackage: !!s.isPackage,
    packageSessions: String(s.packageSessions || 5),
    packagePeriod: s.packagePeriod === 'month' ? 'month' : 'week',
  };
};

/** The buffer actually saved: custom value clamped or largest valid choice not above the picked one. */
export const effectiveBufferFor = (values: SessionFormValues): number => {
  const dur = Number(values.duration) || 0;
  if (dur < 1) return 0;

  if (values.customBufferTime) {
    const buf = Number(values.bufferTime);
    if (!Number.isFinite(buf) || buf <= 0) return 0;
    return Math.min(Math.floor(buf), dur, MAX_BUFFER_MINUTES);
  }

  return (
    bufferChoicesFor(dur)
      .filter((m) => m <= Number(values.bufferTime))
      .pop() ?? 0
  );
};

export const validateSessionValues = (v: SessionFormValues): SessionErrors => {
  const next: SessionErrors = {};

  if (!v.title.trim()) next.title = 'Session title is required';
  if (isRichTextEmpty(v.description)) next.description = 'Session description is required';

  const durationNum = Number(v.duration);
  if (!v.duration || !Number.isInteger(durationNum) || durationNum < 1 || durationNum > MAX_DURATION_MINUTES) {
    next.duration = v.customDuration
      ? `Enter a duration between 1 and ${MAX_DURATION_MINUTES} minutes`
      : 'Please choose a duration';
  }

  if (v.customBufferTime) {
    const bufferNum = Number(v.bufferTime);
    if (v.bufferTime === '' || isNaN(bufferNum) || !Number.isInteger(bufferNum) || bufferNum < 0) {
      next.bufferTime = 'Enter a buffer time of 0 or more minutes';
    } else if (durationNum > 0 && bufferNum > durationNum) {
      next.bufferTime = `Buffer time cannot exceed session duration (${durationNum} mins)`;
    } else if (bufferNum > MAX_BUFFER_MINUTES) {
      next.bufferTime = `Buffer time cannot exceed ${MAX_BUFFER_MINUTES} mins`;
    }
  }

  const priceNum = Number(v.price);
  if (!v.price || !(priceNum >= 1)) next.price = 'Enter a price of at least 1 PKR';

  if (v.discountedPrice) {
    const discountNum = Number(v.discountedPrice);
    if (!(discountNum >= 1)) next.discountedPrice = 'Enter a discounted price of at least 1 PKR';
    else if (!next.price && discountNum >= priceNum) {
      next.discountedPrice = 'Discounted price must be less than the session price';
    }
  }

  const maxNum = Number(v.maxBookings);
  if (!v.maxBookings || !Number.isInteger(maxNum) || maxNum < 1) {
    next.maxBookings = 'Enter at least 1 booking per day';
  }

  if (v.isPackage) {
    const n = Number(v.packageSessions);
    if (!Number.isInteger(n) || n < 2 || n > 100) next.packageSessions = 'Enter between 2 and 100 sessions';
  }

  if (!questionsAreValid(v.questions)) {
    next.questions = 'Finish or delete the incomplete questions';
  }

  return next;
};

/** Fields sent to the API for a valid set of values. */
export const valuesToPayload = (v: SessionFormValues) => ({
  title: v.title.trim(),
  description: v.description,
  duration: Number(v.duration),
  price: Number(v.price),
  discountedPrice: v.discountedPrice ? Number(v.discountedPrice) : undefined,
  bufferTime: effectiveBufferFor(v),
  maxBookings: Number(v.maxBookings),
  questions: cleanQuestionsForSave(v.questions),
  isPackage: v.isPackage,
  packageSessions: v.isPackage ? Number(v.packageSessions) : undefined,
  packagePeriod: v.isPackage ? v.packagePeriod : undefined,
});

/** Scroll the first inline error into view after a failed validation. */
export const scrollToFirstError = () => {
  setTimeout(() => {
    document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
};
