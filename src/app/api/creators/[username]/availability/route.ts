import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CreatorProfile from '@/models/CreatorProfile';
import CreatorAvailability from '@/models/CreatorAvailability';
import Booking from '@/models/Booking';
import SessionType from '@/models/SessionType';
import CalendarBlock from '@/models/CalendarBlock';
import SlotReservation from '@/models/SlotReservation';
import mongoose from 'mongoose';
import {
    DEFAULT_SLOT_MINUTES,
    blockedInterval,
    format12h,
    generateStarts,
    intervalsOverlap,
    parse12h,
    parse24h,
} from '@/lib/slots';
import { pktAddDaysISO, pktTodayISO } from '@/lib/pkt';

const DAY_NAMES: Record<number, keyof typeof defaultDays> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
};

const defaultDays = {
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
};

/**
 * GET /api/creators/[username]/availability?date=YYYY-MM-DD
 * Returns available time slots for a creator on a given date.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        await connectDB();
        const { username } = await params;
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        const lowerUsername = username.toLowerCase();
        const cleanUsername = lowerUsername.replace(/-/g, '');
        const profile = await CreatorProfile.findOne({
            $or: [
                { username: lowerUsername },
                { username: cleanUsername }
            ]
        }).select('userId').lean() as any;

        if (!profile) {
            return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        const availability = await CreatorAvailability.findOne({ userId: profile.userId }).lean() as any;

        // Return availability schedule structure so frontend can compute slots per date
        if (!availability) {
            // Return default structure - all days enabled 9am-5pm
            return NextResponse.json({
                success: true,
                schedule: {
                    monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                    tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                    wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                    thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                    friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                    saturday: { enabled: false, slots: [] },
                    sunday: { enabled: false, slots: [] },
                },
                timezone: 'Asia/Karachi',
                blockedDates: [],
            });
        }

        // If a specific date was requested, compute the time slots for that day
        if (dateStr) {
            // Parse the date as local date in the creator's timezone
            const timezone = 'Asia/Karachi'; // Reachly runs on Pakistan time only
            
            // Split date string into components
            const [yearStr, monthStr, dayStr] = dateStr.split('-');
            const year = parseInt(yearStr);
            const month = parseInt(monthStr);
            const day = parseInt(dayStr);
            
            // Create a UTC date at noon to avoid timezone shift issues when determining weekday
            const dateUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
            
            // Use Intl API to get the correct weekday in the creator's timezone
            const formatter = new Intl.DateTimeFormat('en-US', { 
                weekday: 'long', 
                timeZone: timezone 
            });
            const weekdayLong = formatter.format(dateUTC).toLowerCase();
            
            // Map long weekday to our day keys
            const weekdayMap: Record<string, keyof typeof availability.schedule> = {
                'sunday': 'sunday',
                'monday': 'monday',
                'tuesday': 'tuesday',
                'wednesday': 'wednesday',
                'thursday': 'thursday',
                'friday': 'friday',
                'saturday': 'saturday'
            };
            const dayKey = weekdayMap[weekdayLong];
            
            const daySchedule = availability.schedule[dayKey];
            const isBlocked = availability.blockedDates.includes(dateStr);

            if (isBlocked || !daySchedule?.enabled) {
                return NextResponse.json({ success: true, slots: [], date: dateStr });
            }

            // Check if the requested date is today (in creator's timezone)
            const now = new Date();
            const nowStr = new Intl.DateTimeFormat('en-CA', { 
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(now); // returns YYYY-MM-DD
            const isToday = nowStr === dateStr;
            
            // Get current time in creator's timezone
            const nowTimeStr = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            }).format(now);
            const [nowH, nowM] = nowTimeStr.split(':').map(Number);
            const curTotalMinutes = nowH * 60 + nowM;

            // The session being booked decides the slot length: duration + buffer apart.
            // Without a session (calendar views etc.) we keep the old 30-minute grid.
            let sessionDuration = DEFAULT_SLOT_MINUTES;
            let sessionBuffer = 0;
            let minAdvanceDays = 0;
            const sessionIdParam = searchParams.get('sessionId');
            if (sessionIdParam && mongoose.isValidObjectId(sessionIdParam)) {
                const st = await SessionType.findOne({ _id: sessionIdParam, userId: profile.userId })
                    .select('duration bufferTime minAdvanceDays')
                    .lean() as any;
                if (st) {
                    sessionDuration = Number(st.duration) > 0 ? Number(st.duration) : DEFAULT_SLOT_MINUTES;
                    sessionBuffer = Number(st.bufferTime) > 0 ? Number(st.bufferTime) : 0;
                    minAdvanceDays = Math.max(0, Math.min(90, Number(st.minAdvanceDays) || 0));
                }
            }

            // Enforce creator's minimum notice: earliest bookable day = today + N days (PKT)
            const earliestBookableDate = pktAddDaysISO(minAdvanceDays, pktTodayISO());
            if (dateStr < earliestBookableDate) {
                return NextResponse.json({
                    success: true,
                    slots: [],
                    date: dateStr,
                    earliestBookableDate,
                    minAdvanceDays,
                    schedule: availability.schedule,
                    timezone: timezone,
                    blockedDates: availability.blockedDates,
                });
            }

            // Candidate start times from each working range (9:00, then +duration+buffer, ...)
            const candidateStarts: number[] = [];
            for (const slot of daySchedule.slots) {
                for (const cur of generateStarts(parse24h(slot.start), parse24h(slot.end), sessionDuration, sessionBuffer)) {
                    // Skip past times for today (with 30 min lead time to avoid immediate bookings)
                    if (!isToday || cur > curTotalMinutes + 30) candidateStarts.push(cur);
                }
            }

            // Build date range for the day (start of day to end of day in UTC)
            const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
            const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

            // Fetch already booked slots for this creator around this date (+/- 1 day to account for PKT timezone shift in DB)
            const searchStart = new Date(dayStart.getTime() - 24 * 60 * 60 * 1000);
            const searchEnd = new Date(dayEnd.getTime() + 24 * 60 * 60 * 1000);

            const existingBookings = await Booking.find({
                creatorId: profile.userId,
                scheduledDate: { $gte: searchStart, $lte: searchEnd },
                status: { $in: ['pending', 'confirmed'] },
            }).select('scheduledDate scheduledTime sessionTypeId').lean();

            // Filter manually: match by extracting the UTC date from the stored noon-UTC timestamp
            const bookingsToday = existingBookings.filter((b: any) => {
                if (!b.scheduledDate || !b.scheduledTime) return false;
                const d = new Date(b.scheduledDate);
                const bYear = d.getUTCFullYear();
                const bMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
                const bDay = String(d.getUTCDate()).padStart(2, '0');
                return `${bYear}-${bMonth}-${bDay}` === dateStr;
            });

            // Each booking blocks its own session's duration + buffer, so look those sessions up
            const bookedSessionIds = [...new Set(bookingsToday.map((b: any) => String(b.sessionTypeId)))];
            const bookedSessions = bookedSessionIds.length
                ? await SessionType.find({ _id: { $in: bookedSessionIds } }).select('duration bufferTime').lean()
                : [];
            const sessionById = new Map<string, any>(bookedSessions.map((s: any) => [String(s._id), s]));

            const blocked = bookingsToday.flatMap((b: any) => {
                const start = parse12h(b.scheduledTime);
                if (start === null) return [];
                const st = sessionById.get(String(b.sessionTypeId));
                const dur = Number(st?.duration) > 0 ? Number(st.duration) : DEFAULT_SLOT_MINUTES;
                const buf = Number(st?.bufferTime) > 0 ? Number(st.bufferTime) : 0;
                return [blockedInterval(start, dur, buf)];
            });

            // Time the creator booked outside Reachly is blocked too
            const outsideBlocks = await CalendarBlock.find({
                creatorId: profile.userId,
                scheduledDate: { $gte: searchStart, $lte: searchEnd },
            }).select('scheduledDate startTime durationMinutes').lean();
            for (const ob of outsideBlocks as any[]) {
                if (new Date(ob.scheduledDate).toISOString().slice(0, 10) !== dateStr) continue;
                const start = parse12h(ob.startTime);
                if (start !== null) blocked.push({ start, end: start + ob.durationMinutes });
            }

            const ownReservationToken = searchParams.get('reservationToken');
            const reservations = await SlotReservation.find({
                creatorId: profile.userId,
                dateKey: dateStr,
                expiresAt: { $gt: new Date() },
                ...(ownReservationToken ? { token: { $ne: ownReservationToken } } : {}),
            }).select('time duration bufferTime').lean();
            const reservedIntervals = reservations.flatMap((reservation: any) => {
                const start = parse12h(reservation.time);
                return start === null
                    ? []
                    : [blockedInterval(start, Number(reservation.duration), Number(reservation.bufferTime) || 0)];
            });

            const nonOccupiedStarts = candidateStarts.filter((start) => {
                const mine = blockedInterval(start, sessionDuration, sessionBuffer);
                return !blocked.some((other) => intervalsOverlap(mine, other));
            });
            const availableSlots = nonOccupiedStarts
                .filter((start) => {
                    const mine = blockedInterval(start, sessionDuration, sessionBuffer);
                    return !reservedIntervals.some((other) => intervalsOverlap(mine, other));
                })
                .map(format12h);
            const lockedSlots = nonOccupiedStarts
                .filter((start) => {
                    const mine = blockedInterval(start, sessionDuration, sessionBuffer);
                    return reservedIntervals.some((other) => intervalsOverlap(mine, other));
                })
                .map(format12h);

            return NextResponse.json({
                success: true,
                slots: availableSlots,
                lockedSlots,
                date: dateStr,
                earliestBookableDate,
                minAdvanceDays,
                schedule: availability.schedule,
                timezone: 'Asia/Karachi',
                blockedDates: availability.blockedDates,
            });
        }

        // Return full schedule
        return NextResponse.json({
            success: true,
            schedule: availability.schedule,
            timezone: 'Asia/Karachi',
            blockedDates: availability.blockedDates,
        });
    } catch (error: any) {
        console.error('Availability fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
