/**
 * Server-side validation + sanitization for creator events.
 *
 * This app uses MongoDB (not SQL). Protection is still required against:
 * - XSS via rich-text / HTML injection (sanitize-html)
 * - NoSQL injection (never pass raw client objects into queries; typed fields only)
 * - Oversized / malformed payloads (strict types, lengths, enums, digit bounds)
 */

import mongoose from 'mongoose';
import { sanitizeRichText } from '@/lib/sanitizeRichText';
import { richTextLength } from '@/lib/richText';
import {
  EVENT_BANNER_MAX_BYTES,
  EVENT_BANNER_MIME,
  EVENT_CATEGORIES,
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_HOUR_OPTIONS,
  EVENT_MAX_DATES,
  EVENT_MAX_SLOTS_PER_DATE,
  EVENT_MAX_TIERS_PER_DATE,
  EVENT_POLICY_MAX_LENGTH,
  EVENT_SLOT_DESCRIPTION_MAX_LENGTH,
  EVENT_TIER_TITLE_MAX_LENGTH,
  EVENT_TITLE_MAX_LENGTH,
} from '@/lib/eventConstants';
import type { DayPeriod, IEventDate, IEventSlot, IEventTier } from '@/models/Event';

export {
  EVENT_BANNER_MAX_BYTES,
  EVENT_BANNER_MIME,
  EVENT_CATEGORIES,
  EVENT_DESCRIPTION_MAX_LENGTH,
  EVENT_HOUR_OPTIONS,
  EVENT_MAX_DATES,
  EVENT_MAX_SLOTS_PER_DATE,
  EVENT_MAX_TIERS_PER_DATE,
  EVENT_POLICY_MAX_LENGTH,
  EVENT_TIER_TITLE_MAX_LENGTH,
  EVENT_TITLE_MAX_LENGTH,
} from '@/lib/eventConstants';

export type EventStatusInput = 'draft' | 'published';

export interface CleanEventPayload {
  title: string;
  description: string;
  bannerUrl: string;
  category: string;
  eventMode?: 'Online' | 'Physical' | '';
  location?: string;
  dates: IEventDate[];
  refundPolicy: string;
  termsAndConditions: string;
  status: EventStatusInput;
}

export type CleanResult = { value: CleanEventPayload } | { error: string; field?: string };

// ---- primitives ----

/** Strip control characters and null bytes from plain text (policies, titles, etc.). */
export function cleanPlainText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

export function cleanEventDescription(value: unknown, required: boolean): { value: string } | { error: string } {
  if (typeof value !== 'string' || !value.trim()) {
    return required ? { error: 'Event description is required.' } : { value: '' };
  }
  const clean = sanitizeRichText(value);
  if (!clean) return required ? { error: 'Event description is required.' } : { value: '' };
  if (richTextLength(clean) > EVENT_DESCRIPTION_MAX_LENGTH) {
    return { error: `Event description must be ${EVENT_DESCRIPTION_MAX_LENGTH} characters or fewer.` };
  }
  return { value: clean };
}

export function isValidObjectId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id) && mongoose.Types.ObjectId.isValid(id);
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function isHour(value: string) {
  return (EVENT_HOUR_OPTIONS as readonly string[]).includes(value);
}

function isMinute(value: string) {
  return /^\d{2}$/.test(value) && Number(value) >= 0 && Number(value) <= 59;
}

function isPeriod(value: unknown): value is DayPeriod {
  return value === 'AM' || value === 'PM';
}

/** Convert 12h parts to minutes since midnight for ordering checks. */
function toMinutes(hour: string, minute: string, period: DayPeriod): number {
  let h = Number(hour);
  if (period === 'AM') {
    if (h === 12) h = 0;
  } else if (h !== 12) {
    h += 12;
  }
  return h * 60 + Number(minute);
}

function nonNegativeInt(value: unknown, max: number): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    if (value < 0 || value > max) return null;
    return value;
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const n = Number(value);
    if (n > max) return null;
    return n;
  }
  return null;
}

function positiveInt(value: unknown, max: number): number | null {
  const n = nonNegativeInt(value, max);
  return n !== null && n >= 1 ? n : null;
}

// ---- nested ----

function cleanTier(raw: unknown, dateLabel: string): { value: IEventTier[] } | { error: string } {
  if (raw === undefined || raw === null) return { value: [] };
  if (!Array.isArray(raw)) return { error: `Ticket tiers for ${dateLabel} are invalid.` };
  if (raw.length > EVENT_MAX_TIERS_PER_DATE) {
    return { error: `You can add at most ${EVENT_MAX_TIERS_PER_DATE} tiers per date.` };
  }

  const value: IEventTier[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < raw.length; i++) {
    const t = raw[i];
    if (!t || typeof t !== 'object' || Array.isArray(t)) {
      return { error: `Tier ${i + 1} on ${dateLabel} is invalid.` };
    }
    // Ignore prototype pollution / operator keys — only read known fields
    const title = cleanPlainText((t as any).title, EVENT_TIER_TITLE_MAX_LENGTH);
    if (!title) return { error: `Enter a title for tier ${i + 1} on ${dateLabel}.` };
    const key = title.toLowerCase();
    if (seen.has(key)) return { error: `Duplicate tier title "${title}" on ${dateLabel}.` };
    seen.add(key);

    const price = nonNegativeInt((t as any).price, 99_999_999);
    if (price === null) return { error: `Enter a valid price for "${title}" on ${dateLabel}.` };

    const persons = positiveInt((t as any).persons, 99_999);
    if (persons === null) return { error: `"${title}" on ${dateLabel} must allow at least 1 person.` };

    const quantity = nonNegativeInt((t as any).quantity, 999_999);
    if (quantity === null) return { error: `Enter a valid quantity for "${title}" on ${dateLabel}.` };

    value.push({ title, price, persons, quantity });
  }

  return { value };
}

function cleanSlots(raw: unknown, dateLabel: string): { value: IEventSlot[] } | { error: string } {
  if (raw === undefined || raw === null) return { value: [] };
  if (!Array.isArray(raw)) return { error: `Schedule slots for ${dateLabel} are invalid.` };
  if (raw.length > EVENT_MAX_SLOTS_PER_DATE) {
    return { error: `You can add at most ${EVENT_MAX_SLOTS_PER_DATE} slots per date.` };
  }

  const value: IEventSlot[] = [];
  for (let i = 0; i < raw.length; i++) {
    const s = raw[i];
    if (!s || typeof s !== 'object' || Array.isArray(s)) {
      return { error: `Slot ${i + 1} on ${dateLabel} is invalid.` };
    }
    value.push({
      description: cleanPlainText((s as any).description, EVENT_SLOT_DESCRIPTION_MAX_LENGTH),
    });
  }
  return { value };
}

function cleanDates(raw: unknown, strict: boolean): { value: IEventDate[] } | { error: string } {
  if (raw === undefined || raw === null) {
    return strict ? { error: 'Select at least one event date.' } : { value: [] };
  }
  if (!Array.isArray(raw)) return { error: 'Event dates are invalid.' };
  if (raw.length > EVENT_MAX_DATES) {
    return { error: `You can add at most ${EVENT_MAX_DATES} dates.` };
  }
  if (strict && raw.length === 0) return { error: 'Select at least one event date.' };

  const value: IEventDate[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < raw.length; i++) {
    const d = raw[i];
    if (!d || typeof d !== 'object' || Array.isArray(d)) {
      return { error: `Date entry ${i + 1} is invalid.` };
    }

    const date = typeof (d as any).date === 'string' ? (d as any).date.trim() : '';
    if (!isValidISODate(date)) return { error: `Date entry ${i + 1} must be a valid calendar day.` };
    if (seen.has(date)) return { error: `Duplicate date ${date}.` };
    seen.add(date);

    const startHour = typeof (d as any).startHour === 'string' ? (d as any).startHour.trim() : '';
    const startMinute = typeof (d as any).startMinute === 'string' ? (d as any).startMinute.trim() : '';
    const endHour = typeof (d as any).endHour === 'string' ? (d as any).endHour.trim() : '';
    const endMinute = typeof (d as any).endMinute === 'string' ? (d as any).endMinute.trim() : '';
    const startPeriod = isPeriod((d as any).startPeriod) ? (d as any).startPeriod : 'AM';
    const endPeriod = isPeriod((d as any).endPeriod) ? (d as any).endPeriod : 'PM';

    if (strict) {
      if (!isHour(startHour) || !isMinute(startMinute || '00')) {
        return { error: `Set a valid starting time for ${date}.` };
      }
      if (!isHour(endHour) || !isMinute(endMinute || '00')) {
        return { error: `Set a valid ending time for ${date}.` };
      }
      const startMin = toMinutes(startHour, startMinute || '00', startPeriod);
      let endMin = toMinutes(endHour, endMinute || '00', endPeriod);
      // Support overnight events (e.g. 10 PM to 2 AM) where end time rolls over to the next morning
      if (startPeriod === 'PM' && endPeriod === 'AM') {
        endMin += 24 * 60;
      }
      if (startMin >= endMin) {
        return { error: `Ending time must be after starting time on ${date}.` };
      }
    } else {
      if (startHour && !isHour(startHour)) return { error: `Invalid starting hour on ${date}.` };
      if (startMinute && !isMinute(startMinute)) return { error: `Invalid starting minute on ${date}.` };
      if (endHour && !isHour(endHour)) return { error: `Invalid ending hour on ${date}.` };
      if (endMinute && !isMinute(endMinute)) return { error: `Invalid ending minute on ${date}.` };
    }

    const tiers = cleanTier((d as any).tiers, date);
    if ('error' in tiers) return tiers;
    if (strict && tiers.value.length === 0) {
      return { error: `Add at least one ticket tier for ${date}.` };
    }
    if (strict && tiers.value.every((t) => t.quantity < 1)) {
      return { error: `Set a quantity greater than 0 for at least one tier on ${date}.` };
    }

    const slots = cleanSlots((d as any).slots, date);
    if ('error' in slots) return slots;
    // Draft/publish both keep at least one slot row when the UI synced dates
    const slotList = slots.value.length > 0 ? slots.value : [{ description: '' }];

    value.push({
      date,
      startHour: startHour && isHour(startHour) ? startHour : '',
      startMinute: startMinute && isMinute(startMinute) ? startMinute : startHour ? '00' : '',
      startPeriod,
      endHour: endHour && isHour(endHour) ? endHour : '',
      endMinute: endMinute && isMinute(endMinute) ? endMinute : endHour ? '00' : '',
      endPeriod,
      tiers: tiers.value,
      slots: slotList,
    });
  }

  value.sort((a, b) => a.date.localeCompare(b.date));
  return { value };
}

// ---- banner ----

export function validateBannerFile(
  file: { type: string; size: number } | null | undefined,
  required: boolean
): { ok: true } | { error: string } {
  if (!file) {
    return required ? { error: 'Banner image is required.' } : { ok: true };
  }
  if (!(EVENT_BANNER_MIME as readonly string[]).includes(file.type)) {
    return { error: 'Banner must be a JPG, PNG or WebP image.' };
  }
  if (file.size > EVENT_BANNER_MAX_BYTES) {
    return { error: 'Banner must be smaller than 5 MB.' };
  }
  return { ok: true };
}

export function bannerExtension(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

// ---- top-level ----

/**
 * Validate + sanitize a create/update event body.
 * `status: 'published'` requires every public field; `'draft'` allows partial data.
 * Pass `hasBannerUpload: true` when a new banner file is in the same request — the URL is
 * filled in after upload, so the missing `bannerUrl` must not fail validation.
 */
export function cleanEventPayload(
  raw: unknown,
  status: EventStatusInput,
  options: { hasBannerUpload?: boolean } = {}
): CleanResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: 'Invalid event payload.' };
  }
  const body = raw as Record<string, unknown>;
  const strict = status === 'published';

  const title = cleanPlainText(body.title, EVENT_TITLE_MAX_LENGTH);
  if (!title) return { error: 'Event title is required.', field: 'title' };

  const description = cleanEventDescription(body.description, strict);
  if ('error' in description) return { error: description.error, field: 'description' };

  const bannerUrl =
    typeof body.bannerUrl === 'string' ? cleanPlainText(body.bannerUrl, 2048) : '';
  if (bannerUrl && !/^https?:\/\//i.test(bannerUrl)) {
    return { error: 'Banner URL is invalid.', field: 'banner' };
  }
  if (strict && !bannerUrl && !options.hasBannerUpload) {
    return { error: 'Banner image is required.', field: 'banner' };
  }

  const category = cleanPlainText(body.category, 40);
  if (category && !(EVENT_CATEGORIES as readonly string[]).includes(category)) {
    return { error: 'Select a valid category.', field: 'category' };
  }
  if (strict && !category) return { error: 'Category is required.', field: 'category' };

  const rawMode = typeof body.eventMode === 'string' ? body.eventMode.trim() : '';
  const eventMode: 'Online' | 'Physical' | '' = rawMode === 'Online' || rawMode === 'Physical' ? rawMode : '';
  if (strict && !eventMode) {
    return { error: 'Event mode is required.', field: 'eventMode' };
  }

  const location = typeof body.location === 'string' ? cleanPlainText(body.location, 200) : '';
  if (strict && eventMode === 'Physical' && !location) {
    return { error: 'Location is required for physical events.', field: 'location' };
  }

  const dates = cleanDates(body.dates, strict);
  if ('error' in dates) return { error: dates.error, field: 'dates' };

  const refundPolicy = cleanPlainText(body.refundPolicy, EVENT_POLICY_MAX_LENGTH);
  const termsAndConditions = cleanPlainText(body.termsAndConditions, EVENT_POLICY_MAX_LENGTH);
  if (strict && !refundPolicy) {
    return { error: 'Refund policy is required.', field: 'refundPolicy' };
  }
  if (strict && !termsAndConditions) {
    return { error: 'Terms & conditions are required.', field: 'termsAndConditions' };
  }

  return {
    value: {
      title,
      description: description.value,
      bannerUrl,
      category,
      eventMode,
      location,
      dates: dates.value,
      refundPolicy,
      termsAndConditions,
      status,
    },
  };
}

/** Map UI ticketing + slots state into the API `dates` array shape. */
export function buildDatesFromUi(input: {
  dates: string[];
  days: Record<
    string,
    {
      startHour: string;
      startMinute: string;
      startPeriod: DayPeriod;
      endHour: string;
      endMinute: string;
      endPeriod: DayPeriod;
      tiers: { title: string; price: string; persons: string; quantity: string }[];
    }
  >;
  slots: Record<string, { description: string }[]>;
}) {
  return input.dates.map((date) => {
    const day = input.days[date];
    return {
      date,
      startHour: day?.startHour ?? '',
      startMinute: day?.startMinute ?? '',
      startPeriod: day?.startPeriod ?? 'AM',
      endHour: day?.endHour ?? '',
      endMinute: day?.endMinute ?? '',
      endPeriod: day?.endPeriod ?? 'PM',
      tiers: (day?.tiers ?? []).map((t) => ({
        title: t.title,
        price: t.price,
        persons: t.persons,
        quantity: t.quantity,
      })),
      slots: (input.slots[date] ?? []).map((s) => ({ description: s.description })),
    };
  });
}
