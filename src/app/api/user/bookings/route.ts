import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
    try {
        let email: string | undefined;

        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
            email = session.user.email;
        } else {
            const token = request.cookies.get('auth_token')?.value;
            const payload = token ? verifyToken(token) : null;
            email = payload?.email;
        }

        const { searchParams } = new URL(request.url);
        const guestEmail = searchParams.get('guestEmail');

        if (!email && !guestEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        let bookingsQuery = {};

        if (email) {
            const user = await User.findOne({ email });
            if (user) {
                bookingsQuery = { userId: user._id };
            } else if (guestEmail) {
                bookingsQuery = { 'guestDetails.email': guestEmail };
            } else {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
        } else if (guestEmail) {
            bookingsQuery = { 'guestDetails.email': guestEmail };
        }

        // Find all matching bookings
        const bookings = await Booking.find(bookingsQuery)
            .sort({ scheduledDate: -1, createdAt: -1 })
            .populate({
                path: 'sessionTypeId',
                model: SessionType,
                select: 'title duration features'
            })
            .lean();

        // Now populate CreatorProfile info manually
        const enrichedBookings = await Promise.all(
            bookings.map(async (booking: any) => {
                const creatorProfile = await CreatorProfile.findOne({ userId: booking.creatorId });

                const d = new Date(booking.scheduledDate);
                const formattedShortDate = d.toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });

                const bookedOn = new Date(booking.createdAt).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });

                // Determine relative status:
                let displayStatus = booking.status;
                const bookingDateTime = new Date(`${booking.scheduledDate.toISOString().split('T')[0]}T${convertTo24Hour(booking.scheduledTime)}`);
                const now = new Date();

                // TEMPORARY FOR DEVELOPMENT: Treat 'pending' the same as 'confirmed' so they show up
                if (booking.status === 'confirmed' || booking.status === 'pending') {
                    if (bookingDateTime > now) {
                        displayStatus = 'Upcoming';
                    } else {
                        displayStatus = 'Past';
                    }
                } else {
                    displayStatus = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
                }

                return {
                    id: booking._id.toString(),
                    creator: creatorProfile?.displayName || 'Unknown Creator',
                    username: creatorProfile?.username || '',
                    session: booking.sessionTypeId?.title || 'Session',
                    sessionType: booking.sessionTypeId?.title || 'Session',
                    date: `${formattedShortDate} at ${booking.scheduledTime}`,
                    shortDate: formattedShortDate,
                    time: booking.scheduledTime,
                    status: displayStatus,
                    image: creatorProfile?.profilePhoto || '/default-avatar.png',
                    tags: [displayStatus],
                    ref: `RCH-${booking._id.toString().slice(-8).toUpperCase()}`,
                    duration: `${booking.sessionTypeId?.duration || 0} minutes`,
                    price: `PKR ${booking.finalPrice}`,
                    paymentMethod: booking.paymentMethod || 'Guest',
                    transactionId: `${booking._id.toString().slice(0, 8).toUpperCase()}`,
                    bookedOn: bookedOn,
                    originalStatus: booking.status,
                    scheduledDate: booking.scheduledDate,
                };
            })
        );

        return NextResponse.json({ bookings: enrichedBookings });
    } catch (error: any) {
        console.error('GET /api/user/bookings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// helper to safely convert 12h to 24h for comparison
function convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    let hoursInt = parseInt(hours, 10);

    if (hoursInt === 12) {
        hoursInt = 0;
    }

    if (modifier === 'PM') {
        hoursInt = hoursInt + 12;
    }

    let hoursStr = hoursInt.toString().padStart(2, '0');
    return `${hoursStr}:${minutes}:00`;
}
