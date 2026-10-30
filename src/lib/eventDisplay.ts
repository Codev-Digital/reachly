import { fromISODate } from '@/lib/eventTicketing';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatEventCardDate(iso?: string) {
  if (!iso) return 'Date TBA';
  const d = fromISODate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatEventCardTime(day?: {
  startHour?: string;
  startMinute?: string;
  startPeriod?: string;
  endHour?: string;
  endMinute?: string;
  endPeriod?: string;
}) {
  if (!day?.startHour) return 'Time TBA';
  const start = `${day.startHour}:${day.startMinute || '00'} ${day.startPeriod || 'AM'}`;
  if (!day.endHour) return start;
  return `${start} - ${day.endHour}:${day.endMinute || '00'} ${day.endPeriod || 'PM'}`;
}

export function formatEventLocation(event?: {
  eventMode?: string | null;
  location?: string | null;
  category?: string | null;
  creator?: {
    city?: string | null;
    country?: string | null;
    displayName?: string | null;
  } | null;
} | null): string {
  if (!event) return 'Location TBA';
  if (event.eventMode === 'Online') return 'Online';
  if (event.location && event.location.trim()) return event.location.trim();
  const place = [event.creator?.city, event.creator?.country].filter(Boolean).join(', ');
  if (place) return place;
  if (event.eventMode === 'Physical') return 'Location TBA';
  return event.creator?.displayName || event.category || 'Online';
}
