/** Pakistan Standard Time helpers. Booking dates and times are always Pakistan time (Asia/Karachi). */
export const PKT = 'Asia/Karachi';

/** Today's date in Pakistan as YYYY-MM-DD, whatever timezone the browser is in. */
export const pktTodayISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: PKT }).format(new Date());

/** Format a YYYY-MM-DD day (stored as noon UTC) without any timezone shift. */
export const formatISODay = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });

/** A local-midnight Date for Pakistan's current calendar day (use for "today" in date pickers). */
export const pktToday = () => {
  const [y, m, d] = pktTodayISO().split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Add whole calendar days to a YYYY-MM-DD string (or Pakistan today). */
export const pktAddDaysISO = (days: number, fromISO: string = pktTodayISO()) => {
  const [y, m, d] = fromISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + Math.max(0, Math.floor(days || 0))));
  return dt.toISOString().slice(0, 10);
};
