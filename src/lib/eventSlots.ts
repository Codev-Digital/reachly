import { fromISODate, type DayPeriod, type EventDayData } from '@/lib/eventTicketing';

/** Accent colours for the left bar of each slot, cycling in order. */
export const SLOT_ACCENTS = ['#FF6B8A', '#F5C542', '#4CD97B'] as const;

export const SLOT_DESCRIPTION_MAX_LENGTH = 300;
export const MAX_SLOTS_PER_DATE = 10;

export interface ScheduleSlot {
  id: string;
  description: string;
  /** Whether the description field is open under the row. */
  showDescription: boolean;
}

export type ScheduleSlotsValues = Record<string, ScheduleSlot[]>;

export const emptyScheduleSlots = (): ScheduleSlotsValues => ({});

export const newSlotId = () =>
  `slot_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const emptySlot = (): ScheduleSlot => ({
  id: newSlotId(),
  description: '',
  showDescription: false,
});

const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "2 August" */
export const slotDateDayMonth = (iso: string) => {
  const d = fromISODate(iso);
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]}`;
};

/** "Monday" */
export const slotDateWeekday = (iso: string) => WEEKDAYS_FULL[fromISODate(iso).getDay()];

/** "10:00 AM" from a day's starting time in Ticketing, or "" when not set. */
export const formatDayStartTime = (day?: Pick<EventDayData, 'startHour' | 'startMinute' | 'startPeriod'> | null) => {
  if (!day?.startHour) return '';
  return `${day.startHour}:${day.startMinute || '00'} ${day.startPeriod as DayPeriod}`;
};

/**
 * Keep the schedule map in sync with the dates from Ticketing & Pricing.
 * New dates get one empty slot; removed dates drop their slots.
 */
export const syncSlotsWithDates = (
  dates: string[],
  slots: ScheduleSlotsValues
): ScheduleSlotsValues => {
  const next: ScheduleSlotsValues = {};
  for (const iso of dates) {
    next[iso] = slots[iso]?.length ? slots[iso] : [emptySlot()];
  }
  return next;
};
