import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';
import SessionType from '@/models/SessionType';
import Message from '@/models/Message';
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

        // Batch fetch CreatorProfiles in one query to avoid N+1 bottleneck
        const creatorIds = Array.from(new Set(bookings.map((b: any) => b.creatorId?.toString()).filter(Boolean)));
        const creatorProfiles = creatorIds.length > 0 
            ? await CreatorProfile.find({ userId: { $in: creatorIds } }).lean()
            : [];
        const profileMap = new Map(creatorProfiles.map((cp: any) => [cp.userId.toString(), cp]));

        const enrichedBookings = await Promise.all(
            bookings.map(async (booking: any) => {
                const creatorProfile = profileMap.get(booking.creatorId?.toString());
                const lastMsgDoc = await Message.findOne({ bookingId: booking._id })
                    .sort({ createdAt: -1 })
                    .lean();

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
                // Build the booking's datetime in PKT (UTC+5) for accurate comparison
                const [bYear, bMonth, bDay] = booking.scheduledDate.toISOString().split('T')[0].split('-');
                const time24 = convertTo24Hour(booking.scheduledTime);
                // Combine date + time as PKT, then convert to UTC for comparison
                const bookingDateTimePKT = new Date(`${bYear}-${bMonth}-${bDay}T${time24}+05:00`);
                const now = new Date();

                if (booking.status === 'pending') {
                    displayStatus = 'Pending Approval';
                } else if (booking.status === 'confirmed') {
                    if (bookingDateTimePKT > now) {
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
                    image: creatorProfile?.profilePhoto || '/ahad raza mir.png',
                    tags: [displayStatus],
                    ref: `RCH-${booking._id.toString().slice(-8).toUpperCase()}`,
                    duration: `${booking.sessionTypeId?.duration || 0} minutes`,
                    price: `PKR ${booking.finalPrice}`,
                    paymentMethod: booking.paymentMethod || 'Guest',
                    transactionId: `${booking._id.toString().slice(0, 8).toUpperCase()}`,
                    bookedOn: bookedOn,
                    originalStatus: booking.status,
                    scheduledDate: booking.scheduledDate,
                    isRescheduled: booking.isRescheduled || false,
                    isLocked: booking.isLocked !== undefined ? booking.isLocked : !lastMsgDoc,
                    meetingUrl: booking.meetingUrl,
                    bookingRef: booking.bookingRef,
                    lastMessage: lastMsgDoc ? lastMsgDoc.content : "",
                    lastMessageTime: lastMsgDoc ? lastMsgDoc.createdAt : null,
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
