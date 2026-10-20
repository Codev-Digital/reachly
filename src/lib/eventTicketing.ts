// UI-only types and helpers for the "Ticketing & Pricing" step of the create-event form.

export type DayPeriod = 'AM' | 'PM';
export const DAY_PERIODS: DayPeriod[] = ['AM', 'PM'];

export { EVENT_CATEGORIES } from '@/lib/eventConstants';

export const MAX_TIERS_PER_DATE = 3;
export const TIER_TITLE_MAX_LENGTH = 40;
export const DEFAULT_TIER_PERSONS = '1';

export interface EventTier {
  id: string;
  title: string;
  /** Digits only, in PKR. "0" means free. */
  price: string;
  /** Total people this tier allows. Digits only. */
  persons: string;
  /** How many tickets of this tier are available on the date. Digits only. */
  quantity: string;
}

/** Everything the creator enters for one date of the event. */
export interface EventDayData {
  /** Hour and minute as picked in the dropdowns ("" until chosen), e.g. "9" and "05". */
  startHour: string;
  startMinute: string;
  startPeriod: DayPeriod;
  endHour: string;
  endMinute: string;
  endPeriod: DayPeriod;
  tiers: EventTier[];
  /** @deprecated Kept for older form state; UI no longer uses a selected-tier dropdown. */
  selectedTierId: string | null;
}

export interface TicketingValues {
  /** One category for the whole event. */
  category: string;
  /** Selected dates as YYYY-MM-DD, sorted ascending. */
  dates: string[];
  /** The date whose details are shown in the form below the calendar. */
  activeDate: string | null;
  /** Details saved per date. */
  days: Record<string, EventDayData>;
}

export const emptyDay = (): EventDayData => ({
  startHour: '',
  startMinute: '',
  startPeriod: 'AM',
  endHour: '',
  endMinute: '',
  endPeriod: 'PM',
  tiers: [],
  selectedTierId: null,
});

export const emptyTicketing = (): TicketingValues => ({ category: '', dates: [], activeDate: null, days: {} });

export const newTierId = () => `tier_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

/** Fresh tier copies for another date (new ids; quantity starts empty so stock is set per day). */
export const cloneTiersForDate = (tiers: EventTier[]): EventTier[] =>
  tiers.map((t) => ({
    id: newTierId(),
    title: t.title,
    price: t.price,
    persons: t.persons,
    quantity: '',
  }));

/** Prefer the day that already has the most tiers when seeding a newly picked date. */
export const pickTierTemplateDay = (
  days: Record<string, EventDayData>,
  preferIso?: string | null
): EventDayData | undefined => {
  const preferred = preferIso ? days[preferIso] : undefined;
  if (preferred?.tiers.length) return preferred;

  let best: EventDayData | undefined;
  for (const day of Object.values(days)) {
    if (!best || day.tiers.length > best.tiers.length) best = day;
  }
  return best?.tiers.length ? best : undefined;
};

// ---- dates (local time, never UTC, so the picked day can't shift) ----

const pad = (n: number) => String(n).padStart(2, '0');

export const toISODate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromISODate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Tue 20 Oct" */
export const shortDateLabel = (iso: string) => {
  const d = fromISODate(iso);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** "Tue, 20 Oct 2026" */
export const longDateLabel = (iso: string) => {
  const d = fromISODate(iso);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// ---- tiers ----

export const formatPrice = (price: string) => {
  const n = Number(price);
  return n === 0 ? 'Free' : `PKR ${n.toLocaleString('en-US')}`;
};

export interface TierFormValues {
  title: string;
  price: string;
  persons: string;
}

export type TierFormErrors = Partial<Record<keyof TierFormValues, string>>;

export const validateTier = (values: TierFormValues, takenTitles: string[]): TierFormErrors => {
  const errors: TierFormErrors = {};
  const title = values.title.trim();
  if (!title) errors.title = 'Enter a tier title.';
  else if (takenTitles.some((t) => t.trim().toLowerCase() === title.toLowerCase())) {
    errors.title = 'A tier with this title already exists for this date.';
  }
  if (values.price === '') errors.price = 'Enter the tier price.';
  if (!values.persons || Number(values.persons) < 1) errors.persons = 'Allow at least 1 person.';
  return errors;
};
