export const getRelativeTime = (dateString?: string | Date): string => {
  if (!dateString) return 'Just now';
  
  // Fallback for MongoDB ObjectId (extracts timestamp from first 8 hex chars)
  if (typeof dateString === 'string' && /^[a-fA-F0-9]{24}$/.test(dateString)) {
    const timestamp = parseInt(dateString.substring(0, 8), 16) * 1000;
    dateString = new Date(timestamp);
  }

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.abs(Math.floor((now.getTime() - date.getTime()) / 1000));
  
  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

/**
 * Parses any date input (string YYYY-MM-DD, ISO string, or Date) and scheduled time string
 * against a target timezone (default: Asia/Karachi, UTC+5) into an exact UTC Date instance.
 */
export function getSessionStartUTC(
  dateInput: string | Date,
  timeStr?: string,
  timeZone: string = 'Asia/Karachi'
): Date | null {
  if (!dateInput) return null;

  const validTz = timeZone || 'Asia/Karachi';

  let y: number;
  let m: number;
  let d: number;

  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const parts = dateInput.split('T')[0].split('-').map(Number);
    y = parts[0];
    m = parts[1];
    d = parts[2];
  } else {
    const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(dateObj.getTime())) return null;

    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: validTz,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      }).formatToParts(dateObj);
      const getP = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0', 10);
      y = getP('year');
      m = getP('month');
      d = getP('day');
    } catch {
      y = dateObj.getUTCFullYear();
      m = dateObj.getUTCMonth() + 1;
      d = dateObj.getUTCDate();
    }
  }

  // Parse time e.g. "05:00 PM", "09:30 AM to 10:00 AM", "14:00"
  const timeClean = (timeStr || '').split(/to|-/i)[0].trim();
  const match = timeClean.match(/(\d+):(\d+)\s*(AM|PM)?/i);

  let hours = 23;
  let minutes = 59;
  let seconds = 59;

  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    seconds = 0;
    const ampm = match[3] ? match[3].toUpperCase() : null;
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  }

  const guessUtc = new Date(Date.UTC(y, m - 1, d, hours, minutes, seconds));

  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: validTz,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    const parts = dtf.formatToParts(guessUtc);
    const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
    let tzH = getPart('hour');
    if (tzH === 24) tzH = 0;

    const tzDate = new Date(Date.UTC(
      getPart('year'),
      getPart('month') - 1,
      getPart('day'),
      tzH,
      getPart('minute'),
      getPart('second')
    ));

    const offsetMs = tzDate.getTime() - guessUtc.getTime();
    return new Date(guessUtc.getTime() - offsetMs);
  } catch {
    // Default fallback to Asia/Karachi (UTC+5: 5 * 3600 * 1000)
    const karachiOffsetMs = 5 * 60 * 60 * 1000;
    return new Date(guessUtc.getTime() - karachiOffsetMs);
  }
}

/**
 * Safely parses any date string or Date object to a UTC Date set at noon (12:00:00 UTC)
 * so that it cannot shift calendar days across any timezone (-12 to +12).
 */
export function parseDateToNoonUTC(dateInput: string | Date, timeZone: string = 'Asia/Karachi'): Date {
  let y: number;
  let m: number;
  let d: number;

  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const parts = dateInput.split('T')[0].split('-').map(Number);
    y = parts[0];
    m = parts[1];
    d = parts[2];
  } else {
    const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone || 'Asia/Karachi',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      }).formatToParts(dateObj);
      const getP = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0', 10);
      y = getP('year');
      m = getP('month');
      d = getP('day');
    } catch {
      y = dateObj.getUTCFullYear();
      m = dateObj.getUTCMonth() + 1;
      d = dateObj.getUTCDate();
    }
  }

  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export interface SessionModificationCheck {
  allowed: boolean;
  errorMessage?: string;
  sessionStartUTC?: Date;
  diffMs?: number;
  diffHours?: number;
}

/**
 * Validates whether a booking can be rescheduled or cancelled.
 * Rule:
 * 1. Must be at least 24 hours before session start time.
 * 2. Cannot cancel or reschedule if within 24 hours or if session has already passed.
 */
export function checkSessionModificationWindow(
  scheduledDate: string | Date,
  scheduledTime: string,
  timeZone: string = 'Asia/Karachi',
  action: 'reschedule' | 'cancel' = 'reschedule'
): SessionModificationCheck {
  if (!scheduledDate) {
    return {
      allowed: false,
      errorMessage: 'Missing scheduled date for session.'
    };
  }

  const sessionStartUTC = getSessionStartUTC(scheduledDate, scheduledTime, timeZone);
  if (!sessionStartUTC) {
    return {
      allowed: false,
      errorMessage: 'Invalid scheduled date or time.'
    };
  }

  const nowMs = Date.now();
  const sessionMs = sessionStartUTC.getTime();
  const diffMs = sessionMs - nowMs;
  const diffHours = diffMs / (1000 * 60 * 60);

  const actionVerb = action === 'cancel' ? 'cancelled' : 'rescheduled';

  // If session is in the past
  if (diffMs <= 0) {
    return {
      allowed: false,
      errorMessage: `This session has already passed and cannot be ${actionVerb}.`,
      sessionStartUTC,
      diffMs,
      diffHours
    };
  }

  // If less than 24 hours remaining
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  if (diffMs < TWENTY_FOUR_HOURS_MS) {
    return {
      allowed: false,
      errorMessage: `Sessions can only be ${actionVerb} at least 24 hours before the scheduled start time.`,
      sessionStartUTC,
      diffMs,
      diffHours
    };
  }

  return {
    allowed: true,
    sessionStartUTC,
    diffMs,
    diffHours
  };
}

/**
 * Validates whether a newly requested session date/time is in the future.
 */
export function checkNewSessionTime(
  newDate: string | Date,
  newTime: string,
  timeZone: string = 'Asia/Karachi'
): { allowed: boolean; errorMessage?: string; newStartUTC?: Date } {
  const newStartUTC = getSessionStartUTC(newDate, newTime, timeZone);
  if (!newStartUTC) {
    return {
      allowed: false,
      errorMessage: 'Invalid new session date or time.'
    };
  }

  if (newStartUTC.getTime() <= Date.now()) {
    return {
      allowed: false,
      errorMessage: 'The rescheduled date and time must be in the future.'
    };
  }

  return {
    allowed: true,
    newStartUTC
  };
}

export function isMeetingPassed(
  scheduledDateStr: string | Date,
  scheduledTimeStr: string,
  timeZone: string = 'Asia/Karachi'
): boolean {
  if (!scheduledDateStr) return false;
  
  try {
    const sessionUtc = getSessionStartUTC(scheduledDateStr, scheduledTimeStr, timeZone);
    if (!sessionUtc) return false;
    return Date.now() > sessionUtc.getTime();
  } catch (err) {
    console.error('Error parsing meeting time:', err);
    return false;
  }
}
