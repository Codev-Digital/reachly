/**
 * Shared booking/session state evaluator for DM chats.
 * CommonJS format so both Next.js TypeScript routes and socket-server.js reuse identical logic.
 */

function parseSessionStartUTC(dateInput, timeStr, timeZone = 'Asia/Karachi') {
  if (!dateInput) return null;
  const validTz = timeZone || 'Asia/Karachi';

  let y;
  let m;
  let d;

  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const parts = dateInput.split('T')[0].split('-').map(Number);
    y = parts[0];
    m = parts[1];
    d = parts[2];
  } else {
    const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return null;

    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: validTz,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).formatToParts(dateObj);
      const getP = (t) => parseInt(parts.find((p) => p.type === t)?.value || '0', 10);
      y = getP('year');
      m = getP('month');
      d = getP('day');
    } catch {
      y = dateObj.getUTCFullYear();
      m = dateObj.getUTCMonth() + 1;
      d = dateObj.getUTCDate();
    }
  }

  const timeClean = String(timeStr || '').split(/to|-/i)[0].trim();
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
      hour12: false,
    });
    const parts = dtf.formatToParts(guessUtc);
    const getPart = (type) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);
    let tzH = getPart('hour');
    if (tzH === 24) tzH = 0;

    const tzDate = new Date(
      Date.UTC(
        getPart('year'),
        getPart('month') - 1,
        getPart('day'),
        tzH,
        getPart('minute'),
        getPart('second')
      )
    );
    const offsetMs = tzDate.getTime() - guessUtc.getTime();
    return new Date(guessUtc.getTime() - offsetMs);
  } catch {
    return new Date(guessUtc.getTime() - 5 * 60 * 60 * 1000);
  }
}

function parseClockMinutes(clockStr) {
  const match = String(clockStr || '').trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

function parseDurationMinutes(booking) {
  const explicitDuration = Number(
    booking?.sessionTypeId?.duration ?? booking?.duration ?? 0
  );
  if (Number.isFinite(explicitDuration) && explicitDuration > 0) {
    return explicitDuration;
  }

  const rangeParts = String(booking?.scheduledTime || '').split(/\s+to\s+|\s*-\s*/i);
  if (rangeParts.length === 2) {
    const startMins = parseClockMinutes(rangeParts[0]);
    const endMins = parseClockMinutes(rangeParts[1]);
    if (startMins !== null && endMins !== null && endMins > startMins) {
      return endMins - startMins;
    }
  }

  return 60;
}

function isBookingCancelled(booking) {
  if (!booking) return false;
  return (
    booking.status === 'cancelled' ||
    booking.paymentStatus === 'refunded' ||
    booking.paymentStatus === 'failed'
  );
}

function isBookingDeadlineCrossed(booking, now = new Date()) {
  if (!booking) return false;
  if (booking.status === 'completed' || booking.meetingEndedAt) {
    return true;
  }

  const nowMs = now.getTime();
  if (booking.meetingEndsAt) {
    const endsMs = new Date(booking.meetingEndsAt).getTime();
    if (Number.isFinite(endsMs)) {
      return nowMs >= endsMs;
    }
  }

  const startUTC = parseSessionStartUTC(
    booking.scheduledDate,
    booking.scheduledTime,
    'Asia/Karachi'
  );
  if (!startUTC) return false;

  const durationMs = parseDurationMinutes(booking) * 60 * 1000;
  return nowMs > startUTC.getTime() + durationMs;
}

function bookingRecencyMs(booking) {
  const sched = booking?.scheduledDate ? new Date(booking.scheduledDate).getTime() : 0;
  const updated = booking?.updatedAt ? new Date(booking.updatedAt).getTime() : 0;
  const created = booking?.createdAt ? new Date(booking.createdAt).getTime() : 0;
  return [
    Number.isFinite(sched) ? sched : 0,
    Number.isFinite(updated) ? updated : 0,
    Number.isFinite(created) ? created : 0,
  ];
}

function compareBookingsDesc(a, b) {
  const [sa, ua, ca] = bookingRecencyMs(a);
  const [sb, ub, cb] = bookingRecencyMs(b);
  if (sb !== sa) return sb - sa;
  if (ub !== ua) return ub - ua;
  return cb - ca;
}

function compareBookingsAsc(a, b) {
  return -compareBookingsDesc(a, b);
}

/**
 * Evaluates a user-creator DM conversation's booking history to determine:
 * - targetBooking: most relevant booking to show in sidebar/header
 * - bookingStatus: 'confirmed' | 'completed' | 'cancelled' | 'pending' | null
 * - hasActiveSession: true when there is at least one non-cancelled upcoming/ongoing confirmed session
 * - isDeadlinePassed: true when no active session exists and the session's meeting deadline has crossed
 * - isCancelled: true when no active session exists and the latest session is cancelled/refunded
 * - canUserSend: false when cancelled or deadline crossed (caller must also enforce conv.isLocked)
 */
function evaluateConversationBookingState(bookings, now = new Date()) {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return {
      targetBooking: null,
      bookingStatus: null,
      hasActiveSession: false,
      isDeadlinePassed: false,
      isCancelled: false,
      canUserSend: true,
    };
  }

  const activeConfirmed = bookings
    .filter(
      (b) =>
        b &&
        b.status === 'confirmed' &&
        !isBookingCancelled(b) &&
        !isBookingDeadlineCrossed(b, now)
    )
    .sort(compareBookingsAsc);

  if (activeConfirmed.length > 0) {
    const target = activeConfirmed[0];
    return {
      targetBooking: target,
      bookingStatus: target.status,
      hasActiveSession: true,
      isDeadlinePassed: false,
      isCancelled: false,
      canUserSend: true,
    };
  }

  const nonPending = bookings
    .filter((b) => b && b.status !== 'pending')
    .sort(compareBookingsDesc);

  if (nonPending.length > 0) {
    const latest = nonPending[0];
    if (isBookingCancelled(latest)) {
      return {
        targetBooking: latest,
        bookingStatus: latest.status || 'cancelled',
        hasActiveSession: false,
        isDeadlinePassed: false,
        isCancelled: true,
        canUserSend: false,
      };
    }

    const expired = nonPending.filter(
      (b) => !isBookingCancelled(b) && isBookingDeadlineCrossed(b, now)
    );
    if (expired.length > 0) {
      return {
        targetBooking: expired[0],
        bookingStatus: expired[0].status,
        hasActiveSession: false,
        isDeadlinePassed: true,
        isCancelled: false,
        canUserSend: false,
      };
    }
  }

  const fallback = [...bookings].sort(compareBookingsDesc)[0];
  const fallbackCancelled = isBookingCancelled(fallback);
  const fallbackExpired = !fallbackCancelled && isBookingDeadlineCrossed(fallback, now);

  return {
    targetBooking: fallback,
    bookingStatus: fallback?.status || null,
    hasActiveSession: false,
    isDeadlinePassed: fallbackExpired,
    isCancelled: fallbackCancelled,
    canUserSend: !fallbackCancelled && !fallbackExpired,
  };
}

module.exports = {
  parseSessionStartUTC,
  parseDurationMinutes,
  isBookingCancelled,
  isBookingDeadlineCrossed,
  evaluateConversationBookingState,
};
