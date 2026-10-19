/**
 * Time-slot helpers shared by the availability API and the booking API.
 *
 * A session blocks `duration + buffer` minutes: the meeting itself plus the rest time after it.
 * Slots are therefore spaced `duration + buffer` apart (90 min + 15 buffer -> 9:00, 10:45, 12:30 ...).
 */

export const DEFAULT_SLOT_MINUTES = 30;

/** "09:00" (24h, used by the schedule) -> minutes since midnight. */
export const parse24h = (value: string): number => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + (m || 0);
};

/** "05:30 PM" (as stored on bookings / shown to users) -> minutes since midnight, or null. */
export const parse12h = (value: string): number | null => {
  const match = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i.exec(value || '');
  if (!match) return null;
  let h = Number(match[1]) % 12;
  const m = Number(match[2]);
  if (match[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + m;
};

/** Minutes since midnight -> "05:30 PM". */
export const format12h = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
};

export interface Interval {
  start: number;
  end: number;
}

/** True when two half-open [start, end) intervals share any time. */
export const intervalsOverlap = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

/** The time a booking blocks: the meeting plus its buffer. */
export const blockedInterval = (startMinutes: number, duration: number, buffer: number): Interval => ({
  start: startMinutes,
  end: startMinutes + duration + buffer,
});

/**
 * Start times (minutes) inside a working range. Each meeting must fit before the range ends;
 * the next one starts after the previous meeting's buffer.
 */
export const generateStarts = (rangeStart: number, rangeEnd: number, duration: number, buffer: number): number[] => {
  const step = Math.max(1, duration + buffer);
  const starts: number[] = [];
  for (let cur = rangeStart; cur + duration <= rangeEnd; cur += step) starts.push(cur);
  return starts;
};
