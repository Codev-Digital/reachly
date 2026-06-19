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

            // Generate 30-min intervals from each slot range
            const slots: string[] = [];
            for (const slot of daySchedule.slots) {
                const [startH, startM] = slot.start.split(':').map(Number);
                const [endH, endM] = slot.end.split(':').map(Number);
                let cur = startH * 60 + startM;
                const end = endH * 60 + endM;
                while (cur + 30 <= end) {
                    const h = Math.floor(cur / 60);
                    const m = cur % 60;
                    const suffix = h >= 12 ? 'PM' : 'AM';
                    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                    slots.push(`${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`);
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
