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
            // Parse the date as local date in the creator's timezone
            const timezone = availability.timezone || 'Asia/Karachi';
            
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
