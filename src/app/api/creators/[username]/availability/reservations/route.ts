import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import CalendarBlock from '@/models/CalendarBlock';
import CreatorAvailability from '@/models/CreatorAvailability';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import SlotReservation from '@/models/SlotReservation';
import { acquireCreatorDayLock } from '@/lib/slotReservations';
import {
  DEFAULT_SLOT_MINUTES,
  blockedInterval,
  generateStarts,
  intervalsOverlap,
  parse12h,
  parse24h,
} from '@/lib/slots';
import { pktAddDaysISO, pktTodayISO } from '@/lib/pkt';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const RESERVATION_DURATION_MS = 15 * 60 * 1000;

type CreatorRecord = { userId: mongoose.Types.ObjectId };
type SessionRecord = {
  _id: mongoose.Types.ObjectId;
  duration: number;
  bufferTime?: number;
  minAdvanceDays?: number;
};
type AvailabilityRecord = {
  schedule: Partial<Record<(typeof DAY_NAMES)[number], {
    enabled: boolean;
    slots: Array<{ start: string; end: string }>;
  }>>;
  blockedDates: string[];
};
type BookingRecord = {
  scheduledDate: Date;
  scheduledTime: string;
  sessionTypeId: mongoose.Types.ObjectId;
};
type SessionDurationRecord = {
  _id: mongoose.Types.ObjectId;
  duration: number;
  bufferTime?: number;
};
type CalendarBlockRecord = {
  scheduledDate: Date;
  startTime: string;
  durationMinutes: number;
};
type ActiveReservationRecord = {
  time: string;
  duration: number;
  bufferTime: number;
};

const isDateKey = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).toISOString().slice(0, 10) === value;
};

const dateKeyFor = (value: Date) => new Date(value).toISOString().slice(0, 10);

function isDuplicateKey(error: unknown) {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 11000);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  let releaseDayLock: (() => Promise<void>) | null = null;
  try {
    await connectDB();
    const { username } = await params;
    const payload = await request.json();
    const { sessionId, date, time, token } = payload as {
      sessionId?: string;
      date?: string;
      time?: string;
      token?: string;
    };

    if (
      !sessionId ||
      !mongoose.isValidObjectId(sessionId) ||
      !date ||
      !isDateKey(date) ||
      !time ||
      !token ||
      !/^[0-9a-f-]{36}$/i.test(token)
    ) {
      return NextResponse.json({ error: 'Select a valid session, date, and time.' }, { status: 400 });
    }

    const lowerUsername = username.toLowerCase();
    const cleanUsername = lowerUsername.replace(/-/g, '');
    const profile = await CreatorProfile.findOne({
      $or: [{ username: lowerUsername }, { username: cleanUsername }],
    }).select('userId').lean() as CreatorRecord | null;
    if (!profile) return NextResponse.json({ error: 'Creator not found.' }, { status: 404 });

    const sessionType = await SessionType.findOne({
      _id: sessionId,
      userId: profile.userId,
      isActive: { $ne: false },
    }).select('duration bufferTime minAdvanceDays').lean() as SessionRecord | null;
    if (!sessionType) return NextResponse.json({ error: 'Session is no longer available.' }, { status: 404 });

    const [year, month, day] = date.split('-').map(Number);
    const dateUTC = new Date(Date.UTC(year, month - 1, day, 12));
    const weekday = DAY_NAMES[dateUTC.getUTCDay()];
    const availability = await CreatorAvailability.findOne({ userId: profile.userId })
      .lean() as AvailabilityRecord | null;
    const schedule = availability?.schedule?.[weekday];
    const fallbackSlots = [{ start: '09:00', end: '17:00' }];
    const daySchedule = availability
      ? schedule
      : { enabled: !['saturday', 'sunday'].includes(weekday), slots: fallbackSlots };
    if (
      !daySchedule?.enabled ||
      (availability?.blockedDates || []).includes(date)
    ) {
      return NextResponse.json({ error: 'This date is not available.' }, { status: 409 });
    }

    const startMinutes = parse12h(time);
    if (startMinutes === null) return NextResponse.json({ error: 'Invalid time slot.' }, { status: 400 });
    const duration = Number(sessionType.duration) > 0 ? Number(sessionType.duration) : DEFAULT_SLOT_MINUTES;
    const bufferTime = Number(sessionType.bufferTime) > 0 ? Number(sessionType.bufferTime) : 0;
    const candidateStarts = (daySchedule.slots || []).flatMap((slot: { start: string; end: string }) =>
      generateStarts(parse24h(slot.start), parse24h(slot.end), duration, bufferTime)
    );
    if (!candidateStarts.includes(startMinutes)) {
      return NextResponse.json({ error: 'This time slot is no longer available.' }, { status: 409 });
    }

    const minAdvanceDays = Math.max(0, Math.min(90, Number(sessionType.minAdvanceDays) || 0));
    if (date < pktAddDaysISO(minAdvanceDays, pktTodayISO())) {
      return NextResponse.json({ error: 'This date is no longer available.' }, { status: 409 });
    }
    if (date === pktTodayISO()) {
      const currentTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Karachi',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());
      const [hour, minute] = currentTime.split(':').map(Number);
      if (startMinutes <= hour * 60 + minute + 30) {
        return NextResponse.json({ error: 'This time slot is no longer available.' }, { status: 409 });
      }
    }

    releaseDayLock = await acquireCreatorDayLock(String(profile.userId), date);
    if (!releaseDayLock) {
      return NextResponse.json({ error: 'Please retry reserving this slot.' }, { status: 409 });
    }

    const now = new Date();
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);
    const existingBookings = await Booking.find({
      creatorId: profile.userId,
      scheduledDate: {
        $gte: new Date(dayStart.getTime() - 24 * 60 * 60 * 1000),
        $lte: new Date(dayEnd.getTime() + 24 * 60 * 60 * 1000),
      },
      status: { $in: ['pending', 'confirmed'] },
    }).select('scheduledDate scheduledTime sessionTypeId').lean() as BookingRecord[];
    const bookingsToday = existingBookings.filter((booking) => dateKeyFor(booking.scheduledDate) === date);
    const bookedSessionIds = [...new Set(bookingsToday.map((booking) => String(booking.sessionTypeId)))];
    const bookedSessions = bookedSessionIds.length
      ? await SessionType.find({ _id: { $in: bookedSessionIds } })
          .select('duration bufferTime').lean() as SessionDurationRecord[]
      : [];
    const sessionById = new Map(bookedSessions.map((item) => [String(item._id), item]));

    const blocked = bookingsToday.flatMap((booking) => {
      const start = parse12h(booking.scheduledTime);
      const otherSession = sessionById.get(String(booking.sessionTypeId));
      return start === null ? [] : [
        blockedInterval(
          start,
          Number(otherSession?.duration) || DEFAULT_SLOT_MINUTES,
          Number(otherSession?.bufferTime) || 0
        ),
      ];
    });

    const calendarBlocks = await CalendarBlock.find({
      creatorId: profile.userId,
      scheduledDate: { $gte: dayStart, $lte: dayEnd },
    }).select('startTime durationMinutes scheduledDate').lean() as CalendarBlockRecord[];
    for (const block of calendarBlocks) {
      if (dateKeyFor(block.scheduledDate) !== date) continue;
      const start = parse12h(block.startTime);
      if (start !== null) blocked.push({ start, end: start + Number(block.durationMinutes) });
    }

    const reservations = await SlotReservation.find({
      creatorId: profile.userId,
      dateKey: date,
      token: { $ne: token },
      expiresAt: { $gt: now },
    }).select('time duration bufferTime').lean() as ActiveReservationRecord[];
    for (const reservation of reservations) {
      const start = parse12h(reservation.time);
      if (start !== null) {
        blocked.push(blockedInterval(start, reservation.duration, reservation.bufferTime));
      }
    }

    const requestedInterval = blockedInterval(startMinutes, duration, bufferTime);
    if (blocked.some((interval) => intervalsOverlap(requestedInterval, interval))) {
      return NextResponse.json(
        { error: 'This slot is reserved or occupied. Please choose another time.' },
        { status: 409 }
      );
    }

    const existingReservation = await SlotReservation.findOne({
      creatorId: profile.userId,
      dateKey: date,
      time,
      token,
      status: 'reserved',
      expiresAt: { $gt: now },
    }).select('expiresAt').lean();
    if (existingReservation) {
      return NextResponse.json({ success: true, expiresAt: existingReservation.expiresAt });
    }

    const expiresAt = new Date(now.getTime() + RESERVATION_DURATION_MS);
    const reservation = await SlotReservation.findOneAndUpdate(
      {
        creatorId: profile.userId,
        dateKey: date,
        time,
        $or: [{ expiresAt: { $lte: now } }, { token }],
      },
      {
        $set: {
          sessionTypeId: sessionType._id,
          token,
          duration,
          bufferTime,
          expiresAt,
          status: 'reserved',
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, expiresAt: reservation.expiresAt });
  } catch (error) {
    if (isDuplicateKey(error)) {
      return NextResponse.json(
        { error: 'This slot is reserved or occupied. Please choose another time.' },
        { status: 409 }
      );
    }
    console.error('Slot reservation error:', error);
    return NextResponse.json({ error: 'Unable to reserve this slot.' }, { status: 500 });
  } finally {
    await releaseDayLock?.();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await connectDB();
    const { username } = await params;
    const { token } = await request.json() as { token?: string };
    if (!token) return NextResponse.json({ error: 'Reservation token is required.' }, { status: 400 });

    const lowerUsername = username.toLowerCase();
    const cleanUsername = lowerUsername.replace(/-/g, '');
    const profile = await CreatorProfile.findOne({
      $or: [{ username: lowerUsername }, { username: cleanUsername }],
    }).select('userId').lean() as CreatorRecord | null;
    if (!profile) return NextResponse.json({ error: 'Creator not found.' }, { status: 404 });

    await SlotReservation.deleteOne({
      creatorId: profile.userId,
      token,
      status: 'reserved',
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Slot reservation release error:', error);
    return NextResponse.json({ error: 'Unable to release this slot.' }, { status: 500 });
  }
}
