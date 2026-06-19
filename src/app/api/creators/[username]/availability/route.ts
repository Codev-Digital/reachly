import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CreatorProfile from '@/models/CreatorProfile';
import CreatorAvailability from '@/models/CreatorAvailability';

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

        const profile = await CreatorProfile.findOne({ username });
        if (!profile) {
            return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
        }

        const availability = await CreatorAvailability.findOne({ userId: profile.userId });

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
            const date = new Date(dateStr);
            const dayKey = DAY_NAMES[date.getDay()];
            const daySchedule = availability.schedule[dayKey];
            const isBlocked = availability.blockedDates.includes(dateStr);

            if (isBlocked || !daySchedule?.enabled) {
                return NextResponse.json({ success: true, slots: [], date: dateStr });
            }

            // Check if the requested date is today (in creator's or system timezone)
            const now = new Date();
            const timezone = availability.timezone || 'Asia/Karachi';
            const nowLocal = new Date(now.toLocaleString('en-US', { timeZone: timezone }));

            const [y, m, d] = dateStr.split('-');
            const isToday = nowLocal.getFullYear() === parseInt(y) &&
                nowLocal.getMonth() + 1 === parseInt(m) &&
                nowLocal.getDate() === parseInt(d);

            const curTotalMinutes = nowLocal.getHours() * 60 + nowLocal.getMinutes();

            // Generate 30-min intervals from each slot range
            const slots: string[] = [];
            for (const slot of daySchedule.slots) {
                const [startH, startM] = slot.start.split(':').map(Number);
                const [endH, endM] = slot.end.split(':').map(Number);
                let cur = startH * 60 + startM;
                const end = endH * 60 + endM;

                while (cur + 30 <= end) {
                    // Only add if it's not a past time for today (with 30 min buffer to avoid immediate bookings)
                    if (!isToday || cur > curTotalMinutes + 30) {
                        const h = Math.floor(cur / 60);
                        const mins = cur % 60;
                        const suffix = h >= 12 ? 'PM' : 'AM';
                        const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                        slots.push(`${String(displayH).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${suffix}`);
                    }
                    cur += 30;
                }
            }

            return NextResponse.json({ success: true, slots, date: dateStr });
        }

        // Return full schedule
        return NextResponse.json({
            success: true,
            schedule: availability.schedule,
            timezone: availability.timezone,
            blockedDates: availability.blockedDates,
        });
    } catch (error: any) {
        console.error('Availability fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
