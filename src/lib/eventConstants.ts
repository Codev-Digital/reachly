/** Shared event limits — safe to import from client or server. */

export const EVENT_TITLE_MAX_LENGTH = 80;
export const EVENT_DESCRIPTION_MAX_LENGTH = 5000;
export const EVENT_POLICY_MAX_LENGTH = 2000;
export const EVENT_SLOT_DESCRIPTION_MAX_LENGTH = 300;
export const EVENT_TIER_TITLE_MAX_LENGTH = 40;
export const EVENT_MAX_DATES = 60;
export const EVENT_MAX_TIERS_PER_DATE = 10;
export const EVENT_MAX_SLOTS_PER_DATE = 10;
export const EVENT_BANNER_MAX_BYTES = 5 * 1024 * 1024;
export const EVENT_BANNER_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const EVENT_CATEGORIES = [
  'Workshops',
  'Hackathons',
  'Science Fairs',
  'Conferences',
  'Panel Discussion',
  'Entertainment',
  'Music & Concerts',
  'Networking',
  'Sports & Fitness',
  'Education & Training',
] as const;

/** Hours allowed by the create-event time picker (08→12, then 01→07). */
export const EVENT_HOUR_OPTIONS = [
  '08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07',
] as const;
