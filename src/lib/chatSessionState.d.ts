export interface ConversationBookingLike {
  _id?: unknown;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | string;
  scheduledDate?: Date | string;
  scheduledTime?: string;
  duration?: number;
  sessionTypeId?: {
    title?: string;
    duration?: number;
  } | unknown;
  meetingEndsAt?: Date | string | null;
  meetingEndedAt?: Date | string | null;
  bookingRef?: string;
  meetingUrl?: string | null;
  finalPrice?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ConversationBookingState<T extends ConversationBookingLike = ConversationBookingLike> {
  targetBooking: T | null;
  bookingStatus: string | null;
  hasActiveSession: boolean;
  isDeadlinePassed: boolean;
  isCancelled: boolean;
  canUserSend: boolean;
}

export function parseSessionStartUTC(
  dateInput: string | Date,
  timeStr?: string,
  timeZone?: string
): Date | null;

export function parseDurationMinutes(booking: ConversationBookingLike): number;

export function isBookingCancelled(booking: ConversationBookingLike | null | undefined): boolean;

export function isBookingDeadlineCrossed(
  booking: ConversationBookingLike | null | undefined,
  now?: Date
): boolean;

export function evaluateConversationBookingState<T extends ConversationBookingLike>(
  bookings: T[],
  now?: Date
): ConversationBookingState<T>;
